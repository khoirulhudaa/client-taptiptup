import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Target } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL;

// ── Miles 1 (default) ──────────────────────────────────────
export const Miles1 = ({ displayList, totalDonation, activeIdx, color, bgcolor }) => {
    const getBarBg = (achieved) => {
      if (achieved) return '#10b981';
      if (color) return `#${color}`;
      return 'linear-gradient(90deg,#6366f1,#8b5cf6)';
    };
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <div style={{ background: bgcolor ? `#${bgcolor}` : 'rgba(15,15,25,1)', borderRadius: 20, padding: '18px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, position: 'relative', left: '-2px' }}>
          <span style={{ fontSize: 23 }}>🎯</span>
          <span style={{ fontSize: 20, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'white', bgcolor: 'rgba(255,255,255,0.5)' }}>
            Milestones
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 22, fontWeight: 800, color: '#10b981' }}>
            Rp {Number(totalDonation).toLocaleString('id-ID')}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {displayList.map((m, i) => {
            const pct = Math.min(100, Math.round((totalDonation / m.targetAmount) * 100));
            const achieved = totalDonation >= m.targetAmount;
            return (
              <div key={m._id || i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {achieved && <span style={{ fontSize: 20 }}>✅</span>}
                    <span style={{ fontSize: 22, fontWeight: 700, color: '#ffffff', textDecoration: achieved ? 'line-through' : 'none' }}>
                      {m.title}
                    </span>
                  </div>
                  <span style={{ fontSize: 20, fontWeight: 800, color: achieved ? '#10b981' : 'rgba(255,255,255,0.4)' }}>
                    {achieved ? '✓' : `${pct}%`}
                  </span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.12)', borderRadius: 0, overflow: 'hidden', minWidth: 460  }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: getBarBg(achieved), transition: 'width 1s ease' }} />
                </div>
                <div style={{ gap: 10, marginTop: 15, display: 'flex', justifyContent: 'end', alignItems: 'center', fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,1)', }}>
                  <Target size={20} style={{position: 'relative', top: '0.6px'}} />
                  <span>
                    Rp {Number(m.targetAmount).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
};

// ── Miles 2 (minimalis per card) ───────────────────────────
export const Miles2 = ({ displayList, totalDonation, color, bgcolor }) => {
   const getBarBg = (achieved) => {
      if (achieved) return '#10b981';
      if (color) return `#${color}`;
      return 'linear-gradient(90deg,#6366f1,#8b5cf6)';
    };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: 'fit-content', fontFamily: "'Inter','Segoe UI',sans-serif", gap: 8 }}>
        {displayList.map((m, i) => {
          const pct = Math.min(100, Math.round((totalDonation / m.targetAmount) * 100));
          const achieved = totalDonation >= m.targetAmount;
          return (
            <div key={m._id || i} style={{ background: bgcolor ? `#${bgcolor}` : 'rgba(15,15,25,1)', borderRadius: 18, padding: '14px 18px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', textAlign: 'center' }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: achieved ? '#10b981' : '#ffffff', textDecoration: achieved ? 'line-through' : 'none', display: 'block', marginBottom: 18 }}>
                {achieved ? '✅ ' : ''}{m.title}
              </span>

              {/* Progress bar dengan persentase di dalam */}
              <div style={{ position: 'relative', height: 54, background: 'rgba(255,255,255,0.1)', borderRadius: 8, overflow: 'hidden', minWidth: 460  }}>
                <div style={{ height: '100%', width: `${pct}%`, background: getBarBg(achieved), borderRadius: 4, transition: 'width 1s ease' }} />
                <span style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 800, color: '#ffffff',
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  top: '-2px'
                }}>
                  {achieved ? 'Tercapai! ✓' : `${pct}%`}
                </span>
              </div>

              {/* Nominal sekarang / target */}
              <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: achieved ? '#10b981' : 'rgba(255,255,255,0.6)' }}>
                  Rp {Math.min(totalDonation, m.targetAmount).toLocaleString('id-ID')}
                </span>
                <span style={{ fontSize: 18, fontWeight: 600, color: achieved ? '#10b981' : 'rgba(255,255,255,0.6)' }}>
                  / Rp {Number(m.targetAmount).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    )
};

// ── Widget utama ───────────────────────────────────────────
const MilestonesWidget = () => {
  const { token } = useParams();
  const [milestones, setMilestones] = useState([]);
  const [totalDonation, setTotalDonation] = useState(0);
  const [theme, setTheme] = useState('miles1');
  const [color, setColor] = useState(null);
  const [bgcolor, setBgcolor] = useState(null); 

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTheme(params.get('theme') || 'miles1');
    setColor(params.get('color') || null);
    setBgcolor(params.get('bgcolor') || null);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [msRes, statsRes] = await Promise.all([
        axios.get(`${BASE_URL}/widget/${token}/milestones`),
        axios.get(`${BASE_URL}/widget/${token}/stats`).catch(() => ({ data: { total: 0 } })),
      ]);
      setMilestones(msRes.data || []);
      setTotalDonation(statsRes.data?.total || 0);
    } catch (err) {
      console.error('Failed to fetch milestones');
    }
  }, [token]);

  useEffect(() => { if (token) fetchData(); }, [token]);

  useEffect(() => {
    if (!token) return;
    const socket = io(BASE_URL);
    socket.emit('join-room', token);
    socket.emit('join-room', `${token}-mediashare`);
    socket.on('new-donation', fetchData);
    socket.on('new-media-donation', fetchData);
    return () => socket.disconnect();
  }, [token, fetchData]);

  if (!milestones.length) return <div style={{ background: 'transparent' }} />;

  const sorted = [...milestones].sort((a, b) => a.targetAmount - b.targetAmount);
  const activeIdx = sorted.findIndex(m => totalDonation < m.targetAmount);
  const displayList = activeIdx === -1
    ? sorted.slice(-3)
    : sorted.slice(Math.max(0, activeIdx - 1), activeIdx + 2);

  return (
    <>
      <style>{`
        html, body { margin: 0 !important; padding: 0 !important; background: transparent !important; overflow: hidden !important; }
      `}</style>
      <div className="space-y-2">
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Preview</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {['miles1', 'miles2'].map(t => (
            <div key={t} className="space-y-1.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t === 'miles1' ? 'Miles 1' : 'Miles 2'}</p>
              <div className="flex justify-center overflow-auto p-2 rounded-lg" style={{ background: `#${mlBgcolor}` }}>
                {t === 'miles1'
                  ? <Miles1 displayList={list.slice(0, 3)} totalDonation={0} activeIdx={0} color={mlColor} bgcolor={mlBgcolor} />
                  : <Miles2 displayList={list.slice(0, 2)} totalDonation={0} color={mlColor} bgcolor={mlBgcolor} />
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MilestonesWidget;