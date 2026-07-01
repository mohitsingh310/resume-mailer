import React, { useState, useEffect, useRef } from 'react';
import { resumesApi } from '../api';
import { Upload, FileText, Star, Trash2, Download, Copy, Edit2, CheckCircle, Loader2, Plus } from 'lucide-react';

const CATEGORIES = ['GENERIC', 'JAVA_BACKEND', 'SPRING_BOOT', 'SERVICENOW', 'DYNAMICS', 'CTI'];
const CAT_LABELS = { GENERIC: 'Generic', JAVA_BACKEND: 'Java Backend', SPRING_BOOT: 'Spring Boot', SERVICENOW: 'ServiceNow', DYNAMICS: 'Dynamics', CTI: 'CTI' };
const CAT_COLORS = { GENERIC: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', JAVA_BACKEND: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300', SPRING_BOOT: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300', SERVICENOW: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300', DYNAMICS: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300', CTI: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' };

export default function ResumesPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);
  const [uploadForm, setUploadForm] = useState({ name: '', category: 'GENERIC', file: null });
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const r = await resumesApi.list(); setResumes(r.data); }
    finally { setLoading(false); }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') {
      setUploadForm(f => ({ ...f, file, name: file.name.replace('.pdf', '') }));
      setShowUpload(true);
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.name) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', uploadForm.file);
      fd.append('name', uploadForm.name);
      fd.append('category', uploadForm.category);
      const r = await resumesApi.upload(fd);
      setResumes(prev => [r.data, ...prev]);
      setUploadForm({ name: '', category: 'GENERIC', file: null });
      setShowUpload(false);
    } finally { setUploading(false); }
  };

  const handleSetDefault = async (id) => {
    await resumesApi.setDefault(id);
    setResumes(prev => prev.map(r => ({ ...r, isDefault: r.id === id })));
  };

  const handleDownload = async (r) => {
    const res = await resumesApi.download(r.id);
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a'); a.href = url; a.download = r.originalFileName; a.click();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume?')) return;
    await resumesApi.delete(id);
    setResumes(prev => prev.filter(r => r.id !== id));
  };

  const handleRename = async (r) => {
    await resumesApi.update(r.id, { name: editName });
    setResumes(prev => prev.map(x => x.id === r.id ? { ...x, name: editName } : x));
    setEditId(null);
  };

  const fmt = (bytes) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Resumes</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{resumes.length} resume{resumes.length !== 1 ? 's' : ''} uploaded</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="btn-primary">
          <Plus size={15} /> Upload Resume
        </button>
      </div>

      {/* Drop Zone */}
      <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-6 ${dragOver ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/20' : 'hover:border-brand-400'}`}
        style={{ borderColor: dragOver ? undefined : 'var(--border)' }}>
        <Upload size={24} className="mx-auto mb-2 text-brand-500" />
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Drop PDF here or click to upload</p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>PDF only · Max 10MB</p>
        <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
          onChange={e => { const f = e.target.files[0]; if (f) { setUploadForm(p => ({ ...p, file: f, name: f.name.replace('.pdf', '') })); setShowUpload(true); } }} />
      </div>

      {/* Upload Form */}
      {showUpload && (
        <div className="card p-5 mb-6">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>
            {uploadForm.file ? `Uploading: ${uploadForm.file.name}` : 'Upload Resume'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Resume Name</label>
              <input className="input" placeholder="e.g. Java Backend Resume" value={uploadForm.name}
                onChange={e => setUploadForm(p => ({...p, name: e.target.value}))} />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={uploadForm.category} onChange={e => setUploadForm(p => ({...p, category: e.target.value}))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleUpload} disabled={!uploadForm.file || !uploadForm.name || uploading} className="btn-primary">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <button onClick={() => { setShowUpload(false); setUploadForm({ name: '', category: 'GENERIC', file: null }); }} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Resumes List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card p-4 h-20 animate-pulse" style={{ background: 'var(--hover)' }} />)}</div>
      ) : resumes.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={40} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--muted)' }} />
          <p className="font-medium" style={{ color: 'var(--text)' }}>No resumes yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Upload your first resume to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {resumes.map(r => (
            <div key={r.id} className="card p-4 flex items-center gap-4 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950/30 flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                {editId === r.id ? (
                  <div className="flex items-center gap-2">
                    <input className="input py-1 text-sm" value={editName} onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleRename(r); if (e.key === 'Escape') setEditId(null); }} autoFocus />
                    <button onClick={() => handleRename(r)} className="btn-primary py-1 px-2 text-xs">Save</button>
                    <button onClick={() => setEditId(null)} className="btn-ghost text-xs">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>{r.name}</p>
                    {r.isDefault && <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300"><Star size={10} fill="currentColor" /> Default</span>}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`badge text-xs ${CAT_COLORS[r.category]}`}>{CAT_LABELS[r.category]}</span>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>{fmt(r.fileSize || 0)}</span>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>Used {r.usageCount}×</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!r.isDefault && (
                  <button onClick={() => handleSetDefault(r.id)} title="Set as default" className="btn-ghost p-1.5"><Star size={14} /></button>
                )}
                <button onClick={() => { setEditId(r.id); setEditName(r.name); }} title="Rename" className="btn-ghost p-1.5"><Edit2 size={14} /></button>
                <button onClick={() => handleDownload(r)} title="Download" className="btn-ghost p-1.5"><Download size={14} /></button>
                <button onClick={() => resumesApi.duplicate(r.id).then(res => setResumes(p => [res.data, ...p]))} title="Duplicate" className="btn-ghost p-1.5"><Copy size={14} /></button>
                <button onClick={() => handleDelete(r.id)} title="Delete" className="btn-ghost p-1.5 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
