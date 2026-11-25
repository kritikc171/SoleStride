import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);
export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const refresh = useCallback(async () => {
    if (!user) { setItems([]); setError(''); setLoading(false); return; }
    setLoading(true);
    try { const cart = await api('/cart'); setItems(cart.items || []); setError(''); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [user]);
  useEffect(() => { refresh(); }, [refresh]);
  const value = useMemo(() => ({
    items, error, loading, refresh,
    add: async (productId, size, quantity = 1) => { try { await api('/cart', { method: 'POST', body: JSON.stringify({ productId, size, quantity }) }); await refresh(); } catch (err) { setError(err.message); throw err; } },
    update: async (id, quantity) => { try { await api(`/cart/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) }); await refresh(); } catch (err) { setError(err.message); throw err; } },
    remove: async (id) => { try { await api(`/cart/${id}`, { method: 'DELETE' }); await refresh(); } catch (err) { setError(err.message); throw err; } }
  }), [items, error, loading, refresh]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { return useContext(CartContext); }
