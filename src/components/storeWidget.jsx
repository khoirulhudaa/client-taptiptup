import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

const StoreWidget = () => {
  const { token } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    axios.get(`${BASE_URL}/api/overlay/store/${token}`)
      .then(res => setProducts(res.data.products || []))
      .catch(err => console.error("Gagal load toko:", err))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div style={{ width: '100%', height: '100vh', background: 'transparent' }} />;

  if (products.length === 0) {
    return (
      <div style={{
        width: '100%', height: '100vh', background: 'rgba(15,23,42,0.95)',
        color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px', fontWeight: 500
      }}>
        🛍️ Toko masih kosong
      </div>
    );
  }

  const p = products[0]; // Hanya 1 produk

  return (
    <div style={{
      width: '100%',
      minHeight: 'max-content',
      // background: 'rgba(10, 10, 20, 0.98)',
      padding: '0px',
      fontFamily: "'Inter', system-ui, sans-serif",
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        display: 'flex',
        background: 'rgba(10, 10, 20, 0.98)',
        borderRadius: '16px',
        overflow: 'hidden',
        maxWidth: 'max-content',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
      }}>
        {/* Gambar Kiri */}
        <div style={{ 
          width: 'max-content', 
          height: '100%', 
          flexShrink: 0,
          padding: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {p.imageUrl ? (
            <img
              src={p.imageUrl}
              alt={p.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
              onError={(e) => e.target.style.display = 'none'}
            />
          ) : (
            <div style={{ fontSize: '90px', opacity: 0.3 }}>🖼️</div>
          )}
        </div>

        {/* Informasi Kanan */}
        <div style={{ padding: '20px 30px 10px 6px', minWidth: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ 
            fontSize: '36px', 
            fontWeight: 700, 
            marginBottom: '12px',
            lineHeight: 1.3 
          }}>
            {p.name}
          </h3>

          <p style={{ 
            fontSize: '32px', 
            fontWeight: 800, 
            color: '#4ade80',
            marginBottom: '20px'
          }}>
            Rp {Number(p.price).toLocaleString('id-ID')}
          </p>

          {p.description && (
            <p style={{ 
              fontSize: '24px', 
              opacity: 0.85,
              lineHeight: 1.6,
              marginBottom: '24px'
            }}>
              {p.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreWidget;