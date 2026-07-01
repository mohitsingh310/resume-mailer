import React, { useState, useEffect } from 'react';
import { campaignApi } from '../api';
import { Search, Trash2, RefreshCw, Send, X, CheckCircle } from 'lucide-react';

export default function HistoryPage() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => { load(); }, [q]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await campaignApi.sentHistory({ q: q || undefined });
      setEmails(r.data.content);
      setTotal(r.data.totalElements);
    } finally { setLoading(false); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete from history?')) return;
    await campaignApi.deleteSent(id);
    setEmails(p => p.filter(e => e.id !== id));
  };

  const fmt = (dt) => dt ? new Date(dt).toLocaleString() : '—';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Sent History</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{total} emails sent</p>
        </div>
        <button onClick={load} className="btn-secondary"><RefreshCw size={14} /> Refresh</button>
      </div>

      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
        <input className="input pl-9" placeholder="Search by email, company, subject..." value={q} onChange={e => setQ(e.target.value)} />
        {q && <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={14} style={{ color: 'var(--muted)' }} /></button>}
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="card h-16 animate-pulse" style={{ background: 'var(--hover)' }} />)}</div>
      ) : emails.length === 0 ? (
        <div className="text-center py-16">
          <Send size={40} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--muted)' }} />
          <p className="font-medium" style={{ color: 'var(--text)' }}>No emails sent yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Your sent emails will appear here</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                {['Recipient', 'Subject', 'Resume', 'Sent At', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {emails.map(e => (
                <tr key={e.id} className="border-b hover:bg-[var(--hover)] transition-colors" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: 'var(--text)' }}>{e.recruiterName || e.recruiterEmail}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{e.recruiterName ? e.recruiterEmail : ''} {e.company ? `· ${e.company}` : ''}</p>
                  </td>
                  <td className="px-4 py-3 max-w-48"><p className="truncate" style={{ color: 'var(--text)' }}>{e.subject}</p></td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{e.resumeName ? `📎 ${e.resumeName}` : '—'}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{fmt(e.sentAt)}</td>
                  <td className="px-4 py-3">
                    <span className="badge bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                      <CheckCircle size={10} /> {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => del(e.id)} className="btn-ghost py-1 px-2 text-xs hover:text-red-500"><Trash2 size={12} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
