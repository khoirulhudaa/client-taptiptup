// src/pages/DonatePage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogIn, LogOut, User, ChevronDown, Heart,
  Send, Image, Video, X, CheckCircle2, Loader,
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL;

// ─── Auth helpers ─────────────────────────────────────────────────────────────
const getToken   = () => localStorage.getItem('token');
const getPayload = () => {
  const t = getToken();
  if (!t) return null;
  try { return JSON.parse(atob(t.split('.')[1])); } catch { return null; }
};
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

// ─── Navbar Mini ──────────────────────────────────────────────────────────────
const DonateNavbar = ({ streamerUsername }) => {
  const navigate = useNavigate();
  const payload  = getPayload();
  const isLoggedIn = !!payload;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const dropRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    axios.get(`${BASE_URL}/api/overlay/settings`, { headers: authHeader() })
      .then(r => setProfile(r.data?.user || r.data?.User))
      .catch(() => {});
  }, [isLoggedIn]);

  // Close dropdown saat klik luar
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setDropdownOpen(false);
    window.location.reload();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-3">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-red-100 rounded-xl flex items-center justify-center">
            <img src="/jellyfish.png" alt="logo" className="w-[70%]" />
          </div>
          <span className="font-black text-sm text-slate-800 tracking-tight">SAWER.IN</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all cursor-pointer">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-xs">
                  {(profile?.username || '?').charAt(0).toUpperCase()}
                </div>
                <span className="font-black text-sm text-slate-700 hidden sm:block">
                  @{profile?.username || '...'}
                </span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="font-black text-slate-800 text-sm">@{profile?.username}</p>
                      <p className="text-[10px] text-slate-400 font-medium truncate">{profile?.email}</p>
                    </div>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-all text-sm font-bold text-slate-700 cursor-pointer">
                      <User size={15} className="text-blue-500" /> Dashboard Saya
                    </button>
                    <button
                      onClick={() => navigate('/dashboard?tab=history')}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-all text-sm font-bold text-slate-700 cursor-pointer">
                      <Heart size={15} className="text-pink-500" /> Riwayat Donasi Saya
                    </button>
                    <div className="border-t border-slate-100">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-all text-sm font-bold text-red-500 cursor-pointer">
                        <LogOut size={15} /> Keluar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"
                className="px-4 py-2 text-sm font-black text-slate-600 hover:text-blue-600 transition-colors">
                Masuk
              </Link>
              <Link to="/register"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm transition-all">
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// ─── Main DonatePage ──────────────────────────────────────────────────────────
const DonatePage = () => {
  const { username } = useParams();
  const payload  = getPayload();
  const isLoggedIn = !!payload;

  const [streamer, setStreamer]       = useState(null);
  const [overlaySetting, setOverlay] = useState(null);
  const [milestones, setMilestones]  = useState([]);
  const [totalPaid, setTotalPaid]    = useState(0);
  const [loading, setLoading]        = useState(true);
  const [step, setStep]              = useState('form'); // 'form' | 'paying' | 'success'

  // Form state
  const [donorName, setDonorName]   = useState('');
  const [email, setEmail]           = useState('');
  const [amount, setAmount]         = useState('');
  const [message, setMessage]       = useState('');
  const [mediaUrl, setMediaUrl]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snapToken, setSnapToken]   = useState(null);

  // Fetch profil streamer
  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, milRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/overlay/public/${username}`),
          axios.get(`${BASE_URL}/api/milestones/public/${username}`).catch(() => ({ data: [] })),
        ]);
        setStreamer(profileRes.data);
        setOverlay(profileRes.data?.overlaySetting || profileRes.data?.OverlaySetting);
        setMilestones(milRes.data || []);

        // Hitung totalPaid untuk milestone progress
        const aggRes = await axios.get(`${BASE_URL}/api/donations/public-stats/${username}`).catch(() => ({ data: { total: 0 } }));
        setTotalPaid(aggRes.data?.total || 0);
      } catch {
        // streamer not found
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username]);

  // Auto-fill jika sudah login
  useEffect(() => {
    if (!isLoggedIn) return;
    axios.get(`${BASE_URL}/api/overlay/settings`, { headers: authHeader() })
      .then(r => {
        const u = r.data?.user || r.data?.User;
        if (u) {
          setDonorName(u.username || '');
          setEmail(u.email || '');
        }
      }).catch(() => {});
  }, [isLoggedIn]);

  const minDonate = overlaySetting?.minDonate || 10000;
  const maxDonate = overlaySetting?.maxDonate || 5000000;
  const mediaTrigger = overlaySetting?.mediaTriggers?.find(t => Number(amount) >= t.minAmount) || null;

  const NOMINAL_PRESETS = [10000, 20000, 50000, 100000, 200000, 500000];

  const handleSubmit = async () => {
    if (!donorName.trim()) return alert('Isi nama dulu!');
    if (!email.trim()) return alert('Isi email dulu!');
    if (Number(amount) < minDonate) return alert(`Minimal donasi Rp ${minDonate.toLocaleString('id-ID')}`);
    if (Number(amount) > maxDonate) return alert(`Maksimal donasi Rp ${maxDonate.toLocaleString('id-ID')}`);

    setSubmitting(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/midtrans/donate`, {
        userId: streamer._id,
        amount: Number(amount),
        donorName: donorName.trim(),
        email: email.trim(),
        message: message.trim(),
        mediaUrl: mediaUrl.trim() || undefined,
        donorUserId: payload?.id || undefined, // ← kirim jika login
      });

      // Buka Midtrans Snap
      if (window.snap) {
        window.snap.pay(res.data.token, {
          onSuccess: () => setStep('success'),
          onPending: () => setStep('paying'),
          onError:   () => alert('Pembayaran gagal'),
          onClose:   () => {},
        });
      } else {
        window.open(res.data.url, '_blank');
        setStep('paying');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  if (!streamer) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <p className="text-5xl mb-4">😕</p>
        <h1 className="font-black text-2xl text-slate-800">Streamer tidak ditemukan</h1>
        <p className="text-slate-400 font-medium mt-2">@{username} belum terdaftar di Sawer.in</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pt-16">
      <DonateNavbar streamerUsername={username} />

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Streamer Header */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-4 shadow-lg shadow-blue-100">
            {username.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-black text-slate-800">@{username}</h1>
          {streamer?.bio && (
            <p className="text-slate-400 font-medium text-sm mt-2 max-w-sm mx-auto">{streamer.bio}</p>
          )}
          {isLoggedIn && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-black border border-green-200">
              <CheckCircle2 size={13} /> Donasi kamu akan tercatat di riwayat akun
            </div>
          )}
        </div>

        {/* Milestones */}
        {milestones.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">🎯 Milestones</p>
            {milestones.map((m, i) => {
              const progress = Math.min(100, Math.round((totalPaid / m.targetAmount) * 100));
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm font-bold text-slate-700 mb-1.5">
                    <span>{m.title}</span>
                    <span className="text-slate-400">{progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                      className={`h-full rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                    <span>Rp {Math.min(totalPaid, m.targetAmount).toLocaleString('id-ID')}</span>
                    <span>Rp {m.targetAmount.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Form Donasi */}
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Heart size={18} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-black text-slate-800">Kirim Donasi</h2>
                {isLoggedIn && (
                  <span className="ml-auto text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    Logged in
                  </span>
                )}
              </div>

              {/* Nama & Email */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nama Kamu</label>
                  <input value={donorName} onChange={e => setDonorName(e.target.value)}
                    placeholder="Nama / nickname..."
                    disabled={isLoggedIn}
                    className={`w-full px-5 py-3.5 border rounded-2xl font-bold text-sm outline-none transition-all ${isLoggedIn ? 'bg-slate-100 text-slate-500 border-slate-100 cursor-not-allowed' : 'bg-slate-50 border-slate-200 focus:border-blue-400'}`} />
                  {isLoggedIn && <p className="text-[10px] text-slate-400 font-medium mt-1.5 ml-1">Nama diambil dari akun kamu</p>}
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="email@kamu.com"
                    disabled={isLoggedIn}
                    className={`w-full px-5 py-3.5 border rounded-2xl font-bold text-sm outline-none transition-all ${isLoggedIn ? 'bg-slate-100 text-slate-500 border-slate-100 cursor-not-allowed' : 'bg-slate-50 border-slate-200 focus:border-blue-400'}`} />
                </div>
              </div>

              {/* Nominal */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Nominal Donasi</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {NOMINAL_PRESETS.map(n => (
                    <button key={n} onClick={() => setAmount(String(n))}
                      className={`py-3 rounded-2xl font-black text-sm transition-all border-2 cursor-pointer ${Number(amount) === n ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-300'}`}>
                      Rp {(n / 1000).toLocaleString('id-ID')}rb
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">Rp</span>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-12 pr-5 py-4 bg-slate-900 text-white rounded-2xl font-black text-lg outline-none focus:ring-4 ring-blue-100 transition-all" />
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-2 ml-1">
                  Min Rp {minDonate.toLocaleString('id-ID')} · Max Rp {maxDonate.toLocaleString('id-ID')}
                </p>
              </div>

              {/* Pesan */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Pesan (opsional)</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Tulis pesan untuk streamer..."
                  rows={3}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-blue-400 transition-all resize-none" />
              </div>

              {/* Media (jika ada trigger) */}
              {mediaTrigger && (
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                    {mediaTrigger.label || 'Media Alert'} — Link {mediaTrigger.mediaType === 'image' ? 'Gambar' : mediaTrigger.mediaType === 'video' ? 'Video' : 'Gambar/Video'}
                  </label>
                  <div className="flex gap-2 items-center p-3 bg-purple-50 rounded-2xl border border-purple-200 mb-3">
                    {mediaTrigger.mediaType === 'video' ? <Video size={14} className="text-purple-500 flex-shrink-0" /> : <Image size={14} className="text-purple-500 flex-shrink-0" />}
                    <p className="text-[11px] text-purple-700 font-medium">
                      Donasi ≥ Rp {mediaTrigger.minAmount.toLocaleString('id-ID')} — kamu bisa mengirim media ke overlay OBS streamer!
                    </p>
                  </div>
                  <input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)}
                    placeholder="Paste link gambar atau video..."
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-purple-400 transition-all" />
                </div>
              )}

              {/* CTA */}
              <button onClick={handleSubmit} disabled={submitting}
                className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-100 disabled:opacity-70 cursor-pointer active:scale-[0.98]">
                {submitting
                  ? <><Loader size={20} className="animate-spin" /> Memproses...</>
                  : <><Send size={20} /> Kirim Donasi Rp {Number(amount || 0).toLocaleString('id-ID')}</>
                }
              </button>

              {!isLoggedIn && (
                <p className="text-center text-[11px] text-slate-400 font-medium">
                  Punya akun Sawer.in?{' '}
                  <a href="/login" className="text-blue-600 font-black hover:underline">
                    Login dulu
                  </a>{' '}
                  agar donasi kamu tercatat di riwayat
                </p>
              )}
            </motion.div>
          )}

          {step === 'paying' && (
            <motion.div key="paying" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 text-center space-y-4">
              <div className="w-16 h-16 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto">
                <Loader size={28} className="text-amber-600 animate-spin" />
              </div>
              <h2 className="text-xl font-black text-slate-800">Menunggu Pembayaran</h2>
              <p className="text-slate-400 font-medium text-sm">Selesaikan pembayaran di halaman Midtrans yang terbuka</p>
              <button onClick={() => setStep('form')}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-sm transition-all cursor-pointer">
                Kembali ke form
              </button>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 text-center space-y-4">
              <motion.div animate={{ scale: [0.8, 1.2, 1] }} transition={{ duration: 0.5 }}
                className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} className="text-green-600" />
              </motion.div>
              <h2 className="text-2xl font-black text-slate-800">Donasi Berhasil! 🎉</h2>
              <p className="text-slate-400 font-medium">
                Terima kasih sudah mendukung <span className="font-black text-slate-700">@{username}</span>
              </p>
              {isLoggedIn && (
                <p className="text-[11px] text-blue-600 font-black bg-blue-50 px-4 py-2 rounded-full inline-block border border-blue-100">
                  ✓ Donasi dicatat di riwayat akun kamu
                </p>
              )}
              <div className="flex gap-3 justify-center pt-2">
                <button onClick={() => { setStep('form'); setAmount(''); setMessage(''); setMediaUrl(''); }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm transition-all cursor-pointer">
                  Donasi Lagi
                </button>
                {isLoggedIn && (
                  <a href="/dashboard"
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-sm transition-all">
                    Lihat Riwayat
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Midtrans Snap Script */}
      <script
        type="text/javascript"
        src={`https://app.${import.meta.env.VITE_MIDTRANS_ENV === 'production' ? '' : 'sandbox.'}midtrans.com/snap/snap.js`}
        data-client-key={import.meta.env.VITE_MIDTRANS_CLIENT_KEY}
      />
    </div>
  );
};

export default DonatePage;