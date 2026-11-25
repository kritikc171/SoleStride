import { useEffect, useState } from 'react';
import { api, imageUrl } from '../api/client.js';
import { formatPrice } from '../utils/formatPrice.js';

export default function UserOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [state, setState] = useState({ loading: true, error: '' });
  useEffect(() => { api('/orders/my').then(setOrders).catch((error) => setState({ loading: false, error: error.message })).finally(() => setState((current) => ({ ...current, loading: false }))); }, []);
  return <main className="container section"><h1 className="display-title">Your orders</h1>{state.error ? <div className="notice">{state.error}</div> : state.loading ? <div className="loading">Loading orders…</div> : orders.length ? orders.map((order) => <article className="order-card" key={order._id}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}><div><strong>Order #{order._id.slice(-8).toUpperCase()}</strong><div className="muted">{new Date(order.createdAt).toLocaleDateString()}</div></div><span className="status">{order.status}</span></div>
    <p>{order.shippingAddress.fullName} · {order.shippingAddress.address}, {order.shippingAddress.city} · {order.shippingAddress.phone}</p>
    {order.items.map((item, index) => <div key={`${item.product}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBlock: 12 }}><img src={imageUrl(item.image)} alt="" style={{ width: 64, background: '#f5f5f5' }} /><span>{item.name} · EU {item.size.replace('EU ', '')} × {item.quantity}</span></div>)}
    <strong>Total {formatPrice(order.totalAmount)}</strong>
  </article>) : <div className="empty-state">No orders yet. Your next favorite is waiting.</div>}</main>;
}
