import axios from 'axios';
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 20000,
});
export const errorMessage = error => error.response?.data?.message || (error.code === 'ECONNABORTED' ? 'The server took too long. Please try again.' : 'Cannot connect to the server. Check that the backend is running.');
export function exportCsv(filename, rows) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const escape = value => { let text = String(value ?? ''); if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`; return `"${text.replaceAll('"','""')}"`; };
  const csv = [keys, ...rows.map(row => keys.map(key => row[key]))].map(row => row.map(escape).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function downloadPayslip(id) {
  const { data } = await api.get(`/payrolls/${id}/pdf`, { responseType: 'blob' });
  const url = URL.createObjectURL(data); const link = document.createElement('a'); link.href = url; link.download = 'payslip.pdf'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
