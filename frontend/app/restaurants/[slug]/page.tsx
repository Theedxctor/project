'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';

interface Food { id: number; name: string; price: number; category: string; image_path: string | null; is_available: boolean; restaurant_id: number; }
interface Restaurant { id: number; name: string; slug: string; status: string; }

const CATEGORIES = ['Morning', 'Evening', 'All-day'];

export default function RestaurantPage() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>('');
  const [added, setAdded] = useState<number | null>(null);

  useEffect(() => {
    api.get(`/restaurants/${slug}/menu`).then(r => {
      setRestaurant(r.data.restaurant);
      setFoods(r.data.foods);
      setTab(r.data.menu_category);
    }).finally(() => setLoading(false));
  }, [slug]);

  const handleAdd = (food: Food) => {
    addItem({ id: food.id, name: food.name, price: food.price, restaurantId: food.restaurant_id });
    setAdded(food.id);
    setTimeout(() => setAdded(null), 1500);
  };

  const allFoods = foods;
  const filtered = tab === 'All' ? allFoods : allFoods.filter(f => f.category === tab || f.category === 'All-day');

  if (loading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#7070a0' }}>Loading menu...</div>;

  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0f' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#1c1c27,#13131a)', borderBottom:'1px solid #2a2a3a', padding:'2rem 1.5rem' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <h1 style={{ fontSize:'2rem', fontWeight:800, marginBottom:'0.4rem' }}>{restaurant?.name}</h1>
          <span style={{ background: restaurant?.status==='Open' ? 'rgba(0,212,170,0.15)' : 'rgba(255,107,107,0.15)', color: restaurant?.status==='Open' ? '#00d4aa' : '#ff6b6b', border: `1px solid ${restaurant?.status==='Open' ? 'rgba(0,212,170,0.3)' : 'rgba(255,107,107,0.3)'}`, padding:'0.3rem 0.9rem', borderRadius:100, fontSize:'0.8rem', fontWeight:700 }}>
            ● {restaurant?.status}
          </span>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'2rem 1.5rem' }}>
        {restaurant?.status === 'Closed' ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Currently Closed</h2>
            <p style={{ color: '#7070a0' }}>This restaurant is currently closed. Please check back later.</p>
          </div>
        ) : (
          <>
            {/* Category tabs */}
            <div style={{ display:'flex', gap:'0.75rem', marginBottom:'2rem', flexWrap:'wrap' }}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setTab(cat)} style={{ padding:'0.5rem 1.25rem', borderRadius:100, border:'1px solid', borderColor: tab===cat ? '#6c63ff' : '#2a2a3a', background: tab===cat ? 'rgba(108,99,255,0.15)' : 'transparent', color: tab===cat ? '#6c63ff' : '#7070a0', fontWeight:600, cursor:'pointer', transition:'all 0.2s', fontSize:'0.9rem' }}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Food grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'1.5rem' }}>
              {filtered.map(food => (
                <div key={food.id} style={{ background:'#13131a', border:'1px solid #2a2a3a', borderRadius:18, overflow:'hidden', transition:'transform 0.2s', opacity: food.is_available ? 1 : 0.5 }}>
                  <div style={{ height:130, background:'linear-gradient(135deg,#1c1c27,#2a2a3a)', borderBottom:'1px solid #2a2a3a' }} />
                  <div style={{ padding:'1rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.5rem' }}>
                      <h3 style={{ fontWeight:700, fontSize:'1rem' }}>{food.name}</h3>
                      <span style={{ background:'rgba(108,99,255,0.15)', color:'#6c63ff', padding:'0.15rem 0.5rem', borderRadius:6, fontSize:'0.7rem', fontWeight:600 }}>{food.category}</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'0.75rem' }}>
                      <span style={{ fontWeight:800, fontSize:'1.1rem', color:'#00d4aa' }}>KES {food.price}</span>
                      <button onClick={() => handleAdd(food)} disabled={!food.is_available || added === food.id}
                        style={{ background: added===food.id ? '#00d4aa' : 'linear-gradient(135deg,#6c63ff,#8b5cf6)', border:'none', color:'#fff', padding:'0.45rem 1rem', borderRadius:10, fontWeight:700, cursor:'pointer', fontSize:'0.85rem', transition:'all 0.2s' }}>
                        {added===food.id ? '✓ Added' : food.is_available ? '+ Add' : 'Unavailable'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filtered.length === 0 && <p style={{ color:'#7070a0', textAlign:'center', marginTop:'3rem', fontSize:'1.1rem' }}>No items available in this category right now.</p>}
          </>
        )}
      </div>
      <CartDrawer />
    </div>
  );
}
