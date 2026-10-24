import { createContext, useContext, useEffect, useState } from 'react';
import { api, errorMessage } from '../services/api';
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [company, setCompany] = useState(null);
  const [status, setStatus] = useState(null); const [loading, setLoading] = useState(true); const [error,setError] = useState('');
  async function load() {
    setLoading(true); setError('');
    try {
      const { data } = await api.get('/auth/status'); setStatus(data);
      try { const response = await api.get('/auth/me'); setUser(response.data.user); setCompany(response.data.company); }
      catch (e) { if (e.response?.status !== 401) throw e; setUser(null); }
    } catch (e) { setError(errorMessage(e)); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const interceptor = api.interceptors.response.use(response => response, error => {
      if (error.response?.status === 401 && error.config?.url !== '/auth/login') setUser(null);
      return Promise.reject(error);
    });
    return () => api.interceptors.response.eject(interceptor);
  }, []);
  async function signIn(endpoint, payload) { const { data } = await api.post(`/auth/${endpoint}`, payload); setUser(data.user); setCompany(data.company); setStatus(s => ({ ...s, initialized: true })); }
  async function updateProfile(payload) { const { data } = await api.patch('/auth/profile', payload); setUser(data.user); return data.user; }
  async function signOut() { await api.post('/auth/logout'); setUser(null); }
  return <AuthContext.Provider value={{ user, company, status, loading, error, retry: load, signIn, signOut, updateProfile, setCompany }}>{children}</AuthContext.Provider>;
}
