import React, { useState, useEffect, useRef, useCallback } from 'react';
import { resumesApi } from '../api';
import { ConfirmDialog, EmptyState, Modal } from '../components/common';
import {
  Upload, FileText, Star, Copy, Trash2, Download, Edit2,
  Check, MoreVertical, Plus
} from 'lucide-react';

export default function ResumesPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [renameModal, setRenameModal] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const fileRef = useRef();

  const load = useCallback(async () => {
    const res = await resumesApi.getAll();
    setResumes(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('name', file.name.replace(/\.[^/.]+$/, ''));
    try {
      const res = await resumesApi.upload(fd);
      setResumes(prev => [res.data, ...prev]);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }, []);

  const handleSetDefault = useCallback(async (id) => {
    await resumesApi.setDefault(id);
    setResumes(prev => prev.map(r => ({ ...r, isDefault: r.id === id })));
    setOpenMenu(null);
  }, []);

  const handleDuplicate = useCallback(async (id) => {
    const res = await resumesApi.duplicate(id);
    setResumes(prev => [...prev, res.data]);
    setOpenMenu(null);
  }, []);

  const handleDelete = useCallback(async (id) => {
    await resumesApi.delete(id);
    setResumes(prev => prev.filter(r => r.id !== id));
  }, []);

  const handleOpenRename = useCallback((resume) => {
    setRenameModal(resume);
  }, []);

  const handleCloseRename = useCallback(() => {
    setRenameModal(null);
  }, []);

  const handleRename = useCallback(async (resume, newName) => {
    if (!resume || !newName.trim()) return;
    const res = await resumesApi.rename(resume.id, newName.trim());
    setResumes(prev => prev.map(r => r.id === res.data.id ? res.data : r));
    setRenameModal(null);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteId(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    handleDelete(deleteId);
    setDeleteId(null);
  }, [deleteId, handleDelete]);

  const formatSize = (bytes) => {
    if (!bytes) return '';
    return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  const CATEGORY_COLORS = {
    GENERAL: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    TECHNICAL: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300',
    MANAGEMENT: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-300',
    FRESHER: 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-300',
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Resumes</h1>
          <p className="text-sm text-[var(--muted)]">{resumes.length} resume{resumes.length !== 1 ? 's' : ''} stored</p>
        </div>
        <div>
          <input
            type="file"
            ref={fileRef}
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn-primary"
          >
            {uploading ? (
              <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
            ) : (
              <><Upload size={14} /> Upload Resume</>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse h-36">
              <div className="h-4 bg-gray-200 dark:bg-dark-border rounded mb-3 w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-dark-border rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resumes yet"
          description="Upload your resumes to attach them to applications and track usage"
          action={<button onClick={() => fileRef.current?.click()} className="btn-primary"><Upload size={14} /> Upload First Resume</button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map(r => (
            <div
              key={r.id}
              className={`card p-5 relative hover:shadow-md transition-all ${r.isDefault ? 'ring-2 ring-brand-500' : ''}`}
            >
              {r.isDefault && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-brand-600 text-white text-xs px-2 py-0.5 rounded-full">
                  <Star size={10} fill="white" /> Default
                </div>
              )}

              <div className="flex items-start gap-3 mb-3 pr-16">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950 flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--text)] truncate">{r.name}</p>
                  <p className="text-xs text-[var(--muted)]">{r.fileName}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-4">
                <span>{formatSize(r.fileSize)}</span>
                {r.category && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[r.category] || CATEGORY_COLORS.GENERAL}`}>
                    {r.category}
                  </span>
                )}
                <span>Used {r.usageCount}x</span>
              </div>

              {/* Actions */}
              <div className="flex gap-1.5">
                <a
                  href={`/api/resumes/${r.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost py-1 px-2 text-xs flex-1 justify-center"
                >
                  <Download size={12} /> Download
                </a>
                <button
                  onClick={() => handleOpenRename(r)}
                  className="btn-ghost py-1 px-2 text-xs"
                  title="Rename"
                >
                  <Edit2 size={12} />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === r.id ? null : r.id)}
                    className="btn-ghost py-1 px-2 text-xs"
                  >
                    <MoreVertical size={12} />
                  </button>
                  {openMenu === r.id && (
                    <div
                      className="absolute right-0 bottom-full mb-1 w-44 card shadow-xl z-10 py-1"
                      style={{ background: 'var(--card)' }}
                    >
                      {!r.isDefault && (
                        <button
                          onClick={() => handleSetDefault(r.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--text)] hover:bg-[var(--hover)]"
                        >
                          <Star size={12} /> Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDuplicate(r.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--text)] hover:bg-[var(--hover)]"
                      >
                        <Copy size={12} /> Duplicate
                      </button>
                      <div className="border-t my-1" style={{ borderColor: 'var(--border)' }} />
                      <button
                        onClick={() => { setDeleteId(r.id); setOpenMenu(null); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Upload CTA card */}
          <button
            onClick={() => fileRef.current?.click()}
            className="card p-5 flex flex-col items-center justify-center gap-3 border-2 border-dashed hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/20 transition-all group cursor-pointer min-h-[140px]"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={18} className="text-brand-600" />
            </div>
            <p className="text-sm text-[var(--muted)] group-hover:text-brand-600 transition-colors">Upload new resume</p>
          </button>
        </div>
      )}

      <RenameResumeModal
        resume={renameModal}
        onClose={handleCloseRename}
        onSave={handleRename}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Resume"
        message="This will permanently delete the resume file. Applications referencing it won't be affected."
      />
    </div>
  );
}

function RenameResumeModal({ resume, onClose, onSave }) {
  const [newName, setNewName] = useState('');

  useEffect(() => {
    setNewName(resume?.name || '');
  }, [resume]);

  const handleNameChange = useCallback((e) => {
    setNewName(e.target.value);
  }, []);

  const handleSave = useCallback(() => {
    onSave(resume, newName);
  }, [newName, onSave, resume]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleSave();
  }, [handleSave]);

  return (
    <Modal isOpen={!!resume} onClose={onClose} title="Rename Resume" size="sm">
      <div className="p-5">
        <label className="label">Resume Name</label>
        <input
          className="input-field mb-4"
          value={newName}
          onChange={handleNameChange}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={handleSave} className="btn-primary"><Check size={14} /> Save Name</button>
        </div>
      </div>
    </Modal>
  );
}
