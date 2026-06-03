// PollWidget.jsx
// Route: /widget/:token/poll
// Pasang di OBS sebagai Browser Source — ukuran 420x300px
// Background transparan otomatis

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4443'];

const PollWidget = () => {
  const { token } = useParams();
  const [poll, setPoll] = useState(null);
  const [animKey, setAnimKey] = useState(0);

  // Fetch poll aktif
  const fetchPoll = () => {
    if (!token) return;
    axios.get(`${BASE_URL}/api/polls/widget/${token}`)
      .then(res => {
        if (res.data && res.data._id) {
          setPoll(prev => {
            // Trigger re-animation hanya jika poll beda
            if (!prev || prev._id !== res.data._id) setAnimKey(k => k + 1);
            return res.data;
          });
        } else {
          setPoll(null);
        }
      })
      .catch(() => setPoll(null));
  };

  useEffect(() => {
    fetchPoll();
  }, [token]);

  // Real-time socket
  useEffect(() => {
    if (!token) return;
    const socket = io(BASE_URL);
    socket.emit('join-room', token);
    socket.on('poll-updated', (data) => {
      if (data.status === 'active') {
        setPoll(prev => {
          if (!prev || prev._id !== data._id) setAnimKey(k => k + 1);
          return data;
        });
      } else {
        // Poll ditutup
        setPoll(null);
      }
    });
    return () => socket.disconnect();
  }, [token]);

  if (!poll) return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: 'transparent',
    }} />
  );

  const totalVotes = poll.options.reduce((s, o) => s + (o.votes || 0), 0);
  const getPercent = (votes) => totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100);
  const maxVotes = Math.max(...poll.options.map(o => o.votes || 0), 1);

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: 'transparent',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      padding: 0,
    }}>
      <div
        key={animKey}
        style={{
          background: 'rgba(15, 15, 25, 0.92)',
          borderRadius: 0,
          padding: '18px 20px',
          width: '100%',
          border: '1.5px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          animation: 'slideIn 0.4s ease-out',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '0',
            background: '#6366f1',
            display: 'inline-block',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#6366f1',
          }}>
            Poll Aktif
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
            {totalVotes} votes
          </span>
        </div>

        {/* Pertanyaan */}
        <p style={{
          color: '#ffffff',
          fontSize: 14,
          fontWeight: 800,
          margin: '0 0 14px 0',
          lineHeight: 1.3,
        }}>
          {poll.question}
        </p>

        {/* Opsi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {poll.options.map((opt, i) => {
            const pct = getPercent(opt.votes);
            const isLeading = opt.votes === maxVotes && opt.votes > 0;
            const color = COLORS[i % COLORS.length];

            return (
              <div key={opt._id || i} style={{ position: 'relative' }}>
                {/* Background bar */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, bottom: 0,
                  width: `${pct}%`,
                  background: `${color}22`,
                  borderRadius: 0,
                  transition: 'width 0.6s ease',
                  borderLeft: poll.showResults !== false ? `3px solid ${color}` : 'none',
                }} />

                {/* Content */}
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 12px',
                }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isLeading ? '#ffffff' : 'rgba(255,255,255,0.7)',
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {isLeading && '👑 '}{opt.text}
                  </span>

                  {poll.showResults !== false && (
                    <span style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: color,
                      flexShrink: 0,
                    }}>
                      {pct}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {poll.showResults === false && (
          <p style={{
            marginTop: 10,
            fontSize: 9,
            color: 'rgba(255,255,255,0.25)',
            fontWeight: 600,
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            Hasil tersembunyi
          </p>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default PollWidget;