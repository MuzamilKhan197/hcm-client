import { useState } from 'react';
import { errorMessage } from '../services/api';
export function useAction() {
  const [busy,setBusy] = useState(false); const [error,setError] = useState('');
  const run = async fn => { if (busy) return; setBusy(true); setError(''); try { return await fn(); } catch(e) { setError(errorMessage(e)); } finally { setBusy(false); } };
  return { busy,error,setError,run };
}
