import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AtSign,
  Bell,
  ChevronDown,
  Eye, EyeOff,
  Film,
  Heart,
  ImageIcon, Loader2,
  Lock,
  LogOut,
  Mail,
  Mic,
  Monitor,
  Moon, Sun,
  User,
  Video, X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Badge from '../components/badge';
import { VoiceRecorder } from '../components/voiceOver';
import { useTheme } from '../hooks/useTheme';
import { useMaintenance } from '../hooks/useMaintenance';
import MaintenanceScreen from '../components/MaintenanceScreen';

// ============================================================
// DETEKSI ENVIRONMENT
// ============================================================
const isProduction = import.meta.env.VITE_NODE_ENV === 'production';

const MIDTRANS_CLIENT_KEY = isProduction
  ? import.meta.env.VITE_MIDTRANS_CLIENT_KEY
  : import.meta.env.VITE_DEV_MIDTRANS_CLIENT_KEY;

const SNAP_URL = isProduction
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js';

const BASE_URL = import.meta.env.VITE_API_URL;

// ============================================================
// AUTH HELPERS
// ============================================================
const getToken   = () => localStorage.getItem('token');
const getPayload = () => {
  const t = getToken();
  if (!t) return null;
  try { return JSON.parse(atob(t.split('.')[1])); } catch { return null; }
};
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

// ============================================================
// HELPER — Media Detection
// ============================================================

const isDirectVideoUrl = (url) => /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);

const isYouTubeUrl = (url) => {
  if (!url) return false;
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)/i.test(url);
};

const getYouTubeEmbedUrl = (url) => {
  if (!url) return '';

  // youtu.be/ID
  if (url.includes('youtu.be')) {
    const videoId = url.split('youtu.be/')[1]?.split(/[?&]/)[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
  }

  try {
    const urlObj = new URL(url);

    // /live/ID  ← TAMBAH INI
    const liveMatch = urlObj.pathname.match(/\/live\/([a-zA-Z0-9_-]+)/);
    if (liveMatch) {
      // ✅ Live — tanpa start, tanpa loop
      return `https://www.youtube.com/embed/${liveMatch[1]}?autoplay=1&mute=1`;
    }

    // watch?v=ID
    const videoId = urlObj.searchParams.get('v');
    if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;

  } catch { /* fallback */ }

  return url;
};

const getYouTubeStartTime = (seconds) => {
  if (!seconds || seconds < 0) return 0;
  return Math.floor(seconds);
};

const getMediaType = (url) => {
  if (!url) return null;
  if (isYouTubeUrl(url)) return 'youtube';
  if (isDirectVideoUrl(url)) return 'video';
  return 'image';
};

const formatRp = (n) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}jt`;
  if (n >= 1000) return `${n / 1000}K`;
  return String(n);
};

const getEligibleTrigger = (mediaTriggers = [], amount) => {
  if (!mediaTriggers.length || !amount) return null;
  const eligible = mediaTriggers
    .filter((t) => Number(amount) >= t.minAmount)
    .sort((a, b) => b.minAmount - a.minAmount);
  return eligible[0] || null;
};

// ============================================================
// YouTubeTimePicker
// ============================================================
const YouTubeTimePicker = ({ startTime, onChange }) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const totalSeconds = getYouTubeStartTime(startTime);
    setHours(Math.floor(totalSeconds / 3600));
    setMinutes(Math.floor((totalSeconds % 3600) / 60));
    setSeconds(totalSeconds % 60);
  }, [startTime]);

  useEffect(() => {
    onChange(hours * 3600 + minutes * 60 + seconds);
  }, [hours, minutes, seconds]);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-4 p-4 bg-gradient-to-r from-yellow-50/70 to-orange-50/70 dark:from-yellow-900/30 dark:to-orange-900/30 border border-yellow-200 dark:border-yellow-800 rounded-none space-y-3"
    >
      <p className="text-xs font-black text-yellow-700 dark:text-yellow-400 leading-none">
        Kustom Waktu Mulai Video
      </p>
      <p className="text-[10px] text-yellow-500 dark:text-yellow-400 font-medium">
        Video akan dimulai dari waktu yang kamu pilih
      </p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Jam', value: hours, set: setHours, max: 23 },
          { label: 'Menit', value: minutes, set: setMinutes, max: 59 },
          { label: 'Detik', value: seconds, set: setSeconds, max: 59 },
        ].map(({ label, value, set, max }) => (
          <div key={label} className="space-y-1">
            <label className="block text-[9px] font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-wider text-center">
              {label}
            </label>
            <input
              type="number"
              min="0"
              max={max}
              value={value}
              onChange={(e) => set(Math.max(0, Math.min(max, parseInt(e.target.value) || 0)))}
              className="w-full p-2 text-center rounded-none bg-white dark:bg-slate-900 border border-yellow-200 dark:border-yellow-700 focus:border-yellow-400 font-mono text-sm font-bold text-slate-700 dark:text-white outline-none"
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================================
// AUTH MODAL
// ============================================================
const AuthModal = ({ isOpen, onClose, defaultTab = 'login', onAuthSuccess }) => {
  const [tab, setTab] = useState(defaultTab);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' });

  useEffect(() => { setTab(defaultTab); setError(''); setSuccess(''); }, [defaultTab, isOpen]);
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogin = async () => {
    setError('');
    if (!loginForm.email || !loginForm.password) return setError('Email dan password wajib diisi.');
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, loginForm);
      localStorage.setItem('token', res.data.token);
      onAuthSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Coba lagi.');
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    setError('');
    if (!registerForm.username || !registerForm.email || !registerForm.password)
      return setError('Semua field wajib diisi.');
    if (registerForm.password.length < 6) return setError('Password minimal 6 karakter.');
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, registerForm);
      setSuccess('Registrasi berhasil! Cek email untuk verifikasi PIN, lalu login.');
      setTab('login');
      setLoginForm({ email: registerForm.email, password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal. Coba lagi.');
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-lg"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center px-4 pointer-events-none"
          >
            <div className="relative overflow-hidden w-full md:max-w-md max-w-lg bg-white dark:bg-slate-900 rounded-none shadow-2xl border border-blue-100 dark:border-slate-800 pointer-events-auto">
              <div className="relative h-1.5 bg-gradient-to-r from-blue-400 via-violet-500 to-purple-500" />
              <div className="p-7 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white">
                      {tab === 'login' ? '👋 Masuk Dulu' : '🚀 Daftar Sekarang'}
                    </h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                      {tab === 'login'
                        ? 'Login agar donasi tercatat di riwayat kamu'
                        : 'Buat akun gratis dan mulai mendukung kreator'}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="absolute top-0 right-0 cursor-pointer w-10 h-10 bg-red-200 dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-700/80 hover:text-white text-red-700 dark:text-slate-500 flex items-center justify-center transition-all"
                  >
                    <X size={15} />
                  </button>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-none text-xs font-bold text-red-600 dark:text-red-400"
                    >
                      <X size={13} /> {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 rounded-none text-xs font-bold text-green-700 dark:text-green-400"
                    >
                      ✅ {success}
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {tab === 'login' ? (
                    <motion.div key="login" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="space-y-3">
                      <div className="relative">
                        <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" />
                        <input type="email" placeholder="Email kamu" value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                          className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-300 dark:focus:border-blue-500 rounded-none text-sm font-bold text-slate-700 dark:text-white outline-none transition-all" />
                      </div>
                      <div className="relative">
                        <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" />
                        <input type={showPass ? 'text' : 'password'} placeholder="Password" value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                          className="w-full pl-10 pr-10 py-3.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-300 rounded-none text-sm font-bold text-slate-700 dark:text-white outline-none transition-all" />
                        <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 hover:text-slate-500 transition-all">
                          {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={handleLogin} disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-none font-black text-sm cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 transition-all hover:brightness-85">
                        {loading ? <><Loader2 size={15} className="animate-spin" /> Masuk...</> : '→ Masuk Sekarang'}
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div key="register" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-3">
                      <div className="relative">
                        <AtSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" />
                        <input type="text" placeholder="Username" value={registerForm.username}
                          onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                          className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-300 rounded-none text-sm font-bold text-slate-700 dark:text-white outline-none transition-all" />
                      </div>
                      <div className="relative">
                        <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" />
                        <input type="email" placeholder="Email kamu" value={registerForm.email}
                          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-300 rounded-none text-sm font-bold text-slate-700 dark:text-white outline-none transition-all" />
                      </div>
                      <div className="relative">
                        <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" />
                        <input type={showPass ? 'text' : 'password'} placeholder="Password (min. 6 karakter)" value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          className="w-full pl-10 pr-10 py-3.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-300 rounded-none text-sm font-bold text-slate-700 dark:text-white outline-none transition-all" />
                        <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-all">
                          {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={handleRegister} disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-none font-black text-sm disabled:opacity-60 flex items-center justify-center gap-2 transition-all hover:brightness-110">
                        {loading ? <><Loader2 size={15} className="animate-spin" /> Mendaftar...</> : '🎉 Buat Akun Gratis'}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tab switch */}
                <div className="flex items-center justify-center gap-1 text-[11px]">
                  <span className="text-slate-400 dark:text-slate-500 font-medium">
                    {tab === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}
                  </span>
                  <button onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); }}
                    className="font-black text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                    {tab === 'login' ? 'Daftar gratis' : 'Masuk'}
                  </button>
                </div>

                <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  Dengan mendaftar, kamu menyetujui syarat & ketentuan Sawer.in
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ============================================================
// NAVBAR
// ============================================================
const SupporterNavbar = ({ onOpenAuth, authPayload, profile, onLogout, theme, toggleTheme }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef(null);
  const isLoggedIn = !!authPayload;
  const displayName  = profile?.username  || authPayload?.username  || '?';
  const displayEmail = profile?.email     || authPayload?.email     || '';

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-5 py-3">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-pink-200 rounded-none p-1.5 flex items-center justify-center">
            <img src="/jellyfish.png" alt="icon" />
          </div>
          <span className="font-black text-sm text-slate-800 dark:text-white tracking-tight">TapTipTup</span>
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme}
            className="cursor-pointer h-[40px] w-[40px] flex items-center justify-center rounded-none border bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-50 transition-all shadow-sm">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {isLoggedIn ? (
            <div className="relative" ref={dropRef}>
              <button onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 px-2 h-[40px] bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-none transition-all cursor-pointer border border-slate-200 dark:border-slate-700">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-violet-600 rounded-none flex items-center justify-center text-white font-black text-xs flex-shrink-0 overflow-hidden">
                  {profile?.profilePicture ? (
                    <img src={profile.profilePicture} alt={displayName} className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = displayName.charAt(0).toUpperCase(); }} />
                  ) : displayName.charAt(0).toUpperCase()}
                </div>
                <span className="font-black text-sm text-slate-700 dark:text-white hidden sm:block max-w-[130px] truncate">@{displayName}</span>
                <ChevronDown size={13} className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-none shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-none flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-800 dark:text-white text-sm truncate">@{displayName}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">{displayEmail}</p>
                      </div>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      <Link to="/dashboard" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-none transition-all text-sm font-bold text-slate-700 dark:text-slate-300">
                        <div className="w-7 h-7 bg-blue-50 dark:bg-blue-900/30 rounded-none flex items-center justify-center flex-shrink-0">
                          <User size={13} className="text-blue-500" />
                        </div>
                        Dashboard Saya
                      </Link>
                      <Link to="/dashboard?tab=myDonations" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-none transition-all text-sm font-bold text-slate-700 dark:text-slate-300">
                        <div className="w-7 h-7 bg-pink-50 dark:bg-pink-900/30 rounded-none flex items-center justify-center flex-shrink-0">
                          <Heart size={13} className="text-pink-500" />
                        </div>
                        Riwayat Berdonasi Saya
                      </Link>
                    </div>
                    <div className="p-1.5 border-t border-slate-100 dark:border-slate-800">
                      <button onClick={() => { setDropdownOpen(false); onLogout(); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-none transition-all text-sm font-bold text-red-500 dark:text-red-400 cursor-pointer">
                        <div className="w-7 h-7 bg-red-50 dark:bg-red-900/20 rounded-none flex items-center justify-center flex-shrink-0">
                          <LogOut size={13} className="text-red-400" />
                        </div>
                        Keluar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button onClick={() => onOpenAuth('login')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-none font-black text-sm hover:brightness-110 transition-all cursor-pointer active:scale-[0.98]">
              Masuk
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

// ============================================================
// MEDIA INPUT SECTION
// ============================================================
// const MediaInputSection = ({ trigger, mediaUrl, setMediaUrl, startTime, setStartTime }) => {
//   const [inputMode, setInputMode] = useState('url'); // 'url' | 'upload'
//   const [previewError, setPreviewError] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [uploadedFile, setUploadedFile] = useState(null); // { name, previewUrl, serverUrl }
//   const [uploadError, setUploadError] = useState('');
//   const fileInputRef = useRef(null);
//   const videoRef = useRef(null);
//   const isYouTube = isYouTubeUrl(mediaUrl);

//   useEffect(() => { setPreviewError(false); }, [mediaUrl]);

//   const mediaType = getMediaType(mediaUrl);
//   const hasPreview = mediaUrl && !previewError;
//   const allowImage = trigger.mediaType === 'image' || trigger.mediaType === 'both';
//   const allowVideo = trigger.mediaType === 'video' || trigger.mediaType === 'both';

//   const placeholderText =
//     allowImage && allowVideo
//       ? 'https://youtu.be/xxxx atau https://i.imgur.com/xxxx.jpg'
//       : allowVideo
//         ? 'https://youtu.be/xxxx atau https://example.com/video.mp4'
//         : 'https://i.imgur.com/contoh-gambar.jpg';

//   const getYouTubeEmbedUrlWithTime = (url, startSeconds = 0) => {
//     if (!url) return '';
//     // Live — jangan append start
//     if (/youtube\.com\/live\//i.test(url)) return getYouTubeEmbedUrl(url);
//     let embedUrl = getYouTubeEmbedUrl(url);
//     if (startSeconds > 0) {
//       const separator = embedUrl.includes('?') ? '&' : '?';
//       embedUrl += `${separator}start=${startSeconds}&autoplay=1&mute=1`;
//     }
//     return embedUrl;
//   };

//   const isYouTubeLive = isYouTubeUrl(mediaUrl) && /youtube\.com\/live\//i.test(mediaUrl);

//   return (
//     <div className="rounded-none border-2 border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-900/30 p-5 space-y-4">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-2.5">
//           <div className="w-7 h-7 rounded-none bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
//             {allowVideo && allowImage
//               ? <span className="flex items-center gap-0.5"><ImageIcon size={9} /><Video size={9} /></span>
//               : allowVideo ? <Video size={13} /> : <ImageIcon size={13} />}
//           </div>
//           <div>
//             <p className="text-xs font-black text-blue-700 dark:text-blue-400 leading-none">
//               🎉 {trigger.label || 'Media Alert'} Unlocked!
//             </p>
//             <p className="text-[10px] text-blue-400 dark:text-blue-500 font-medium mt-0.5">
//               Tersedia mulai Rp {Number(trigger.minAmount).toLocaleString('id-ID')}
//             </p>
//           </div>
//         </div>
//         {mediaUrl && (
//           <button onClick={() => { setMediaUrl(''); setStartTime(0); }}
//             className="w-6 h-6 rounded-none bg-blue-100 dark:bg-blue-900 hover:bg-red-100 dark:hover:bg-red-900 text-blue-400 flex items-center justify-center transition-all hover:text-red-500">
//             <X size={12} />
//           </button>
//         )}
//       </div>

//       {/* Badge tipe media */}
//       <div className="flex items-center gap-2">
//         {allowImage && (
//           <span className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-800 rounded-none text-[10px] font-bold text-blue-600 dark:text-blue-400">
//             <ImageIcon size={10} /> Animasi GIF
//           </span>
//         )}
//         {allowVideo && (
//           <span className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-900 border border-blue-100 dark:border-purple-800 rounded-none text-[10px] font-bold text-purple-600 dark:text-purple-400">
//             <Video size={10} /> Video YouTube
//           </span>
//         )}
//       </div>

//       {/* Input URL */}
//       <div className="space-y-1.5">
//         <label className="block text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest ml-1">
//           Link Media (YouTube)
//         </label>
//         <input
//           type="url"
//           value={mediaUrl}
//           onChange={(e) => { setMediaUrl(e.target.value); setStartTime(0); }}
//           className="w-full p-4 rounded-none bg-white dark:bg-slate-900 border-2 border-blue-100 dark:border-blue-800 focus:border-blue-400 outline-none font-mono text-xs text-slate-700 dark:text-white font-bold transition-all placeholder:font-sans placeholder:text-slate-400"
//           placeholder={placeholderText}
//         />
//         <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium ml-1">
//           * Opsional — Gambar (jpg, gif, png), Video (.mp4), atau YouTube
//         </p>
//       </div>

//       {/* YouTube time picker */}
//       <AnimatePresence>
//         {isYouTube && mediaUrl && !isYouTubeLive && (
//           <YouTubeTimePicker startTime={startTime} onChange={setStartTime} />
//         )}
//       </AnimatePresence>

//       <AnimatePresence>
//         {isYouTubeLive && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//             className="mt-3 px-3 py-2.5 bg-amber-900/30 border-amber-200 dark:border-amber-800 border border-amber-200 dark:border-amber-800 rounded-none flex items-center gap-2"
//           >
//             <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
//             <p className="text-[10px] font-black text-amber-600 dark:text-amber-400">
//               YouTube Live — akan diputar dari waktu terkini
//             </p>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Preview */}
//       <AnimatePresence>
//         {hasPreview && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.96 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.96 }}
//             transition={{ duration: 0.25 }}
//             className="rounded-none overflow-hidden border border-blue-100 dark:border-blue-800 bg-slate-900 relative"
//             style={{ maxHeight: 200 }}
//           >
//             {mediaType === 'youtube' ? (
//               <iframe
//                 src={getYouTubeEmbedUrlWithTime(mediaUrl, startTime)}
//                 className="w-full aspect-video"
//                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                 allowFullScreen
//                 onError={() => setPreviewError(true)}
//               />
//             ) : mediaType === 'video' ? (
//               <video ref={videoRef} src={mediaUrl} autoPlay muted loop playsInline
//                 className="w-full object-cover" style={{ maxHeight: 200 }}
//                 onError={() => setPreviewError(true)} />
//             ) : (
//               <img src={mediaUrl} alt="Media preview" className="w-full object-cover"
//                 style={{ maxHeight: 200 }} onError={() => setPreviewError(true)} />
//             )}
//             <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 bg-black/60 backdrop-blur-sm">
//               <p className="text-[10px] text-white/90 font-bold">
//                 {mediaType === 'youtube' ? (
//                   <>▶️ YouTube {startTime > 0 && (
//                     <span className="ml-1 bg-yellow-500/30 px-1 py-0.5 text-[9px]">
//                       {Math.floor(startTime / 60).toString().padStart(2, '0')}:{(startTime % 60).toString().padStart(2, '0')}
//                     </span>
//                   )}</>
//                 ) : mediaType === 'video' ? '🎬 Direct Video' : '🖼️ Gambar'}
//                 {' '}— Preview
//               </p>
//             </div>
//           </motion.div>
//         )}
//         {previewError && mediaUrl && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
//             className="rounded-none border border-red-100 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-xs text-red-500 font-bold flex items-center gap-2">
//             <X size={14} /> URL tidak valid atau media tidak dapat dimuat.
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };


const MediaInputSection = ({ trigger, mediaUrl, setMediaUrl, startTime, setStartTime }) => {
  const [inputMode, setInputMode] = useState('url'); // 'url' | 'upload'
  const [previewError, setPreviewError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null); // { name, previewUrl, serverUrl }
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const isYouTube = isYouTubeUrl(mediaUrl);

  useEffect(() => { setPreviewError(false); }, [mediaUrl]);

  const mediaType = getMediaType(mediaUrl);
  const hasPreview = mediaUrl && !previewError;
  const allowImage = trigger.mediaType === 'image' || trigger.mediaType === 'both';
  const allowVideo = trigger.mediaType === 'video' || trigger.mediaType === 'both';
  const isYouTubeLive = isYouTubeUrl(mediaUrl) && /youtube\.com\/live\//i.test(mediaUrl);

  const placeholderText =
    allowImage && allowVideo
      ? 'https://youtu.be/xxxx atau https://i.imgur.com/xxxx.jpg'
      : allowVideo
        ? 'https://youtu.be/xxxx atau https://example.com/video.mp4'
        : 'https://i.imgur.com/contoh-gambar.jpg';

  const getYouTubeEmbedUrlWithTime = (url, startSeconds = 0) => {
    if (!url) return '';
    if (/youtube\.com\/live\//i.test(url)) return getYouTubeEmbedUrl(url);
    let embedUrl = getYouTubeEmbedUrl(url);
    if (startSeconds > 0) {
      const separator = embedUrl.includes('?') ? '&' : '?';
      embedUrl += `${separator}start=${startSeconds}&autoplay=1&mute=1`;
    }
    return embedUrl;
  };

  const clearUpload = () => {
    if (uploadedFile?.previewUrl) URL.revokeObjectURL(uploadedFile.previewUrl);
    setUploadedFile(null);
    setMediaUrl('');
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleModeSwitch = (mode) => {
    setInputMode(mode);
    setMediaUrl('');
    setStartTime(0);
    setPreviewError(false);
    clearUpload();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 5MB');
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setUploadedFile({ name: file.name, previewUrl: localUrl, serverUrl: null });
    setUploadError('');
    setUploading(true);
    setMediaUrl('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await axios.post(`${BASE_URL}/api/midtrans/temp-upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadedFile({ name: file.name, previewUrl: localUrl, serverUrl: res.data.url });
      setMediaUrl(res.data.url);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload gagal, coba lagi');
      setUploadedFile(null);
      setMediaUrl('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-none border-2 border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-900/30 p-5 space-y-4">

      {/* Header — sama persis aslinya */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-none bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
            {allowVideo && allowImage
              ? <span className="flex items-center gap-0.5"><ImageIcon size={9} /><Video size={9} /></span>
              : allowVideo ? <Video size={13} /> : <ImageIcon size={13} />}
          </div>
          <div>
            <p className="text-xs font-black text-blue-700 dark:text-blue-400 leading-none">
              🎉 {trigger.label || 'Media Alert'} Unlocked!
            </p>
            <p className="text-[10px] text-blue-400 dark:text-blue-500 font-medium mt-0.5">
              Tersedia mulai Rp {Number(trigger.minAmount).toLocaleString('id-ID')}
            </p>
          </div>
        </div>
        {(mediaUrl || uploadedFile) && (
          <button
            onClick={() => handleModeSwitch(inputMode)}
            className="w-6 h-6 rounded-none bg-blue-100 dark:bg-blue-900 hover:bg-red-100 dark:hover:bg-red-900 text-blue-400 flex items-center justify-center transition-all hover:text-red-500"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Badge tipe media — sama persis aslinya */}
      <div className="flex items-center gap-2">
        {allowImage && (
          <span className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-800 rounded-none text-[10px] font-bold text-blue-600 dark:text-blue-400">
            <ImageIcon size={10} /> Animasi GIF
          </span>
        )}
        {allowVideo && (
          <span className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-900 border border-blue-100 dark:border-purple-800 rounded-none text-[10px] font-bold text-purple-600 dark:text-purple-400">
            <Video size={10} /> Video YouTube
          </span>
        )}
      </div>

      {/* Toggle URL / Upload — hanya muncul kalau allowImage */}
      {allowImage && (
        <div className="grid grid-cols-2 border border-blue-200 dark:border-blue-700 overflow-hidden">
          <button
            onClick={() => handleModeSwitch('url')}
            className={`flex items-center justify-center gap-1.5 py-2 text-[10px] font-black transition-all cursor-pointer ${
              inputMode === 'url'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800'
            }`}
          >
            <Video size={10} /> Link URL
          </button>
          <button
            onClick={() => handleModeSwitch('upload')}
            className={`flex items-center justify-center gap-1.5 py-2 text-[10px] font-black transition-all cursor-pointer border-l border-blue-200 dark:border-blue-700 ${
              inputMode === 'upload'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800'
            }`}
          >
            <ImageIcon size={10} /> Upload Gambar
          </button>
        </div>
      )}

      {/* ── MODE: URL (default, sama persis aslinya) ── */}
      {inputMode === 'url' && (
        <>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest ml-1">
              Link Media (YouTube)
            </label>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => { setMediaUrl(e.target.value); setStartTime(0); }}
              className="w-full p-4 rounded-none bg-white dark:bg-slate-900 border-2 border-blue-100 dark:border-blue-800 focus:border-blue-400 outline-none font-mono text-xs text-slate-700 dark:text-white font-bold transition-all placeholder:font-sans placeholder:text-slate-400"
              placeholder={placeholderText}
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium ml-1">
              * Opsional — Gambar (jpg, gif, png), Video (.mp4), atau YouTube
            </p>
          </div>

          <AnimatePresence>
            {isYouTube && mediaUrl && !isYouTubeLive && (
              <YouTubeTimePicker startTime={startTime} onChange={setStartTime} />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isYouTubeLive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 px-3 py-2.5 bg-amber-900/30 border border-amber-800 rounded-none flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                <p className="text-[10px] font-black text-amber-600 dark:text-amber-400">
                  YouTube Live — akan diputar dari waktu terkini
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Preview URL — sama persis aslinya */}
          <AnimatePresence>
            {hasPreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="rounded-none overflow-hidden border border-blue-100 dark:border-blue-800 bg-slate-900 relative"
                style={{ maxHeight: 200 }}
              >
                {mediaType === 'youtube' ? (
                  <iframe
                    src={getYouTubeEmbedUrlWithTime(mediaUrl, startTime)}
                    className="w-full aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onError={() => setPreviewError(true)}
                  />
                ) : mediaType === 'video' ? (
                  <video ref={videoRef} src={mediaUrl} autoPlay muted loop playsInline
                    className="w-full object-cover" style={{ maxHeight: 200 }}
                    onError={() => setPreviewError(true)} />
                ) : (
                  <img src={mediaUrl} alt="Media preview" className="w-full object-cover"
                    style={{ maxHeight: 200 }} onError={() => setPreviewError(true)} />
                )}
                <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 bg-black/60 backdrop-blur-sm">
                  <p className="text-[10px] text-white/90 font-bold">
                    {mediaType === 'youtube' ? (
                      <>▶️ YouTube {startTime > 0 && (
                        <span className="ml-1 bg-yellow-500/30 px-1 py-0.5 text-[9px]">
                          {Math.floor(startTime / 60).toString().padStart(2, '0')}:{(startTime % 60).toString().padStart(2, '0')}
                        </span>
                      )}</>
                    ) : mediaType === 'video' ? '🎬 Direct Video' : '🖼️ Gambar'}
                    {' '}— Preview
                  </p>
                </div>
              </motion.div>
            )}
            {previewError && mediaUrl && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-none border border-red-100 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-xs text-red-500 font-bold flex items-center gap-2">
                <X size={14} /> URL tidak valid atau media tidak dapat dimuat.
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ── MODE: UPLOAD ── */}
      {inputMode === 'upload' && (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          {!uploadedFile ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-none py-8 flex flex-col items-center gap-3 cursor-pointer hover:border-blue-500 hover:bg-blue-50/80 dark:hover:bg-blue-900/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 size={24} className="animate-spin text-blue-500" />
                  <span className="text-xs font-black text-blue-500">Mengupload...</span>
                </>
              ) : (
                <>
                  <ImageIcon size={24} className="text-blue-400" />
                  <div className="text-center">
                    <p className="text-xs font-black text-blue-600 dark:text-blue-400">Klik untuk pilih gambar</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1">JPG, PNG, GIF, WebP — maks 5MB</p>
                    <p className="text-[10px] text-amber-500 font-bold mt-1.5">⏱ Otomatis terhapus setelah 15 menit</p>
                  </div>
                </>
              )}
            </button>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-2"
              >
                {/* Preview gambar upload */}
                <div
                  className="relative rounded-none overflow-hidden border border-blue-200 dark:border-blue-700 bg-slate-900"
                  style={{ maxHeight: 200 }}
                >
                  <img
                    src={uploadedFile.previewUrl}
                    alt="preview"
                    className="w-full object-cover"
                    style={{ maxHeight: 200 }}
                  />
                  <button
                    onClick={clearUpload}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-red-600 text-white rounded-none flex items-center justify-center transition-all"
                  >
                    <X size={13} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 bg-black/60 backdrop-blur-sm flex items-center justify-between">
                    <p className="text-[10px] text-white/90 font-bold truncate max-w-[70%]">
                      🖼️ {uploadedFile.name}
                    </p>
                    {uploadedFile.serverUrl ? (
                      <span className="text-[10px] text-green-400 font-black">✓ Terupload</span>
                    ) : (
                      <span className="text-[10px] text-yellow-400 font-black flex items-center gap-1">
                        <Loader2 size={10} className="animate-spin" /> Uploading...
                      </span>
                    )}
                  </div>
                </div>

                {/* Warning 15 menit */}
                {uploadedFile.serverUrl && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-none">
                    <span className="text-amber-500 flex-shrink-0">⏱</span>
                    <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      Gambar otomatis terhapus dari server dalam 15 menit
                    </p>
                  </div>
                )}

                {/* Ganti gambar */}
                <button
                  onClick={() => { clearUpload(); setTimeout(() => fileInputRef.current?.click(), 100); }}
                  className="w-full py-2 text-[10px] font-black text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer rounded-none"
                >
                  Ganti Gambar
                </button>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Error */}
          <AnimatePresence>
            {uploadError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-none text-[10px] font-bold text-red-500"
              >
                <X size={12} /> {uploadError}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

// ============================================================
// QUICK AUDIO SECTION
// ============================================================
const QuickAudioSection = ({ publicSounds = [], selectedSound, onSoundChange, amount }) => {
  const safePublicSounds = Array.isArray(publicSounds) ? publicSounds.slice(0, 7) : [];
  const audioRef = useRef(null);
  const [previewing, setPreviewing] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const timeoutRef = useRef(null);

  const getAudioProxyUrl = useCallback((url) => {
    if (!url) return '';
    if (
      url.includes('cloudinary.com') || url.includes('res.cloudinary.com') ||
      url.includes('/uploads/') || url.includes('railway.app') || url.includes(window.location.origin)
    ) return url;
    return `/api/overlay/proxy-audio?url=${encodeURIComponent(url)}`;
  }, []);

  const stopPreview = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    setPreviewing(null);
    setPreviewError(null);
  }, []);

  const playPreview = useCallback((originalUrl) => {
    stopPreview();
    const proxyUrl = getAudioProxyUrl(originalUrl);
    if (!proxyUrl || !audioRef.current) return;
    audioRef.current.src = proxyUrl;
    audioRef.current.currentTime = 0;
    setPreviewError(null);
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.then(() => setPreviewing(originalUrl)).catch(() => setPreviewError(originalUrl));
    } else { setPreviewing(originalUrl); }
    timeoutRef.current = setTimeout(() => stopPreview(), 5000);
    audioRef.current.onended = () => stopPreview();
    audioRef.current.onerror = () => { setPreviewError(originalUrl); stopPreview(); };
  }, [getAudioProxyUrl, stopPreview]);

  useEffect(() => () => stopPreview(), [stopPreview]);

  if (safePublicSounds.length === 0 || amount === 0) return null;

  return (
    <div className="space-y-3">
      <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
        Pilih Suara Notif 🎵
      </label>
      <div className="grid grid-cols-3 md:grid-cols-2 gap-2">
        <button
          onClick={() => { onSoundChange(''); stopPreview(); }}
          className={`group p-2.5 rounded-none border-2 font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer active:scale-[0.99] hover:bg-slate-900 ${
            !selectedSound
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 shadow-sm'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-blue-300'
          }`}
        >
          <span className="text-lg">🔇</span>
          <span className="leading-tight text-slate-900 dark:text-white text-xs">No Sound</span>
        </button>
        {safePublicSounds.map((sound, i) => {
          const isPlaying = previewing === sound.url;
          const hasError = previewError === sound.url;
          return (
            <button
              key={`${sound.url}-${i}`}
              onClick={() => { if (hasError) return; playPreview(sound.url); onSoundChange(sound.url); }}
              disabled={hasError}
              className={`group relative p-2.5 pb-3 rounded-none border-2 font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer active:scale-[0.99] disabled:cursor-not-allowed overflow-hidden ${
                selectedSound === sound.url
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 shadow-sm'
                  : hasError
                    ? 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-500'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30'
              }`}
            >
              {isPlaying && (
                <motion.div layoutId="playing-overlay"
                  className="absolute inset-0 bg-gradient-to-br from-emerald-400/40 to-green-500/40 backdrop-blur-sm border-2 border-emerald-400 z-10 flex items-center justify-center"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <span className="text-xs font-bold text-emerald-900 drop-shadow-sm">🔊</span>
                </motion.div>
              )}
              {hasError && (
                <div className="absolute inset-0 bg-gradient-to-br from-red-400/40 to-rose-500/40 backdrop-blur-sm border-2 border-red-400 z-10 flex items-center justify-center">
                  <span className="text-xs font-bold text-red-900">⚠</span>
                </div>
              )}
              <span className="text-lg relative z-20">{sound.emoji || '🎵'}</span>
              <span className="leading-tight text-slate-900 dark:text-white relative z-20 truncate max-w-[80%] text-xs font-medium">
                {sound.label || `S${i + 1}`}
              </span>
            </button>
          );
        })}
      </div>
      <audio ref={audioRef} preload="metadata" crossOrigin="anonymous" className="hidden" />
    </div>
  );
};

// ============================================================
// TAB SELECTOR COMPONENT
// ============================================================
const DonationTabs = ({ activeTab, onTabChange, mediaTriggers, amount, minDonate }) => {
  const minMedia = mediaTriggers.length > 0
    ? Math.min(...mediaTriggers.map(t => t.minAmount))
    : null;

  const tabs = [
    {
      id: 'alert',
      label: 'Alert',
      icon: Bell,
      locked: false,
      lockMsg: null,
      desc: 'Donasi + suara notif',
    },
    {
      id: 'mediashare',
      label: 'Media Share',
      icon: Film,
      locked: minMedia === null, // locked kalau tidak ada trigger sama sekali
      lockMsg: minMedia ? `Min. Rp ${formatRp(minMedia)}` : 'Tidak tersedia',
      desc: 'Kirim video / gambar',
      warning: minMedia !== null && amount < minMedia,
      warningMsg: minMedia ? `Perlu Rp ${Number(minMedia).toLocaleString('id-ID')}` : null,
    },
    {
      id: 'voice',
      label: 'Voice',
      icon: Mic,
      locked: false,
      lockMsg: null,
      desc: 'Rekam pesan suara',
      warning: amount < minDonate,
      warningMsg: `Perlu Rp ${Number(minDonate).toLocaleString('id-ID')}`,
    },
  ];

  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
        Tipe Donasi
      </label>
      <div className="grid grid-cols-3 border border-slate-300/20 rounded-none overflow-hidden">
        {tabs.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const isLocked = tab.locked;
          const hasWarning = tab.warning && !isActive;

          return (
            <button
              key={tab.id}
              onClick={() => !isLocked && onTabChange(tab.id)}
              disabled={isLocked}
              className={`
                relative flex flex-col items-center justify-center gap-1 py-3 px-1
                text-[10px] font-black transition-all cursor-pointer select-none
                ${isLocked
                  ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900/50'
                  : isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }
              `}
            >
              <Icon size={15} className={isActive ? 'text-white' : isLocked ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500'} />
              <span className={isActive ? 'text-white' : ''}>{tab.label}</span>
              {isLocked && (
                <span className="text-[8px] opacity-60 font-medium">🔒 {tab.lockMsg}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const SupporterPage = () => {
  const { username } = useParams();
  const [streamer, setStreamer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snapReady, setSnapReady] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [startTime, setStartTime] = useState(0);
  const { theme, toggle: toggleTheme } = useTheme();
  const [feeBearer, setFeeBearer] = useState('streamer');
  const [ytChecking, setYtChecking] = useState(false);
  const [ytBlockedReason, setYtBlockedReason] = useState(null);
  const { maintenance } = useMaintenance();

  // ── Tab state ──────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('alert'); // 'alert' | 'mediashare' | 'voice'

  const [form, setForm] = useState({
    donorName: '',
    isAnonymous: false,
    email: '',
    amount: 0,
    voiceUrl: '',
    message: '',
    soundUrl: '',
  });

  const [authPayload, setAuthPayload] = useState(getPayload());
  const [authProfile, setAuthProfile] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [badges, setBadges] = useState({ streamer: {}, donor: {} });

  const isLoggedIn = !!authPayload;

  const openAuth = (tab = 'login') => { setAuthModalTab(tab); setAuthModalOpen(true); };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthPayload(null);
    setAuthProfile(null);
    setForm((prev) => ({ ...prev, donorName: '', email: '' }));
  };

  useEffect(() => {
    setYtBlockedReason(null);
    if (!mediaUrl || !isYouTubeUrl(mediaUrl)) return;

    const timeout = setTimeout(async () => {
      try {
        setYtChecking(true);
        const res = await axios.get(`${BASE_URL}/api/youtube-check`, {
          params: { url: mediaUrl },
        });
        if (!res.data.safe) {
          setYtBlockedReason(res.data.reason || 'Video tidak dapat ditampilkan');
        }
      } catch {
        // gagal check → tidak diblokir
      } finally {
        setYtChecking(false);
      }
    }, 800); // debounce 800ms

    return () => clearTimeout(timeout);
  }, [mediaUrl]);

  // if (maintenance?.supporter) return (
  //   <MaintenanceScreen title="Halaman donasi - maintenance" subtitle="Sementara kamu tidak bisa mengirim donasi. Coba lagi beberapa saat lagi." />
  // );

  const handleAuthSuccess = async (data) => {
    const newPayload = getPayload();
    setAuthPayload(newPayload);
    if (data?.user) {
      setAuthProfile(data.user);
      setForm((prev) => ({ ...prev, donorName: data.user.username || prev.donorName, email: data.user.email || prev.email }));
    }
    if (newPayload?.id) {
      try {
        const res = await axios.get(`${BASE_URL}/api/midtrans/badges`, { headers: authHeader() });
        setBadges(res.data.badges || { streamer: {}, donor: {} });
      } catch { /* silently fail */ }
    }
  };

  // Load Midtrans Snap.js
  useEffect(() => {
    const existing = document.querySelector('script[src*="snap.js"]');
    if (existing) { setSnapReady(true); return; }
    const script = document.createElement('script');
    script.src = SNAP_URL;
    script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
    script.onload = () => setSnapReady(true);
    document.head.appendChild(script);
  }, []);

  // Fetch streamer
  useEffect(() => {
    if (!username) return;
    const cleanUsername = username.replace(/^@+/, '');
    axios.get(`${BASE_URL}/api/overlay/public/${cleanUsername}`)
      .then((res) => setStreamer(res.data))
      .catch(() => alert('Streamer tidak ditemukan'));
  }, [username]);

  // Fetch profil jika sudah login
  useEffect(() => {
    if (!isLoggedIn) return;
    axios.get(`${BASE_URL}/api/overlay/settings`, { headers: authHeader() })
      .then((r) => {
        const u = r.data?.user || r.data?.User;
        if (u) {
          setAuthProfile(u);
          setForm((prev) => ({ ...prev, donorName: u.username || prev.donorName, email: u.email || prev.email }));
        }
      })
      .catch(() => {});
  }, [isLoggedIn]);

  // Fetch badges
  useEffect(() => {
    if (!isLoggedIn || !authPayload?.id) return;
    axios.get(`${BASE_URL}/api/midtrans/badges`, { headers: authHeader() })
      .then((res) => setBadges(res.data.badges || { streamer: {}, donor: {} }))
      .catch(() => {});
  }, [isLoggedIn, authPayload?.id]);

  const mediaTriggers = streamer?.overlaySetting?.mediaTriggers || streamer?.OverlaySetting?.mediaTriggers || [];
  const eligibleTrigger = getEligibleTrigger(mediaTriggers, form.amount);

  // Reset mediaUrl kalau trigger hilang
  useEffect(() => {
    if (!eligibleTrigger) { setMediaUrl(''); setStartTime(0); }
  }, [eligibleTrigger]);

  useEffect(() => {
    setYtBlockedReason(null);
    setYtChecking(false);
  }, [activeTab]);

  useEffect(() => {
    if (streamer) {
      const fb = streamer.feeBearer || streamer.overlaySetting?.feeBearer || 'streamer';
      setFeeBearer(fb);
    }
  }, [streamer]);

  // Hitung total yang harus dibayar donor
  const donorTotalAmount = useMemo(() => {
    if (!form.amount) return 0;
    const percentFee = Math.round(form.amount * 0.025);
    return feeBearer === 'donor' ? form.amount + percentFee : form.amount;
  }, [form.amount, feeBearer]);

  // Update tombol submit
  const submitButtonText = loading 
    ? "Memproses..." 
    : `Kirim Donasi Rp ${donorTotalAmount.toLocaleString('id-ID')}`;

  // ── Handle Donate ──────────────────────────────────────────
  const handleDonate = async () => {
    const overlaySetting = streamer?.overlaySetting || streamer?.OverlaySetting || {};
    const minDonate = overlaySetting?.minDonate || 1000;
    const maxDonate = overlaySetting?.maxDonate || 10000000;
    if (!isLoggedIn) {
      if (!form.donorName?.trim()) {
        return alert('Nama wajib diisi untuk donasi sebagai tamu');
      }
      if (!form.email?.trim()) {
        return alert('Email wajib diisi untuk donasi sebagai tamu');
      }
      // Validasi format email
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(form.email.trim())) {
        return alert('Format email tidak valid');
      }
    }

    if (!form.amount || form.amount < minDonate)
      return alert(`Minimal donasi Rp ${minDonate.toLocaleString('id-ID')}`);
    if (form.amount > maxDonate)
      return alert(`Maksimal donasi Rp ${maxDonate.toLocaleString('id-ID')}`);
    if (!form.message.trim() && activeTab !== 'voice')
      return alert('Pesan dukungan tidak boleh kosong');
    if (!streamer?._id) return alert('Data streamer belum siap.');

    if (activeTab === 'mediashare') {
      const minMedia = mediaTriggers.length > 0 ? Math.min(...mediaTriggers.map(t => t.minAmount)) : null;
      if (minMedia && form.amount < minMedia)
        return alert(`Media Share butuh minimal Rp ${minMedia.toLocaleString('id-ID')}`);
      if (!mediaUrl.trim())
        return alert('Link media wajib diisi untuk Media Share');
    }

    if (activeTab === 'voice' && !form.voiceUrl?.trim())
      return alert('Rekam atau upload voice message dulu');

    try {
      setLoading(true);

      const isMediaShareTab = activeTab === 'mediashare';
      const hasMedia = isMediaShareTab && mediaUrl.trim();
      const detectedMediaType = hasMedia ? getMediaType(mediaUrl.trim()) : null;

      if (hasMedia && eligibleTrigger) {
        if (eligibleTrigger.mediaType === 'image' && detectedMediaType !== 'image') {
          return alert('Hanya gambar yang diizinkan untuk nominal ini.');
        }
        if (eligibleTrigger.mediaType === 'video' && !['video', 'youtube'].includes(detectedMediaType)) {
          return alert('Hanya video atau YouTube yang diizinkan untuk nominal ini.');
        }
      }

      const payload = {
        amount:       Math.round(Number(form.amount)),     // nominal input
        donorName:    form.isAnonymous ? 'Anonim' : form.donorName || 'Anonim',
        message:      form.message,
        userId:       streamer._id,
        email:        form.email.trim() || 'guest@mail.com',
        donorUserId:  authPayload?.id,
        mediaUrl:     hasMedia ? mediaUrl.trim() : null,
        mediaType:    detectedMediaType,
        isMediaShare: isMediaShareTab,
        startTime: hasMedia && isYouTubeUrl(mediaUrl) && !/youtube\.com\/live\//i.test(mediaUrl)
          ? startTime
          : 0,
        soundUrl:     activeTab === 'alert' ? (form.soundUrl || null) : null,
        voiceUrl:     activeTab === 'voice' ? (form.voiceUrl || null) : null,
      };

      const res = await axios.post(`${BASE_URL}/api/midtrans/create-invoice`, payload);

      if (res.data.token && snapReady && window.snap) {
        window.snap.pay(res.data.token, {
          onSuccess: () => (window.location.href = `/donation/success?username=${streamer.username}`),
          onPending: () => (window.location.href = `/donation/pending?username=${streamer.username}`),
          onError:   () => alert('Pembayaran gagal.'),
          onClose:   () => {},
        });
      } else {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Gagal membuat invoice.';
      alert(msg);  // Donor akan lihat: "Video tidak dapat ditampilkan: Video dibatasi usia (18+)"
    } finally {
      setLoading(false);
    }
  };

  if (!streamer) {
    return (
      <>
        <SupporterNavbar onOpenAuth={openAuth} authPayload={authPayload} profile={authProfile} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
        <div className="min-h-screen flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-900 pt-16">
          <Loader2 className="animate-spin mr-2" size={24} /> Memuat Profil...
        </div>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultTab={authModalTab} onAuthSuccess={handleAuthSuccess} />
      </>
    );
  }

  const overlaySetting = streamer?.overlaySetting || streamer?.OverlaySetting || {};
  const minDonate  = overlaySetting?.minDonate  || 1000;
  const maxDonate  = overlaySetting?.maxDonate  || 10000000;

  if (maintenance?.supporter) return (
    <MaintenanceScreen title="Halaman donasi - maintenance" subtitle="Sementara kamu tidak bisa mengirim donasi. Coba lagi beberapa saat lagi." />
  );

  const quickAmounts = (
    streamer?.overlaySetting?.quickAmounts ||
    streamer?.OverlaySetting?.quickAmounts ||
    [10000, 25000, 50000, 100000]
  ).filter((v) => v >= minDonate && v <= maxDonate);

  const sortedTriggers = [...mediaTriggers].sort((a, b) => a.minAmount - b.minAmount);

  const publicSounds = Array.isArray(streamer?.overlaySetting?.publicSounds)
    ? streamer.overlaySetting.publicSounds
    : Array.isArray(streamer?.publicSounds) ? streamer.publicSounds : [];

  const minMedia = mediaTriggers.length > 0
    ? Math.min(...mediaTriggers.map(t => t.minAmount))
    : null;

  // ── Validasi tombol submit ─────────────────────────────────
  const isSubmitDisabled = (() => {
    if (loading) return true;
    if (ytChecking) return true;          // ← tambah
    if (ytBlockedReason) return true;     // ← tambah
    if (!form.amount || form.amount < minDonate) return true;
    if (!form.message.trim() && activeTab !== 'voice') return true;

    // ⬅️ TAMBAHKAN INI - Validasi nama & email kalau belum login
    if (!isLoggedIn) {
      if (!form.donorName?.trim()) return true;
      if (!form.email?.trim()) return true;
    }

    if (activeTab === 'mediashare') {
      if (!eligibleTrigger) return true;
      if (!mediaUrl.trim()) return true;
    }

    if (activeTab === 'voice') {
      if (!form.voiceUrl?.trim()) return true;
    }

    return false;
  })();

  // ── Hint teks kenapa tombol disabled ──────────────────────
  const submitHint = (() => {
    if (ytChecking) return 'Mengecek video YouTube...';           // ← tambah
    if (ytBlockedReason) return `Video diblokir: ${ytBlockedReason}`; // ← tambah
    if (!form.amount || form.amount < minDonate)
      return `Masukkan nominal min. Rp ${Number(minDonate).toLocaleString('id-ID')}`;
    if (!form.message.trim() && activeTab !== 'voice') // ← UBAH INI
      return 'Pesan dukungan tidak boleh kosong';
    if (activeTab === 'mediashare') {
      if (!eligibleTrigger)
        return `Nominal min. Rp ${Number(minMedia).toLocaleString('id-ID')} untuk Media Share`;
      if (!mediaUrl.trim())
        return 'Link media wajib diisi untuk Media Share';
    }
    if (activeTab === 'voice' && !form.voiceUrl?.trim())
      return 'Rekam atau upload voice message dulu';
    return null;
  })();

  return (
    <>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultTab={authModalTab} onAuthSuccess={handleAuthSuccess} />
      <SupporterNavbar onOpenAuth={openAuth} authPayload={authPayload} profile={authProfile} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-violet-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex justify-center items-start md:items-center p-4 md:p-6 font-sans pt-20 md:pt-24">
        <div className="w-full max-w-xl space-y-5 py-4 md:py-0">

          {/* ── Header Card ── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 px-8 pt-8 pb-6 rounded-none shadow-xl shadow-blue-100/50 dark:shadow-slate-800/50 text-center border border-blue-100 dark:border-slate-800 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 via-violet-500 to-purple-500" />
            <div className="w-20 h-20 mt-2 mx-auto rounded-none overflow-hidden bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-5xl font-black shadow-lg mb-4 border-4 border-white dark:border-slate-900">
              {streamer?.profilePicture ? (
                <img src={streamer.profilePicture} alt={streamer.username} className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = streamer.username?.charAt(0).toUpperCase() || '?'; }} />
              ) : (streamer.username?.charAt(0).toUpperCase() || '?')}
            </div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">@{streamer.username}</h1>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">{streamer.donateIntro || 'Support aku biar makin semangat 🚀'}</p>

            {isLoggedIn ? (
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-none text-[10px] font-black text-green-700 dark:text-green-400">
                ✓ Donasi akan tercatat di riwayat akun kamu
              </div>
            ) : (
              <div className="mt-4 flex items-center justify-center gap-1.5">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Punya akun?</span>
                <button onClick={() => openAuth('login')} className="text-[10px] font-black text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                  Masuk dulu
                </button>
              </div>
            )}

            {isLoggedIn && (
              <div className="w-max flex flex-wrap gap-1.5 justify-center h-max mx-auto text-center mt-6">
                {badges.streamer?.['10k'] && <Badge type="streamer" name="10k" active />}
                {badges.streamer?.['50k'] && <Badge type="streamer" name="50k" active />}
                {badges.streamer?.['100k'] && <Badge type="streamer" name="100k" active />}
                {badges.streamer?.['500k'] && <Badge type="streamer" name="500k" active />}
                {badges.streamer?.['1jt'] && <Badge type="streamer" name="1jt" active />}
                {badges.donor?.['1x'] && <Badge type="donor" name="1x" active />}
                {badges.donor?.['5x'] && <Badge type="donor" name="5x" active />}
                {badges.donor?.['10k'] && <Badge type="donor" name="10k" active />}
                {badges.donor?.['50k'] && <Badge type="donor" name="50k" active />}
              </div>
            )}
          </motion.div>

          {/* ── Form Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-transparent md:bg-white dark:md:bg-slate-900 p-0 md:p-7 rounded-none shadow-xl shadow-blue-100/50 dark:shadow-slate-800/50 md:border border-blue-100 dark:border-slate-800 space-y-5"
          >

            {/* Quick Amounts */}
            {quickAmounts.length > 0 && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-1">
                  Pilih Nominal Cepat
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {quickAmounts.map((val) => (
                    <button
                      key={val}
                      onClick={() => setForm({ ...form, amount: val })}
                      className={`cursor-pointer py-4 rounded-none font-black text-sm transition-all border-2 active:scale-[0.99] ${
                        form.amount === val
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Rp {val.toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Amount */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">
                Nominal Kustom
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-blue-600 dark:text-blue-400 text-sm">Rp</span>
                <input
                  type="number"
                  value={form.amount || ''}
                  onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                  className="w-full p-4 pl-12 rounded-none font-black text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-300 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all"
                  placeholder="Nominal Kustom..."
                />
              </div>

              {/* Trigger hints */}
              {sortedTriggers.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {sortedTriggers.map((t, i) => {
                    const reached = form.amount >= t.minAmount;
                    const isNext = !reached && (i === 0 || form.amount >= sortedTriggers[i - 1]?.minAmount);
                    if (!reached && !isNext) return null;
                    return (
                      <div key={i} className={`flex items-center gap-2 text-[10px] font-bold px-2 py-1.5 rounded-none ${
                        reached ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-slate-50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500'
                      }`}>
                        <span>{reached ? '✅' : '🔒'}</span>
                        <span>
                          {reached
                            ? <>{t.label || 'Media Alert'} unlocked!</>
                            : <>Donasi Rp {Number(t.minAmount).toLocaleString('id-ID')} untuk unlock {t.label}</>}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Nama & Email ── */}
            {
              !isLoggedIn && (

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">

                      Nama 
                    </label>
                    <input
                      type="text"
                      disabled={form.isAnonymous || isLoggedIn}
                      value={form.isAnonymous ? '' : form.donorName}
                      onChange={(e) => setForm({ ...form, donorName: e.target.value })}
                      required={!isLoggedIn && !form.isAnonymous}  // ⬅️ TAMBAHKAN INI
                      className="w-full p-4 rounded-none bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-300 dark:focus:border-blue-500 disabled:opacity-40 outline-none transition-all text-slate-700 dark:text-white"
                      placeholder="Nama kamu"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">

                      Email 
                    </label>
                    <input
                      type="email"
                      disabled={isLoggedIn}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required={!isLoggedIn}  // ⬅️ TAMBAHKAN INI
                      className="w-full p-4 rounded-none bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-300 dark:focus:border-blue-500 disabled:opacity-40 outline-none transition-all text-slate-700 dark:text-white"
                      placeholder="email@kamu.com"
                    />
                  </div>
                </div>
              )
            }

            {/* ═══════════════════════════════════════════════
                TAB SELECTOR
            ════════════════════════════════════════════════ */}
            <DonationTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              mediaTriggers={mediaTriggers}
              amount={form.amount}
              minDonate={minDonate}
            />

            {/* Message — hide kalau tab voice */}
            {activeTab !== 'voice' && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">
                  Pesan Dukungan
                </label>
                <textarea
                  value={form.message}
                  rows={4}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full p-4 rounded-none bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-300 dark:focus:border-blue-500 min-h-[90px] outline-none transition-all resize-none text-slate-700 dark:text-white dark:placeholder:text-slate-500"
                  placeholder="Semangat terus bang! 🔥"
                />
              </div>
            )}

            {/* TAB CONTENT */}
            <AnimatePresence mode="wait">

              {/* ── TAB: ALERT ── */}
              {activeTab === 'alert' && (
                <motion.div
                  key="tab-alert"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {publicSounds.length > 0 && form.amount >= minDonate ? (
                    <QuickAudioSection
                      publicSounds={publicSounds}
                      selectedSound={form.soundUrl}
                      onSoundChange={(url) => setForm({ ...form, soundUrl: url })}
                      amount={form.amount}
                    />
                  ) : form.amount > 0 && form.amount < minDonate ? (
                    <div className="flex items-center gap-3 px-4 py-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-700 rounded-none">
                      <Bell size={18} className="text-slate-300 dark:text-slate-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-black text-slate-500 dark:text-slate-400">Donasi Alert Biasa</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                          Masukkan nominal min. Rp {Number(minDonate).toLocaleString('id-ID')} untuk aktifkan pilihan suara
                        </p>
                      </div>
                    </div>
                  ) : publicSounds.length === 0 ? (
                    <div className="flex items-center gap-3 px-4 py-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-700 rounded-none">
                      <Bell size={18} className="text-slate-300 dark:text-slate-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-black text-slate-500 dark:text-slate-400">Donasi Alert Biasa</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                          Notifikasi donasi akan muncul di OBS streamer
                        </p>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              )}

              {/* ── TAB: MEDIA SHARE ── */}
              {activeTab === 'mediashare' && (
                <motion.div
                  key="tab-mediashare"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {mediaTriggers.length === 0 ? (
                    <div className="flex items-center gap-3 px-4 py-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-700 rounded-none">
                      <Film size={18} className="text-slate-300 dark:text-slate-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-black text-slate-500 dark:text-slate-400">Media Share Tidak Tersedia</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                          Streamer belum mengaktifkan fitur Media Share
                        </p>
                      </div>
                    </div>
                  ) : !eligibleTrigger ? (
                    // Nominal belum cukup — warning
                    <div className="flex items-center gap-3 px-4 py-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-none">
                      <span className="text-2xl flex-shrink-0">🔒</span>
                      <div>
                        <p className="text-xs font-black text-amber-700 dark:text-amber-400">
                          Nominal belum cukup untuk Media Share
                        </p>
                        <p className="text-[10px] text-amber-500 dark:text-amber-500 font-medium mt-0.5">
                          Donasi minimal Rp {Number(minMedia).toLocaleString('id-ID')} untuk mengirim media
                        </p>
                        <button
                          onClick={() => setForm({ ...form, amount: minMedia })}
                          className="mt-2 px-3 py-1 bg-amber-500 text-white text-[10px] font-black rounded-none hover:bg-amber-600 transition-all cursor-pointer"
                        >
                          Set Rp {Number(minMedia).toLocaleString('id-ID')}
                        </button>
                      </div>
                    </div>
                  ) : (
                  <>
                    <MediaInputSection
                      trigger={eligibleTrigger}
                      mediaUrl={mediaUrl}
                      setMediaUrl={setMediaUrl}
                      startTime={startTime}
                      setStartTime={setStartTime}
                      />

                      <AnimatePresence>
                        {isYouTubeUrl(mediaUrl) && (ytChecking || ytBlockedReason) && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className={`flex items-center mt-3 gap-2.5 px-4 py-3 rounded-none border text-[10px] font-bold ${
                              ytChecking
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                            }`}
                          >
                            {ytChecking ? (
                              <><Loader2 size={12} className="animate-spin flex-shrink-0" /> Mengecek video YouTube...</>
                            ) : (
                              <><X size={12} className="flex-shrink-0" /> {ytBlockedReason}</>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* ── Disclaimer konten tidak terfilter ── */}
                      <div className="mt-8 md:mt-3 rounded-none border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 space-y-2">
                        <p className="border-b border-amber-600/30 pb-3 mb-4 text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          Konten yang diblokir sistem
                        </p>
                        {/* <p className="text-[10px] text-amber-600 dark:text-amber-500 font-medium leading-relaxed">
                          Sistem kami hanya memblokir video private, age-restricted, dan yang dinonaktifkan embed-nya. Konten berikut <span className="font-black">tetap bisa lolos</span> dan menjadi tanggung jawab pengirim:
                        </p> */}
                        <ul className="space-y-1.5">
                          {[
                            { icon: '🔞', text: 'Konten dewasa yang belum dibatasi usia oleh YouTube' },
                            { icon: '🩸', text: 'Konten kekerasan / gore yang tidak dibatasi YouTube' },
                            { icon: '🚫', text: 'Video yang di blokir oleh negara' },
                          ].map(({ icon, text }) => (
                            <li key={text} className="flex items-start gap-2 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                              <span className="flex-shrink-0 mt-px">{icon}</span>
                              <span>{text}</span>
                            </li>
                          ))}
                        </ul>
                        {/* <p className="text-[10px] text-amber-500 dark:text-amber-600 font-medium pt-1 border-t border-amber-200 dark:border-amber-800">
                          Pengirim bertanggung jawab penuh atas konten yang dikirimkan. Pelanggaran dapat berakibat pemblokiran akun.
                        </p> */}
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* ── TAB: VOICE ── */}
              {activeTab === 'voice' && (
                <motion.div
                  key="tab-voice"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {form.amount < minDonate ? (
                    // Nominal belum cukup — warning
                    <div className="flex items-center gap-3 px-4 py-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-none">
                      <span className="text-2xl flex-shrink-0">🔒</span>
                      <div>
                        <p className="text-xs font-black text-amber-700 dark:text-amber-400">
                          Voice Message belum aktif
                        </p>
                        <p className="text-[10px] text-amber-500 font-medium mt-0.5">
                          Masukkan nominal minimal Rp {Number(minDonate).toLocaleString('id-ID')} untuk merekam suara
                        </p>
                        <button
                          onClick={() => setForm({ ...form, amount: minDonate })}
                          className="mt-2 px-3 py-1 bg-amber-500 text-white text-[10px] font-black rounded-none hover:bg-amber-600 transition-all cursor-pointer"
                        >
                          Set Rp {Number(minDonate).toLocaleString('id-ID')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-3 py-2 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-none">
                        <Mic size={13} className="text-violet-500 flex-shrink-0" />
                        <p className="text-[10px] font-bold text-violet-600 dark:text-violet-400">
                          Rekam pesan suaramu — max 60 detik
                        </p>
                      </div>
                      <VoiceRecorder
                        onVoiceReady={(url) => setForm(f => ({ ...f, voiceUrl: url || '' }))}
                        maxSeconds={60}
                        disabled={false}
                      />
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>

            {/* Anonymous toggle */}
            <label className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
              <div
                onClick={() => setForm({ ...form, isAnonymous: !form.isAnonymous })}
                className={`w-10 h-6 rounded-none relative flex-shrink-0 transition-all cursor-pointer ${form.isAnonymous ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-none shadow transition-all ${form.isAnonymous ? 'left-5' : 'left-1'}`} />
              </div>
              Donasi sebagai anonim
            </label>

            {/* Login prompt */}
            <AnimatePresence>
              {!isLoggedIn && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-none">
                    <div>
                      <p className="text-xs font-black text-blue-700 dark:text-blue-400">Donasi kamu tidak akan tercatat</p>
                      <p className="text-[10px] text-blue-400 dark:text-blue-500 font-medium mt-0.5">Masuk atau daftar agar donasi muncul di riwayat akun</p>
                    </div>
                    <button
                      onClick={() => openAuth('login')}
                      className="ml-3 flex-shrink-0 px-3 py-1.5 text-[10px] font-black text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-700 rounded-none hover:bg-blue-50 transition-all cursor-pointer"
                    >
                      Masuk
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Submit hint */}
            <AnimatePresence>
              {isSubmitDisabled && !loading && submitHint && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-none"
                >
                  <span className="text-slate-300 dark:text-slate-600 flex-shrink-0">⚠️</span>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{submitHint}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              whileTap={!isSubmitDisabled ? { scale: 0.99 } : {}}
              onClick={handleDonate}
              disabled={isSubmitDisabled}
              className={`w-full py-4 rounded-none font-black text-sm flex items-center justify-center gap-2 transition-all ${
                isSubmitDisabled
                  ? 'bg-slate-200 dark:bg-slate-900 text-slate-400 cursor-not-allowed'
                  : 'active:scale-[0.99] cursor-pointer bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:brightness-110'
              }`}
            >
              {loading ? (
                <><Loader2 size={20} className="animate-spin" /> Memproses...</>
              ) : (
                <>
                  {activeTab === 'alert' && '🔔 '}
                  {activeTab === 'mediashare' && '🎬 '}
                  {activeTab === 'voice' && '🎙️ '}
                  {submitButtonText}
                </>
              )}
            </motion.button>

          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SupporterPage;