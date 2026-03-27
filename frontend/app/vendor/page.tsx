'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Order { id: number; total: number; status: string; pickup_code: string | null; user: { name: string }; created_at: string; items: { food: { name: string }; quantity: number }[]; }

const STATUS_COLORS: Record<string, string> = { Pending: '#f59e0b', Paid: '#6c63ff', Ready: '#00d4aa', 'Picked Up': '#7070a0' };

export default function VendorPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'Vendor_Staff')) { router.push('/'); return; }
    if (user) api.get('/orders').then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, [user, isLoading, router]);

  const updateStatus = async (id: number, status: string) => {
    const res = await api.patch(`/orders/${id}/status`, { status });
    setOrders(prev => prev.map(o => o.id === id ? res.data : o));
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (isLoading || loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7070a0' }}>Loading...</div>;

  const counts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Vendor Dashboard</h1>
          <p style={{ color: '#7070a0' }}>Manage incoming orders</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {['Pending','Paid','Ready','Picked Up'].map(s => (
            <div key={s} onClick={() => setFilter(filter === s ? 'all' : s)} style={{ background: '#13131a', border: `1px solid ${filter === s ? STATUS_COLORS[s] : '#2a2a3a'}`, borderRadius: 14, padding: '1.25rem', cursor: 'pointer', transition: 'border-color 0.2s' }}>
              <p style={{ color: '#7070a0', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: 500 }}>{s}</p>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: STATUS_COLORS[s] }}>{counts[s] || 0}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(order => (
            <div key={order.id} style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 16, padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <p style={{ fontWeight: 700 }}>{order.user?.name} · <span style={{ color: '#7070a0' }}>#{order.id}</span></p>
                  <p style={{ color: '#7070a0', fontSize: '0.85rem', margin: '0.25rem 0' }}>
                    {order.items?.map(i => `${i.food?.name} ×${i.quantity}`).join(', ')}
                  </p>
                  <p style={{ color: '#6c63ff', fontWeight: 700 }}>KES {Number(order.total).toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {order.pickup_code && (
                    <span style={{ fontFamily: 'monospace', background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.3)', padding: '0.3rem 0.75rem', borderRadius: 8, fontWeight: 900, letterSpacing: 3, fontSize: '1.1rem' }}>{order.pickup_code}</span>
                  )}
                  {order.status === 'Paid' && (
                    <button onClick={() => updateStatus(order.id, 'Ready')}
                      style={{ background: 'linear-gradient(135deg,#00d4aa,#00b894)', border: 'none', color: '#fff', padding: '0.5rem 1.2rem', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
                      ✅ Mark Ready
                    </button>
                  )}
                  <span style={{ background: `${STATUS_COLORS[order.status]}18`, color: STATUS_COLORS[order.status], border: `1px solid ${STATUS_COLORS[order.status]}50`, padding: '0.35rem 0.8rem', borderRadius: 100, fontWeight: 700, fontSize: '0.8rem' }}>{order.status}</span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p style={{ color: '#7070a0', textAlign: 'center', padding: '3rem' }}>No orders in this category.</p>}
        </div>
      </div>
    </div>
  );
}
