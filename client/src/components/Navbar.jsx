import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
export default function Navbar() {
  const { user, logout, authError } = useAuth();
  const { items, pendingQuantity } = useCart();
  const navigate = useNavigate();
  const count = items.reduce((total, item) => total + item.quantity, pendingQuantity);
  function signOut() { logout(); navigate('/'); }
  return <>
    <div className="utility">
      {user ? <>{user.role === 'admin' && <Link to="/admin">Admin Panel</Link>}<span>Hi, {user.name.split(' ')[0]}</span>{user.role !== 'admin' && <Link to="/account/orders">My Orders</Link>}<button className="link-button" onClick={signOut}>Sign Out</button></> : <><Link to="/login">Sign In</Link><Link to="/register">Join Us</Link></>}
    </div>
    <header className="main-nav">
      <Link to="/" className="brand">SOLESTRIDE</Link>
      <nav className="nav-links" aria-label="Main navigation">
        {['All', 'Men', 'Women', 'Kids', 'Running', 'Lifestyle'].map((category) => <NavLink key={category} to={category === 'All' ? '/shop' : `/shop?category=${category}`}>{category}</NavLink>)}
      </nav>
      <div className="nav-actions"><form onSubmit={(event) => { event.preventDefault(); navigate(`/shop?search=${encodeURIComponent(event.currentTarget.search.value)}`); }}><input className="search" name="search" placeholder="Search" aria-label="Search products" /></form><Link className="bag-link" to={user ? '/cart' : '/login'}><svg className="bag-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l1 13H4L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg><span>Bag ({count})</span></Link></div>
    </header>
    {authError && <div className="container notice">{authError}</div>}
  </>;
}
