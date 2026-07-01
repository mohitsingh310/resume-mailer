import React, { useState, useEffect } from 'react';
import { settingsApi } from '../api';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { User, Bot, Lock, Mail, Check, Eye, EyeOff, Loader2 } from 'lucide-react';

const TABS = [
  { key: 'profile', icon: User, label: 'Profile' },
  { key: 'ai', icon: Bot, label: 'AI Settings' },
  { key: 'gmail', icon: Mail, label: 'Gmail' },
  { key: 'security', icon: Lock, label: 'Security' },
];

export default function SettingsPage() {
  const { user, setUser, theme, toggleTheme } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    settingsApi.get().then(r => { setSettings(r.data); setLoading(false); });
    // Check if Gmail just connected
    const params = new URLSearchParams(window.location.search);
    if (params.get('gmail') === 'connected') {
      setSuccess('Gmail connected successfully!');
      setActiveTab('gmail');
      window.history.replaceState({}, '', '/settings');
    }
  }, []);

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };
  const showError = (msg) => { setError(msg); setTimeout(() => setError(''), 3000); };

  if (loading) return <div className="p-8 text-center text-[var(--muted)]">Loading settings...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-[var(--text)] mb-6">Settings</h1>

      {(success || error) && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${success ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
          {success || error}
        </div>
      )}

      <div className="flex gap-6">
        <div className="w-44 flex-shrink-0">
          <nav className="space-y-0.5">
            {TABS.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left
                  ${activeTab === key ? 'bg-brand-600 text-white' : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]'}`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          {activeTab === 'profile' && (
            <ProfileTab settings={settings} setSettings={setSettings} setSaving={setSaving} saving={saving} showSuccess={showSuccess} showError={showError} theme={theme} toggleTheme={toggleTheme} />
          )}
          {activeTab === 'ai' && (
            <AiTab settings={settings} setSettings={setSettings} setSaving={setSaving} saving={saving} showSuccess={showSuccess} showError={showError} />
          )}
          {activeTab === 'gmail' && (
            <GmailTab settings={settings} setSettings={setSettings} showSuccess={showSuccess} showError={showError} />
          )}
          {activeTab === 'security' && (
            <SecurityTab setSaving={setSaving} saving={saving} showSuccess={showSuccess} showError={showError} />
          )}
        </div>
      </div>
    </div>
  );
}

function GmailTab({ settings, setSettings, showSuccess, showError }) {
  const handleConnect = async () => {
    try {
      const res = await api.get('/gmail/auth-url');
      window.location.href = res.data.url;
    } catch (e) {
      showError('Failed to get Gmail auth URL');
    }
  };

  const handleDisconnect = async () => {
    try {
      await api.post('/gmail/disconnect');
      setSettings(s => ({ ...s, gmailConnected: false }));
      showSuccess('Gmail disconnected');
    } catch (e) {
      showError('Failed to disconnect Gmail');
    }
  };

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h2 className="font-semibold text-[var(--text)] mb-4">Gmail Integration</h2>
        <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'var(--hover)' }}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${settings?.gmailConnected ? 'bg-green-100 dark:bg-green-950' : 'bg-gray-100 dark:bg-dark-hover'}`}>
              <Mail size={18} className={settings?.gmailConnected ? 'text-green-600' : 'text-[var(--muted)]'} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">
                {settings?.gmailConnected ? '✅ Gmail Connected' : '❌ Gmail Not Connected'}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {settings?.gmailConnected
                  ? `Connected as ${settings.email}`
                  : 'Connect Gmail to send emails from JobFlow AI'}
              </p>
            </div>
          </div>
          {settings?.gmailConnected ? (
            <button onClick={handleDisconnect} className="btn-danger">
              Disconnect
            </button>
          ) : (
            <button onClick={handleConnect} className="btn-primary">
              <Mail size={14} /> Connect Gmail
            </button>
          )}
        </div>

        {!settings?.gmailConnected && (
          <div className="mt-4 p-3 rounded-lg border text-xs text-[var(--muted)]" style={{ borderColor: 'var(--border)' }}>
            <p className="font-semibold text-[var(--text)] mb-1">How it works:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click "Connect Gmail" button</li>
              <li>Login with your Google account</li>
              <li>Allow JobFlow AI to send emails on your behalf</li>
              <li>Come back and use Email Campaigns to send bulk emails</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileTab({ settings, setSettings, setSaving, saving, showSuccess, showError, theme, toggleTheme }) {
  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.updateProfile({
        firstName: settings.firstName, lastName: settings.lastName,
        emailSignature: settings.emailSignature, preferredRoles: settings.preferredRoles,
        preferredLocations: settings.preferredLocations,
      });
      showSuccess('Profile updated successfully');
    } catch (e) {
      showError(e.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h2 className="font-semibold text-[var(--text)] mb-4">Personal Information</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First Name</label>
              <input className="input-field" value={settings?.firstName || ''} onChange={e => setSettings(s => ({ ...s, firstName: e.target.value }))} />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input className="input-field" value={settings?.lastName || ''} onChange={e => setSettings(s => ({ ...s, lastName: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input-field opacity-60 cursor-not-allowed" value={settings?.email || ''} disabled />
            <p className="text-xs text-[var(--muted)] mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="label">Preferred Roles</label>
            <input className="input-field" placeholder="Senior Java Developer, ServiceNow Developer..." value={settings?.preferredRoles || ''} onChange={e => setSettings(s => ({ ...s, preferredRoles: e.target.value }))} />
          </div>
          <div>
            <label className="label">Preferred Locations</label>
            <input className="input-field" placeholder="Bangalore, Noida, Remote..." value={settings?.preferredLocations || ''} onChange={e => setSettings(s => ({ ...s, preferredLocations: e.target.value }))} />
          </div>
          <div>
            <label className="label">Email Signature</label>
            <textarea className="input-field h-24 resize-none text-xs" placeholder="Best regards..." value={settings?.emailSignature || ''} onChange={e => setSettings(s => ({ ...s, emailSignature: e.target.value }))} />
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-[var(--text)] mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--text)]">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
            <p className="text-xs text-[var(--muted)]">Choose your preferred UI theme</p>
          </div>
          <button onClick={toggleTheme} className={`relative w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-brand-600' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${theme === 'dark' ? 'translate-x-6' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

function AiTab({ settings, setSettings, setSaving, saving, showSuccess, showError }) {
  const [show, setShow] = useState({ gemini: false, openai: false, claude: false });
  const [keys, setKeys] = useState({ geminiApiKey: '', openaiApiKey: '', claudeApiKey: '' });
  const [provider, setProvider] = useState(settings?.aiProvider || 'GEMINI');

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { aiProvider: provider };
      if (keys.geminiApiKey) payload.geminiApiKey = keys.geminiApiKey;
      if (keys.openaiApiKey) payload.openaiApiKey = keys.openaiApiKey;
      if (keys.claudeApiKey) payload.claudeApiKey = keys.claudeApiKey;
      await settingsApi.updateAi(payload);
      showSuccess('AI settings saved');
      setKeys({ geminiApiKey: '', openaiApiKey: '', claudeApiKey: '' });
    } catch (e) {
      showError('Failed to save AI settings');
    } finally {
      setSaving(false);
    }
  };

  const PROVIDERS = [
    { key: 'GEMINI', name: 'Google Gemini', desc: 'Free tier available, great for most tasks', color: 'text-blue-600' },
    { key: 'OPENAI', name: 'OpenAI GPT-4', desc: 'Industry standard, best quality', color: 'text-green-600' },
    { key: 'CLAUDE', name: 'Anthropic Claude', desc: 'Excellent for long-form writing', color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h2 className="font-semibold text-[var(--text)] mb-4">AI Provider</h2>
        <div className="space-y-2">
          {PROVIDERS.map(p => (
            <label key={p.key} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${provider === p.key ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30' : 'border-transparent hover:bg-[var(--hover)]'}`} style={provider !== p.key ? { borderColor: 'var(--border)' } : {}}>
              <input type="radio" name="provider" value={p.key} checked={provider === p.key} onChange={() => setProvider(p.key)} className="mt-0.5" />
              <div>
                <p className={`text-sm font-semibold ${p.color}`}>{p.name}</p>
                <p className="text-xs text-[var(--muted)]">{p.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-[var(--text)] mb-1">API Keys</h2>
        <p className="text-xs text-[var(--muted)] mb-4">Keys are stored encrypted. Leave blank to keep existing key.</p>
        <div className="space-y-3">
          {[
            { key: 'geminiApiKey', label: 'Gemini API Key', show: 'gemini', stored: settings?.hasGeminiKey, link: 'https://makersuite.google.com/app/apikey' },
            { key: 'openaiApiKey', label: 'OpenAI API Key', show: 'openai', stored: settings?.hasOpenaiKey, link: 'https://platform.openai.com/api-keys' },
            { key: 'claudeApiKey', label: 'Claude API Key', show: 'claude', stored: settings?.hasClaudeKey, link: 'https://console.anthropic.com/settings/keys' },
          ].map(({ key, label, show: showKey, stored, link }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <label className="label mb-0">{label} {stored && <span className="text-green-600 ml-1">✓ configured</span>}</label>
                <a href={link} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline">Get key →</a>
              </div>
              <div className="relative">
                <input
                  type={show[showKey] ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder={stored ? '••••••••••• (leave blank to keep)' : 'Enter API key...'}
                  value={keys[key]}
                  onChange={e => setKeys(k => ({ ...k, [key]: e.target.value }))}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}>
                  {show[showKey] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary mt-4">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          {saving ? 'Saving...' : 'Save AI Settings'}
        </button>
      </div>
    </div>
  );
}

function SecurityTab({ setSaving, saving, showSuccess, showError }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState(false);

  const handleChange = async () => {
    if (form.newPassword !== form.confirmPassword) { showError('Passwords do not match'); return; }
    if (form.newPassword.length < 6) { showError('Password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      await settingsApi.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      showSuccess('Password changed successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
      showError(e.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-5">
      <h2 className="font-semibold text-[var(--text)] mb-4">Change Password</h2>
      <div className="space-y-3 max-w-sm">
        <div>
          <label className="label">Current Password</label>
          <div className="relative">
            <input type={show ? 'text' : 'password'} className="input-field pr-10" value={form.currentPassword} onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" onClick={() => setShow(!show)}>
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
        <div>
          <label className="label">New Password</label>
          <input type={show ? 'text' : 'password'} className="input-field" value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} />
        </div>
        <div>
          <label className="label">Confirm New Password</label>
          <input type={show ? 'text' : 'password'} className="input-field" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} />
        </div>
        <button onClick={handleChange} disabled={saving || !form.currentPassword || !form.newPassword} className="btn-primary">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
          {saving ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </div>
  );
}