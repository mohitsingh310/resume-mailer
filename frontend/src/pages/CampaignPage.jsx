import React, { useState, useEffect, useRef } from 'react';
import { templatesApi, recruitersApi } from '../api';
import api from '../api';
import {
  Mail, Send, Eye, CheckCircle, XCircle, Loader2,
  Clock, Calendar, Users, FileText, ChevronRight,
  ChevronLeft, Check, Save, RefreshCw, AlertCircle
} from 'lucide-react';

const VARIABLES_KEY = 'campaign_saved_variables';

const VARIABLE_FIELDS = [
  { key: 'role', label: 'Role', icon: '💼', placeholder: 'Senior Java Developer' },
  { key: 'experience', label: 'Experience', icon: '⭐', placeholder: '4.8' },
  { key: 'currentCompany', label: 'Current Company', icon: '🏢', placeholder: 'NovelVox' },
  { key: 'candidateName', label: 'Your Name', icon: '👤', placeholder: 'Mohit Singh' },
  { key: 'phone', label: 'Phone', icon: '📞', placeholder: '+91 7982092042' },
  { key: 'email', label: 'Email', icon: '📧', placeholder: 'mohit310ggn@gmail.com' },
  { key: 'linkedin', label: 'LinkedIn', icon: '🔗', placeholder: 'linkedin.com/in/mohit-singh' },
  { key: 'github', label: 'GitHub', icon: '💻', placeholder: 'github.com/mohit-singh' },
  { key: 'location', label: 'Location', icon: '📍', placeholder: 'Gurugram, Haryana' },
];

export default function CampaignPage() {
  const [step, setStep] = useState(1);
  const [templates, setTemplates] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedRecruiters, setSelectedRecruiters] = useState([]);
  const [variables, setVariables] = useState(() => {
    try { return JSON.parse(localStorage.getItem(VARIABLES_KEY)) || {}; } catch { return {}; }
  });
  const [sendMode, setSendMode] = useState('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [scheduledEmails, setScheduledEmails] = useState([]);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    templatesApi.getAll({ size: 100 }).then(r => setTemplates(r.data.content));
    recruitersApi.getAll({ size: 100 }).then(r => setRecruiters(r.data.content));
    loadScheduledEmails();
    const interval = setInterval(loadScheduledEmails, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedTemplate && selectedRecruiters.length > 0 && step === 3) {
      generatePreview();
    }
  }, [variables, selectedTemplate, selectedRecruiters, step]);

  const loadScheduledEmails = async () => {
    try {
      const res = await api.get('/campaigns/scheduled');
      setScheduledEmails(res.data);
    } catch (e) {}
  };

  const generatePreview = async () => {
    if (!selectedTemplate || selectedRecruiters.length === 0) return;
    try {
      const res = await api.post('/campaigns/preview', {
        templateId: selectedTemplate.id,
        recruiterId: selectedRecruiters[0],
        variables
      });
      setPreview(res.data);
    } catch (e) {}
  };

  const saveVariables = () => {
    localStorage.setItem(VARIABLES_KEY, JSON.stringify(variables));
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const clearVariables = () => {
    localStorage.removeItem(VARIABLES_KEY);
    setVariables({});
  };

  const toggleRecruiter = (id) => {
    setSelectedRecruiters(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const selectAllRecruiters = () => {
    const withEmail = recruiters.filter(r => r.email).map(r => r.id);
    setSelectedRecruiters(selectedRecruiters.length === withEmail.length ? [] : withEmail);
  };
  

  const handleSend = async () => {
    setLoading(true);
    try {
      if (sendMode === 'now') {
        const res = await api.post('/campaigns/send', {
          templateId: selectedTemplate.id,
          recruiterIds: selectedRecruiters,
          variables
        });
        setResults(res.data);
        setShowResults(true);
      } else {
        const scheduledAt = `${scheduleDate}T${scheduleTime}:00`;
        const res = await api.post('/campaigns/schedule', {
          templateId: selectedTemplate.id,
          recruiterIds: selectedRecruiters,
          variables,
          scheduledAt
        });
        setResults({ scheduled: true, ...res.data });
        setShowResults(true);
        loadScheduledEmails();
      }
    } catch (e) {
      alert('Failed: ' + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  };

  const fillPreviewVariables = (text) => {
    if (!text) return '';
    let filled = text;
    const recruiter = recruiters.find(r => r.id === selectedRecruiters[0]);
    if (recruiter) {
      filled = filled.replace(/\{\{name\}\}/g, recruiter.firstName || '');
      filled = filled.replace(/\{\{company\}\}/g, recruiter.companyName || '');
    }
    Object.entries(variables).forEach(([k, v]) => {
      filled = filled.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v);
    });
    return filled;
  };

  const STEPS = [
    { num: 1, label: 'Choose Template', icon: FileText },
    { num: 2, label: 'Select Recruiters', icon: Users },
    { num: 3, label: 'Fill Variables & Send', icon: Send },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2">
          <Mail size={20} className="text-brand-500" /> Email Campaign
        </h1>
        <p className="text-sm text-[var(--muted)]">Build a targeted recruiter email campaign in three steps.</p>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.num}>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => step > s.num && setStep(s.num)}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step === s.num ? 'bg-brand-600 text-white scale-110' :
                step > s.num ? 'bg-green-500 text-white' :
                'bg-gray-200 dark:bg-dark-border text-[var(--muted)]'
              }`}>
                {step > s.num ? <Check size={14} /> : s.num}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${step === s.num ? 'text-brand-600' : 'text-[var(--muted)]'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 transition-all ${step > s.num ? 'bg-green-500' : 'bg-gray-200 dark:bg-dark-border'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1 - Choose Template */}
      {step === 1 && (
        <div className="card p-6 animate-fade-in">
          <h2 className="font-semibold text-[var(--text)] mb-1">Choose Template</h2>
          <p className="text-xs text-[var(--muted)] mb-4">Pick a design, then fill the details for the final email.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTemplate(t)}
                className={`rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg overflow-hidden ${
                  selectedTemplate?.id === t.id
                    ? 'border-brand-500 ring-2 ring-brand-400 ring-offset-2'
                    : 'border-[var(--border)] hover:border-brand-300'
                }`}
                style={{ background: 'var(--card)' }}
              >
                {/* Card Header */}
                <div className={`p-4 ${
                  t.category === 'COLD_EMAIL' ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
                  t.category === 'FOLLOW_UP' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                  t.category === 'COVER_LETTER' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                  'bg-gradient-to-r from-brand-600 to-brand-400'
                }`}>
                  <p className="text-xs font-bold text-white/80 uppercase tracking-wider">{t.category?.replace('_', ' ')}</p>
                  <p className="text-white font-bold text-lg mt-1">{t.name}</p>
                  {selectedTemplate?.id === t.id && (
                    <div className="flex justify-end">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <Check size={12} className="text-brand-600" />
                      </div>
                    </div>
                  )}
                </div>
                {/* Card Body */}
                <div className="p-4">
                  {t.subject && (
                    <div className="mb-2">
                      <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Subject</p>
                      <p className="text-sm font-medium text-[var(--text)] mt-0.5">{t.subject}</p>
                    </div>
                  )}
                <div className="h-px bg-[var(--border)] my-2" />
<div
  className="text-xs line-clamp-4 leading-relaxed overflow-hidden rounded"
  style={{ background: '#fff', color: '#374151', padding: '4px' }}
  dangerouslySetInnerHTML={{ __html: t.body?.substring(0, 300) }}
/>
                </div>
                <div className="px-4 pb-3 flex justify-between items-center">
                  <span className="text-xs text-[var(--muted)]">{t.name}</span>
                  <span className="text-xs font-medium text-brand-600 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-full">
                    {t.category?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 - Select Recruiters */}
      {step === 2 && (
        <div className="card p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-[var(--text)]">Select Recruiters</h2>
              <p className="text-xs text-[var(--muted)]">Choose recruiters with email addresses</p>
            </div>
            <div className="flex items-center gap-2">
              {selectedRecruiters.length > 0 && (
                <span className="text-xs bg-brand-600 text-white px-2 py-1 rounded-full font-medium">
                  {selectedRecruiters.length} selected
                </span>
              )}
              <button onClick={selectAllRecruiters} className="btn-secondary text-xs py-1.5">
                {selectedRecruiters.length === recruiters.filter(r => r.email).length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recruiters.filter(r => r.email).map(r => (
              <div
                key={r.id}
                onClick={() => toggleRecruiter(r.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedRecruiters.includes(r.id)
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
                    : 'border-[var(--border)] hover:border-brand-300 hover:bg-[var(--hover)]'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                  selectedRecruiters.includes(r.id) ? 'bg-brand-600' : 'bg-purple-500'
                }`}>
                  {r.firstName?.charAt(0)}{r.lastName?.charAt(0) || ''}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text)] truncate">{r.fullName || r.firstName}</p>
                  <p className="text-xs text-[var(--muted)] truncate">{r.email}</p>
                  {r.companyName && <p className="text-xs text-brand-600 truncate">{r.companyName}</p>}
                </div>
                {selectedRecruiters.includes(r.id) && (
                  <CheckCircle size={18} className="text-brand-600 flex-shrink-0" />
                )}
              </div>
            ))}
            {recruiters.filter(r => r.email).length === 0 && (
              <div className="col-span-3 text-center py-12 text-[var(--muted)]">
                <Users size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No recruiters with email found</p>
                <p className="text-xs mt-1">Add recruiters with email addresses first</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3 - Fill Variables & Send */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
          {/* Left - Variables */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[var(--text)]">Fill Variables</h2>
              <div className="flex gap-2">
                {savedMsg && <span className="text-xs text-green-500 font-medium">✓ Saved!</span>}
                <button onClick={clearVariables} className="btn-ghost text-xs py-1 px-2">Clear</button>
                <button onClick={saveVariables} className="btn-secondary text-xs py-1 px-2">
                  <Save size={12} /> Save
                </button>
              </div>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {VARIABLE_FIELDS.map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider flex items-center gap-1 mb-1">
                    <span>{f.icon}</span> {f.label}
                  </label>
                  <input
                    className="input-field text-sm"
                    placeholder={f.placeholder}
                    value={variables[f.key] || ''}
                    onChange={e => setVariables(p => ({ ...p, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>

            {/* Send Mode Toggle */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setSendMode('now')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    sendMode === 'now' ? 'bg-brand-600 text-white' : 'bg-[var(--hover)] text-[var(--muted)]'
                  }`}
                >
                  <Send size={14} /> Send Now
                </button>
                <button
                  onClick={() => setSendMode('schedule')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    sendMode === 'schedule' ? 'bg-brand-600 text-white' : 'bg-[var(--hover)] text-[var(--muted)]'
                  }`}
                >
                  <Clock size={14} /> Schedule
                </button>
              </div>

              {sendMode === 'schedule' && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="label">Date</label>
                    <input
                      type="date"
                      className="input-field"
                      value={scheduleDate}
                      onChange={e => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="label">Time</label>
                    <input
                      type="time"
                      className="input-field"
                      value={scheduleTime}
                      onChange={e => setScheduleTime(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleSend}
                disabled={loading || (sendMode === 'schedule' && (!scheduleDate || !scheduleTime))}
                className="btn-primary w-full justify-center py-3 text-base disabled:opacity-40"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Sending...</>
                ) : sendMode === 'now' ? (
                  <><Send size={18} /> Send to {selectedRecruiters.length} Recruiter{selectedRecruiters.length !== 1 ? 's' : ''}</>
                ) : (
                  <><Clock size={18} /> Schedule for {scheduleDate} {scheduleTime}</>
                )}
              </button>
            </div>
          </div>

          {/* Right - Live Preview */}
          <div className="card p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[var(--text)]">Live Preview</h3>
              <button onClick={generatePreview} className="btn-ghost text-xs py-1 px-2">
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
            {selectedTemplate ? (
              <div className="flex-1 overflow-y-auto">
                {preview?.subject && (
                  <div className="mb-3 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-xs text-[var(--muted)] font-semibold uppercase">Subject</p>
                    <p className="text-sm font-medium text-[var(--text)] mt-1">{fillPreviewVariables(preview.subject)}</p>
                  </div>
                )}
                <div
                  className="text-xs text-[var(--text)] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: fillPreviewVariables(preview?.body || selectedTemplate.body) }}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <Eye size={28} className="text-[var(--muted)] mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-[var(--muted)]">Select a template to see preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep(s => s - 1)}
          disabled={step === 1}
          className="btn-ghost disabled:opacity-40"
        >
          <ChevronLeft size={16} /> Back
        </button>
        {step < 3 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={(step === 1 && !selectedTemplate) || (step === 2 && selectedRecruiters.length === 0)}
            className="btn-primary disabled:opacity-40"
          >
            Next <ChevronRight size={16} />
          </button>
        ) : null}
      </div>

      {/* Scheduled Emails Table */}
      {scheduledEmails.length > 0 && (
        <div className="card mt-6 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-semibold text-[var(--text)] flex items-center gap-2">
              <Clock size={16} className="text-brand-500" /> Scheduled Emails
            </h3>
            <button onClick={loadScheduledEmails} className="btn-ghost text-xs py-1 px-2">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase">Recruiter</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase">Template</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase">Scheduled At</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {scheduledEmails.map(e => (
                <tr key={e.id} className="border-b hover:bg-[var(--hover)]" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--text)]">{e.recruiterName}</p>
                    <p className="text-xs text-[var(--muted)]">{e.recruiterEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{e.templateName}</td>
                  <td className="px-4 py-3 text-[var(--muted)] text-xs">
                    {e.scheduledAt ? new Date(e.scheduledAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                      e.status === 'SENT' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' :
                      e.status === 'FAILED' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
                    }`}>
                      {e.status === 'SENT' ? <CheckCircle size={10} /> :
                       e.status === 'FAILED' ? <XCircle size={10} /> :
                       <Clock size={10} />}
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Results Modal */}
      {showResults && results && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowResults(false)} />
          <div className="relative card p-6 max-w-lg w-full shadow-2xl animate-scale-in" style={{ background: 'var(--card)' }}>
            <h3 className="font-bold text-lg text-[var(--text)] mb-4">
              {results.scheduled ? '⏰ Campaign Scheduled!' : '📊 Campaign Results'}
            </h3>

            {results.scheduled ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock size={28} className="text-green-600" />
                </div>
                <p className="text-[var(--text)] font-medium">{results.totalScheduled} email{results.totalScheduled !== 1 ? 's' : ''} scheduled!</p>
                <p className="text-sm text-[var(--muted)] mt-1">Will be sent at {new Date(results.scheduledAt).toLocaleString()}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 text-center">
                    <p className="text-xs text-[var(--muted)] uppercase font-semibold">Sent</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{results.totalSent}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-center">
                    <p className="text-xs text-[var(--muted)] uppercase font-semibold">Failed</p>
                    <p className="text-3xl font-bold text-red-500 mt-1">{results.totalFailed}</p>
                  </div>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {results.results?.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--hover)' }}>
                      {r.status === 'SENT'
                        ? <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                        : <XCircle size={16} className="text-red-500 flex-shrink-0" />
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text)]">{r.recruiterName}</p>
                        <p className="text-xs text-[var(--muted)]">{r.email}</p>
                        {r.error && <p className="text-xs text-red-500 mt-0.5">{r.error}</p>}
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        r.status === 'SENT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>{r.status}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            <button onClick={() => setShowResults(false)} className="btn-primary w-full justify-center mt-4">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
