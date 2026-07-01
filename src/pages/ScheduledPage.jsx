import React, { useState, useEffect } from 'react';
import { campaignApi } from '../api';
import { Clock, Trash2, RefreshCw, CheckCircle, XCircle, AlertCircle, Send } from 'lucide-react';

const STATUS_STYLES = {
  SCHEDULED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  SENT: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  FAILED: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  SENDING: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};
const STATUS_ICONS = { SCHEDULED: Clock, SENT: CheckCircle, FAILED: XCircle, SENDING: Send, CANCELLED: AlertCircle };

export default function ScheduledPage() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const r = await campaignApi.listScheduled(); setEmails(r.data); }
    finally { setLoading(false); }
  };

  const cancel = async (id) => {
    await campaignApi.updateScheduled(id, { status: 'CANCELLED' });
    setEmails(p => p.map(e => e.id === id ? { ...e, status: 'CANCELLED' } : e));
  };

  const del = async (id) => {
    if (!window.confirm('Delete this scheduled email?')) return;
    await campaignApi.deleteScheduled(id);
    setEmails(p => p.filter(e => e.id !== id));
  };

  const fmt = (dt) => dt ? new Date(dt).toLocaleString() : '—';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Scheduled Emails</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{emails.filter(e => e.status === 'SCHEDULED').length} pending</p>
        </div>
        <button onClick={load} className="btn-secondary"><RefreshCw size={14} /> Refresh</button>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="card h-16 animate-pulse" style={{ background: 'var(--hover)' }} />)}</div>
      ) : emails.length === 0 ? (
        <div className="text-center py-16">
          <Clock size={40} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--muted)' }} />
          <p className="font-medium" style={{ color: 'var(--text)' }}>No scheduled emails</p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Schedule emails from the Compose page</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Recipient</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Subject</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Scheduled At</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {emails.map(e => {
                const Icon = STATUS_ICONS[e.status] || Clock;
                return (
                  <tr key={e.id} className="border-b hover:bg-[var(--hover)] transition-colors" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-3">
                      <p className="font-medium" style={{ color: 'var(--text)' }}>{e.recruiterName || e.recruiterEmail}</p>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>{e.recruiterName ? e.recruiterEmail : ''} {e.company ? `· ${e.company}` : ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="truncate max-w-48" style={{ color: 'var(--text)' }}>{e.subject}</p>
                      {e.resumeName && <p className="text-xs" style={{ color: 'var(--muted)' }}>📎 {e.resumeName}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{fmt(e.scheduledAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_STYLES[e.status]}`}>
                        <Icon size={10} /> {e.status}
                      </span>
                      {e.errorMessage && <p className="text-xs text-red-500 mt-1">{e.errorMessage}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {e.status === 'SCHEDULED' && (
                          <button onClick={() => cancel(e.id)} className="btn-ghost py-1 px-2 text-xs">Cancel</button>
                        )}
                        <button onClick={() => del(e.id)} className="btn-ghost py-1 px-2 text-xs hover:text-red-500"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
