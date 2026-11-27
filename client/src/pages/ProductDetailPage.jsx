import { useEffect, useRef, useState } from 'react';
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
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const buttonTimer = useRef(null);
  const toastTimer = useRef(null);
  const addLock = useRef(false);
  useEffect(() => {
    api(`/products/${id}`).then((item) => {
      setProduct(item);
      setColor(item.colors?.[0] || '');
      setQuantity(1);
    }).catch((err) => setError(err.message));
  }, [id]);
  useEffect(() => () => {
    clearTimeout(buttonTimer.current);
    clearTimeout(toastTimer.current);
  }, []);
  async function addItem() {
    if (!user) { navigate('/login'); return; }
    if (!size) { setMessage('Choose a size to continue.'); return; }
    if (!color) { setMessage('Choose a color to continue.'); return; }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) { setMessage('Choose a valid quantity.'); return; }
    if (addLock.current) return;
    addLock.current = true;
    clearTimeout(buttonTimer.current);
    clearTimeout(toastTimer.current);
    setAdding(true);
    setAdded(true);
    setShowSuccess(true);
    buttonTimer.current = setTimeout(() => {
      addLock.current = false;
      setAdded(false);
    }, 3000);
    toastTimer.current = setTimeout(() => setShowSuccess(false), 3000);
    setMessage('');
    setError('');
    try {
      await add(product._id, size, color, quantity);
      setAdding(false);
    } catch (err) {
      clearTimeout(buttonTimer.current);
      clearTimeout(toastTimer.current);
      setShowSuccess(false);
      setAdding(false);
      setAdded(false);
      addLock.current = false;
      setError(err.message);
    }
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
      <div className="product-options">
        <label>Color<select value={color} onChange={(event) => setColor(event.target.value)}>{(product.colors || []).map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label>Quantity<input type="number" min="1" max={product.stock} step="1" value={quantity} onChange={(event) => setQuantity(event.target.value === '' ? '' : Number(event.target.value))} /></label>
      </div>
      <p className="muted">{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</p>
      {message && <p className="notice success">{message}</p>}{error && <p className="notice">{error}</p>}
      <button className="button button-dark button-block" disabled={product.stock < 1 || adding || added} onClick={addItem}>{product.stock < 1 ? 'Out of Stock' : added ? 'Added to Bag ✓' : 'Add to Bag'}</button>
      {showSuccess && <p className="bag-toast" role="status" aria-live="polite">Added to Bag Successfully!</p>}
      <p className="muted" style={{ marginTop: 24 }}>Free delivery on qualifying orders. Easy returns within 30 days.</p>
      <Link to="/shop" className="muted">← Continue shopping</Link>
    </section>
  </main>;
}
