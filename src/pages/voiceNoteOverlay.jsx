import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

const formatRp = (n) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}jt`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return `${Number(n).toLocaleString('id-ID')}`;
};

const VoiceNoteOverlay = () => {
  const { token } = useParams();
  const [config, setConfig] = useState(null);
  const [alert, setAlert] = useState(null);
  const [progress, setProgress] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  const audioDurationMsRef = useRef(0);
  const audioRef = useRef(null);
  const configRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const audioProgressRef = useRef(null);
  const dismissTimerRef = useRef(null);

  // Unlock Audio (User Interaction)
  useEffect(() => {
    const unlock = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
        audioRef.current.pause();
      }
      document.removeEventListener('click', unlock);
    };
    document.addEventListener('click', unlock);

    setTimeout(() => {
      if (audioRef.current) audioRef.current.play().catch(() => {});
    }, 500);

    return () => document.removeEventListener('click', unlock);
  }, []);

  // ==================== LOAD ACTIVE CONFIG ====================
  const loadActiveConfig = useCallback(async (source = 'initial') => {
    try {
      const timestamp = Date.now();
      const resA = await axios.get(`${BASE_URL}/api/overlay/config/${token}?slot=A&t=${timestamp}`);

      const activeSlot = resA.data?.activeSlot || 'A';
      console.log(`[VoiceNote] Active Slot: ${activeSlot} (from ${source})`);

      let finalConfig;
      if (activeSlot === 'A') {
        finalConfig = resA.data;
      } else {
        const resB = await axios.get(`${BASE_URL}/api/overlay/config/${token}?slot=${activeSlot}&t=${timestamp}`);
        finalConfig = resB.data;
      }

      if (!configRef.current || finalConfig.slot !== configRef.current.slot) {
        console.log(`[VoiceNote] ✅ Config di-update ke Slot ${finalConfig.slot}`);
        setConfig(finalConfig);
        configRef.current = finalConfig;
      }
    } catch (err) {
      console.error('[VoiceNote] Failed to load config:', err);
    }
  }, [token]);

  // Load pertama
  useEffect(() => {
    if (!token) return;
    loadActiveConfig('initial');
  }, [token, loadActiveConfig]);

  // Audio Progress
  const startAudioProgress = useCallback(() => {
    if (audioProgressRef.current) clearInterval(audioProgressRef.current);
    audioProgressRef.current = setInterval(() => {
      if (!audioRef.current) return;
      const { currentTime, duration } = audioRef.current;
      if (duration > 0) setAudioProgress((currentTime / duration) * 100);
    }, 100);
  }, []);

  const stopAudioProgress = useCallback(() => {
    if (audioProgressRef.current) clearInterval(audioProgressRef.current);
    setAudioProgress(0);
    setIsPlaying(false);
  }, []);

  // ==================== SOCKET ====================
  useEffect(() => {
    if (!token) return;

    const socket = io(BASE_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1500,
      timeout: 10000,
    });

    socket.emit('join-room', `${token}-voice`);

    socket.on('reconnect', () => {
      console.log('[VoiceNote] 🔄 Reconnected');
      socket.emit('join-room', `${token}-voice`);
      loadActiveConfig('reconnect');
    });

    socket.on('new-voice-donation', (data) => {
      console.log('[VoiceNote] 🎙️ New Voice Donation Diterima!', data.donorName, 'Rp', data.amount);

      if (configRef.current?.overlayEnabled === false) return;

      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      stopAudioProgress();

      const absoluteVoiceUrl = data.voiceUrl?.startsWith('http')
        ? data.voiceUrl
        : data.voiceUrl ? `${BASE_URL}${data.voiceUrl}` : null;

      const donationData = {
        ...data,
        voiceUrl: absoluteVoiceUrl,
        receivedAt: data.receivedAt || new Date().toISOString(),
      };

      setAlert(donationData);
      setProgress(100);
      setAudioProgress(0);
      setIsPlaying(false);

      const INTRO_DELAY = 1000;
      const FALLBACK_DURATION = (() => {
        const cfg = configRef.current;
        if (!cfg) return 10000;
        const base = Number(cfg.voiceBaseDuration) || 10;
        const perAmt = Number(cfg.voiceExtraPerAmount) || 10000;
        const extra = Number(cfg.voiceExtraDuration) || 5;
        const extras = perAmt > 0 ? Math.floor((data.amount || 0) / perAmt) : 0;
        return Math.min(300000, (base + extras * extra) * 1000);
      })();

      const startCountdownAndDismiss = (audioDurationMs) => {
        audioDurationMsRef.current = audioDurationMs;
        const TOTAL_DURATION = INTRO_DELAY + audioDurationMs;

        dismissTimerRef.current = setTimeout(() => {
          setAlert(null);
          setProgress(100);
          setAudioProgress(0);
          setIsPlaying(false);
          stopAudioProgress();
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
          }
        }, TOTAL_DURATION);
      };

      if (!absoluteVoiceUrl || !audioRef.current) {
        startCountdownAndDismiss(FALLBACK_DURATION);
        return;
      }

      const audio = audioRef.current;
      audio.src = absoluteVoiceUrl;
      audio.load();

      let countdownStarted = false;

      const onMeta = () => {
        const rawDuration = audio.duration;
        const knownDuration = isFinite(rawDuration) && rawDuration > 0
          ? Math.min(rawDuration, 300)
          : null;

        if (knownDuration && !countdownStarted) {
          countdownStarted = true;
          setAudioDuration(knownDuration);
          startCountdownAndDismiss(knownDuration * 1000);
        }
      };

      const metaTimeout = setTimeout(() => {
        if (!countdownStarted) {
          countdownStarted = true;
          startCountdownAndDismiss(60 * 1000);
        }
      }, 2000);

      audio.onloadedmetadata = () => {
        clearTimeout(metaTimeout);
        onMeta();
      };

      audio.onplay = () => {
        setIsPlaying(true);
        startAudioProgress();

        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        const startTime = Date.now();
        const duration = isFinite(audio.duration) && audio.duration > 0
          ? audio.duration * 1000
          : audioDurationMsRef.current;

        progressIntervalRef.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
          setProgress(remaining);
          if (remaining <= 0) clearInterval(progressIntervalRef.current);
        }, 50);
      };

      audio.onended = () => {
        stopAudioProgress();
        setIsPlaying(false);
        if (!countdownStarted) {
          countdownStarted = true;
          startCountdownAndDismiss(0);
        }
      };

      audio.onerror = () => {
        clearTimeout(metaTimeout);
        stopAudioProgress();
        setIsPlaying(false);
        if (!countdownStarted) startCountdownAndDismiss(FALLBACK_DURATION);
      };

      setTimeout(() => {
        audio.play().catch(() => setIsPlaying(false));
      }, INTRO_DELAY);
    });

    socket.on('settings-updated', () => {
      console.log('[VoiceNote] Settings updated → reloading...');
      loadActiveConfig('socket');
    });

    const polling = setInterval(() => loadActiveConfig('polling'), 4000);

    return () => {
      socket.disconnect();
      clearInterval(polling);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      if (audioProgressRef.current) clearInterval(audioProgressRef.current);
    };
  }, [token, loadActiveConfig, startAudioProgress, stopAudioProgress]);

  if (!config) return null;
  if (config.overlayEnabled === false) {
    return <div style={{ width: '100vw', height: '100vh', background: 'transparent' }} />;
  }

  const bg = config.primaryColor || '#6366f1';
  const fg = config.textColor || '#ffffff';
  const highlight = config.highlightColor || '#a5b4fc';
  const borderColor = config.borderColor || 'rgba(255,255,255,0.15)';
  const animation = config.animation || 'bounce';
  const maxW = config.maxWidth || 340;

  const animVariants = {
    bounce: {
      initial: { scale: 0.5, opacity: 0, y: 40 },
      animate: { scale: [0.5, 1.08, 1], opacity: 1, y: 0, transition: { duration: 0.5 } },
      exit: { scale: 0.8, opacity: 0, transition: { duration: 0.3 } },
    },
    'slide-left': {
      initial: { x: -80, opacity: 0 },
      animate: { x: 0, opacity: 1, transition: { duration: 0.4 } },
      exit: { x: -60, opacity: 0, transition: { duration: 0.3 } },
    },
    'slide-right': {
      initial: { x: 80, opacity: 0 },
      animate: { x: 0, opacity: 1, transition: { duration: 0.4 } },
      exit: { x: 60, opacity: 0, transition: { duration: 0.3 } },
    },
    fade: {
      initial: { opacity: 0, y: -12 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
      exit: { opacity: 0, y: -8, transition: { duration: 0.3 } },
    },
  };

  const anim = animVariants[animation] || animVariants.bounce;

  if (!config) return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'transparent', gap: 12,
      color: 'rgba(255,255,255,0.5)',
      fontFamily: 'monospace',
    }}>
      <span style={{ fontSize: 32 }}>📶</span>
      <span style={{ fontSize: 13 }}>Menghubungkan...</span>
    </div>
  );

  return (
    <div style={{
      width: '100vw', height: '100vh',
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
              backgroundColor: bg,
              color: fg,
              width: `max-content`,
              borderRadius: config.theme === 'smooth' ? 20 : 0,
              border: `1px solid ${borderColor}`,
              boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
              overflow: 'hidden',
              fontFamily: "'Inter', -apple-system, 'Segoe UI', sans-serif",
            }}
          >
            {/* ↓↓↓ GANTI SEMUA KONTEN DI SINI ↓↓↓ */}
            {(() => {
              const monospace = "'Courier New', 'Lucida Console', monospace";
              const hl = highlight;
              const scanlineStyle = {
                position: 'absolute', inset: 0,
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)',
                pointerEvents: 'none', zIndex: 1,
              };

              if (config.theme === 'smooth') {
                return (
                  <div style={{ fontFamily: "'Poppins', sans-serif", padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Icon + Nama + Amount */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 14,
                        background: hl + '22', border: `1.5px solid ${hl}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
                      }}>
                        🎙️
                      </div>
                      <div>
                        <div className='flex items-center gap-2'>
                          <div style={{ fontSize: 20, fontWeight: 700, color: fg, textTransform: 'lowercase' }}>{alert.donorName}</div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: hl, letterSpacing: '-0.5px' }}>
                            {formatRp(alert.amount)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: hl + '25', borderRadius: 99 }} />

                    {/* Pesan */}
                    {alert.message && (
                      <div style={{
                        fontSize: 18, color: fg,
                        background: hl + '10', borderRadius: 10, padding: '8px 12px',
                        lineHeight: 1.5, border: `1px solid ${hl}20`, maxWidth: 500
                      }}>
                        {alert.message}
                      </div>
                    )}

                    {/* Visualizer smooth */}
                    <div style={{
                      background: hl + '0d', borderRadius: 10, padding: '8px 12px',
                      border: `1px solid ${hl}20`, display: 'flex', flexDirection: 'column', gap: 6,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 24 }}>
                        {Array.from({ length: 50 }).map((_, i) => (
                          <span key={i} style={{
                            width: 4, display: 'inline-block', borderRadius: 2,
                            background: isPlaying ? hl : hl + '40',
                            height: isPlaying ? `${30 + Math.abs(Math.sin(i * 0.7)) * 70}%` : '20%',
                            animation: isPlaying ? `vbar${i % 5} ${0.35 + (i % 4) * 0.07}s ease-in-out infinite alternate` : 'none',
                            transition: 'background 0.3s',
                          }} />
                        ))}
                      </div>
                      <div style={{ height: 3, background: hl + '25', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${audioProgress}%`, background: isPlaying ? '#22c55e' : hl, borderRadius: 99, transition: 'width 100ms linear' }} />
                      </div>
                    </div>

                    {/* Timestamp + overall progress */}
                    {alert.receivedAt && (
                      <div style={{ fontSize: 11, color: fg}}>
                        {new Date(alert.receivedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                    <div style={{ height: 3, background: hl + '20', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progress}%`, background: hl, borderRadius: 99, transition: 'width 50ms linear' }} />
                    </div>

                    <style>{`
                      @keyframes vbar0 { from{height:20%} to{height:85%} }
                      @keyframes vbar1 { from{height:35%} to{height:70%} }
                      @keyframes vbar2 { from{height:50%} to{height:95%} }
                      @keyframes vbar3 { from{height:25%} to{height:75%} }
                      @keyframes vbar4 { from{height:40%} to{height:60%} }
                    `}</style>
                  </div>
                );
              }

              return (
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                  <div style={scanlineStyle} />

                  {/* Header bar */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: hl + '18', borderBottom: `2px solid ${hl}`,
                    padding: '5px 10px', position: 'relative', zIndex: 2,
                    width: 'max-content'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontFamily: monospace, fontSize: 11, color: hl, letterSpacing: '-1px' }}>(o_o)</span>
                      <span style={{ fontFamily: monospace, fontSize: 9, color: hl, textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 700 }}>
                        VOICE DONATION
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{
                        width: 7, height: 7, display: 'inline-block',
                        background: isPlaying ? '#22c55e' : hl + '50',
                        border: `1px solid ${isPlaying ? '#22c55e' : hl}`,
                        transition: 'all 0.3s',
                      }} />
                      <span style={{ fontFamily: monospace, fontSize: 8, color: isPlaying ? '#22c55e' : hl, opacity: isPlaying ? 1 : 0.5, letterSpacing: '0.1em', transition: 'all 0.3s' }}>
                        {isPlaying ? 'PLAYING' : 'READY'}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '10px 12px', position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{
                        width: 40, height: 40, border: `2px solid ${hl}`, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, background: hl + '12',
                      }}>
                        🎙️
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className='flex items-center gap-2 w-max relative top-1'>
                          <div style={{ position: 'relative', top: 1, fontFamily: monospace, fontSize: 22, fontWeight: 900, color: fg, lineHeight: 1.1, textTransform: 'lowercase' }}>{alert.donorName} mengirim</div>
                          <div style={{
                            fontFamily: monospace, fontSize: 22, fontWeight: 900, color: hl,
                            letterSpacing: '-0.5px', textShadow: `0 0 8px ${hl}55`,
                          }}>
                            {formatRp(alert.amount)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {alert.message && (
                      <div style={{
                        fontFamily: monospace, fontSize: 20, color: fg,
                        background: 'rgba(255,255,255,0.04)', border: `1px solid ${hl}35`,
                        padding: '5px 8px', lineHeight: 1.4, marginBottom: 8, width: 500
                      }}>
                        {'>> '}{alert.message}
                      </div>
                    )}

                    {/* Visualizer block */}
                    <div style={{
                      border: `1px solid ${hl}35`, background: 'rgba(0,0,0,0.25)',
                      padding: '7px 10px', marginBottom: 6,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 24, marginBottom: 5 }}>
                        {Array.from({ length: 16 }).map((_, i) => (
                          <span key={i} style={{
                            width: 4, display: 'inline-block',
                            background: isPlaying ? hl : hl + '30',
                            height: isPlaying ? `${30 + Math.abs(Math.sin((i * 0.7))) * 70}%` : '20%',
                            animation: isPlaying ? `vbar${i % 5} ${0.35 + (i % 4) * 0.07}s ease-in-out infinite alternate` : 'none',
                            transition: 'background 0.3s, height 0.2s',
                          }} />
                        ))}
                      </div>
                      <div style={{ height: 2, background: 'rgba(255,255,255,0.08)' }}>
                        <div style={{
                          height: '100%', width: `${audioProgress}%`,
                          background: isPlaying ? '#22c55e' : hl,
                          transition: 'width 100ms linear, background 0.3s',
                        }} />
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontFamily: monospace, fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>
                        {'> VOICE · '}{alert.receivedAt ? new Date(alert.receivedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {Array.from({ length: 8 }).map((_, i) => (
                          <span key={i} style={{ width: 6, height: 6, display: 'inline-block', background: i < Math.round(progress / 12.5) ? hl : hl + '22' }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <style>{`
                    @keyframes vbar0 { from{height:20%} to{height:85%} }
                    @keyframes vbar1 { from{height:35%} to{height:70%} }
                    @keyframes vbar2 { from{height:50%} to{height:95%} }
                    @keyframes vbar3 { from{height:25%} to{height:75%} }
                    @keyframes vbar4 { from{height:40%} to{height:60%} }
                  `}</style>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceNoteOverlay;