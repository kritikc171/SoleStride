import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [authError, setAuthError] = useState('');
  useEffect(() => {
    if (!localStorage.getItem('solestride-token')) { setReady(true); return; }
    api('/auth/me').then(setUser).catch((error) => {
      if (error.status === 401) localStorage.removeItem('solestride-token');
      else setAuthError(error.message);
    }).finally(() => setReady(true));
  }, []);
  async function authenticate(path, values) {
    const result = await api(path, { method: 'POST', body: JSON.stringify(values) });
    localStorage.setItem('solestride-token', result.token);
    setUser(result.user);
    setAuthError('');
    return result.user;
  }
  function logout() {
    localStorage.removeItem('solestride-token');
    setUser(null);
  }
  const value = useMemo(() => ({ user, ready, authError, login: (values) => authenticate('/auth/login', values), register: (values) => authenticate('/auth/register', values), logout }), [user, ready, authError]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
