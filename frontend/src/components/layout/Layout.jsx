import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Briefcase, Building2, Users, FileText,
  Mail, Bot, Settings, LogOut, Sun, Moon, ChevronLeft,
  ChevronRight, Kanban, Bell, Search, Sparkles, Send
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/applications', icon: Briefcase, label: 'Applications' },
  { path: '/applications/kanban', icon: Kanban, label: 'Kanban Board' },
  { path: '/companies', icon: Building2, label: 'Companies' },
  { path: '/recruiters', icon: Users, label: 'Recruiters' },
  { path: '/resumes', icon: FileText, label: 'Resumes' },
  { path: '/templates', icon: Mail, label: 'Email Templates' },
  { path: '/ai', icon: Bot, label: 'AI Assistant' },
  { path: '/campaigns', icon: Send, label: 'Email Campaigns' },
];

export default function Layout({ children }) {
  const { user, logout, theme, toggleTheme } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r transition-all duration-300 ${collapsed ? 'w-[60px]' : 'w-[220px]'}`}
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b" style={{ borderColor: 'var(--border)', minHeight: '60px' }}>
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles size={14} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <div className="font-bold text-sm" style={{ color: 'var(--text)' }}>JobFlow AI</div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>Job Search Assistant</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 mx-2 px-3 py-2 rounded-lg mb-0.5 transition-all duration-150 text-sm font-medium
                  ${active
                    ? 'bg-brand-600 text-white'
                    : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]'
                  }`}
              >
                <Icon size={16} className="flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t py-3" style={{ borderColor: 'var(--border)' }}>
          <Link
            to="/settings"
            className={`flex items-center gap-3 mx-2 px-3 py-2 rounded-lg mb-0.5 transition-all text-sm font-medium
              ${location.pathname === '/settings'
                ? 'bg-brand-600 text-white'
                : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]'
              }`}
          >
            <Settings size={16} className="flex-shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>
          <button
            onClick={toggleTheme}
            title="Toggle theme"
            className="w-full flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-all"
            style={{ width: 'calc(100% - 16px)' }}
          >
            {theme === 'dark' ? <Sun size={16} className="flex-shrink-0" /> : <Moon size={16} className="flex-shrink-0" />}
            {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
            style={{ width: 'calc(100% - 16px)' }}
          >
            <LogOut size={16} className="flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-32 -right-3 w-6 h-6 rounded-full border flex items-center justify-center bg-[var(--surface)] hover:bg-[var(--hover)] transition-all z-10"
          style={{ borderColor: 'var(--border)' }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header
          className="flex items-center justify-between px-6 border-b"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', minHeight: '60px' }}
        >
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <span className="font-semibold text-[var(--text)]">
              {navItems.find(n => n.path === location.pathname)?.label ||
               (location.pathname.includes('/kanban') ? 'Kanban Board' :
                location.pathname.includes('/applications/') ? 'Application Detail' : 'JobFlow AI')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-all"
              style={{ borderColor: 'var(--border)' }}
            >
              <Search size={14} />
              <span>Search...</span>
              <kbd className="text-xs px-1 py-0.5 rounded bg-gray-100 dark:bg-dark-hover">⌘K</kbd>
            </button>

            <Link to="/dashboard" className="relative">
              <Bell size={18} className="text-[var(--muted)] hover:text-[var(--text)]" />
            </Link>

            <Link to="/settings" className="flex items-center gap-2 ml-2">
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
