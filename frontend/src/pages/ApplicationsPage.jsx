import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { applicationsApi, companiesApi, resumesApi } from '../api';
import { StatusBadge, PriorityBadge, Modal, ConfirmDialog, EmptyState } from '../components/common';
import { useForm } from 'react-hook-form';
import {
  Plus, Search, Filter, Briefcase, ExternalLink,
  Trash2, Edit, ChevronLeft, ChevronRight, Kanban, X
} from 'lucide-react';

const STATUSES = ['WISHLIST','APPLIED','HR_RESPONDED','INTERVIEW','ASSESSMENT','OFFER','REJECTED','JOINED'];

export default function ApplicationsPage() {
  const [params, setParams] = useSearchParams();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(params.get('status') || '');
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [resumes, setResumes] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = { page, size: 20 };
      if (query) p.query = query;
      if (statusFilter) p.status = statusFilter;
      const res = await applicationsApi.getAll(p);
      setApps(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.totalElements);
    } finally {
      setLoading(false);
    }
  }, [page, query, statusFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    companiesApi.getAll({ size: 100 }).then(r => setCompanies(r.data.content));
    resumesApi.getAll().then(r => setResumes(r.data));
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditingApp(null);
    setShowForm(true);
  }, []);

  const handleOpenEdit = useCallback((app) => {
    setEditingApp(app);
    setShowForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditingApp(null);
  }, []);

  const handleSaved = useCallback((saved) => {
    if (editingApp) {
      setApps(prev => prev.map(a => a.id === saved.id ? saved : a));
    } else {
      setApps(prev => [saved, ...prev]);
    }
    setShowForm(false);
    setEditingApp(null);
  }, [editingApp]);

  const handleDelete = useCallback(async (id) => {
    await applicationsApi.delete(id);
    setApps(prev => prev.filter(a => a.id !== id));
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteId(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    handleDelete(deleteId);
  }, [deleteId, handleDelete]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Applications</h1>
          <p className="text-sm text-[var(--muted)]">{total} total</p>
        </div>
        <div className="flex gap-2">
          <Link to="/applications/kanban" className="btn-ghost">
            <Kanban size={14} />
            Kanban
          </Link>
          <button onClick={handleOpenCreate} className="btn-primary">
            <Plus size={14} />
            New Application
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            className="input-field pl-9"
            placeholder="Search by title, company..."
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(0); }}
          />
        </div>
        <select
          className="input-field w-auto"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
        >
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        {(query || statusFilter) && (
          <button onClick={() => { setQuery(''); setStatusFilter(''); setPage(0); }} className="btn-ghost">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Job</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Company</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Match</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Applied</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="border-b animate-pulse" style={{ borderColor: 'var(--border)' }}>
                  {Array(7).fill(0).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3 bg-gray-200 dark:bg-dark-border rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : apps.length === 0 ? (
              <tr><td colSpan={7}>
                <EmptyState
                  icon={Briefcase}
                  title="No applications found"
                  description="Start tracking your job applications"
                  action={<button onClick={handleOpenCreate} className="btn-primary">Add your first application</button>}
                />
              </td></tr>
            ) : (
              apps.map(app => (
                <tr key={app.id} className="border-b hover:bg-[var(--hover)] transition-colors"
                  style={{ borderColor: 'var(--border)' }}>
                  <td className="px-4 py-3">
                    <Link to={`/applications/${app.id}`} className="font-medium text-[var(--text)] hover:text-brand-600 transition-colors">
                      {app.jobTitle}
                    </Link>
                    {app.location && <p className="text-xs text-[var(--muted)]">{app.location}</p>}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{app.companyName || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                  <td className="px-4 py-3"><PriorityBadge priority={app.priority} /></td>
                  <td className="px-4 py-3">
                    {app.resumeMatchScore ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 bg-gray-100 dark:bg-dark-border rounded-full">
                          <div className={`h-1.5 rounded-full ${app.resumeMatchScore >= 70 ? 'bg-green-500' : app.resumeMatchScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${app.resumeMatchScore}%` }} />
                        </div>
                        <span className="text-xs">{app.resumeMatchScore}%</span>
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)] text-xs">
                    {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {app.jobUrl && (
                        <a href={app.jobUrl} target="_blank" rel="noreferrer" className="btn-ghost p-1.5">
                          <ExternalLink size={13} />
                        </a>
                      )}
                      <button onClick={() => handleOpenEdit(app)} className="btn-ghost p-1.5">
                        <Edit size={13} />
                      </button>
                      <button onClick={() => setDeleteId(app.id)} className="btn-ghost p-1.5 hover:text-red-500">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs text-[var(--muted)]">Page {page + 1} of {totalPages}</p>
            <div className="flex gap-1">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn-ghost p-1.5 disabled:opacity-40">
                <ChevronLeft size={14} />
              </button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="btn-ghost p-1.5 disabled:opacity-40">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <ApplicationFormModal
        isOpen={showForm}
        onClose={handleCloseForm}
        initial={editingApp}
        companies={companies}
        resumes={resumes}
        onSaved={handleSaved}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Application"
        message="Are you sure you want to delete this application? This action cannot be undone."
      />
    </div>
  );
}

function ApplicationFormModal({ isOpen, onClose, initial, companies, resumes, onSaved }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      reset({
        jobTitle: initial.jobTitle, companyId: initial.companyId, companyName: initial.companyName,
        location: initial.location, jobUrl: initial.jobUrl, status: initial.status,
        priority: initial.priority, resumeId: initial.resumeId,
        salaryMin: initial.salaryMin, salaryMax: initial.salaryMax,
        notes: initial.notes, jobDescription: initial.jobDescription,
      });
    } else {
      reset({ status: 'WISHLIST', priority: 'MEDIUM', salaryCurrency: 'INR' });
    }
  }, [initial, reset]);

  const onSubmit = useCallback(async (data) => {
    setLoading(true);
    try {
      const payload = { ...data };
      if (data.companyId) payload.companyId = Number(data.companyId);
      if (data.resumeId) payload.resumeId = Number(data.resumeId);
      if (data.salaryMin) payload.salaryMin = Number(data.salaryMin);
      if (data.salaryMax) payload.salaryMax = Number(data.salaryMax);

      const res = initial
        ? await applicationsApi.update(initial.id, payload)
        : await applicationsApi.create(payload);
      onSaved(res.data);
    } finally {
      setLoading(false);
    }
  }, [initial, onSaved]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Edit Application' : 'New Application'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Job Title *</label>
            <input className="input-field" placeholder="Senior Java Developer" {...register('jobTitle', { required: 'Required' })} />
            {errors.jobTitle && <p className="text-red-500 text-xs mt-1">{errors.jobTitle.message}</p>}
          </div>
          <div>
            <label className="label">Company</label>
            <select className="input-field" {...register('companyId')}>
              <option value="">Select or type below</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Or New Company Name</label>
            <input className="input-field" placeholder="Company Name" {...register('companyName')} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input-field" {...register('status')}>
              {['WISHLIST','APPLIED','HR_RESPONDED','INTERVIEW','ASSESSMENT','OFFER','REJECTED','JOINED'].map(s =>
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              )}
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select className="input-field" {...register('priority')}>
              {['LOW','MEDIUM','HIGH','URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input-field" placeholder="Bangalore, IN" {...register('location')} />
          </div>
          <div>
            <label className="label">Job URL</label>
            <input className="input-field" placeholder="https://..." {...register('jobUrl')} />
          </div>
          <div>
            <label className="label">Min Salary (₹)</label>
            <input type="number" className="input-field" placeholder="1200000" {...register('salaryMin')} />
          </div>
          <div>
            <label className="label">Max Salary (₹)</label>
            <input type="number" className="input-field" placeholder="1500000" {...register('salaryMax')} />
          </div>
          <div>
            <label className="label">Resume Used</label>
            <select className="input-field" {...register('resumeId')}>
              <option value="">Select resume</option>
              {resumes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Source</label>
            <select className="input-field" {...register('source')}>
              <option value="">Select source</option>
              {['LINKEDIN','NAUKRI','REFERRAL','COMPANY_WEBSITE','RECRUITER','OTHER'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="label">Job Description</label>
            <textarea className="input-field h-24 resize-none" placeholder="Paste job description..." {...register('jobDescription')} />
          </div>
          <div className="col-span-2">
            <label className="label">Notes</label>
            <textarea className="input-field h-16 resize-none" placeholder="Personal notes..." {...register('notes')} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : initial ? 'Update' : 'Create Application'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
