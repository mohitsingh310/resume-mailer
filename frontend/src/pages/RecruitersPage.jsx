import React, { useState, useEffect, useCallback } from 'react';
import { recruitersApi, companiesApi } from '../api';
import { Modal, ConfirmDialog, EmptyState } from '../components/common';
import { useForm } from 'react-hook-form';
import { Plus, Search, Edit, Trash2, Users, AlertTriangle, ChevronLeft, ChevronRight, X, Linkedin } from 'lucide-react';

export default function RecruitersPage() {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [companies, setCompanies] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await recruitersApi.getAll({ query: query || undefined, page, size: 20 });
      setRecruiters(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.totalElements);
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    companiesApi.getAll({ size: 100 }).then(r => setCompanies(r.data.content));
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditing(null);
    setShowForm(true);
  }, []);

  const handleOpenEdit = useCallback((recruiter) => {
    setEditing(recruiter);
    setShowForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditing(null);
  }, []);

  const handleSaved = useCallback((saved) => {
    if (editing) setRecruiters(prev => prev.map(r => r.id === saved.id ? saved : r));
    else { setRecruiters(prev => [saved, ...prev]); setTotal(t => t + 1); }
    setShowForm(false);
    setEditing(null);
  }, [editing]);

  const handleDelete = useCallback(async (id) => {
    await recruitersApi.delete(id);
    setRecruiters(prev => prev.filter(r => r.id !== id));
    setTotal(t => t - 1);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteId(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    handleDelete(deleteId);
    setDeleteId(null);
  }, [deleteId, handleDelete]);

  const STATUS_BADGE = {
    ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    INACTIVE: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    BLACKLISTED: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Recruiters</h1>
          <p className="text-sm text-[var(--muted)]">{total} contacts tracked</p>
        </div>
        <button onClick={handleOpenCreate} className="btn-primary">
          <Plus size={14} /> Add Recruiter
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            className="input-field pl-9"
            placeholder="Search recruiters..."
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(0); }}
          />
        </div>
        {query && <button onClick={() => { setQuery(''); setPage(0); }} className="btn-ghost"><X size={14} /></button>}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Recruiter</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Company</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <tr key={i} className="border-b animate-pulse" style={{ borderColor: 'var(--border)' }}>
                  {Array(6).fill(0).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-3 bg-gray-200 dark:bg-dark-border rounded" /></td>
                  ))}
                </tr>
              ))
            ) : recruiters.length === 0 ? (
              <tr><td colSpan={6}>
                <EmptyState
                  icon={Users}
                  title="No recruiters yet"
                  description="Track recruiter contacts and interactions"
                  action={<button onClick={handleOpenCreate} className="btn-primary">Add first recruiter</button>}
                />
              </td></tr>
            ) : (
              recruiters.map(r => (
                <tr key={r.id} className="border-b hover:bg-[var(--hover)] transition-colors" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xs font-bold flex-shrink-0">
                        {r.firstName?.charAt(0)}{r.lastName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text)]">{r.fullName || r.firstName}</p>
                        {r.phone && <p className="text-xs text-[var(--muted)]">{r.phone}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{r.companyName || '—'}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{r.role || '—'}</td>
                  <td className="px-4 py-3">
                    {r.email ? (
                      <a href={`mailto:${r.email}`} className="text-brand-600 hover:underline text-xs">{r.email}</a>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {r.currentStatus && (
                      <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[r.currentStatus] || STATUS_BADGE.ACTIVE}`}>
                        {r.currentStatus}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {r.linkedinUrl && (
                        <a href={r.linkedinUrl} target="_blank" rel="noreferrer" className="btn-ghost p-1.5 text-blue-600">
                          <Linkedin size={13} />
                        </a>
                      )}
                      <button onClick={() => handleOpenEdit(r)} className="btn-ghost p-1.5">
                        <Edit size={13} />
                      </button>
                      <button onClick={() => setDeleteId(r.id)} className="btn-ghost p-1.5 hover:text-red-500">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs text-[var(--muted)]">Page {page + 1} of {totalPages}</p>
            <div className="flex gap-1">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn-ghost p-1.5 disabled:opacity-40"><ChevronLeft size={14} /></button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="btn-ghost p-1.5 disabled:opacity-40"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      <RecruiterFormModal
        isOpen={showForm}
        onClose={handleCloseForm}
        initial={editing}
        companies={companies}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Recruiter"
        message="Remove this recruiter from your contacts?"
      />
    </div>
  );
}

function RecruiterFormModal({ isOpen, onClose, initial, companies, onSaved }) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [dupWarning, setDupWarning] = useState(false);
  const email = watch('email');

  useEffect(() => {
    if (initial) reset(initial);
    else reset({ firstName: '', lastName: '', email: '', phone: '', role: '', currentStatus: 'ACTIVE' });
  }, [initial, reset]);

  // Duplicate check on email blur
  const checkDuplicate = useCallback(async () => {
    if (!email || initial) return;
    try {
      const res = await recruitersApi.checkDuplicate(email);
      setDupWarning(res.data.isDuplicate);
    } catch {}
  }, [email, initial]);

  const onSubmit = useCallback(async (data) => {
    setLoading(true);
    try {
      if (data.companyId) data.companyId = Number(data.companyId);
      const res = initial ? await recruitersApi.update(initial.id, data) : await recruitersApi.create(data);
      onSaved(res.data);
    } finally {
      setLoading(false);
    }
  }, [initial, onSaved]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Edit Recruiter' : 'Add Recruiter'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        {dupWarning && (
          <div className="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <AlertTriangle size={14} className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-700 dark:text-yellow-400">
              A recruiter with this email already exists. You can still save this contact.
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">First Name *</label>
            <input className="input-field" placeholder="Priya" {...register('firstName', { required: 'Required' })} />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="label">Last Name</label>
            <input className="input-field" placeholder="Sharma" {...register('lastName')} />
          </div>
          <div className="col-span-2">
            <label className="label">Email</label>
            <input
              type="email"
              className={`input-field ${dupWarning ? 'border-yellow-400 focus:ring-yellow-400' : ''}`}
              placeholder="priya@company.com"
              {...register('email')}
              onBlur={checkDuplicate}
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input-field" placeholder="+91 98765..." {...register('phone')} />
          </div>
          <div>
            <label className="label">Their Role / Title</label>
            <input className="input-field" placeholder="HR Manager, TA Lead..." {...register('role')} />
          </div>
          <div>
            <label className="label">Company</label>
            <select className="input-field" {...register('companyId')}>
              <option value="">Select company</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input-field" {...register('currentStatus')}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="BLACKLISTED">Blacklisted</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="label">LinkedIn URL</label>
            <input className="input-field" placeholder="https://linkedin.com/in/..." {...register('linkedinUrl')} />
          </div>
          <div className="col-span-2">
            <label className="label">Notes</label>
            <textarea className="input-field h-16 resize-none" placeholder="Notes..." {...register('notes')} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : initial ? 'Update' : 'Add Recruiter'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
