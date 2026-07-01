import React, { useState, useEffect } from 'react';
import { templatesApi, resumesApi, campaignApi } from '../api';
import { Send, Clock, FileText, Loader2, Paperclip } from 'lucide-react';

function applyVars(text, recruiter) {
  return (text || '')
    .replace(/\{\{recruiterName\}\}/g, recruiter.name || 'Hiring Manager')
    .replace(/\{\{company\}\}/g, recruiter.company || '')
    .replace(/\{\{role\}\}/g, recruiter.role || '')
    .replace(/\{\{recruiterEmail\}\}/g, recruiter.email || '');
}

export default function ComposePage() {
  const [templates, setTemplates] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [recruiter, setRecruiter] = useState({ name: '', email: '', company: '', role: '', notes: '' });
  const [subject, setSubject] = useState('');
  const [resumeId, setResumeId] = useState('');
  const [sendMode, setSendMode] = useState(() => sessionStorage.getItem('compose_sendMode') || 'now');
  const [scheduleAt, setScheduleAt] = useState(() => sessionStorage.getItem('compose_scheduleAt') || '');
  const [scheduleTime, setScheduleTime] = useState(() => sessionStorage.getItem('compose_scheduleTime') || '');
  const [timezone, setTimezone] = useState(() => sessionStorage.getItem('compose_timezone') || 'Asia/Kolkata');

  // Persist schedule settings so they don't reset when switching templates
  const setScheduleAtP = (v) => { setScheduleAt(v); sessionStorage.setItem('compose_scheduleAt', v); };
  const setScheduleTimeP = (v) => { setScheduleTime(v); sessionStorage.setItem('compose_scheduleTime', v); };
  const setTimezoneP = (v) => { setTimezone(v); sessionStorage.setItem('compose_timezone', v); };
  const setSendModeP = (v) => { setSendMode(v); sessionStorage.setItem('compose_sendMode', v); };
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    templatesApi.list({ size: 100 }).then(r => setTemplates(r.data.content));
    resumesApi.list().then(r => setResumes(r.data));
  }, []);

  const selectTemplate = (t) => {
    setSelectedTemplate(t);
    setSubject(t.subject);
    setResumeId(t.defaultResumeId ? String(t.defaultResumeId) : '');
  };

  const selectedResume = resumes.find(r => r.id === Number(resumeId));
  const previewSubject = applyVars(subject, recruiter);

  const NEW_FOOTER = '<div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;"><p style="margin:0 0 8px;font-size:12px;color:#9ca3af;">\u{1F4CE} Resume attached to this email</p><p style="margin:0;font-size:12px;color:#6b7280;">\u{1F4DE} +91 7982092042 &nbsp;|&nbsp; \u2709\uFE0F <a href=\"mailto:mohit310ggn@gmail.com\" style=\"color:#2563eb;text-decoration:none;\">mohit310ggn@gmail.com</a> &nbsp;|&nbsp; \u{1F517} <a href=\"https://www.linkedin.com/in/mohit-singh-ab641919b\" style=\"color:#2563eb;text-decoration:none;\">LinkedIn Profile</a></p></div>';

  const injectFooter = (html) => {
    if (!html) return '';
    if (html.includes('Resume attached to this email')) {
      return html.replace(/<div style="background:#f9fafb[\s\S]*?<\/div>(?=\s*<\/div>\s*<\/body>)/, NEW_FOOTER);
    }
    return html.replace('<\/body>', NEW_FOOTER + '<\/body>');
  };

  const previewBody = selectedTemplate ? injectFooter(applyVars(selectedTemplate.body, recruiter)) : '';

  const canSend = !!selectedTemplate && !!recruiter.email &&
    (sendMode === 'now' || (scheduleAt && scheduleTime));

  const handleSend = async () => {
    setLoading(true);
    try {
      if (sendMode === 'now') {
        await campaignApi.send({
          templateId: selectedTemplate?.id,
          recruiterName: recruiter.name,
          recruiterEmail: recruiter.email,
          company: recruiter.company,
          role: recruiter.role,
          subject: previewSubject,
          body: previewBody,
          resumeId: resumeId || null,
        });
        setResult({ type: 'sent', message: `Email sent to ${recruiter.email}!` });
      } else {
        const scheduledAt = `${scheduleAt}T${scheduleTime}:00`;
        await campaignApi.schedule({
          templateId: selectedTemplate?.id,
          recruiterName: recruiter.name,
          recruiterEmail: recruiter.email,
          company: recruiter.company,
          role: recruiter.role,
          subject: previewSubject,
          body: previewBody,
          resumeId: resumeId || null,
          scheduledAt,
          timezone,
        });
        setResult({ type: 'scheduled', message: `Scheduled for ${scheduleAt} at ${scheduleTime}` });
      }
    } catch (e) {
      setResult({ type: 'error', message: e.response?.data?.error || e.message });
    } finally { setLoading(false); }
  };

  const reset = () => {
    setSelectedTemplate(null);
    setRecruiter({ name: '', email: '', company: '', role: '', notes: '' });
    setSubject('');
    setResumeId('');
    setResult(null);
    // intentionally keep sendMode, scheduleAt, scheduleTime, timezone so user can send next email quickly
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Compose Email</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>Fill in the details and send your job application</p>
      </div>

      {result ? (
        <div className="card p-8 text-center max-w-lg mx-auto">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl ${
            result.type === 'error' ? 'bg-red-100' : 'bg-green-100'
          }`}>
            {result.type === 'sent' ? '✅' : result.type === 'scheduled' ? '⏰' : '❌'}
          </div>
          <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>
            {result.type === 'sent' ? 'Email Sent!' : result.type === 'scheduled' ? 'Scheduled!' : 'Failed'}
          </h3>
          <p className="mb-6" style={{ color: 'var(--muted)' }}>{result.message}</p>
          <button onClick={reset} className="btn-primary">Send Another Email</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* LEFT COLUMN: form */}
          <div className="space-y-4">

            {/* 1. Template */}
            <div className="card p-5">
              <h2 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>1. Choose Template</h2>
              {templates.length === 0 ? (
                <div className="text-center py-6" style={{ color: 'var(--muted)' }}>
                  <FileText size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No templates yet. Create one from the Templates page.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {templates.map(t => (
                    <div key={t.id} onClick={() => selectTemplate(t)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm ${
                        selectedTemplate?.id === t.id
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/20'
                          : 'hover:border-brand-300'
                      }`}
                      style={{ borderColor: selectedTemplate?.id === t.id ? undefined : 'var(--border)' }}>
                      <p className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>{t.name}</p>
                      <p className="text-xs truncate mt-0.5" style={{ color: 'var(--muted)' }}>{t.subject}</p>
                      {t.defaultResumeName && (
                        <div className="flex items-center gap-1 mt-1.5 text-xs" style={{ color: 'var(--muted)' }}>
                          <Paperclip size={10} /> {t.defaultResumeName}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Recruiter Details */}
            <div className="card p-5">
              <h2 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>2. Recruiter Details</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Recruiter Name</label>
                    <input className="input" placeholder="e.g. Priya Sharma"
                      value={recruiter.name}
                      onChange={e => setRecruiter(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Recruiter Email *</label>
                    <input className="input" type="email" placeholder="recruiter@company.com"
                      value={recruiter.email}
                      onChange={e => setRecruiter(p => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Company</label>
                    <input className="input" placeholder="e.g. Google, Infosys"
                      value={recruiter.company}
                      onChange={e => setRecruiter(p => ({ ...p, company: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Role</label>
                    <input className="input" placeholder="e.g. Senior Java Developer"
                      value={recruiter.role}
                      onChange={e => setRecruiter(p => ({ ...p, role: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="label">Notes (Optional)</label>
                  <textarea className="input resize-none h-16" value={recruiter.notes}
                    onChange={e => setRecruiter(p => ({ ...p, notes: e.target.value }))} />
                </div>
              </div>
            </div>

            {/* 3. Subject & Attachment */}
            <div className="card p-5">
              <h2 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>3. Subject &amp; Attachment</h2>
              <div className="space-y-3">
                <div>
                  <label className="label">Subject</label>
                  <input className="input" value={subject}
                    onChange={e => setSubject(e.target.value)} />
                </div>
                <div>
                  <label className="label">📎 Attached Resume</label>
                  <select className="input" value={resumeId}
                    onChange={e => setResumeId(e.target.value)}>
                    <option value="">No attachment</option>
                    {resumes.map(r => (
                      <option key={r.id} value={r.id}>{r.name || r.originalFileName}</option>
                    ))}
                  </select>
                  {selectedResume && (
                    <p className="text-xs mt-1 text-green-600">✓ Will attach: {selectedResume.originalFileName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 4. Send or Schedule */}
            <div className="card p-5">
              <h2 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>4. Send or Schedule</h2>

              <div className="flex gap-2 mb-4">
                <button onClick={() => setSendModeP('now')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-2 ${
                    sendMode === 'now' ? 'bg-brand-600 text-white border-brand-600' : 'hover:bg-[var(--hover)]'
                  }`}
                  style={{
                    borderColor: sendMode === 'now' ? undefined : 'var(--border)',
                    color: sendMode === 'now' ? undefined : 'var(--text)'
                  }}>
                  <Send size={14} /> Send Now
                </button>
                <button onClick={() => setSendModeP('schedule')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-2 ${
                    sendMode === 'schedule' ? 'bg-brand-600 text-white border-brand-600' : 'hover:bg-[var(--hover)]'
                  }`}
                  style={{
                    borderColor: sendMode === 'schedule' ? undefined : 'var(--border)',
                    color: sendMode === 'schedule' ? undefined : 'var(--text)'
                  }}>
                  <Clock size={14} /> Schedule
                </button>
              </div>

              {sendMode === 'schedule' && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="label">Date</label>
                    <input className="input" type="date" value={scheduleAt}
                      onChange={e => setScheduleAtP(e.target.value)}
                      min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <label className="label">Time</label>
                    <input className="input" type="time" value={scheduleTime}
                      onChange={e => setScheduleTimeP(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Timezone</label>
                    <select className="input" value={timezone} onChange={e => setTimezoneP(e.target.value)}>
                      <option value="Asia/Kolkata">IST (India)</option>
                      <option value="America/New_York">EST (New York)</option>
                      <option value="Europe/London">GMT (London)</option>
                      <option value="Asia/Dubai">GST (Dubai)</option>
                    </select>
                  </div>
                </div>
              )}

              <button onClick={handleSend}
                disabled={loading || !canSend}
                className="btn-primary w-full justify-center py-3 text-base disabled:opacity-40">
                {loading
                  ? <><Loader2 size={18} className="animate-spin" /> Sending...</>
                  : sendMode === 'now'
                    ? <><Send size={18} /> Send Email Now</>
                    : <><Clock size={18} /> Schedule Email</>}
              </button>

              {!selectedTemplate && (
                <p className="text-xs mt-2 text-center" style={{ color: 'var(--muted)' }}>
                  Select a template above to continue
                </p>
              )}
              {selectedTemplate && !recruiter.email && (
                <p className="text-xs mt-2 text-center" style={{ color: 'var(--muted)' }}>
                  Recruiter email is required
                </p>
              )}
              {sendMode === 'schedule' && (!scheduleAt || !scheduleTime) && selectedTemplate && recruiter.email && (
                <p className="text-xs mt-2 text-center" style={{ color: 'var(--muted)' }}>
                  Please pick a date and time to schedule
                </p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: live preview, sticky */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--muted)' }}>
                Live Preview
              </p>
              {selectedTemplate ? (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-3 p-3 rounded-lg text-sm"
                    style={{ background: 'var(--hover)' }}>
                    <div>
                      <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--muted)' }}>TO</p>
                      <p className="truncate" style={{ color: 'var(--text)' }}>
                        {recruiter.name ? `${recruiter.name} <${recruiter.email}>` : recruiter.email || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--muted)' }}>COMPANY</p>
                      <p style={{ color: 'var(--text)' }}>{recruiter.company || '—'}</p>
                    </div>
                  </div>
                  <p className="text-sm mb-3 truncate">
                    <span style={{ color: 'var(--muted)' }}>Subject: </span>
                    <span style={{ color: 'var(--text)' }}>{previewSubject || '—'}</span>
                  </p>
                  {selectedResume && (
                    <p className="text-xs mb-3 text-green-600 flex items-center gap-1">
                      <Paperclip size={11} /> {selectedResume.originalFileName}
                    </p>
                  )}
                  <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                    <div dangerouslySetInnerHTML={{ __html: previewBody }} />
                  </div>
                </>
              ) : (
                <div className="text-center py-16" style={{ color: 'var(--muted)' }}>
                  <FileText size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Pick a template on the left to see a live preview</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
