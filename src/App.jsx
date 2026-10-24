import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import WorkspaceLayout from './layouts/WorkspaceLayout';
import Auth from './pages/Auth';
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
import People from './pages/hr/People';
import Attendance from './pages/employee/Attendance';
import Leaves from './pages/hr/Leaves';
import Payroll from './pages/admin/Payroll';
import Departments from './pages/admin/Departments';
import Announcements from './pages/Announcements';
import Reports from './pages/Reports';
import Settings from './pages/admin/Settings';
import Notifications from './pages/Notifications';
import Account from './pages/Account';
import { Button, ErrorNotice } from './components/ui';
function Gate({ roles, children }) { const {user}=useAuth(); return roles.includes(user.role)?children:<Navigate to="/" replace/>; }
function Application(){
  const {user,loading,error,retry}=useAuth();
  if(loading)return <div className="loading-page full-screen"><span className="loading-orbit"/><h3>A little space for your people.</h3></div>;
  if(error)return <div className="loading-page full-screen"><h2>Let’s reconnect your workspace.</h2><ErrorNotice>{error}</ErrorNotice><Button onClick={retry}>Try again</Button></div>;
  if(!user)return <Auth/>;
  return <WorkspaceProvider><Routes><Route element={<WorkspaceLayout/>}><Route index element={<Dashboard/>}/><Route path="employees" element={<Gate roles={['admin','hr']}><People/></Gate>}/><Route path="attendance" element={<Attendance/>}/><Route path="leaves" element={<Leaves/>}/><Route path="payroll" element={<Gate roles={['admin','employee']}><Payroll/></Gate>}/><Route path="departments" element={<Gate roles={['admin','hr']}><Departments/></Gate>}/><Route path="announcements" element={<Announcements/>}/><Route path="notifications" element={<Notifications/>}/><Route path="account" element={<Account/>}/><Route path="reports" element={<Reports/>}/><Route path="settings" element={<Gate roles={['admin']}><Settings/></Gate>}/><Route path="*" element={<Navigate to="/" replace/>}/></Route></Routes></WorkspaceProvider>;
}
export default function App(){return <AuthProvider><Suspense fallback={<div className="loading-page full-screen"><span className="loading-orbit"/><h3>Preparing your overview…</h3></div>}><Application/></Suspense></AuthProvider>;}
