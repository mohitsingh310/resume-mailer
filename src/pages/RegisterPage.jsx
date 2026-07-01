import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const f = (k) => e => setForm(p => ({...p, [k]: e.target.value}));

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { await register(form); }
    catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Mail size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Create Account</h1>
        </div>
        <div className="card p-6">
          {error && <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 text-sm">{error}</div>}
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">First Name</label>
                <input className="input" placeholder="John" value={form.firstName} onChange={f('firstName')} required /></div>
              <div><label className="label">Last Name</label>
                <input className="input" placeholder="Doe" value={form.lastName} onChange={f('lastName')} /></div>
            </div>
            <div><label className="label">Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={f('email')} required /></div>
            <div><label className="label">Password</label>
              <input className="input" type="password" placeholder="Min 6 characters" value={form.password} onChange={f('password')} required minLength={6} /></div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm mt-4" style={{ color: 'var(--muted)' }}>
            Already have an account? <Link to="/login" className="text-brand-600 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
