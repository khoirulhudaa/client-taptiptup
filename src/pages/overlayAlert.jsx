    import React, { useEffect, useState, useRef, useCallback } from 'react';
    import { useParams } from 'react-router-dom';
    import { io } from 'socket.io-client';
    import { motion, AnimatePresence } from 'framer-motion';
    import axios from 'axios';

    const getYouTubeEmbedUrl = (url) => {
      if (!url) return null;
      const watchMatch = url.match(/youtube\.com\/watch\?v=([\w-]+)/);
      if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1&mute=0&controls=0&loop=1&playlist=${watchMatch[1]}`;
      const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
      if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1&mute=0&controls=0&loop=1&playlist=${shortMatch[1]}`;
      const shortsMatch = url.match(/youtube\.com\/shorts\/([\w-]+)/);
      if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}?autoplay=1&mute=0&controls=0&loop=1&playlist=${shortsMatch[1]}`;
      return null;
    };

    const detectMediaType = (url, mediaType) => {
      if (!url) return null;
      if (getYouTubeEmbedUrl(url)) return 'youtube';
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

    // const getAlertDuration = (config, amount) => {
    //   if (!config) return 10000;
    //   // ✅ Gunakan pengaturan baru
    //   if (config.alertBaseDuration != null) {
    //     const base = Number(config.alertBaseDuration) || 10;
    //     const perAmount = Number(config.alertExtraPerAmount) || 10000;
    //     const extraDur = Number(config.alertExtraDuration) || 5;

    //     const extras = perAmount > 0 ? Math.floor(amount / perAmount) : 0;
    //     return (base + extras * extraDur) * 1000;
    //   }

    //   // Fallback lama
    //   if (config.alertDurationPerThousand) {
    //     const seconds = Math.ceil(amount / 1000) * config.alertDurationPerThousand;
    //     return seconds * 1000;
    //   }

    //   if (config.durationTiers?.length > 0) {
    //     const sorted = [...config.durationTiers].sort((a, b) => b.minAmount - a.minAmount);
    //     for (const tier of sorted) {
    //       if (amount >= tier.minAmount && (tier.maxAmount === null || amount <= tier.maxAmount)) {
    //         return tier.duration * 1000;
    //       }
    //     }
    //   }

    //   return 10000; // default
    // };

    const getAlertDuration = (config, donation) => {
      return (Number(config?.alertBaseDuration) || 12) * 1000;
    };

    const OverlayAlert = () => {
      const { token } = useParams();
      const [alert, setAlert]       = useState(null);
      const [config, setConfig]     = useState(null);
      const [progress, setProgress] = useState(100);

      const audioRef            = useRef(null);
      const configRef           = useRef(null);
      const progressIntervalRef = useRef(null);
      const dismissTimerRef     = useRef(null);

      // // ==================== TEXT TO SPEECH (edge-tts via backend) ====================
      // const speakDonation = useCallback(async (donation) => {
      //   if (!configRef.current?.ttsEnabled) return;

      //   const text = `${donation.donorName || 'Seseorang'} mengirimkan Rp ${Number(donation.amount).toLocaleString('id-ID')}. ${donation.message || ''}`;

      //   try {
      //     const res = await fetch('https://taptiptup-server-1ee47f2895cb.herokuapp.com/api/overlay/tts/speak', {
      //       method: 'POST',
      //       headers: { 'Content-Type': 'application/json' },
      //       body: JSON.stringify({ text, voiceName: 'id-ID-GadisNeural' }),
      //     });

      //     if (!res.ok) throw new Error('TTS gagal');

      //     const blob  = await res.blob();
      //     const url   = URL.createObjectURL(blob);
      //     const audio = new Audio(url);
      //     audio.volume  = configRef.current.ttsVolume || 1.0;
      //     audio.onended = () => URL.revokeObjectURL(url);
      //     await audio.play();
      //   } catch (err) {
      //     console.error('[TTS]', err);
      //   }
      // }, []);

      // ==================== TEXT TO SPEECH (Selalu jalan, tapi bisa mute) ====================
      const speakDonation = useCallback(async (donation) => {
        const config = configRef.current;
        if (!config) return Promise.resolve();

        const text = `${donation.donorName || 'Seseorang'} mengirimkan Rp ${Number(donation.amount).toLocaleString('id-ID')}. ${donation.message || ''}`;

        try {
          const res = await fetch('https://taptiptup-server-1ee47f2895cb.herokuapp.com/api/overlay/tts/speak', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              text, 
              rate: 1.35,
              voiceName: 'id-ID-GadisNeural' 
            }),
          });

          if (!res.ok) throw new Error('TTS gagal');

          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);

          // TTS tetap jalan tapi bisu jika dimatikan
          audio.volume = config.ttsEnabled ? (config.ttsVolume || 1.0) : 0;

          return new Promise((resolve) => {
            audio.onended = () => { 
              URL.revokeObjectURL(url); 
              resolve(); 
            };
            audio.onerror = () => { 
              URL.revokeObjectURL(url); 
              resolve(); 
            };
            audio.play().catch(() => resolve());
          });
        } catch (err) {
          console.error('[TTS]', err);
          return Promise.resolve();
        }
      }, []);

      // useEffect(() => {
      //   if (!token) return;
      //   const slot = new URLSearchParams(window.location.search).get('slot') || 'A';
      //   axios
      //     .get(`https://taptiptup-server-1ee47f2895cb.herokuapp.com/api/overlay/config/${token}?slot=${slot}`)
      //     .then((res) => { setConfig(res.data); configRef.current = res.data; })
      //     .catch(() => console.error('[Overlay] Invalid token'));
      // }, [token]);

      const loadActiveConfig = useCallback(async (source = 'initial') => {
            try {
              const timestamp = Date.now();

              const resA = await axios.get(
                `https://taptiptup-server-1ee47f2895cb.herokuapp.com/api/overlay/config/${token}?slot=A&t=${timestamp}`
              );

              const activeSlot = resA.data?.activeSlot || 'A';
              console.log(`[Overlay] Active Slot terdeteksi: ${activeSlot} (from ${source})`);

              let finalConfig;

              if (activeSlot === 'A') {
                finalConfig = resA.data;
              } else {
                const resB = await axios.get(
                  `https://taptiptup-server-1ee47f2895cb.herokuapp.com/api/overlay/config/${token}?slot=${activeSlot}&t=${timestamp}`
                );
                finalConfig = resB.data;
              }

              // if (!configRef.current || finalConfig.slot !== configRef.current.slot) {
              //   console.log(`[Overlay] ✅ Config di-update ke Slot ${finalConfig.slot || 'A'}`);
              //   setConfig(finalConfig);
              //   configRef.current = finalConfig;
              // }

              setConfig(finalConfig);
              configRef.current = finalConfig;
            } catch (err) {
              console.error('[Overlay] Failed to load config:', err);
            }
          }, [token]);

          // Load pertama kali
          useEffect(() => {
            if (!token) return;
            loadActiveConfig('initial');
          }, [token, loadActiveConfig]);

        // ==================== SOCKET CONNECTION ====================
        useEffect(() => {
          if (!token) return;

          const socket = io('https://taptiptup-server-1ee47f2895cb.herokuapp.com', {
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1500,
            timeout: 10000,
          });

          socket.emit('join-room', token);

          // ==================== NEW DONATION ====================
          // socket.on('new-donation', (data) => {
          //   if (configRef.current?.overlayEnabled === false) return;

          //   const donationWithTime = { ...data, receivedAt: data.receivedAt || new Date().toISOString() };
          //   setAlert(donationWithTime);
          //   setProgress(100);

          //   // Sound logic
          //   let soundToPlay = null;
          //   const config = configRef.current;
          //   const amount = Number(donationWithTime.amount);

          //   if (config?.soundTiers && config.soundTiers.length > 0) {
          //     const sortedTiers = [...config.soundTiers].sort((a, b) => b.minAmount - a.minAmount);
          //     for (const tier of sortedTiers) {
          //       if (amount >= tier.minAmount && 
          //           (tier.maxAmount === null || amount <= tier.maxAmount)) {
          //         soundToPlay = tier.soundUrl;
          //         break;
          //       }
          //     }
          //   }

          //   if (!soundToPlay && data.voiceUrl) soundToPlay = data.voiceUrl;
          //   if (!soundToPlay && data.soundUrl) soundToPlay = data.soundUrl;
          //   if (!soundToPlay && config?.soundUrl) soundToPlay = config.soundUrl;

          //   if (soundToPlay && audioRef.current) {
          //     audioRef.current.src = soundToPlay;
          //     audioRef.current.play().catch(() => {});
          //   }

          //   speakDonation(donationWithTime);

          //   const duration = getAlertDuration(configRef.current, amount);

          //   if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          //   if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);

          //   const startTime = Date.now();
          //   progressIntervalRef.current = setInterval(() => {
          //     const elapsed = Date.now() - startTime;
          //     const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
          //     setProgress(remaining);
          //     if (remaining <= 0) clearInterval(progressIntervalRef.current);
          //   }, 50);

          //   dismissTimerRef.current = setTimeout(() => {
          //     setAlert(null);
          //     setProgress(100);
          //   }, duration);
          // });

          socket.on('new-donation', async (data) => {
            if (configRef.current?.overlayEnabled === false) return;

            const donationWithTime = { ...data, receivedAt: data.receivedAt || new Date().toISOString() };
            setAlert(donationWithTime);
            setProgress(100);

            // Sound logic
            let soundToPlay = null;
            const config = configRef.current;
            if (config?.soundTiers?.length) {
              const sorted = [...config.soundTiers].sort((a, b) => b.minAmount - a.minAmount);
              for (const tier of sorted) {
                if (Number(data.amount) >= tier.minAmount && 
                    (tier.maxAmount === null || Number(data.amount) <= tier.maxAmount)) {
                  soundToPlay = tier.soundUrl;
                  break;
                }
              }
            }
            if (!soundToPlay && data.voiceUrl) soundToPlay = data.voiceUrl;
            if (!soundToPlay && config?.soundUrl) soundToPlay = config.soundUrl;

            if (soundToPlay && audioRef.current) {
              audioRef.current.src = soundToPlay;
              audioRef.current.play().catch(() => {});
            }

            // TTS + Durasi Fleksibel
            const ttsPromise = speakDonation(donationWithTime);
            const baseDurationMs = getAlertDuration(config);

            // Clear timer lama
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);

            // Progress Bar
            const startTime = Date.now();
            progressIntervalRef.current = setInterval(() => {
              const elapsed = Date.now() - startTime;
              const remaining = Math.max(0, 100 - (elapsed / baseDurationMs) * 100);
              setProgress(remaining);
              if (remaining <= 0) clearInterval(progressIntervalRef.current);
            }, 50);

            // Dismiss Alert (fleksibel mengikuti TTS)
            dismissTimerRef.current = setTimeout(async () => {
              await ttsPromise;   // tunggu sampai TTS selesai
              setAlert(null);
              setProgress(100);
            }, baseDurationMs);
          });

          socket.on('reconnect', () => loadActiveConfig('reconnect'));
          socket.on('settings-updated', () => loadActiveConfig('socket'));

          const polling = setInterval(() => loadActiveConfig('polling'), 2000);

          return () => {
            socket.disconnect();
            clearInterval(polling);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
          };
        }, [token, loadActiveConfig, speakDonation]);

        if (!config) return null;
        if (config.overlayEnabled === false) {
          return <div style={{ width: '100vw', height: '100vh', background: 'transparent' }} />;
        }

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
            exit:    { opacity: 0, y: -8,  transition: { duration: 0.3 } },
          },
        };

        const anim = animVariants[animation] || animVariants.bounce;

        // ── Media — semua borderRadius: 0 ───────────────────────────────────────────
        // const renderMedia = () => {
        //   return null
        // }

        const renderTimestamp = () => {
          if (!showTs || !alert?.receivedAt) return null;
          return (
            <div style={{ fontSize: 14, color: fg, right: 0, fontFamily: 'monospace', letterSpacing: '0.04em', marginTop: 4 }}>
              🕐 {formatTimestamp(alert.receivedAt)}
            </div>
          );
        };

        const renderProgressBar = () => (
          <div style={{ height: 3, background: 'rgba(255,255,255,0.15)' }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: highlight,
              transition: 'width 50ms linear',
            }} />
          </div>
        );

        const renderInner = () => {
          const hl = highlight;
          const monospace = "'Courier New', 'Lucida Console', monospace";

          const scanlineStyle = {
            position: 'absolute',
            inset: 0,
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)',
            pointerEvents: 'none',
            zIndex: 1,
          };

          const FrogDeco = () => (
            <span style={{ fontFamily: monospace, fontSize: 22, color: hl, letterSpacing: '-1px' }}>(o_o)</span>
          );

          const pixelBorder = `2px solid ${hl}`;
          const dimBorder = `1px solid ${hl}35`;

          // ── MODERN — Terminal HUD ────────────────────────────────────────────────────
          if (theme === 'modern') {
            return (
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={scanlineStyle} />

                {/* Header bar */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: hl + '18', borderBottom: pixelBorder,
                  padding: '5px 10px', position: 'relative', zIndex: 2,
                }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {['#ff4444', '#ffaa00', hl].map((c, i) => (
                      <span key={i} style={{ width: 7, height: 7, background: c, display: 'inline-block', border: '1px solid rgba(255,255,255,0.2)' }} />
                    ))}
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '10px 12px', position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 0 }}>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
                      <div style={{ fontFamily: monospace, fontSize: 22, fontWeight: 900, color: fg }}>
                        {alert.donorName} mengirim
                      </div>
                      <div style={{
                        marginLeft: 12,
                        position: 'relative',
                        top: 1,
                        fontFamily: monospace, fontSize: 20, fontWeight: 900, color: hl,
                        textShadow: `0 0 10px ${hl}55`,
                      }}>
                        Rp {Number(alert.amount).toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div style={{
                      width: 40, height: 40, 
                      // border: pixelBorder, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20,
                      position: 'relative',
                      top: -6 
                      // background: hl + '12',
                    }}>
                      {renderIcon(customIcon, 20)}
                    </div>
                  </div>

                  {alert.message && (
                    <div style={{
                      fontFamily: monospace, fontSize: 18, color: fg,
                      fontWeight: 400,
                      maxWidth: 500,
                      background: 'rgba(255,255,255,0.04)', border: dimBorder,
                      padding: '5px 8px', lineHeight: 1.4, marginBottom: 6,
                    }}>
                      {alert.message}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                    {showTs && alert?.receivedAt
                      ? <div style={{ fontFamily: monospace, fontSize: 14, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>
                          {formatTimestamp(alert.receivedAt)}
                        </div>
                      : <div />
                    }
                    <div style={{ display: 'flex', gap: 2 }}>
                      {Array.from({ length: 8 }).map((_, i) => (
                        <span key={i} style={{
                          width: 6, height: 6, display: 'inline-block',
                          background: i < Math.round(progress / 12.5) ? hl : hl + '22',
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if (theme === 'gifCard') {
            return (
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                {/* GIF area — full width, transparent bg */}
                <div style={{
                  width: '100%',
                  height: 120,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  overflow: 'hidden',
                }}>
                  {customIcon?.startsWith('http') || customIcon?.startsWith('/') ? (
                    <img
                      src={customIcon}
                      alt="icon"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                        marginLeft: -6,
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: 72, lineHeight: 1 }}>{customIcon || '💜'}</span>
                  )}
                </div>

                {/* Info area */}
                <div style={{
                  padding: '10px 12px',
                  display: 'flex',
                  textAlign: 'center',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 7,
                  width: '100%'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 20,
                      width: 'max-content',
                      fontWeight: 500,
                      color: 'white',
                      borderBottom: `1px solid ${highlight}25`,
                    }}>
                      {alert.donorName} mengirim
                    </div>
                    <div style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 20,
                      marginLeft: 5,
                      fontWeight: 500,
                      color: highlight,
                      letterSpacing: '-0.5px',
                      lineHeight: 1,
                      textShadow: `0 0 10px ${highlight}55`,
                    }}>
                      Rp {Number(alert.amount).toLocaleString('id-ID')}
                    </div>
                  </div>

                  {alert.message && (
                    <div style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 18,
                      color: 'black',
                      fontWeight: 400,
                      minWidth: 400,
                      borderRadius: 14,
                      maxWidth: 500,
                      background: 'white',
                      border: `1px solid ${highlight}25`,
                      padding: '5px 8px',
                      lineHeight: 1.5,
                    }}>
                      {alert.message}
                    </div>
                  )}

                  {/* Progress bar */}
                  <div style={{ height: 3, background: highlight + '20', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${progress}%`,
                      background: highlight,
                      transition: 'width 50ms linear',
                    }} />
                  </div>
                </div>
              </div>
            );
          }

          // ── SMOOTH — Soft rounded card ────────────────────────────────────────────────
          if (theme === 'smooth') {
            return (
              <div style={{ fontFamily: "'Poppins', sans-serif", padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Icon + Nama */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div className='w-max flex items-center gap-2' style={{width: 'max-content'}}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center', fontSize: 20, fontWeight: 900, color: fg, lineHeight: 1.2, top: 1.5, position: 'relative' }}>
                      {alert.donorName} mengirim
                    </div>
                    <div style={{ fontSize: 20, padding: '0px 0px', fontWeight: 800, color: hl, letterSpacing: '-0.5px', lineHeight: 1 }}>
                      Rp {Number(alert.amount).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: hl + '22', border: `1.5px solid ${hl}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
                  }}>
                    {renderIcon(customIcon, 22)}
                  </div>
                </div>
                
                {/* Divider */}
                <div style={{ height: 1, background: hl + '25', borderRadius: 99 }} />

                {/* Pesan */}
                {alert.message && (
                  <div style={{
                    fontSize: 18, 
                    color: fg,
                    maxWidth: 500,
                    fontWeight: 400,
                    borderRadius: 10, 
                    lineHeight: 1.5, 
                  }}>
                    {alert.message}
                  </div>
                )}

                {/* Timestamp */}
                {showTs && alert?.receivedAt && (
                  <div style={{ fontSize: 14, color: fg, opacity: 0.7, right: 0, fontWeight: 400, letterSpacing: '0.04em' }}>
                    {formatTimestamp(alert.receivedAt)}
                  </div>
                )}

                {/* Progress bar */}
                <div style={{ height: 3, background: hl + '25', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: hl, borderRadius: 99, transition: 'width 50ms linear' }} />
                </div>
              </div>
            );
          }

          // ── MINIMAL — Retro Ticker ───────────────────────────────────────────────────
          return (
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={scanlineStyle} />
              <div style={{ padding: '10px 12px', position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{
                    fontFamily: monospace, fontSize: 22, fontWeight: 900, color: hl,
                    letterSpacing: '-1px', textShadow: `0 0 8px ${hl}50`,
                  }}>
                    Rp {Number(alert.amount).toLocaleString('id-ID')}
                  </span>
                </div>

                <div style={{
                  fontFamily: monospace, fontSize: 22, fontWeight: 900, color: fg,
                  marginBottom: 3, borderBottom: `1px solid ${hl}20`, paddingBottom: 5,
                }}>
                  {alert.donorName}
                </div>

                {alert.message && (
                  <div style={{
                    fontFamily: monospace, fontSize: 18, color: fg,
                    lineHeight: 1.4, marginBottom: 4,
                    maxWidth: 500
                  }}>
                    {alert.message}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {showTs && alert?.receivedAt
                    ? <div style={{ fontFamily: monospace, fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>
                        {formatTimestamp(alert.receivedAt)}
                      </div>
                    : <div />
                  }
                </div>

                <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', marginTop: 6 }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: hl, transition: 'width 50ms linear' }} />
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
                    backgroundColor: theme === 'gifCard' ? 'transparent' : bg,
                    color: fg,
                    padding: 6,
                    width: theme === 'gifCard' ? '500px' : 'max-content', 
                    borderRadius: 20,
                    border: theme === 'gifCard' ? 'none' : `1px solid ${borderColor}`,
                    boxShadow: theme === 'gifCard' ? 'none' : '0 16px 40px rgba(0,0,0,0.55)',
                    overflow: theme === 'gifCard' ? 'visible' : 'hidden',
                    fontFamily: "'Inter', -apple-system, 'Segoe UI', sans-serif",
                  }}
                >
                  {renderInner()}
                </motion.div>
              )}
          </AnimatePresence>
        </div>
      );
    };

    export default OverlayAlert;