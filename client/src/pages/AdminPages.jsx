import { useEffect, useState } from 'react';
import { api, imageUrl } from '../api/client.js';
import { formatPrice } from '../utils/formatPrice.js';
import AdminSidebar from '../components/AdminSidebar.jsx';

export function AdminLayout({ children }) { return <div className="admin-shell"><AdminSidebar /><main className="admin-content">{children}</main></div>; }

export function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([api('/admin/stats'), api('/admin/activities')])
      .then(([stats, activity]) => { setData(stats); setRecent(activity.items.slice(0, 5)); })
      .catch((err) => setError(err.message));
  }, []);
  return <AdminLayout><h1>Dashboard</h1>{error && <div className="notice">{error}</div>}{!data && !error ? <p className="loading">Loading dashboard…</p> : <div className="kpi-grid">{Object.entries(data || {}).map(([key, value]) => <div className="kpi" key={key}><span className="muted">{key[0].toUpperCase() + key.slice(1)}</span><strong>{value}</strong></div>)}</div>}<h2>Recent activity</h2>{recent.length ? recent.map((item) => <div className="summary-line" key={item._id}><span><strong>{item.action}</strong> · {item.details}<br /><span className="muted">{item.actorName}</span></span><span className="muted">{new Date(item.createdAt).toLocaleDateString()}</span></div>) : !error && <p className="muted">No activity yet.</p>}</AdminLayout>;
}

const blankProduct = { name: '', category: 'Men', price: '', description: '', sizes: 'EU 38, EU 39, EU 40, EU 41, EU 42', stock: 0, isFeatured: false };
export function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(blankProduct);
  const [editing, setEditing] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function load() { try { setProducts(await api('/products')); } catch (err) { setError(err.message); } }
  useEffect(() => { load(); }, []);
  function edit(product) {
    setEditing(product._id);
    setForm({ ...product, sizes: product.sizes.join(', '), isFeatured: product.isFeatured, image: product.image });
    setIsOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function reset() { setEditing(''); setForm(blankProduct); setIsOpen(false); }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const data = new FormData(event.currentTarget);
    data.set('isFeatured', String(data.get('isFeatured') === 'on'));
    if (!data.get('image')?.size) { data.delete('image'); if (form.image) data.set('image', form.image); }
    try { await api(`/products${editing ? `/${editing}` : ''}`, { method: editing ? 'PUT' : 'POST', body: data }); reset(); await load(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function remove(id) {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    try { await api(`/products/${id}`, { method: 'DELETE' }); await load(); }
    catch (err) { setError(err.message); }
  }
  return <AdminLayout><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}><h1>Products</h1><button className="button button-dark" onClick={() => { setError(''); setIsOpen(true); }}>Add product</button></div>{error && <div className="notice">{error}</div>}{isOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) reset(); }}><section className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-form-title"><h2 id="product-form-title">{editing ? 'Edit product' : 'Create product'}</h2><form className="form" onSubmit={submit}>
    <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} name="name" required /></label>
    <label>Category<select name="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{['Men', 'Women', 'Kids', 'Running', 'Lifestyle'].map((item) => <option key={item}>{item}</option>)}</select></label>
    <label>Price (NPR)<input name="price" type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></label>
    <label>Description<textarea name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></label>
    <label>Sizes (comma separated)<input name="sizes" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} required /></label>
    <label>Stock<input name="stock" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required /></label>
    <label>Product image<input name="image" type="file" accept=".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml" required={!editing} /></label>
    <label style={{ display: 'flex', alignItems: 'center' }}><input name="isFeatured" type="checkbox" checked={Boolean(form.isFeatured)} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Featured</label>
    <div style={{ display: 'flex', gap: 10 }}><button className="button button-dark" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Create product'}</button>{editing && <button type="button" className="button button-outline" onClick={reset}>Cancel</button>}</div>
  </form></section></div>}
  <div className="table-wrap"><table><thead><tr><th>Shoe</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th>Actions</th></tr></thead><tbody>{products.map((product) => <tr key={product._id}><td><img src={imageUrl(product.image)} alt="" style={{ width: 54, verticalAlign: 'middle', marginRight: 10 }} />{product.name}</td><td>{product.category}</td><td>{formatPrice(product.price)}</td><td>{product.stock}</td><td>{product.isFeatured ? 'Yes' : '—'}</td><td><button className="link-button" onClick={() => edit(product)}>Edit</button><button className="link-button danger-text" onClick={() => remove(product._id)}>Delete</button></td></tr>)}</tbody></table></div></AdminLayout>;
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  async function load() { try { setOrders(await api('/orders')); } catch (err) { setError(err.message); } }
  useEffect(() => { load(); }, []);
  async function changeStatus(id, status) {
    try { await api(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }); await load(); }
    catch (err) { setError(err.message); }
  }
  return <AdminLayout><h1>Orders</h1>{error && <div className="notice">{error}</div>}<div className="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead><tbody>{orders.map((order) => <tr key={order._id}><td>#{order._id.slice(-8).toUpperCase()}</td><td>{order.user?.name}<br /><span className="muted">{order.user?.email}</span></td><td>{new Date(order.createdAt).toLocaleDateString()}</td><td>{formatPrice(order.totalAmount)}</td><td><select value={order.status} onChange={(e) => changeStatus(order._id, e.target.value)}>{['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => <option key={status}>{status}</option>)}</select></td></tr>)}</tbody></table></div></AdminLayout>;
}

export function AdminActivitiesPage() {
  const [activities, setActivities] = useState({ items: [] });
  const [action, setAction] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  useEffect(() => {
    const query = new URLSearchParams();
    if (action) query.set('action', action);
    if (search) query.set('search', search);
    query.set('page', String(page));
    api(`/admin/activities?${query}`).then(setActivities).catch((err) => setError(err.message));
  }, [action, search, page]);
  return <AdminLayout><h1>Activity feed</h1>{error && <div className="notice">{error}</div>}<div className="shop-tools" style={{ margin: '20px 0' }}><input placeholder="Search name or email" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /><select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}><option value="">All activity</option>{['USER_REGISTERED', 'USER_LOGIN', 'CART_UPDATED', 'ORDER_PLACED', 'ORDER_STATUS_UPDATED', 'PRODUCT_CREATED', 'PRODUCT_UPDATED', 'PRODUCT_DELETED'].map((item) => <option key={item}>{item}</option>)}</select></div><div className="table-wrap"><table><thead><tr><th>Action</th><th>Actor</th><th>Details</th><th>Date</th></tr></thead><tbody>{activities.items.map((item) => <tr key={item._id}><td>{item.action}</td><td>{item.actorName}<br /><span className="muted">{item.actorEmail}</span></td><td>{item.details}</td><td>{new Date(item.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div>{!activities.items.length && !error && <div className="empty-state">No matching activity found.</div>}<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}><button className="button button-outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span className="muted">Page {activities.page || page} of {activities.pages || 1}</span><button className="button button-outline" disabled={page >= (activities.pages || 1)} onClick={() => setPage((value) => value + 1)}>Next</button></div></AdminLayout>;
}

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { api('/admin/users').then(setUsers).catch((err) => setError(err.message)); }, []);
  return <AdminLayout><h1>Users</h1>{error && <div className="notice">{error}</div>}<div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead><tbody>{users.map((user) => <tr key={user._id}><td>{user.name}</td><td>{user.email}</td><td>{user.role}</td><td>{new Date(user.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div></AdminLayout>;
}
