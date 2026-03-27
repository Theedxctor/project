'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

interface Order { id: number; total: number; status: string; pickup_code: string | null; created_at: string; restaurant: { name: string }; items: { food: { name: string }; quantity: number; unit_price: number }[]; }

const STATUS_COLORS: Record<string, string> = { Pending: '#f59e0b', Paid: '#6c63ff', Ready: '#00d4aa', 'Picked Up': '#7070a0' };
const STATUS_ICONS: Record<string, string> = { Pending: '⏳', Paid: '💳', Ready: '✅', 'Picked Up': '🎉' };

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) { router.push('/login'); return; }
    if (user) api.get('/orders/mine').then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, [user, isLoading, router]);

  if (isLoading || loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7070a0' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>My Orders</h1>
          <p style={{ color: '#7070a0' }}>Welcome back, {user?.name}</p>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍽</div>
            <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No orders yet</h2>
            <p style={{ color: '#7070a0', marginBottom: '2rem' }}>Browse restaurants and place your first order!</p>
            <Link href="/" style={{ background: 'linear-gradient(135deg,#6c63ff,#8b5cf6)', color: '#fff', padding: '0.75rem 2rem', borderRadius: 12, textDecoration: 'none', fontWeight: 600 }}>Browse Restaurants</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {orders.map(order => (
              <div key={order.id} style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 18, padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.25rem' }}>{order.restaurant?.name}</h3>
                    <p style={{ color: '#7070a0', fontSize: '0.85rem' }}>Order #{order.id} · {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <span style={{ background: `${STATUS_COLORS[order.status]}20`, color: STATUS_COLORS[order.status], border: `1px solid ${STATUS_COLORS[order.status]}50`, padding: '0.35rem 1rem', borderRadius: 100, fontWeight: 700, fontSize: '0.85rem' }}>
                    {STATUS_ICONS[order.status]} {order.status}
                  </span>
                </div>

                {order.pickup_code && (
                  <div style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.25)', borderRadius: 14, padding: '1.25rem', textAlign: 'center', marginBottom: '1rem' }}>
                    <p style={{ color: '#00d4aa', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pickup Code</p>
                    <p style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '0.3em', color: '#00d4aa' }}>{order.pickup_code}</p>
                    <p style={{ color: '#7070a0', fontSize: '0.8rem', marginTop: '0.5rem' }}>Show this code at the counter</p>
                  </div>
                )}

                <div style={{ borderTop: '1px solid #2a2a3a', paddingTop: '1rem' }}>
                  {order.items?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: '#7070a0', fontSize: '0.9rem', padding: '0.2rem 0' }}>
                      <span>{item.food?.name} × {item.quantity}</span>
                      <span>KES {(item.unit_price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, padding: '0.75rem 0 0', borderTop: '1px solid #2a2a3a', marginTop: '0.5rem' }}>
                    <span>Total</span><span style={{ color: '#6c63ff' }}>KES {Number(order.total).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
