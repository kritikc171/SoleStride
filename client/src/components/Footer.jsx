import { Link } from 'react-router-dom';
export default function Footer() {
  return <footer className="footer"><div className="container footer-inner"><Link to="/" className="brand">SOLESTRIDE</Link><span className="muted">Move your way. Built for every stride.</span><span className="muted">© {new Date().getFullYear()} SoleStride</span></div></footer>;
}
