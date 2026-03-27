'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Order { id: number; total: number; status: string; pickup_code: string | null; user: { name: string; email: string }; restaurant: { name: string }; items: { food: { name: string }; quantity: number }[]; created_at: string; }
interface Restaurant { id: number; name: string; slug: string; status: 'Open' | 'Closed'; foods_count: number; }

const STATUS_COLORS: Record<string, string> = { Pending: '#f59e0b', Paid: '#6c63ff', Ready: '#00d4aa', 'Picked Up': '#7070a0' };
const STATUSES = ['Pending', 'Paid', 'Ready', 'Picked Up'];

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [tab, setTab] = useState<'orders' | 'restaurants'>('orders');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'Admin')) { router.push('/'); return; }
    if (user) {
      Promise.all([api.get('/orders'), api.get('/restaurants')]).then(([o, r]) => {
        setOrders(o.data); setRestaurants(r.data);
      }).finally(() => setLoading(false));
    }
  }, [user, isLoading, router]);

  const updateStatus = async (id: number, status: string) => {
    const res = await api.patch(`/orders/${id}/status`, { status });
    setOrders(prev => prev.map(o => o.id === id ? res.data : o));
  };

  const toggleRestaurant = async (r: Restaurant) => {
    const res = await api.patch(`/restaurants/${r.id}`, { status: r.status === 'Open' ? 'Closed' : 'Open' });
    setRestaurants(prev => prev.map(x => x.id === r.id ? res.data : x));
  };

  if (isLoading || loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7070a0' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Admin Panel</h1>
            <p style={{ color: '#7070a0' }}>Manage orders and restaurants</p>
          </div>
          <div style={{ display: 'flex', gap: '1px', background: '#2a2a3a', borderRadius: 12, overflow: 'hidden' }}>
            {(['orders', 'restaurants'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '0.6rem 1.5rem', background: tab === t ? '#6c63ff' : 'transparent', color: tab === t ? '#fff' : '#7070a0', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>{t}</button>
            ))}
          </div>
        </div>

        {tab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.length === 0 && <p style={{ color: '#7070a0', textAlign: 'center', padding: '3rem' }}>No orders yet.</p>}
            {orders.map(order => (
              <div key={order.id} style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 16, padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <p style={{ fontWeight: 700 }}>{order.user?.name} <span style={{ color: '#7070a0', fontWeight: 400 }}>({order.user?.email})</span></p>
                    <p style={{ color: '#7070a0', fontSize: '0.85rem' }}>#{order.id} · {order.restaurant?.name} · KES {Number(order.total).toLocaleString()}</p>
                    <p style={{ color: '#7070a0', fontSize: '0.8rem' }}>{order.items?.map(i => `${i.food?.name}×${i.quantity}`).join(', ')}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {order.pickup_code && <span style={{ fontFamily: 'monospace', background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.3)', padding: '0.3rem 0.75rem', borderRadius: 8, fontWeight: 700, letterSpacing: 3 }}>{order.pickup_code}</span>}
                    <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)}
                      style={{ background: `${STATUS_COLORS[order.status]}18`, color: STATUS_COLORS[order.status], border: `1px solid ${STATUS_COLORS[order.status]}50`, padding: '0.4rem 0.8rem', borderRadius: 10, fontWeight: 700, cursor: 'pointer', outline: 'none', fontSize: '0.85rem' }}>
                      {STATUSES.map(s => <option key={s} value={s} style={{ background: '#13131a', color: '#e8e8f0' }}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'restaurants' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
            {restaurants.map(r => (
              <div key={r.id} style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 16, padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ fontWeight: 700 }}>{r.name}</h3>
                  <span style={{ background: r.status === 'Open' ? 'rgba(0,212,170,0.15)' : 'rgba(255,107,107,0.15)', color: r.status === 'Open' ? '#00d4aa' : '#ff6b6b', padding: '0.2rem 0.7rem', borderRadius: 100, fontSize: '0.75rem', fontWeight: 700 }}>
                    ● {r.status}
                  </span>
                </div>
                <p style={{ color: '#7070a0', fontSize: '0.85rem', marginBottom: '1rem' }}>{r.foods_count} menu items</p>
                <button onClick={() => toggleRestaurant(r)} style={{ width: '100%', padding: '0.6rem', background: r.status === 'Open' ? 'rgba(255,107,107,0.1)' : 'rgba(0,212,170,0.1)', border: `1px solid ${r.status === 'Open' ? 'rgba(255,107,107,0.3)' : 'rgba(0,212,170,0.3)'}`, color: r.status === 'Open' ? '#ff6b6b' : '#00d4aa', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>
                  {r.status === 'Open' ? '🔴 Mark Closed' : '🟢 Mark Open'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
