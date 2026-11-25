import { NavLink } from 'react-router-dom';
export default function AdminSidebar() {
  return <aside className="admin-sidebar">
    <NavLink end to="/admin">Dashboard</NavLink>
    <NavLink to="/admin/products">Products</NavLink>
    <NavLink to="/admin/orders">Orders</NavLink>
    <NavLink to="/admin/activities">Activity Feed</NavLink>
    <NavLink to="/admin/users">Users</NavLink>
  </aside>;
}
