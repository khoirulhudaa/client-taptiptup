// SubathonWidget.jsx
// Route: /widget/:token/subathon
// Pasang di OBS sebagai Browser Source — ukuran 360x200px
// Background transparan otomatis

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

const formatSeconds = (s) => {
  if (!s && s !== 0) return '00:00:00';
  const totalSec = Math.max(0, Math.floor(s));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const sec = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const SubathonWidget = () => {
  const { token } = useParams();
  const [timer, setTimer] = useState(null);
  const [displaySeconds, setDisplaySeconds] = useState(0);
  const intervalRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    if (!token) return;
    axios.get(`${BASE_URL}/api/subathon/public/${token}`)
      .then(res => {
        setTimer(res.data);
        setDisplaySeconds(res.data.currentSeconds || 0);
      })
      .catch(() => console.error('Token tidak valid'));
  }, [token]);

  // Client-side countdown
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timer?.isRunning && timer?.mode === 'countdown') {
      intervalRef.current = setInterval(() => {
        setDisplaySeconds(s => Math.max(0, s - 1));
      }, 1000);
    } else if (timer?.isRunning && timer?.mode === 'countup') {
      intervalRef.current = setInterval(() => {
        setDisplaySeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [timer?.isRunning, timer?.mode]);

  // Real-time socket
  useEffect(() => {
  if (!token) return;
    const socket = io(BASE_URL);
    socket.emit('join-room', token);
    socket.on('subathon-updated', (data) => {
      setTimer(data);
      setDisplaySeconds(data.currentSeconds || 0); // ← pakai `data`, bukan `timer`
    });
    return () => socket.disconnect();
  }, [token]);

  if (!timer) return null;

  const progressPct = timer.initialSeconds > 0
    ? Math.min(100, (displaySeconds / timer.initialSeconds) * 100)
    : 0;

  const progressColor = progressPct > 50
    ? '#22c55e'
    : progressPct > 20
    ? '#f59e0b'
    : '#ef4444';

  const isLow = progressPct <= 20 && timer.mode === 'countdown';

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: 'transparent',
      borderRadius: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      <div style={{
        background: '#0f0f19',
        borderRadius: 20,
        padding: '20px 28px',
        minWidth: 280,
        border: `2px solid ${isLow ? '#ef444460' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: isLow
          ? '0 0 30px rgba(239,68,68,0.3)'
          : '0 8px 32px rgba(0,0,0,0.5)',
        transition: 'border 0.5s, box-shadow 0.5s',
      }}>
        {/* Title */}
        <p style={{
          color: 'white',
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: 6,
          margin: '0 0 6px 0',
        }}>
          {timer.title || 'Subathon Timer'}
        </p>

        {/* Timer */}
        <div style={{
          fontSize: 52,
          fontWeight: 900,
          color: isLow ? '#ef4444' : '#ffffff',
          letterSpacing: -2,
          fontVariantNumeric: 'tabular-nums',
          fontFamily: 'monospace',
          lineHeight: 1,
          margin: '4px 0 12px',
          transition: 'color 0.5s',
          animation: isLow ? 'pulse 1s ease-in-out infinite' : 'none',
        }}>
          {formatSeconds(displaySeconds)}
        </div>

        {/* Progress bar */}
        {timer.mode === 'countdown' && (
          <div style={{
            height: 4,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 0,
            overflow: 'hidden',
            marginBottom: 8,
          }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              background: progressColor,
              borderRadius: 0,
              transition: 'width 1s linear, background 0.5s',
            }} />
          </div>
        )}

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '0',
            background: timer.isRunning ? '#22c55e' : '#64748b',
            display: 'inline-block',
            animation: timer.isRunning ? 'pulse 1.5s ease-in-out infinite' : 'none',
          }} />
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            color: timer.isRunning ? '#22c55e' : 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            {timer.isRunning ? 'Live' : 'Paused'}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default SubathonWidget;