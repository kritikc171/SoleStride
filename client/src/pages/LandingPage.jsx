import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';

export default function LandingPage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { api('/products?featured=true').then(setProducts).catch((err) => setError(err.message)); }, []);
  return <>
    <section className="hero"><div className="container hero-copy">
      <div className="eyebrow">New season. New energy.</div>
      <h1>Find your<br />next stride.</h1>
      <p>Everyday icons and performance essentials made to move with you.</p>
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}><Link className="button button-light" to="/shop">Shop Now</Link><Link className="button button-outline" to="/shop?category=Running">Explore Running</Link></div>
    </div></section>
    <section className="section container">
      <div className="section-heading"><h2>Featured drops</h2><Link to="/shop">Shop all →</Link></div>
      {error ? <div className="notice">{error}</div> : products.length ? <div className="product-grid">{products.slice(0, 4).map((product) => <ProductCard key={product._id} product={product} />)}</div> : <div className="loading">Loading the latest styles…</div>}
    </section>
    <section className="section container">
      <div className="section-heading"><h2>Shop by category</h2></div>
      <div className="category-grid">{['Men', 'Women', 'Kids'].map((category, index) => <Link className="category-tile" aria-label={`Shop ${category}`} style={{ background: index === 0 ? "linear-gradient(145deg,rgba(0,0,0,.08),rgba(0,0,0,.2)),url('/men-category.png') center/100% 100% no-repeat #26321e" : index === 1 ? "linear-gradient(145deg,rgba(0,0,0,.08),rgba(0,0,0,.2)),url('/women-category.png') center/100% 100% no-repeat #17212f" : "linear-gradient(145deg,rgba(0,0,0,.08),rgba(0,0,0,.2)),url('/kids-category.png') center/100% 100% no-repeat #26321e" }} key={category} to={`/shop?category=${category}`}>{null}</Link>)}</div>
    </section>
    <section className="container spotlight"><div><h2>Built to keep moving.</h2><p className="muted">Performance you can feel. Style that goes everywhere.</p></div><Link className="button button-light" to="/shop?category=Running">Shop Running</Link></section>
  </>;
}
