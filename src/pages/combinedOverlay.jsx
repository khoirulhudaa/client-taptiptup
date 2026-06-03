// pages/combinedOverlay.jsx
// Gabungan OverlayAlert + MediaShareOverlay dalam SATU URL
// Route: /overlay/:token/combined

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// ── Helpers (sama persis dari kedua file) ────────────────────────────────────

const isTikTokUrl = (url) => {
  if (!url) return false;
  return /tiktok\.com/i.test(url);
};

const extractTikTokVideoId = (url) => {
  if (!url) return null;
  const match = url.match(/tiktok\.com\/@[\w.]+\/video\/(\d+)/);
  return match ? match[1] : null;
};

const getTikTokEmbedUrl = (url) => {
  const videoId = extractTikTokVideoId(url);
  if (!videoId) return null;
  return `https://www.tiktok.com/embed/v2/${videoId}?autoplay=1&loop=1&muted=1`;
};

const isYouTubeLiveUrl = (url) => {
  if (!url) return false;
  return /youtube\.com\/live\//i.test(url);
};

const getYouTubeEmbedUrl = (url, startSeconds = 0) => {
  if (!url) return null;
  if (url.includes('youtube.com/embed/') || url.includes('youtube-nocookie.com/embed/')) {
    if (isYouTubeLiveUrl(url)) return url;
    if (startSeconds > 0 && !url.includes('&start=')) {
      return url + (url.includes('?') ? '&' : '?') + `start=${Math.floor(startSeconds)}`;
    }
    return url;
  }
  const liveMatch = url.match(/youtube\.com\/live\/([\w-]+)/);
  if (liveMatch) {
    return `https://www.youtube.com/embed/${liveMatch[1]}?autoplay=1&mute=0&controls=0`;
  }
  const start = startSeconds > 0 ? `&start=${Math.floor(startSeconds)}` : '';
  const watchMatch = url.match(/youtube\.com\/watch\?v=([\w-]+)/);
  if (watchMatch) {
    const id = watchMatch[1];
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&controls=0&loop=1&playlist=${id}&enablejsapi=1${start}`;
  }
  const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
  if (shortMatch) {
    const id = shortMatch[1];
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&controls=0&loop=1&playlist=${id}&enablejsapi=1${start}`;
  }
  const shortsMatch = url.match(/youtube\.com\/shorts\/([\w-]+)/);
  if (shortsMatch) {
    const id = shortsMatch[1];
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&controls=0&loop=1&playlist=${id}&enablejsapi=1${start}`;
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
  if (!config) return 10000;
  if (config.alertBaseDuration != null) {
    const base = Number(config.alertBaseDuration) || 10;
    const perAmount = Number(config.alertExtraPerAmount) || 10000;
    const extraDur = Number(config.alertExtraDuration) || 5;
    const extras = perAmount > 0 ? Math.floor(amount / perAmount) : 0;
    return (base + extras * extraDur) * 1000;
  }
  if (config.durationTiers?.length > 0) {
    const sorted = [...config.durationTiers].sort((a, b) => b.minAmount - a.minAmount);
    for (const tier of sorted) {
      if (amount >= tier.minAmount && (tier.maxAmount === null || amount <= tier.maxAmount)) {
        return tier.duration * 1000;
      }
    }
  }
  return 10000;
};

const calculateMediaShareDuration = (config, amount) => {
  if (!config || !amount || amount <= 0) return 15000;
  const base = Number(config.mediaShareBaseDuration) || 15;
  const perAmount = Number(config.mediaShareExtraPerAmount) || 10000;
  const extraDur = Number(config.mediaShareExtraDuration) || 10;
  const extras = perAmount > 0 ? Math.floor(amount / perAmount) : 0;
  return (base + extras * extraDur) * 1000;
};

// ── Shared renderInner logic untuk Alert biasa ───────────────────────────────
const renderAlertInner = ({ alert, config, progress }) => {
  const bg          = config.primaryColor   || '#6366f1';
  const fg          = config.textColor      || '#ffffff';
  const highlight   = config.highlightColor || '#a5b4fc';
  const theme       = config.theme          || 'modern';
  const customIcon  = config.customIcon     || '';
  const showTs      = config.showTimestamp  !== false;

  const hl = highlight;
  const monospace = "'Courier New', 'Lucida Console', monospace";
  const pixelBorder = `2px solid ${hl}`;
  const dimBorder = `1px solid ${hl}35`;

  const scanlineStyle = {
    position: 'absolute', inset: 0,
    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)',
    pointerEvents: 'none', zIndex: 1,
  };

  if (theme === 'modern') {
    return (
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={scanlineStyle} />
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: hl + '18', borderBottom: pixelBorder,
          padding: '5px 10px', position: 'relative', zIndex: 2,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: monospace, fontSize: 23, color: hl, letterSpacing: '-1px' }}>(o_o)</span>
            <span style={{ fontFamily: monospace, fontSize: 16, color: hl, textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 700 }}>
              DUKUNGAN MASUK
            </span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['#ff4444', '#ffaa00', hl].map((c, i) => (
              <span key={i} style={{ width: 7, height: 7, background: c, display: 'inline-block', border: '1px solid rgba(255,255,255,0.2)' }} />
            ))}
          </div>
        </div>
        <div style={{ padding: '10px 12px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, border: pixelBorder, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 23, background: hl + '12' }}>
              {renderIcon(customIcon, 20)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ marginTop: 10, fontFamily: monospace, fontSize: 18, fontWeight: 900, color: fg, lineHeight: 1.1 }}>{alert.donorName}</div>
            </div>
          </div>
          <div style={{ fontFamily: monospace, fontSize: 26, fontWeight: 900, color: hl, letterSpacing: '-1px', lineHeight: 1, borderLeft: `3px solid ${hl}`, paddingLeft: 8, marginBottom: 6, textShadow: `0 0 10px ${hl}55` }}>
            Rp {Number(alert.amount).toLocaleString('id-ID')}
          </div>
          {alert.message && (
            <div style={{ fontFamily: monospace, fontSize: 24, color: fg, fontWeight: 900, background: 'rgba(255,255,255,0.04)', border: dimBorder, padding: '5px 8px', lineHeight: 1.4, marginBottom: 6 }}>
              {'>> '}{alert.message}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            {showTs && alert?.receivedAt
              ? <div style={{ fontFamily: monospace, fontSize: 16, color: 'rgba(255,255,255,0.35)' }}>{'> '}{formatTimestamp(alert.receivedAt)}</div>
              : <div />
            }
            <div style={{ display: 'flex', gap: 2 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} style={{ width: 6, height: 6, display: 'inline-block', background: i < Math.round(progress / 12.5) ? hl : hl + '22' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (theme === 'smooth') {
    return (
      <div style={{ fontFamily: "'Poppins', sans-serif", padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: hl + '22', border: `1.5px solid ${hl}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            {renderIcon(customIcon, 22)}
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 500, color: fg, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>Dukungan Masuk</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: fg, lineHeight: 1.2 }}>{alert.donorName}</div>
          </div>
        </div>
        <div style={{ height: 1, background: hl + '25', borderRadius: 99 }} />
        <div style={{ fontSize: 26, fontWeight: 800, color: hl, letterSpacing: '-0.5px', lineHeight: 1 }}>Rp {Number(alert.amount).toLocaleString('id-ID')}</div>
        {alert.message && (
          <div style={{ fontSize: 24, fontWeight: 900, color: fg, background: hl + '10', borderRadius: 10, padding: '8px 12px', lineHeight: 1.5, border: `1px solid ${hl}20` }}>
            {alert.message}
          </div>
        )}
        {showTs && alert?.receivedAt && (
          <div style={{ fontSize: 22, color: fg, fontWeight: 400, letterSpacing: '0.04em' }}>{formatTimestamp(alert.receivedAt)}</div>
        )}
        <div style={{ height: 3, background: hl + '25', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: hl, borderRadius: 99, transition: 'width 50ms linear' }} />
        </div>
      </div>
    );
  }

  if (theme === 'classic') {
    return (
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={scanlineStyle} />
        <div style={{ height: 3, background: hl, position: 'relative', zIndex: 2 }} />
        <div style={{ background: hl + '15', borderBottom: `1px solid ${hl}40`, padding: '7px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 26, lineHeight: 1 }}>{renderIcon(customIcon, 16)}</span>
            <span style={{ fontFamily: monospace, fontSize: 10, fontWeight: 900, color: hl, textTransform: 'uppercase', letterSpacing: '0.15em' }}>★ Dukungan Masuk! ★</span>
          </div>
          <span style={{ fontFamily: monospace, fontSize: 24, color: hl, letterSpacing: '-1px' }}>(o_o)</span>
        </div>
        <div style={{ padding: '10px 12px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, borderBottom: `1px dashed ${hl}30`, paddingBottom: 6 }}>
            <span style={{ fontFamily: monospace, fontSize: 26, fontWeight: 900, color: fg }}>{alert.donorName}</span>
          </div>
          <div style={{ fontFamily: monospace, fontSize: 24, fontWeight: 900, color: hl, letterSpacing: '-0.5px', marginBottom: 5, textShadow: `0 0 10px ${hl}50` }}>
            Rp {Number(alert.amount).toLocaleString('id-ID')}
          </div>
          {alert.message && (
            <div style={{ fontFamily: monospace, fontSize: 24, color: fg, lineHeight: 1.45, borderLeft: `2px solid ${hl}`, paddingLeft: 8, marginBottom: 6 }}>
              {alert.message}<span style={{ color: hl, animation: 'blink 1s step-end infinite' }}>▮</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
            {showTs && alert?.receivedAt
              ? <div style={{ fontFamily: monospace, fontSize: 16, color: 'rgba(255,255,255,0.35)' }}>{'> '}{formatTimestamp(alert.receivedAt)}</div>
              : <div />
            }
            <div style={{ fontFamily: monospace, fontSize: 8, color: hl, letterSpacing: '0.08em' }}>[ PRESS ▲ TO CONTINUE ]</div>
          </div>
          <div style={{ height: 2, background: 'rgba(255,255,255,0.08)', marginTop: 8 }}>
            <div style={{ height: '100%', width: `${progress}%`, background: hl, transition: 'width 50ms linear' }} />
          </div>
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ height: 3, background: hl }} />
        <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
      </div>
    );
  }

  // minimal
  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={scanlineStyle} />
      <div style={{ padding: '10px 12px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div />
          <span style={{ fontFamily: monospace, fontSize: 22, fontWeight: 900, color: hl, letterSpacing: '-1px', textShadow: `0 0 8px ${hl}50` }}>
            Rp {Number(alert.amount).toLocaleString('id-ID')}
          </span>
        </div>
        <div style={{ fontFamily: monospace, fontSize: 26, fontWeight: 900, color: fg, marginBottom: 3, borderBottom: `1px solid ${hl}20`, paddingBottom: 5 }}>
          {'> '}{alert.donorName}
        </div>
        {alert.message && (
          <div style={{ fontFamily: monospace, fontSize: 10, color: fg, lineHeight: 1.4, marginBottom: 4 }}>{alert.message}</div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {showTs && alert?.receivedAt
            ? <div style={{ fontFamily: monospace, fontSize: 16, color: 'rgba(255,255,255,0.35)' }}>{'> '}{formatTimestamp(alert.receivedAt)}</div>
            : <div />
          }
          <div style={{ fontFamily: monospace, fontSize: 8, color: hl, letterSpacing: '2px' }}>{'- - - - - - - -'}</div>
        </div>
        <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', marginTop: 6 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: hl, transition: 'width 50ms linear' }} />
        </div>
      </div>
    </div>
  );
};

// ── renderMediaInner untuk MediaShare ────────────────────────────────────────
const renderMediaInner = ({ alert, config, progress, videoRef, setMediaError }) => {
  const highlight   = config.highlightColor || '#a5b4fc';
  const fg          = config.textColor      || '#ffffff';
  const theme       = config.theme          || 'modern';
  const customIcon  = config.customIcon     || '';
  const showTs      = config.showTimestamp  !== false;

  const hl = highlight;
  const monospace = "'Courier New', 'Lucida Console', monospace";
  const pixelBorder = `2px solid ${hl}`;
  const dimBorder = `1px solid ${hl}35`;

  const scanlineStyle = {
    position: 'absolute', inset: 0,
    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)',
    pointerEvents: 'none', zIndex: 1,
  };

  const mediaBlock = (() => {
    if (!alert?.mediaUrl) return null;

    if (alert.videoBlocked) {
      return (
        <div style={{ borderBottom: pixelBorder, position: 'relative', zIndex: 2 }}>
          <div style={{ width: '100%', aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', gap: 10 }}>
            <span style={{ fontSize: 34 }}>⚠️</span>
            <span style={{ fontFamily: "'Courier New', monospace", fontSize: 12, fontWeight: 700, color: '#ff4444', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', padding: '0 16px' }}>
              {alert.blockReason || 'Video Melanggar Kebijakan'}
            </span>
          </div>
        </div>
      );
    }

    const t = detectMediaType(alert.mediaUrl, alert.mediaType);
    const embedUrl = t === 'youtube'
      ? getYouTubeEmbedUrl(alert.mediaUrl, alert.startTime || 0)
      : t === 'tiktok' ? getTikTokEmbedUrl(alert.mediaUrl) : null;

    return (
      <div style={{ width: '100%', aspectRatio: t === 'tiktok' ? '9/16' : '16/9', overflow: 'hidden', background: '#000', borderBottom: pixelBorder, position: 'relative', zIndex: 2 }}>
        {t === 'youtube' && embedUrl && (
          <iframe key={embedUrl} src={embedUrl} width="100%" height="100%" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen style={{ display: 'block', border: 'none' }} />
        )}
        {t === 'tiktok' && (() => {
          const streamUrl = `${API_URL}/api/midtrans/tiktok-stream?url=${encodeURIComponent(alert.mediaUrl)}`;
          return <video key={streamUrl} src={streamUrl} autoPlay loop muted={false} playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setMediaError(true)} />;
        })()}
        {t === 'video' && (
          <video ref={videoRef} src={alert.mediaUrl} autoPlay loop muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setMediaError(true)} />
        )}
        {t === 'image' && (
          <img src={alert.mediaUrl} alt="media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setMediaError(true)} />
        )}
      </div>
    );
  })();

  // modern
  if (theme === 'modern') {
    return (
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={scanlineStyle} />
        {mediaBlock}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: hl + '18', borderBottom: pixelBorder, padding: '5px 10px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: monospace, fontSize: 23, color: hl, letterSpacing: '-1px' }}>(o_o)</span>
            <span style={{ fontFamily: monospace, fontSize: 16, color: hl, textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 700 }}>Media share</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['#ff4444', '#ffaa00', hl].map((c, i) => (
              <span key={i} style={{ width: 7, height: 7, background: c, display: 'inline-block', border: '1px solid rgba(255,255,255,0.2)' }} />
            ))}
          </div>
        </div>
        <div style={{ padding: '10px 12px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, border: pixelBorder, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 23, background: hl + '12' }}>
              {renderIcon(customIcon, 20)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: monospace, fontSize: 10, color: fg, marginBottom: 2, letterSpacing: '0.1em' }}>{'> DONOR:'}</div>
              <div style={{ fontFamily: monospace, fontSize: 17, fontWeight: 900, color: fg, lineHeight: 1.1 }}>{alert.donorName}</div>
            </div>
          </div>
          <div style={{ fontFamily: monospace, fontSize: 24, fontWeight: 900, color: hl, letterSpacing: '-1px', lineHeight: 1, borderLeft: `3px solid ${hl}`, paddingLeft: 8, marginBottom: 6, textShadow: `0 0 10px ${hl}55` }}>
            Rp {Number(alert.amount).toLocaleString('id-ID')}
          </div>
          {alert.message && (
            <div style={{ fontFamily: monospace, fontSize: 23, color: fg, fontWeight: 900, background: 'rgba(255,255,255,0.04)', border: dimBorder, padding: '5px 8px', lineHeight: 1.4, marginBottom: 6 }}>
              {'>> '}{alert.message}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            {showTs && alert?.receivedAt
              ? <div style={{ fontFamily: monospace, fontSize: 16, color: 'rgba(255,255,255,0.35)' }}>{'> '}{formatTimestamp(alert.receivedAt)}</div>
              : <div />
            }
            <div style={{ display: 'flex', gap: 2 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} style={{ width: 6, height: 6, display: 'inline-block', background: i < Math.round(progress / 12.5) ? hl : hl + '22' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (theme === 'smooth') {
    return (
      <div style={{ fontFamily: "'Poppins', sans-serif", overflow: 'hidden' }}>
        {mediaBlock}
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: hl + '22', border: `1.5px solid ${hl}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              {renderIcon(customIcon, 18)}
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: fg }}>{alert.donorName}</div>
            </div>
          </div>
          <div style={{ height: 1, background: hl + '25', borderRadius: 99 }} />
          <div style={{ fontSize: 26, fontWeight: 800, color: hl, letterSpacing: '-0.5px', lineHeight: 1 }}>Rp {Number(alert.amount).toLocaleString('id-ID')}</div>
          {alert.message && (
            <div style={{ fontSize: 24, color: fg, fontWeight: 900, background: hl + '10', borderRadius: 8, padding: '6px 10px', lineHeight: 1.5, border: `1px solid ${hl}20` }}>{alert.message}</div>
          )}
          {showTs && alert?.receivedAt && (
            <div style={{ fontSize: 22, color: fg }}>{formatTimestamp(alert.receivedAt)}</div>
          )}
          <div style={{ height: 3, background: hl + '25', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: hl, borderRadius: 99, transition: 'width 50ms linear' }} />
          </div>
        </div>
      </div>
    );
  }

  if (theme === 'classic') {
    return (
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={scanlineStyle} />
        {mediaBlock}
        <div style={{ height: 3, background: hl, position: 'relative', zIndex: 2 }} />
        <div style={{ background: hl + '15', borderBottom: `1px solid ${hl}40`, padding: '7px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 16 }}>{renderIcon(customIcon, 16)}</span>
            <span style={{ fontFamily: monospace, fontSize: 10, fontWeight: 700, color: hl, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Media share</span>
          </div>
          <span style={{ fontFamily: monospace, fontSize: 23, color: hl, letterSpacing: '-1px' }}>(o_o)</span>
        </div>
        <div style={{ padding: '10px 12px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, borderBottom: `1px dashed ${hl}30`, paddingBottom: 6 }}>
            <span style={{ fontFamily: monospace, fontSize: 16, color: hl, letterSpacing: '0.12em' }}>NAME</span>
            <span style={{ fontFamily: monospace, fontSize: 16, fontWeight: 900, color: fg }}>{alert.donorName}</span>
          </div>
          <div style={{ fontFamily: monospace, fontSize: 22, fontWeight: 900, color: hl, letterSpacing: '-0.5px', marginBottom: 5, textShadow: `0 0 10px ${hl}50` }}>
            Rp {Number(alert.amount).toLocaleString('id-ID')}
          </div>
          {alert.message && (
            <div style={{ fontFamily: monospace, fontSize: 23, color: fg, lineHeight: 1.45, borderLeft: `2px solid ${hl}`, paddingLeft: 8, marginBottom: 6 }}>
              {alert.message}<span style={{ color: hl, animation: 'blink 1s step-end infinite' }}>▮</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
            {showTs && alert?.receivedAt
              ? <div style={{ fontFamily: monospace, fontSize: 16, color: 'rgba(255,255,255,0.35)' }}>{'> '}{formatTimestamp(alert.receivedAt)}</div>
              : <div />
            }
            <div style={{ fontFamily: monospace, fontSize: 8, color: hl, letterSpacing: '0.08em' }}>[ PRESS ▲ TO CONTINUE ]</div>
          </div>
          <div style={{ height: 2, background: 'rgba(255,255,255,0.08)', marginTop: 8 }}>
            <div style={{ height: '100%', width: `${progress}%`, background: hl, transition: 'width 50ms linear' }} />
          </div>
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ height: 3, background: hl }} />
        <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
      </div>
    );
  }

  // minimal
  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={scanlineStyle} />
      {mediaBlock}
      <div style={{ padding: '10px 12px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: monospace, fontSize: 23, color: hl, letterSpacing: '-1px' }}>(o_o)</span>
            <span style={{ fontFamily: monospace, fontSize: 8, color: hl, letterSpacing: '0.18em', textTransform: 'uppercase' }}>MEDIA</span>
          </div>
          <span style={{ fontFamily: monospace, fontSize: 23, fontWeight: 900, color: hl, letterSpacing: '-1px', textShadow: `0 0 8px ${hl}50` }}>
            Rp {Number(alert.amount).toLocaleString('id-ID')}
          </span>
        </div>
        <div style={{ fontFamily: monospace, fontSize: 15, fontWeight: 900, color: fg, marginBottom: 3, borderBottom: `1px solid ${hl}20`, paddingBottom: 5 }}>
          {'> '}{alert.donorName}
        </div>
        {alert.message && (
          <div style={{ fontFamily: monospace, fontSize: 10, color: fg, lineHeight: 1.4, marginBottom: 4 }}>{alert.message}</div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {showTs && alert?.receivedAt
            ? <div style={{ fontFamily: monospace, fontSize: 16, color: 'rgba(255,255,255,0.35)' }}>{'> '}{formatTimestamp(alert.receivedAt)}</div>
            : <div />
          }
          <div style={{ fontFamily: monospace, fontSize: 8, color: hl, letterSpacing: '2px' }}>{'- - - - - - - -'}</div>
        </div>
        <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', marginTop: 6 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: hl, transition: 'width 50ms linear' }} />
        </div>
      </div>
    </div>
  );
};

const renderVoiceInner = ({ alert, config, progress, audioProgress, isPlaying }) => {
  const hl        = config.highlightColor || '#a5b4fc';
  const fg        = config.textColor      || '#ffffff';
  const theme     = config.theme          || 'modern';
  const monospace = "'Courier New', 'Lucida Console', monospace";

  const vbars = Array.from({ length: 16 });
  const barStyle = (i) => ({
    width: 4, display: 'inline-block',
    background: isPlaying ? hl : hl + '30',
    height: isPlaying ? `${30 + Math.abs(Math.sin(i * 0.7)) * 70}%` : '20%',
    animation: isPlaying ? `vbar${i % 5} ${0.35 + (i % 4) * 0.07}s ease-in-out infinite alternate` : 'none',
    transition: 'background 0.3s',
  });

  const vbarKeyframes = `
    @keyframes vbar0 { from{height:20%} to{height:85%} }
    @keyframes vbar1 { from{height:35%} to{height:70%} }
    @keyframes vbar2 { from{height:50%} to{height:95%} }
    @keyframes vbar3 { from{height:25%} to{height:75%} }
    @keyframes vbar4 { from{height:40%} to{height:60%} }
  `;

  if (theme === 'smooth') {
    return (
      <div style={{ fontFamily: "'Poppins', sans-serif", padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: hl + '22', border: `1.5px solid ${hl}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            🎙️
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 500, color: fg, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Voice Donation</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: fg }}>{alert.donorName}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: hl, letterSpacing: '-0.5px' }}>Rp {Number(alert.amount).toLocaleString('id-ID')}</div>
          </div>
        </div>
        <div style={{ height: 1, background: hl + '25', borderRadius: 99 }} />
        {alert.message && (
          <div style={{ fontSize: 13, color: fg, background: hl + '10', borderRadius: 10, padding: '8px 12px', lineHeight: 1.5, border: `1px solid ${hl}20` }}>
            {alert.message}
          </div>
        )}
        <div style={{ background: hl + '0d', borderRadius: 10, padding: '8px 12px', border: `1px solid ${hl}20`, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 24 }}>
            {vbars.map((_, i) => <span key={i} style={{ ...barStyle(i), borderRadius: 2 }} />)}
          </div>
          <div style={{ height: 3, background: hl + '25', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${audioProgress}%`, background: isPlaying ? '#22c55e' : hl, borderRadius: 99, transition: 'width 100ms linear' }} />
          </div>
        </div>
        {alert.receivedAt && (
          <div style={{ fontSize: 11, color: fg }}>
            {new Date(alert.receivedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
        <div style={{ height: 3, background: hl + '20', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: hl, borderRadius: 99, transition: 'width 50ms linear' }} />
        </div>
        <style>{vbarKeyframes}</style>
      </div>
    );
  }

  // modern / classic / minimal → pakai layout retro sama seperti VoiceNoteOverlay
  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)', pointerEvents: 'none', zIndex: 1 }} />
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: hl + '18', borderBottom: `2px solid ${hl}`, padding: '5px 10px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: monospace, fontSize: 11, color: hl, letterSpacing: '-1px' }}>(o_o)</span>
          <span style={{ fontFamily: monospace, fontSize: 9, color: hl, textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 700 }}>VOICE DONATION</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 7, height: 7, display: 'inline-block', background: isPlaying ? '#22c55e' : hl + '50', border: `1px solid ${isPlaying ? '#22c55e' : hl}`, transition: 'all 0.3s' }} />
          <span style={{ fontFamily: monospace, fontSize: 8, color: isPlaying ? '#22c55e' : hl, opacity: isPlaying ? 1 : 0.5, letterSpacing: '0.1em', transition: 'all 0.3s' }}>
            {isPlaying ? 'PLAYING' : 'READY'}
          </span>
        </div>
      </div>
      {/* Body */}
      <div style={{ padding: '10px 12px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, border: `2px solid ${hl}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: hl + '12' }}>🎙️</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: monospace, fontSize: 10, color: fg, marginBottom: 2, letterSpacing: '0.1em' }}>{'> DONOR:'}</div>
            <div style={{ fontFamily: monospace, fontSize: 15, fontWeight: 900, color: fg, lineHeight: 1.1 }}>{alert.donorName}</div>
            <div style={{ fontFamily: monospace, fontSize: 16, fontWeight: 900, color: hl, letterSpacing: '-0.5px', marginTop: 2, textShadow: `0 0 8px ${hl}55` }}>
              Rp {Number(alert.amount).toLocaleString('id-ID')}
            </div>
          </div>
        </div>
        {alert.message && (
          <div style={{ fontFamily: monospace, fontSize: 10, color: fg, background: 'rgba(255,255,255,0.04)', border: `1px solid ${hl}35`, padding: '5px 8px', lineHeight: 1.4, marginBottom: 8 }}>
            {'>> '}{alert.message}
          </div>
        )}
        {/* Visualizer */}
        <div style={{ border: `1px solid ${hl}35`, background: 'rgba(0,0,0,0.25)', padding: '7px 10px', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 24, marginBottom: 5 }}>
            {vbars.map((_, i) => <span key={i} style={barStyle(i)} />)}
          </div>
          <div style={{ height: 2, background: 'rgba(255,255,255,0.08)' }}>
            <div style={{ height: '100%', width: `${audioProgress}%`, background: isPlaying ? '#22c55e' : hl, transition: 'width 100ms linear, background 0.3s' }} />
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
      <style>{vbarKeyframes}</style>
    </div>
  );
};

// ── CombinedOverlay — Main Component ─────────────────────────────────────────
const CombinedOverlay = () => {
  const { token } = useParams();
  const videoRef  = useRef(null);

  // State terpisah: satu untuk alert biasa, satu untuk mediashare
  const [alertData,  setAlertData]  = useState(null);  // donasi biasa
  const [mediaData,  setMediaData]  = useState(null);  // mediashare
  const [config,     setConfig]     = useState(null);

  const [alertProgress, setAlertProgress] = useState(100);
  const [mediaProgress, setMediaProgress] = useState(100);
  const [mediaError,    setMediaError]    = useState(false);

  // Voice note state
  const [voiceData,       setVoiceData]       = useState(null);
  const [voiceProgress,   setVoiceProgress]   = useState(100);
  const [voiceAudioProg,  setVoiceAudioProg]  = useState(0);
  const [voiceIsPlaying,  setVoiceIsPlaying]  = useState(false);

  // Voice refs
  const voiceAudioRef       = useRef(null);
  const voiceIntervalRef    = useRef(null);
  const voiceTimerRef       = useRef(null);
  const voiceAudioProgRef   = useRef(null);
  const voiceDurationMsRef  = useRef(0);

  const audioRef            = useRef(null);
  const configRef           = useRef(null);
  const alertIntervalRef    = useRef(null);
  const alertTimerRef       = useRef(null);
  const mediaIntervalRef    = useRef(null);
  const mediaTimerRef       = useRef(null);

  const clearMediaDisplay = useCallback(() => {
    // Stop audio
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }

    // Stop video (local)
    if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
        videoRef.current.load();
    }

    // Stop YouTube iframe
    const youtubeIframe = document.querySelector('iframe[src*="youtube"]');
    if (youtubeIframe) {
        try {
            youtubeIframe.contentWindow?.postMessage(
                JSON.stringify({ event: 'command', func: 'pauseVideo' }),
                '*'
            );
        } catch (e) {}
        // Kosongkan src agar benar-benar stop
        setTimeout(() => {
            youtubeIframe.src = '';
        }, 100);
    }

    // Stop TikTok / video stream
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach(v => {
        v.pause();
        v.src = '';
        v.load();
    });

    setMediaData(null);        // ← Penting!
    setMediaProgress(100);
  }, []);

  const stopVoiceAudio = useCallback(() => {
    if (voiceAudioProgRef.current) clearInterval(voiceAudioProgRef.current);
    if (voiceIntervalRef.current)  clearInterval(voiceIntervalRef.current);
    if (voiceTimerRef.current)     clearTimeout(voiceTimerRef.current);
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current.src = '';
    }
    setVoiceData(null);
    setVoiceProgress(100);
    setVoiceAudioProg(0);
    setVoiceIsPlaying(false);
  }, []);

  // TTS
  const speakDonation = useCallback(async (donation) => {
    if (!configRef.current?.ttsEnabled) return;
    const text = `${donation.donorName || 'Seseorang'} memberikan donasi Rp ${Number(donation.amount).toLocaleString('id-ID')}. ${donation.message || ''}`;
    try {
      const res = await fetch(`${API_URL}/api/overlay/tts/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceName: 'id-ID-GadisNeural' }),
      });
      if (!res.ok) throw new Error('TTS gagal');
      const blob  = await res.blob();
      const url   = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume  = configRef.current.ttsVolume || 1.0;
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
    } catch (err) {
      console.error('[TTS]', err);
    }
  }, []);

  // Fetch config
  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API_URL}/api/overlay/config/${token}`)
      .then((res) => { setConfig(res.data); configRef.current = res.data; })
      .catch(() => console.error('[CombinedOverlay] Invalid token'));
  }, [token]);

  // Socket
  useEffect(() => {
    if (!token) return;

    const socket = io(API_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
    });

    const joinRooms = () => {
      socket.emit('join-room', token);
      socket.emit('join-room', `${token}-mediashare`);
      socket.emit('join-room', `${token}-voice`); 
      console.log(`[CombinedOverlay] ✅ Joined: ${token} & ${token}-mediashare`);
    };

    socket.on('connect',    () => { console.log(`[CombinedOverlay] 🔌 Connected: ${socket.id}`); joinRooms(); });
    socket.on('reconnect',  (n) => { console.log(`[CombinedOverlay] 🔄 Reconnected (${n})`); joinRooms(); });
    socket.on('disconnect', (r) => console.warn(`[CombinedOverlay] ❌ Disconnected: ${r}`));
    socket.on('connect_error', (e) => console.error(`[CombinedOverlay] ⚠️ Connect error: ${e.message}`));

    // ── Donasi biasa ──────────────────────────────────────────────────────────
    socket.on('new-donation', (data) => {
      if (configRef.current?.overlayEnabled === false) return;


      // ← clear mediashare dulu
      clearMediaDisplay();
      setMediaProgress(100);
      if (mediaIntervalRef.current) clearInterval(mediaIntervalRef.current);
      if (mediaTimerRef.current)    clearTimeout(mediaTimerRef.current);

      const donation = { ...data, receivedAt: data.receivedAt || new Date().toISOString() };
      setAlertData(donation);
      setAlertProgress(100);

      const soundToPlay = data.voiceUrl || data.soundUrl || configRef.current?.soundUrl;
      if (soundToPlay && audioRef.current) {
        audioRef.current.src = soundToPlay;
        audioRef.current.play().catch(() => {});
      }
      speakDonation(donation);

      const duration = getAlertDuration(configRef.current, Number(donation.amount));
      if (alertIntervalRef.current) clearInterval(alertIntervalRef.current);
      if (alertTimerRef.current)    clearTimeout(alertTimerRef.current);

      const startTime = Date.now();
      alertIntervalRef.current = setInterval(() => {
        const elapsed   = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setAlertProgress(remaining);
        if (remaining <= 0) clearInterval(alertIntervalRef.current);
      }, 50);
      alertTimerRef.current = setTimeout(() => {
        setAlertData(null);
        setAlertProgress(100);
      }, duration);
    });

    // ── MediaShare ────────────────────────────────────────────────────────────
    socket.on('new-media-donation', (data) => {
        if (configRef.current?.overlayEnabled === false) return;

        // Clear alert dulu
        setAlertData(null);
        setAlertProgress(100);
        if (alertIntervalRef.current) clearInterval(alertIntervalRef.current);
        if (alertTimerRef.current) clearTimeout(alertTimerRef.current);

        const donation = { ...data, receivedAt: data.receivedAt || new Date().toISOString() };
        
        setMediaData(donation);
        setMediaProgress(100);
        setMediaError(false);

        // Play sound
        const soundToPlay = data.soundUrl || configRef.current?.soundUrl;
        if (soundToPlay && audioRef.current) {
            audioRef.current.src = soundToPlay;
            audioRef.current.play().catch(() => {});
        }

        const duration = calculateMediaShareDuration(configRef.current, Number(donation.amount));

        // Clear previous timers
        if (mediaIntervalRef.current) clearInterval(mediaIntervalRef.current);
        if (mediaTimerRef.current) clearTimeout(mediaTimerRef.current);

        const startTime = Date.now();
        mediaIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setMediaProgress(remaining);
            if (remaining <= 0) clearInterval(mediaIntervalRef.current);
        }, 40);

        // Timer untuk menghilangkan overlay + media
        mediaTimerRef.current = setTimeout(() => {
            clearMediaDisplay();
        }, duration);
    });

    socket.on('new-voice-donation', (data) => {
      if (configRef.current?.overlayEnabled === false) return;

      // Clear semua overlay lain
      setAlertData(null);
      setAlertProgress(100);
      if (alertIntervalRef.current) clearInterval(alertIntervalRef.current);
      if (alertTimerRef.current)    clearTimeout(alertTimerRef.current);
      clearMediaDisplay();
      if (mediaIntervalRef.current) clearInterval(mediaIntervalRef.current);
      if (mediaTimerRef.current)    clearTimeout(mediaTimerRef.current);

      // Stop voice sebelumnya kalau ada
      stopVoiceAudio();

      const absoluteVoiceUrl = data.voiceUrl?.startsWith('http')
        ? data.voiceUrl
        : data.voiceUrl ? `${API_URL}${data.voiceUrl}` : null;

      const donation = {
        ...data,
        voiceUrl: absoluteVoiceUrl,
        receivedAt: data.receivedAt || new Date().toISOString(),
      };

      setVoiceData(donation);
      setVoiceProgress(100);
      setVoiceAudioProg(0);
      setVoiceIsPlaying(false);

      const INTRO_DELAY     = 1000;
      const FALLBACK_MS     = 10000;

      const startDismissTimer = (audioDurationMs) => {
        voiceDurationMsRef.current = audioDurationMs;
        const TOTAL = INTRO_DELAY + audioDurationMs;
        if (voiceTimerRef.current) clearTimeout(voiceTimerRef.current);
        voiceTimerRef.current = setTimeout(() => {
          stopVoiceAudio();
        }, TOTAL);
      };

      if (!absoluteVoiceUrl || !voiceAudioRef.current) {
        // Fallback tanpa audio
        voiceDurationMsRef.current = FALLBACK_MS;
        const startTime = Date.now();
        voiceIntervalRef.current = setInterval(() => {
          const remaining = Math.max(0, 100 - ((Date.now() - startTime) / FALLBACK_MS) * 100);
          setVoiceProgress(remaining);
          if (remaining <= 0) clearInterval(voiceIntervalRef.current);
        }, 50);
        voiceTimerRef.current = setTimeout(() => stopVoiceAudio(), FALLBACK_MS);
        return;
      }

      const audio = voiceAudioRef.current;
      audio.src = absoluteVoiceUrl;
      audio.load();

      let countdownStarted = false;

      const metaTimeout = setTimeout(() => {
        if (!countdownStarted) {
          countdownStarted = true;
          startDismissTimer(60 * 1000);
        }
      }, 2000);

      audio.onloadedmetadata = () => {
        clearTimeout(metaTimeout);
        const raw = audio.duration;
        const dur = isFinite(raw) && raw > 0 ? Math.min(raw, 60) : null;
        if (dur && !countdownStarted) {
          countdownStarted = true;
          startDismissTimer(dur * 1000);
        }
      };

      audio.onplay = () => {
        setVoiceIsPlaying(true);
        console.log('[onplay] audio.duration:', audio.duration);
        console.log('[onplay] voiceDurationMsRef:', voiceDurationMsRef.current);

        // Audio progress tracker
        if (voiceAudioProgRef.current) clearInterval(voiceAudioProgRef.current);
        voiceAudioProgRef.current = setInterval(() => {
          if (!voiceAudioRef.current) return;
          const { currentTime, duration } = voiceAudioRef.current;
          if (duration > 0) {
            const pct = (currentTime / duration) * 100;
            setVoiceAudioProg(pct);
            setVoiceProgress(100 - pct); // ← sync langsung, tidak hitung terpisah
          }
        }, 100);

        // // Progress bar — pakai durasi dari audio element langsung
        // if (voiceIntervalRef.current) clearInterval(voiceIntervalRef.current);
        // const startTime = Date.now();
        // const dur = isFinite(audio.duration) && audio.duration > 0
        //   ? audio.duration * 1000
        //   : voiceDurationMsRef.current;

        // voiceIntervalRef.current = setInterval(() => {
        //   const remaining = Math.max(0, 100 - ((Date.now() - startTime) / dur) * 100);
        //   setVoiceProgress(remaining);
        //   if (remaining <= 0) clearInterval(voiceIntervalRef.current);
        // }, 50);
      };

      audio.onended = () => {
        if (voiceAudioProgRef.current) clearInterval(voiceAudioProgRef.current);
        setVoiceAudioProg(100);  // ← pastikan keduanya full saat selesai
        setVoiceProgress(0);
        setVoiceIsPlaying(false);
        if (!countdownStarted) {
          countdownStarted = true;
          startDismissTimer(0);
        }
      };

      audio.onerror = () => {
        clearTimeout(metaTimeout);
        setVoiceIsPlaying(false);
        if (!countdownStarted) {
          countdownStarted = true;
          startDismissTimer(FALLBACK_MS);
        }
      };

      setTimeout(() => {
        audio.play().catch(() => setVoiceIsPlaying(false));
      }, INTRO_DELAY);
    });

    // ── MediaShare control (skip/volume) ──────────────────────────────────────
    socket.on('mediashare-control', ({ action, volume }) => {
      if (action === 'skip') {
        clearMediaDisplay();
        setMediaProgress(100);
        if (mediaIntervalRef.current) clearInterval(mediaIntervalRef.current);
        if (mediaTimerRef.current)    clearTimeout(mediaTimerRef.current);
        if (audioRef.current)  { audioRef.current.pause(); audioRef.current.currentTime = 0; }
        if (videoRef.current)  videoRef.current.src = '';
      }
      if (action === 'volume' && typeof volume === 'number') {
        if (audioRef.current) audioRef.current.volume = volume / 100;
        if (videoRef.current) videoRef.current.volume = volume / 100;
      }
    });

    socket.on('settings-updated', (newConfig) => {
      setConfig(newConfig);
      configRef.current = newConfig;
      if (newConfig.overlayEnabled === false) {
        setAlertData(null); clearMediaDisplay();
        stopVoiceAudio();
        setAlertProgress(100); setMediaProgress(100);
        [alertIntervalRef, mediaIntervalRef].forEach(r => clearInterval(r.current));
        [alertTimerRef, mediaTimerRef].forEach(r => clearTimeout(r.current));
      }
    });

    return () => {
      ['connect','reconnect','disconnect','connect_error','new-donation','new-media-donation', 'new-voice-donation', 'mediashare-control','settings-updated']
        .forEach(ev => socket.off(ev));
      socket.disconnect();
      [alertIntervalRef, mediaIntervalRef].forEach(r => clearInterval(r.current));
      [alertTimerRef, mediaTimerRef].forEach(r => clearTimeout(r.current));
      clearMediaDisplay();
      stopVoiceAudio();
    };
  }, [token, speakDonation, clearMediaDisplay, stopVoiceAudio]);

  if (!config) return null;
  if (config.overlayEnabled === false) {
    return <div style={{ width: '100vw', height: '100vh', background: 'transparent' }} />;
  }

  const bg          = config.primaryColor   || '#6366f1';
  const fg          = config.textColor      || '#ffffff';
  const borderColor = config.borderColor    || 'rgba(255,255,255,0.15)';
  const theme       = config.theme          || 'modern';
  const animation   = config.animation      || 'bounce';
  const maxW        = config.maxWidth       || 340;

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

  const wrapperStyle = {
    backgroundColor: bg,
    color: fg,
    width: `${maxW}px`,
    borderRadius: theme === 'smooth' ? 20 : 0,
    border: `1px solid ${borderColor}`,
    boxShadow: '0 16px 40px rgba(0,0,0,0.55)',
    overflow: 'hidden',
    fontFamily: "'Inter', -apple-system, 'Segoe UI', sans-serif",
  };

  // Tampilkan MediaShare di atas, Alert di bawah (atau sesuaikan posisi)
  // Keduanya bisa tampil bersamaan karena ada 2 state terpisah
  const showAlert = !!alertData;
  const showMedia = !!mediaData;

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 16,
      background: 'transparent', overflow: 'hidden',
    }}>
      <audio ref={audioRef} />
      <audio ref={voiceAudioRef} />

      {/* MediaShare — tampil di atas */}
      <AnimatePresence>
        {showMedia && (
          <motion.div
            key={mediaData.receivedAt || 'media'}
            initial={anim.initial}
            animate={anim.animate}
            exit={anim.exit}
            style={wrapperStyle}
          >
            {renderMediaInner({ alert: mediaData, config, progress: mediaProgress, videoRef, setMediaError })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Note */}
      <AnimatePresence>
        {voiceData && (
          <motion.div
            key={voiceData.receivedAt || 'voice'}
            initial={anim.initial}
            animate={anim.animate}
            exit={anim.exit}
            style={wrapperStyle}
          >
            {renderVoiceInner({
              alert: voiceData,
              config,
              progress: voiceProgress,
              audioProgress: voiceAudioProg,
              isPlaying: voiceIsPlaying,
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert biasa — tampil di bawah */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            key={alertData.receivedAt || 'alert'}
            initial={anim.initial}
            animate={anim.animate}
            exit={anim.exit}
            style={wrapperStyle}
          >
            {renderAlertInner({ alert: alertData, config, progress: alertProgress })}
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

export default CombinedOverlay;