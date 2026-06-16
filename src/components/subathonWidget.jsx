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

// ── Subath 1 (default) ─────────────────────────────────────
export const Subath1 = ({ timer, displaySeconds, timerColor, bgColor, labelColor }) => {
  const progressPct = timer.initialSeconds > 0
    ? Math.min(100, (displaySeconds / timer.initialSeconds) * 100) : 0;
  const progressColor = progressPct > 50 ? '#22c55e' : progressPct > 20 ? '#f59e0b' : '#ef4444';
  const isLow = progressPct <= 20 && timer.mode === 'countdown';

  return (
    <div style={{
      background: bgColor ? `#${bgColor}` : '#0f0f19',
      borderRadius: 20, padding: '16px 16px 14px 16px',
      minWidth: 280, fontFamily: "'Inter','Segoe UI',sans-serif",
      border: `2px solid ${isLow ? '#ef444460' : 'rgba(255,255,255,0.08)'}`,
      boxShadow: isLow ? '0 0 30px rgba(239,68,68,0.3)' : '0 8px 32px rgba(0,0,0,0.5)',
      transition: 'border 0.5s, box-shadow 0.5s',
    }}>
      <p style={{ color: labelColor ? `#${labelColor}` : 'white', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 6px 0' }}>
        {timer.title || 'Subathon Timer'}
      </p>
      <div style={{
        fontSize: 52, fontWeight: 900,   color: timerColor ? `#${timerColor}` : (isLow ? '#ef4444' : '#ffffff'),
        letterSpacing: -2, fontFamily: 'monospace', lineHeight: 1, margin: '0 0 12px',
        transition: 'color 0.5s',
        animation: isLow ? 'pulse 1s ease-in-out infinite' : 'none',
      }}>
        {formatSeconds(displaySeconds)}
      </div>
      {timer.mode === 'countdown' && (
        <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 0, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: progressColor, transition: 'width 1s linear, background 0.5s' }} />
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: 0, background: timer.isRunning ? '#22c55e' : '#64748b', display: 'inline-block', animation: timer.isRunning ? 'pulse 1.5s ease-in-out infinite' : 'none' }} />
        <span style={{ fontSize: 10, fontWeight: 600, color: timer.isRunning ? '#22c55e' : 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {timer.isRunning ? 'Live' : 'Paused'}
        </span>
      </div>
    </div>
  );
};

// ── Subath 2 (LCD digital merah) ───────────────────────────
export const Subath2 = ({ displaySeconds, isRunning, timerColor, bgColor, labelColor }) => {
  const time = formatSeconds(displaySeconds);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        @keyframes seg-blink { 0%,49%{opacity:1} 50%,100%{opacity:0.15} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .seg-colon { animation: seg-blink 1s step-start infinite; }
      `}</style>
      <div style={{
        display: 'inline-block',
        background: bgColor ? `#${bgColor}` : '#080808',
        borderRadius: 16,
        padding: '14px 5px 20px 14px',
        width: 'max-content',
        border: '1.5px solid rgba(255,60,0,0.15)',
      }}>
        {/* Ghost digits (bayangan segmen mati) */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <p style={{ fontSize: 12, color: labelColor ? `#${labelColor}` : 'white', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 30px 0' }}>
            {'Subathon Timer'}
          </p>
          {/* Digit aktif */}
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 60,
            fontWeight: 400,
            color: timerColor ? `#${timerColor}` : (isRunning ? '#ff3200' : '#7a1800'),
            width: '100%',
            letterSpacing: 8,
            lineHeight: 1,
            textShadow: timerColor ? 'none' : (isRunning ? '0 0 10px ...' : '...'),
            transition: 'color 0.5s, text-shadow 0.5s',
            userSelect: 'none',
            position: 'relative',
          }}>
            {time.split('').map((ch, i) =>
              ch === ':' ? (
                <span key={i} className="seg-colon">{ch}</span>
              ) : (
                <span key={i}>{ch}</span>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ── Widget utama ───────────────────────────────────────────
const SubathonWidget = () => {
  const { token } = useParams();
  const [timer, setTimer] = useState(null);
  const [displaySeconds, setDisplaySeconds] = useState(0);
  const [theme, setTheme] = useState('subath1');
  const intervalRef = useRef(null);
  const [timerColor, setTimerColor] = useState(null);
  const [bgColor, setBgColor] = useState(null);
  const [labelColor, setLabelColor] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTheme(params.get('theme') || 'subath1');
    setTimerColor(params.get('timercolor') || null);
    setBgColor(params.get('bgcolor') || null);
    setLabelColor(params.get('labelcolor') || null);
  }, []);

  useEffect(() => {
    if (!token) return;
    axios.get(`${BASE_URL}/api/subathon/public/${token}`)
      .then(res => { setTimer(res.data); setDisplaySeconds(res.data.currentSeconds || 0); })
      .catch(() => console.error('Token tidak valid'));
  }, [token]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timer?.isRunning && timer?.mode === 'countdown') {
      intervalRef.current = setInterval(() => setDisplaySeconds(s => Math.max(0, s - 1)), 1000);
    } else if (timer?.isRunning && timer?.mode === 'countup') {
      intervalRef.current = setInterval(() => setDisplaySeconds(s => s + 1), 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [timer?.isRunning, timer?.mode]);

  useEffect(() => {
    if (!token) return;
    const socket = io(BASE_URL);
    socket.emit('join-room', token);
    socket.on('subathon-updated', (data) => { setTimer(data); setDisplaySeconds(data.currentSeconds || 0); });
    return () => socket.disconnect();
  }, [token]);

  if (!timer) return null;

  return (
    <>
      <style>{`
        html, body { margin: 0 !important; padding: 0 !important; background: transparent !important; overflow: hidden !important; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
      {theme === 'subath2'
        ? <Subath2 displaySeconds={displaySeconds} isRunning={timer.isRunning} timerColor={timerColor} bgColor={bgColor} labelColor={labelColor} />
        : <Subath1 timer={timer} displaySeconds={displaySeconds} timerColor={timerColor} bgColor={bgColor} labelColor={labelColor} />
      }
    </>
  );
};

export default SubathonWidget;