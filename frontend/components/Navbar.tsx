'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => { await logout(); router.push('/login'); };

  return (
    <nav style={{ background: 'rgba(13,13,20,0.95)', borderBottom: '1px solid #2a2a3a', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: '1.3rem', background: 'linear-gradient(135deg,#6c63ff,#ff6b6b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>
          🍽 StrathFood
        </Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {!user ? (
            <>
              <Link href="/login" style={{ color: '#7070a0', textDecoration: 'none', fontWeight: 500 }}>Login</Link>
              <Link href="/register" style={{ background: 'linear-gradient(135deg,#6c63ff,#8b5cf6)', color: '#fff', padding: '0.5rem 1.2rem', borderRadius: 10, textDecoration: 'none', fontWeight: 600 }}>Register</Link>
            </>
          ) : (
            <>
              {user.role === 'Student' && <Link href="/dashboard" style={{ color: '#7070a0', textDecoration: 'none', fontWeight: 500 }}>My Orders</Link>}
              {user.role === 'Vendor_Staff' && <Link href="/vendor" style={{ color: '#7070a0', textDecoration: 'none', fontWeight: 500 }}>Vendor Panel</Link>}
              {user.role === 'Admin' && <Link href="/admin" style={{ color: '#7070a0', textDecoration: 'none', fontWeight: 500 }}>Admin Panel</Link>}
              <span style={{ color: '#6c63ff', fontWeight: 600, fontSize: '0.85rem' }}>{user.name}</span>
              <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #2a2a3a', color: '#7070a0', padding: '0.4rem 1rem', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
