import { useEffect, useRef } from 'react';
import { X, ArrowUpRight, Inbox, LoaderCircle } from 'lucide-react';
export const formatMoney = (n, currency = 'PKR') => new Intl.NumberFormat('en-PK', { style:'currency', currency, maximumFractionDigits:0 }).format(n || 0);
export const formatDate = value => value ? new Date(`${value.slice(0,10)}T12:00:00Z`).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '—';
export const formatTime = (value, timezone = 'Asia/Karachi') => value ? new Date(value).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:timezone}) : '—';
export const initials = name => name?.split(' ').map(x=>x[0]).slice(0,2).join('') || '?';
export function Avatar({ name, color='sage', small=false }) { return <span className={`avatar ${color} ${small?'small':''}`}>{initials(name)}</span>; }
export function Badge({ children, tone }) { return <span className={`badge ${tone || String(children).toLowerCase().replaceAll(' ','-')}`}>{children}</span>; }
export function Button({ children, variant='primary', className='', busy, ...props }) { return <button {...props} disabled={props.disabled || busy} className={`button ${variant} ${className}`}>{busy && <LoaderCircle size={16} className="spin"/>}{children}</button>; }
export function Empty({ title='Nothing here yet', children, icon:Icon=Inbox }) { return <div className="empty"><span className="empty-icon"><Icon size={25}/></span><h3>{title}</h3><p>{children || 'New records will appear here.'}</p></div>; }
export function ErrorNotice({ children }) { return children ? <div className="error-notice" role="alert">{children}</div> : null; }
export function PageHeading({ eyebrow, title, description, children }) { return <div className="page-heading"><div><div className="eyebrow">{eyebrow || 'YOUR WORKSPACE'}</div><h1>{title}</h1><p>{description}</p></div><div className="heading-actions">{children}</div></div>; }
export function PanelHeading({ title, description, children }) { return <div className="panel-heading"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{children}</div>; }
export function Stat({ label, value, detail, icon:Icon, tone='sage' }) { return <div className="stat-card"><div className="stat-top"><span>{label}</span><span className={`stat-icon ${tone}`}><Icon size={19}/></span></div><strong>{value}</strong><div className="stat-detail"><span className="stat-dot"/>{detail}</div></div>; }
export function Modal({ title, description, children, onClose, wide=false }) {
  const dialog = useRef(null); const closeRef = useRef(onClose); closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement; const overflow = document.body.style.overflow; document.body.style.overflow='hidden';
    const element = dialog.current; const focusables = () => [...element.querySelectorAll('button:not(:disabled),input,select,textarea,a[href]')];
    focusables()[0]?.focus();
    const keydown = e => { if (e.key==='Escape') closeRef.current(); if(e.key==='Tab') { const list=focusables(); const first=list[0]; const last=list.at(-1); if(e.shiftKey && document.activeElement===first) {e.preventDefault();last?.focus();} else if(!e.shiftKey && document.activeElement===last) {e.preventDefault();first?.focus();} } };
    document.addEventListener('keydown',keydown); return () => { document.body.style.overflow=overflow; document.removeEventListener('keydown',keydown); previous?.focus(); };
  },[]);
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><section ref={dialog} className={`modal ${wide?'wide':''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-header"><div><h2 id="modal-title">{title}</h2>{description && <p>{description}</p>}</div><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={20}/></button></div>{children}</section></div>;
}
export function Field({ label, children, ...props }) { return <label className={`field ${props.className || ''}`}><span>{label}</span>{children || <input {...props}/>}</label>; }
export function ViewLink({ children='View all', onClick }) { return <button className="text-button" onClick={onClick}>{children}<ArrowUpRight size={15}/></button>; }
