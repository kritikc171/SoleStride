import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ShopPage from './pages/ShopPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import { LoginPage, RegisterPage } from './pages/AuthPages.jsx';
import CartCheckoutPage from './pages/CartCheckoutPage.jsx';
import UserOrdersPage from './pages/UserOrdersPage.jsx';
import { AdminActivitiesPage, AdminDashboardPage, AdminOrdersPage, AdminProductsPage, AdminUsersPage } from './pages/AdminPages.jsx';

function NotFound() {
  return <main className="container section"><h1 className="display-title">Page not found.</h1><p className="muted">That page may have moved. Let's get you back on track.</p><a className="button button-dark" href="/">Back home</a></main>;
}

export default function App() {
  return <BrowserRouter><AuthProvider><CartProvider><Navbar />
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/cart" element={<CartCheckoutPage />} />
        <Route path="/account/orders" element={<UserOrdersPage />} />
      </Route>
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/products" element={<AdminProductsPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/activities" element={<AdminActivitiesPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
    <Footer />
  </CartProvider></AuthProvider></BrowserRouter>;
}
