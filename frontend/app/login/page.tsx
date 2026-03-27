'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace(user.role === 'Admin' ? '/admin' : user.role === 'Vendor_Staff' ? '/vendor' : '/');
    }
  }, [user, router]);

  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      const u = JSON.parse(localStorage.getItem('sf_user') || '{}');
      router.push(u.role === 'Admin' ? '/admin' : u.role === 'Vendor_Staff' ? '/vendor' : '/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid credentials';
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'radial-gradient(ellipse at top,#1a1a2e 0%,#0a0a0f 70%)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Welcome back</h1>
          <p style={{ color: '#7070a0' }}>Sign in with your Strathmore account</p>
        </div>
        <div className="card glass">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', padding: '0.75rem 1rem', borderRadius: 10, fontSize: '0.9rem' }}>{error}</div>}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#7070a0', fontSize: '0.85rem', fontWeight: 500 }}>Email</label>
              <input className="input-field" type="email" placeholder="you@strathmore.edu" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#7070a0', fontSize: '0.85rem', fontWeight: 500 }}>Password</label>
              <input className="input-field" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#7070a0', fontSize: '0.9rem' }}>
            No account? <Link href="/register" style={{ color: '#6c63ff', fontWeight: 600, textDecoration: 'none' }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
