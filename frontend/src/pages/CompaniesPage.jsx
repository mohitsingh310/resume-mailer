import React, { useState, useEffect, useCallback } from 'react';
import { companiesApi } from '../api';
import { Modal, ConfirmDialog, EmptyState } from '../components/common';
import { useForm } from 'react-hook-form';
import { Plus, Search, Edit, Trash2, Building2, Globe, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await companiesApi.getAll({ query: query || undefined, page, size: 20 });
      setCompanies(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.totalElements);
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => { load(); }, [load]);

  const handleOpenCreate = useCallback(() => {
    setEditing(null);
    setShowForm(true);
  }, []);

  const handleOpenEdit = useCallback((company) => {
    setEditing(company);
    setShowForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditing(null);
  }, []);

  const handleSaved = useCallback((saved) => {
    if (editing) setCompanies(prev => prev.map(c => c.id === saved.id ? saved : c));
    else { setCompanies(prev => [saved, ...prev]); setTotal(t => t + 1); }
    setShowForm(false);
    setEditing(null);
  }, [editing]);

  const handleDelete = useCallback(async (id) => {
    await companiesApi.delete(id);
    setCompanies(prev => prev.filter(c => c.id !== id));
    setTotal(t => t - 1);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteId(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    handleDelete(deleteId);
    setDeleteId(null);
  }, [deleteId, handleDelete]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Companies</h1>
          <p className="text-sm text-[var(--muted)]">{total} companies tracked</p>
        </div>
        <button onClick={handleOpenCreate} className="btn-primary">
          <Plus size={14} /> Add Company
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            className="input-field pl-9"
            placeholder="Search companies..."
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(0); }}
          />
        </div>
        {query && (
          <button onClick={() => { setQuery(''); setPage(0); }} className="btn-ghost">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Company</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Industry</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Location</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Size</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Website</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="border-b animate-pulse" style={{ borderColor: 'var(--border)' }}>
                  {Array(6).fill(0).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3 bg-gray-200 dark:bg-dark-border rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : companies.length === 0 ? (
              <tr><td colSpan={6}>
                <EmptyState
                  icon={Building2}
                  title="No companies yet"
                  description="Add companies you're applying to or interested in"
                  action={<button onClick={handleOpenCreate} className="btn-primary">Add first company</button>}
                />
              </td></tr>
            ) : (
              companies.map(c => (
                <tr key={c.id} className="border-b hover:bg-[var(--hover)] transition-colors" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950 flex items-center justify-center flex-shrink-0">
                        <Building2 size={14} className="text-brand-600" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text)]">{c.name}</p>
                        {c.notes && <p className="text-xs text-[var(--muted)] truncate max-w-[180px]">{c.notes}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{c.industry || '—'}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{c.location || '—'}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{c.size || '—'}</td>
                  <td className="px-4 py-3">
                    {c.website ? (
                      <a href={c.website} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-brand-600 hover:underline text-xs">
                        <Globe size={12} /> Visit
                      </a>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleOpenEdit(c)} className="btn-ghost p-1.5">
                        <Edit size={13} />
                      </button>
                      <button onClick={() => setDeleteId(c.id)} className="btn-ghost p-1.5 hover:text-red-500">
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

      <CompanyFormModal
        isOpen={showForm}
        onClose={handleCloseForm}
        initial={editing}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Company"
        message="Delete this company? Applications linked to it will remain."
      />
    </div>
  );
}

function CompanyFormModal({ isOpen, onClose, initial, onSaved }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) reset(initial);
    else reset({ name: '', industry: '', location: '', size: '', website: '', linkedinUrl: '', glassdoorUrl: '', notes: '' });
  }, [initial, reset]);

  const onSubmit = useCallback(async (data) => {
    setLoading(true);
    try {
      const res = initial ? await companiesApi.update(initial.id, data) : await companiesApi.create(data);
      onSaved(res.data);
    } finally {
      setLoading(false);
    }
  }, [initial, onSaved]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Edit Company' : 'Add Company'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        <div>
          <label className="label">Company Name *</label>
          <input className="input-field" placeholder="HCLTech" {...register('name', { required: 'Required' })} />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Industry</label>
            <input className="input-field" placeholder="IT Services" {...register('industry')} />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input-field" placeholder="Noida, India" {...register('location')} />
          </div>
          <div>
            <label className="label">Company Size</label>
            <select className="input-field" {...register('size')}>
              <option value="">Select size</option>
              {['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'].map(s => <option key={s} value={s}>{s} employees</option>)}
            </select>
          </div>
          <div>
            <label className="label">Website</label>
            <input className="input-field" placeholder="https://hcltech.com" {...register('website')} />
          </div>
          <div>
            <label className="label">LinkedIn URL</label>
            <input className="input-field" placeholder="https://linkedin.com/company/..." {...register('linkedinUrl')} />
          </div>
          <div>
            <label className="label">Glassdoor URL</label>
            <input className="input-field" placeholder="https://glassdoor.com/..." {...register('glassdoorUrl')} />
          </div>
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea className="input-field h-16 resize-none" placeholder="Notes about this company..." {...register('notes')} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : initial ? 'Update Company' : 'Add Company'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
