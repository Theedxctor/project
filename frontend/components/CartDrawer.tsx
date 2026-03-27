'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function CartDrawer() {
  const { items, total, count, removeItem, updateQty, clear, restaurantId } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [paying, setPaying] = useState(false);
  const [orderId, setOrderId] = useState<number|null>(null);
  const [msg, setMsg] = useState('');

  const checkout = async () => {
    if (!user) { router.push('/login'); return; }
    try {
      const res = await api.post('/orders', {
        restaurant_id: restaurantId,
        items: items.map(i => ({ food_id: i.id, quantity: i.quantity }))
      });
      setOrderId(res.data.id);
      setMsg('Order created! Enter your M-Pesa number to pay.');
    } catch { setMsg('Failed to create order.'); }
  };

  const pay = async () => {
    if (!orderId) return;
    setPaying(true); setMsg('');
    try {
      await api.post(`/orders/${orderId}/pay`, { phone });
      setMsg('STK Push sent! Complete payment on your phone.');
      clear();
    } catch (e: unknown) {
      setMsg((e as {response?:{data?:{message?:string}}})?.response?.data?.message || 'Payment failed.');
    } finally { setPaying(false); }
  };

  if (count === 0 && !open) return (
    <button onClick={() => setOpen(true)} style={{ position:'fixed', bottom:24, right:24, background:'linear-gradient(135deg,#6c63ff,#8b5cf6)', color:'#fff', border:'none', borderRadius:50, width:56, height:56, fontSize:'1.2rem', fontWeight:800, cursor:'pointer', boxShadow:'0 8px 24px rgba(108,99,255,0.5)', zIndex:100 }}>
      Cart
    </button>
  );

  return (
    <>
      <button onClick={() => setOpen(true)} style={{ position:'fixed', bottom:24, right:24, background:'linear-gradient(135deg,#6c63ff,#8b5cf6)', color:'#fff', border:'none', borderRadius:50, padding:'0 1.2rem', height:56, fontSize:'1rem', fontWeight:700, cursor:'pointer', boxShadow:'0 8px 24px rgba(108,99,255,0.5)', zIndex:100, display:'flex', alignItems:'center', gap:'0.5rem' }}>
        Cart <span>{count}</span> · <span>KES {total.toLocaleString()}</span>
      </button>

      {open && (
        <div style={{ position:'fixed', inset:0, zIndex:200 }}>
          <div onClick={() => setOpen(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)' }} />
          <div style={{ position:'absolute', right:0, top:0, bottom:0, width:'min(420px,100vw)', background:'#13131a', borderLeft:'1px solid #2a2a3a', display:'flex', flexDirection:'column', padding:'1.5rem', overflow:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1.5rem' }}>
              <h2 style={{ fontWeight:800, fontSize:'1.25rem' }}>Your Cart</h2>
              <button onClick={() => setOpen(false)} style={{ background:'transparent', border:'none', color:'#7070a0', fontSize:'1.4rem', cursor:'pointer' }}>×</button>
            </div>

            {items.length === 0 && !orderId && <p style={{ color:'#7070a0', textAlign:'center', marginTop:'3rem' }}>Your cart is empty</p>}

            {items.map(item => (
              <div key={item.id} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 0', borderBottom:'1px solid #2a2a3a' }}>
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:600 }}>{item.name}</p>
                  <p style={{ color:'#7070a0', fontSize:'0.85rem' }}>KES {item.price} each</p>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  <button onClick={() => updateQty(item.id, item.quantity-1)} style={{ background:'#2a2a3a', border:'none', color:'#e8e8f0', width:28, height:28, borderRadius:8, cursor:'pointer', fontWeight:700 }}>−</button>
                  <span style={{ minWidth:20, textAlign:'center', fontWeight:600 }}>{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity+1)} style={{ background:'#6c63ff', border:'none', color:'#fff', width:28, height:28, borderRadius:8, cursor:'pointer', fontWeight:700 }}>+</button>
                </div>
                <span style={{ fontWeight:700, minWidth:70, textAlign:'right' }}>KES {(item.price*item.quantity).toLocaleString()}</span>
                <button onClick={() => removeItem(item.id)} style={{ background:'transparent', border:'none', color:'#ff6b6b', cursor:'pointer', fontSize:'1.1rem' }}>✕</button>
              </div>
            ))}

            {items.length > 0 && !orderId && (
              <div style={{ marginTop:'auto', paddingTop:'1.5rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:'1.1rem', marginBottom:'1rem' }}>
                  <span>Total</span><span style={{ color:'#6c63ff' }}>KES {total.toLocaleString()}</span>
                </div>
                <button className="btn-primary" onClick={checkout}>Proceed to Pay</button>
              </div>
            )}

            {orderId && (
              <div style={{ marginTop:'1.5rem' }}>
                <p style={{ color:'#00d4aa', fontWeight:600, marginBottom:'1rem' }}>Order #{orderId} created</p>
                <label style={{ display:'block', marginBottom:'0.4rem', color:'#7070a0', fontSize:'0.85rem' }}>M-Pesa Phone Number</label>
                <input className="input-field" placeholder="0712345678" value={phone} onChange={e => setPhone(e.target.value)} style={{ marginBottom:'0.75rem' }}/>
                <button className="btn-primary" onClick={pay} disabled={paying || !phone}>{paying ? 'Sending STK...' : 'Pay with M-Pesa'}</button>
              </div>
            )}

            {msg && <p style={{ marginTop:'1rem', color:'#00d4aa', fontWeight:600, fontSize:'0.9rem', textAlign:'center' }}>{msg}</p>}
          </div>
        </div>
      )}
    </>
  );
}
