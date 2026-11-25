import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, imageUrl } from '../api/client.js';
import { formatPrice } from '../utils/formatPrice.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { add } = useCart();
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { api(`/products/${id}`).then(setProduct).catch((err) => setError(err.message)); }, [id]);
  async function addItem() {
    if (!user) { navigate('/login'); return; }
    if (!size) { setMessage('Choose a size to continue.'); return; }
    try { await add(product._id, size); setMessage('Added to your bag.'); setError(''); }
    catch (err) { setError(err.message); setMessage(''); }
  }
  if (error && !product) return <div className="container section notice">{error}</div>;
  if (!product) return <div className="loading">Loading product…</div>;
  return <main className="container product-detail">
    <img className="detail-image" src={imageUrl(product.image)} alt={product.name} />
    <section className="detail-panel">
      <div className="eyebrow">{product.category}</div><h1>{product.name}</h1>
      <div className="price">{formatPrice(product.price)}</div>
      <p className="muted">{product.description}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}><strong>Select size</strong><span className="muted">EU</span></div>
      <div className="size-grid">{product.sizes.map((item) => <button type="button" className={`size-button ${size === item ? 'selected' : ''}`} onClick={() => setSize(item)} key={item}>{item.replace('EU ', '')}</button>)}</div>
      <p className="muted">{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</p>
      {message && <p className="notice success">{message}</p>}{error && <p className="notice">{error}</p>}
      <button className="button button-dark button-block" disabled={product.stock < 1} onClick={addItem}>{product.stock ? 'Add to Bag' : 'Out of Stock'}</button>
      <p className="muted" style={{ marginTop: 24 }}>Free delivery on qualifying orders. Easy returns within 30 days.</p>
      <Link to="/shop" className="muted">← Continue shopping</Link>
    </section>
  </main>;
}
