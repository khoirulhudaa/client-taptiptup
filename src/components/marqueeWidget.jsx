import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const MEDALS = ['🥇', '🥈', '🥉'];

const MarqueeWidget = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();

  const mode      = searchParams.get('mode')      || 'top';  // 'top' | 'recent'
  const limit     = Math.min(parseInt(searchParams.get('limit'))    || 10, 20);
  const speed     = Math.min(parseInt(searchParams.get('speed'))    || 40, 200);
  const bg        = searchParams.get('bg')        || 'transparent';
  const color     = searchParams.get('color')     || '#ffffff';
  const highlight = searchParams.get('highlight') || '#4da6ff';
  const fontSize  = Math.min(parseInt(searchParams.get('fontSize')) || 16, 36);

  const [items,  setItems]  = useState([]);
  const [ready,  setReady]  = useState(false);

  const trackRef = useRef(null);
  const animRef  = useRef(null);
  const posRef   = useRef(0);
  const lastRef  = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchData = async () => {
    try {
      const endpoint = mode === 'recent'
        ? `${API_URL}/api/marquee/${token}/recent?limit=${limit}`
        : `${API_URL}/api/marquee/${token}/top-donors?limit=${limit}`;

      const res  = await fetch(endpoint);
      const data = await res.json();

      // normalise ke shape { name, amount, sub }
      if (mode === 'recent') {
        setItems((data.donations || []).map(d => ({
          name:    d.donorName,
          amount:  d.amount,
          sub:     d.message || null,
          isRecent: true,
        })));
      } else {
        setItems((data.donors || []).map(d => ({
          name:    d.donorName,
          amount:  d.totalAmount,
          sub:     `${d.count}x`,
          isRecent: false,
        })));
      }
    } catch (err) {
      console.error('[MarqueeWidget] fetch error:', err);
    } finally {
      setReady(true);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, [token, limit, mode]);

  // ── Infinite scroll animation ──────────────────────────────
  useEffect(() => {
    const el = trackRef.current;
    if (!el || items.length === 0) return;

    posRef.current = 0;
    lastRef.current = null;
    if (animRef.current) cancelAnimationFrame(animRef.current);

    const animate = (ts) => {
      if (!lastRef.current) lastRef.current = ts;
      const dt = ts - lastRef.current;
      lastRef.current = ts;

      posRef.current -= (speed * dt) / 1000;

      const half = el.scrollWidth / 2;
      if (half > 0 && Math.abs(posRef.current) >= half) posRef.current = 0;

      el.style.transform = `translateX(${posRef.current}px)`;
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [items, speed]);

  if (!ready || items.length === 0) return null;

  const stripHeight = fontSize + 24;

  const renderItems = items.map((item, i) => (
    <span
      key={i}
      style={{
        display:     'inline-flex',
        alignItems:  'center',
        gap:         6,
        marginRight: 48,
        whiteSpace:  'nowrap',
        fontSize,
        fontFamily:  "'Courier New', 'Lucida Console', monospace",
      }}
    >
      {/* Badge: medal untuk top donor, nomor urut untuk recent */}
      {item.isRecent
        ? <span style={{ color: highlight }}>#{i + 1}</span>
        : <span style={{ fontSize: fontSize * 1.1 }}>{MEDALS[i] || `#${i + 1}`}</span>
      }

      {/* Nama */}
      <span style={{ fontWeight: 900, color }}>{item.name}</span>

      {/* Nominal */}
      <span style={{ color: highlight, fontWeight: 700 }}>
        Rp {Number(item.amount).toLocaleString('id-ID')}
      </span>

      {/* Sub: count untuk top donor, pesan untuk recent */}
      {item.sub && (
        <span style={{ color, fontSize: fontSize * 0.85 }}>
          {item.isRecent ? `— ${item.sub}` : `(${item.sub})`}
        </span>
      )}
    </span>
  ));

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100vw; overflow: hidden; background: transparent !important; }
      `}</style>

      {/* Wrapper: transparan, ukuran pas dengan marquee */}
      <div
        style={{
          width:      '100vw',
          height:     stripHeight,
          background: bg,
          display:    'flex',
          alignItems: 'center',
          overflow:   'hidden',
        }}
      >
        <div
          ref={trackRef}
          style={{
            display:    'inline-flex',
            alignItems: 'center',
            willChange: 'transform',
            flexShrink: 0,
            height:     '100%',
          }}
        >
          {renderItems}
          {renderItems}
        </div>
      </div>
    </>
  );
};

export default MarqueeWidget;