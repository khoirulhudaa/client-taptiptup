// MilestonesWidget.jsx
// Route: /widget/:token/milestones
// OBS Browser Source — ukuran 400×280px, background transparan

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

const MilestonesWidget = () => {
  const { token } = useParams();
  const [milestones, setMilestones] = useState([]);
  const [totalDonation, setTotalDonation] = useState(0);

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

  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [token]);

  // Real-time update saat donasi masuk
  useEffect(() => {
    if (!token) return;
    const socket = io(BASE_URL);
    socket.emit('join-room', token);
    socket.emit('join-room', `${token}-mediashare`); // ✅ join mediashare room

    const refresh = () => {
      fetchData();
    };

    socket.on('new-donation', refresh);
    socket.on('new-media-donation', refresh);
    return () => socket.disconnect();
  }, [token, fetchData]);

  if (!milestones.length) return (
    <div style={{ width: '100%', height: '100vh', background: 'transparent' }} />
  );

  // Urutkan berdasarkan targetAmount
  const sorted = [...milestones].sort((a, b) => a.targetAmount - b.targetAmount);

  // Cari milestone aktif (belum tercapai pertama)
  const activeIdx = sorted.findIndex(m => totalDonation < m.targetAmount);
  const displayList = activeIdx === -1
    ? sorted.slice(-3)
    : sorted.slice(Math.max(0, activeIdx - 1), activeIdx + 2);

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      // background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      padding: 0,
    }}>
      <div style={{
        background: 'rgba(15, 15, 25, 1)',
        borderRadius: 0,
        padding: '18px 20px',
        // border: '1.5px solid rgba(255,255,255,1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 24 }}>🎯</span>
          <span style={{
            fontSize: 24,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.5)',
          }}>
            Milestones
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 24, fontWeight: 800, color: '#10b981' }}>
            Rp {Number(totalDonation).toLocaleString('id-ID')}
          </span>
        </div>

        {/* Milestone list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {displayList.map((m, i) => {
            const pct = Math.min(100, Math.round((totalDonation / m.targetAmount) * 100));
            const achieved = totalDonation >= m.targetAmount;

            return (
              <div key={m._id || i}>
                {/* Label row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {achieved
                      ? <span style={{ fontSize: 24 }}>✅</span>
                      : <span style={{
                          width: 8, height: 8, borderRadius: '0',
                          background: '#6366f1',
                          display: 'inline-block',
                          animation: !achieved ? 'pulse 1.5s ease-in-out infinite' : 'none',
                        }} />
                    }
                    <span style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: achieved ? 'rgba(255,255,255,1)' : '#ffffff',
                      textDecoration: achieved ? 'line-through' : 'none',
                    }}>
                      {m.title}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: achieved ? '#10b981' : 'rgba(255,255,255,0.4)',
                  }}>
                    {achieved ? '✓' : `${pct}%`}
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{
                  height: 6,
                  background: 'rgba(255,255,255,1)',
                  borderRadius: 0,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: achieved
                      ? '#10b981'
                      : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                    borderRadius: 0,
                    transition: 'width 1s ease',
                  }} />
                </div>

                {/* Target amount */}
                <div style={{
                  marginTop: 4,
                  fontSize: 24,
                  color: 'rgba(255,255,255,1)',
                  fontWeight: 600,
                  textAlign: 'right',
                }}>
                  Target: Rp {Number(m.targetAmount).toLocaleString('id-ID')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default MilestonesWidget;