import React from 'react';
import { X, Inbox } from 'lucide-react';

// Modal
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;
  const sizeMap = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={`relative w-full ${sizeMap[size]} card shadow-2xl animate-scale-in max-h-[90vh] flex flex-col`}
        style={{ background: 'var(--card)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold text-[var(--text)]">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

// Status Badge
const STATUS_STYLES = {
  WISHLIST: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  APPLIED: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  HR_RESPONDED: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  INTERVIEW: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  ASSESSMENT: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  OFFER: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  JOINED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
};

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.WISHLIST;
  const labels = {
    WISHLIST: 'Wishlist', APPLIED: 'Applied', HR_RESPONDED: 'HR Responded',
    INTERVIEW: 'Interview', ASSESSMENT: 'Assessment', OFFER: 'Offer',
    REJECTED: 'Rejected', JOINED: 'Joined'
  };
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${style}`}>
      {labels[status] || status}
    </span>
  );
}

// Priority Badge
const PRIORITY_STYLES = {
  LOW: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  URGENT: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
};

export function PriorityBadge({ priority }) {
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.MEDIUM;
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${style}`}>
      {priority}
    </span>
  );
}

// Spinner
export function Spinner({ size = 16 }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

// Empty State
export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-dark-hover flex items-center justify-center mb-4">
        <Icon size={28} className="text-[var(--muted)]" />
      </div>
      <h3 className="font-semibold text-[var(--text)] mb-1">{title}</h3>
      {description && <p className="text-sm text-[var(--muted)] mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

// Card Skeleton
export function SkeletonCard() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-dark-border rounded mb-3 w-3/4" />
      <div className="h-3 bg-gray-200 dark:bg-dark-border rounded mb-2 w-1/2" />
      <div className="h-3 bg-gray-200 dark:bg-dark-border rounded w-2/3" />
    </div>
  );
}

// Confirm Dialog
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', danger = true }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card p-6 max-w-sm w-full shadow-2xl animate-scale-in" style={{ background: 'var(--card)' }}>
        <h3 className="font-semibold text-[var(--text)] mb-2">{title}</h3>
        <p className="text-sm text-[var(--muted)] mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className={danger ? 'btn-danger' : 'btn-primary'}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Toast notification (simple)
export function Toast({ message, type = 'success', onClose }) {
  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-brand-600',
    warning: 'bg-yellow-600',
  };
  return (
    <div className={`fixed bottom-4 right-4 z-50 ${colors[type]} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in`}>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100"><X size={14} /></button>
    </div>
  );
}

// Stats Card
export function StatCard({ label, value, icon: Icon, color = 'brand', trend }) {
  const colors = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
  };
  return (
    <div className="card p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-bold text-[var(--text)]">{value}</p>
          {trend !== undefined && (
            <p className={`text-xs mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
