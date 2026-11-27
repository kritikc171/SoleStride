import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);
export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [pendingQuantity, setPendingQuantity] = useState(0);
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
    items, error, loading, pendingQuantity, refresh,
    add: async (productId, size, color, quantity = 1) => {
      setPendingQuantity((current) => current + quantity);
      try {
        const cart = await api('/cart', { method: 'POST', body: JSON.stringify({ productId, size, color, quantity }) });
        setItems(cart.items || []);
        setError('');
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setPendingQuantity((current) => Math.max(0, current - quantity));
      }
    },
    update: async (id, quantity) => { try { await api(`/cart/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) }); await refresh(); } catch (err) { setError(err.message); throw err; } },
    remove: async (id) => {
      try {
        await api(`/cart/${id}`, { method: 'DELETE' });
      } catch (err) {
        if (err.status !== 404 || err.message !== 'Bag item not found') {
          setError(err.message);
          throw err;
        }
      }
      setItems((current) => current.filter((item) => item._id !== id));
      setError('');
    }
  }), [items, error, loading, pendingQuantity, refresh]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { return useContext(CartContext); }
