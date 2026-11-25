import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { const user = await login(Object.fromEntries(new FormData(event.currentTarget))); navigate(user.role === 'admin' ? '/admin' : '/'); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <AuthFrame title="Welcome back"><form className="form" onSubmit={submit}>{error && <div className="notice">{error}</div>}<label>Email address<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label><button className="button button-dark button-block" disabled={busy}>{busy ? 'Signing in…' : 'Sign In'}</button><p className="muted">New to SoleStride? <Link to="/register"><strong>Join us</strong></Link></p></form></AuthFrame>;
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try { await register(values); navigate('/'); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <AuthFrame title="Create your account"><form className="form" onSubmit={submit}>{error && <div className="notice">{error}</div>}<label>Name<input name="name" autoComplete="name" required /></label><label>Email address<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" minLength="8" autoComplete="new-password" required /></label><button className="button button-dark button-block" disabled={busy}>{busy ? 'Creating account…' : 'Join SoleStride'}</button><p className="muted">Already a member? <Link to="/login"><strong>Sign in</strong></Link></p></form></AuthFrame>;
}

function AuthFrame({ title, children }) {
  return <main className="auth-wrap"><section className="auth-card"><Link className="brand" to="/">SOLESTRIDE</Link><h1>{title}</h1>{children}</section></main>;
}
