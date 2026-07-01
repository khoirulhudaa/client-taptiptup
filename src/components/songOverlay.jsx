import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, ListMusic } from 'lucide-react';

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
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '330px', display: 'block' }} ref={textRef}>{text}</span>      

    </div>
  );
};

// ── Komponen kecil: preview lagu berikutnya + ringkasan sisa antrian ──
// Selalu tampil, walau antrian kosong (dengan isi berbeda untuk empty state)
const QueueList = ({ queue, fg, accent, bg }) => {
  const isEmpty = queue.length === 0;
  const next = queue[0];
  const remaining = queue.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={{
        width: 440,
        marginTop: 6,
        background: bg,
        borderRadius: 14,
        overflow: 'hidden',
        border: `1px solid ${accent}30`,
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '9px 18px', borderBottom: `1px solid ${accent}20`,
      }}>
        <ListMusic size={12} color={accent} />
        <span style={{ fontSize: 10, fontWeight: 800, color: fg, opacity: 0.8, letterSpacing: 0.3, textTransform: 'uppercase' }}>
          Berikutnya
        </span>
      </div>

      {isEmpty ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16.5px', marginBottom: 2, marginTop: '1.5px' }}>
          <div style={{
            width: 46, height: 46, padding: 4, border: `2px solid ${fg}30`, borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: fg + '1A', flexShrink: 0,
          }}>
            <Music size={16} color={`${fg}80`} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: `${fg}90` }}>
              Belum ada antrian
            </div>
            <div style={{ fontSize: 10, fontWeight: 500, color: `${fg}60` }}>
              Lagu berikutnya akan muncul di sini
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16.5px' }}>
            <img
              src={next.artworkUrl || ''}
              alt=""
              style={{ width: 46, height: 46, padding: 4, border: '2px solid #ffffff60', borderRadius: 12, objectFit: 'cover', flexShrink: 0, background: fg + '1A' }}
              onError={(e) => { e.target.style.visibility = 'hidden'; }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12, fontWeight: 700, color: fg,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {next.title}
              </div>
              <div style={{
                fontSize: 10, fontWeight: 500, color: `${fg}80`,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                @{next.donorName}
              </div>
            </div>
          </div>

          {remaining > 0 ? (
            <div style={{
              padding: '8px 18px',
              borderTop: `1px solid ${accent}15`,
              fontSize: 10, fontWeight: 700, color: `${fg}70`, textAlign: 'left',
            }}>
              +{remaining} request lainnya dalam antrian
            </div>
          ): (
            <div style={{
              padding: '8px 18px',
              borderTop: `1px solid ${accent}15`,
              fontSize: 10, fontWeight: 700, color: `${fg}70`, textAlign: 'left',
            }}>
              Tidak ada antrian
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

const SongOverlay = () => {
  const { token } = useParams();

  const [nowPlaying, setNowPlaying] = useState(null);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress]     = useState(0);
  const [config, setConfig]         = useState(null);
  const [isSkipping, setIsSkipping] = useState(false);
  const [duration, setDuration]     = useState(0);

  const ytPlayerRef      = useRef(null);
  const playerDivRef     = useRef(null);
  const progressTimerRef = useRef(null);
  const autoResetTimer   = useRef(null);

  // ── TAMBAH: antrian lagu lokal ──────────────────────────
  const songQueueRef     = useRef([]);   // array of song objects
  const nowPlayingRef     = useRef(null); // mirror isPlaying untuk diakses di closure
  const [queueList, setQueueList] = useState([]); // ← state buat render UI antrian

  // Sync ref setiap isPlaying berubah
  useEffect(() => {
    nowPlayingRef.current = nowPlaying;
  }, [nowPlaying]);

  // ── Helper: sync state antrian dari ref ke UI ───────────
  const syncQueueState = () => {
    setQueueList([...songQueueRef.current]);
  };

  // ── Helper: ambil lagu berikutnya dari antrian ──────────
    // ── playNext ───────────────────────────────────────────
  const playNext = useRef(null);
  playNext.current = () => {
    if (songQueueRef.current.length === 0) {
      setNowPlaying(null);
      setCurrentTime(0);
      setProgress(0);
      syncQueueState();
      return;
    }
    const next = songQueueRef.current.shift();
    setNowPlaying(next);
    setCurrentTime(0);
    setProgress(0);
    syncQueueState(); // ← update UI antrian setelah shift
  };

  // ── enqueueSong — baca nowPlayingRef, bukan nowPlaying ─
  const enqueueSong = useRef(null);
  enqueueSong.current = (songData, donorName) => {
    const song = {
      videoId:    songData.videoId,
      title:      songData.title      || 'Untitled',
      artist:     songData.artist     || 'Unknown Artist',
      artworkUrl: songData.artworkUrl || '',
      duration:   songData.duration   || 0,
      donorName:  donorName           || 'Seseorang',
    };

    // ← pakai nowPlayingRef.current, bukan nowPlaying
    if (!nowPlayingRef.current && songQueueRef.current.length === 0) {
      console.log('[SongOverlay] ▶️ Langsung play:', song.title);
      setNowPlaying(song);
      setCurrentTime(0);
      setProgress(0);
    } else {
      songQueueRef.current.push(song);
      console.log(`[SongOverlay] 🎵 Masuk antrian [${songQueueRef.current.length}]:`, song.title);
    }
    syncQueueState(); // ← update UI antrian setiap ada lagu masuk
  };

  // Load config
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

  // Build/rebuild YT player
  useEffect(() => {
    if (!nowPlaying?.videoId) return;

    clearInterval(progressTimerRef.current);
    clearTimeout(autoResetTimer.current);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
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
                setDuration(dt);
                setProgress(dt > 0 ? (ct / dt) * 100 : 0);
              }, 500);
            } else {
              setIsPlaying(false);
              clearInterval(progressTimerRef.current);
              if (e.data === window.YT.PlayerState.ENDED) {
                autoResetTimer.current = setTimeout(() => {
                  playNext.current();
                }, 2000);
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

  const handleSkip = () => {
    if (!nowPlayingRef.current) return;
    setIsSkipping(true);
    
    // Stop player
    if (ytPlayerRef.current) {
      ytPlayerRef.current.stopVideo();
      ytPlayerRef.current.destroy();
      ytPlayerRef.current = null;
    }
    
    clearInterval(progressTimerRef.current);
    clearTimeout(autoResetTimer.current);
    
    setTimeout(() => {
      setIsSkipping(false);
      playNext.current();
    }, 500);
  };

  // Socket — panggil enqueueSong.current, bukan enqueueSong langsung
  useEffect(() => {
    if (!token) return;

    const socket = io(SERVER_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1500
    });

    socket.emit('join-room', token);

    socket.on('new-song-request', (data) => {
      console.log('[SongOverlay] 🎵 new-song-request diterima:', data);
      if (data.songData?.videoId) {
        clearTimeout(autoResetTimer.current);
        enqueueSong.current(data.songData, data.donorName); // ← .current
      }
    });

    socket.on('song-skip', () => {
      console.log('[SongOverlay] ⏭️ Skip dari dashboard');
      handleSkip(); // tidak bisa langsung, pakai ref
    });

    socket.on('new-donation', (data) => {
      if (data.songData?.videoId) {
        console.log('[SongOverlay] Fallback new-donation song');
        enqueueSong.current(data.songData, data.donorName); // ← .current
      }
    });

    socket.on('settings-updated', () => {
      fetch(`${SERVER_URL}/api/overlay/config/${token}?slot=A&t=${Date.now()}`)
        .then(r => r.json())
        .then(d => setConfig(d))
        .catch(() => {});
    });

    return () => {
      socket.disconnect();
      clearInterval(progressTimerRef.current);
      clearTimeout(autoResetTimer.current);
    };
  }, [token]);

  const accent      = config?.highlightColor || config?.songBgColor || config?.primaryColor || '#60a5fa';
  const bg          = config?.songBgColor || config?.primaryColor   || '#0A0F1F';
  const fg          = config?.songTextColor || config?.textColor    || '#ffffff';
  const accentFaint = accent + '22';
  const isIdle      = !nowPlaying;

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'transparent',
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end',
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
          width: 440,
          background: bg,
          marginBottom: 2,
          display: 'flex',
          height: 110, 
          padding: `${isIdle ? '0px' : '12px'} 6px 0px 6px`,
          borderRadius: 16,
          overflow: 'hidden',
          border: `1px solid ${accent}30`,
          boxShadow: isIdle
            ? `0 4px 20px rgba(0,0,0,0.4)`
            : `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${accent}18`,
          // opacity: isIdle ? 0.72 : 1,
          transition: 'opacity 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease',
        }}
      >

        {/* Album art + info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0px 10px', width: '100%' }}>
          {/* Artwork */}
          <div style={{ position: 'relative', flexShrink: 0, width: '100%' }}>
            {/* Konten */}
            {isIdle ? (
            <div style={{ padding: '13px 10px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, position: 'relative' }}>
                    <div style={{
                        width: 46, height: 46, borderRadius: 12,
                        background: fg + '1A',
                        border: `2px solid #ffffff40`,
                        color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: 2, padding: 6,
                    }}>
                        <Music size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 ,position: 'relative', top: 7.5, left: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: fg, lineHeight: 1.3 }}>
                        Tidak Ada Lagu Yang Diputar
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: `${fg}B3`, marginTop: 5 }}>
                        Kirim hadiah untuk me-request lagu
                        </div>
                    </div>
                </div>
                <div style={{width: '100%', height: '4px', background: '#1c223f', borderRadius: '2px', marginTop: '16px'}}></div>
            </div>
            ) : (
            <>
                {/* Header + Album art + info lama (Now Playing) tetap di sini, tidak berubah */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0px 14px 10px' }}>
                <div style={{ position: 'relative', flexShrink: 0, margin: '0px 4px 0px 0px' }}>
                    <img
                    src={nowPlaying.artworkUrl || ''}
                    alt=""
                    style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', border: `2px solid ${accent}40`, display: 'block' }}
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                    <div style={{ color: 'white', display: 'none', width: 54, height: 54, borderRadius: 10, background: accent + '22', border: `2px solid ${accent}40`, alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                        <Music />
                    </div>
                    {isPlaying && (
                    <div style={{ position: 'absolute', inset: -3, borderRadius: 13, border: `2px solid ${accent}`, animation: 'pulse-ring 1.5s ease-in-out infinite' }} />
                    )}
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <Marquee text={nowPlaying.title} style={{ fontSize: 14, fontWeight: 700, color: fg, marginBottom: 0 }} />
                    <div style={{display: 'flex', alignItems: 'center', gap: 3, width: 'max-content'}}>
                    <Marquee text={nowPlaying.artist} style={{ fontSize: 12, fontWeight: 500, color: `${fg}80` }} />
                    <span style={{ fontSize: 12, color: `white`, fontWeight: 500 }}>
                      - Request dari @{nowPlaying.donorName}
                    </span>
                  </div>
                </div>
                </div>

                <div style={{ padding: '0 12px 0px', marginTop: 4, width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: `${fg}60` }}>{formatTime(currentTime)}</span>
                      <div style={{ width: '100%', height: 4, borderRadius: 999, background: accentFaint, overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 999, background: accent, width: `${progress}%`, transition: 'width 0.5s linear' }} />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, color: `${fg}60` }}>
                        {formatTime(duration || nowPlaying.duration || 0)}
                      </span>
                  </div>
                </div>
            </>
            )}
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

      {/* ── Daftar Antrian (di bawah kartu now playing) — selalu tampil ── */}
      <QueueList queue={queueList} fg={fg} accent={accent} bg={bg} />
    </div>
  );
};

export default SongOverlay;