import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, imageUrl } from '../api/client.js';
import { formatPrice } from '../utils/formatPrice.js';
import { useCart } from '../context/CartContext.jsx';

export default function CartCheckoutPage() {
  const { items, error: cartError, loading, update, remove, refresh } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showRemoved, setShowRemoved] = useState(false);
  const removalTimer = useRef(null);
  const total = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  useEffect(() => () => clearTimeout(removalTimer.current), []);
  async function removeItem(id) {
    try {
      await remove(id);
      clearTimeout(removalTimer.current);
      if (items.length > 1) {
        setShowRemoved(true);
        removalTimer.current = setTimeout(() => setShowRemoved(false), 1000);
      }
    } catch (err) { setError(err.message); }
  }
  async function checkout(event) {
    event.preventDefault(); setError(''); setBusy(true);
    try { await api('/orders', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); await refresh(); navigate('/account/orders'); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  if (loading) return <main className="container section"><div className="loading">Loading your bag…</div></main>;
  if (!items.length) return <main className="container section bag-empty-state"><div>{cartError && <div className="notice">{cartError}</div>}<h1 className="bag-empty-message">Bag is Empty!</h1><p className="muted">When you find something you love, add it here.</p><Link to="/shop" className="button button-dark">Shop shoes</Link></div></main>;
  return <main className="container cart-layout">
    {showRemoved && <p className="bag-toast" role="status" aria-live="polite">Item removed from bag</p>}
    <section><h1 className="display-title" style={{ fontSize: 40 }}>Your bag</h1>{cartError && <div className="notice">{cartError}</div>}{items.map((item) => <article className="cart-row" key={item._id}>
      <img src={imageUrl(item.product?.image)} alt={item.product?.name || 'Shoe'} />
      <div><h3 style={{ margin: '0 0 8px' }}>{item.product?.name || 'Unavailable product'}</h3><div className="muted">{item.product?.category} · Size {item.size} · Color {item.color || 'Black'}</div><p>{formatPrice(item.product?.price)}</p><label className="muted">Quantity <select value={item.quantity} onChange={async (event) => { try { await update(item._id, Number(event.target.value)); } catch (err) { setError(err.message); } }}>{Array.from({ length: Math.min(item.product?.stock || 1, 10) }, (_, index) => index + 1).map((quantity) => <option key={quantity}>{quantity}</option>)}</select></label></div>
      <div><strong>{formatPrice((item.product?.price || 0) * item.quantity)}</strong><div><button className="link-button" onClick={() => removeItem(item._id)}>Remove</button></div></div>
    </article>)}</section>
    <aside><div className="summary"><h2>Order summary</h2><div className="summary-line"><span>Subtotal</span><span>{formatPrice(total)}</span></div><div className="summary-line"><span>Delivery</span><span>Calculated at checkout</span></div><div className="summary-line summary-total"><span>Total</span><span>{formatPrice(total)}</span></div></div>
      <form className="form" style={{ marginTop: 28 }} onSubmit={checkout}><h2>Shipping details</h2>{error && <div className="notice">{error}</div>}<label>Full Name<input name="fullName" required /></label><label>Address<input name="address" required /></label><label>City<input name="city" required /></label><label>Phone<input name="phone" type="tel" required /></label><p className="muted">Cash on delivery</p><button className="button button-dark button-block" disabled={busy}>{busy ? 'Placing order…' : 'Place Order'}</button></form>
    </aside>
  </main>;
}
