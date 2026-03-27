'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface Restaurant { id: number; name: string; slug: string; image: string | null; status: 'Open' | 'Closed'; foods_count: number; }

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/restaurants').then(r => setRestaurants(r.data)).finally(() => setLoading(false)); }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0d0d18 0%,#0a0a0f 100%)' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '5rem 1.5rem 3rem' }}>
        <div style={{ display: 'inline-block', background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 100, padding: '0.4rem 1.2rem', color: '#6c63ff', fontWeight: 600, fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          🎓 Strathmore University
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem,6vw,4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1rem' }}>
          Skip the queue.<br />
          <span style={{ background: 'linear-gradient(135deg,#6c63ff,#ff6b6b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Order ahead.
          </span>
        </h1>
        <p style={{ color: '#7070a0', fontSize: '1.15rem', maxWidth: 480, margin: '0 auto 2.5rem' }}>
          Browse menus from all Strathmore cafeterias, pay via M-Pesa, and pick up with a 6-digit code.
        </p>
        <Link href="/register" style={{ background: 'linear-gradient(135deg,#6c63ff,#8b5cf6)', color: '#fff', padding: '0.9rem 2.5rem', borderRadius: 14, textDecoration: 'none', fontWeight: 700, fontSize: '1.05rem', boxShadow: '0 8px 32px rgba(108,99,255,0.35)', display: 'inline-block' }}>
          Get Started — It&apos;s Free
        </Link>
      </div>

      {/* Restaurants */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem 5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>🏪 Campus Restaurants</h2>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.5rem' }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 220, borderRadius: 20, background: '#13131a', animation: 'pulse 1.5s infinite' }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.5rem' }}>
            {restaurants.map(r => (
              <Link key={r.id} href={`/restaurants/${r.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 20, overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(0,0,0,0.4)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                  {/* Image placeholder */}
                  <div style={{ height: 140, background: 'linear-gradient(135deg,#1c1c27,#2a2a3a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                    {r.name.includes('Java') ? '☕' : r.name.includes('Grill') ? '🔥' : '🍽'}
                  </div>
                  <div style={{ padding: '1.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#e8e8f0' }}>{r.name}</h3>
                      <span style={{ background: r.status === 'Open' ? 'rgba(0,212,170,0.15)' : 'rgba(255,107,107,0.15)', color: r.status === 'Open' ? '#00d4aa' : '#ff6b6b', border: `1px solid ${r.status === 'Open' ? 'rgba(0,212,170,0.3)' : 'rgba(255,107,107,0.3)'}`, padding: '0.2rem 0.7rem', borderRadius: 100, fontSize: '0.75rem', fontWeight: 700 }}>
                        {r.status === 'Open' ? '● Open' : '● Closed'}
                      </span>
                    </div>
                    <p style={{ color: '#7070a0', fontSize: '0.85rem' }}>{r.foods_count} items available</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
