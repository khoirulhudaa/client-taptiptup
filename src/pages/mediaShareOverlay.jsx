  import { AnimatePresence, motion } from 'framer-motion';
  import { useCallback, useEffect, useRef, useState } from 'react';
  import { useParams } from 'react-router-dom';
  import { io } from 'socket.io-client';
  import axios from 'axios';

  const API_URL = 'https://taptiptup-server-1ee47f2895cb.herokuapp.com';

  const isTikTokUrl = (url) => {
    if (!url) return false;
    return /tiktok\.com/i.test(url);
  };

  const extractTikTokVideoId = (url) => {
    if (!url) return null;
    // Format: https://www.tiktok.com/@user/video/1234567890
    // Format: https://vm.tiktok.com/XXXXXX/ (short URL — perlu resolve dulu)
    const match = url.match(/tiktok\.com\/@[\w.]+\/video\/(\d+)/);
    return match ? match[1] : null;
  };
  const getTikTokEmbedUrl = (url) => {
    const videoId = extractTikTokVideoId(url);
    if (!videoId) return null;
    // Tambah autoplay=1, loop=1, muted=1
    return `https://www.tiktok.com/embed/v2/${videoId}?autoplay=1&loop=1&muted=1`;
  };

  const isYouTubeLiveUrl = (url) => {
    if (!url) return false;
    return /youtube\.com\/live\//i.test(url);
  };

  const getYouTubeEmbedUrl = (url, startSeconds = 0) => {
    if (!url) return null;
    
    // Sudah embed URL
    if (url.includes('youtube.com/embed/') || url.includes('youtube-nocookie.com/embed/')) {
      // Live embed jangan tambah start
      if (isYouTubeLiveUrl(url)) return url;
      if (startSeconds > 0 && !url.includes('&start=')) {
        return url + (url.includes('?') ? '&' : '?') + `start=${Math.floor(startSeconds)}`;
      }
      return url;
    }

    // ✅ Handle /live/ID — JANGAN tambah start, JANGAN loop
    const liveMatch = url.match(/youtube\.com\/live\/([\w-]+)/);
    if (liveMatch) {
      return `https://www.youtube.com/embed/${liveMatch[1]}?autoplay=1&mute=0&controls=0`;
      // Tidak ada &loop, tidak ada &start — selalu dari live terkini
    }

    const start = startSeconds > 0 ? `&start=${Math.floor(startSeconds)}` : '';

    const watchMatch = url.match(/youtube\.com\/watch\?v=([\w-]+)/);
    if (watchMatch) {
      const id = watchMatch[1];
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&controls=0&loop=1&playlist=${id}${start}`;
    }
    const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
    if (shortMatch) {
      const id = shortMatch[1];
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&controls=0&loop=1&playlist=${id}${start}`;
    }
    const shortsMatch = url.match(/youtube\.com\/shorts\/([\w-]+)/);
    if (shortsMatch) {
      const id = shortsMatch[1];
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&controls=0&loop=1&playlist=${id}${start}`;
    }
    return null;
  };

  const detectMediaType = (url, mediaType) => {
    if (!url) return null;
    
    if (url.includes('youtube.com/embed/') || url.includes('youtube-nocookie.com/embed/')) return 'youtube';
    
    if (
      url.match(/youtube\.com\/watch\?v=/) ||
      url.match(/youtu\.be\//) ||
      url.match(/youtube\.com\/shorts\//) ||
      url.match(/youtube\.com\/live\//)
    ) return 'youtube';

    // ← TAMBAH INI
    if (isTikTokUrl(url)) return 'tiktok';

    if (mediaType === 'video') return 'video';
    if (mediaType === 'image') return 'image';
    if (/\.(mp4|webm|mov|ogg)$/i.test(url)) return 'video';
    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) return 'image';
    return 'image';
  };

  const formatTimestamp = (date) => {
    const d = date ? new Date(date) : new Date();
    return d.toLocaleTimeString('id-ID', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
  };

  const renderIcon = (customIcon, size = 20) => {
    if (!customIcon) return '💜';
    if (customIcon.startsWith('http') || customIcon.startsWith('/')) {
      return <img src={customIcon} alt="icon" style={{ width: size, height: size, objectFit: 'contain', borderRadius: 0 }} />;
    }
    return customIcon;
  };

  const getAlertDuration = (config, amount) => {
    if (!config) return 8000;
    const tiers = config.durationTiers || [];
    if (tiers.length > 0) {
      const sorted = [...tiers].sort((a, b) => b.minAmount - a.minAmount);
      for (const tier of sorted) {
        const inRange = amount >= tier.minAmount &&
          (tier.maxAmount === null || tier.maxAmount === undefined || amount <= tier.maxAmount);
        if (inRange) return tier.duration * 1000;
      }
    }
    return (config.baseDuration || 8) * 1000;
  };

const calculateMediaShareDuration = (config, amount) => {
  if (!config || !amount || amount <= 0) return 15000;

  const base = Number(config.mediaShareBaseDuration) || 15;
  const perAmount = Number(config.mediaShareExtraPerAmount) || 10000;
  const extraDur = Number(config.mediaShareExtraDuration) || 10;

  const extras = perAmount > 0 ? Math.floor(amount / perAmount) : 0;
  const totalSeconds = base + (extras * extraDur);

  console.log(`[MediaShare Duration] Rp ${amount.toLocaleString('id-ID')} → ${base} + ${extras}×${extraDur} = ${totalSeconds} detik`);

  return totalSeconds * 1000;
};

  // ── MediaShareOverlay Component ───────────────────────────────────────────────
  const MediaShareOverlay = () => {
    const { token } = useParams();
    const videoRef = useRef(null);

    const [alert, setAlert]       = useState(null);
    const [config, setConfig]     = useState(null);
    const [progress, setProgress] = useState(100);

    const audioRef            = useRef(null);
    const configRef           = useRef(null);
    const progressIntervalRef = useRef(null);
    const dismissTimerRef     = useRef(null);
    const [mediaError, setMediaError] = useState(false);

    // ==================== LOAD ACTIVE CONFIG ====================
    const loadActiveConfig = useCallback(async (source = 'initial') => {
      try {
        const timestamp = Date.now();
        const resA = await axios.get(`${API_URL}/api/overlay/config/${token}?slot=A&t=${timestamp}`);

        const activeSlot = resA.data?.activeSlot || 'A';
        console.log(`[MediaShare] Active Slot: ${activeSlot} (from ${source})`);

        let finalConfig;
        if (activeSlot === 'A') {
          finalConfig = resA.data;
        } else {
          const resB = await axios.get(`${API_URL}/api/overlay/config/${token}?slot=${activeSlot}&t=${timestamp}`);
          finalConfig = resB.data;
        }

        // if (!configRef.current || finalConfig.slot !== configRef.current.slot) {
        //   console.log(`[MediaShare] ✅ Config di-update ke Slot ${finalConfig.slot}`);
        //   setConfig(finalConfig);
        //   configRef.current = finalConfig;
        // }
        setConfig(finalConfig);
        configRef.current = finalConfig;
      } catch (err) {
        console.error('[MediaShare] Failed to load config:', err);
      }
    }, [token]);

    // Load pertama kali
    useEffect(() => {
      if (!token) return;
      loadActiveConfig('initial');
    }, [token, loadActiveConfig]);

    // ==================== SOCKET ====================
    useEffect(() => {
      if (!token) return;

      const socket = io(API_URL, {
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1500,
        timeout: 10000,
      });

      const joinRooms = () => {
        socket.emit('join-room', token);
        socket.emit('join-room', `${token}-mediashare`);
        console.log(`[MediaShare] ✅ Joined rooms: ${token} | ${token}-mediashare`);
      };

      socket.on('connect', () => {
        console.log(`[MediaShare] 🔌 Connected`);
        joinRooms();
      });

      socket.on('reconnect', () => {
        console.log(`[MediaShare] 🔄 Reconnected`);
        joinRooms();
        loadActiveConfig('reconnect');
      });

      socket.on('new-media-donation', (data) => {
        console.log(`[MediaShare] 📥 Media Donation Diterima!`, data.donorName, 'Rp', data.amount);

        if (configRef.current?.overlayEnabled === false) return;

        const donationWithTime = {
          ...data,
          receivedAt: data.receivedAt || new Date().toISOString(),
        };

        setAlert(donationWithTime);
        setProgress(100);
        setMediaError(false);

        const soundToPlay = data.soundUrl || configRef.current?.soundUrl;
        if (soundToPlay && audioRef.current) {
          audioRef.current.src = soundToPlay;
          audioRef.current.play().catch(() => {});
        }

        const duration = calculateMediaShareDuration(configRef.current, Number(donationWithTime.amount));

        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);

        const startTime = Date.now();
        progressIntervalRef.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
          setProgress(remaining);
          if (remaining <= 0) clearInterval(progressIntervalRef.current);
        }, 40);

        dismissTimerRef.current = setTimeout(() => {
          setAlert(null);
          setProgress(100);
        }, duration);
      });

      socket.on('settings-updated', () => {
        console.log('[MediaShare] Settings updated → reloading config');
        loadActiveConfig('socket');
      });

      const polling = setInterval(() => loadActiveConfig('polling'), 2000);

      return () => {
        socket.disconnect();
        clearInterval(polling);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      };
    }, [token, loadActiveConfig]);

    if (!config) return null;
    if (config.overlayEnabled === false) {
      return <div style={{ width: '100vw', height: '100vh', background: 'transparent' }} />;
    }

    // ── Styling (SAMA PERSIS OverlayAlert) ──────────────────────────────────────
    const bg          = config.primaryColor   || '#6366f1';
    const fg          = config.textColor      || '#ffffff';
    const borderColor = config.borderColor    || 'rgba(255,255,255,0.15)';
    const theme       = config.theme          || 'modern';
    const highlight   = config.highlightColor || '#a5b4fc';
    const animation   = config.animation      || 'bounce';
    const maxW        = config.maxWidth       || 340;
    const customIcon  = config.customIcon     || '';
    const showTs      = config.showTimestamp  !== false;

    const animVariants = {
      bounce: {
        initial: { scale: 0.5, opacity: 0, y: 40 },
        animate: { scale: [0.5, 1.08, 1], opacity: 1, y: 0, transition: { duration: 0.5 } },
        exit:    { scale: 0.8, opacity: 0, transition: { duration: 0.3 } },
      },
      'slide-left': {
        initial: { x: -80, opacity: 0 },
        animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
        exit:    { x: -60, opacity: 0, transition: { duration: 0.3 } },
      },
      'slide-right': {
        initial: { x: 80, opacity: 0 },
        animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
        exit:    { x: 60, opacity: 0, transition: { duration: 0.3 } },
      },
      fade: {
        initial: { opacity: 0, y: -12 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
        exit:    { opacity: 0, y: -8, transition: { duration: 0.3 } },
      },
    };
    const anim = animVariants[animation] || animVariants.bounce;

    // ── RENDER MEDIA (BARU - di atas content) ───────────────────────────────────
    const renderMedia = () => {
      if (!alert?.mediaUrl) return null;
      const t = detectMediaType(alert.mediaUrl, alert.mediaType);

      return (
        <div style={{ 
          width: '100%', 
          aspectRatio: '16/9', 
          overflow: 'hidden', 
          background: '#000',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
          {t === 'youtube' && (
            <iframe
              src={getYouTubeEmbedUrl(alert.mediaUrl, alert.startTime || 0)}  // ← pakai startTime dari data donasi
              width="100%" height="100%"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{ display: 'block', border: 'none' }}
            />
          )}
          {t === 'video' && (
            <video
              ref={videoRef}
              src={alert.mediaUrl}
              autoPlay loop muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          {t === 'image' && (
            <img
              src={alert.mediaUrl}
              alt="media"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>
      );
    };

    const renderTimestamp = () => {
      if (!showTs || !alert?.receivedAt) return null;
      return (
        <div style={{ fontSize: 26, color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', sans-serif" }}>
          🕐 {formatTimestamp(alert.receivedAt)}
        </div>
      );
    };

    const BlockedPlaceholder = ({ hl }) => (
      <div style={{
        width: '100%',
        aspectRatio: '16/9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        gap: 10,
      }}>
        <span style={{ fontSize: 34 }}>⚠️</span>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          fontWeight: 500,
          color: '#ff4444',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          textAlign: 'center',
          padding: '0 16px',
        }}>
          Video Melanggar Kebijakan
        </span>
      </div>
    );

    const renderInner = () => {
      const hl = highlight;
      const monospace = "'Inter', sans-serif";
      const pixelBorder = `2px solid ${hl}`;
      const dimBorder = `1px solid ${hl}35`;

      const scanlineStyle = {
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)',
        pointerEvents: 'none', zIndex: 1,
      };

      // ── Media block — sebagai elemen JSX langsung, bukan component ──
      const mediaBlock = (() => {
        if (!alert?.mediaUrl) return null;

        if (alert.videoBlocked) {
          return (
            <div style={{ borderBottom: pixelBorder, position: 'relative', zIndex: 2 }}>
              <div style={{ width: '100%', height: '270px', aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', gap: 10 }}>
                <span style={{ fontSize: 34 }}>⚠️</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, color: '#ff4444', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', padding: '0 16px' }}>
                  {alert.blockReason || 'Video Melanggar Kebijakan'}
                </span>
              </div>
            </div>
          );
        }

        const t = detectMediaType(alert.mediaUrl, alert.mediaType);
        const embedUrl = t === 'youtube'
          ? getYouTubeEmbedUrl(alert.mediaUrl, alert.startTime || 0)
          : t === 'tiktok'
            ? getTikTokEmbedUrl(alert.mediaUrl)
            : null;

        return (
          <div style={{ width: '100%', aspectRatio: t === 'tiktok' ? '9/16' : '16/9', overflow: 'hidden', background: '#000', borderBottom: pixelBorder, position: 'relative', zIndex: 2 }}>
            {t === 'youtube' && embedUrl && (
              <iframe
                key={embedUrl}
                src={embedUrl}
                width="100%" height="100%"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                style={{ display: 'block', border: 'none' }}
              />
            )}

            {t === 'tiktok' && (() => {
              const streamUrl = `${API_URL}/api/midtrans/tiktok-stream?url=${encodeURIComponent(alert.mediaUrl)}`;
              return (
                <video
                  key={streamUrl}
                  src={streamUrl}
                  autoPlay
                  loop
                  muted={false}   // biar ada suara
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={() => setMediaError(true)}
                />
              );
            })()}

            {t === 'video' && (
              <video ref={videoRef} src={alert.mediaUrl} autoPlay loop muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={() => setMediaError(true)} />
            )}
            {t === 'image' && (
              <img src={alert.mediaUrl} alt="media"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={() => setMediaError(true)} />
            )}
          </div>
        );
      })();


      // ── MODERN ───────────────────────────────────────────────────────────────────
      if (theme === 'modern') {
        return (
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={scanlineStyle} />
            {mediaBlock}

            <div style={{ padding: '12px 14px', position: 'relative', zIndex: 2 }}>
              {/* Nama mengirim amount */}
              <div style={{ fontFamily: monospace, fontSize: 20, color: fg, lineHeight: 1.5, marginBottom: 6 }}>
                <span style={{ fontWeight: 500 }}>{alert.donorName}</span>
                <span> mengirim </span>
                <span style={{ fontWeight: 500, color: hl, textShadow: `0 0 10px ${hl}55` }}>
                  Rp {Number(alert.amount).toLocaleString('id-ID')}
                </span>
              </div>

              {/* Pesan */}
              {alert.message && (
                <div style={{
                  fontFamily: monospace, fontSize: 18, color: fg, fontWeight: 600,
                  lineHeight: 1.5, 
                  maxWidth: 500
                }}>
                  {alert.message}
                </div>
              )}

              {/* Progress dots */}
              <div style={{ height: 3, background: hl + '25', borderRadius: 99, overflow: 'hidden', marginTop: 10 }}>
                <div style={{ height: '100%', width: `${progress}%`, background: config.progressBarColor || hl, borderRadius: 99, transition: 'width 50ms linear' }} />
              </div>
            </div>
          </div>
        );
      }

      // ── SMOOTH ───────────────────────────────────────────────────────────────────
      if (theme === 'smooth') {
        return (
          <div style={{ fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
            {mediaBlock}

            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, fontFamily: "'Inter', sans-serif" }}>
              {/* Nama mengirim amount */}
              <div style={{ fontSize: 20, color: fg, lineHeight: 1 }}>
                <span style={{ color: hl }}>{alert.donorName}</span>
                <span> mengirim </span>
                <span style={{ color: hl, letterSpacing: '-0.5px' }}>
                  Rp {Number(alert.amount).toLocaleString('id-ID')}
                </span>
              </div>

              {/* Divider */}
              {/* <div style={{ height: 1, background: hl + '25', borderRadius: 99 }} /> */}

              {/* Pesan */}
              {alert.message && (
                <div style={{
                  fontFamily: monospace, fontSize: 18, color: fg, fontWeight: 600,
                  background: 'rgba(255,255,255,0.04)', border: dimBorder,
                  padding: '4px 10px', lineHeight: 1.5, maxWidth: 500, borderRadius: 8
                }}>
                  {alert.message}
                </div>
              )}

              {/* Progress bar */}
              <div style={{ height: 3, background: hl + '25', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: config.progressBarColor || hl, borderRadius: 99, transition: 'width 50ms linear' }} />
              </div>
            </div>
          </div>
        );
      }

      // ── GIFT CARD ─────────────────────────────────────────────────────────────────
      if (theme === 'gifCard') {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', justifyContent: 'center', alignItems: 'center' }}> 
            {/* Media block — full width */}
            {mediaBlock}

            {/* Info area */}
            <div style={{
              padding: '10px 12px',
              display: 'flex',
              textAlign: 'center',
              flexDirection: 'column',
              gap: 7,
              // marginLeft: '40px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 20,
                  width: 'max-content',
                  fontWeight: 500,
                  color: hl,
                  borderBottom: `1px solid ${hl}25`,
                }}>
                  {alert.donorName} mengirim
                </div>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 20,
                  marginLeft: 5,
                  fontWeight: 500,
                  color: hl,
                  letterSpacing: '-0.5px',
                  lineHeight: 1,
                  textShadow: `0 0 10px ${hl}55`,
                }}>
                  Rp {Number(alert.amount).toLocaleString('id-ID')}
                </div>
              </div>

              {alert.message && (
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 18,
                  color: 'black',
                  fontWeight: 400,
                  minWidth: 350,
                  maxWidth: 500,
                  borderRadius: 10,
                  background: 'white',
                  border: `1px solid ${hl}25`,
                  padding: '5px 8px',
                  lineHeight: 1.5,
                }}>
                  {alert.message}
                </div>
              )}

              {/* Progress bar */}
              <div style={{ height: 3, background: hl + '20', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: config.progressBarColor || hl,
                  transition: 'width 50ms linear',
                }} />
              </div>
            </div>
          </div>
        );
      }

      // ── CLASSIC ──────────────────────────────────────────────────────────────────
      // if (theme === 'classic') {
      //   return (
      //     <div style={{ position: 'relative', overflow: 'hidden' }}>
      //       <div style={scanlineStyle} />
      //       {mediaBlock}

      //       <div style={{ padding: '12px 14px', position: 'relative', zIndex: 2 }}>
      //         {/* Nama mengirim amount */}
      //         <div style={{ fontFamily: monospace, fontSize: 20, color: fg, lineHeight: 1.6, marginBottom: 4, borderBottom: `1px dashed ${hl}30`, paddingBottom: 8 }}>
      //           <span style={{ fontWeight: 500 }}>{alert.donorName}</span>
      //           <span> mengirim </span>
      //           <span style={{ fontWeight: 500, color: hl, textShadow: `0 0 10px ${hl}50` }}>
      //             Rp {Number(alert.amount).toLocaleString('id-ID')}
      //           </span>
      //         </div>

      //         {/* Pesan */}
      //         {alert.message && (
      //           <div style={{ fontWeight: 600, fontFamily: monospace, fontSize: 18, color: fg, lineHeight: 1.5, marginBottom: 10, maxWidth: 500 }}>
      //             {alert.message}
      //           </div>
      //         )}

      //         {/* Progress bar */}
      //         <div style={{ height: 2, background: 'rgba(255,255,255,0.08)' }}>
      //           <div style={{ height: '100%', width: `${progress}%`, background: hl, transition: 'width 50ms linear' }} />
      //         </div>
      //       </div>

      //       <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />
      //       <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
      //     </div>
      //   );
      // }

      // ── minimal ──────────────────────────────────────────────────────────────────
      return (
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={scanlineStyle} />
          {mediaBlock}

          <div style={{ padding: '12px 14px', position: 'relative', zIndex: 2 }}>
            {/* Nama mengirim amount */}
            <div style={{ fontFamily: monospace, fontSize: 20, color: fg, lineHeight: 1.6, marginBottom: 6 }}>
              <span style={{ fontWeight: 500 }}>{alert.donorName} - </span>
              <span style={{ fontWeight: 500, color: hl, letterSpacing: '-0.5px', textShadow: `0 0 8px ${hl}50` }}>
                Rp {Number(alert.amount).toLocaleString('id-ID')}
              </span>
            </div>

            {/* Pesan */}
            {alert.message && (
              <div style={{ fontWeight: 600, fontFamily: monospace, fontSize: 18, color: fg, lineHeight: 1.5, borderTop: `1px solid ${hl}30`, paddingTop: 8, maxWidth: 500 }}>
                {alert.message}
              </div>
            )}

            {/* Progress bar */}
            <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', marginTop: 10 }}>
              <div style={{ height: '100%', width: `${progress}%`, background: config.progressBarColor || hl, transition: 'width 50ms linear' }} />
            </div>
          </div>
        </div>
      );
    };

    if (!config) return (
      <div style={{
        width: '100vw', height: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'transparent', gap: 12,
        color: 'rgba(255,255,255,0.5)',
        fontFamily: "'Inter', sans-serif",
      }}>
        <span style={{ fontSize: 32 }}>📶</span>
        <span style={{ fontSize: 18 }}>Menghubungkan...</span>
      </div>
    );

    return (
      <div style={{
        width: '480px', height: 'max-content',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', overflow: 'hidden',
      }}>
        <audio ref={audioRef} />
        <AnimatePresence>
          {alert && (
            <motion.div
              key={alert.receivedAt || Date.now()}
              initial={anim.initial}
              animate={anim.animate}
              exit={anim.exit}
              style={{
                backgroundColor: theme === 'gifCard' ? 'transparent' : bg,  // ← tambah
                color: fg,
                width: '100%',
                borderRadius: 20,
                border: theme === 'gifCard' ? 'none' : `1px solid ${borderColor}`,  // ← tambah
                boxShadow: theme === 'gifCard' ? 'none' : '0 16px 40px rgba(0,0,0,0.55)',  // ← tambah
                overflow: theme === 'gifCard' ? 'visible' : 'hidden',  // ← tambah
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {renderInner()}
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: transparent !important; }
        `}</style>
      </div>
    );
  };

  export default MediaShareOverlay;