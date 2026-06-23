import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';

const SERVER_URL = 'https://taptiptup-server-1ee47f2895cb.herokuapp.com';

const formatTime = (s) => {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

const EqualizerBars = ({ playing, idle, color = '#60a5fa' }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 18, flexShrink: 0 }}>
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        style={{
          width: 3,
          borderRadius: 2,
          background: idle ? color + '40' : color,
          height: playing ? undefined : 4,
          animation: playing ? `eq${i} ${0.5 + i * 0.15}s ease-in-out infinite alternate` : 'none',
        }}
      />
    ))}
    <style>{`
      @keyframes eq1 { from { height: 4px } to { height: 16px } }
      @keyframes eq2 { from { height: 8px } to { height: 18px } }
      @keyframes eq3 { from { height: 5px } to { height: 14px } }
      @keyframes eq4 { from { height: 10px } to { height: 16px } }
    `}</style>
  </div>
);

const Marquee = ({ text, style }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [dur, setDur] = useState(8);

  useEffect(() => {
    if (!containerRef.current || !textRef.current) return;
    const cw = containerRef.current.offsetWidth;
    const tw = textRef.current.scrollWidth;
    if (tw > cw) { setShouldScroll(true); setDur(Math.max(6, tw / 40)); }
    else setShouldScroll(false);
  }, [text]);

  return (
    <div ref={containerRef} style={{ overflow: 'hidden', whiteSpace: 'nowrap', ...style }}>
      {shouldScroll ? (
        <div style={{ display: 'inline-block', animation: `marquee ${dur}s linear infinite` }}>
          <span ref={textRef} style={{ paddingRight: 60 }}>{text}</span>
          <span style={{ paddingRight: 60 }}>{text}</span>
          <style>{`@keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }`}</style>
        </div>
      ) : (
        <span ref={textRef}>{text}</span>
      )}
    </div>
  );
};

// Shimmer placeholder bar
const ShimmerBar = ({ width = '70%', height = 10, radius = 6, color = '#ffffff' }) => (
  <div style={{
    width, height, borderRadius: radius,
    background: color + '15',
    overflow: 'hidden', position: 'relative', flexShrink: 0,
  }}>
    <div style={{
      position: 'absolute', inset: 0,
      background: `linear-gradient(90deg, transparent 0%, ${color}25 50%, transparent 100%)`,
      animation: 'shimmer 1.8s ease-in-out infinite',
    }} />
    <style>{`@keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }`}</style>
  </div>
);

const SongOverlay = () => {
  const { token } = useParams();

  const [nowPlaying, setNowPlaying] = useState(null);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress]     = useState(0);
  const [config, setConfig]         = useState(null);

  const ytPlayerRef      = useRef(null);
  const playerDivRef     = useRef(null);
  const progressTimerRef = useRef(null);
  const autoResetTimer   = useRef(null);

  // Load config warna
  useEffect(() => {
    if (!token) return;
    fetch(`${SERVER_URL}/api/overlay/config/${token}?slot=A&t=${Date.now()}`)
      .then(r => r.json())
      .then(d => setConfig(d))
      .catch(() => {});
  }, [token]);

  // Init YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
  }, []);

  // Build/rebuild YT player saat nowPlaying berubah
  useEffect(() => {
    if (!nowPlaying?.videoId) return;

    clearInterval(progressTimerRef.current);
    setIsPlaying(false);
    setCurrentTime(0);
    setProgress(0);

    const initPlayer = () => {
      if (ytPlayerRef.current) { ytPlayerRef.current.destroy(); ytPlayerRef.current = null; }
      ytPlayerRef.current = new window.YT.Player(playerDivRef.current, {
        videoId: nowPlaying.videoId,
        playerVars: { autoplay: 1, controls: 0, mute: 0, rel: 0, modestbranding: 1 },
        events: {
            onReady: (e) => {
                if (config?.songRequestVolume != null) {
                e.target.setVolume(config.songRequestVolume);
                }
            },
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              progressTimerRef.current = setInterval(() => {
                const ct = ytPlayerRef.current?.getCurrentTime() || 0;
                const dt = ytPlayerRef.current?.getDuration() || nowPlaying.duration || 0;
                setCurrentTime(ct);
                setProgress(dt > 0 ? (ct / dt) * 100 : 0);
              }, 500);
            } else {
              setIsPlaying(false);
              clearInterval(progressTimerRef.current);
              // Saat selesai → reset ke idle (bukan hilang)
              if (e.data === window.YT.PlayerState.ENDED) {
                autoResetTimer.current = setTimeout(() => {
                  setNowPlaying(null);
                  setCurrentTime(0);
                  setProgress(0);
                }, 3000);
              }
            }
          },
        },
      });
    };

    if (window.YT?.Player) initPlayer();
    else window.onYouTubeIframeAPIReady = initPlayer;

    return () => clearInterval(progressTimerRef.current);
  }, [nowPlaying?.videoId]);

  // Socket
  useEffect(() => {
    if (!token) return;
    const socket = io(SERVER_URL, { reconnection: true, reconnectionAttempts: Infinity, reconnectionDelay: 1500 });
    socket.emit('join-room', token);
    socket.on('new-donation', (data) => {
      if (!data.songData?.videoId) return;
      clearTimeout(autoResetTimer.current);
      clearInterval(progressTimerRef.current);
      setNowPlaying({
        videoId:    data.songData.videoId,
        title:      data.songData.title      || 'Unknown Title',
        artist:     data.songData.artist     || 'Unknown Artist',
        artworkUrl: data.songData.artworkUrl || '',
        duration:   data.songData.duration   || 0,
        donorName:  data.donorName           || 'Seseorang',
      });
      setCurrentTime(0);
      setProgress(0);
    });
    socket.on('settings-updated', () => {
        fetch(`${SERVER_URL}/api/overlay/config/${token}?slot=A&t=${Date.now()}`)
        .then(r => r.json())
        .then(d => {
        setConfig(d);
        if (ytPlayerRef.current?.setVolume && d.songRequestVolume != null) {
            ytPlayerRef.current.setVolume(d.songRequestVolume);
        }
        })
        .catch(() => {});
    });
    return () => { socket.disconnect(); clearInterval(progressTimerRef.current); clearTimeout(autoResetTimer.current); };
  }, [token]);

  const accent      = config?.highlightColor || config?.primaryColor || '#60a5fa';
  const bg          = config?.primaryColor   || '#1e293b';
  const fg          = config?.textColor      || '#ffffff';
  const accentFaint = accent + '22';
  const isIdle      = !nowPlaying;

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'transparent',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start',
      padding: '0 0 24px 24px',
      overflow: 'hidden',
      fontFamily: "'Inter', -apple-system, 'Segoe UI', sans-serif",
    }}>
      {/* Hidden YT player */}
      <div style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none', top: 0 }}>
        <div ref={playerDivRef} />
      </div>

      <motion.div
        key="player-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: 340,
          background: bg,
          borderRadius: 16,
          overflow: 'hidden',
          border: `1px solid ${isIdle ? accent + '18' : accent + '35'}`,
          boxShadow: isIdle
            ? `0 4px 20px rgba(0,0,0,0.4)`
            : `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${accent}18`,
          opacity: isIdle ? 0.72 : 1,
          transition: 'opacity 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease',
        }}
      >
        {/* Top accent line */}
        <div style={{
          height: 3,
          background: isIdle
            ? `linear-gradient(90deg, ${accent}40, ${accent}18)`
            : `linear-gradient(90deg, ${accent}, ${accent}66)`,
          transition: 'background 0.4s ease',
        }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <EqualizerBars playing={isPlaying} idle={isIdle} color={accent} />
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: isIdle ? accent + '60' : accent,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              transition: 'color 0.4s ease',
            }}>
              {isIdle ? 'Waiting for request...' : 'Now Playing'}
            </span>
          </div>
          {!isIdle && (
            <span style={{ fontSize: 10, color: `${fg}60`, fontWeight: 500 }}>
              req. {nowPlaying.donorName}
            </span>
          )}
        </div>

        {/* Album art + info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px 10px' }}>
          {/* Artwork */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {/* Konten */}
            {isIdle ? (
            <div style={{ padding: '14px 14px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: fg + '1A',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 2, fontSize: 16,
                }}>
                    🎵
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: fg, lineHeight: 1.3 }}>
                    Tidak Ada Lagu Yang Diputar
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: `${fg}B3`, marginTop: 3 }}>
                    Kirim hadiah untuk me-request lagu
                    </div>
                </div>
                </div>
                <div style={{ marginTop: 12, height: 5, borderRadius: 999, background: `${fg}26`, overflow: 'hidden' }}>
                <ShimmerBar width="100%" height={5} radius={999} color={fg} />
                </div>
            </div>
            ) : (
            <>
                {/* Header + Album art + info lama (Now Playing) tetap di sini, tidak berubah */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <EqualizerBars playing={isPlaying} idle={isIdle} color={accent} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: accent, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Now Playing
                    </span>
                </div>
                <span style={{ fontSize: 10, color: `${fg}60`, fontWeight: 500 }}>
                    req. {nowPlaying.donorName}
                </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px 10px' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img
                    src={nowPlaying.artworkUrl || ''}
                    alt=""
                    style={{ width: 54, height: 54, borderRadius: 10, objectFit: 'cover', border: `2px solid ${accent}40`, display: 'block' }}
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                    <div style={{ display: 'none', width: 54, height: 54, borderRadius: 10, background: accent + '22', border: `2px solid ${accent}40`, alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎵</div>
                    {isPlaying && (
                    <div style={{ position: 'absolute', inset: -3, borderRadius: 13, border: `2px solid ${accent}`, animation: 'pulse-ring 1.5s ease-in-out infinite' }} />
                    )}
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <Marquee text={nowPlaying.title} style={{ fontSize: 14, fontWeight: 700, color: fg, marginBottom: 3 }} />
                    <Marquee text={nowPlaying.artist} style={{ fontSize: 12, fontWeight: 500, color: `${fg}80` }} />
                </div>
                </div>

                <div style={{ padding: '0 12px 12px' }}>
                <div style={{ height: 4, borderRadius: 999, background: accentFaint, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 999, background: accent, width: `${progress}%`, transition: 'width 0.5s linear' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: `${fg}60` }}>{formatTime(currentTime)}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: `${fg}60` }}>{formatTime(nowPlaying.duration || 0)}</span>
                </div>
                </div>
            </>
            )}
          </div>

          {/* Title + artist */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {isIdle ? (
              <>
                <ShimmerBar width="80%" height={12} color={fg} />
                <ShimmerBar width="55%" height={10} color={fg} />
              </>
            ) : (
              <>
                <Marquee text={nowPlaying.title}  style={{ fontSize: 14, fontWeight: 700, color: fg, marginBottom: 3 }} />
                <Marquee text={nowPlaying.artist} style={{ fontSize: 12, fontWeight: 500, color: `${fg}80` }} />
              </>
            )}
          </div>
        </div>

        {/* Progress bar + timestamp */}
        <div style={{ padding: '0 12px 12px' }}>
          <div style={{ height: 4, borderRadius: 999, background: accentFaint, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 999,
              background: isIdle ? accent + '30' : accent,
              width: isIdle ? '0%' : `${progress}%`,
              transition: 'width 0.5s linear, background 0.4s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: `${fg}${isIdle ? '30' : '60'}` }}>
              {isIdle ? '--:--' : formatTime(currentTime)}
            </span>
            <span style={{ fontSize: 10, fontWeight: 600, color: `${fg}${isIdle ? '30' : '60'}` }}>
              {isIdle ? '--:--' : formatTime(nowPlaying.duration || 0)}
            </span>
          </div>
        </div>

        <style>{`
          @keyframes pulse-ring {
            0%   { opacity: 0.8; transform: scale(1);    }
            50%  { opacity: 0.3; transform: scale(1.05); }
            100% { opacity: 0.8; transform: scale(1);    }
          }
        `}</style>
      </motion.div>
    </div>
  );
};

export default SongOverlay;