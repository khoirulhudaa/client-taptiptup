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
  DollarSign,
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
  ChevronRight,
  BadgeDollarSign,
  Palette,
  Box,
  Clock,
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
import { YouTubeLivePreview2 } from './livePreview';
import IpBlacklistPage from './ipBlack';

// ─── API ──────────────────────────────────────────────────────────────────────
const fetchBadges = async () => (await api.get('/api/midtrans/badges')).data;
const fetchHistory    = async ({ page = 1, limit = 50, status = '' } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (status) params.set('status', status);
  return (await api.get(`/api/donations/history?${params}`)).data;
};
const fetchStats      = async () => (await api.get('/api/donations/stats')).data;

const saveSettings = async (s, slot = 'A') => {
  const clean = JSON.parse(JSON.stringify(s, (key, val) => {
    if (val instanceof HTMLElement || val instanceof Element) return undefined;
    return val;
  }));
  return (await api.put(`/api/overlay/settings?slot=${slot}`, clean)).data;
};

const updateProfile   = async (d) => (await api.put('/api/auth/profile', d)).data;
const changePassword  = async (d) => (await api.put('/api/auth/change-password', d)).data;
const fetchBannedWords = async () => (await api.get('/api/banned-words')).data;
const saveBannedWords  = async (d) => (await api.put('/api/banned-words', d)).data;
const fetchMilestones  = async () => (await api.get('/api/milestones')).data;
const saveMilestones   = async (d) => (await api.put('/api/milestones', { milestones: d })).data;
const fetchDiscover    = async ({ page = 1, search = '' } = {}) => {
  const params = new URLSearchParams({ page, limit: 12, search });
  return (await api.get(`/api/follows/discover?${params}`)).data;
};
const fetchMyFollowers  = async (userId) => (await api.get(`/api/follows/${userId}/followers`)).data;
const fetchMyFollowing  = async (userId) => (await api.get(`/api/follows/${userId}/following`)).data;
const toggleFollowApi   = async (userId) => (await api.post(`/api/follows/${userId}/toggle`, {})).data;
const fetchPublicProfile = async (username) => (await api.get(`/api/overlay/public/${username}`)).data;
const APP_URL = window.location.origin;

const SOUND_PRESETS = [
  { label: 'Ding 🔔',     url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
  { label: 'Cash 💰',     url: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3' },
  { label: 'Kururing 📢', url: `${APP_URL}/kururing.mpeg` },
  { label: 'Kaching 💸',  url: `${APP_URL}/kaching.mpeg` },
  { label: 'Booom 💥',     url: `${APP_URL}/boom.mp3` },
  { label: 'Tuturu 🎊',    url: `${APP_URL}/tuturu.mp3` },
  { label: 'Dana 🤑',      url: `${APP_URL}/dana.mp3` },
  { label: 'Cihuy 🔥',     url: `${APP_URL}/cihuy.mp3` },
  { label: 'Tada 🎉',     url: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3' },
  { label: 'Gold 🪙',     url: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3' },
  { label: 'Whooo 🗣️',   url: 'https://assets.mixkit.co/active_storage/sfx/2010/2010-preview.mp3' },
  { label: 'Jackpot 🎰',  url: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3' },
  { label: 'Bling ✨',    url: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3' },
  { label: 'Payout 💸',   url: 'https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3' },
];

// ─── Default settings ─────────────────────────────────────────────────────────

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
  { emoji: '💗', label: 'Default' }, 
  { emoji: '💝',  label: 'Ungu'  },
  { emoji: '🤓',  label: 'Angpau'  },
  { emoji: '🐧', label: 'Penguin' },
  { emoji: '🔥',  label: 'Api'    }, 
  { emoji: '⭐',  label: 'Bintang'},
  { emoji: '🎮',  label: 'Gamer'  }, 
  { emoji: '😉',  label: 'Musik'  },
  { emoji: '🐉',  label: 'Naga'   }, 
  { emoji: '💰',  label: 'Duit'   },
  { emoji: '🪷',  label: 'Flower'  },
  { emoji: '🎯',  label: 'Target' }, 
  { emoji: '👑',  label: 'Raja'   },
  { emoji: '💎',  label: 'Permata'},
  { emoji: '🌟',  label: 'Gemilang'}, 
  { emoji: '🚀', label: 'Roket'  },
  { emoji: '⚡',  label: 'Kilat'  },
  { emoji: '🤖',  label: 'Robot'  },
];

const renderIconPreview = (customIcon, size = 20) => {
  if (!customIcon) return '❤️';
  if (customIcon.startsWith('http') || customIcon.startsWith('/')) {
    return <img src={customIcon} alt="icon" style={{ width: size, height: size, objectFit: 'contain', borderRadius: 4, display: 'inline-block' }} />;
  }
  return customIcon;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getDuration = (settings, amount) => {
  const tiers = settings.durationTiers || [];
  if (tiers.length > 0) {
    const sorted = [...tiers].sort((a, b) => b.minAmount - a.minAmount);
    for (const t of sorted) {
      if (amount >= t.minAmount && (t.maxAmount === null || amount <= t.maxAmount)) return t.duration;
    }
  }
  const extras = Math.floor(amount / (settings.extraPerAmount || 10000));
  return (settings.baseDuration || 5) + extras * (settings.extraDuration || 1);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const getTokenPayload = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
};

// ─── Sub Components ───────────────────────────────────────────────────────────

const SectionHeader = ({ icon, title, color }) => (
  <div className="flex items-center gap-3">
    {icon && (
      <div className={`${color} p-3 rounded-xl  text-white shadow-lg`}>{icon}</div>
    )}
    <h3 className="text-sm uppercase md:capitalize md:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{title}</h3>
  </div>
);

const InputField = ({ label, ...props }) => {
  const isNominal = /nominal/i.test(label);

  const handleChange = (val) => {
    if (isNominal) {
      const raw = val.replace(/\./g, '').replace(/[^0-9]/g, '');
      props.onChange?.(raw === '' ? '' : Number(raw));
    } else {
      props.onChange?.(val);
    }
  };

  const displayValue = isNominal && props.value !== '' && props.value !== undefined
    ? Number(props.value).toLocaleString('id-ID')
    : props.value ?? '';

  return (
    <div className="w-full flex pl-[3px] items-center bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-all shadow-sm">
      <div className="w-max px-3 py-3 rounded-lg text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap border-r border-slate-200 dark:border-slate-700 bg-slate-200/50 dark:bg-slate-700/50">
        {label}
      </div>
      <input
        className="flex-1 bg-transparent p-3 h-11.5 pl-3 outline-none font-bold text-sm text-slate-900 dark:text-slate-100"
        {...props}
        type={isNominal ? 'text' : props.type}
        inputMode={isNominal ? 'numeric' : props.inputMode}
        value={displayValue}
        onChange={e => handleChange(e.target.value)}
      />
    </div>
  );
};

const TextareaField = ({ label, className = '', inputClassName = '', onChange, ...props }) => (
  <div className={`w-full flex pl-[3px] pt-[3px] items-start bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-all shadow-sm ${className}`}>
    <div className="w-max px-3 py-3 rounded-lg text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap border-r border-slate-200 dark:border-slate-700 bg-slate-200/50 dark:bg-slate-700/50">
      {label}
    </div>
    <textarea
      className={`flex-1 bg-transparent p-3 pl-3 outline-none font-bold text-sm text-slate-900 dark:text-slate-100 resize-y ${inputClassName}`}
      {...props}
      onChange={e => onChange?.(e.target.value)}
    />
  </div>
);

// ─── QuickAmountsEditor ───────────────────────────────────────────────────────

const QuickAmountsEditor = ({ amounts = [], onChange, saveSettingsMutation, settings, activeSlot }) => {
  const add = () => onChange([...amounts, 50000]);
  const remove = (i) => onChange(amounts.filter((_, idx) => idx !== i));
  const update = (i, val) => {
    const newAmounts = [...amounts];
    newAmounts[i] = Number(val);
    onChange(newAmounts);
  };

  return (
    <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800">
        <SectionHeader icon={<Settings size={20} />} title={`Quick Nominal`} color="bg-red-600" />
        <div className="gap-3 grid grid-cols-1 mt-5 md:grid-cols-2">
        {amounts.map((amt, i) => (
          <div key={i} className="w-[100%] flex gap-3 items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
           <InputField
            label={`Nominal ${i + 1}`}
            type="number"
            value={amt}
            aria-label={`Nominal ${i + 1}`}
            onChange={v => update(i, v)}
            // className="flex-1"
          />
            <button onClick={() => remove(i)} 
              className="
              text-slate-900 dark:text-white 
              -translate-y-[3px] translate-x-[-3px]
              [box-shadow:4px_6px_0_#f1f5f9]
              dark:[box-shadow:4px_4px_0_#99a3b1]
              hover:translate-y-0 hover:translate-x-0
              border border-slate-300
              hover:[box-shadow:0_0_0_#f1f5f9]
              dark:hover:[box-shadow:0_0_0_#94a3b8]
              active:translate-y-[2px] active:translate-x-[2px]
              active:[box-shadow:none]
              active:bg-slate-300 dark:active:bg-slate-800
              shrink-0 cursor-pointer bg-red-700 h-[40px] w-[40px] flex justify-center items-center text-slate-300 hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-800 rounded-xl transition-all active:scale-95"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
      <button onClick={add} className="cursor-pointer active:scale-[0.98] hover:brightness-[85%] w-full mt-4 py-3.5 border-2 border-dashed border-cyan-400/30 text-white rounded-xl font-black text-sm">
        + Tambah Nominal
      </button>
      <button
        onClick={() => saveSettingsMutation.mutate({ settings, slot: activeSlot })}
        disabled={saveSettingsMutation.isPending}
        className="
        text-slate-900 dark:text-white bg-slate-100 dark:bg-white/20
        -translate-y-[3px] translate-x-[-3px]
        [box-shadow:4px_6px_0_#f1f5f9]
        dark:[box-shadow:4px_4px_0_#99a3b1]
        hover:translate-y-0 hover:translate-x-0
        hover:bg-slate-200 dark:hover:bg-slate-700
        border border-slate-300
        hover:[box-shadow:0_0_0_#f1f5f9]
        dark:hover:[box-shadow:0_0_0_#94a3b8]
        active:translate-y-[2px] active:translate-x-[2px]
        active:[box-shadow:none]
        active:bg-slate-300 dark:active:bg-slate-800
        cursor-pointer active:scale-[0.99] hover:brightness-90 w-full bg-slate-900/70 dark:bg-slate-700 text-white py-3 md:py-4 rounded-xl font-black text-sm transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-70 flex items-center justify-center gap-3 mt-8">
        <Save size={18} className='relative top-[-1px]' />
        Simpan Sekarang
      </button>
    </div>
  );
};

// ─── InstantTestAlert ─────────────────────────────────────────────────────────

const InstantTestAlertSkeleton = () => {
  return (
    <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl  p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-slate-200 dark:bg-slate-700 w-11 h-11 rounded-xl animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl  animate-pulse" />
          </div>
        ))}
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded-xl  animate-pulse" />
        ))}
      </div>

      {/* Send Button */}
      <div className="h-14 bg-slate-200 dark:bg-slate-700 rounded-xl  animate-pulse" />

      {/* Last Sent Placeholder */}
      <div className="h-12 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl animate-pulse" />

      {/* Warning */}
      <div className="h-4 w-3/4 mx-auto bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
    </div>
  );
};

const InstantTestMediaShareSkeleton = () => {
  return (
    <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl  p-4 md:p-6 shadow-xl border border-slate-100 dark:border-slate-800 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div className="bg-slate-200 dark:bg-slate-700 w-11 h-11 rounded-xl animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-52 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </div>

      {/* Donor & Amount */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl  animate-pulse" />
          </div>
        ))}
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1">
        <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl  animate-pulse" />
      </div>

      {/* Media URL */}
      <div className="space-y-3">
        <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl  animate-pulse" />
      </div>

      {/* Quick Presets */}
      <div className="pt-2">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-3 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-xl  animate-pulse" />
          ))}
        </div>
      </div>

      {/* Send Button */}
      <div className="h-14 bg-slate-200 dark:bg-slate-700 rounded-xl  animate-pulse" />

      {/* Last Sent */}
      <div className="h-12 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl animate-pulse" />
    </div>
  );
};

const InstantTestAlert = ({ overlayToken, settings, user }) => {
  const [isSending, setIsSending] = useState(false);
  const [lastSent, setLastSent] = useState(null);
  const [customAmount, setCustomAmount] = useState(50000);
  const [customName, setCustomName] = useState('Seseorang');
  const [customMsg, setCustomMsg] = useState('Ini test dukungan dari dashboard! 🎉');
  const [customVoiceUrl, setCustomVoiceUrl] = useState('');
  const [testItem, setTestItem] = useState(null);
  const [useItem, setUseItem] = useState(false);

  const donationItems = (settings?.donationItems || []).filter(i => i.name && i.price > 0);

  const sendTest = async () => {
    if (!overlayToken) return;
    setIsSending(true);
    try {
      await api.post('/api/test-alert/send', {
        targetUsername: user.username,
        donorName: customName,
        amount: useItem && testItem
          ? testItem.price * (testItem.quantity || 1)
          : Number(customAmount),
        message: customMsg,
        mediaUrl: null,
        mediaType: null,
        voiceUrl: customVoiceUrl.trim() || null,
        donationItem: useItem && testItem ? {
          name: testItem.name,
          emoji: testItem.emoji,
          price: testItem.price,
          quantity: testItem.quantity || 1,
          total: testItem.price * (testItem.quantity || 1),
        } : null,
      });
      setLastSent(new Date());
      toast.success('Test alert berhasil dikirim!', {
        icon: <CheckCircle2 size={18} className="text-green-500" />,
        style: {
          background: 'rgba(15, 23, 42, 0.7)',
          color: '#fff',
          fontWeight: 'bold',
          borderRadius: '0.5rem',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)',
          padding: '12px 16px',
        },
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengirim test alert');
    } finally {
      setIsSending(false);
    }
  };

  // 4 Template Pesan Cepat
  const messageTemplates = [
    "Terima kasih banyak atas dukungannya! Semangat 🔥",
    "Mantap banget! Dukungan ini sangat berarti ❤️",
    "Salam dari fans setia! Keep going 👏"
  ];

  return (
    <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl  p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-3">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-3 rounded-xl  text-white shadow-lg">
          <Zap size={20} />
        </div>
        <div>
          <h3 className="text-sm uppercase md:capitalize md:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Testing Alert</h3>
        </div>
      </div>

      <button 
        onClick={sendTest} 
        disabled={isSending || !overlayToken}
        className="
        text-slate-900 dark:text-white bg-slate-100 dark:bg-white/20
        -translate-y-[3px] translate-x-[-3px]
        [box-shadow:4px_6px_0_#f1f5f9]
        dark:[box-shadow:4px_4px_0_#99a3b1]
        hover:translate-y-0 hover:translate-x-0
        hover:bg-slate-200 dark:hover:bg-slate-700
        border border-slate-300
        hover:[box-shadow:0_0_0_#f1f5f9]
        dark:hover:[box-shadow:0_0_0_#94a3b8]
        active:translate-y-[2px] active:translate-x-[2px]
        active:[box-shadow:none]
        active:bg-slate-300 dark:active:bg-slate-800
        cursor-pointer active:scale-[0.99] w-full mt-5.5 py-3 hover:brightness-90 bg-slate-900/70 dark:bg-slate-700 text-white rounded-xl font-black text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-60"
      >
        {isSending ? (
          <><RefreshCw size={18} className="animate-spin" /> Mengirim...</>
        ) : (
          <><Zap size={18} /> Kirim Test ke OBS Sekarang</>
        )}
      </button>

      {lastSent && (
        <motion.div 
          initial={{ opacity: 0, y: 4 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 text-xs text-white dark:text-white font-bold bg-emerald-50 dark:bg-emerald-950/40 rounded-xl px-4 py-3 border border-emerald-100 dark:border-emerald-900"
        >
          <CheckCircle2 size={14} /> Test terakhir dikirim: {lastSent.toLocaleTimeString('id-ID')}
        </motion.div>
      )}

      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium text-left">
        Pastikan OBS overlay kamu sudah dibuka di browser source
      </p>
    </div>
  );
};

// ─── InstantTestMediaShare ────────────────────────────────────────────────────

const InstantTestMediaShare = ({ overlayToken, settings, user }) => {
  const [isSending, setIsSending] = useState(false);
  const [lastSent, setLastSent] = useState(null);
  const [useItem, setUseItem] = useState(false);
  const [testItem, setTestItem] = useState(null);
  const [formData, setFormData] = useState({
    donorName: 'Seseorang',
    amount: '25000',
    message: 'Terima kasih atas dukungannya! 🔥',
    mediaUrl: 'https://picsum.photos/400/300',
    mediaType: 'image'
  });

  const donationItems = (settings?.donationItems || []).filter(i => i.name && i.price > 0);

  const sendTestMedia = async () => {
    if (!overlayToken || !formData.mediaUrl) return;
    setIsSending(true);
    try {
      await api.post('/api/midtrans/test-mediashare/send', {
        targetUsername: user.username,
        donorName: formData.donorName,
        amount: testItem
          ? testItem.price * (testItem.quantity || 1)
          : Number(formData.amount) || 0,
        message: formData.message || null,
        mediaUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZXd5djgzdm84Z3Q5eWNpaWlobjVmbnd1bmwza2E2N3JmeXZoazY1NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/0vcCfc5y3MXCHzpzRw/giphy.gif',
        mediaType: formData.mediaType,
        donationItem: useItem && testItem ? {
          name: testItem.name,
          emoji: testItem.emoji,
          price: testItem.price,
          quantity: testItem.quantity || 1,
          total: testItem.price * (testItem.quantity || 1),
        } : null,
      });
      setLastSent(new Date());
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengirim');
    } finally {
      setIsSending(false);
    }
  };

  const PRESET_MEDIA = [
    { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZXd5djgzdm84Z3Q5eWNpaWlobjVmbnd1bmwza2E2N3JmeXZoazY1NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/0vcCfc5y3MXCHzpzRw/giphy.gif', type: 'image', label: '🖼️ Random Image', thumb: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZXd5djgzdm84Z3Q5eWNpaWlobjVmbnd1bmwza2E2N3JmeXZoazY1NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/0vcCfc5y3MXCHzpzRw/giphy.gif' },
    { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTF2OGtyYnAxZWoybHd4MzlpeWU2dG0yZHVlanN2ejM1dzhjNXhjdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/QFdW38uNImT0pYQjqL/giphy.gif', type: 'image', label: '🖼️ Image 2', thumb: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTF2OGtyYnAxZWoybHd4MzlpeWU2dG0yZHVlanN2ejM1dzhjNXhjdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/QFdW38uNImT0pYQjqL/giphy.gif' },
    { url: 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif', type: 'image', label: '🎬 GIF', thumb: 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy-preview.webp' },
    { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', type: 'video', label: '📺 YouTube', thumb: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
  ];

  const updateForm = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl  p-4 md:p-6 shadow-xl border border-slate-100 dark:border-slate-800 space-y-3">
      <div className="flex items-center gap-3 pb-[3px]">
        <div className="bg-blue-600 p-3 rounded-xl  text-white shadow-lg">
          <Video size={20} />
        </div>
        <div>
          <h3 className="text-sm uppercase md:capitalize md:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Testing Medshare</h3>
        </div>
      </div>

      <div className="pt-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {PRESET_MEDIA.map((preset, i) => (
            <button key={i} onClick={() => { updateForm('mediaUrl', preset.url); updateForm('mediaType', preset.type); }}
              className={`cursor-pointer active:scale-[0.99] group relative p-2 rounded-xl  border-2 transition-all overflow-hidden hover:shadow-md ${
                formData.mediaUrl === preset.url
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 shadow-md ring-2 ring-purple-200'
                  : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 bg-slate-50 dark:bg-slate-800/50'
              }`}>
              <div className="w-full h-16 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded overflow-hidden">
                <img src={preset.thumb} alt={preset.label} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <button onClick={sendTestMedia} disabled={isSending || !overlayToken || !formData.mediaUrl}
        className="
        text-slate-900 dark:text-white bg-slate-100 dark:bg-white/20
          -translate-y-[3px] translate-x-[-3px]
          [box-shadow:4px_6px_0_#f1f5f9]
          dark:[box-shadow:4px_4px_0_#99a3b1]
          hover:translate-y-0 hover:translate-x-0
          hover:bg-slate-200 dark:hover:bg-slate-700
          border border-slate-300
          hover:[box-shadow:0_0_0_#f1f5f9]
          dark:hover:[box-shadow:0_0_0_#94a3b8]
          active:translate-y-[2px] active:translate-x-[2px]
          active:[box-shadow:none]
        active:bg-slate-300 dark:active:bg-slate-800
        cursor-pointer hover:brightness-90 w-full py-3 hover:brightness-90 w-full bg-slate-900/70 dark:bg-slate-700 text-white rounded-xl  font-black text-sm active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
        {isSending ? (
          <><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Mengirim...</span></>
        ) : (
          <><Zap size={18} /> Kirim Test ke OBS Sekarang</>
        )}
      </button>

      {lastSent && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 text-xs text-white dark:text-white font-bold bg-emerald-50 dark:bg-emerald-950/40 rounded-xl px-4 py-3 border border-emerald-100 dark:border-emerald-900">
          <CheckCircle2 size={14} /> MediaShare berhasil dikirim: {lastSent.toLocaleTimeString('id-ID')}
        </motion.div>
      )}
    </div>
  );
};

// ─── StreamerProfileModal ─────────────────────────────────────────────────────

const StreamerProfileModal = ({ username, currentUserId, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: streamer, isLoading, error } = useQuery({
    queryKey: ['publicProfile', username],
    queryFn: () => fetchPublicProfile(username),
    enabled: !!username,
  });
  
  const donateUrl = `${window.location.origin}/donate/${username}`;
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(donateUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (!mounted) return null;

  if (error) {
    return createPortal(
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-[300] flex items-center justify-center p-4"
          onClick={onClose}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
            className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-8 text-center max-w-sm w-full"
            onClick={e => e.stopPropagation()}>
            <p className="text-red-500 text-4xl mb-4">⚠️</p>
            <p className="font-black text-xl">Gagal memuat profil</p>
            <button onClick={onClose} className="mt-6 px-6 py-3 bg-slate-900/70 text-white rounded-xl font-bold">Tutup</button>
          </motion.div>
        </motion.div>
      </AnimatePresence>,
      document.body  // ← tambahkan ini
    );
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999999999999999] flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
          className="z-[999999] mt-auto md:mt-0 bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl  min-h-[60vh] max-h-[90vh] pb-4 md:h-max overflow-y-auto max-w-5xl w-full overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 relative"
          onClick={e => e.stopPropagation()}
        >
          <div className="h-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 relative">
            <button onClick={onClose} className="absolute top-6 md:top-4 right-4 z-10 w-9 h-9 bg-slate-100/20 hover:bg-slate-100/30 rounded-xl  flex items-center justify-center text-white cursor-pointer active:scale-[0.98] transition-all">
              <X size={18} className='text-white' />
            </button>
          </div>

          <div className="flex flex-col md:flex-row">
            <div className="md:w-[40%] p-6 md:p-8 md:border-r border-slate-50 dark:border-slate-800/50 flex flex-col justify-between">
              <div className="relative mt-0 md:mt-0 mb-4">
                <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl  ml-[-5px] mb-4 shadow-xl inline-block">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl  bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl font-black text-blue-600 border-4 border-white dark:border-slate-900 overflow-hidden">
                    {streamer?.profilePicture ? (
                      <img src={streamer.profilePicture} alt={username} className="w-full h-full object-cover" />
                    ) : username?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                  {streamer?.fullName || username}
                  <div className="w-4 h-4 bg-blue-500 rounded-xl  flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-xl" />
                  </div>
                </h2>
                <p className="text-blue-600 dark:text-blue-400 font-bold text-sm">@{username}</p>
              </div>
              <div className="space-y-3">
                <div className="flex flex-col mt-auto space-y-1 gap-3 mt-4">
                  <button onClick={copy} className="
                    text-slate-900 dark:text-white 
                    bg-slate-100 dark:bg-white/20
                    -translate-y-[3px] translate-x-[-3px]
                    [box-shadow:4px_6px_0_#f1f5f9]
                    dark:[box-shadow:4px_4px_0_#99a3b1]
                    hover:translate-y-0 hover:translate-x-0
                    hover:bg-slate-200 dark:hover:bg-slate-700
                    border border-slate-300
                    hover:[box-shadow:0_0_0_#f1f5f9]
                    dark:hover:[box-shadow:0_0_0_#94a3b8]
                    active:translate-y-[2px] cursor-pointer active:translate-x-[2px]
                    active:[box-shadow:none]
                    active:bg-slate-300 dark:active:bg-slate-800
                  w-full flex items-center justify-center gap-3 py-3 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700">
                    {copied ? <><CheckCircle2 size={16} /> Tersalin!</> : <><Copy size={16} /> Salin Link Profile</>}
                  </button>
                  <button className="
                    text-slate-900 dark:text-white
                    -translate-y-[3px] translate-x-[-3px]
                    [box-shadow:4px_6px_0_#f1f5f9]
                    dark:[box-shadow:4px_4px_0_#99a3b1]
                    hover:translate-y-0 hover:translate-x-0
                    border border-slate-300
                    hover:[box-shadow:0_0_0_#f1f5f9]
                    dark:hover:[box-shadow:0_0_0_#94a3b8]
                    active:translate-y-[2px] active:translate-x-[2px]
                    active:[box-shadow:none]
                    active:bg-slate-300 dark:active:bg-slate-800
                  w-full py-3 bg-blue-600 cursor-pointer text-white rounded-xl  font-black text-sm shadow-lg shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                    <Heart size={16} /> Follow
                  </button>
                </div>
              </div>
            </div>

            <div className="md:w-[60%] p-6 md:p-8 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-end space-y-5">
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tentang Creator</h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {streamer?.bio || "Creator ini belum menuliskan bio. Mari beri dukungan agar terus berkarya! 🚀"}
                </p>
              </div>

              {(streamer?.instagram || streamer?.facebook || streamer?.youtube || streamer?.twitter) && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-black text-slate-400 dark:text-slate-500 mb-3">SOCIAL MEDIA</p>
                  <div className="flex flex-wrap gap-3">
                    {streamer.instagram && (
                      <a href={`https://instagram.com/${streamer.instagram.replace('@','')}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-3 px-4 py-3 bg-pink-50 dark:bg-pink-600 text-white rounded-xl  text-sm font-medium hover:bg-pink-700 active:scale-[0.98]">
                        📷 Instagram
                      </a>
                    )}
                    {streamer.facebook && (
                      <a href={streamer.facebook.startsWith('http') ? streamer.facebook : `https://facebook.com/${streamer.facebook}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-600 text-white rounded-xl  text-sm font-medium hover:bg-blue-700 active:scale-[0.98]">
                        👍 Facebook
                      </a>
                    )}
                    {streamer.youtube && (
                      <a href={streamer.youtube} target="_blank" rel="noreferrer"
                        className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-600 text-white rounded-xl  text-sm font-medium hover:bg-red-700 active:scale-[0.98]">
                        ▶ YouTube
                      </a>
                    )}
                    {streamer.twitter && (
                      <a href={`https://twitter.com/${streamer.twitter.replace('@','')}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-3 px-4 py-3 bg-sky-50 dark:bg-emerald-600 text-white rounded-xl  text-sm font-medium hover:bg-emerald-700 active:scale-[0.98]">
                        𝕏 Twitter
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2 space-y-3">
                <a href={donateUrl} target="_blank" rel="noopener noreferrer"
                  className="
                    text-slate-900 dark:text-white 
              bg-slate-100 dark:bg-white/20
              -translate-y-[3px] translate-x-[-3px]
              [box-shadow:4px_6px_0_#f1f5f9]
              dark:[box-shadow:4px_4px_0_#99a3b1]
              hover:translate-y-0 hover:translate-x-0
              hover:bg-slate-200 dark:hover:bg-slate-700
              border border-slate-300
              hover:[box-shadow:0_0_0_#f1f5f9]
              dark:hover:[box-shadow:0_0_0_#94a3b8]
              active:translate-y-[2px] active:translate-x-[2px]
              active:[box-shadow:none]
              cursor-pointer
              active:bg-slate-300 dark:active:bg-slate-800
                  flex items-center justify-center gap-3 w-full py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl  font-black text-sm shadow-xl shadow-blue-100 dark:shadow-blue-900/20 hover:brightness-110 transition-all active:scale-[0.98]">
                  <Heart size={16} fill="white" /> Dukung @{username}
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

// ─── BannedWordsEditor ────────────────────────────────────────────────────────

const BannedWordsEditor = ({ saveSettingsMutation, settings, activeSlot }) => {
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [localAction, setLocalAction] = useState('censor');
  const [localReplacement, setLocalReplacement] = useState('');
  const [synced, setSynced] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['bannedWords'], queryFn: fetchBannedWords });
  const words = data?.words || [];

  useEffect(() => {
    if (data && !synced) { setLocalAction(data.action || 'censor'); setLocalReplacement(data.replacement || ''); setSynced(true); }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: saveBannedWords,
    onSuccess: (responseData) => queryClient.setQueryData(['bannedWords'], responseData),
  });

  const save = (overrides = {}) => saveMutation.mutate({ words, action: localAction, replacement: localReplacement, ...overrides });
  const add = () => {
    const w = input.trim().toLowerCase();
    if (!w || words.includes(w)) return;
    save({ words: [...words, w] });
    setInput('');
  };
  const remove = (word) => save({ words: words.filter(w => w !== word) });

  const ACTION_OPTIONS = [
    { id: 'block',   emoji: '🚫', title: 'Tolak Pesan',  desc: 'Dukungan dengan kata terlarang langsung ditolak.', active: 'border-red-500 bg-red-50 dark:bg-red-950/30' },
    { id: 'censor',  emoji: '✱',  title: 'Sensor Kata',  desc: 'Kata diganti dengan bintang (***). Dukungan tetap masuk.', active: 'border-amber-500 bg-amber-50 dark:bg-amber-950/30' },
    { id: 'replace', emoji: '✏️', title: 'Ganti Teks',   desc: 'Kata diganti dengan teks pilihanmu.', active: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' },
  ];

  return (
    <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl  p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-7">
      <SectionHeader icon={<ShieldCheck size={20} />} title="Filter Kata Terlarang" color="bg-red-500" />
      <div className="space-y-3">
        {/* <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Aksi saat kata terlarang terdeteksi</label> */}
        <div className="grid grid-cols-1 gap-3">
          {ACTION_OPTIONS.map(opt => (
            <button key={opt.id}
              onClick={() => { setLocalAction(opt.id); saveMutation.mutate({ words, action: opt.id, replacement: localReplacement }); }}
              className={`cursor-pointer active:scale-[0.99] text-left p-4 rounded-xl border-2 transition-all space-y-1.5 ${localAction === opt.id ? opt.active + ' shadow-md' : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{opt.emoji}</span>
                <span className="font-black text-sm text-slate-700 dark:text-slate-200">{opt.title}</span>
              </div>
              <p className="text-[11px] font-medium leading-relaxed text-slate-400 dark:text-slate-500">{opt.desc}</p>
            </button>
          ))}
        </div>
        {localAction === 'replace' && (
          <InputField
            label="Ganti dengan"
            value={localReplacement}
            onChange={v => setLocalReplacement(v)}
            onBlur={() => save({ replacement: localReplacement })}
            placeholder="contoh: [dihapus], ❤️, [sensor]"
          />
        )}
      </div>
      <div className="border-t border-slate-100 dark:border-slate-800" />
      <div className="space-y-3">
        {/* <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Daftar kata terlarang</label> */}
        <div className="md:flex gap-3 md:space-y-0 space-y-3">
          <InputField
            label="Kata-kata"
            value={input}
            onChange={v => setInput(v)}
            onKeyDown={e => e.key === 'Enter' && add()}
            placeholder="Ketik kata lalu tekan Enter..."
            // className="flex-1"
          />
          <button onClick={add} className="md:w-max w-max mt-1 md:mt-0 cursor-pointer active:scale-[0.99] px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-sm transition-all flex items-center gap-3">
            <Plus size={16} /> Tambah
          </button>
        </div>
        {isLoading ? <div className="text-slate-400 text-sm font-bold animate-pulse">Memuat...</div>
          : words.length === 0
            ? <div className="rounded-xl  border-2 border-dashed border-slate-200 dark:border-slate-700 py-8 text-center text-slate-400">
                <p className="text-2xl mb-2">🚫</p>
                <p className="font-black text-sm">Belum ada kata terlarang</p>
              </div>
            : <div className="md:flex md:flex-wrap grid grid-cols-3 gap-3">
                {words.map(word => (
                  <span key={word} className="w-full md:w-max flex justify-center md:justify-start items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl  text-sm font-black border border-red-100 dark:border-red-900">
                    {word}
                    <button onClick={() => remove(word)} className="cursor-pointer hover:text-red-800 dark:hover:text-red-300 transition-colors"><Trash2 size={12} /></button>
                  </span>
                ))}
              </div>
        }
        <button onClick={() => saveSettingsMutation.mutate({ settings, slot: activeSlot })} disabled={saveSettingsMutation.isPending}
          className="
          text-slate-900 dark:text-white bg-slate-100 dark:bg-white/20
          -translate-y-[3px] translate-x-[-3px]
          [box-shadow:4px_6px_0_#f1f5f9]
          dark:[box-shadow:4px_4px_0_#99a3b1]
          hover:translate-y-0 hover:translate-x-0
          hover:bg-slate-200 dark:hover:bg-slate-700
          border border-slate-300
          hover:[box-shadow:0_0_0_#f1f5f9]
          dark:hover:[box-shadow:0_0_0_#94a3b8]
          active:translate-y-[2px] active:translate-x-[2px]
          active:[box-shadow:none]
          active:bg-slate-300 dark:active:bg-slate-800
          cursor-pointer active:scale-[0.99] hover:brightness-90 w-full bg-slate-900/70 dark:bg-slate-700 text-white py-3 md:py-4 rounded-xl font-black text-sm transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-70 flex items-center justify-center gap-3">          
          <Save size={18} className='relative top-[-1px]' />
          {saveSettingsMutation.isPending ? (
            <><RefreshCw size={18} className="animate-spin" /> Menyimpan...</>
          ) : (
            <> Simpan Sekarang</>
          )}
        </button>
      </div>
    </div>
  );
};

// ─── MilestonesEditor ─────────────────────────────────────────────────────────

const MilestonesEditor = () => {
  const queryClient = useQueryClient();
  const { data: raw, isLoading } = useQuery({ queryKey: ['milestones'], queryFn: fetchMilestones });
  const [local, setLocal] = useState(null);

  useEffect(() => { if (raw && !local) setLocal(Array.isArray(raw) ? raw : []); }, [raw]);

  const mutation = useMutation({
    mutationFn: saveMilestones,
    onSuccess: (saved) => { queryClient.invalidateQueries({ queryKey: ['milestones'] }); setLocal(saved); },
  });

  const list = local || [];
  const add    = () => setLocal([...list, { title: '', targetAmount: 1000000, order: list.length }]);
  const remove = (i) => setLocal(list.filter((_, idx) => idx !== i));
  const upd    = (i, key, val) => setLocal(list.map((m, idx) => idx === i ? { ...m, [key]: val } : m));

  return (
    <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl  p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-5">
      <SectionHeader icon={<TrendingUp size={20} />} title="Milestones" color="bg-green-500" />
      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Tampilkan progress target dukungan di halaman publik kamu.</p>
      {isLoading ? <div className="text-slate-400 text-sm font-bold animate-pulse">Memuat...</div> : (
        <div className="space-y-3">
          {list.length === 0 && (
            <div className="rounded-xl  border-2 border-dashed border-slate-200 dark:border-slate-700 py-8 text-center text-slate-400">
              <p className="text-2xl mb-2">🎯</p><p className="font-black text-sm">Belum ada milestone</p>
            </div>
          )}
          {list.map((m, i) => (
            <div key={i} className="flex gap-3 items-end bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                {[['Judul Milestone', 'title', m.title, 'text', 'contoh: Beli mic baru!'], ['Target (Rp)', 'targetAmount', m.targetAmount, 'number', '']].map(([lbl, key, val, type, ph]) => (
                  <InputField
                    key={key}
                    label={lbl}
                    type={type}
                    value={val}
                    placeholder={ph}
                    onChange={v => upd(i, key, type === 'number' ? Number(v) : v)}
                  />
                ))}
              </div>
              <button onClick={() => remove(i)} className="cursor-pointer active:scale-[0.99] text-red-400 hover:text-red-600 p-2 flex-shrink-0"><Trash2 size={16} /></button>
            </div>
          ))}
          <button onClick={add} className="cursor-pointer active:scale-[0.99] w-full py-3 border-2 border-dashed border-green-200 dark:border-green-900 text-green-600 dark:text-green-400 rounded-xl font-black text-sm hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 transition-all flex items-center justify-center gap-3">
            <Plus size={16} /> Tambah Milestone
          </button>
          {list.length > 0 && (
            <button onClick={() => mutation.mutate(list)} disabled={mutation.isPending}
              className="cursor-pointer active:scale-[0.99] w-full py-3 md:py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-70">
              <Save size={16} /> {mutation.isPending ? 'Menyimpan...' : 'Simpan Milestones'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── SoundPicker (Upload MP3 Version) ─────────────────────────────────────

const SoundPicker = ({ value, onChange, label = 'Pilih Suara' }) => {
  const [mode, setMode] = useState('preset');
  const [uploading, setUploading] = useState(false);
  const [playing, setPlaying] = useState(null);
  const audioRef = useRef(null);

  const playPreview = (url) => {
    if (!url) return;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(() => {});
    setPlaying(url);

    audio.onended = () => setPlaying(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('❌ Hanya file audio yang diizinkan');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('❌ Maksimal 10MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('audio', file);

    try {
      const res = await api.post('/api/overlay/upload-audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url = res.data.url;
      onChange(url);
      // playPreview(url);
      toast.success('✅ Suara berhasil diupload');
    } catch (err) {
      toast.error('Upload gagal: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* {label && <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</label>} */}

      <div className="flex md:gap-3 gap-2">
        {[{ id: 'preset', label: 'Preset' }, { id: 'upload', label: 'Upload MP3' }].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`cursor-pointer uppercase active:scale-[0.99] text-left px-4 py-4 rounded-xl font-black text-xs transition-all flex-1 ${
              mode === m.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Preset */}
      {mode === 'preset' && (
        <div className="grid grid-cols-2 md:grid-cols-4 md:gap-3 gap-2">
          <button onClick={() => { onChange(''); setPlaying(null); }}
            className={`cursor-pointer uppercase active:scale-[0.99] flex items-center gap-1.5 p-3 rounded-xl border-2 font-black text-xs transition-all ${
              !value ? 'border-slate-600 bg-slate-800 text-white' : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500'
            }`}>
            <span className="text-lg">🔇</span> Tanpa Suara
          </button>

          {SOUND_PRESETS.map(preset => (
            <button key={preset.url}
              onClick={() => { playPreview(preset.url); onChange(preset.url); }}
              className={`cursor-pointer active:scale-[0.99] flex items-center gap-1.5 p-3 rounded-xl border-2 font-black text-xs transition-all ${
                value === preset.url ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700' : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500'
              }`}>
              <span className="text-lg">{preset.label.split(' ')[1]}</span>
              <span className='text-xs md:text-sm uppercase'>{preset.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      )}

      {/* Upload MP3 */}
      {mode === 'upload' && (
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl  p-6 text-center">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="tier-sound-upload"
          />
          <label htmlFor="tier-sound-upload" className="cursor-pointer block py-8">
            <Upload size={32} className="mx-auto mb-3 text-blue-500" />
            <p className="font-bold text-slate-700 dark:text-slate-300">
              {uploading ? 'Mengupload...' : 'Klik untuk upload MP3'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Maksimal 10MB</p>
          </label>
        </div>
      )}

      {/* Preview Suara Saat Ini */}
      {value && (
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-xl  p-4 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => playPreview(value)}
            className="cursor-pointer active:scale-[0.98] w-9 h-9 bg-blue-600 rounded-xl  flex items-center justify-center text-white flex-shrink-0"
          >
            {playing === value ? <Pause size={18} /> : <Play size={18} />}
          </button>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
              {SOUND_PRESETS.find(p => p.url === value)?.label || 'Custom Uploaded Sound'}
            </p>
            <p className="text-xs text-slate-400 font-mono truncate">{value}</p>
          </div>

          <button onClick={() => { onChange(''); setPlaying(null); }} className="text-red-400 hover:text-red-600">
            <Trash2 size={18} />
          </button>
        </div>
      )}

      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

// ─── QrCodeCard ───────────────────────────────────────────────────────────────

const QrCodeCard = ({ username }) => {
  const donateUrl = `${window.location.origin}/donate/${username}`;
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(donateUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl  p-4 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Tampilkan QR ini di stream / sosmed. Scan langsung ke halaman dukungan kamu.</p>
      <div className="flex flex-col items-start gap-3">
        <div className="p-4 bg-white rounded-xl border-4 border-slate-900 shadow-xl inline-block">
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(donateUrl)}&color=0f172a&bgcolor=ffffff&format=svg&margin=0`} alt="QR Code" width={200} height={200} />
        </div>
        <p className="font-black text-slate-700 dark:text-slate-300 text-sm">{donateUrl}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={copy} className={`cursor-pointer active:scale-[0.99] flex items-center justify-center gap-3 py-3 md:py-4 rounded-xl  font-black text-sm transition-all ${copied ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>
          {copied ? <><CheckCircle2 size={16} /> Tersalin!</> : <><Copy size={16} /> Salin URL</>}
        </button>
        <a href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(donateUrl)}&color=0f172a&format=png`}
          download={`qr-dukungan-${username}.png`} target="_blank" rel="noreferrer"
          className="cursor-pointer active:scale-[0.99] flex items-center justify-center gap-3 py-3 md:py-4 rounded-xl  font-black text-sm bg-slate-900/70 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600 transition-all">
          ↓ Download QR
        </a>
      </div>
    </div>
  );
};

// ─── LeaderboardCard ──────────────────────────────────────────────────────────

const LeaderboardCard = ({ stats }) => {
  const topDonors = stats?.topDonors || [];
  if (!topDonors.length) return null;
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl  pb-1.5 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="px-4 md:px-6 py-5 dark:border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center text-lg">🏆</div>
        <div><p className="font-black text-slate-800 dark:text-slate-100">Leaderboard Donor</p><p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Semua waktu</p></div>
      </div>
      <div className="py-0 md:px-2 space-y-3">
        {topDonors.slice(0, 3).map((donor, i) => (
          <motion.div key={donor.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
            className={`flex items-center gap-3 p-4 dark:border-slate-100/10 border-t border-slate-200 dark:text-white text-black`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0 ${i < 3 ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
              {i < 3 ? medals[i] : `#${i + 1}`}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-black text-sm truncate ${i < 3 ? 'dark:text-white text-black' : 'text-slate-800 dark:text-slate-100'}`}>{donor.name}</p>
              <p className={`text-[10px] font-medium ${i < 3 ? 'dark:text-white text-black/70' : 'text-slate-400 dark:text-slate-500'}`}>{donor.count}x dukungan</p>
            </div>
            <p className={`font-black text-sm flex-shrink-0 ${i < 3 ? 'dark:text-white text-black' : 'text-blue-600 dark:text-blue-400'}`}>
              Rp {Number(donor.totalAmount).toLocaleString('id-ID')}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ─── AdminWithdrawalPage ──────────────────────────────────────────────────────

const AdminWithdrawalPage = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [rejectNote, setRejectNote] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchAdminWDs = async () => (await api.get(`/api/midtrans/admin/withdrawals?status=${statusFilter}`)).data;
  const { data, isLoading, refetch, isFetching } = useQuery({ queryKey: ['adminWithdrawals', statusFilter], queryFn: fetchAdminWDs, refetchInterval: 30000 });
  const withdrawals = data?.withdrawals || [];
  const pagination  = data?.pagination  || {};

  const updateMutation = useMutation({
    mutationFn: ({ id, status, note }) => api.put(`/api/midtrans/admin/withdrawals/${id}`, { status, note }).then(r => r.data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adminWithdrawals'] }); setRejectNote(''); setShowApproveModal(false); setShowRejectModal(false); },
    onError: (err) => alert(err.response?.data?.message || 'Gagal update status'),
  });

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID').format(Math.round(num || 0));

  return (
    <div className="w-full space-y-5 pb-0">
      <AnimatePresence>
          {showApproveModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed z-[99999] inset-0 bg-black/70 h-screen backdrop-blur-md z-[200] flex items-center justify-center p-4" onClick={() => setShowApproveModal(false)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl max-w-md w-full p-8 text-center border border-slate-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-950/40 rounded-xl flex items-center justify-center text-5xl">✅</div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Konfirmasi Approve</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-8">Apakah Anda yakin sudah mentransfer dana ke streamer ini?</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowApproveModal(false)} className="cursor-pointer flex-1 py-3 md:py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black rounded-xl ">Batal</button>
                  <button onClick={() => updateMutation.mutate({ id: selectedId, status: 'COMPLETED' })} disabled={updateMutation.isPending} className="cursor-pointer flex-1 py-3 md:py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl transition-all disabled:opacity-70">
                    {updateMutation.isPending ? 'Memproses...' : 'Ya, Sudah Transfer'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showRejectModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-4" onClick={() => setShowRejectModal(false)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl max-w-md w-full p-8 border border-slate-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2 text-center">Tolak Penarikan</h3>
                <p className="text-slate-600 dark:text-slate-400 text-center mb-6">Berikan alasan penolakan (opsional)</p>
                <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Contoh: Rekening tidak valid..." className="w-full h-32 p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl  focus:border-red-400 outline-none resize-y font-medium" />
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowRejectModal(false)} className="cursor-pointer flex-1 py-3 md:py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black rounded-xl">Batal</button>
                  <button onClick={() => updateMutation.mutate({ id: selectedId, status: 'FAILED', note: rejectNote || 'Ditolak oleh admin' })} disabled={updateMutation.isPending} className="cursor-pointer flex-1 py-3 md:py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl  transition-all disabled:opacity-70">
                    {updateMutation.isPending ? 'Memproses...' : 'Konfirmasi Tolak'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      <div className="bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 from-blue-700 to-indigo-800  rounded-xl p-4 md:p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-300 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Super Admin</p>
            <h2 className="text-2xl font-black">Penarikan Dana</h2>
          </div>
          <div className="hidden md:flex items-center gap-3 text-blue-200 dark:text-slate-400 text-xs font-bold">
            <span className="w-2 h-2 bg-green-400 rounded-xl  animate-pulse" /> Auto 30s
            <button onClick={() => refetch()} disabled={isFetching} className="ml-1 hover:text-white transition-colors disabled:opacity-50">
              <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>
      <div className="flex px-4 md:px-0 gap-3 flex-wrap">
        {[{ val: 'PENDING', label: '⏳ Pending' }, { val: 'COMPLETED', label: '✅ Selesai' }, { val: 'FAILED', label: '❌ Ditolak' }, { val: '', label: '📋 Semua' }].map(f => (
          <button key={f.val} onClick={() => setStatusFilter(f.val)}
            className={`cursor-pointer active:scale-[0.98] px-4 py-3 rounded-xl font-black text-sm transition-all ${statusFilter === f.val ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700'}`}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm w-[91vw] mx-auto md:w-full rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="hidden md:flex items-center justify-between px-4 md:px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{statusFilter ? `Request ${statusFilter}` : 'Semua Request'}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{pagination.total || 0} total</p>
          </div>
          {/* <span className="px-4 py-3 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl  text-[10px] font-black uppercase tracking-widest">Super Admin Only</span> */}
        </div>
        {isLoading
          ? <div className="flex items-center justify-center py-30 text-slate-400 font-bold gap-3"><div className="w-5 h-5 border-4 border-slate-200 border-t-blue-600 rounded-xl animate-spin" />Memuat data...</div>
          : withdrawals.length === 0
            ? <div className="py-16 text-center text-slate-400"><p className="text-4xl mb-3">📭</p><p className="font-black text-slate-500">Tidak ada request</p></div>
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      {['Streamer', 'Jumlah', 'Metode', 'No. Rekening', 'Status', 'Waktu', ...(statusFilter === 'PENDING' ? ['Aksi'] : [])].map(h => <th key={h} className="px-6 py-5">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {withdrawals.map(wd => (
                      <tr key={wd._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                        <td className="px-6 py-5"><p className="font-black text-slate-700 dark:text-slate-200 text-sm">@{wd.userId?.username || '-'}</p></td>
                        <td className="px-6 py-5"><p className="text-white dark:text-white font-black text-sm">Rp {formatRupiah(Number(wd.amount) - 4000)}</p></td>
                        <td className="px-6 py-5"><p className="font-bold text-slate-600 dark:text-slate-300 text-sm">{wd.paymentMethod || 'BANK'}</p></td>
                        <td className="px-6 py-5"><p className="font-mono font-bold text-slate-700 dark:text-slate-200 text-sm">{wd.accountNumber}</p></td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-3 rounded-xl text-[10px] font-black ${wd.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400' : wd.status === 'FAILED' ? 'bg-red-100 dark:bg-red-950/40 text-red-500 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'}`}>{wd.status}</span>
                        </td>
                        <td className="px-6 py-5"><p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">{formatDate(wd.createdAt)}</p></td>
                          {statusFilter === 'PENDING' && (
                          <td className="px-6 py-5">
                            {wd.status === 'PENDING' && (
                            <div className="flex gap-3">
                              <button onClick={() => { setSelectedId(wd._id); setShowApproveModal(true); }} className="cursor-pointer px-2.5 py-3 bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-xl text-sm font-black hover:bg-green-200 transition-all flex items-center"><Check size={18} /></button>
                              <button onClick={() => { setSelectedId(wd._id); setRejectNote(''); setShowRejectModal(true); }} className="cursor-pointer px-2.5 py-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl  text-sm font-black hover:bg-red-100 transition-all"><X size={18} /></button>
                            </div>
                          )}
                        </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        }
      </div>
    </div>
  );
};

// ─── DurationSettings ─────────────────────────────────────────────────────────

const DurationSettingsSkeleton = ({ alertOnly = false, mediaOnly = false }) => {
  return (
    <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl  p-4 md:p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3 md:space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-slate-200 dark:bg-slate-700 w-11 h-11 rounded-xl" />
        <div className="h-7 w-64 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>

      <div className="space-y-10">
        {/* Alert Biasa Section */}
        {!mediaOnly && (
          <div className="space-y-5">
            <div className="h-7 w-40 bg-slate-200 dark:bg-slate-700 rounded" /> {/* "Alert Biasa" */}
            
            <div className="flex flex-col gap-3">
              {/* Durasi Dasar */}
              <div>
                <div className="h-3 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl " />
              </div>

              {/* Tambahan */}
              <div>
                <div className="h-3 w-36 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl " />
                  <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl " />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Media Share Section */}
        {!alertOnly && (
          <div className="space-y-5">
            <div className="h-7 w-40 bg-slate-200 dark:bg-slate-700 rounded" /> {/* "Media share" */}
            
            <div className="flex flex-col gap-3">
              {/* Durasi Dasar */}
              <div>
                <div className="h-3 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl " />
              </div>

              {/* Tambahan */}
              <div>
                <div className="h-3 w-36 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl " />
                  <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl " />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Kalkulasi */}
      <div className="bg-slate-50 dark:bg-slate-800/70 p-5 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
        <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
        <div className="space-y-3">
          {!mediaOnly && (
            <div className="flex justify-between items-center">
              <div className="h-4 w-52 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          )}
          {!alertOnly && (
            <div className="flex justify-between items-center">
              <div className="h-4 w-52 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="h-14 bg-slate-200 dark:bg-slate-700 rounded-xl " />
    </div>
  );
};

const DurationSettings = ({ settings, onChange, saveSettingsMutation, alertOnly = false, mediaOnly = false, activeSlot }) => {
  return (
    <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl  p-4 md:p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3 md:space-y-5">
      <SectionHeader
        icon={<Timer size={18} />}
        title={mediaOnly ? 'Durasi Medshare' : alertOnly ? 'Durasi Alert' : 'Pengaturan Durasi'}
        color="bg-amber-500"
      />

      <div className="space-y-10">

        {!mediaOnly && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-black text-slate-500 block mb-1.5">
                Durasi Default Alert (detik)
              </label>
              <InputField
                label="Detik"
                type="number"
                value={settings.alertBaseDuration ?? 12}
                onChange={v => onChange('alertBaseDuration', v === '' ? 12 : Number(v))}
                min={5} max={60}
                inputClassName="text-center"
              />
              <p className="text-[10px] text-slate-500 mt-2">
                Jika TTS lebih lama, akan mengikuti TTS
              </p>
            </div>
          </div>
        )}

        {/* Media share — hanya tampil kalau bukan alertOnly */}
        {!alertOnly && (
          <div className="space-y-5">
            {/* <h4 className="font-black text-lg">Media share</h4> */}
            <div className="flex flex-col gap-3">
              <div>
                {/* <label className="text-xs font-black text-slate-500 block mb-1.5">Durasi Dasar (detik)</label> */}
                <InputField
                  label="Detik"
                  type="number"
                  value={settings.mediaShareBaseDuration || ''}
                  onChange={v => onChange('mediaShareBaseDuration', v === '' ? '' : Number(v))}
                  inputClassName="text-center"
                />
              </div>
              <div>
                <div className="md:flex items-center gap-3">
                  <div className='w-full'>
                    {/* <label className="text-xs font-black text-slate-500 block mb-1.5">Tambahan tiap Rp</label> */}
                    <div className='md:flex items-center'>
                      <InputField
                        label="Tiap Rp"
                        type="number"
                        value={settings.mediaShareExtraPerAmount || ''}
                        onChange={v => onChange('mediaShareExtraPerAmount', v === '' ? '' : Number(v))}
                        inputClassName="text-center"
                      />
                      <span className="md:flex hidden dark:text-white ml-2 text-slate-900 font-bold"><Plus /></span>
                    </div>
                  </div>
                  <div className='md:mt-0 mt-4'>
                    {/* <label className="text-xs font-black text-slate-500 block mb-1.5">Detik</label> */}
                    <InputField
                      label="Detik"
                      type="number"
                      value={settings.mediaShareExtraDuration || ''}
                      onChange={v => onChange('mediaShareExtraDuration', v === '' ? '' : Number(v))}
                      inputClassName="text-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview kalkulasi */}
        <div className={`${!mediaOnly ? 'hidden' : ''} bg-slate-50 dark:bg-slate-800/70 p-4 md:p-5 rounded-xl text-sm border border-dashed border-slate-200 dark:border-slate-700`}>
          {/* <p className="font-black text-xs text-slate-400 mb-3">DURASI SAAT INI</p> */}
          <div className="space-y-3">
            {!mediaOnly && (
              <div className="flex justify-between items-center">
                <span>Alert (default)</span>
                 <div className='flex items-center gap-2'>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {Number(settings.alertBaseDuration) || 12} detik
                  </span>
                </div>
              </div>
            )}

            {!alertOnly && (
              <div className="flex justify-between items-center">
                <span className='text-sm'>Rp 50.000</span>
                <span className="text-slate-900 text-sm dark:text-white">
                  {(Number(settings.mediaShareBaseDuration) || 15) + 
                  Math.floor(50000 / (Number(settings.mediaShareExtraPerAmount) || 10000)) * 
                  (Number(settings.mediaShareExtraDuration) || 2)} detik
                </span>
              </div>
            )}
          </div>
        </div>

      <button onClick={() => saveSettingsMutation.mutate({ settings, slot: activeSlot })} disabled={saveSettingsMutation.isPending}
        className="
        text-slate-900 dark:text-white bg-slate-100 dark:bg-white/20
        -translate-y-[3px] translate-x-[-3px]
        [box-shadow:4px_6px_0_#f1f5f9]
        dark:[box-shadow:4px_4px_0_#99a3b1]
        hover:translate-y-0 hover:translate-x-0
        hover:bg-slate-200 dark:hover:bg-slate-700
        border border-slate-300
        hover:[box-shadow:0_0_0_#f1f5f9]
        dark:hover:[box-shadow:0_0_0_#94a3b8]
        active:translate-y-[2px] active:translate-x-[2px]
        active:[box-shadow:none]
        active:bg-slate-300 dark:active:bg-slate-800
        cursor-pointer active:scale-[0.99] hover:brightness-90 w-full bg-slate-900/70 dark:bg-slate-700 text-white py-3 md:py-4 rounded-xl font-black text-sm transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-70 flex items-center justify-center gap-3">
        <Save size={18} className='relative top-[-1px]' />
        {saveSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Durasi'}
      </button>
    </div>
  );
};

// ─── MediaTriggersEditor ──────────────────────────────────────────────────────

const MediaTriggersEditor = ({ triggers, onChange, saveSettingsMutation, settings, activeSlot }) => {
  const add    = () => onChange([...triggers, { minAmount: 50000, mediaType: 'both', label: '' }]);
  const remove = (i) => onChange(triggers.filter((_, idx) => idx !== i));
  const update = (i, key, val) => onChange(triggers.map((t, idx) => idx === i ? { ...t, [key]: val } : t));
  const mediaTypeOptions = [
    { value: 'image', icon: <ImageIcon size={13} />, label: 'Gambar', desc: 'jpg, gif, png' },
    { value: 'video', icon: <Video size={13} />,     label: 'Video',  desc: 'mp4, webm'    },
    { value: 'both',  icon: <span className="flex items-center gap-0.5"><ImageIcon size={11} /><Video size={11} /></span>, label: 'Semua', desc: 'gambar & video' },
  ];
  return (
    <div className="space-y-3">
      {triggers.length === 0 && (
        <div className="rounded-xl  bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 px-5 py-6 text-center">
          <div className="w-10 h-10 rounded-xl  bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3"><ImageIcon size={18} className="text-slate-400" /></div>
          <p className="text-sm font-black text-slate-500 dark:text-slate-400">Belum ada ketentuan media</p>
        </div>
      )}
      {triggers.map((t, i) => (
        <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-xl  p-5 border border-slate-100 dark:border-slate-700 space-y-5">
          <div className="flex items-center justify-between">
            <span className="font-black text-slate-700 dark:text-slate-200 text-sm">{t.label || `Media Alert ${i + 1}`}</span>
            <button onClick={() => remove(i)} className="cursor-pointer active:scale-[0.99] text-red-400 hover:text-red-600 transition-colors p-1"><Trash2 size={15} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[['Label', 'label', t.label, 'text', 'contoh: Sultan Alert'], ['Min-Nominal', 'minAmount', t.minAmount, 'number', '']].map(([lbl, key, val, type, ph]) => (
              <InputField
                key={key}
                label={lbl}
                type={type}
                value={val}
                placeholder={ph}
                onChange={v => update(i, key, type === 'number' ? Number(v) : v)}
              />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {mediaTypeOptions.map(opt => (
              <button key={opt.value} onClick={() => update(i, 'mediaType', opt.value)}
                className={`cursor-pointer active:scale-[0.99] flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl  border-2 font-black text-xs transition-all ${t.mediaType === opt.value ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300' : 'border-slate-100 dark:border-slate-700 text-slate-400 hover:border-slate-300 hover:bg-white dark:hover:bg-slate-700'}`}>
                <span className='md:flex hidden'>
                  {opt.icon}
                </span>
                <span>{opt.label}</span>
                <span className="md:flex hidden text-[9px] font-medium text-slate-300 dark:text-slate-500">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={add} className="cursor-pointer active:scale-[0.99] w-full py-3 border-2 border-dashed border-blue-200 dark:border-blue-900 text-blue-500 dark:text-blue-400 rounded-xl font-black text-sm hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all flex items-center justify-center gap-3">
        <Plus size={16} /> Tambah Ketentuan Media Alert
      </button>
      <button onClick={() => saveSettingsMutation.mutate({ settings, slot: activeSlot })} disabled={saveSettingsMutation.isPending}
        className="
        text-slate-900 dark:text-white bg-slate-100 dark:bg-white/20
          -translate-y-[3px] translate-x-[-3px]
          [box-shadow:4px_6px_0_#f1f5f9]
          dark:[box-shadow:4px_4px_0_#99a3b1]
          hover:translate-y-0 hover:translate-x-0
          hover:bg-slate-200 dark:hover:bg-slate-700
          border border-slate-300
          hover:[box-shadow:0_0_0_#f1f5f9]
          dark:hover:[box-shadow:0_0_0_#94a3b8]
          active:translate-y-[2px] active:translate-x-[2px]
          active:[box-shadow:none]
          active:bg-slate-300 dark:active:bg-slate-800
        cursor-pointer active:scale-[0.99] hover:brightness-90 w-full bg-slate-900/70 dark:bg-slate-700 text-white py-3 md:py-4 rounded-xl font-black text-sm transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-70 flex items-center justify-center gap-3">
        <Save size={18} className='relative top-[-1px]' />
        {saveSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Izin Media'}
      </button>
    </div>
  );
};

// ─── YouTubeLivePreview ───────────────────────────────────────────────────────

export const YouTubeLivePreview = ({ settings, username, testFullScreen, onPreviewModeChange, autoPreviewTick, onTogglePreview }) => {
  const [showAlert, setShowAlert] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [currentDonor, setCurrentDonor] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timerRef = useRef(null);
  const donorIdxRef = useRef(0);
  const [previewMode, setPreviewMode] = useState('alert'); 
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
          width: '100%',
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
                <span className="w-1.5 h-1.5 bg-red-400 rounded-xl  animate-pulse" /> Simulasi Dukungan
              </button>
              <button onClick={() => handleFullScreen()} className="cursor-pointer active:scale-[0.99] flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl  font-black text-xs transition-all border border-white/10">
                ✕ Tutup
              </button>
            </div>
          </div>
          <div className="flex-1 relative overflow-hidden">
            {/* <span className="absolute inset-0 flex items-center justify-center text-[clamp(60px,15vw,180px)] font-black text-white/[0.02] pointer-events-none select-none" style={{ letterSpacing: -8 }}>LIVE</span> */}
            <div className="absolute inset-0 pointer-events-none">
              <AnimatePresence>
                {showAlert && (
                  <motion.div key={animKey} initial={animVariants[settings.animation]?.initial || animVariants.bounce.initial} animate={animVariants[settings.animation]?.animate || animVariants.bounce.animate} exit={animVariants[settings.animation]?.exit || animVariants.bounce.exit} style={{ position: 'absolute', ...posMap[settings.overlayPosition || 'bottom-left'], zIndex: 10 }}>
                    {renderAlert()}
                     <img
                      src="/galaksi.gif"
                      alt=""
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.1,        // ← ubah sesuai selera
                        pointerEvents: 'none',
                        zIndex: 0,
                      }}
                    />
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
    <div id="tour-live-preview" className="sticky md:p-0 p-4 top-26 space-y-2.5">
      <FullscreenPreview />

      {/* Tab switcher */}
      <div className="flex gap-3 pl-[2px]">
        {/* Tombol toggle preview */}
        <button
          onClick={() => onTogglePreview?.()}
          title="Sembunyikan / Tampilkan Preview"
          className="
           text-slate-900 dark:text-white 
            -translate-y-[3px] translate-x-[-3px]
            [box-shadow:4px_6px_0_#f1f5f9]
            dark:[box-shadow:4px_4px_0_#99a3b1]
            hover:translate-y-0 hover:translate-x-0
            border border-slate-300
            hover:[box-shadow:0_0_0_#f1f5f9]
            dark:hover:[box-shadow:0_0_0_#94a3b8]
            active:translate-y-[2px] active:translate-x-[2px]
            active:[box-shadow:none]
            active:bg-slate-300 dark:active:bg-slate-800
          cursor-pointer active:scale-[0.99] flex items-center justify-center w-13 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all flex-shrink-0"
        >
          <PanelLeft size={18} />
        </button>

        {/* Tab switcher */}
        <div className="flex-1 flex gap-3">
          {[{ id: 'alert', label: '⚡ Alert OBS' }, { id: 'media', label: '🎦 Media share' }].map(tab => (
              <button key={tab.id} onClick={() => {
                setPreviewMode(tab.id);
                onPreviewModeChange?.(tab.id);
              }}
              className={`
               text-slate-900 dark:text-white 
                -translate-y-[3px] translate-x-[-3px]
                [box-shadow:4px_6px_0_#f1f5f9]
                dark:[box-shadow:4px_4px_0_#99a3b1]
                hover:translate-y-0 hover:translate-x-0
                border border-slate-300
                hover:[box-shadow:0_0_0_#f1f5f9]
                dark:hover:[box-shadow:0_0_0_#94a3b8]
                active:translate-y-[2px] active:translate-x-[2px]
                active:[box-shadow:none]
              cursor-pointer flex-1 py-3 text-xs font-black rounded-xl transition-all 
              ${previewMode === tab.id ? 'bg-white/30 dark:bg-blue-600 backdrop-blur-sm text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`relative overflow-hidden border-[1px] border-white/60 dark:border-slate-800 rounded-xl ${previewMode === 'alert' ? '2xl:h-[77.9vh] h-[73.4vh]' : '2xl:h-[77.9vh] h-[73vh]'} w-full`} style={{ aspectRatio: '16/9' }}>
        <div className="absolute inset-0 flex items-center justify-center bg-white/30 dark:bg-slate-900/60">
          {/* <span style={{ fontSize: 80, fontWeight: 500, color: 'rgba(255,255,255,0.04)', letterSpacing: -3, userSelect: 'none' }}>LIVE</span> */}
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence>
            {showAlert && previewMode === 'alert' && (
              <motion.div className='ml-1.5 md:ml-[14.2px] w-[90.7%] 2xl:w-[90%] md:w-[87%]' key={animKey} initial={anim.initial} animate={anim.animate} exit={anim.exit} style={{ position: 'absolute', bottom: 30, left: 10, zIndex: 10 }}>
                {renderAlert()}
              </motion.div>
            )}
            {showAlert && previewMode === 'media' && (
              <motion.div
                className='absolute bottom-10 2xl:ml-5 md:mt-[-12px] 2xl:mt-[0] w-[90%] 2xl:scale-[1] scale-[0.85]'
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
     
    </div>
  );
}

const getDonationItemDisplay = (donation) => {
  if (!donation.donationItem?.name) return null;

  const item = donation.donationItem;

  const qty = item.quantity ||
    Math.max(1, Math.floor((donation.amount || 0) / (item.price || 1)));

  return {
    display: `${item.emoji || '🎁'} ${item.name}`,
    qty: qty > 1 ? ` ×${qty}` : '',
    total: donation.amount || 0
  };
};

// ─── HistoryPage ──────────────────────────────────────────────────────────────

const HistoryPage = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [historyTab, setHistoryTab] = useState('received');
  const [replayLoading, setReplayLoading] = useState(new Set());
  const [lastReplayTime, setLastReplayTime] = useState({});
  const [viewMode, setViewMode] = useState('card'); // 'table' | 'card'
  const [showAmounts, setShowAmounts] = useState(() => {
    const saved = localStorage.getItem('showBalance');
    return saved === null ? true : saved === 'true'; // default true kalau belum ada
  });
  const [showEmails, setShowEmails] = useState(false);
  const [showItemAmounts, setShowItemAmounts] = useState({});

  useEffect(() => {
    const handler = () => {
      const saved = localStorage.getItem('showBalance');
      setShowAmounts(saved === null ? true : saved === 'true');
    };
    window.addEventListener('balanceUpdate', handler);
    return () => window.removeEventListener('balanceUpdate', handler);
  }, []);

  const { data: sentData, isLoading: sentLoading } = useQuery({
    queryKey: ['sentDonations', page],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit: 20 });
      return (await api.get(`/api/donations/sent?${params}`)).data;
    },
    enabled: historyTab === 'sent',
    keepPreviousData: true,
    refetchInterval: 30000,
  });

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['donationHistory', page, statusFilter],
    queryFn: () => fetchHistory({ page, limit: 20, status: statusFilter }),
    enabled: historyTab === 'received',
    keepPreviousData: true,
    refetchInterval: 15000,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['donationStats'],
    queryFn: fetchStats,
    refetchInterval: 30000,
  });

  const donations = data?.donations || [];
  const pagination = data?.pagination || {};

  const toggleItemAmount = (id) => {
    setShowItemAmounts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getDonationItemDisplay = (donation) => {
    if (!donation?.donationItem?.name) return null;
    const item = donation.donationItem;
    const qty = item.price > 0 ? Math.round(donation.amount / item.price) : 1;
    return {
      display: `${item.name}${qty > 1 ? ` ×${qty}` : ''}`,
      emoji: item.emoji || '🎁',
      sub: qty > 1
        ? `${qty}× Rp ${Number(item.price).toLocaleString('id-ID')} = Rp ${Number(donation.amount).toLocaleString('id-ID')}`
        : `Rp ${Number(item.price).toLocaleString('id-ID')}`,
    };
  };

  const maskAmount = (amount) => {
    if (!showAmounts) return '••••••';
    
    const num = Number(amount);
    if (num >= 1_000_000) {
      const val = num / 1_000_000;
      return `${val % 1 === 0 ? val : val.toFixed(1)}Jt`;
    }
    if (num >= 1_000) {
      const val = num / 1_000;
      return `${val % 1 === 0 ? val : val.toFixed(1)}K`;
    }
    return String(num);
  };

  const replayDonation = async (donationId) => {
    if (replayLoading.has(donationId)) return;
    const now = Date.now();
    if (lastReplayTime[donationId] && now - lastReplayTime[donationId] < 3000) return;
    setReplayLoading(prev => new Set([...prev, donationId]));
    setLastReplayTime(prev => ({ ...prev, [donationId]: now }));
    try {
      const response = await api.post(`/api/midtrans/replay-donation/${donationId}`);
      toast.success(`✅ Replay berhasil: ${response.data.donation.donor}`, { duration: 2500 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal replay');
    } finally {
      setReplayLoading(prev => {
        const next = new Set(prev);
        next.delete(donationId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-5 pb-0">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Semua Waktu', value: statsLoading ? '...' : maskAmount(stats?.allTime?.total || 0), sub: `${stats?.allTime?.count || 0} dukungan`, color: 'bg-blue-600', icon: '❤️' },
          { label: 'Bulan Ini', value: statsLoading ? '...' : maskAmount(stats?.thisMonth?.total || 0), sub: `${stats?.thisMonth?.count || 0} dukungan`, color: 'bg-violet-500', icon: '📅' },
          { label: 'Hari Ini', value: statsLoading ? '...' : maskAmount(stats?.today?.total || 0), sub: `${stats?.today?.count || 0} dukungan`, color: 'bg-purple-500', icon: '⚡' },
          { label: 'Top Donatur', value: statsLoading ? '...' : (stats?.topDonors?.[0]?.name || '-'), sub: stats?.topDonors?.[0] ? maskAmount(stats.topDonors[0].totalAmount) : 'Belum ada', color: 'bg-amber-500', icon: '🏆' },
        ].map((card) => (
          <div key={card.label} className={`${card.color} rounded-xl  p-4 md:p-6 text-white relative overflow-hidden`}>
            {/* <div className="absolute top-3 right-4 text-2xl opacity-20">{card.icon}</div> */}
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{card.label}</p>
            <p className="text-xl font-black leading-tight">{card.value}</p>
            <p className="text-xs opacity-70 font-medium mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {stats && <LeaderboardCard stats={stats} />}

      <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl  shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 md:px-6 py-5 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div>
            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Riwayat Dukungan</p>
          </div>
          <div className='flex items-center gap-1.5'>
            <div className="flex gap-1.5">
              {[{ id: 'received', label: 'Diterima' }, { id: 'sent', label: 'Terkirim' }].map((t) => (
                <button key={t.id} onClick={() => { setHistoryTab(t.id); setPage(1); setStatusFilter(''); }}
                  className={`
                   text-slate-900 dark:text-white 
                    -translate-y-[3px] translate-x-[-3px]
                    [box-shadow:4px_6px_0_#f1f5f9]
                    dark:[box-shadow:4px_4px_0_#99a3b1]
                    hover:translate-y-0 hover:translate-x-0
                    hover:bg-slate-200 dark:hover:bg-slate-700
                    border border-slate-300
                    hover:[box-shadow:0_0_0_#f1f5f9]
                    dark:hover:[box-shadow:0_0_0_#94a3b8]
                    active:translate-y-[2px] active:translate-x-[2px]
                    active:[box-shadow:none]
                  active:bg-slate-300 dark:active:bg-slate-800
                  px-4 py-3 text-xs cursor-pointer font-black rounded-md transition-all border border-slate-200 dark:border-slate-700 ${historyTab === t.id ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 hover:border-blue-200'}`}>
                  {t.label}
                </button>
              ))}
            </div>
            {/* <div className='!text-slate-500 h-[1px] bg-slate-700 mx-[2px] !w-[10px]'>
              
            </div> */}
            <div className="flex gap-1.5 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`
                   text-slate-900 dark:text-white
                -translate-y-[3px] translate-x-[-3px]
                [box-shadow:4px_6px_0_#f1f5f9]
                dark:[box-shadow:4px_4px_0_#99a3b1]
                hover:translate-y-0 hover:translate-x-0
                hover:bg-slate-200 dark:hover:bg-slate-700
                border border-slate-300
                hover:[box-shadow:0_0_0_#f1f5f9]
                dark:hover:[box-shadow:0_0_0_#94a3b8]
                active:translate-y-[2px] active:translate-x-[2px]
                active:[box-shadow:none]
              active:bg-slate-300 dark:active:bg-slate-800
                  px-4 py-3 flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 text-xs cursor-pointer font-black transition-all ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 hover:border-white'}`}
              >
                <List size={13} className='relative top-[-0.5px]' />
                Table
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`
                   text-slate-900 dark:text-white 
                -translate-y-[3px] translate-x-[-3px]
                [box-shadow:4px_6px_0_#f1f5f9]
                dark:[box-shadow:4px_4px_0_#99a3b1]
                hover:translate-y-0 hover:translate-x-0
                hover:bg-slate-200 dark:hover:bg-slate-700
                border border-slate-300
                hover:[box-shadow:0_0_0_#f1f5f9]
                dark:hover:[box-shadow:0_0_0_#94a3b8]
                active:translate-y-[2px] active:translate-x-[2px]
                active:[box-shadow:none]
              active:bg-slate-300 dark:active:bg-slate-800
                  px-4 py-3 flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 text-xs cursor-pointer font-black transition-all ${viewMode === 'card' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 hover:border-white'}`}
              >
                <Grid size={13} className='relative top-[-0.5px]' />
                Card
              </button>
            </div>
          </div>
        </div>

        {historyTab === 'received' && (
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4">
            <div className="flex gap-4">
              <button onClick={() => {
                const next = !showAmounts;
                setShowAmounts(next);
                localStorage.setItem('showBalance', String(next)); // ← sync ke localStorage
              }}
                className={`
                 text-slate-900 dark:text-white
                -translate-y-[3px] translate-x-[-3px]
                [box-shadow:4px_6px_0_#f1f5f9]
                dark:[box-shadow:4px_4px_0_#99a3b1]
                hover:translate-y-0 hover:translate-x-0
                hover:bg-slate-200 dark:hover:bg-slate-700
                border border-slate-300
                hover:[box-shadow:0_0_0_#f1f5f9]
                dark:hover:[box-shadow:0_0_0_#94a3b8]
                active:translate-y-[2px] active:translate-x-[2px]
                active:[box-shadow:none]
              active:bg-slate-300 dark:active:bg-slate-800
                flex items-center gap-1.5 px-3 py-3 rounded-xl cursor-pointer  text-[10px] font-black transition-all border-2 ${showAmounts ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-400'}`}>
                {showAmounts ? <Eye size={12} /> : <EyeOff size={12} />} Nominal
              </button>
              <button onClick={() => setShowEmails(v => !v)}
                className={`
                 text-slate-900 dark:text-white
                -translate-y-[3px] translate-x-[-3px]
                [box-shadow:4px_6px_0_#f1f5f9]
                dark:[box-shadow:4px_4px_0_#99a3b1]
                hover:translate-y-0 hover:translate-x-0
                hover:bg-slate-200 dark:hover:bg-slate-700
                border border-slate-300
                hover:[box-shadow:0_0_0_#f1f5f9]
                dark:hover:[box-shadow:0_0_0_#94a3b8]
                active:translate-y-[2px] active:translate-x-[2px]
                active:[box-shadow:none]
              active:bg-slate-300 dark:active:bg-slate-800
                flex items-center gap-1.5 cursor-pointer px-3 py-3 rounded-xl  text-[10px] font-black transition-all border-2 ${showEmails ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-400'}`}>
                {showEmails ? <Eye size={12} /> : <EyeOff size={12} />} Email
              </button>
            </div>
            <div className="flex gap-4">
              {[{ val: '', label: 'Semua' }, { val: 'PAID', label: 'PAID' }].map((f) => (
                <button key={f.val} onClick={() => { setStatusFilter(f.val); setPage(1); }}
                  className={`
                   text-slate-900 dark:text-white
                -translate-y-[3px] translate-x-[-3px]
                [box-shadow:4px_6px_0_#f1f5f9]
                dark:[box-shadow:4px_4px_0_#99a3b1]
                hover:translate-y-0 hover:translate-x-0
                hover:bg-slate-200 dark:hover:bg-slate-700
                border border-slate-300
                hover:[box-shadow:0_0_0_#f1f5f9]
                dark:hover:[box-shadow:0_0_0_#94a3b8]
                active:translate-y-[2px] active:translate-x-[2px]
                active:[box-shadow:none]
              active:bg-slate-300 dark:active:bg-slate-800
                  px-3 py-3 rounded-xl cursor-pointer  text-[10px] font-black transition-all ${statusFilter === f.val ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200'}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="overflow-x-auto">
          {historyTab === 'received' ? (
            viewMode === 'table' ? (
              /* ==================== TABLE VIEW ==================== */
              isLoading ? (
                <div className="flex items-center justify-center py-30 text-slate-400 font-bold gap-3">
                  <div className="w-5 h-5 border-4 border-slate-200 border-t-blue-600 rounded-xl  animate-spin" />
                  Memuat riwayat...
                </div>
              ) : (
                <table className="w-full text-left min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-100/50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      <th className="px-4 md:px-8 py-6">Donatur</th>
                      <th className="px-4 md:px-8 py-6">Nominal</th>
                      <th className="px-4 md:px-8 py-6">IP Address</th>
                      <th className="px-4 md:px-8 py-6">Pesan</th>
                      <th className="px-4 md:px-8 py-6 text-center">Replay</th>
                      <th className="px-4 md:px-8 py-6">Media</th>
                      <th className="px-4 md:px-8 py-6">Status</th>
                      <th className="px-4 md:px-8 py-6">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {donations.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-16 text-slate-400 font-bold">Belum ada dukungan masuk</td></tr>
                    ) : (
                      donations.map((item) => {
                        const isReplaying = replayLoading.has(item._id);
                        return (
                          <tr key={item._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all">
                            <td className="px-5 md:px-8 py-5">
                              <p className="font-black text-slate-700 dark:text-slate-200 text-sm">
                                {item.donorName || 'Anonim'}
                              </p>
                              {showEmails && item.donorEmail && (
                                <p className="text-xs text-slate-500 mt-0.5">{item.donorEmail}</p>
                              )}
                            </td>
                            <td className="px-5 md:px-8 py-5">
                              {item.donorIp ? (
                                <span className="font-mono text-[11px] text-slate-400 dark:text-white bg-slate-100 dark:bg-slate-500/50 px-2 py-1 rounded-md">
                                  {item.donorIp}
                                </span>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-600 text-xs">-</span>
                              )}
                            </td>
                            <td className="px-5 md:px-8 py-5">
                              {getDonationItemDisplay(item) ? (
                                <div>
                                  <p className="font-black text-sm text-white">
                                    {getDonationItemDisplay(item).display}
                                  </p>
                                  <p className="text-[10px] relative left-[-0.2px] text-slate-400 font-medium mt-0.5">
                                    {getDonationItemDisplay(item).sub}
                                  </p>
                                </div>
                              ) : (
                                <p className={`font-medium ${showAmounts ? 'text-white' : 'text-slate-300'}`}>
                                  {maskAmount(item.amount)}
                                </p>
                              )}
                            </td>
                            <td className="px-5 md:px-8 py-5 max-w-[220px]">
                              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium italic line-clamp-2">
                                {item.message || '-'}
                              </p>
                            </td>
                            <td className="px-5 md:px-8 py-5 text-center">
                              <button
                                onClick={() => replayDonation(item._id)}
                                disabled={isReplaying}
                                className={`cursor-pointer active:scale-[0.99] inline-flex items-center gap-1.5 px-4 py-3 rounded-xl  text-xs font-black transition-all ${isReplaying ? 'text-slate-400 cursor-not-allowed' : 'text-blue-500 hover:text-blue-300'}`}
                              >
                                {isReplaying ? (
                                  <><Loader2 size={14} className="animate-spin" /> Replay...</>
                                ) : (
                                  <><Video size={15} /> Replay</>
                                )}
                              </button>
                            </td>
                            <td className="px-5 md:px-8 py-5">
                              {item.mediaUrl ? (
                                <a href={item.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 text-sm">
                                  <ImageIcon size={14} /> Lihat
                                </a>
                              ) : <span className="text-slate-300 text-xs">-</span>}
                            </td>
                            <td className="px-5 md:px-8 py-5">
                              <span className={`px-3 py-1 rounded-xl  text-[10px] font-black ${item.status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-5 md:px-8 py-5 text-[10px] text-slate-400 whitespace-nowrap">
                              {formatDate(item.createdAt)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )
            ) : (
              /* ==================== CARD VIEW ==================== */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 md:p-6">
                {donations.length === 0 ? (
                  <div className="col-span-full text-center py-30 text-slate-400 font-bold">
                    Belum ada dukungan masuk
                  </div>
                ) : (
                  donations.map((item) => {
                    const isReplaying = replayLoading.has(item._id);
                    return (
                      <div
                        key={item._id}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 md:p-6 hover:shadow-lg transition-all duration-200"
                      >
                        <div className='h-[80%]'>

                        <div className="flex justify-between items-start mb-5 gap-2">
                            <div className="min-w-0 max-w-[70%] flex-1">
                              <p className="font-black text-lg text-slate-800 dark:text-slate-100 truncate">
                                {item.donorName || 'Anonim'} 
                              </p>
                              {showEmails && item.donorEmail && (
                                <p className="text-xs text-slate-500 mt-1 truncate">{item.donorEmail}</p>
                              )}
                            </div>
                            <p className="text-[11px] relative mt-[2.4px] flex items-center gap-1 flex-shrink-0">
                              <span className="font-mono text-slate-400 dark:text-white bg-slate-100 dark:bg-slate-500/50 px-2 py-0.5 rounded-md">
                                {item.donorIp || 'NO-IP'}
                              </span>
                            </p>
                          </div>
                          
                          <div className='h-[60px]'>
                            {getDonationItemDisplay(item) ? (
                              <div className="mb-4 relative left-[-3.5px]">
                                <p className="font-medium text-lg text-white flex items-center gap-1">
                                  <span className="relative top-[-2.1px] text-[20px]">{getDonationItemDisplay(item).emoji}</span>
                                  {getDonationItemDisplay(item).display}
                                </p>
                                <p className="text-xs pl-1 text-slate-400 font-medium mt-1">
                                  {getDonationItemDisplay(item).sub}
                                </p>
                              </div>
                            ) : (
                              <div className="mb-4 relative left-[-2px]">
                                <p className={`${showAmounts ? 'text-white' : 'text-slate-300'} font-medium text-lg text-white flex items-center gap-1`}>
                                  {maskAmount(item.amount)}
                                </p>
                                <p className="text-xs pl-1 top-[5.1px] relative left-[-4px] text-slate-400 font-medium">
                                  Tanpa item
                                </p>
                              </div>
                            )}
                          </div>

                          {item.message && (
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-4">
                              {item.message}
                            </p>
                          )}
                        </div>

                        <div className="h-[20%] flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700 text-sm">
                          <p className="text-slate-400 text-xs">{formatDate(item.createdAt)}</p>

                          <div className="flex items-center gap-3">
                            {/* {item.mediaUrl && (
                              <a href={item.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                                <ImageIcon size={18} />
                              </a>
                            )} */}
                            <button
                              onClick={() => replayDonation(item._id)}
                              disabled={isReplaying}
                              className={`flex relative mt-[1.3px] items-center gap-1.5 font-black text-blue-500 hover:text-blue-300 cursor-pointer active:scale-[0.99] transition-all ${isReplaying ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {isReplaying ? <Loader2 size={18} className="animate-spin" /> : <Video className='relative top-[-1px]' size={20} />}
                              Replay
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )
          ) : (
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="bg-slate-100/50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    {['Kepada', 'Jumlah', 'Pesan', 'Status', 'Waktu'].map(h => <th key={h} className="px-5 md:px-8 py-6">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {sentLoading ? (
                    <tr><td colSpan={5} className="text-center py-30">Memuat dukungan terkirim...</td></tr>
                  ) : (sentData?.donations || []).length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-16 text-slate-400 font-bold">Belum ada dukungan terkirim</td></tr>
                  ) : (
                    (sentData?.donations || []).map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all">
                        <td className="px-5 md:px-8 py-5"><p className="font-black text-slate-700 dark:text-slate-200">@{item.userId?.username || item.username || '-'}</p></td>
                        <td className="px-5 md:px-8 py-5">
                          {getDonationItemDisplay(item) ? (
                            <div className="flex items-center gap-2">
                              <div>
                                {showItemAmounts[item._id] ? (
                                  <p className="font-black text-sm text-white">
                                    Rp {Number(item.amount).toLocaleString('id-ID')}
                                  </p>
                                ) : (
                                  <p className="font-medium text-sm">
                                    {getDonationItemDisplay(item).display}
                                    {getDonationItemDisplay(item).qty}
                                  </p>
                                )}
                                {/* selalu tampil qty × nominal per item */}
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                  {item.donationItem.quantity > 1 ? `${item.donationItem.quantity}× ` : ''}
                                  Rp {Number(item.donationItem.price).toLocaleString('id-ID')}
                                  {item.donationItem.quantity > 1 && (
                                    <span className="ml-1 text-slate-500">
                                      = Rp {Number(item.amount).toLocaleString('id-ID')}
                                    </span>
                                  )}
                                </p>
                              </div>
                              <button
                                onClick={() => toggleItemAmount(item._id)}
                                className="text-slate-400 hover:text-blue-400 transition-colors"
                                title={showItemAmounts[item._id] ? 'Lihat item' : 'Lihat nominal'}
                              >
                                {showItemAmounts[item._id] ? <EyeOff size={12} /> : <Eye size={12} />}
                              </button>
                            </div>
                          ) : (
                            <p className={`font-medium ${showAmounts ? 'text-white' : 'text-slate-300'}`}>
                              {maskAmount(item.amount)}
                            </p>
                          )}
                        </td>
                        <td className="px-5 md:px-8 py-5 max-w-[250px]"><p className="text-slate-500 dark:text-slate-400 text-sm italic truncate">{item.message || '-'}</p></td>
                        <td className="px-5 md:px-8 py-5">
                          <span className={`px-3 py-3 rounded-xl  text-[10px] font-black ${item.status === 'PAID' ? 'bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'}`}>{item.status}</span>
                        </td>
                        <td className="px-5 md:px-8 py-5 text-[10px] text-slate-400 dark:text-slate-500">{formatDate(item.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 md:py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-black text-xs hover:bg-slate-100 dark:hover:bg-slate-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                ← Sebelumnya
              </button>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1"><span className='md:flex hidden'>Halaman</span> <span className="text-blue-600 dark:text-blue-400 font-black">{page}</span> dari {pagination.totalPages}</span>
                <span className="md:flex hidden text-xs text-slate-300 dark:text-slate-600">({pagination.total} total dukungan)</span>
              </div>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
                className="px-4 py-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-black text-xs hover:bg-slate-100 dark:hover:bg-slate-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                Berikutnya →
              </button>
            </div>
          )}
        </div>
    </div>
  );
};

// ─── CommunityPage ────────────────────────────────────────────────────────────

const CommunityPage = ({ currentUserId, onFollowAction }) => {
  const queryClient = useQueryClient();
  const [subTab, setSubTab]     = useState('discover');
  const [search, setSearch]     = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [viewingProfile, setViewingProfile] = useState(null);

  const { data: discoverData,  isLoading: discoverLoading  } = useQuery({ queryKey: ['discover', search],           queryFn: () => fetchDiscover({ search }),        enabled: subTab === 'discover' });
  const { data: followersData, isLoading: followersLoading } = useQuery({ queryKey: ['myFollowers', currentUserId], queryFn: () => fetchMyFollowers(currentUserId),  enabled: subTab === 'followers' && !!currentUserId });
  const { data: followingData, isLoading: followingLoading } = useQuery({ queryKey: ['myFollowing', currentUserId], queryFn: () => fetchMyFollowing(currentUserId),  enabled: subTab === 'following' && !!currentUserId });

  const toggleMutation = useMutation({
    mutationFn: toggleFollowApi,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['discover'] });
      queryClient.invalidateQueries({ queryKey: ['myFollowers'] });
      queryClient.invalidateQueries({ queryKey: ['myFollowing'] });
      let user = null;
      if (subTab === 'discover')  user = discoverData?.users?.find(u => u._id === userId);
      if (subTab === 'followers') user = followersData?.users?.find(u => u._id === userId);
      if (subTab === 'following') user = followingData?.users?.find(u => u._id === userId);
      if (user && onFollowAction) onFollowAction(user.username, user.isFollowing ? 'unfollow' : 'follow');
    },
    onError: (err) => alert(err.response?.data?.message || 'Gagal mengubah follow'),
  });

  const subTabs = [
    { id: 'discover',  label: 'Discover',  count: discoverData?.pagination?.total },
    { id: 'followers', label: 'Followers',  count: followersData?.pagination?.total },
    { id: 'following', label: 'Following',  count: followingData?.pagination?.total },
  ];

  const UserBadges = ({ userId }) => {
    const { data: userBadges, isLoading } = useQuery({
      queryKey: ['userBadges', userId],
      queryFn: () => api.get(`/api/midtrans/badges/public/${userId}`).then(r => r.data),
      staleTime: 5 * 60 * 1000,
      enabled: !!userId,
    });
    if (isLoading) return <div className="flex gap-4">{[...Array(2)].map((_, i) => <div key={i} className="w-12 h-5 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />)}</div>;
    const streamerBadges = userBadges?.badges?.streamer || {};
    const activeBadges = Object.entries(streamerBadges).filter(([_, active]) => active).map(([name]) => name);
    if (activeBadges.length === 0) return <div className="flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 font-medium h-6"><p className='relative top-1.5 ml-1 uppercase'>No badges</p></div>;
    return <div className="flex gap-1.5 h-full">{activeBadges.map(name => <Badge key={name} type="streamer" name={name} active={true} />)}</div>;
  };

  const renderUsers = (users, isLoading, showFollowBtn = true) => {
    if (isLoading) return <div className="flex items-center justify-center py-30 text-slate-400 font-bold gap-3"><div className="w-5 h-5 border-4 border-slate-200 border-t-blue-600 rounded-xl animate-spin" />Memuat...</div>;
    if (!users?.length) return <div className="text-center py-30 text-slate-400"><p className="text-4xl mb-3">👥</p><p className="font-black text-slate-500">Belum ada streamer</p></div>;
    return (
      <div className="grid grid-cols-1 md:mt-0 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {users.map(u => (
          <div key={u._id} className="md:bg-white/30 dark:md:bg-slate-900/60 md:backdrop-blur-sm rounded-xl p-4 md:p-6 md:mb-0 mb-0 border-b-slate-100/20 border border-slate-100 dark:border-slate-800 md:shadow-sm flex flex-col gap-3 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl  bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-xl flex-shrink-0 shadow-lg">
                {
                  u.profilePicture ? (
                    <>
                      <img src={u.profilePicture} alt={`-`} />
                    </>
                  ):
                  u.username.charAt(0).toUpperCase()
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-800 dark:text-slate-100 truncate">@{u.username}</p>
                {/* <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">{u.email}</p> */}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 p-1 h-[44px] bg-slate-50/50 dark:bg-slate-800/50 rounded-xl  border border-slate-100/50 dark:border-slate-700/50">
              <UserBadges userId={u._id} />
            </div>
            {u.followersCount !== undefined && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                <span className="text-blue-600 dark:text-blue-400 font-black">{u.followersCount}</span> followers
              </p>
            )}
            <div className="flex gap-3 mt-auto">
              <button onClick={() => setViewingProfile(u.username)}
                className="
                  text-slate-900 dark:text-white 
                  -translate-y-[3px] translate-x-[-3px]
                  [box-shadow:4px_6px_0_#f1f5f9]
                  dark:[box-shadow:4px_4px_0_#99a3b1]
                  hover:translate-y-0 hover:translate-x-0
                  border border-slate-300
                  hover:[box-shadow:0_0_0_#f1f5f9]
                  dark:hover:[box-shadow:0_0_0_#94a3b8]
                  active:translate-y-[2px] active:translate-x-[2px]
                  active:[box-shadow:none]
                  active:bg-slate-300 dark:active:bg-slate-800
                flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-xl  border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all cursor-pointer active:scale-[0.99]">
                <User size={12} /> Profil
              </button>
              {showFollowBtn && u._id !== currentUserId && (
                <button onClick={() => toggleMutation.mutate(u._id)} disabled={toggleMutation.isPending}
                  className={`
                    text-slate-900 dark:text-white 
                    -translate-y-[3px] translate-x-[-3px]
                    [box-shadow:4px_6px_0_#f1f5f9]
                    dark:[box-shadow:4px_4px_0_#99a3b1]
                    hover:translate-y-0 hover:translate-x-0
                    border border-slate-300
                    hover:[box-shadow:0_0_0_#f1f5f9]
                    dark:hover:[box-shadow:0_0_0_#94a3b8]
                    active:translate-y-[2px] active:translate-x-[2px]
                    active:[box-shadow:none]
                    active:bg-slate-300 dark:active:bg-slate-800
                  flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-xl font-black text-xs transition-all disabled:opacity-60 cursor-pointer active:scale-[0.99] ${u.isFollowing ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-500 border border-slate-200 dark:border-slate-700' : 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 shadow-sm'}`}>
                  {toggleMutation.isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : u.isFollowing ? 'Unfollow' : '+ Follow'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-3 pb-0 min-h-[90vh] md:bg-transparent bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm md:border-none border border-slate-100 dark:border-slate-800 md:p-0 p-4 px-0">
      {viewingProfile && (
        <StreamerProfileModal username={viewingProfile} currentUserId={currentUserId} onClose={() => setViewingProfile(null)} onFollow={null} />
      )}

      <div className="md:flex hidden bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-4 md:p-6 text-white relative overflow-hidden">
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/5 rounded-xl " />
        <div className="relative z-10">
          <p className="text-blue-200 text-xs font-black uppercase tracking-widest mb-2">Jaringan Streamer</p>
          <h2 className="text-3xl font-black tracking-tight">Komunitas</h2>
          <p className="text-blue-200 text-sm font-medium mt-1">Temukan & ikuti sesama streamer</p>
        </div>
      </div>

      <div className="flex md:hidden mb-5 bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-100 dark:border-slate-800 rounded-xl  p-4 md:p-5 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #2e2f42 0%, transparent 50%)' }} />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-3 rounded-xl  text-white shadow-lg">
                  <Users2 size={20} />
              </div>
              <div>
                  <h3 className="md:capitalize text-sm uppercase md:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                      Komunitas
                  </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="gap-3 grid grid-cols-3 md:grid-cols-5 mb-5 mt-5 md:px-0 px-4">
        {subTabs.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`
            text-slate-900 dark:text-white 
            -translate-y-[3px] translate-x-[-3px]
            [box-shadow:4px_6px_0_#f1f5f9]
            dark:[box-shadow:4px_4px_0_#99a3b1]
            hover:translate-y-0 hover:translate-x-0
            border border-slate-300
            hover:[box-shadow:0_0_0_#f1f5f9]
            dark:hover:[box-shadow:0_0_0_#94a3b8]
            active:translate-y-[2px] active:translate-x-[2px]
            active:[box-shadow:none]
            active:bg-slate-300 dark:active:bg-slate-800
            w-full cursor-pointer active:scale-[0.99] px-5 py-3.5 rounded-xl  font-black text-sm transition-all ${subTab === t.id ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700 hover:brightness-[80%]'}`}>
            {t.label}
          </button>
        ))}
        {subTab === 'discover' && (
          <div className="flex gap-3">
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && setSearch(searchInput)}
              placeholder="Cari username streamer..."
              className="flex-1 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-5 py-3 font-bold text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-400 transition-all" />
            <button onClick={() => setSearch(searchInput)} className="cursor-pointer active:scale-[0.99] px-6 py-3.5 bg-blue-600 text-white rounded-xl  font-black text-sm hover:bg-blue-700 transition-all">Cari</button>
          </div>
        )}
      </div>

      <div className='md:px-0 px-4'>
        {subTab === 'discover'  && renderUsers(discoverData?.users,  discoverLoading,  true)}
        {subTab === 'followers' && renderUsers(followersData?.users, followersLoading, false)}
        {subTab === 'following' && renderUsers(followingData?.users, followingLoading, true)}
      </div>
    </div>
  );
};

// ─── ColorInput ───────────────────────────────────────────────────────────────

const isValidHex = (v) => /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v);

const normalizeToPickerHex = (v) => {
  if (!v) return '#000000';
  if (/^#[0-9a-fA-F]{3}$/.test(v)) return '#' + [...v.slice(1)].map(c => c + c).join('');
  return v.slice(0, 7);
};

const ColorInput = React.memo(({ label, value, onChange, allowAlpha = false, id }) => {
  const inputId = id || `color-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const [raw, setRaw] = useState(value);

  const handleTextChange = useCallback((e) => {
    const v = e.target.value;
    setRaw(v);
    const clean = allowAlpha ? v : v.slice(0, 7);
    const timeoutId = setTimeout(() => onChange(clean), 300);
    return () => clearTimeout(timeoutId);
  }, [onChange, allowAlpha]);

  const handleTextBlur = useCallback(() => {
    if (!isValidHex(raw)) { setRaw(value); onChange(value); }
  }, [raw, value, onChange]);

  const handlePickerChange = useCallback((e) => {
    const picked = e.target.value;
    if (allowAlpha) {
      const alpha = isValidHex(value) && value.length === 9 ? value.slice(7, 9) : '';
      const next = picked + alpha;
      setRaw(next); onChange(next);
    } else {
      setRaw(picked); onChange(picked);
    }
  }, [value, onChange, allowAlpha]);

  const pickerHex = useMemo(() => normalizeToPickerHex(isValidHex(raw) ? raw : value), [raw, value]);
  const previewColor = useMemo(() => isValidHex(raw) ? raw : value, [raw, value]);

  useEffect(() => { setRaw(value); }, [value]);

  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={inputId} className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</label>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex-shrink-0 rounded-xl  overflow-hidden border border-slate-300 dark:border-slate-600 relative group">
          <input id={`${inputId}-picker`} name={`${inputId}-picker`} type="color" value={pickerHex} onChange={handlePickerChange}
            className="absolute inset-0 w-full h-full opacity-0 py-3 cursor-pointer peer z-10"
            style={{ width: '100%', height: '100%', border: 0, backgroundColor: 'transparent' }}
            aria-label={`${label} picker`} title="Klik untuk pilih warna" />
          <div className="absolute inset-0 w-full h-full border-2 border-transparent group-hover:border-blue-400 transition-all" style={{ backgroundColor: pickerHex }} aria-hidden="true" />
        </div>
        <input id={inputId} name={inputId} type="text" value={raw} onChange={handleTextChange} onBlur={handleTextBlur}
          spellCheck={false} placeholder={allowAlpha ? '#rrggbbaa' : '#rrggbb'} maxLength={allowAlpha ? 9 : 7}
          className="w-28 bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-3 py-3 font-mono text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 transition-all"
          aria-label={`${label} hex value`} />
        <div className="flex-1 h-full rounded-xl  border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all" style={{ backgroundColor: previewColor }} title={previewColor} aria-hidden="true" />
      </div>
      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate bg-slate-50/50 dark:bg-slate-800/50 px-2 py-3 rounded-xl" aria-live="polite">{previewColor}</div>
    </div>
  );
});
ColorInput.displayName = 'ColorInput';
const TTSSection = ({ settings, upd, saveSettingsMutation, api, activeSlot }) => {
  const [testText, setTestText] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = async () => {
    const text = testText.trim() || `Developer berdukungan Rp 50.000. Semangat terus kak!`;
    
    setIsTesting(true);
    
    try {
      const res = await api.post('/api/overlay/tts/speak', {
        text,
        voiceName: 'id-ID-GadisNeural',
        rate: settings.ttsRate || 1.0,      // ← Penting
        volume: settings.ttsVolume || 1.0,  // ← Optional
      }, { 
        responseType: 'blob' 
      });

      const url = URL.createObjectURL(res.data);
      const audio = new Audio(url);
      
      audio.onended = () => { 
        setIsTesting(false); 
        URL.revokeObjectURL(url); 
      };
      audio.onerror = () => { 
        setIsTesting(false); 
        URL.revokeObjectURL(url); 
      };

      await audio.play();
    } catch (err) {
      console.error(err);
      setIsTesting(false);
      toast.error('Gagal memutar TTS');
    }
  };

  return (
    <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl  p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-5">
       <div className="flex items-center gap-3 mb-6">
        <div className="p-3 w-11 h-11 bg-rose-500 rounded-xl  flex items-center justify-center text-white shadow-lg"><Mic size={20} /></div>
        <div>
          <h4 className="text-sm uppercase md:capitalize md:text-xl font-black text-slate-800 dark:text-white">Text-to-speech</h4>
        </div>
      </div>

      <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-xl  border border-slate-100 dark:border-slate-700">
        <div>
          <p className="font-black text-slate-700 dark:text-slate-200">Aktifkan TTS</p>
          <p className="md:flex hidden text-xs text-slate-400 dark:text-slate-500">
            Otomatis membaca: Nama + Nominal + Pesan dukungan
          </p>
        </div>
        <button onClick={() => upd('ttsEnabled', !settings.ttsEnabled)}
          className={`relative inline-flex h-7 w-14 items-center rounded-xl transition-colors duration-300 cursor-pointer ${settings.ttsEnabled ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
          <span className={`inline-block h-5 w-5 transform rounded-xl bg-white shadow-md transition-transform ${settings.ttsEnabled ? 'translate-x-8' : 'translate-x-1'}`} />
        </button>
      </div>

      {settings.ttsEnabled && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
            {[
              // { label: 'Kecepatan', key: 'ttsRate',   min: 0.5, max: 2, step: 0.1, fmt: v => v.toFixed(1) + 'x' },
              { label: 'Volume',    key: 'ttsVolume', min: 0.1, max: 1, step: 0.1, fmt: v => Math.round(v*100) + '%' },
            ].map(({ label, key, min, max, step, fmt }) => (
              <div key={key}>
                {/* <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">{label}</label> */}
                <input 
                  type="range" 
                  min={min} 
                  max={max} 
                  step={step}
                  value={settings[key] || 1}
                  onChange={e => upd(key, parseFloat(e.target.value))}
                  className="w-full accent-rose-500" 
                />
                <div className="text-center text-xs text-slate-400 mt-1 font-mono">{fmt(settings[key] || 1)}</div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex gap-3">
              <InputField
                label="Teks"
                value={testText}
                onChange={v => setTestText(v)}
                onKeyDown={e => e.key === 'Enter' && !isTesting && handleTest()}
                placeholder="Developer berdukungan Rp 50.000. Semangat terus kak!"
                className="flex-1"
              />
              <button 
                onClick={handleTest} 
                disabled={isTesting}
                className="cursor-pointer px-5 py-3.5 bg-rose-500 hover:brightness-90 disabled:opacity-60 text-white font-black rounded-xl  transition-all active:scale-[0.99] flex items-center gap-3 whitespace-nowrap"
              >
                {isTesting ? <><span className="animate-spin inline-block">⏳</span> Memutar...</> : <>▶ Test</>}
              </button>
            </div>
          </div>

          <button 
            onClick={() => saveSettingsMutation.mutate({ settings, slot: activeSlot })} 
            disabled={saveSettingsMutation.isPending}
            className="
            text-slate-900 dark:text-white bg-slate-100 dark:bg-white/20
            -translate-y-[3px] translate-x-[-3px]
            [box-shadow:4px_6px_0_#f1f5f9]
            dark:[box-shadow:4px_4px_0_#99a3b1]
            hover:translate-y-0 hover:translate-x-0
            hover:bg-slate-200 dark:hover:bg-slate-700
            border border-slate-300
            hover:[box-shadow:0_0_0_#f1f5f9]
            dark:hover:[box-shadow:0_0_0_#94a3b8]
            active:translate-y-[2px] active:translate-x-[2px]
            active:[box-shadow:none]
            active:bg-slate-300 dark:active:bg-slate-800
            cursor-pointer active:scale-[0.99] hover:brightness-90 w-full bg-slate-900/70 dark:bg-slate-700 text-white py-3 md:py-4 rounded-xl font-black text-sm transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-70 flex items-center justify-center gap-3">
            <Save size={18} className='relative top-[-1px]' />
            {saveSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Pengaturan TTS'}
          </button>
        </div>
      )}
    </div>
  );
};

const PinRow = ({ label, groupKey, refs, pinForm, setPinForm, showPins, setShowPins, handlePinInputChange, handlePinKeyDown }) => (
  <div className="space-y-3 mt-2">
    <div className="flex items-center justify-start gap-3 mb-2.5">
      <p className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
        {label}
      </p>
      <p className='relative text-slate-400 top-[-1.2px]'>-</p>
      <button
        type="button"
        onClick={() => setShowPins(prev => ({ ...prev, [groupKey]: !prev[groupKey] }))}
        className="rounded-xl uppercase cursor-pointer flex items-center gap-1 text-[10px] font-black text-slate-400 hover:text-blue-500 transition-colors"
      >
        {showPins[groupKey]
          ? <><EyeOff size={11} /> Sembunyikan</>
          : <><Eye size={11} /> Tampilkan</>}
      </button>
    </div>
    <div className="w-full flex gap-3">
      {pinForm[groupKey].map((digit, i) => (
        <input
          key={i}
          ref={refs[i]}
          type={showPins[groupKey] ? 'text' : 'password'}
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handlePinInputChange(groupKey, i, e.target.value, refs, setPinForm)}
          onKeyDown={e => handlePinKeyDown(groupKey, i, e, refs)}
          onFocus={e => e.target.select()}
          className={`${!showPins[groupKey] ? 'pb-2' : 'pb-1'} rounded-xl w-14 h-14 text-center text-2xl font-black bg-slate-50 dark:bg-slate-800 border-2 outline-none transition-all
            ${digit
              ? 'rounded-xl border-blue-500 dark:border-blue-400 text-slate-800 dark:text-slate-100'
              : 'rounded-xl border-slate-200 dark:border-slate-700 text-slate-300'
            }
            rounded-xl  focus:border-blue-500 dark:focus:border-blue-400`}
        />
      ))}
    </div>
  </div>
);

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export const DashboardStreamer = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab]         = useState('settings');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showToast, setShowToast]         = useState(false);
  const [localSettings, setLocalSettings] = useState(null);
  const [obsActiveSlot, setObsActiveSlot] = useState('A');
  const [previewMode, setPreviewMode] = useState('alert'); 
  const [donationToasts, setDonationToasts] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({ publicSounds: [], publicSoundDefault: '' });
  const [uploading, setUploading] = useState(false);
  const [profileForm, setProfileForm] = useState({ username: '', email: '', bio: '', instagram: '', facebook: '', youtube: '', donateIntro: '', twitter: '' });
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copiedLabel, setCopiedLabel]     = useState('');
  const [copiedUrl, setCopiedUrl]         = useState('');
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followAction, setFollowAction]   = useState({ type: '', username: '' });
  const [navbar, setNavbar]               = useState(false);
  const [showBalance, setShowBalance]     = useState(false);
  const [width, height] = useWindowSize();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showModeToast, setShowModeToast] = useState(false);
  const [modeToastLabel, setModeToastLabel] = useState('');
  const [autoPreviewTick, setAutoPreviewTick] = useState(0);
  const [iconMode, setIconMode] = useState('emoji');
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [pinStep, setPinStep] = useState('idle'); // idle | success | error
  const [overlayDone, setOverlayDone] = useState(false);
  const [showPreviewPanel, setShowPreviewPanel] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);
  const [adminMode, setAdminMode] = useState(() => {
    return localStorage.getItem('adminMode') === 'true';
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPins, setShowPins] = useState({
    currentPin: false,
    newPin: false,
    confirmPin: false,
  });
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const currentPinRefs = [useRef(), useRef(), useRef(), useRef()];
  const newPinRefs     = [useRef(), useRef(), useRef(), useRef()];
  const confirmPinRefs = [useRef(), useRef(), useRef(), useRef()];
  const [showVideoTutorial, setShowVideoTutorial] = useState(false);
  const [showOBSConnect, setShowOBSConnect] = useState(false);
  const [tokenStep, setTokenStep]               = useState('idle');
  const [tokenError, setTokenError]             = useState('');
  const [newOverlayToken, setNewOverlayToken]   = useState('');
  const [showTokenConfirm, setShowTokenConfirm] = useState(false);

  // Hapus Akun
  const [deleteStep, setDeleteStep]             = useState('idle');
  const [deleteError, setDeleteError]           = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePinForm, setDeletePinForm]       = useState(['','','','']);
  const deletePinRefs = [useRef(), useRef(), useRef(), useRef()];
  const [pinForm, setPinForm] = useState({ 
    currentPin: ['','','',''], 
    newPin: ['','','',''], 
    confirmPin: ['','','',''] 
  });
  const { maintenance } = useMaintenance(); // ← tambah ini
  const [activeSlot, setActiveSlot] = useState('A'); // 'A' | 'B'
  const [localSettingsB, setLocalSettingsB] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' }); // atau 'smooth'
  }, [activeTab]);
  
  const UpgradeConfetti = () => {
  useEffect(() => {
    const duration = 5000;
    const end = Date.now() + duration;

    const timer = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(timer);
        return;
      }

      confetti({
        particleCount: 15,
        angle: 60,
        spread: 70,
        startVelocity: 60,
        zIndex: 99999,
        origin: { x: 0, y: 1 },
      });

      confetti({
        particleCount: 15,
        angle: 120,
        spread: 70,
        startVelocity: 60,
        zIndex: 99999,
        origin: { x: 1, y: 1 },
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  return null;
};

useEffect(() => {
  if (!localSettings) return;
  // Debounce 400ms supaya tidak spam saat user drag color picker
  const timer = setTimeout(() => {
    setAutoPreviewTick(t => t + 1);
  }, 400);
  return () => clearTimeout(timer);
}, [
  localSettings?.theme,
  localSettings?.primaryColor,
  localSettings?.highlightColor,
  localSettings?.textColor,
  localSettings?.borderColor,
  localSettings?.animation,
  localSettings?.customIcon,
]);

// ─── PIN HANDLERS (dipindah ke dalam komponen) ─────────────────────────────────

// const fetchProfile    = async () => (await api.get('/api/overlay/settings')).data;
const fetchProfile = async (slot = 'A') => 
  (await api.get(`/api/overlay/settings?slot=${slot}`)).data;

const handlePinInputChange = useCallback((group, index, value, refs, setter) => {
  const sanitized = value.replace(/[^0-9]/g, '').slice(0, 1);
  
  setter(prev => {
    const updated = { ...prev };
    updated[group] = [...prev[group]];
    updated[group][index] = sanitized;
    return updated;
  });

  if (sanitized && index < 3) {
    setTimeout(() => refs[index + 1].current?.focus(), 10);
  }
}, []);

const handlePinKeyDown = useCallback((group, index, e, refs) => {
  if (e.key === 'Backspace' && !pinForm[group][index] && index > 0) {
    refs[index - 1].current?.focus();
  }
}, [pinForm]);

const handleChangePin = async () => {
  const current = pinForm.currentPin.join('');
  const newP    = pinForm.newPin.join('');
  const confirm = pinForm.confirmPin.join('');

  if (current.length < 4 || newP.length < 4 || confirm.length < 4) {
    setPinError('Semua PIN harus 4 digit');
    return;
  }
  if (newP !== confirm) {
    setPinError('PIN baru dan konfirmasi tidak cocok');
    return;
  }
  if (current === newP) {
    setPinError('PIN baru tidak boleh sama dengan PIN lama');
    return;
  }

  setPinLoading(true);
  setPinError('');

  try {
    const response = await api.put('/api/auth/change-pin', { 
      currentPin: current, 
      newPin: newP 
    });

    // Success
    setPinStep('success');
    setShowPins({ currentPin: false, newPin: false, confirmPin: false });
    setPinForm({ 
      currentPin: ['','','',''], 
      newPin: ['','','',''], 
      confirmPin: ['','','',''] 
    });
    
    setTimeout(() => setPinStep('idle'), 2500);
    toast.success('✅ PIN berhasil diubah!');

  } catch (err) {
    console.error(err);
    const message = err.response?.data?.message || err.message || 'Gagal mengubah PIN';
    setPinError(message);
    setPinStep('error');

    // JANGAN logout otomatis jika hanya error PIN
    if (message.includes('token') || message.includes('unauthorized')) {
      toast.error('Sesi error. Silakan login ulang.');
    }
  } finally {
    setPinLoading(false);
  }
};

  const { theme, toggle } = useTheme();

  const { data: profileData, isLoading: profileLoading, refetch: isRefetchProfile } = useQuery({
    queryKey: ['profile', activeSlot],     // ← INI YANG BENAR
    queryFn: () => fetchProfile(activeSlot),
    refetchInterval: 30000,
    staleTime: 1000 * 30,        // 30 detik
  });

  useEffect(() => {
    if (localSettings?.customIcon?.startsWith('http')) {
      setIconMode('gif');
    }
  }, [localSettings?.customIcon]);

  // Sync saat localStorage berubah (dari TopNavbar)
  useEffect(() => {
    const sync = () => {
      const next = localStorage.getItem('adminMode') === 'true';
      setAdminMode(next);
      if (next) setActiveTab('settings'); // langsung ke dashboard super
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const shown = localStorage.getItem('loginModalShownDate');
    if (shown === today) {
      setShowLoginModal(true);
      // Hapus key supaya tidak muncul lagi hari ini
      localStorage.removeItem('loginModalShownDate');
    }
  }, []);

  useEffect(() => {
    const loadObsActiveSlot = async () => {
      try {
        const res = await api.get('/api/overlay/settings?slot=A');
        const s = res.data.settings || res.data.overlaySetting || {};
        if (s.activeSlot) {
          setObsActiveSlot(s.activeSlot);
        }
      } catch {}
    };
    loadObsActiveSlot();
  }, []);

  useEffect(() => {
  if (profileData) {
    const s = profileData.settings || profileData.overlaySetting || {};

    setLocalSettings({
      ...DEFAULT_SETTINGS,
      ...s,
      publicSounds: Array.isArray(s.publicSounds) 
        ? s.publicSounds 
        : DEFAULT_SETTINGS.publicSounds,
    });
  }
}, [profileData, activeSlot]);

  useEffect(() => {
    if (profileData && localSettings) {
      setFormData({
        publicSounds: Array.isArray(localSettings.publicSounds) ? localSettings.publicSounds : [],
        publicSoundDefault: localSettings.publicSoundDefault || ''
      });
    }
  }, [localSettings]);

  useEffect(() => {
    const sync = () => {
      const next = localStorage.getItem('adminMode') === 'true';
      setAdminMode(next);
      setModeToastLabel(next ? 'Mode Admin Aktif' : 'Mode Streamer Aktif');
      setShowModeToast(true);
      setTimeout(() => setShowModeToast(false), 1300);
      if (next) setActiveTab('settings');
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && [
      'settings','alertSettings','mediaSettings','history','wallet','community',
      'feeConfig','myDonations','profile','poll','subathon','milestones',
      'leaderboard','contact','ghostAlert','admin', 'songSettings'
    ].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const isStreamerSuper = useMemo(() => {
    const payload = getTokenPayload();
    return payload?.role === 'streamerSuper';
  }, []);
  
  const isSuperAdmin = useMemo(() => {
    const payload = getTokenPayload();
    return payload?.role === 'superAdmin';
  }, []);

  const isEffectiveAdmin = (isStreamerSuper && adminMode) || isSuperAdmin;

  useEffect(() => {
    if (isEffectiveAdmin) return; // Jika masih admin, biarkan user bebas pilih tab

    const adminRestrictedTabs = [
      'streamerManager', 
      'terminal', 
      'admin', 
      'announcements', 
      'suggestions'
    ];

    if (adminRestrictedTabs.includes(activeTab)) {
      console.log('🔄 Auto redirect ke Settings karena keluar dari mode Admin');
      setActiveTab('settings');
    }
  }, [isEffectiveAdmin, activeTab]);

  const saveSettingsMutation = useMutation({
    mutationFn: ({ settings, slot }) => saveSettings(settings, slot),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile', variables.slot] });
      setShowToast(true);
    },
    onError: (err) => {
      setErrorMessage(err?.response?.data?.message || 'Gagal menyimpan pengaturan. Coba lagi.');
      setShowErrorModal(true);
    },
  });
  
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setShowToast(true);
    },
    onError: (err) => {
      setErrorMessage(err?.response?.data?.message || 'Gagal update profil. Coba lagi.');
      setShowErrorModal(true);
    },
  });

  const handleFollowAction = (username, actionType) => {
    setFollowAction({ type: actionType, username });
    setShowFollowModal(true);
  };

  useEffect(() => {
    if (profileData) {
      setProfileForm({
        username: profileData?.user?.username || profileData?.User?.username || '',
        email:    profileData?.user?.email    || profileData?.User?.email    || '',
        bio:      profileData?.user?.bio      || profileData?.User?.bio      || '',
        profilePicture: profileData?.user?.profilePicture || profileData?.User?.profilePicture || '',
        donateIntro: profileData?.user?.donateIntro || profileData?.User?.donateIntro || '',
        instagram: profileData?.user?.instagram || profileData?.User?.instagram || '',
        facebook:  profileData?.user?.facebook  || profileData?.User?.facebook  || '',
        youtube:   profileData?.user?.youtube   || profileData?.User?.youtube   || '',
        twitter:   profileData?.user?.twitter   || profileData?.User?.twitter   || '',
        currentUser: profileData?.user || profileData?.User || {},
        role: profileData?.user?.role || profileData?.User.role || {},
        roleUpgradeNotified: profileData?.User?.roleUpgradeNotified ?? profileData?.user?.roleUpgradeNotified ?? false,
      });
    }
  }, [profileData]);

  const user = {
    username:     profileData?.user?.username     || profileData?.User?.username     || 'Streamer',
    email:        profileData?.user?.email         || profileData?.User?.email         || '',
    profilePicture: profileData?.user?.profilePicture || profileData?.User?.profilePicture || '',
    balance:      profileData?.User?.walletBalance || profileData?.walletBalance       || 0,
    overlayToken: profileData?.user?.overlayToken  || profileData?.User?.overlayToken  || '',
    overlayUrl:   `${window.location.origin}/overlay/${profileData?.user?.overlayToken || profileData?.User?.overlayToken || ''}`,
    role:   profileData?.User?.role,
    roleUpgradeNotified:   profileData?.user?.roleUpgradeNotified || profileData?.User?.roleUpgradeNotified,
  };

  useEffect(() => {
    const overlayToken = user.overlayToken;
    if (!overlayToken) return;
    const socket = io(import.meta.env.VITE_API_URL, { reconnection: true, reconnectionAttempts: 5, timeout: 10000 });
    socket.on('connect', () => socket.emit('join-room', overlayToken));
    socket.on('new-donation', (data) => {
      const id = Date.now();
      setDonationToasts(prev => [...prev, { id, ...data }]);
      queryClient.invalidateQueries({ queryKey: ['donationHistory'] });
      queryClient.invalidateQueries({ queryKey: ['donationStats'] });
      setTimeout(() => setDonationToasts(prev => prev.filter(t => t.id !== id)), 7000);
    });
    socket.on('withdrawal-update', (data) => {
      const id = Date.now();
      setDonationToasts(prev => [...prev, { id, isWithdrawal: true, status: data.status, amount: data.amount, message: data.message }]);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setTimeout(() => setDonationToasts(prev => prev.filter(t => t.id !== id)), 8000);
    });
    return () => socket.disconnect();
  }, [user.overlayToken]);

  const settings = localSettings || DEFAULT_SETTINGS;

  const upd = useCallback((key, val) => {
    if (key === 'publicSounds' && !Array.isArray(val)) { 
      console.warn(`[upd] publicSounds must be array`); 
      return;
    }
    setLocalSettings(prev => ({ ...prev, [key]: val }));
    if (key === 'publicSounds') setFormData(prev => ({ ...prev, publicSounds: val }));
  }, []);

  useEffect(() => {
    // Pastikan roleUpgradeNotified sudah false secara eksplisit, bukan undefined
    if (user?.role === 'streamerSuper' && user.roleUpgradeNotified === false) {
      setShowUpgradeModal(true);
    } else {
      setShowUpgradeModal(false); // ← tutup jika sudah true
    }
  }, [user?.role, user?.roleUpgradeNotified]);

  console.log('user', user)

  const copyToClipboard = (text, label = 'URL') => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text); setCopiedLabel(label); setShowCopyModal(true);
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { alert('Ukuran file maksimal 3MB'); return; }
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await api.post('/api/overlay/upload-profile-picture', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfileForm(prev => ({ ...prev, profilePicture: res.data.url }));
      toast.success('✅ Foto profil berhasil diupload!');
    } catch (err) {
      alert(err.response?.data?.message || 'Upload foto gagal');
    }
  };

  // ─── SoundTiersEditor ─────────────────────────────────────────────────────────

 // ─── SoundTiersEditor ─────────────────────────────────────────────────────────

  const SoundTiersEditor = ({ tiers, onChange, saveSettingsMutation, settings, onPreview, activeSlot }) => {
    // ✅ Local state untuk tracking input - tidak trigger parent update
    const [localTiers, setLocalTiers] = useState(() => 
      tiers.map(t => ({ ...t }))
    );

    // Sync local state with props when props change (but only from outside)
    useEffect(() => {
      setLocalTiers(tiers.map(t => ({ ...t })));
    }, [tiers.length]); // Only sync when array length changes

    const add = () => {
      const newTiers = [...localTiers, { minAmount: 50000, maxAmount: null, soundUrl: '', label: '' }];
      setLocalTiers(newTiers);
      onChange(newTiers); // Still sync to parent
    };
    
    const remove = (i) => {
      const newTiers = localTiers.filter((_, idx) => idx !== i);
      setLocalTiers(newTiers);
      onChange(newTiers);
    };
    
    // ✅ Handle change - simpan ke local dulu, jangan langsung ke parent
    const handleLocalChange = useCallback((i, key, value) => {
      setLocalTiers(prev => prev.map((t, idx) => {
        if (idx !== i) return t;
        
        let parsedValue = value;
        if (key === 'minAmount' || key === 'maxAmount') {
          parsedValue = value === '' ? null : Number(value);
        }
        
        return { ...t, [key]: parsedValue };
      }));
    }, []);

    // ✅ Sync ke parent saat user klikSimpan / blur
    const syncToParent = useCallback(() => {
      onChange(localTiers);
    }, [localTiers, onChange]);

    // ✅ Handler stabil untuk SoundPicker
    const handleSoundChange = useCallback((i, soundUrl) => {
      setLocalTiers(prev => prev.map((t, idx) => 
        idx === i ? { ...t, soundUrl } : t
      ));
    }, []);

    return (
      <div className="space-y-3">
        {localTiers.map((t, i) => (
          <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-xl  p-4 border border-slate-100 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-600 dark:text-slate-300 text-sm">{t.label || `Tier Suara ${i + 1}`}</span>
              <button onClick={() => remove(i)} className="cursor-pointer text-red-400 hover:text-red-600 p-1"><Trash2 size={15} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                {/* <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Min (Rp)</label> */}
                <InputField
                  label="Min"
                  type="number"
                  value={t.minAmount ?? ''}
                  onChange={v => handleLocalChange(i, 'minAmount', v)}
                  onBlur={syncToParent}
                  placeholder="50000"
                />
              </div>
              <div className="flex flex-col gap-1">
                {/* <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Max (kosong=∞)</label> */}
                <InputField
                  label="Max"
                  type="number"
                  value={t.maxAmount ?? ''}
                  onChange={v => handleLocalChange(i, 'maxAmount', v)}
                  onBlur={syncToParent}
                  placeholder="∞"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {/* <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Label (opsional)</label> */}
              <InputField
                label="Label"
                value={t.label || ''}
                onChange={v => handleLocalChange(i, 'label', v)}
                onBlur={syncToParent}
                placeholder="contoh: Sultan Alert Sound"
              />
            </div>
            <SoundPicker
              value={t.soundUrl || ''}
              onChange={(v) => handleSoundChange(i, v)}
              onPreview={onPreview}
            />
          </div>
        ))}
        <button onClick={add} className="cursor-pointer active:scale-[0.99] w-full py-3 border-2 border-dashed border-blue-200 dark:border-blue-900 text-blue-500 dark:text-blue-400 rounded-xl font-black text-sm hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all flex items-center justify-center gap-3">
          <Plus size={16} /> Tambah Suara per Nominal
        </button>
        <button 
          onClick={() => {
            syncToParent(); // ✅ Sync semua data ke parent dulu sebelum simpan
            saveSettingsMutation.mutate({ settings, slot: activeSlot });
          }} 
          disabled={saveSettingsMutation.isPending}
          className="
          text-slate-900 dark:text-white 
          bg-slate-100 dark:bg-white/20
          -translate-y-[3px] translate-x-[-3px]
          [box-shadow:4px_6px_0_#f1f5f9]
          dark:[box-shadow:4px_4px_0_#99a3b1]
          hover:translate-y-0 hover:translate-x-0
          hover:bg-slate-200 dark:hover:bg-slate-700
          border border-slate-300
          hover:[box-shadow:0_0_0_#f1f5f9]
          dark:hover:[box-shadow:0_0_0_#94a3b8]
          active:translate-y-[2px] active:translate-x-[2px]
          active:[box-shadow:none]
          active:bg-slate-300 dark:active:bg-slate-800
          cursor-pointer active:scale-[0.99] hover:brightness-90 w-full bg-slate-900/70 dark:bg-slate-700 text-white py-3 md:py-4 rounded-xl font-black text-sm transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-70 flex items-center justify-center gap-3">
          <Save size={18} className='relative top-[-1px]' />
          {saveSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Audio'}
        </button>
      </div>
    );
  };

  const handleUploadAudio = async (file) => {
    const uploadFormData = new FormData();
    uploadFormData.append('audio', file);
    try {
      setUploading(true);
      const res = await api.post('/api/overlay/upload-audio', uploadFormData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (!res.data.url) throw new Error('URL tidak ditemukan dari response');
      const newSound = { url: res.data.url, label: file.name.replace(/\.[^/.]+$/, ''), emoji: '🎵' };
      const updatedSounds = [...formData.publicSounds, newSound];
      setFormData(prev => ({ ...prev, publicSounds: updatedSounds }));
      setLocalSettings(prev => ({ ...prev, publicSounds: updatedSounds }));
      toast.success('✅ Suara berhasil diupload!');
    } catch (err) {
      toast.error('❌ Upload gagal: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const TAB_TITLE = {
    settings:      'Dashboard',
    alertSettings: 'Alert OBS',
    voiceSettings: 'Voice Note',
    qrConfig: 'Kustom QR Code',
    marquee: 'Marquee Donor',
    ipBlacklist:      'IP Blacklist',
    songSettings: 'Song Request',
    mediaSettings: 'Media share',
    donatePageConfig: 'Halaman Dukungan',
    store: 'Toko OBS',
    streamerManager: 'Kelola Streamer',
    history:       'Riwayat',
    inbox: 'Inbox',
    terminal: 'Log Dukungan',
    announcements: 'Pengumuman',
    feeConfig:     'Konfigurasi Fee',
    wallet:        'Wallet',
    community:     'Community',
    myDonations:   'Riwayat Berdukungan',
    profile:       'Profil',
    poll:          'Poll & Voting',
    subathon:      'Subathon',
    milestones:    'Milestones',
    whatsapp: 'WhatsApp',
    suggestions: 'Masukan Streamer',
    leaderboard:   'Leaderboard',
    contact:       'Contact',
    ghostAlert:    'Notif Hantu',
    admin:         'Admin',
  };

  const displayBalance = showBalance ? `Rp ${Number(user.balance).toLocaleString('id-ID')}` : 'Rp ••••••';

  // ── Shared Sound Section (dipakai di alertSettings) ──────────────────────────
  const SoundSection = ({activeSlot}) => {
    const previewAudioRef = useRef(null);

    const playPreview = (url) => {
      if (!url) return;
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.src = url;
        previewAudioRef.current.play().catch(() => {});
      }
    };

    
    return (
      <>
        <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-8">
          <audio ref={previewAudioRef} />
          <SectionHeader icon={<Music size={20} />} title="Pengaturan Suara Alert" color="bg-gradient-to-r from-emerald-500 to-blue-500" />
          <div className="md:p-5 md:bg-slate-50 md:dark:bg-slate-800/50 rounded-xl  md:border border-slate-200 dark:border-slate-700">
            <h4 className="font-black text-sm text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-3">📢 Suara Default (Semua Dukungan)</h4>
            <SoundPicker
              label="Pilih suara default"
              value={settings.soundUrl || ''}
              onChange={v => { upd('soundUrl', v); playPreview(v); }}
            />
          </div>
          <SoundTiersEditor
            saveSettingsMutation={saveSettingsMutation}
            settings={settings}
            tiers={settings.soundTiers || []}
            onChange={v => upd('soundTiers', v)}
            onPreview={playPreview}
            activeSlot={activeSlot}
          />
          <div className="pt-2 md:pt-8 md:border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 md:mb-6 mb-5">
              <div className="p-3 w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg"><Music size={20} /></div>
              <div>
                <h4 className="text-sm uppercase md:capitalize md:text-xl font-black text-slate-800 dark:text-white">Quick Soundboard</h4>
                {/* <p className="md:flex hidden text-sm text-slate-500 dark:text-slate-400">Donatur bisa pilih suara ini saat dukungan ke streamer</p> */}
              </div>
            </div>
            <AudioManager
              publicSounds={formData.publicSounds}
              onUpdatePublicSounds={(sounds) => {
                setFormData({ ...formData, publicSounds: sounds });
                upd('publicSounds', sounds);
              }}
            />
            <div className='w-full h-[1px] bg-slate-100/10 my-4' />
            <button onClick={() => saveSettingsMutation.mutate({ settings, slot: activeSlot })} disabled={saveSettingsMutation.isPending || uploading}
            className="
            text-slate-900 dark:text-white bg-slate-100 dark:bg-white/20
            -translate-y-[3px] translate-x-[-3px]
            [box-shadow:4px_6px_0_#f1f5f9]
            dark:[box-shadow:4px_4px_0_#99a3b1]
            hover:translate-y-0 hover:translate-x-0
            hover:bg-slate-200 dark:hover:bg-slate-700
            border border-slate-300
            hover:[box-shadow:0_0_0_#f1f5f9]
            dark:hover:[box-shadow:0_0_0_#94a3b8]
            active:translate-y-[2px] active:translate-x-[2px]
            active:[box-shadow:none]
            active:bg-slate-300 dark:active:bg-slate-800
            cursor-pointer active:scale-[0.99] hover:brightness-90 w-full bg-slate-900/70 dark:bg-slate-700 text-white py-3 md:py-4 rounded-xl font-black text-sm transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-70 flex items-center justify-center gap-3">
              <Save size={18} className='relative top-[-1px]' />
              {saveSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Soundboard'}
            </button>
          </div>
        </div>
      </>
  );
}

  // Ganti blok if (maintenance?.dashboard) yang lama dengan:
  if (maintenance?.dashboard) return (
    <MaintenanceScreen title="Dashboard - maintenance" subtitle="Kami sedang melakukan pembaruan. Semua data kamu aman dan akan kembali seperti semula." />
  );

  return (
    <>
      <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans pb-0 text-slate-900 dark:text-slate-100">

        {showOverlay && <LoadingOverlay onDone={() => setShowOverlay(false)} />}

        {/* <video src="/glass.mp4" className='absolute z-[1]' autoplay={true}></video> */}
        <img src="/glass.jpg" className='opacity-[10%] fixed top-0 left-0 w-screen h-screen z-[1]'  alt='glass-img'></img>
        {/* ── Modal Copy URL ── */}
        <AnimatePresence>
          {showCopyModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-4" onClick={() => setShowCopyModal(false)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl md:max-w-sm max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                <div className="p-4 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 mt-1 md:mt-2 bg-green-100 dark:bg-green-950/40 rounded-xl  flex items-center justify-center">
                    <CheckCircle2 size={40} className="text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Berhasil</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6"><span className="font-bold text-blue-600 dark:text-blue-400">{"URL"}</span> sudah selesai disalin</p>
                  <button onClick={() => setShowCopyModal(false)} className="cursor-pointer hover:brightness-90 w-full py-3 md:py-4 bg-slate-900/70 dark:bg-slate-700 text-white font-black rounded-xl  transition-all active:scale-[0.99]">Tutup sekarang</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Modal Follow ── */}
        <AnimatePresence>
          {showFollowModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-4" onClick={() => setShowFollowModal(false)}>
              <motion.div initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }} className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                <div className="p-8 text-center">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-xl  flex items-center justify-center text-5xl ${followAction.type === 'follow' ? 'bg-green-100 dark:bg-green-950/40' : 'bg-orange-100 dark:bg-orange-950/40'}`}>
                    {followAction.type === 'follow' ? '🤝' : '👋'}
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-1">{followAction.type === 'follow' ? 'Berhasil Follow!' : 'Berhasil Unfollow'}</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-8">Kamu {followAction.type === 'follow' ? 'sekarang mengikuti' : 'tidak lagi mengikuti'} <span className="font-bold text-blue-600 dark:text-blue-400">@{followAction.username}</span></p>
                  <button onClick={() => setShowFollowModal(false)} className="cursor-pointer hover:brightness-90 w-full py-3 md:py-4 bg-slate-900/70 dark:bg-slate-700 text-white font-black rounded-xl  transition-all active:scale-[0.99]">OK, Mengerti</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Save Toast ── */}
       <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-md"
            onClick={() => setShowToast(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 24 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="flex flex-col items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-10 mx-4 w-full max-w-sm text-center"
            >
              <div className="w-20 h-20 bg-green-100 dark:bg-green-950/40 rounded-2xl flex items-center justify-center">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100">Berhasil</p>
                <p className="text-sm text-slate-400 font-medium mt-1">Pengaturan diperbarui</p>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="cursor-pointer w-full py-3 bg-green-600 hover:bg-green-700 active:scale-[0.99] text-white font-black rounded-xl transition-all"
              >
                OK, Mengerti
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error Modal ── */}
      <AnimatePresence>
        {showErrorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-md"
            onClick={() => setShowErrorModal(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 24 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="flex flex-col items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-10 mx-4 w-full max-w-sm text-center"
            >
              <div className="w-20 h-20 bg-red-100 dark:bg-red-950/40 rounded-2xl flex items-center justify-center">
                <AlertCircle size={40} className="text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100">Gagal Menyimpan</p>
                <p className="text-sm text-slate-400 font-medium mt-1">{errorMessage}</p>
              </div>
              <button
                onClick={() => setShowErrorModal(false)}
                className="cursor-pointer w-full py-3 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-black rounded-xl transition-all"
              >
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* ── Donation Toasts ── */}
        <div className="fixed bottom-6 right-4.5 md:right-11 z-[100] flex flex-col gap-3 max-w-sm w-full">
          <AnimatePresence>
            {donationToasts.map(t => (
              <motion.div key={t.id} initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }}
                className="bg-white dark:bg-slate-800 rounded-xl  p-5 shadow-2xl border border-slate-100 dark:border-slate-700 flex items-start gap-3">
                {t.isWithdrawal
                  ? <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0 ${t.status === 'COMPLETED' ? 'bg-green-500' : 'bg-red-500'}`}>{t.status === 'COMPLETED' ? '✓' : '✕'}</div>
                  : <div className="w-12 h-12 bg-blue-600 rounded-xl  flex items-center justify-center flex-shrink-0">{renderIconPreview(settings.customIcon, 24)}</div>
                }
                <div className="flex-1 min-w-0">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${t.isWithdrawal ? (t.status === 'COMPLETED' ? 'text-green-600 dark:text-green-400' : 'text-red-500') : 'text-blue-600 dark:text-blue-400'}`}>
                    {t.isWithdrawal ? (t.status === 'COMPLETED' ? 'Penarikan Berhasil!' : 'Penarikan Gagal') : t.isTestAlert ? '🧪 Test Alert!' : 'Dukungan Masuk!'}
                  </span>
                  <p className="text-slate-700 dark:text-slate-200 text-sm font-medium mt-1">{t.message}</p>
                </div>
                <button onClick={() => setDonationToasts(prev => prev.filter(x => x.id !== t.id))} className="text-slate-300 dark:text-slate-600 hover:text-slate-500 transition-colors flex-shrink-0 text-lg leading-none">×</button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ── Mobile Navbar ── */}
        <div className="lg:hidden fixed top-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 z-50 px-[17px] py-3 md:py-4 flex justify-between items-center">
          <a href='/'>
            <div className="flex items-center gap-3">
              {
                !isSidebarOpen && (
                  <div className="w-[44px] md:w-10 h-11 md:h-10 p-[6px] bg-blue-500 rounded-xl  flex items-center justify-center"><img src="/logoNew.png" className='relative left-[-0.8px]' alt="icon" /></div>
                )
              }
              {/* <span className="font-black text-lg tracking-tight text-slate-800 dark:text-slate-100">TTT</span> */}
            </div>
          </a>
          <div className="flex items-center gap-3">
            <button onClick={toggle} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} className="h-[40px] cursor-pointer active:scale-[0.99] flex items-center gap-3 px-3 rounded-xl  border bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700">
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button onClick={() => setActiveTab('contact')} aria-label="Bantuan & Kontak" className={`h-[40px] cursor-pointer active:scale-[0.99] flex items-center gap-3 px-3 rounded-xl border shadow-none font-medium text-md transition-all ${activeTab === 'contact' ? 'bg-slate-800 dark:bg-slate-700 text-white border-transparent' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
              <HeadphonesIcon size={14} />
            </button>
            <button onClick={() => setActiveTab('community')} aria-label="Komunitas Streamer" className="h-[40px] cursor-pointer hover:brightness-90 active:scale-[0.99] relative flex items-center gap-3 px-3 py-3 rounded-xl  font-medium text-md overflow-hidden" style={{ background: 'linear-gradient(90deg, #0f0c29, #302b63, #24243e, #0f0c29)', backgroundSize: '300% 100%', animation: 'rainbowSlide 3s ease-in-out infinite' }}>
              <Users size={16} className="relative z-10 text-white" />
            </button>
            <InboxBell setActiveTab={setActiveTab} />
            <button onClick={() => setIsSidebarOpen(true)} aria-label="Buka navigasi" className="h-[40px] cursor-pointer active:scale-[0.99] p-2 bg-white dark:bg-slate-800 rounded-xl  text-slate-600 dark:text-slate-400">
              <Menu size={24} />
            </button>
          </div>
        </div>

        <Sidebar 
          isCollapsed={isCollapsed}         // ← tambah ini
          setIsCollapsed={setIsCollapsed}
          activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <main className="flex-1 mt-22 md:mt-0 md:w-8xl z-[2] mx-auto w-full relative">
          <TopNavbar 
            isCollapsed={isCollapsed}         // ← tambah ini
            setIsCollapsed={setIsCollapsed} 
            user={user} navbar={navbar}
            showBalance={showBalance}
            onToggleBalance={() => setShowBalance(v => !v)}
            displayBalance={displayBalance}
            onLogout={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
            onProfile={() => setActiveTab('profile')}
            activeTab={activeTab} setActiveTab={setActiveTab}
          />

          <div className="relative md:mt-[-14px] px-0 md:px-5 lg:pt-11 pb-8 w-full">
            <AnimatePresence mode="wait">

              {activeTab === 'maintenance' && (
                <motion.div key="maintenance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <MaintenancePage />
                </motion.div>
              )}

              {activeTab === 'qrConfig' && (
                <motion.div key="qrConfig" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <QrConfigPage overlayToken={user.overlayToken} username={user.username} />
                </motion.div>
              )}

              {activeTab === 'donatePageConfig' && (
                <motion.div key="donatePageConfig" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <DonatePageConfig
                    settings={settings}
                    upd={upd}
                    saveSettingsMutation={saveSettingsMutation}
                    activeSlot={activeSlot}
                  />
                </motion.div>
              )}

              {activeTab === 'marquee' && (
                <motion.div
                  key="marquee"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <MarqueeConfigPanel overlayToken={user.overlayToken} />
                </motion.div>
              )}

              {activeTab === 'streamerManager' && isEffectiveAdmin && (
                <motion.div
                  key="streamerManager"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <StreamerManagerPage />
                </motion.div>
              )}

              {activeTab === 'terminal' && isEffectiveAdmin && (
                <motion.div key="terminal" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <DonationTerminal />
                </motion.div>
              )}

              {activeTab === 'voiceSettings' && (
                <motion.div
                  key="voiceSettings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5 pb-0 w-full"
                >
                  <VoiceSettingsPage
                    user={user}
                    onCopyUrl={(url, label) => {
                      setCopiedUrl(url);
                      setCopiedLabel(label);
                      setShowCopyModal(true);
                    }}
                  />
                </motion.div>
              )}

              {/* ══════════════════════ COMMUNITY ══════════════════════ */}
              {activeTab === 'community' && (
                <motion.div key="community" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <CommunityPage currentUserId={profileData?.user?._id || profileData?.User?._id} onFollowAction={handleFollowAction} />
                </motion.div>
              )}

              {activeTab === 'store' && (
                <motion.div key="store" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <StoreManager overlayToken={user.overlayToken} />
                </motion.div>
              )}

              {activeTab === 'suggestions' && isEffectiveAdmin && (
                <SuggestionsAdmin />
              )}

              {activeTab === 'whatsapp' && (
                <motion.div key="whatsapp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <WhatsAppPage />
                </motion.div>
              )}

              {activeTab === 'settings' && isEffectiveAdmin && (
                <motion.div key="superDashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <DashboardSuperPage />
                </motion.div>
              )}

              {activeTab === 'inbox' && (
                <motion.div key="inbox" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <InboxPage />
                </motion.div>
              )}
              
              {activeTab === 'announcements' && isEffectiveAdmin && ( 
                <motion.div key="announcements" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <AdminAnnouncementsPage />
                </motion.div>
              )}

              {activeTab === 'settings' && !isEffectiveAdmin && <OnboardingTour />}

              {/* ══════════════════════ SETTINGS (Editor Overlay) ══════════════════════ */}
              {activeTab === 'settings' && !isEffectiveAdmin && (
                <div
                  key="settings"
                  className="grid grid-cols-1 gap-3 xl:grid-cols-12"
                >
                <section className={`space-y-5 ${showPreviewPanel ? 'xl:col-span-8' : 'xl:col-span-12'}`}>
                    {/* Konfigurasi Alert */}
                    <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl space-y-3 p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between gap-3">
                        <SectionHeader icon={<Settings size={20} />} title="Konfigurasi Utama" color="bg-blue-600" />
                      
                        {
                          !showPreviewPanel && (
                            <button
                              onClick={() => setShowPreviewPanel(v => !v)}
                              title="Sembunyikan / Tampilkan Preview"
                              className="
                              text-slate-900 dark:text-white 
                              -translate-y-[3px] translate-x-[-3px]
                              [box-shadow:4px_6px_0_#f1f5f9]
                              dark:[box-shadow:4px_4px_0_#99a3b1]
                              hover:translate-y-0 hover:translate-x-0
                              border border-slate-300
                              hover:[box-shadow:0_0_0_#f1f5f9]
                              dark:hover:[box-shadow:0_0_0_#94a3b8]
                              active:translate-y-[2px] active:translate-x-[2px]
                              active:[box-shadow:none]
                              active:bg-slate-300 dark:active:bg-slate-800
                              absolute right-6 top-[24px] cursor-pointer active:scale-[0.99] hidden md:flex items-center justify-center p-3 rounded-xl text-white shadow-lg rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all flex-shrink-0"
                            >
                              <Monitor size={18} />
                            </button>
                          )
                        }
                      </div>
                      <div id="tour-overlay-slot" className="pl-1 md:flex mt-5.5 space-y-2.5 md:space-y-0 items-center gap-3">
                        {['A', 'B'].map((slot) => (
                          <button
                            key={slot}
                            onClick={() => {
                              const newSlot = slot;
                              setActiveSlot(newSlot);
                              setObsActiveSlot(newSlot);

                              saveSettingsMutation.mutate({ 
                                settings: { activeSlot: newSlot }, 
                                slot: newSlot 
                              });
                            }}
                            className={`
                               text-slate-900 dark:text-white 
                               -translate-y-[3px] translate-x-[-3px]
                                [box-shadow:4px_6px_0_#f1f5f9]
                                dark:[box-shadow:4px_4px_0_#99a3b1]
                                hover:translate-y-0 hover:translate-x-0
                                border border-slate-300
                                hover:[box-shadow:0_0_0_#f1f5f9]
                                dark:hover:[box-shadow:0_0_0_#94a3b8]
                                active:translate-y-[2px] active:translate-x-[2px]
                                active:[box-shadow:none]
                                active:bg-slate-300 dark:active:bg-slate-800
                              w-full flex-1 flex items-center justify-between px-[14px] py-3.5 cursor-pointer font-black text-sm transition-all duration-200 active:scale-[0.99] relative overflow-hidden group ${
                              activeSlot === slot 
                                ? 'bg-blue-600 text-white rounded-lg' 
                                : 'dark:bg-slate-700 hover:bg-slate-600 rounded-lg bg-white text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                          >
                            {/* Background Glow Effect */}
                            {activeSlot === slot && (
                              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-30" />
                            )}

                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 flex items-center justify-center rounded border transition-all ${
                                activeSlot === slot 
                                  ? 'border-white/50 bg-white/20' 
                                  : 'border-slate-300 dark:border-slate-600'
                              }`}>
                                <span className="text-xs font-black tracking-widest">{slot}</span>
                              </div>
                              <div>
                                <p className="text-sm md:text-md -mt-0.5">Overlay</p>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className={`px-3 py-1 text-[10px] font-black rounded-xl  transition-all ${
                              activeSlot === slot 
                                ? 'bg-emerald-500 text-white shadow-inner' 
                                : 'bg-slate-200 dark:bg-slate-500/30 text-slate-500 dark:text-slate-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30'
                            }`}>
                              {activeSlot === slot ? 'AKTIF' : 'TIDAK AKTIF'}
                            </div>

                            {/* Subtle indicator */}
                            {activeSlot === slot && (
                              <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white rounded-full" />
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="mt-3 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setShowVideoTutorial(v => !v)}
                          className="cursor-pointer w-full flex items-center justify-between px-3 py-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                        >
                          <span className="flex items-center gap-3 font-black text-sm text-slate-700 dark:text-slate-200">
                          Tutorial Video
                          </span>
                          <div className='w-6 h-6 border p-[1.4px] hover:bg-blue-600 border-slate-600 rounded-md'>
                            <ChevronDown
                              size={20}
                              className={`text-white transition-transform duration-200 ${showVideoTutorial ? 'rotate-180' : ''}`}
                            />
                          </div>
                        </button>
                        {showVideoTutorial && (
                          <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                            <VideoTutorialSection />
                          </div>
                        )}
                      </div>

                      <div className="mt-2.5 space-y-3">
                        <div className="mb-2.5 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                          <button
                            onClick={() => setShowOBSConnect(v => !v)}
                            className="cursor-pointer w-full flex items-center justify-between px-3 py-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                          >
                            <span className="flex items-center gap-3 font-black text-sm text-slate-700 dark:text-slate-200">
                            OBS Auto-connection 
                            </span>
                            <div className='w-6 h-6 border p-[1.4px] group hover:bg-blue-600 hover:text-white border-slate-600 rounded-md'>
                              <ChevronDown
                                size={20}
                                className={`text-white transition-transform duration-200 ${showOBSConnect ? 'rotate-180' : ''}`}
                              />
                            </div>
                          </button>
                          {showOBSConnect && (
                            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                              <OBSConnectPanel overlayToken={user.overlayToken} />
                            </div>
                          )}
                        </div>
                          
                        <div className='w-full md:flex space-y-2.5 mt-3 md:space-y-0 items-center gap-2.5'>
                          {[  
                            { key: 'overlayEnabled', label: 'Overlay OBS',  desc: 'Alert tidak muncul di OBS' },
                            { key: 'showTimestamp',  label: 'Waktu Dukungan',  desc: 'Waktu kapan dukungan diterima' },
                          ].map(({ key, label, desc }) => (
                            <div key={key} className="w-full flex items-center justify-between p-4 px-5 bg-slate-50 dark:bg-slate-800 rounded-xl  border border-slate-100 dark:border-slate-700">
                              <div>
                                <p className="font-black text-slate-700 dark:text-slate-200 text-sm">{label}</p>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{desc}</p>
                              </div>
                              <button onClick={() => upd(key, !settings[key])}
                                className={`relative inline-flex h-7 w-14 items-center rounded-xl transition-colors duration-300 cursor-pointer focus:outline-none ${settings[key] ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                <span className={`inline-block h-5 w-5 transform rounded-xl bg-white shadow-md transition-transform duration-300 ${settings[key] ? 'translate-x-8' : 'translate-x-1'}`} />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Icon Alert */}
                          <div className="space-y-3">
                            <div className="grid grid-cols-4 md:grid-cols-6 gap-2.5">
                             {ICON_PRESETS
                                .slice(0, window.innerWidth < 768 ? -2 : undefined)
                                .map(({ emoji, label }) => (
                                  <button key={emoji} onClick={() => upd('customIcon', emoji === '❤️' ? '' : emoji)} title={label}
                                    className={`flex flex-col items-center gap-1 px-3 pb-2.5 pt-1.5 rounded-xl border-2 text-lg transition-all cursor-pointer active:scale-[0.95] ${
                                      (settings.customIcon || '❤️') === emoji || (!settings.customIcon && emoji === '❤️')
                                        ? 'border-white/40 bg-blue-50 dark:bg-slate-500/30'
                                        : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 bg-slate-50 dark:bg-slate-800'
                                    }`}>
                                    <span>{emoji}</span>
                                    <span className="text-[10px] font-black text-slate-400 leading-none">{label}</span>
                                  </button>
                                ))}
                            </div>

                          </div>
                      </div>

                      <button onClick={() => saveSettingsMutation.mutate({ settings, slot: activeSlot })} disabled={saveSettingsMutation.isPending}
                        className=" 
                        text-slate-900 dark:text-white bg-slate-100 dark:bg-white/20
                        -translate-y-[3px] translate-x-[-3px]
                        [box-shadow:4px_6px_0_#f1f5f9]
                        dark:[box-shadow:4px_4px_0_#99a3b1]
                        hover:translate-y-0 hover:translate-x-0
                        hover:bg-slate-200 dark:hover:bg-slate-700
                        border border-slate-300
                        hover:[box-shadow:0_0_0_#f1f5f9]
                        dark:hover:[box-shadow:0_0_0_#94a3b8]
                        active:translate-y-[2px] active:translate-x-[2px]
                        active:[box-shadow:none]
                        active:bg-slate-300 dark:active:bg-slate-800 cursor-pointer active:scale-[0.99] hover:brightness-90 w-full bg-slate-900/70 dark:bg-slate-700 text-white py-3 md:py-4 rounded-xl font-black text-sm transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-70 flex items-center justify-center gap-3 mt-3">
                        {saveSettingsMutation.isPending ? (
                          <><RefreshCw size={18} className="animate-spin" /> Menyimpan...</>
                        ) : (
                          <> Simpan Sekarang</>
                        )}
                      </button>
                    </div>

                    <div id="tour-donation-items" className='relative z-[1]'>
                      <DonationItemsEditor
                        items={settings.donationItems || []}
                        onChange={v => upd('donationItems', v)}
                        saveSettingsMutation={saveSettingsMutation}
                        settings={settings}
                        activeSlot={activeSlot}
                      />
                    </div>
                    
                    <div id="tour-min-max-dukungan" className="md:col-span-2 px-4 md:bg-white/30 md:dark:bg-slate-900/60 rounded-xl backdrop-blur-sm border border-slate-100 dark:border-slate-800 md:py-6 py-3 md:py-4 md:px-6 space-y-3">
                        <SectionHeader icon={<BadgeDollarSign size={20} />} title={`Nominal Dukungan`} color="bg-red-600" />
                        <div className='grid grid-cols-1 md:space-y-0 md:grid-cols-2 gap-3'>
                          <InputField label="Minimal" type="number" value={settings.minDonate} onChange={v => upd('minDonate', v)} />
                          <InputField label="Maksimal" type="number" value={settings.maxDonate} onChange={v => upd('maxDonate', v)} />
                        </div>
                        <button onClick={() => saveSettingsMutation.mutate({ settings, slot: activeSlot })} disabled={saveSettingsMutation.isPending}
                          className="
                          text-slate-900 dark:text-white bg-slate-100 dark:bg-white/20
                        -translate-y-[3px] translate-x-[-3px]
                        [box-shadow:4px_6px_0_#f1f5f9]
                        dark:[box-shadow:4px_4px_0_#99a3b1]
                        hover:translate-y-0 hover:translate-x-0
                        hover:bg-slate-200 dark:hover:bg-slate-700
                        border border-slate-300
                        hover:[box-shadow:0_0_0_#f1f5f9]
                        dark:hover:[box-shadow:0_0_0_#94a3b8]
                        active:translate-y-[2px] active:translate-x-[2px]
                        active:[box-shadow:none]
                        active:bg-slate-300 dark:active:bg-slate-800
                          cursor-pointer active:scale-[0.99] hover:brightness-90 w-full bg-slate-900/70 dark:bg-slate-700 text-white py-3 md:py-4 rounded-xl font-black text-sm transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-70 flex items-center justify-center gap-3">
                          <Save size={18} className='relative top-[-1px]' />
                          {saveSettingsMutation.isPending ? (
                            <><RefreshCw size={18} className="animate-spin" /> Menyimpan...</>
                          ) : (
                            <> Simpan Sekarang</>
                          )}
                        </button>
                    </div>

                    <div id="tour-tema-visual" className="md:col-span-2 px-4 md:bg-white/30 md:dark:bg-slate-900/60 rounded-xl backdrop-blur-sm border border-slate-100 dark:border-slate-800 md:py-6 py-3 md:py-4 md:px-6 space-y-3">
                      <SectionHeader icon={<Palette size={20} />} title={`Tema visual`} color="bg-cyan-600" />
                      
                      <YouTubeLivePreview2
                        settings={settings}
                        username={user.username}
                        testFullScreen={() => setNavbar(!navbar)}
                        onPreviewModeChange={setPreviewMode}
                        autoPreviewTick={autoPreviewTick}
                        onTogglePreview={() => setShowPreviewPanel(v => !v)}
                      />

                      <div className="md:col-span-2 md:mt-0 mt-4">
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-widest">Tema Visual</label>
                        <div className="grid grid-cols-3 gap-3">
                        {['modern', 'smooth', 'gifCard'].map(t => {
                          const themeLabels = {
                            modern:  'Taptip 1',
                            smooth:  'Taptip 2',
                            gifCard: 'Pop Card',
                          };

                          return (
                            <button key={t} onClick={() => upd('theme', t)}
                              className={`
                                 text-slate-900 dark:text-white 
                               -translate-y-[3px] translate-x-[-3px]
                                [box-shadow:4px_6px_0_#f1f5f9]
                                dark:[box-shadow:4px_4px_0_#99a3b1]
                                hover:translate-y-0 hover:translate-x-0
                                border border-slate-300
                                hover:[box-shadow:0_0_0_#f1f5f9]
                                dark:hover:[box-shadow:0_0_0_#94a3b8]
                                active:translate-y-[2px] active:translate-x-[2px]
                                active:[box-shadow:none]
                                active:bg-slate-300 dark:active:bg-slate-800
                                cursor-pointer active:scale-[0.99] py-3 md:py-4 text-center md:text-left md:pl-3 rounded-xl border-2 transition-all font-black text-sm capitalize ${
                                settings.theme === t
                                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-md'
                                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                              }`}>
                              {themeLabels[t] || t}
                            </button>
                          );
                        })}
                        </div>
                      </div>

                      <div className="md:col-span-2 w-full flex flex-col !mt-4 gap-3">
                        {/* <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Animasi Masuk</label> */}
                        <select value={settings.animation} aria-label="Pilih animasi masuk overlay" onChange={e => upd('animation', e.target.value)}
                          className="w-full px-2 py-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 transition-all">
                          <option value="bounce">Bounce</option><option value="slide-left">Slide Kiri</option>
                          <option value="slide-right">Slide Kanan</option><option value="fade">Fade</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        {[
                          { key: 'primaryColor',   label: 'Background',  fallback: '#2e2f42' },
                          { key: 'highlightColor', label: 'Nominal', fallback: '#ffffff' },
                          { key: 'textColor',      label: 'Teks',        fallback: '#ffffff' },
                        ].map(({ key, label, fallback }) => (
                          <ColorInput key={key} id={`color-${key}`} label={label} value={settings[key] || fallback} onChange={v => upd(key, v)} />
                        ))}
                        <ColorInput id="color-borderColor" label="WarnBorder" value={settings.borderColor || '#ffffff26'} onChange={v => upd('borderColor', v)} allowAlpha={true} />
                        <ColorInput id="color-progressBarColor" label="Progress" value={settings.progressBarColor || '#39ff14'} onChange={v => upd('progressBarColor', v)} />
                      </div>
                      <button onClick={() => saveSettingsMutation.mutate({ settings, slot: activeSlot })} disabled={saveSettingsMutation.isPending}
                        className="
                        text-slate-900 dark:text-white bg-slate-100 dark:bg-white/20
                        -translate-y-[3px] translate-x-[-3px]
                        [box-shadow:4px_6px_0_#f1f5f9]
                        dark:[box-shadow:4px_4px_0_#99a3b1]
                        hover:translate-y-0 hover:translate-x-0
                        hover:bg-slate-200 dark:hover:bg-slate-700
                        border border-slate-300
                        hover:[box-shadow:0_0_0_#f1f5f9]
                        dark:hover:[box-shadow:0_0_0_#94a3b8]
                        active:translate-y-[2px] active:translate-x-[2px]
                        active:[box-shadow:none]
                        active:bg-slate-300 dark:active:bg-slate-800
                        cursor-pointer active:scale-[0.99] hover:brightness-90 w-full bg-slate-900/70 dark:bg-slate-700 text-white py-3 md:py-4 rounded-xl font-black text-sm transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-70 flex items-center justify-center gap-3 mt-8">
                        <Save size={18} className='relative top-[-1px]' />
                        {saveSettingsMutation.isPending ? (
                          <><RefreshCw size={18} className="animate-spin" /> Menyimpan...</>
                        ) : (
                          <> Simpan Sekarang</>
                        )}
                      </button>
                    </div>

                    {/* Preset Warna Siap Pakai */}
                    <div className="md:block hidden md:col-span-2 px-4 md:bg-white/30 md:dark:bg-slate-900/60 rounded-xl backdrop-blur-sm border border-slate-100 dark:border-slate-800 md:py-6 py-3 md:py-4 md:px-6">
                      <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">
                        Preset Warna Siap Pakai
                      </label>
                      <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
                        {ALERT_PRESETS.map(preset => (
                          <button
                            key={preset.id}
                            onClick={() => {
                              upd('primaryColor',   preset.primaryColor);
                              upd('highlightColor', preset.highlightColor);
                              upd('textColor',      preset.textColor);
                              upd('borderColor',    preset.borderColor);
                            }}
                            className="
                             text-slate-900 dark:text-white 
                              -translate-y-[3px] translate-x-[-3px]
                              [box-shadow:4px_6px_0_#f1f5f9]
                              dark:[box-shadow:4px_4px_0_#99a3b1]
                              hover:translate-y-0 hover:translate-x-0
                              border border-slate-300
                              hover:[box-shadow:0_0_0_#f1f5f9]
                              dark:hover:[box-shadow:0_0_0_#94a3b8]
                              active:translate-y-[2px] active:translate-x-[2px]
                              active:[box-shadow:none]
                              active:bg-slate-300 dark:active:bg-slate-800
                            cursor-pointer active:scale-[0.99] py-3 px-2 rounded-xl  border-2 transition-all text-center md:text-left"
                            style={{
                              borderColor: preset.highlightColor + '60',
                              background: preset.primaryColor,
                            }}
                          >
                            <div className='uppercase text-[12px] md:text-[13px] relative top-[1.2px] md:text-center' style={{ color: preset.highlightColor, fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: 2 }}>
                              {preset.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Nominal */}
                    <QuickAmountsEditor amounts={settings.quickAmounts || DEFAULT_SETTINGS.quickAmounts} onChange={v => upd('quickAmounts', v)} saveSettingsMutation={saveSettingsMutation} settings={settings} activeSlot={activeSlot} />

                    {/* OBS URLs */}
                    <div id="tour-overlay-url" className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 md:p-6 md:pb-2.5 shadow-xs border border-slate-100 dark:border-slate-800">
                      <div className='mb-5'>
                        <SectionHeader icon={<Monitor size={20} />} title={`URL Overlay`} color="bg-blue-500" />
                      </div>
                      <div className="!mt-[21px] flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-3 py-4 rounded-xl  border border-slate-100/10 mb-3">
                        <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-xl flex-shrink-0">💝</div>
                        <div className='flex-1 min-w-0'>
                          <label className="block text-[10px] font-bold rounded-sm bg-slate-500/30 text-white w-full uppercase tracking-widest">MY DONATE URL</label>
                          <input readOnly value={`https://taptiptup.vercel.app/donate/${user.username}`} aria-label="URL halaman dukungan" className="w-[86%] bg-transparent font-mono text-sm text-blue-600 dark:text-blue-400 font-bold outline-none overflow-hidden truncate" />
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => copyToClipboard(`https://taptiptup.vercel.app/donate/${user.username}`)} className="
                          text-slate-900 dark:text-white 
                          -translate-y-[3px] translate-x-[-3px]
                          [box-shadow:4px_6px_0_#f1f5f9]
                          dark:[box-shadow:4px_4px_0_#99a3b1]
                          hover:translate-y-0 hover:translate-x-0
                          border border-slate-300
                          hover:[box-shadow:0_0_0_#f1f5f9]
                          dark:hover:[box-shadow:0_0_0_#94a3b8]
                          active:translate-y-[2px] active:translate-x-[2px]
                          active:[box-shadow:none]
                          active:bg-slate-300 dark:active:bg-slate-800
                          cursor-pointer active:scale-[0.99] p-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-600 dark:hover:bg-blue-800text-white rounded-xl transition-all flex-shrink-0">
                              <Copy size={15} />
                            </button>
                        </div>
                      </div>
                      {[
                        { label: 'URL ALERT - ALL SLOT', emoji: '🔔', url: user.overlayUrl },
                        { label: 'URL MEDIASHARE - OBS',      emoji: '🎬', url: `${window.location.origin}/overlay/${user.overlayToken}/mediashare` },
                        { label: 'URL VOICE NOTE - OBS',      emoji: '🎙️', url: `${window.location.origin}/overlay/${user.overlayToken}/voice` },
                        { label: 'URL COMBINED', emoji: '🧩', url: `${window.location.origin}/overlay/${user.overlayToken}/combined` }
                      ].map(({ label, emoji, url }) => (
                        <div key={label} className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-4 px-3 rounded-xl  border-2 border-dashed border-slate-200 dark:border-slate-700 mb-3">
                          <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{emoji}</div>
                          <div className='flex-1 min-w-0 relative top-[3px]'>
                            <label className="block text-[10px] font-bold rounded-sm bg-slate-500/30 text-white w-fulll uppercase tracking-widest">{label}</label>
                            <input readOnly value={url} aria-label={`URL ${label}`} className="w-[90%] bg-transparent font-mono text-sm text-blue-600 dark:text-blue-400 font-bold outline-none overflow-hidden text-ellipsis" />
                          </div>
                          <div className="flex gap-3">
                            <button onClick={() => copyToClipboard(url)} className="
                             text-slate-900 dark:text-white 
                              -translate-y-[3px] translate-x-[-3px]
                              [box-shadow:4px_6px_0_#f1f5f9]
                              dark:[box-shadow:4px_4px_0_#99a3b1]
                              hover:translate-y-0 hover:translate-x-0
                              border border-slate-300
                              hover:[box-shadow:0_0_0_#f1f5f9]
                              dark:hover:[box-shadow:0_0_0_#94a3b8]
                              active:translate-y-[2px] active:translate-x-[2px]
                              active:[box-shadow:none]
                              active:bg-slate-300 dark:active:bg-slate-800
                            cursor-pointer active:scale-[0.99] p-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-600 dark:hover:bg-blue-800text-white rounded-xl  transition-all flex-shrink-0">
                              <Copy size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* GANTI OVERLAY TOKEN */}
                    <div id="tour-ganti-token" className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl  p-4 md:p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
                      <SectionHeader icon={<RefreshCw size={18} />} title="Ganti Overlay Token" color="bg-violet-500" />
                    
                      <div className="space-y-3">
                        {/* Info box: URL saat ini */}
                        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl  border border-slate-200 dark:border-slate-700">
                          <div className="w-9 h-9 flex-shrink-0 rounded-xl  bg-violet-100 dark:bg-slate-500/30 flex items-center justify-center">
                            <Link2 size={17} className="text-white relative left-[-0.2px]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Token Aktif</p>
                            <p className="font-mono text-sm text-slate-700 dark:text-slate-200 font-bold truncate">
                              {user.overlayToken || '—'}
                            </p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(user.overlayToken, 'Overlay Token')}
                            className="
                             text-slate-900 dark:text-white 
                              -translate-y-[3px] translate-x-[-3px]
                              [box-shadow:4px_6px_0_#f1f5f9]
                              dark:[box-shadow:4px_4px_0_#99a3b1]
                              hover:translate-y-0 hover:translate-x-0
                              border border-slate-300
                              hover:[box-shadow:0_0_0_#f1f5f9]
                              dark:hover:[box-shadow:0_0_0_#94a3b8]
                              active:translate-y-[2px] active:translate-x-[2px]
                              active:[box-shadow:none]
                              active:bg-slate-300 dark:active:bg-slate-800
                            cursor-pointer p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl  transition-all flex-shrink-0"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                    
                        {/* State: sukses */}
                        <AnimatePresence mode="wait">
                          {tokenStep === 'success' && (
                            <motion.div
                              key="token-success"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex flex-col items-center gap-3 py-6 bg-green-50 dark:bg-green-950/20 rounded-xl  border border-green-200 dark:border-green-800/50"
                            >
                              <div className="w-12 h-12 bg-green-100 dark:bg-green-950/40 rounded-xl  flex items-center justify-center">
                                <CheckCircle2 size={26} className="text-green-600 dark:text-green-400" />
                              </div>
                              <div className="text-center">
                                <p className="font-black text-slate-800 dark:text-slate-100">Token Berhasil Diganti!</p>
                                <p className="text-xs text-slate-400 font-medium mt-1">Perbarui semua Browser Source di OBS sekarang.</p>
                              </div>
                              {newOverlayToken && (
                                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 w-full max-w-xs">
                                  <p className="font-mono text-sm text-violet-600 dark:text-violet-400 font-bold flex-1 truncate">{newOverlayToken}</p>
                                  <button onClick={() => copyToClipboard(newOverlayToken, 'Token Baru')} className="cursor-pointer p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl  transition-all">
                                    <Copy size={13} />
                                  </button>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                    
                        {/* Error */}
                        <AnimatePresence>
                          {tokenError && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl "
                            >
                              <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                              <p className="text-xs font-bold text-red-600 dark:text-red-400">{tokenError}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                    
                        {/* Tombol trigger */}
                        {tokenStep !== 'success' && (
                          <button
                            onClick={() => setShowTokenConfirm(true)}
                            disabled={tokenStep === 'loading'}
                          className="
                          text-slate-900 dark:text-white bg-slate-100 dark:bg-white/20
                        -translate-y-[3px] translate-x-[-3px]
                        [box-shadow:4px_6px_0_#f1f5f9]
                        dark:[box-shadow:4px_4px_0_#99a3b1]
                        hover:translate-y-0 hover:translate-x-0
                        hover:bg-slate-200 dark:hover:bg-slate-700
                        border border-slate-300
                        hover:[box-shadow:0_0_0_#f1f5f9]
                        dark:hover:[box-shadow:0_0_0_#94a3b8]
                        active:translate-y-[2px] active:translate-x-[2px]
                        active:[box-shadow:none]
                        active:bg-slate-300 dark:active:bg-slate-800
                          cursor-pointer active:scale-[0.99] hover:brightness-90 w-full bg-slate-900/70 dark:bg-slate-700 text-white py-3 md:py-4 rounded-xl font-black text-sm transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-70 flex items-center justify-center gap-3">
                          
                            {tokenStep === 'loading' ? (
                              <><Loader2 size={16} className="animate-spin" /> Memproses...</>
                            ) : (
                              <><RefreshCw size={16} className='relative top-[-0.7px]' /> Ganti Overlay Token</>
                            )}
                          </button>
                        )}
                        {tokenStep === 'success' && (
                          <button
                            onClick={() => { setTokenStep('idle'); setNewOverlayToken(''); setTokenError(''); }}
                            className="cursor-pointer active:scale-[0.99] w-full py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-black text-sm rounded-xl  transition-all"
                          >
                            Kembali
                          </button>
                        )}
                      </div>
                    </div>

                    {/* HAPUS AKUN */}
                    <div id="tour-hapus-akun" className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 pb-4.5 md:pb-6 md:p-6 shadow-sm border border-slate-100 dark:border-slate-500/20 space-y-3">
                      <SectionHeader icon={<Trash2 size={18} />} title="Hapus Akun" color="bg-red-500" />
                    
                      <div className="space-y-3">
                        <p className="text-xs text-slate-400 dark:text-slate-500 md:block hidden font-medium leading-relaxed">
                          Menghapus akun bersifat <span className="font-black text-red-400">permanen</span>.
                          Seluruh data akan dihapus selamanya.
                        </p>
                    
                        {/* Daftar konsekuensi */}
                        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {[
                            { icon: '⚙️', label: 'Saldo tidak dapat dikembalikan' },
                            { icon: '⚙️', label: 'Riwayat dukungan terhapus permanen' },
                            { icon: '⚙️', label: 'Semua URL overlay tidak aktif' },
                            { icon: '⚙️', label: 'Data komunitas & follower hilang' },
                          ].map(({ icon, label }) => (
                            <div key={label} className="flex items-center gap-3 p-3 bg-slate-500/20 rounded-xl  border border-slate-500/30">
                              <span className="text-base flex-shrink-0">{icon}</span>
                              <p className="text-[11px] font-bold text-white">{label}</p>
                            </div>
                          ))}
                        </div>
                        <div className="grid md:hidden grid-cols-1 sm:grid-cols-2 gap-2">
                          <div key={"Note"} className="md:hidden flex items-center gap-3 p-3 py-2.5 bg-slate-500/20 rounded-xl  border border-slate-500/30">
                            <span className="text-base flex-shrink-0">{'⚙️'}</span>
                            <p className="text-[11px] font-bold text-white">{"Semua data dan saldo terhapus permanent"}</p>
                          </div>
                        </div>
                    
                        {/* Step 1: ketik konfirmasi */}
                        {deleteStep === 'idle' && (
                          <div className="space-y-3 pt-1">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                                Ketik <span className="text-red-400 font-black">HAPUS AKUN SAYA</span> untuk lanjut
                              </label>
                              <InputField
                                label='Ketik ulang'
                                type="text"
                                value={deleteConfirmText}
                                onChange={e => setDeleteConfirmText(e)}
                                placeholder="HAPUS AKUN SAYA"
                                // className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-red-400 dark:focus:border-red-600 text-slate-900 dark:text-slate-100 rounded-xl  font-bold text-sm outline-none transition-all"
                              />
                            </div>
                            <button
                              onClick={() => {
                                if (deleteConfirmText !== 'HAPUS AKUN SAYA') {
                                  setDeleteError('Ketik persis: HAPUS AKUN SAYA');
                                  return;
                                }
                                setDeleteError('');
                                setDeleteStep('pin');
                              }}
                              disabled={deleteConfirmText !== 'HAPUS AKUN SAYA'}
                              className="
                              text-slate-900 dark:text-white 
                                -translate-y-[3px] translate-x-[-3px]
                                [box-shadow:4px_6px_0_#f1f5f9]
                                dark:[box-shadow:4px_4px_0_#99a3b1]
                                hover:translate-y-0 hover:translate-x-0
                                hover:bg-slate-200 dark:hover:bg-slate-700
                                border border-slate-300
                                hover:[box-shadow:0_0_0_#f1f5f9]
                                dark:hover:[box-shadow:0_0_0_#94a3b8]
                                active:translate-y-[2px] active:translate-x-[2px]
                                active:[box-shadow:none]
                              cursor-pointer active:scale-[0.99] w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl  transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Trash2 className='relative top-[-1px]' size={16} /> Lanjut ke Verifikasi PIN
                            </button>
                          </div>
                        )}
                    
                        {/* Step 2: verifikasi PIN sebelum hapus */}
                        {deleteStep === 'pin' && (
                          <motion.div
                            key="delete-pin"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-5 pt-1"
                          >
                            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 rounded-xl ">
                              <p className="text-xs font-black text-red-600 dark:text-red-400 mb-0.5">Konfirmasi dengan PIN Keamanan</p>
                              <p className="text-[11px] text-red-500 dark:text-red-500 font-medium">
                                Masukkan PIN 4-digit yang kamu gunakan untuk konfirmasi transfer.
                              </p>
                            </div>
                    
                            {/* PIN input row (inline, tanpa reuse PinRow agar bebas styling) */}
                            <div className="flex flex-col items-center gap-3">
                              <div className="flex gap-3 justify-center">
                                {deletePinForm.map((digit, idx) => (
                                  <input
                                    key={idx}
                                    ref={deletePinRefs[idx]}
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => {
                                      const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 1);
                                      setDeletePinForm(prev => {
                                        const next = [...prev];
                                        next[idx] = val;
                                        return next;
                                      });
                                      if (val && idx < 3) {
                                        setTimeout(() => deletePinRefs[idx + 1].current?.focus(), 10);
                                      }
                                    }}
                                    onKeyDown={e => {
                                      if (e.key === 'Backspace' && !deletePinForm[idx] && idx > 0) {
                                        deletePinRefs[idx - 1].current?.focus();
                                      }
                                    }}
                                    className="w-13 h-13 text-center text-xl font-black bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-red-500 dark:focus:border-red-500 rounded-xl outline-none text-slate-900 dark:text-slate-100 transition-all"
                                  />
                                ))}
                              </div>
                            </div>
                    
                            <div className="flex gap-3">
                              <button
                                onClick={() => {
                                  setDeleteStep('idle');
                                  setDeletePinForm(['','','','']);
                                  setDeleteError('');
                                }}
                                className="cursor-pointer flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-sm rounded-xl  transition-all active:scale-[0.99]"
                              >
                                Batal
                              </button>
                              <button
                                onClick={async () => {
                                  const pin = deletePinForm.join('');
                                  if (pin.length < 4) {
                                    setDeleteError('Masukkan PIN 4 digit');
                                    return;
                                  }
                                  setDeleteStep('loading');
                                  setDeleteError('');
                                  try {
                                    await api.delete('/api/auth/delete-account', {
                                      data: { pin }
                                    });
                                    setDeleteStep('done');
                                    // Logout otomatis setelah 3 detik
                                    setTimeout(() => {
                                      localStorage.removeItem('token');
                                      window.location.href = '/login';
                                    }, 3000);
                                  } catch (err) {
                                    const msg = err.response?.data?.message || err.message || 'Gagal menghapus akun';
                                    setDeleteError(msg);
                                    setDeleteStep('pin');
                                  }
                                }}
                                disabled={deletePinForm.join('').length < 4}
                                className="cursor-pointer flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl  transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <Trash2 size={15} /> Hapus Selamanya
                              </button>
                            </div>
                          </motion.div>
                        )}
                    
                        {/* Loading */}
                        {deleteStep === 'loading' && (
                          <motion.div
                            key="delete-loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-3 py-8"
                          >
                            <Loader2 size={32} className="animate-spin text-red-500" />
                            <p className="text-sm font-black text-slate-700 dark:text-slate-200">Menghapus akun...</p>
                            <p className="text-xs text-slate-400 font-medium">Mohon tunggu, jangan tutup halaman ini.</p>
                          </motion.div>
                        )}
                    
                        {/* Done / Success */}
                        {deleteStep === 'done' && (
                          <motion.div
                            key="delete-done"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-3 py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl "
                          >
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-950/40 rounded-xl flex items-center justify-center">
                              <Trash2 size={28} className="text-red-500" />
                            </div>
                            <div className="text-center">
                              <p className="font-black text-slate-800 dark:text-slate-100 text-lg">Akun Berhasil Dihapus</p>
                              <p className="text-xs text-slate-400 font-medium mt-1">Kamu akan dialihkan ke halaman login...</p>
                            </div>
                          </motion.div>
                        )}
                    
                        {/* Error */}
                        <AnimatePresence>
                          {deleteError && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl "
                            >
                              <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                              <p className="text-xs font-bold text-red-600 dark:text-red-400">{deleteError}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </section>

                  {showPreviewPanel && (
                    <section
                      key="preview-panel"
                      className="xl:col-span-4 md:block hidden sticky top-26 self-start z-[2]"
                    >
                    <motion.div 
                      animate={{ opacity: showPreviewPanel ? 1 : 0.6 }}
                      transition={{ duration: 0.2 }}
                    >
                    <YouTubeLivePreview
                      settings={settings}
                      username={user.username}
                      testFullScreen={() => setNavbar(!navbar)}
                      onPreviewModeChange={setPreviewMode}
                      autoPreviewTick={autoPreviewTick}
                      onTogglePreview={() => setShowPreviewPanel(v => !v)}
                    />

                    </motion.div>
                    </section>
                  )}
                </div>
              )}

              {activeTab === 'ipBlacklist' && (
                <motion.div
                  key="ipBlacklist"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <IpBlacklistPage />
                </motion.div>
              )}

              {/* ══════════════════════ ALERT SETTINGS ══════════════════════ */}
              {activeTab === 'alertSettings' && (
                <motion.div key="alertSettings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pb-0 w-full">

                  {/* Instant Test */}
                  {profileLoading ? <InstantTestAlertSkeleton /> : <InstantTestAlert overlayToken={user.overlayToken} settings={settings} user={user} />}

                  {/* Durasi */}
                  {profileLoading ? (
                    <DurationSettingsSkeleton alertOnly={true} />
                  ) : (
                    <DurationSettings 
                      alertOnly={true} 
                      settings={settings} 
                      onChange={upd} 
                      saveSettingsMutation={saveSettingsMutation} 
                      activeSlot={activeSlot} 
                    />
                  )}
                  

                  {/* Suara */}
                  <SoundSection activeSlot={activeSlot} />

                  {/* TTS */}
                  <TTSSection
                    settings={settings}
                    upd={upd}
                    saveSettingsMutation={saveSettingsMutation}
                    api={api}
                    activeSlot={activeSlot}
                  />

                  {/* Filter kata */}
                  <BannedWordsEditor saveSettingsMutation={saveSettingsMutation} settings={settings} activeSlot={activeSlot} />
                </motion.div>
              )}

              {/* ══════════════════════ MEDIA SETTINGS ══════════════════════ */}
              {activeTab === 'mediaSettings' && (
                <motion.div key="mediaSettings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pb-0 w-full">

                  {/* Instant Test MediaShare */}
                  {profileLoading ? <InstantTestMediaShareSkeleton /> : <InstantTestMediaShare overlayToken={user.overlayToken} settings={settings} user={user}/>}

                  {/* Izin Media */}
                  <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl  p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-7">
                    <SectionHeader icon={<ImageIcon size={20} />} title="Izinkan Donor Kirim Media" color="bg-purple-500" />
                    <MediaTriggersEditor saveSettingsMutation={saveSettingsMutation} settings={settings} triggers={settings.mediaTriggers || []} onChange={v => upd('mediaTriggers', v)} activeSlot={activeSlot} />
                  </div>

                  {/* MediaShare Control */}
                  <MediaShareControl overlayToken={user.overlayToken} />

                  {profileLoading ? (
                    <DurationSettingsSkeleton mediaOnly={true} />
                  ) : (
                    <DurationSettings 
                      mediaOnly={true} 
                      settings={settings} 
                      onChange={upd} 
                      saveSettingsMutation={saveSettingsMutation} 
                      activeSlot={activeSlot} 
                    />
                  )}
                </motion.div>
              )}

              {activeTab === 'songSettings' && (
                <motion.div key="songSettings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pb-0 w-full">
                  <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-3">
                    <SectionHeader icon={<Music size={20} />} title="Share Song" color="bg-blue-600" />

                    <div className="flex items-center justify-between p-4 mt-5 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div>
                        <p className="font-black text-slate-700 dark:text-slate-200 text-sm">Aktifkan Song Request</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Donor bisa request lagu</p>
                      </div>
                      <button onClick={() => upd('songRequestEnabled', !settings.songRequestEnabled)}
                        className={`relative inline-flex h-7 w-14 items-center rounded-xl transition-colors duration-300 cursor-pointer focus:outline-none ${settings.songRequestEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                        <span className={`inline-block h-5 w-5 transform rounded-xl bg-white shadow-md transition-transform duration-300 ${settings.songRequestEnabled ? 'translate-x-8' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <div>
                      <InputField
                        label="Min. Nominal"
                        type="number"
                        placeholder="30.000"
                        value={settings.songRequestMinAmount}
                        onChange={v => upd('songRequestMinAmount', v === '' ? '' : Number(v))}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
                        Volume Player ({settings.songRequestVolume ?? 80}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.songRequestVolume ?? 80}
                        onChange={e => upd('songRequestVolume', Number(e.target.value))}
                        className="w-full cursor-pointer accent-blue-600"
                      />
                    </div>

                    <button onClick={() => saveSettingsMutation.mutate({ settings, slot: activeSlot })} disabled={saveSettingsMutation.isPending}
                      className="
                      text-slate-900 dark:text-white bg-slate-100 dark:bg-white/20
                      -translate-y-[3px] translate-x-[-3px]
                      [box-shadow:4px_6px_0_#f1f5f9]
                      dark:[box-shadow:4px_4px_0_#99a3b1]
                      hover:translate-y-0 hover:translate-x-0
                      hover:bg-slate-200 dark:hover:bg-slate-700
                      border border-slate-300
                      hover:[box-shadow:0_0_0_#f1f5f9]
                      dark:hover:[box-shadow:0_0_0_#94a3b8]
                      active:translate-y-[2px] active:translate-x-[2px]
                      active:[box-shadow:none]
                      active:bg-slate-300 dark:active:bg-slate-800
                      cursor-pointer active:scale-[0.99] hover:brightness-90 w-full bg-slate-900/70 dark:bg-slate-700 text-white py-3 md:py-4 rounded-xl font-black text-sm transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-70 flex items-center justify-center gap-3">
                      {saveSettingsMutation.isPending ? (
                        <><RefreshCw size={18} className="animate-spin" /> Menyimpan...</>
                      ) : (
                        <> Simpan Sekarang</>
                      )}
                    </button>

                    <div className="mt-4 flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                      <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🎵</div>
                      <div className="flex-1 min-w-0 relative top-[3px]">
                        <label className="block text-[10px] font-bold rounded-sm bg-slate-500/30 text-white uppercase tracking-widest">
                          URL NOW PLAYING - OBS
                        </label>
                        <input
                          readOnly
                          value={`${window.location.origin}/overlay/${user.overlayToken}/now-playing`}
                          aria-label="URL Now Playing Overlay"
                          className="w-[90%] bg-transparent font-mono text-sm text-blue-600 dark:text-blue-400 font-bold outline-none overflow-hidden text-ellipsis"
                        />
                      </div>
                      <button
                        onClick={() => copyToClipboard(
                          `${window.location.origin}/overlay/${user.overlayToken}/now-playing`,
                          'Now Playing Overlay'
                        )}
                        className="cursor-pointer active:scale-[0.99] p-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-600 rounded-xl transition-all flex-shrink-0"
                      >
                        <Copy size={15} />
                      </button>
                    </div>

                    {/* Tombol Skip Lagu Sekarang */}
                    <div className="mt-4 md:flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <div className="flex-1">
                        <p className="font-black text-sm text-slate-700 dark:text-white">Skip Lagu Sekarang</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Lewati lagu yang sedang diputar</p>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await api.post('/api/midtrans/song-skip', { overlayToken: user.overlayToken });
                            toast.success('⏭ Lagu di-skip!');
                          } catch {
                            toast.error('Gagal skip lagu');
                          }
                        }}
                        className="md:!mt-0 !mt-3 md:w-max w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl transition-all active:scale-[0.99] cursor-pointer flex items-center gap-2"
                      >
                        Skip
                      </button>
                    </div>
                    <div className="mt-4 flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm text-slate-700 dark:text-white">Stream Deck — Skip Lagu</p>
                        <input
                          readOnly
                          value={`${import.meta.env.VITE_API_URL}/api/midtrans/song-shortcut/${user.overlayToken}/skip`}
                          aria-label="URL Stream Deck Skip Lagu"
                          className="w-[95%] bg-transparent font-mono text-xs text-blue-600 dark:text-blue-400 font-bold outline-none overflow-hidden text-ellipsis"
                        />
                      </div>
                      <button
                        onClick={() => copyToClipboard(
                          `${import.meta.env.VITE_API_URL}/api/midtrans/song-shortcut/${user.overlayToken}/skip`,
                          'Stream Deck Skip Lagu'
                        )}
                        className="cursor-pointer active:scale-[0.99] p-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-600 rounded-xl transition-all flex-shrink-0"
                      >
                        <Copy size={15} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ══════════════════════ HISTORY ══════════════════════ */}
              {activeTab === 'history' && (
                <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <HistoryPage  key={localStorage.getItem('showBalance')} />
                </motion.div>
              )}

              {/* ══════════════════════ MY DONATIONS ══════════════════════ */}
              {activeTab === 'myDonations' && (
                <motion.div key="myDonations" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <MyDonationsHistory />
                </motion.div>
              )}
              
              {/* ── Modal konfirmasi ganti token ── */}
              <AnimatePresence>
                {showTokenConfirm && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-4"
                    onClick={() => setShowTokenConfirm(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-7 shadow-2xl border border-slate-100 dark:border-slate-800"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="w-16 h-16 bg-violet-100 dark:bg-violet-950/40 rounded-xl flex items-center justify-center">
                          <RefreshCw size={30} className="text-violet-500" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-1">Ganti Overlay Token?</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            Semua URL overlay lama akan <span className="font-black text-red-500">langsung tidak aktif</span>. 
                            Pastikan kamu siap memperbarui OBS setelah ini.
                          </p>
                        </div>
                        <div className="flex gap-3 w-full mt-2">
                          <button
                            onClick={() => setShowTokenConfirm(false)}
                            className="cursor-pointer flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-sm rounded-xl  transition-all active:scale-[0.99]"
                          >
                            Batal
                          </button>
                          <button
                            onClick={async () => {
                              setShowTokenConfirm(false);
                              setTokenStep('loading');
                              setTokenError('');
                              try {
                                const res = await api.put('/api/auth/regenerate-overlay-token');
                                setNewOverlayToken(res.data.overlayToken || '');
                                setTokenStep('success');
                                // Refresh profile data agar URL di dashboard ikut update
                                await isRefetchProfile();
                              } catch (err) {
                                const msg = err.response?.data?.message || err.message || 'Gagal mengganti token';
                                setTokenError(msg);
                                setTokenStep('error');
                                setTimeout(() => setTokenStep('idle'), 100);
                              }
                            }}
                            className="cursor-pointer flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white font-black text-sm rounded-xl  transition-all active:scale-[0.99]"
                          >
                            Ya, Ganti Sekarang
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ══════════════════════ PROFILE ══════════════════════ */}
              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3 pb-0">
                  <div className="relative bg-slate-900/70 backdrop-blur-sm rounded-xl  pt-8 pb-7 md:pl-7 pr-8 shadow-sm border border-slate-100 dark:border-slate-800 px-8 py-0 text-white relative overflow-hidden">
                    <div className="relative z-2 flex flex-col md:flex-row items-center gap-3">
                      <div className="rounded-xl w-26 h-26 mt-[-1.6px] mx-auto rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-5xl font-black shadow-lg border-4 border-white dark:border-slate-900">
                        {profileForm.profilePicture || user?.profilePicture ? (
                          <img src={profileForm.profilePicture || user?.profilePicture} alt={user.username} className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; const parent = e.target.parentElement; if (parent) parent.innerHTML = (user.username?.charAt(0) || '?').toUpperCase(); }} />
                        ) : (user.username?.charAt(0) || '?').toUpperCase()}
                      </div>
                      <div className="flex-1 text-center md:text-left md:block flex flex-col jsutify-center items-center space-y-3">
                        <div className="flex flex-wrap items-center justify-center md:justify-between gap-3">
                          <div className='flex items-center gap-3'>
                            <h2 className="text-3xl font-black text-white tracking-tighter">@{user.username}</h2> <Verified className='relative top-[3.9px] text-blue-400' />
                          </div>
                        </div>
                        <div className="w-max px-4 md:flex hidden py-3 relative bg-green-100 relative top-1 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-200">Verified Creator</div>
                        <p className="text-slate-200 font-medium text-sm">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-wrap gap-2 justify-center md:justify-start bg-gradient-to-r from-slate-50/50 to-blue-50/30 dark:from-slate-900/50 dark:to-blue-900/20 p-3 py-3 border border-slate-100/20 dark:border-slate-700/50 backdrop-blur-sm rounded-xl shadow-sm">
                    {['10k','50k','100k','500k','1jt'].map(name => (
                      <Badge key={name} type="streamer" name={name} active={profileData?.user?.donationMilestones?.[name] || false} />
                    ))}
                  </div>

                  <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl  p-4 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                    <SectionHeader icon={<User size={18} />} title="Profil Publik" color="bg-blue-500" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-10">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">Foto Profil</label>
                        <div className="flex flex-col sm:flex-row items-start gap-3">
                          <div className="w-20 h-20 rounded-xl  border-2 border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-5xl font-black flex-shrink-0">
                            {profileForm.profilePicture ? (
                              <img src={profileForm.profilePicture} alt="Profile Preview" className="w-full h-full object-cover" onError={(e) => e.target.src = ''} />
                            ) : profileForm.username?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 space-y-3 w-full">
                            <label className="cursor-pointer block">
                              <div className="h-20 border-2 active:scale-[0.99] border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 text-center hover:border-blue-400 transition-all">
                                <input type="file" accept="image/*" onChange={handleProfilePictureUpload} className="hidden h-20" id="profile-upload" />
                                <label htmlFor="profile-upload" className="cursor-pointer flex flex-col items-center">
                                  <p className="flex items-center gap-3 mb-1 font-bold text-slate-600 dark:text-slate-300">Klik untuk upload gambar <Image size={16} /></p>
                                  <p className="text-[10px] text-slate-400">JPG, PNG, WebP (max 3MB)</p>
                                </label>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2 mb-1 border-t border-slate-100/10 pt-5 mt-2">
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest ml-1">Link Halaman Dukungan</label>
                        <div className="flex gap-3">
                          <input readOnly value={`${window.location.origin}/donate/${user.username}`}
                            className="flex-1 bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-100 dark:border-blue-900 rounded-xl p-5 font-mono text-sm text-blue-600 dark:text-blue-400 font-bold outline-none" />
                          <button onClick={() => copyToClipboard(`${window.location.origin}/donate/${user.username}`)}
                            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl  transition-all flex items-center justify-center active:scale-95">
                            <Copy size={20} />
                          </button>
                        </div>
                      </div>

                      <InputField label="Display Name" value={profileForm.username} onChange={v => setProfileForm(f => ({ ...f, username: v }))} />
                      <InputField label="Email Address" type="email" value={profileForm.email} onChange={v => setProfileForm(f => ({ ...f, email: v }))} />

                      <div className="md:col-span-2">
                        {/* <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Bio Singkat</label> */}
                        <TextareaField
                          label="Bio"
                          value={profileForm.bio}
                          onChange={v => setProfileForm(f => ({ ...f, bio: v }))}
                          placeholder="Ceritakan tentang kontenmu..."
                          inputClassName="h-32"
                        />
                      </div>

                      <div className="md:col-span-2 mb-1">
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest ml-1">Intro Halaman Donate</label>
                        <InputField
                          label="Intro"
                          type="text"
                          value={profileForm.donateIntro || ''}
                          onChange={v => setProfileForm(f => ({ ...f, donateIntro: v }))}
                          placeholder="Support aku biar makin semangat 🚀"
                          maxLength={120}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-widest">Social Media</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <InputField label="Instagram" value={profileForm.instagram} placeholder="@username" onChange={v => setProfileForm(f => ({ ...f, instagram: v }))} />
                          <InputField label="Facebook" value={profileForm.facebook} placeholder="facebook.com/username" onChange={v => setProfileForm(f => ({ ...f, facebook: v }))} />
                          <InputField label="YouTube" value={profileForm.youtube} placeholder="youtube.com/@channel" onChange={v => setProfileForm(f => ({ ...f, youtube: v }))} />
                          <InputField label="X / Twitter" value={profileForm.twitter} placeholder="@username" onChange={v => setProfileForm(f => ({ ...f, twitter: v }))} />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <button onClick={() => updateProfileMutation.mutate(profileForm)} disabled={updateProfileMutation.isPending}
                          className="
                          
                          cursor-pointer active:scale-[0.99] hover:brightness-90 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-md transition-all flex items-center justify-center gap-3 disabled:opacity-70">
                          
                          {updateProfileMutation.isPending ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
                        </button>
                      </div>
                    </div>
                  </div>
                  <QrCodeCard username={user.username} />
                    <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl  p-4 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
                      <SectionHeader icon={<ShieldCheck size={18} />} title="Ubah PIN Keamanan" color="bg-amber-500" />
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        PIN digunakan untuk konfirmasi transfer saldo. Pastikan tidak membagikannya ke siapapun.
                      </p>

                      <AnimatePresence mode="wait">
                        {pinStep === 'success' ? (
                          <motion.div
                            key="pin-success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-3 py-8"
                          >
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/40 flex items-center justify-center">
                              <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
                            </div>
                            <p className="font-black text-slate-800 dark:text-slate-100 text-lg">PIN Berhasil Diubah!</p>
                            <p className="text-sm text-slate-400 font-medium">Gunakan PIN baru untuk konfirmasi transfer berikutnya.</p>
                          </motion.div>
                        ) : (
                          <motion.div key="pin-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl  w-full grid grid-cols-1 gap-3 md:gap-14 items-center justify-center md:grid-cols-3 space-y-0">
                            <PinRow
                              label="PIN Saat Ini"
                              groupKey="currentPin"
                              refs={currentPinRefs}
                              pinForm={pinForm}
                              setPinForm={setPinForm}
                              showPins={showPins}
                              setShowPins={setShowPins}
                              handlePinInputChange={handlePinInputChange}
                              handlePinKeyDown={handlePinKeyDown}
                            />
                            <PinRow
                              label="PIN Baru"
                              groupKey="newPin"
                              refs={newPinRefs}
                              pinForm={pinForm}
                              setPinForm={setPinForm}
                              showPins={showPins}
                              setShowPins={setShowPins}
                              handlePinInputChange={handlePinInputChange}
                              handlePinKeyDown={handlePinKeyDown}
                            />
                            <PinRow
                              label="Konfirmasi PIN Baru"
                              groupKey="confirmPin"
                              refs={confirmPinRefs}
                              pinForm={pinForm}
                              setPinForm={setPinForm}
                              showPins={showPins}
                              setShowPins={setShowPins}
                              handlePinInputChange={handlePinInputChange}
                              handlePinKeyDown={handlePinKeyDown}
                            />

                          </motion.div>
                      )}
                      </AnimatePresence>
                        <AnimatePresence>
                          {pinError && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="rounded-xl w-max flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
                            >
                              <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                              <p className="text-xs font-bold text-red-600 dark:text-red-400">{pinError}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <button
                          onClick={handleChangePin}
                          disabled={
                            pinLoading ||
                            pinForm.currentPin.join('').length < 4 ||
                            pinForm.newPin.join('').length < 4 ||
                            pinForm.confirmPin.join('').length < 4
                          }
                          className="rounded-xl cursor-pointer md:mt-0 mt-2 w-full px-4 relative md:top-[7px] py-3 bg-blue-500 hover:bg-amber-600 text-white font-black text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {pinLoading ? (
                            <><Loader2 size={16} className="animate-spin" /> Memproses...</>
                          ) : (
                            <><Save />Simpan PIN terbaru</>
                          )}
                        </button>
                    </div>
                </motion.div>
              )}

              {/* ══════════════════════ WALLET ══════════════════════ */}
              {activeTab === 'wallet' && (
                maintenance?.withdrawal
                  ? <MaintenanceScreen title="Sitem WD - maintenance" subtitle="Fitur penarikan sementara tidak tersedia. Saldo kamu aman dan tidak terpengaruh." />
                  : <WithdrawPage />
              )}

              {/* ══════════════════════ FEE CONFIG ══════════════════════ */}
              {activeTab === 'feeConfig' && (
                <motion.div key="feeConfig" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <FeeConfigPage />
                </motion.div>
              )}

              {/* ══════════════════════ GHOST ALERT ══════════════════════ */}
              {activeTab === 'ghostAlert' && isEffectiveAdmin && <GhostAlertPage />}

              {/* ══════════════════════ ADMIN ══════════════════════ */}
              {activeTab === 'admin' && isEffectiveAdmin && (
                <motion.div key="admin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                  <AdminWithdrawalPage />
                </motion.div>
              )}
              {activeTab === 'admin' && !isEffectiveAdmin && (
                <motion.div key="forbidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 text-slate-400">
                  <p className="text-6xl mb-4">🔒</p>
                  <p className="font-black text-xl">Akses Ditolak</p>
                  <p className="font-medium text-sm mt-2">Halaman ini hanya untuk Super Admin</p>
                </motion.div>
              )}

              {/* ══════════════════════ POLL ══════════════════════ */}
              {activeTab === 'poll' && (
                <motion.div key="poll" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-100 dark:border-slate-800 rounded-xl p-4 md:p-5 text-white relative overflow-hidden">
                      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #2e2f42 0%, transparent 50%)' }} />
                      <div className="relative flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-600 p-3 rounded-xl  text-white shadow-lg">
                                <Box size={20} />
                            </div>
                            <div>
                                <h3 className="md:capitalize text-sm uppercase md:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                                    Polling
                                </h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  <div className="space-y-5 mt-5">
                    <PollManager overlayToken={user.overlayToken} username={user.username} />
                  </div>
                </motion.div>
              )}

              {/* ══════════════════════ MILESTONES ══════════════════════ */}
              {activeTab === 'milestones' && <MilestonesManager overlayToken={user?.overlayToken} />}

              {/* ══════════════════════ SUBATHON ══════════════════════ */}
              {activeTab === 'subathon' && (
                <motion.div key="subathon" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="mb-5 bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-100 dark:border-slate-800 rounded-xl  p-4 md:p-5 text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #2e2f42 0%, transparent 50%)' }} />
                    <div className="relative flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-600 p-3 rounded-xl  text-white shadow-lg">
                              <Timer size={20} className='relative left-[0.5px]' />
                          </div>
                          <div>
                              <h3 className="md:capitalize text-sm uppercase md:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                                  Subathon
                              </h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <SubathonManager overlayToken={user.overlayToken} />
                </motion.div>
              )}

              {/* ══════════════════════ LEADERBOARD ══════════════════════ */}
              {activeTab === 'leaderboard' && (
                <motion.div key="leaderboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <LeaderboardSettings overlayToken={user?.overlayToken} />
                  {/* <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl  p-4 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
                  </div> */}
                </motion.div>
              )}

              {/* ══════════════════════ CONTACT ══════════════════════ */}
              {activeTab === 'contact' && <ContactPage />}

            </AnimatePresence>
          </div>
        </main>

        {isSidebarOpen && (
          <div onClick={() => setIsSidebarOpen(true)} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 lg:hidden" />
        )}

        {showUpgradeModal && (
          <div className="fixed inset-0 z-[99999] overlow-hidden flex items-center justify-center bg-black/60 backdrop-blur-md">

            <UpgradeConfetti />

            <div className="bg-white dark:bg-slate-900 p-8 max-w-max text-center">
              <ShieldCheck className="w-16 h-16 mx-auto text-blue-500 mb-4" />
              <h2 className="text-2xl font-black mb-2">Akun superStreamer</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Memiliki akses penuh untuk mengelola semua akun streamer taptiptup.
              </p>
              <button
                onClick={async () => {
                  setShowUpgradeModal(false); // ✅ tutup modal dulu, langsung
                  
                  try {
                    await api.put('/api/streamer-manage/mark-role-upgrade-notified');
                    await isRefetchProfile(); // refetch di background
                  } catch (err) {
                    console.error('Gagal update notified:', err);
                  }
                }}
                className="cursor-pointer active:scale-[0.99] bg-blue-600 mt-4 hover:bg-blue-700 text-white font-black px-4 py-3"
              >
                Terima Kasih
              </button>
            </div>
          </div>
        )}
        
        <AnimatePresence>
          {showModeToast && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{duration: 0.15}}
              className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 20 }}
                className="flex rounded-xl  flex-col items-center w-[95vw] md:w-md gap-3 text-center p-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl"
              >
                <div className="w-20 h-20 rounded-xl  bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
                  <ShieldCheck size={40} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{modeToastLabel}</p>
                  <p className="text-sm text-slate-400 font-medium mt-2">
                    {adminMode ? 'Kamu sekarang dalam mode pengelola.' : 'Kamu kembali ke mode streamer.'}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showLoginModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-md"
              onClick={() => setShowLoginModal(false)}
            >
              <motion.div
                initial={{ scale: 0.88, opacity: 0, y: 24 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.88, opacity: 0, y: 24 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                onClick={e => e.stopPropagation()}
                className="relative max-w-3xl bg-slate-700 p-3 w-full mx-4 rounded-xl overflow-hidden shadow-2xl border border-white/10"
              >
                <img
                  src="/poster.png"
                  alt="poster"
                  className="w-full rounded-xl  h-auto block"
                />
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-red-600 hover:bg-black/70 text-white rounded-xl transition-all cursor-pointer"
                  aria-label="Tutup"
                >
                  ✕
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* <CustomerServiceWidget /> */}
      </div>
    </>
  );
};
