import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
export default function AdminRoute() {
  const { user, ready } = useAuth();
  if (!ready) return <div className="loading">Loading your account…</div>;
  return user?.role === 'admin' ? <Outlet /> : <Navigate to="/login" replace />;
}
