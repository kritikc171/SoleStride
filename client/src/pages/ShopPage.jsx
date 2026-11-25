import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';

const categories = ['All', 'Men', 'Women', 'Kids', 'Running', 'Lifestyle'];
export default function ShopPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') || '');
  const [sort, setSort] = useState('');
  const [products, setProducts] = useState([]);
  const [state, setState] = useState({ loading: true, error: '' });
  const category = params.get('category') || 'All';
  useEffect(() => {
    setState({ loading: true, error: '' });
    const query = new URLSearchParams();
    if (category !== 'All') query.set('category', category);
    if (search.trim()) query.set('search', search.trim());
    if (sort) query.set('sort', sort);
    api(`/products?${query}`).then(setProducts).catch((error) => setState({ loading: false, error: error.message })).finally(() => setState((current) => ({ ...current, loading: false })));
  }, [category, search, sort]);
  function chooseCategory(value) {
    const next = new URLSearchParams(params);
    value === 'All' ? next.delete('category') : next.set('category', value);
    setParams(next);
  }
  return <main className="container section">
    <div className="section-heading"><div><div className="eyebrow muted">SoleStride collection</div><h1 className="display-title" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)', margin: '12px 0 0' }}>Shop all</h1></div><div className="shop-tools"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search shoes" aria-label="Search shoes" /><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products"><option value="">Sort by</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option></select></div></div>
    <div className="filters">{categories.map((item) => <button className={`filter-pill ${item === category ? 'active' : ''}`} onClick={() => chooseCategory(item)} key={item}>{item}</button>)}</div>
    {state.error ? <div className="notice">{state.error}</div> : state.loading ? <div className="loading">Finding your next favorite…</div> : products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product._id} product={product} />)}</div> : <div className="empty-state">No shoes found. Try another search or category.</div>}
  </main>;
}
