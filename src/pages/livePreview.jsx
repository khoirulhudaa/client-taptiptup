import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import StoreManager from './storeManager';           // buat file baru
import StoreWidget from '../components/storeWidget'; // widget OBS
import DonationItemsEditor from '../components/donationItems'; // widget OBS
import confetti from 'canvas-confetti';
import { useWindowSize } from '@react-hook/window-size';
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  Grid,
  HeadphonesIcon,
  Heart,
  Image,
  ImageIcon,
  List,
  Loader2,
  Menu,
  MessageSquare,
  Mic,
  Moon,
  Music,
  PanelLeft,
  Pause,
  Play,
  Plus,
  RefreshCw,
  ReplyAll,
  Save,
  Settings,
  ShieldCheck,
  Sun,
  Timer,
  Trash2,
  TrendingUp,
  Trophy,
  Upload,
  User,
  Users,
  Verified,
  Video,
  Maximize2, 
  MonitorPlay,
  Vote,
  X,
  Zap,
  ChevronDown,
  Link,
  CopyIcon,
  CopyCheck,
  Users2,
  Monitor,
  Link2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import Sidebar from '../components/sidebar';
import { LeaderboardSettings, MilestonesManager, PollManager, SubathonManager } from '../components/streamerExtras';
import { TopNavbar } from '../components/topNavbar';
import { useTheme } from '../hooks/useTheme';
import api from '../lib/axiosInstance';
import GhostAlertPage from './ghotAlert';
import { ContactPage } from './support';
import { WithdrawPage } from './withdrawPage';
import MyDonationsHistory from './MyDonationsHistory';
import { useSearchParams } from 'react-router-dom';
import Badge from '../components/badge';
import React from 'react';
import AudioManager from '../components/AudioManager';
import toast from 'react-hot-toast';
import { MediaShareControl } from '../components/mediaShareController';
import { FeeConfigPage } from './feeConfig';
import { WhatsAppPage } from './whatsappPage';
import { SuggestionsAdmin } from './suggestionAdmin';
import { ALERT_PRESETS } from '../constants/alertPresets';
import CustomerServiceWidget from '../components/customerWidget';
import DashboardSuperPage from './dashboardSuperPage';
import InboxBell, { InboxPage } from '../components/inboxBell';
import AdminAnnouncementsPage from './adminannouncements';
import MaintenancePage from './maintenancePage';
import { useMaintenance } from '../hooks/useMaintenance';
import MaintenanceScreen from '../components/MaintenanceScreen';
import VoiceSettingsPage from './voiceSetting';
import DonationTerminal from './DonationTerminal';
import OnboardingTour from '../components/onboardingTour';
import LoadingOverlay from '../components/overlayLoading';
import StreamerManagerPage from './streamerManager';
import MarqueeConfigPanel from './marqueeConfigPanel';
import OBSConnectPanel from '../components/obsInject';
import { VideoTutorialSection } from './videoTutorial';
import DonatePageConfig from './donateConfig';
import { createPortal } from 'react-dom';
import QrConfigPage from './qrConfig';

const DEFAULT_SETTINGS = {
  minDonate: 10000,
  maxDonate: 5000000,
  overlayEnabled: true,
  donationItems: [],
  donationItemsEnabled: false,
  customIcon: '',
  progressBarColor: '#39ff14',
  showTimestamp: true,
  theme: 'modern',
  soundTiers: [],
  borderColor: '#ffffff26',
  primaryColor: '#2e2f42',
  donationItemsMode: 'both',
  textColor: '#ffffff',
  alertBaseDuration: 12,
  publicSounds: [],
  publicSoundDefault: '',  
  animation: 'bounce',
  quickAmounts: [10000, 25000, 50000, 100000, 250000],
  maxWidth: 280,
  overlayPosition: 'bottom-left',
  baseDuration: 5,
  extraPerAmount: 10000,
  extraDuration: 1,
  durationTiers: [
    { minAmount: 0,     maxAmount: 4999,  duration: 5  },
    { minAmount: 5000,  maxAmount: 49999, duration: 10 },
    { minAmount: 50000, maxAmount: null,  duration: 20 },
  ],
  mediaTriggers: [],
  quickAmounts: [10000, 20000, 50000, 100000],
};

const ICON_PRESETS = [
  { emoji: '❤️', label: 'Default' }, { emoji: '💜',  label: 'Ungu'  },
  { emoji: '🐧', label: 'Penguin' },
  { emoji: '🔥',  label: 'Api'    }, { emoji: '⭐',  label: 'Bintang'},
  { emoji: '🎮',  label: 'Gamer'  }, { emoji: '🎵',  label: 'Musik'  },
  { emoji: '🐉',  label: 'Naga'   }, { emoji: '💰',  label: 'Duit'   },
  { emoji: '🎯',  label: 'Target' }, { emoji: '👑',  label: 'Raja'   },
  { emoji: '🌟',  label: 'Gemilang'}, { emoji: '🚀', label: 'Roket'  },
  { emoji: '⚡',  label: 'Kilat'  },
  { emoji: '💎',  label: 'Permata'},
  { emoji: '🤖',  label: 'Robot'  },
];

const renderIconPreview = (customIcon, size = 20) => {
  if (!customIcon) return '❤️';
  if (customIcon.startsWith('http') || customIcon.startsWith('/')) {
    return <img src={customIcon} alt="icon" style={{ width: size, height: size, objectFit: 'contain', borderRadius: 4, display: 'inline-block' }} />;
  }
  return customIcon;
};

export const YouTubeLivePreview2 = ({ settings, username, testFullScreen, onPreviewModeChange, autoPreviewTick, onTogglePreview }) => {
  const [showAlert, setShowAlert] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [currentDonor, setCurrentDonor] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timerRef = useRef(null);
  const donorIdxRef = useRef(0);
  const [previewMode, setPreviewMode] = useState('alert'); // 'alert' | 'media'
  const [mediaUrl, setMediaUrl] = useState('https://picsum.photos/400/300');

  const MEDIA_PRESETS = [
    { url: 'https://picsum.photos/400/300?random=1', type: 'image', label: 'Foto' },
    { url: 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif', type: 'image', label: 'GIF' },
    { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', type: 'youtube', label: 'YouTube' },
  ];

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const watchMatch = url.match(/youtube\.com\/watch\?v=([\w-]+)/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1&mute=0&controls=0&loop=1&playlist=${watchMatch[1]}`;
    const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1&mute=0&controls=0&loop=1&playlist=${shortMatch[1]}`;
    return null;
  };

  const detectMediaType = (url) => {
    if (!url) return 'image';
    if (url.match(/youtube\.com\/watch\?v=/) || url.match(/youtu\.be\//)) return 'youtube';
    if (/\.(mp4|webm|mov)$/i.test(url)) return 'video';
    return 'image';
  };

  const renderMediaAlert = () => {
    if (!currentDonor) return null;
    // if (settings.theme === 'gifCard') return null;
    const hl = settings.highlightColor || '#39ff14';
    const fg = settings.textColor || '#c8f5c8';
    const bg = settings.primaryColor || '#2e2f42';
    const monospace = "'Inter', 'Courier New', monospace";
    const scanlineStyle = {
      position: 'absolute', inset: 0,
      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
      pointerEvents: 'none', zIndex: 1,
    };
    const pixelBorder = `2px solid ${hl}`;
    const dimBorder = `1px solid ${hl}40`;
    const mType = detectMediaType(mediaUrl);

    const MediaBlock = () => (
      <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: '#000', borderBottom: pixelBorder, position: 'relative', zIndex: 2 }}>
        {mType === 'youtube' ? (
          <iframe src={getYouTubeEmbedUrl(mediaUrl)} width="100%" height="100%" frameBorder="0"
            allow="autoplay; encrypted-media" allowFullScreen style={{ display: 'block', border: 'none' }} />
        ) : mType === 'video' ? (
          <video src={mediaUrl} autoPlay loop muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <img src={mediaUrl} alt="media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>
    );

    const theme = settings.theme || 'modern';
    const wrapperBase = {
      backgroundColor: bg, color: fg,
      maxWidth: `${settings.maxWidth || 380}px`,
      minWidth: '340px',
      width: '100%', overflow: 'hidden',
    };

     if (theme === 'gifCard') {
      return (
          <div style={{
            ...wrapperBase,
            backgroundColor: 'transparent',
            border: 'none',
            boxShadow: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            overflow: 'visible',
          }}>   
          {/* Media block */}
          <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: '#000', borderBottom: `1px solid ${hl}25`, borderRadius: 18 }}>
            {mType === 'youtube' ? (
              <iframe src={getYouTubeEmbedUrl(mediaUrl)} width="100%" height="100%" frameBorder="0"
                allow="autoplay; encrypted-media" allowFullScreen style={{ display: 'block', border: 'none' }} />
            ) : mType === 'video' ? (
              <video src={mediaUrl} autoPlay loop muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <img src={mediaUrl} alt="media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>
          {/* Info area */}
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', textAlign: 'center', gap: 7, alignItems: 'center', justifyContent: 'center'}}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 'max-content' }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 500, color: 'white', borderBottom: `1px solid ${hl}25` }}>
                {currentDonor.name} mengirim
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, marginLeft: 5, fontWeight: 500, color: hl, letterSpacing: '-0.5px', lineHeight: 1, textShadow: `0 0 10px ${hl}55` }}>
                Rp {currentDonor.amount.toLocaleString('id-ID')}
              </div>
            </div>
            {currentDonor.msg && (
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: 'black', fontWeight: 400, background: 'white', border: `1px solid ${hl}25`, padding: '5px 8px', lineHeight: 1.5, maxWidth: 500, borderRadius: 8 }}>
                {currentDonor.msg}
              </div>
            )}
            <div style={{ height: 4, background: hl + '20', overflow: 'hidden', width: '100%' }}>
              <div style={{ height: '100%', width: '60%', background: settings.progressBarColor || hl }} />
            </div>
          </div>
        </div>
      );
    }

    // ── MODERN ──────────────────────────────────────────────────────────────────
    if (theme === 'modern') {
      return (
        <>
          <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
          <div style={{ ...wrapperBase, 
            // boxShadow: `0 0 0 2px ${hl}30, 0 8px 32px rgba(0,0,0,0.6)`, 
            border: `2px solid ${settings.borderColor || hl + '40'}`, width: 'max-content', position: 'relative', borderRadius: 18 }}>
            <div style={scanlineStyle} />
            <MediaBlock />
            <div style={{ padding: '12px 14px', position: 'relative', zIndex: 2, width: 'max-content' }}>
              <div style={{ fontFamily: monospace, fontSize: 20, color: fg, lineHeight: 1.5, marginBottom: 6, width: 'max-content' }}>
                <span style={{ fontWeight: 500 }}>{currentDonor.name}</span>
                <span> mengirim </span>
                <span style={{ fontWeight: 500, color: hl, textShadow: `0 0 10px ${hl}55` }}>
                  Rp {currentDonor.amount.toLocaleString('id-ID')}
                </span>
              </div>
              {currentDonor.msg && (
                <div style={{ fontWeight: 500, fontFamily: monospace, fontSize: 18, color: fg, lineHeight: 1.5, paddingBottom: 6 }}>
                  {currentDonor.msg}
                </div>
              )}
              <div style={{ height: 3, background: hl + '20', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '60%', background: settings.progressBarColor || hl }} />
              </div>
            </div>
          </div>
        </>
      );
    }

    // ── SMOOTH ──────────────────────────────────────────────────────────────────
    if (theme === 'smooth') {
      return (
        <div style={{ ...wrapperBase, borderRadius: 16, border: `1.5px solid ${hl}30`, 
          // boxShadow: `0 8px 32px ${hl}18` 
          }}>
          <MediaBlock />
          <div style={{ fontFamily: "'Inter', sans-serif", padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 20, color: fg, lineHeight: 1.6 }}>
              <span style={{ color: hl, fontWeight: 500 }}>{currentDonor.name}</span>
              <span> mengirim </span>
              <span style={{ fontWeight: 500, color: hl, letterSpacing: '-0.5px' }}>
                Rp {currentDonor.amount.toLocaleString('id-ID')}
              </span>
            </div>
            {/* <div style={{ height: 1, background: hl + '25', borderRadius: 99 }} /> */}
            {currentDonor.msg && (
              <div style={{ fontWeight: 400, fontSize: 18, color: fg, background: hl + '10', borderRadius: 8, padding: '7px 12px', lineHeight: 1.6, border: `1px solid ${hl}20` }}>
                {currentDonor.msg}
              </div>
            )}
            <div style={{ height: 3, background: hl + '20', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '60%', background: settings.progressBarColor || hl }} />
            </div>
          </div>
        </div>
      );
    }

    // ── CLASSIC ──────────────────────────────────────────────────────────────────
    if (theme === 'classic') {
      return (
        <>
          <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
          <div style={{ ...wrapperBase, border: `2px solid ${hl}`, position: 'relative', borderRadius: 18 }}>
            <div style={scanlineStyle} />
            <MediaBlock />
            <div style={{ padding: '12px 14px', position: 'relative', zIndex: 2 }}>
              <div style={{ fontFamily: monospace, fontSize: 20, color: fg, lineHeight: 1.6, marginBottom: 8, borderBottom: `1px dashed ${hl}30`, paddingBottom: 8 }}>
                <span style={{ fontWeight: 500 }}>{currentDonor.name}</span>
                <span> mengirim </span>
                <span style={{ fontWeight: 500, color: hl, textShadow: `0 0 10px ${hl}50` }}>
                  Rp {currentDonor.amount.toLocaleString('id-ID')}
                </span>
              </div>
              {currentDonor.msg && (
                <div style={{ fontWeight: 500, fontFamily: monospace, fontSize: 18, color: fg, lineHeight: 1.5 }}>
                  {currentDonor.msg}
                </div>
              )}
              <div style={{ height: 3, background: hl + '20', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '60%', background: settings.progressBarColor || hl }} />
              </div>
            </div>
          </div>
        </>
      );
    }

    // ── MINIMAL ──────────────────────────────────────────────────────────────────
    return (
      <div style={{ ...wrapperBase, border: `2px solid ${hl}40`, position: 'relative', borderRadius: 18 }}>
        <div style={scanlineStyle} />
        <MediaBlock />
        <div style={{ padding: '12px 14px', position: 'relative', zIndex: 2 }}>
          <div style={{ fontFamily: monospace, fontSize: 20, color: fg, lineHeight: 1.6, marginBottom: 6 }}>
            <span style={{ fontWeight: 500 }}>{currentDonor.name} - </span>
            <span style={{ fontWeight: 500, color: hl, letterSpacing: '-0.5px', textShadow: `0 0 8px ${hl}50` }}>
              Rp {currentDonor.amount.toLocaleString('id-ID')}
            </span>
          </div>
          {currentDonor.msg && (
            <div style={{ fontWeight: 500, fontFamily: monospace, fontSize: 18, color: fg, lineHeight: 1.5, borderTop: `1px solid ${hl}20`, paddingTop: 8, paddingBottom: 6 }}>
              {currentDonor.msg}
            </div>
          )}
          <div style={{ height: 3, background: hl + '20', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '60%', background: settings.progressBarColor || hl }} />
          </div>
        </div>
      </div>
    );
  };

  const donors = [
    { name: 'Budi', amount: 50000,  msg: 'Semangat terus ngodingnya' },
    { name: 'Reza',  amount: 150000, msg: 'Mantap konten-kontennya'   },
    { name: 'Denis',       amount: 20000,  msg: 'Seru banget streamingnya'                       },
    { name: 'Rizky',     amount: 20000, msg: 'Dukung creator Indonesia'      },
  ];

  const triggerDemo = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const d = donors[donorIdxRef.current % donors.length];
    donorIdxRef.current++;
    setCurrentDonor(d);
    setShowAlert(false);
    setTimeout(() => { setAnimKey(k => k + 1); setShowAlert(true); }, 50);
    // const dur = getDuration(settings, d.amount);
    // timerRef.current = setTimeout(() => setShowAlert(false), dur * 1000 + 500);
  };

  useEffect(() => {
    if (!autoPreviewTick) return;
    triggerDemo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPreviewTick]);

  // useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), []);

  const posMap = {
    'top-left':      { top: '14%', left: '2%' },
    'top-right':     { top: '14%', right: '2%' },
    'bottom-left':   { bottom: '28%', left: '2%' },
    // 'bottom-left':  { bottom: '18%', right: '2%' },
    'top-center':    { top: '14%', left: '50%', transform: 'translateX(-50%)' },
    'bottom-center': { bottom: '18%', left: '50%', transform: 'translateX(-50%)' },
  };

  const animVariants = {
    bounce:        { initial: { scale: 0.5, opacity: 0 }, animate: { scale: [0.5, 1.08, 1], opacity: 1, transition: { duration: 0.5 } }, exit: { scale: 0.8, opacity: 0, transition: { duration: 0.3 } } },
    'slide-left':  { initial: { x: -80, opacity: 0 }, animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } }, exit: { x: -60, opacity: 0, transition: { duration: 0.3 } } },
    'slide-right': { initial: { x: 80,  opacity: 0 }, animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } }, exit: { x:  60, opacity: 0, transition: { duration: 0.3 } } },
    fade:          { initial: { opacity: 0, y: -12 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } }, exit: { opacity: 0, y: -8, transition: { duration: 0.3 } } },
  };

  const anim  = animVariants[settings.animation] || animVariants.bounce;
  const pos   = posMap[settings.overlayPosition || 'bottom-left'];
  const bg    = settings.primaryColor || '#2e2f42';
  const fg    = settings.textColor || '#ffffff';
  const maxW  = settings.maxWidth || 280;
  const theme = settings.theme || 'modern';
  // const dur   = currentDonor ? getDuration(settings, currentDonor.amount) : 5;

  const handleFullScreen = () => { testFullScreen(); setIsFullscreen(!isFullscreen); };
  
  const renderAlert = () => {
  if (!currentDonor) return null;
  const hl = settings.highlightColor || '#39ff14';
  const fg = settings.textColor || '#c8f5c8';
  const bg = settings.primaryColor || '#0a1f0a';

  // Pixel frog ASCII art kecil sebagai dekorasi
  const FrogDeco = ({ size = 14 }) => (
    <span style={{
      fontFamily: "Inter', sans-serif",
      fontSize: size,
      color: hl,
      lineHeight: 1,
      letterSpacing: '-1px',
      display: 'inline-block',
      opacity: 0.85,
    }}>
      {`(o_o)`}
    </span>
  );

  const ts = settings.showTimestamp !== false
    ? (
      <div style={{
        fontSize: 14,
        color: 'rgba(255,255,255,0.35)',
        fontFamily: "Inter', sans-serif",
        letterSpacing: '0.05em',
        fontWeight: 500
      }}>
        {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
      </div>
    )
    : <div />;

  // ── Scanline overlay style (retro CRT) ──
  const scanlineStyle = {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
    pointerEvents: 'none',
    zIndex: 1,
  };

  // ── Pixel border helper ──
  const pixelBorder = `2px solid ${hl}`;
  const dimBorder = `1px solid ${hl}40`;

  // ══════════════════════════════════════════
  // MODERN — Retro terminal HUD
  // ══════════════════════════════════════════
  const modernInner = (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 10, }}>
      <div style={scanlineStyle} />
      {/* Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: hl + '18',
        borderBottom: pixelBorder,
        padding: '5px 10px',
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {/* Pixel status dots */}
          {['#ff4444', '#ffaa00', hl].map((c, i) => (
            <span key={i} style={{ width: 7, height: 7, background: c, display: 'inline-block', border: '1px solid rgba(255,255,255,0.2)' }} />
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '10px 12px', position: 'relative', zIndex: 2 }}>
        {/* Icon + info */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "Inter', sans-serif",
              fontSize: 20,
              fontWeight: 500,
              color: fg,
              marginTop: 10,
              lineHeight: 1.1,
              letterSpacing: '-0.5px',
            }}>
              {currentDonor.name}
            </div>
          </div>
          <div style={{
            width: 40,
            height: 40,
            // border: pixelBorder,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            flexShrink: 0,
            // background: hl + '12',
            imageRendering: 'pixelated',
          }}>
            {renderIconPreview(settings.customIcon, 20)}
          </div>
        </div>

        {/* Amount — big retro display */}
        <div style={{
          fontFamily: "Inter', sans-serif",
          fontSize: 20,
          fontWeight: 500,
          color: hl,
          letterSpacing: '-1px',
          lineHeight: 1,
          marginBottom: 6,
          textShadow: `0 0 12px ${hl}60`,
        }}>
          Rp {currentDonor.amount.toLocaleString('id-ID')}
        </div>

        {/* Message */}
        {currentDonor.msg && (
          <div style={{
            fontFamily: "Inter', sans-serif",
            fontSize: 18,
            color: fg,
            background: 'rgba(255,255,255,0.04)',
            border: dimBorder,
            marginTop: 10,
            borderRadius: 8,
            padding: '5px 8px',
            width: 'max-content',
            lineHeight: 1.4,
            width: '100%',
            marginBottom: 6,
          }}>
            {currentDonor.msg}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          {ts}
          {/* Pixel progress bar */}
          <div style={{ display: 'flex', gap: 2 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} style={{
                width: 6,
                height: 6,
                background: i < 5 ? (settings.progressBarColor || hl) : hl + '25',
                display: 'inline-block',
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const gifCardInner = (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%'}}>
      {/* GIF area — lebar sama dengan card, transparan */}
      <div style={{
        width: '100%',
        height: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // background: 'red',
        marginBottom: 16,
        overflow: 'hidden',
      }}>
        {settings.customIcon?.startsWith('http') || settings.customIcon?.startsWith('/') ? (
          <img
            src={settings.customIcon}
            alt="icon"
            style={{
              width: '100%',      // ← full lebar container
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              marginLeft: -6
            }}
          />
        ) : (
          <span style={{ fontSize: 72, lineHeight: 1 }}>{settings.customIcon || '❤️'}</span>
        )}
      </div>

      {/* Info area */}
      <div style={{
        padding: '10px 12px',
        display: 'flex',
        textAlign: 'center',
        flexDirection: 'column',
        gap: 7,
      }}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 18, fontWeight: 500, color: fg,
            borderBottom: `1px solid ${hl}25`, 
            // paddingBottom: 7,
          }}>
            {currentDonor.name} mengirim
          </div>
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 18,
            marginLeft: 5,
            fontWeight: 500, color: hl,
            letterSpacing: '-0.5px', lineHeight: 1,
            textShadow: `0 0 10px ${hl}55`,
          }}>
            Rp {currentDonor.amount.toLocaleString('id-ID')}
          </div>
        </div>
        {currentDonor.msg && (
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 16, color: fg, fontWeight: 400,
            borderRadius: 9,
            background: hl + '12', border: `1px solid ${hl}25`,
            padding: '5px 8px', lineHeight: 1.5,
          }}>
            {currentDonor.msg}
          </div>
        )}
        <div style={{ height: 3, background: hl + '20', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '60%', background: settings.progressBarColor || hl, transition: 'width 50ms linear' }} />
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════
  // SMOOTH — Soft rounded card with Poppins
  // ══════════════════════════════════════════
  const smoothInner = (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      {/* Icon + Nama */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{
            fontSize: 18,
            fontWeight: 500,
            color: fg,
            lineHeight: 1.2,
          }}>
            {currentDonor.name}
          </div>
        </div>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: hl + '22',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          flexShrink: 0,
          border: `1.5px solid ${hl}40`,
        }}>
          {renderIconPreview(settings.customIcon, 22)}
        </div>
      </div>

      {/* Divider tipis */}
      <div style={{ height: 1, background: hl + '25', borderRadius: 99 }} />

      {/* Amount */}
      <div style={{
        fontSize: 18,
        fontWeight: 500,
        color: hl,
        margin: "2px 0px",
        letterSpacing: '-0.5px',
        lineHeight: 1,
      }}>
        Rp {currentDonor.amount.toLocaleString('id-ID')}
      </div>

      {/* Pesan */}
      {currentDonor.msg && (
        <div style={{
          fontSize: 18,
          fontWeight: 400,
          color: fg,
          width: 'max-content',
          padding: '0px 0px',
          lineHeight: 1.5
        }}>
          {currentDonor.msg}
        </div>
      )}

      {/* Timestamp */}
      {settings.showTimestamp !== false && (
        <div style={{
          fontSize: 14,
          color: fg,
          opacity: 0.35,
          fontWeight: 400,
          letterSpacing: '0.04em',
        }}>
          {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
        </div>
      )}

      <div style={{ height: 3, background: hl + '25', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: '60%', background: settings.progressBarColor || hl, borderRadius: 99, transition: 'width 50ms linear' }} />
      </div>
    </div>
  );

  // ══════════════════════════════════════════
  // MINIMAL — Retro ticker tape
  // ══════════════════════════════════════════
  const minimalInner = (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={scanlineStyle} />
      <div style={{ padding: '10px 12px', position: 'relative', zIndex: 2 }}>
        {/* Top row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}>
          <span style={{
            fontFamily: "Inter', sans-serif",
            fontSize: 20,
            fontWeight: 500,
            color: hl,
            letterSpacing: '-1px',
            textShadow: `0 0 8px ${hl}50`,
          }}>
            Rp {currentDonor.amount.toLocaleString('id-ID')}
          </span>
        </div>

        {/* Name */}
        <div style={{
          fontFamily: "Inter', sans-serif",
          fontSize: 20,
          fontWeight: 500,
          color: fg,
          marginBottom: 3,
          borderBottom: `1px solid ${hl}20`,
          paddingBottom: 5,
        }}>
          {currentDonor.name}
        </div>

        {/* Message */}
        {currentDonor.msg && (
          <div style={{
            fontFamily: "Inter', sans-serif",
            fontSize: 18,
            color: fg,
            width: 'max-content',
            // opacity: 0.7,
            lineHeight: 1.4,
            marginBottom: 4,
          }}>
            {currentDonor.msg}
          </div>
        )}

        {/* Bottom */}
        <div style={{ display: 'flex', fontSize: 16, alignItems: 'center', justifyContent: 'space-between' }}>
          {ts}
        </div>

        <div style={{ height: 2, marginTop: 6, background: 'rgba(255,255,255,0.06)' }}>
          <div style={{ height: '100%', width: '60%', background: settings.progressBarColor || hl, transition: 'width 50ms linear' }} />
        </div>
      </div>
    </div>
  );

  const innerMap = { modern: modernInner, minimal: minimalInner, smooth: smoothInner, gifCard: gifCardInner };

    return (
      <>
        <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
        <div style={{
          backgroundColor: settings.theme === 'gifCard' ? 'transparent' : bg,
          color: fg,
          borderRadius: 20,
          // maxWidth: `max-content`,
          width: '100%',
          // overflow: 'hidden',
          // boxShadow: settings.theme === 'gifCard' ? 'none' : `0 0 0 2px ${hl}30, 0 8px 32px rgba(0,0,0,0.6)`,
          border: settings.theme === 'gifCard' ? 'none' : `2px solid ${settings.borderColor || hl + '40'}`,
          imageRendering: 'pixelated',
        }}>
          {innerMap[settings.theme] ?? modernInner}
        </div>
      </>
  );
};

  const FullscreenPreview = () => (
    <AnimatePresence>
      {isFullscreen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed w-[100%] right-0 inset-0 z-[999999999] bg-black flex flex-col">
          <div className="flex items-center justify-between px- py-3 md:py-4 bg-black/80 backdrop-blur-sm border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-xl  animate-pulse" />
              <span className="text-white font-black text-sm tracking-wide">LIVE PREVIEW</span>
              <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded-xl  tracking-widest">OBS SIMULATION</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={triggerDemo} className="cursor-pointer active:scale-[0.99] flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs transition-all">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-xl  animate-pulse" /> Simulasi Donasi
              </button>
              <button onClick={() => handleFullScreen()} className="cursor-pointer active:scale-[0.99] flex items-center gap-3 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl  font-black text-xs transition-all border border-white/10">
                ✕ Tutup
              </button>
            </div>
          </div>
          <div className="flex-1 relative overflow-hidden" style={{ background: 'linear-gradient(155deg,#1a1a2e 0%,#0d0d1a 60%,#12121f 100%)' }}>
            <span className="absolute inset-0 flex items-center justify-center text-[clamp(60px,15vw,180px)] font-black text-white/[0.02] pointer-events-none select-none" style={{ letterSpacing: -8 }}>LIVE</span>
            <div className="absolute inset-0 pointer-events-none">
              <AnimatePresence>
                {showAlert && (
                  <motion.div key={animKey} initial={animVariants[settings.animation]?.initial || animVariants.bounce.initial} animate={animVariants[settings.animation]?.animate || animVariants.bounce.animate} exit={animVariants[settings.animation]?.exit || animVariants.bounce.exit} style={{ position: 'absolute', ...posMap[settings.overlayPosition || 'bottom-left'], zIndex: 10 }}>
                    {renderAlert()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

    return (
    <div className="relative space-y-2.5 block md:hidden">
      <FullscreenPreview />

      {/* Tab switcher */}
      <div className="flex gap-2.5">
        {/* Tab switcher */}
        <div className="flex-1 flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-[3px] rounded-xl">
          {[{ id: 'alert', label: '⚡ Alert OBS' }, { id: 'media', label: '🎬 Media share' }].map(tab => (
              <button key={tab.id} onClick={() => {
                setPreviewMode(tab.id);
                onPreviewModeChange?.(tab.id);
              }}
              className={`cursor-pointer flex-1 py-3 text-xs font-black rounded-md transition-all ${previewMode === tab.id ? 'bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`relative overflow-hidden border-[4px] border-slate-800 rounded-xl ${previewMode === 'alert' ? '2xl:h-[70.5vh] h-[35.1vh]' : '2xl:h-[61.9vh] h-[41.5vh]'} w-full shadow-2xl`} style={{ aspectRatio: '16/9', background: '#000' }}>
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(155deg,#1a1a2e 0%,#0d0d1a 60%,#12121f 100%)' }}>
          {/* <span style={{ fontSize: 80, fontWeight: 500, color: 'rgba(255,255,255,0.04)', letterSpacing: -3, userSelect: 'none' }}>LIVE</span> */}
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence>
            {showAlert && previewMode === 'alert' && (
              <motion.div className='ml-1.5 md:ml-4 w-[90.7%] 2xl:w-[90%] md:w-[87%]' key={animKey} initial={anim.initial} animate={anim.animate} exit={anim.exit} style={{ position: 'absolute', bottom: 30, left: 10, zIndex: 10 }}>
                {renderAlert()}
              </motion.div>
            )}
            {showAlert && previewMode === 'media' && (
              <motion.div
                className='absolute bottom-10 ml-1.5 2xl:ml-5 md:mt-[-12px] 2xl:mt-[0] w-[90%] 2xl:scale-[1] scale-[0.85]'
                key={`media-${animKey}`}
                initial={anim.initial}
                animate={anim.animate}
                exit={anim.exit}
                style={{
                  position: 'absolute',
                  ...pos,
                  zIndex: 10,
                  top: 20,
                  transform: settings.theme === 'gifCard'
                    ? 'scale(0.5) translateX(-50%)'
                    : 'scale(0.4) translateX(-50%)',
                }}
              >
                {renderMediaAlert()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Media URL picker — hanya muncul saat tab media aktif */}
      {previewMode === 'media' && (
        <div className="space-y-3">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Media URL (preview)</label>
          <div className="flex gap-3 mt-1">
            {MEDIA_PRESETS.map((p, i) => (
              <button key={i} onClick={() => setMediaUrl(p.url)}
                className={`flex-1 py-2 text-[10px] font-black rounded-md border-2 transition-all cursor-pointer ${mediaUrl === p.url ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-600' : 'border-slate-100 dark:border-slate-700 text-slate-400 hover:border-purple-300'}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <button onClick={triggerDemo}
        className="cursor-pointer active:scale-[0.99] hover:brightness-90 w-full py-3 rounded-xl  bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-950 text-blue-600 dark:text-blue-400 font-black text-sm border-2 border-blue-100 dark:border-blue-900 transition-all hidden md:flex items-center justify-center gap-3">
        Simulasi notifikasi
      </button>
    </div>
  );
}