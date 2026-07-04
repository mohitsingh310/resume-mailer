import React, { useState, useEffect } from 'react';
import { settingsApi, gmailApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { Save, Mail, Link, Loader2, Check, Sun, Moon } from 'lucide-react';

export default function SettingsPage() {
  const { user, setUser, theme, toggleTheme } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('gmail') === 'connected') {
      setSuccess('Gmail connected successfully!');
      setActiveTab('gmail');
      window.history.replaceState({}, '', '/settings');
    }
    settingsApi.get().then(r => { setSettings(r.data); setLoading(false); });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const r = await settingsApi.update(settings);
      setSettings(r.data);
      setSuccess('Settings saved!');
      setTimeout(() => setSuccess(''), 3000);
    } finally { setSaving(false); }
  };

  const connectGmail = async () => {
    const r = await gmailApi.authUrl();
    window.location.href = r.data.url;
  };

  const disconnectGmail = async () => {
    await gmailApi.disconnect();
    setSettings(s => ({...s, gmailConnected: false}));
  };

  const f = (k) => e => setSettings(p => ({...p, [k]: e.target.value}));

  const TABS = [
    { key: 'profile', label: 'Profile' },
    { key: 'gmail', label: 'Gmail' },
    { key: 'preferences', label: 'Preferences' },
    { key: 'security', label: 'Security' },
  ];

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>Settings</h1>

      {success && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
          <Check size={14} /> {success}
        </div>
      )}

      <div className="flex gap-6">
        {/* Tabs */}
        <nav className="w-40 flex-shrink-0 space-y-0.5">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === t.key ? 'bg-brand-600 text-white' : 'hover:bg-[var(--hover)]'
              }`} style={{ color: activeTab === t.key ? undefined : 'var(--muted)' }}>
              {t.label}
            </button>
          ))}
        </nav>

        <div className="flex-1">
          {/* Profile */}
          {activeTab === 'profile' && (
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Profile</h2>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">First Name</label>
                  <input className="input" value={settings?.firstName || ''} onChange={f('firstName')} /></div>
                <div><label className="label">Last Name</label>
                  <input className="input" value={settings?.lastName || ''} onChange={f('lastName')} /></div>
              </div>
              <div><label className="label">Email</label>
                <input className="input opacity-60 cursor-not-allowed" value={settings?.email || ''} disabled /></div>
              <div><label className="label">Sender Name</label>
                <input className="input" placeholder="Name shown in sent emails" value={settings?.senderName || ''} onChange={f('senderName')} /></div>
              <div><label className="label">Reply-To Email</label>
                <input className="input" type="email" placeholder="replies@youremail.com" value={settings?.replyTo || ''} onChange={f('replyTo')} /></div>
              <div><label className="label">Email Signature (HTML)</label>
                <textarea className="input resize-none h-24 text-xs font-mono" placeholder="<p>Best regards,<br/>Your Name</p>" value={settings?.emailSignature || ''} onChange={f('emailSignature')} /></div>
              <button onClick={save} disabled={saving} className="btn-primary">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          )}

          {/* Gmail */}
          {activeTab === 'gmail' && (
            <div className="card p-5">
              <h2 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>Gmail Integration</h2>
              <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--hover)' }}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${settings?.gmailConnected ? 'bg-green-100 dark:bg-green-950' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <Mail size={18} className={settings?.gmailConnected ? 'text-green-600' : ''} style={{ color: settings?.gmailConnected ? undefined : 'var(--muted)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                      {settings?.gmailConnected ? '✅ Gmail Connected' : '❌ Gmail Not Connected'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {settings?.gmailConnected ? `Sending emails via Gmail API` : 'Connect Gmail to send emails'}
                    </p>
                  </div>
                </div>
                {settings?.gmailConnected
                  ? <button onClick={disconnectGmail} className="btn-danger">Disconnect</button>
                  : <button onClick={connectGmail} className="btn-primary"><Link size={14} /> Connect Gmail</button>
                }
              </div>
              {!settings?.gmailConnected && (
                <div className="mt-4 p-3 rounded-lg border text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                  <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>How it works:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Click "Connect Gmail"</li>
                    <li>Login with your Google account</li>
                    <li>Allow Resume Mailer to send emails</li>
                    <li>Emails will be sent directly from your Gmail</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Preferences */}
          {activeTab === 'preferences' && (
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Preferences</h2>
              <div>
                <label className="label">Timezone</label>
                <select className="input" value={settings?.timezone || 'Asia/Kolkata'} onChange={f('timezone')}>
                  <option value="Asia/Kolkata">IST - India Standard Time</option>
                  <option value="America/New_York">EST - Eastern Time</option>
                  <option value="America/Los_Angeles">PST - Pacific Time</option>
                  <option value="Europe/London">GMT - Greenwich Mean Time</option>
                  <option value="Asia/Dubai">GST - Gulf Standard Time</option>
                  <option value="Asia/Singapore">SGT - Singapore Time</option>
                </select>
              </div>
              <div>
                <label className="label">Theme</label>
                <div className="flex gap-2">
                  <button onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-all ${theme === 'dark' ? 'bg-brand-600 text-white border-brand-600' : ''}`}
                    style={{ borderColor: theme === 'dark' ? undefined : 'var(--border)', color: theme === 'dark' ? undefined : 'var(--text)' }}>
                    <Moon size={15} /> Dark Mode
                  </button>
                  <button onClick={() => { if (theme !== 'light') toggleTheme(); }}
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-all ${theme === 'light' ? 'bg-brand-600 text-white border-brand-600' : ''}`}
                    style={{ borderColor: theme === 'light' ? undefined : 'var(--border)', color: theme === 'light' ? undefined : 'var(--text)' }}>
                    <Sun size={15} /> Light Mode
                  </button>
                </div>
              </div>
              <button onClick={save} disabled={saving} className="btn-primary">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <ChangePasswordSection />
          )}
        </div>
      </div>
    </div>
  );
}

function ChangePasswordSection() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const f = (k) => e => setForm(p => ({...p, [k]: e.target.value}));

  const submit = async () => {
    if (form.newPassword !== form.confirmPassword) { setMsg('Passwords do not match'); return; }
    setLoading(true);
    try {
      await settingsApi.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setMsg('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="card p-5 space-y-4">
      <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Change Password</h2>
      {msg && <div className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-sm">{msg}</div>}
      <div><label className="label">Current Password</label>
        <input className="input" type="password" value={form.currentPassword} onChange={f('currentPassword')} /></div>
      <div><label className="label">New Password</label>
        <input className="input" type="password" value={form.newPassword} onChange={f('newPassword')} /></div>
      <div><label className="label">Confirm New Password</label>
        <input className="input" type="password" value={form.confirmPassword} onChange={f('confirmPassword')} /></div>
      <button onClick={submit} disabled={loading || !form.currentPassword || !form.newPassword} className="btn-primary">
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        {loading ? 'Changing...' : 'Change Password'}
      </button>
    </div>
  );
}
