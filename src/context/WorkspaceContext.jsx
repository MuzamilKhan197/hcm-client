import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, errorMessage } from '../services/api';
import { useAuth } from './AuthContext';
const WorkspaceContext = createContext(null);
export const useWorkspace = () => useContext(WorkspaceContext);
export function WorkspaceProvider({ children }) {
  const { user } = useAuth(); const [data,setData] = useState(null); const [error,setError] = useState(''); const [toast,setToast] = useState('');
  const refresh = useCallback(async () => { try { const response = await api.get('/workspace'); setData(response.data); setError(''); return response.data; } catch(e) { setError(errorMessage(e)); throw e; } }, []);
  useEffect(() => { refresh().catch(() => {}); }, [refresh,user._id]);
  useEffect(() => { if (toast) { const timer = setTimeout(() => setToast(''), 4500); return () => clearTimeout(timer); } }, [toast]);
  async function mutate(method, url, body, message = 'Changes saved') { const result = await api[method](url, body); await refresh(); setToast(message); return result.data; }
  return <WorkspaceContext.Provider value={{ data, error, refresh, mutate, toast, setToast }}>{children}</WorkspaceContext.Provider>;
}
