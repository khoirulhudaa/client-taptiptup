import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const MarqueeWidget = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const limit = parseInt(searchParams.get('limit')) || 10;
  const speed = parseInt(searchParams.get('speed')) || 40;
  const bg = searchParams.get('bg') || 'transparent';
  const color = searchParams.get('color') || '#ffffff';
  const highlight = searchParams.get('highlight') || '#4da6ff';
  const fontSize = parseInt(searchParams.get('fontSize')) || 16;

  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const marqueeRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef(0);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchDonors = async () => {
    try {
      const res = await fetch(`${API_URL}/api/marquee/${token}/top-donors?limit=${limit}`);
      const data = await res.json();
      setDonors(data.donors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
    const interval = setInterval(fetchDonors, 30000);
    return () => clearInterval(interval);
  }, [token, limit]);

  useEffect(() => {
    if (!marqueeRef.current || donors.length === 0) return;
    
    const el = marqueeRef.current;
    let lastTime = null;

    const animate = (timestamp) => {
      if (!lastTime) lastTime = timestamp;
      const delta = timestamp - lastTime;
      lastTime = timestamp;

      posRef.current -= (speed * delta) / 1000;
      
      const totalWidth = el.scrollWidth / 2;
      if (Math.abs(posRef.current) >= totalWidth) {
        posRef.current = 0;
      }

      el.style.transform = `translateX(${posRef.current}px)`;
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [donors, speed]);

  const formatAmount = (amount) => {
    const num = Number(amount);
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace('.0', '')}Jt`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace('.0', '')}K`;
    return String(num);
  };

  const medals = ['🥇', '🥈', '🥉'];

  const donorItems = donors.map((donor, i) => (
    <span key={i} style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      marginRight: 48,
      whiteSpace: 'nowrap',
      fontSize,
    }}>
      <span style={{ fontSize: fontSize * 1.1 }}>{medals[i] || `#${i + 1}`}</span>
      <span style={{ fontWeight: 900, color }}>{donor.donorName}</span>
      <span style={{ color: highlight, fontWeight: 700 }}>Rp {Number(donor.totalAmount).toLocaleString('id-ID')}</span>
      <span style={{ color, opacity: 0.5, fontSize: fontSize * 0.8 }}>({donor.count}x)</span>
      <span style={{ color, opacity: 0.2, marginLeft: 16 }}>•</span>
    </span>
  ));

  if (loading) return <div style={{ background: bg, width: '100vw', height: '100vh' }} />;

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: bg,
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      fontFamily: "'Courier New', monospace",
    }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: transparent !important; overflow: hidden; }
      `}</style>
      <div ref={marqueeRef} style={{ display: 'inline-flex', willChange: 'transform' }}>
        {donorItems}
        {donorItems}
      </div>
    </div>
  );
};

export default MarqueeWidget;