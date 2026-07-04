import React, { useState } from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FileText, Mail, Send, Clock, History, Settings,
  LogOut, Sun, Moon, ChevronLeft, ChevronRight,
  Sparkles, Upload
} from 'lucide-react';

const NAV = [
  { path: '/resumes', icon: Upload, label: 'Resumes' },
  { path: '/templates', icon: FileText, label: 'Templates' },
  { path: '/compose', icon: Send, label: 'Compose' },
  { path: '/scheduled', icon: Clock, label: 'Scheduled' },
  { path: '/history', icon: History, label: 'Sent History' },
];

export function ProtectedLayout() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"/></div>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

function Sidebar() {
  const { user, logout, theme, toggleTheme } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`flex flex-col border-r transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}
           style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Mail size={15} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>Resume Mailer</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Job Search Tool</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {NAV.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link key={path} to={path} title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active ? 'bg-brand-600 text-white' : 'hover:bg-[var(--hover)]'
              }`}
              style={{ color: active ? '#fff' : 'var(--muted)' }}>
              <Icon size={16} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t py-3 px-2 space-y-0.5" style={{ borderColor: 'var(--border)' }}>
        <Link to="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            location.pathname === '/settings' ? 'bg-brand-600 text-white' : 'hover:bg-[var(--hover)]'
          }`}
          style={{ color: location.pathname === '/settings' ? '#fff' : 'var(--muted)' }}>
          <Settings size={16} className="flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-[var(--hover)]"
          style={{ color: 'var(--muted)' }}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500"
          style={{ color: 'var(--muted)' }}>
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse */}
      <button onClick={() => setCollapsed(!collapsed)}
        className="absolute left-full top-1/2 -translate-y-1/2 w-5 h-10 flex items-center justify-center rounded-r-lg border border-l-0 hover:bg-[var(--hover)] transition-all z-10"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--muted)' }}>
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
