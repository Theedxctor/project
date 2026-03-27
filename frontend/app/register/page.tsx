'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/register', form);
      await login(form.email, form.password);
      router.push('/');
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response?.data;
      if (errData?.errors) setError(Object.values(errData.errors).flat()[0] as string);
      else setError(errData?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'radial-gradient(ellipse at top,#1a1a2e 0%,#0a0a0f 70%)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Create account</h1>
          <p style={{ color: '#7070a0' }}>Strathmore students & staff only</p>
        </div>
        <div className="card glass">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', padding: '0.75rem 1rem', borderRadius: 10, fontSize: '0.9rem' }}>{error}</div>}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#7070a0', fontSize: '0.85rem', fontWeight: 500 }}>Full Name</label>
              <input className="input-field" placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#7070a0', fontSize: '0.85rem', fontWeight: 500 }}>Strathmore Email</label>
              <input className="input-field" type="email" placeholder="you@strathmore.edu" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#7070a0', fontSize: '0.85rem', fontWeight: 500 }}>Password</label>
              <input className="input-field" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#7070a0', fontSize: '0.85rem', fontWeight: 500 }}>Confirm Password</label>
              <input className="input-field" type="password" placeholder="Repeat password" value={form.password_confirmation} onChange={e => setForm({...form, password_confirmation: e.target.value})} required />
            </div>
            <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#7070a0', fontSize: '0.9rem' }}>
            Already have an account? <Link href="/login" style={{ color: '#6c63ff', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
