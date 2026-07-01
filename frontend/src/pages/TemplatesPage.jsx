import React, { useState, useEffect } from 'react';
import { templatesApi, resumesApi } from '../api';
import { Plus, Search, Edit, Trash2, Copy, Heart, FileText, X, Eye, Loader2, Paperclip } from 'lucide-react';

// Minimal rich text editor with Bold/Italic/Underline support
function RichEditor({ value, onChange, placeholder, minHeight = '80px' }) {
  const ref = React.useRef(null);
  const isInternalChange = React.useRef(false);

  // Only update DOM from prop when not currently editing
  React.useEffect(() => {
    if (ref.current && !isInternalChange.current) {
      if (ref.current.innerHTML !== value) {
        ref.current.innerHTML = value || '';
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const exec = (cmd) => {
    ref.current.focus();
    document.execCommand(cmd, false, null);
    isInternalChange.current = true;
    onChange({ target: { value: ref.current.innerHTML } });
  };

  const handleInput = () => {
    isInternalChange.current = true;
    onChange({ target: { value: ref.current.innerHTML } });
  };

  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      {/* Toolbar */}
      <div className="flex gap-1 px-2 py-1.5 border-b" style={{ borderColor: 'var(--border)', background: 'var(--hover)' }}>
        {[
          { cmd: 'bold', label: <strong>B</strong> },
          { cmd: 'italic', label: <em>I</em> },
          { cmd: 'underline', label: <span style={{ textDecoration: 'underline' }}>U</span> },
        ].map(({ cmd, label }) => (
          <button key={cmd} type="button"
            onMouseDown={e => { e.preventDefault(); exec(cmd); }}
            className="w-7 h-7 rounded text-sm flex items-center justify-center hover:bg-[var(--border)] transition-colors"
            style={{ color: 'var(--text)' }}
            title={cmd.charAt(0).toUpperCase() + cmd.slice(1)}>
            {label}
          </button>
        ))}
      </div>
      {/* Editable area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        style={{
          minHeight,
          padding: '8px 12px',
          fontSize: '14px',
          color: 'var(--text)',
          background: 'var(--surface)',
          outline: 'none',
          lineHeight: '1.6',
        }}
        className="rich-editor-area"
      />
    </div>
  );
}


const CATS = ['COLD_EMAIL','FOLLOW_UP','COVER_LETTER','THANK_YOU','NETWORKING','OTHER'];
const CAT_COLORS = {
  COLD_EMAIL:'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  FOLLOW_UP:'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  COVER_LETTER:'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  THANK_YOU:'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  NETWORKING:'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  OTHER:'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
};

const DESIGNS = [
  { id: 'java', name: 'Java Backend', color: '#2563eb', gradient: 'linear-gradient(135deg,#1e3a5f,#2563eb)', subtitle: 'Java · Spring Boot · Microservices · REST APIs' },
  { id: 'crm', name: 'CRM Specialist', color: '#059669', gradient: 'linear-gradient(135deg,#064e3b,#059669)', subtitle: 'MS Dynamics 365 · ServiceNow · Salesforce · CTI' },
  { id: 'servicenow', name: 'ServiceNow', color: '#7c3aed', gradient: 'linear-gradient(135deg,#4c1d95,#7c3aed)', subtitle: 'ServiceNow · Business Rules · Flow Designer · GlideRecord' },
  { id: 'minimal', name: 'Minimal Clean', color: '#374151', gradient: null, subtitle: 'Clean and simple design' },
];

function generateHTML(design, fields) {
  const { senderName, roleTitle, subtitle, intro, highlights, closing } = fields;
  const highlightItems = highlights.filter(Boolean);
  const hiName = '{{recruiterName}}';

  if (design.id === 'minimal') {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background:#fff;font-family:'Segoe UI',Arial,sans-serif;"><div style="max-width:600px;margin:0 auto;padding:40px 24px;"><div style="border-bottom:3px solid #2563eb;padding-bottom:16px;margin-bottom:28px;"><p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#2563eb;letter-spacing:1.5px;text-transform:uppercase;">${roleTitle || 'Senior Software Developer'}</p><h2 style="margin:0;font-size:20px;color:#111827;font-weight:700;">${senderName || 'Your Name'}</h2><p style="margin:6px 0 0;color:#6b7280;font-size:13px;">${subtitle || design.subtitle}</p></div><p style="color:#374151;line-height:1.8;margin:0 0 16px;">Dear ${hiName},</p><p style="color:#374151;line-height:1.8;margin:0 0 20px;">${intro || ''}</p>${highlightItems.length ? `<div style="border:1px solid #e5e7eb;border-radius:8px;padding:18px 20px;margin:20px 0;"><p style="margin:0 0 10px;font-weight:600;color:#111827;font-size:14px;">Key Highlights</p><ul style="margin:0;padding-left:18px;color:#374151;font-size:14px;line-height:2;">${highlightItems.map(h => `<li>${h}</li>`).join('')}</ul></div>` : ''}<p style="color:#374151;line-height:1.8;margin:0 0 16px;">${closing || ''}</p><p style="color:#374151;margin:0;">Best regards,<br/><strong>${senderName || 'Your Name'}</strong></p></div></body></html>`;
  }

  const bgColor = design.id === 'crm' ? '#ecfdf5' : design.id === 'servicenow' ? '#f5f3ff' : '#f0f7ff';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;"><div style="max-width:620px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><div style="background:${design.gradient};padding:36px 40px;"><p style="margin:0 0 8px;display:inline-block;background:rgba(255,220,50,0.25);border:1px solid rgba(255,220,50,0.5);color:#fde68a;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:3px 10px;border-radius:20px;">${roleTitle || 'Senior Software Developer'}</p><h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">${senderName || 'Your Name'}</h1><p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">${subtitle || design.subtitle}</p></div><div style="padding:36px 40px;"><p style="color:#374151;line-height:1.8;margin:0 0 16px;">Dear ${hiName},</p><p style="color:#374151;line-height:1.8;margin:0 0 20px;">${intro || ''}</p>${highlightItems.length ? `<div style="background:${bgColor};border-left:4px solid ${design.color};border-radius:0 8px 8px 0;padding:20px 24px;margin:20px 0;"><p style="margin:0 0 12px;font-weight:700;color:#111827;font-size:14px;">⚡ Key Highlights</p><ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:2.2;">${highlightItems.map(h => `<li>${h}</li>`).join('')}</ul></div>` : ''}<p style="color:#374151;line-height:1.8;margin:0;">${closing || ''}</p></div><div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;"><p style="margin:0 0 8px;font-size:12px;color:#9ca3af;">📎 Resume attached to this email</p><p style="margin:0;font-size:12px;color:#6b7280;">📞 +91 7982092042 &nbsp;|&nbsp; ✉️ <a href="mailto:mohit310ggn@gmail.com" style="color:#2563eb;text-decoration:none;">mohit310ggn@gmail.com</a> &nbsp;|&nbsp; 🔗 <a href="https://www.linkedin.com/in/mohit-singh-ab641919b" style="color:#2563eb;text-decoration:none;">LinkedIn Profile</a></p></div></div></body></html>`;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => { load(); resumesApi.list().then(r => setResumes(r.data)); }, []);

  const load = async (query = q) => {
    setLoading(true);
    try { const r = await templatesApi.list({ q: query || undefined }); setTemplates(r.data.content); }
    finally { setLoading(false); }
  };

  useEffect(() => { const t = setTimeout(() => load(q), 300); return () => clearTimeout(t); }, [q]);

  const del = async (id) => { if (!window.confirm('Delete?')) return; await templatesApi.delete(id); setTemplates(p => p.filter(t => t.id !== id)); };
  const fav = async (id) => { const r = await templatesApi.toggleFavorite(id); setTemplates(p => p.map(t => t.id === id ? { ...t, isFavorite: r.data.isFavorite } : t)); };
  const dup = async (id) => { const r = await templatesApi.duplicate(id); setTemplates(p => [r.data, ...p]); };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Email Templates</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{templates.length} templates</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary">
          <Plus size={15} /> New Template
        </button>
      </div>

      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
        <input className="input pl-9" placeholder="Search templates..." value={q} onChange={e => setQ(e.target.value)} />
        {q && <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={14} style={{ color: 'var(--muted)' }} /></button>}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="card h-48 animate-pulse" style={{ background: 'var(--hover)' }} />)}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12">
          <FileText size={40} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--muted)' }} />
          <p className="font-medium" style={{ color: 'var(--text)' }}>No templates yet</p>
          <p className="text-sm mt-1 mb-4" style={{ color: 'var(--muted)' }}>Create your first email template</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">Create Template</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(t => (
            <div key={t.id} className="card flex flex-col hover:shadow-md transition-all group overflow-hidden">
              {/* Mini preview */}
              <div className="h-36 overflow-hidden cursor-pointer relative" onClick={() => setPreview(t)}
                style={{ background: '#f9fafb' }}>
                <div style={{ transform: 'scale(0.38)', transformOrigin: 'top left', width: '263%', pointerEvents: 'none', minHeight: '400px' }}
                  dangerouslySetInnerHTML={{ __html: t.body }} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20 dark:to-black/20" />
              </div>
              <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-start justify-between mb-1">
                  <p className="font-semibold text-sm truncate flex-1" style={{ color: 'var(--text)' }}>{t.name}</p>
                  <button onClick={() => fav(t.id)} className="ml-1 flex-shrink-0" style={{ color: t.isFavorite ? '#ef4444' : 'var(--muted)' }}>
                    <Heart size={13} fill={t.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <p className="text-xs truncate mb-2" style={{ color: 'var(--muted)' }}>{t.subject}</p>
                <div className="flex items-center gap-1.5">
                  <span className={`badge text-xs ${CAT_COLORS[t.category]}`}>{t.category?.replace('_',' ')}</span>
                  {t.defaultResumeName && <span className="badge text-xs bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 truncate max-w-24"><Paperclip size={9} /> {t.defaultResumeName}</span>}
                </div>
                <div className="flex gap-1 mt-2 pt-2 border-t opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderColor: 'var(--border)' }}>
                  <button onClick={() => setPreview(t)} className="btn-ghost py-1 px-2 text-xs flex-1 justify-center"><Eye size={11} /> View</button>
                  <button onClick={() => { setEditing(t); setShowForm(true); }} className="btn-ghost py-1 px-2 text-xs"><Edit size={11} /></button>
                  <button onClick={() => dup(t.id)} className="btn-ghost py-1 px-2 text-xs"><Copy size={11} /></button>
                  <button onClick={() => del(t.id)} className="btn-ghost py-1 px-2 text-xs hover:text-red-500"><Trash2 size={11} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setPreview(null)} />
          <div className="relative card p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto" style={{ background: 'var(--card)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{preview.name}</h3>
              <button onClick={() => setPreview(null)} className="btn-ghost p-1"><X size={16} /></button>
            </div>
            <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>Subject: <span style={{ color: 'var(--text)' }}>{preview.subject}</span></p>
            {preview.defaultResumeName && <p className="text-sm mb-4 flex items-center gap-1" style={{ color: 'var(--muted)' }}><Paperclip size={12} /> {preview.defaultResumeName}</p>}
            <div className="rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
              <div dangerouslySetInnerHTML={{ __html: preview.body }} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setEditing(preview); setPreview(null); setShowForm(true); }} className="btn-primary"><Edit size={14} /> Edit</button>
              <button onClick={() => setPreview(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <TemplateForm initial={editing} resumes={resumes}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={(t) => {
            if (editing) setTemplates(p => p.map(x => x.id === t.id ? t : x));
            else setTemplates(p => [t, ...p]);
            setShowForm(false); setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function TemplateForm({ initial, resumes, onClose, onSaved }) {
  const [name, setName] = useState(initial?.name || '');
  const [category, setCategory] = useState(initial?.category || 'COLD_EMAIL');
  const [subject, setSubject] = useState(initial?.subject || '');
  const [defaultResumeId, setDefaultResumeId] = useState(initial?.defaultResumeId || '');
  const [isFavorite, setIsFavorite] = useState(initial?.isFavorite || false);
  const [loading, setLoading] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState(
    DESIGNS.find(d => d.id === initial?.designId) || DESIGNS[0]
  );
  const [fields, setFields] = useState(() => {
    if (initial?.fieldsJson) {
      try { return JSON.parse(initial.fieldsJson); } catch {}
    }
    return { senderName: '', roleTitle: 'Senior Software Developer', subtitle: '', intro: '', highlights: [''], closing: '' };
  });

  const f = (k) => (e) => setFields(p => ({ ...p, [k]: e.target.value }));
  const fh = (i) => (e) => setFields(p => { const h = [...p.highlights]; h[i] = e.target.value; return { ...p, highlights: h }; });
  const addH = () => setFields(p => ({ ...p, highlights: [...p.highlights, ''] }));
  const removeH = (i) => setFields(p => ({ ...p, highlights: p.highlights.filter((_, idx) => idx !== i) }));

  const generatedHTML = generateHTML(selectedDesign, fields);

  const submit = async () => {
    if (!name || !subject) return;
    setLoading(true);
    try {
      const data = { name, category, subject, body: generatedHTML, designId: selectedDesign.id, fieldsJson: JSON.stringify(fields), defaultResumeId: defaultResumeId || null, isFavorite };
      const r = initial ? await templatesApi.update(initial.id, data) : await templatesApi.create(data);
      onSaved(r.data);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative card max-w-5xl w-full max-h-[95vh] overflow-hidden" style={{ background: 'var(--card)' }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <h3 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>{initial ? 'Edit Template' : 'New Template'}</h3>
          <button onClick={onClose} className="btn-ghost p-1"><X size={16} /></button>
        </div>

        <div className="grid grid-cols-2" style={{ height: 'calc(95vh - 130px)' }}>
          {/* Left */}
          <div className="p-5 overflow-y-auto space-y-4 border-r" style={{ borderColor: 'var(--border)' }}>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Name *</label>
                <input className="input" placeholder="Java Backend Cold Email" value={name} onChange={e => setName(e.target.value)} /></div>
              <div><label className="label">Category</label>
                <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                  {CATS.map(c => <option key={c} value={c}>{c.replace('_',' ')}</option>)}
                </select></div>
            </div>
            <div><label className="label">Subject *</label>
              <input className="input" placeholder="Application for Java Backend Developer" value={subject} onChange={e => setSubject(e.target.value)} /></div>
            <div><label className="label">📎 Default Resume</label>
              <select className="input" value={defaultResumeId} onChange={e => setDefaultResumeId(e.target.value)}>
                <option value="">No attachment</option>
                {resumes.map(r => <option key={r.id} value={r.id}>{r.name || r.originalFileName}</option>)}
              </select></div>

            {/* Design */}
            <div>
              <label className="label">Design Theme</label>
              <div className="grid grid-cols-2 gap-2">
                {DESIGNS.map(d => (
                  <button key={d.id} onClick={() => setSelectedDesign(d)}
                    className={`p-2.5 rounded-lg border-2 text-left ${selectedDesign.id === d.id ? 'border-brand-500' : ''}`}
                    style={{ borderColor: selectedDesign.id === d.id ? undefined : 'var(--border)', background: 'var(--surface)' }}>
                    <div className="h-2.5 rounded mb-1.5" style={{ background: d.gradient || '#e5e7eb' }} />
                    <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>{d.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div><label className="label">Your Name</label>
              <input className="input" value={fields.senderName} onChange={f('senderName')} /></div>
            <div><label className="label">Role / Title <span style={{color:'var(--muted)',fontWeight:400,fontSize:'11px'}}>(shown in header)</span></label>
              <input className="input" placeholder="e.g. Senior Software Developer" value={fields.roleTitle} onChange={f('roleTitle')} /></div>
            <div><label className="label">Skills Subtitle <span style={{color:'var(--muted)',fontWeight:400,fontSize:'11px'}}>(shown below name)</span></label>
              <input className="input" placeholder="e.g. Java · Spring Boot · Microservices · REST APIs" value={fields.subtitle} onChange={f('subtitle')} /></div>
            <div><label className="label">Introduction</label>
              <RichEditor value={fields.intro} onChange={f('intro')} placeholder="Write your introduction..." minHeight="80px" /></div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Key Highlights</label>
                <button onClick={addH} className="btn-ghost text-xs py-0.5 px-2"><Plus size={11} /> Add</button>
              </div>
              <div className="space-y-2">
                {fields.highlights.map((h, i) => (
                  <div key={i} className="flex gap-2">
                    <input className="input flex-1 text-sm" value={h} onChange={fh(i)} placeholder="e.g. 4.8+ Years Java" />
                    <button onClick={() => removeH(i)} className="btn-ghost p-1.5 hover:text-red-500"><X size={13} /></button>
                  </div>
                ))}
              </div>
            </div>
            <div><label className="label">Closing</label>
              <RichEditor value={fields.closing} onChange={f('closing')} placeholder="Write your closing..." minHeight="64px" /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={isFavorite} onChange={e => setIsFavorite(e.target.checked)} />
              <label className="text-sm" style={{ color: 'var(--text)' }}>Favorite</label>
            </div>
          </div>

          {/* Right - Preview */}
          <div className="p-4 overflow-y-auto" style={{ background: 'var(--hover)' }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--muted)' }}>Live Preview</p>
            <div className="rounded-xl overflow-hidden shadow-lg">
              <div dangerouslySetInnerHTML={{ __html: generatedHTML }} />
            </div>
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={submit} disabled={loading || !name || !subject} className="btn-primary">
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            {loading ? 'Saving...' : initial ? 'Update' : 'Create Template'}
          </button>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
}
