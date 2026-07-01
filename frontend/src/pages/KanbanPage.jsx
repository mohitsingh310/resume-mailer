import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationsApi } from '../api';
import { StatusBadge } from '../components/common';
import { Plus, ExternalLink, Calendar, Building2 } from 'lucide-react';

const COLUMNS = [
  { key: 'WISHLIST', label: 'Wishlist', color: 'bg-gray-500' },
  { key: 'APPLIED', label: 'Applied', color: 'bg-blue-500' },
  { key: 'HR_RESPONDED', label: 'HR Responded', color: 'bg-purple-500' },
  { key: 'INTERVIEW', label: 'Interview', color: 'bg-yellow-500' },
  { key: 'ASSESSMENT', label: 'Assessment', color: 'bg-orange-500' },
  { key: 'OFFER', label: 'Offer', color: 'bg-green-500' },
  { key: 'REJECTED', label: 'Rejected', color: 'bg-red-500' },
  { key: 'JOINED', label: 'Joined', color: 'bg-emerald-500' },
];

export default function KanbanPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  useEffect(() => {
    applicationsApi.getKanban().then(r => {
      setApplications(r.data);
      setLoading(false);
    });
  }, []);

  const byStatus = (status) => applications.filter(a => a.status === status);

  const handleDragStart = (e, app) => {
    setDragging(app);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    if (!dragging || dragging.status === targetStatus) { setDragging(null); setDragOver(null); return; }
    try {
      await applicationsApi.updateStatus(dragging.id, targetStatus);
      setApplications(prev => prev.map(a => a.id === dragging.id ? { ...a, status: targetStatus } : a));
    } catch (err) {
      console.error(err);
    }
    setDragging(null);
    setDragOver(null);
  };

  const PRIORITY_DOT = { LOW: 'bg-gray-400', MEDIUM: 'bg-yellow-500', HIGH: 'bg-orange-500', URGENT: 'bg-red-500' };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-lg font-bold text-[var(--text)]">Kanban Board</h1>
          <p className="text-xs text-[var(--muted)]">Drag and drop to update status</p>
        </div>
        <Link to="/applications" className="btn-primary">
          <Plus size={14} />
          New Application
        </Link>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-3 p-4 min-w-max h-full">
          {COLUMNS.map(col => {
            const cards = byStatus(col.key);
            const isDragTarget = dragOver === col.key;
            return (
              <div
                key={col.key}
                className={`flex flex-col rounded-xl transition-all duration-150 ${isDragTarget ? 'ring-2 ring-brand-500' : ''}`}
                style={{
                  width: '240px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  minHeight: '500px'
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(col.key); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => handleDrop(e, col.key)}
              >
                {/* Column Header */}
                <div className="flex items-center gap-2 px-3 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className={`w-2 h-2 rounded-full ${col.color}`} />
                  <span className="text-xs font-semibold text-[var(--text)]">{col.label}</span>
                  <span className="ml-auto text-xs font-bold text-[var(--muted)] bg-gray-100 dark:bg-dark-hover px-1.5 py-0.5 rounded-full">
                    {loading ? '...' : cards.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                  {!loading && cards.map(app => (
                    <div
                      key={app.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, app)}
                      className={`card p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-150 group
                        ${dragging?.id === app.id ? 'opacity-50 scale-95' : ''}`}
                      style={{ background: 'var(--card)' }}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${PRIORITY_DOT[app.priority] || 'bg-gray-400'}`} />
                        <Link to={`/applications/${app.id}`} className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[var(--text)] line-clamp-2 group-hover:text-brand-600 transition-colors">
                            {app.jobTitle}
                          </p>
                        </Link>
                        <Link to={`/applications/${app.id}`}>
                          <ExternalLink size={12} className="text-[var(--muted)] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </div>

                      {app.companyName && (
                        <div className="flex items-center gap-1 mb-2">
                          <Building2 size={10} className="text-[var(--muted)]" />
                          <p className="text-xs text-[var(--muted)] truncate">{app.companyName}</p>
                        </div>
                      )}

                      {app.location && (
                        <p className="text-xs text-[var(--muted)] truncate mb-2">📍 {app.location}</p>
                      )}

                      {app.interviewAt && col.key === 'INTERVIEW' && (
                        <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                          <Calendar size={10} />
                          <span>{new Date(app.interviewAt).toLocaleDateString()}</span>
                        </div>
                      )}

                      {(app.salaryMin || app.salaryMax) && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          💰 {app.salaryMin ? `${(app.salaryMin / 100000).toFixed(1)}L` : ''}
                          {app.salaryMin && app.salaryMax ? ' - ' : ''}
                          {app.salaryMax ? `${(app.salaryMax / 100000).toFixed(1)}L` : ''} {app.salaryCurrency}
                        </p>
                      )}

                      {app.resumeMatchScore && (
                        <div className="mt-2 flex items-center gap-1">
                          <div className="flex-1 h-1 bg-gray-100 dark:bg-dark-border rounded-full">
                            <div
                              className={`h-1 rounded-full ${app.resumeMatchScore >= 70 ? 'bg-green-500' : app.resumeMatchScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${app.resumeMatchScore}%` }}
                            />
                          </div>
                          <span className="text-xs text-[var(--muted)]">{app.resumeMatchScore}%</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="space-y-2">
                      {Array(2).fill(0).map((_, i) => (
                        <div key={i} className="card p-3 animate-pulse">
                          <div className="h-3 bg-gray-200 dark:bg-dark-border rounded mb-2 w-3/4" />
                          <div className="h-2 bg-gray-200 dark:bg-dark-border rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Drop zone hint */}
                  {isDragTarget && (
                    <div className="border-2 border-dashed border-brand-400 rounded-lg p-3 text-center text-xs text-brand-500">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
