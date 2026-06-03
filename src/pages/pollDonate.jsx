import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Send, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

const isProduction = import.meta.env.VITE_NODE_ENV === 'production';

const MIDTRANS_CLIENT_KEY = isProduction
  ? import.meta.env.VITE_MIDTRANS_CLIENT_KEY
  : import.meta.env.VITE_DEV_MIDTRANS_CLIENT_KEY;

const SNAP_URL = isProduction
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js';

const BASE_URL = import.meta.env.VITE_API_URL;

const getToken   = () => localStorage.getItem('token');
const getPayload = () => {
  const t = getToken();
  if (!t) return null;
  try { return JSON.parse(atob(t.split('.')[1])); } catch { return null; }
};
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

// ─── Navbar (sama seperti SupporterPage tapi lebih simpel) ───────────────────
const PollNavbar = ({ theme, toggleTheme }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-5 py-3">
    <div className="max-w-xl mx-auto flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-9 h-9 bg-pink-200 rounded-none p-1.5 flex items-center justify-center">
          <img src="/jellyfish.png" alt="icon" />
        </div>
        <span className="font-black text-sm text-slate-800 dark:text-white tracking-tight">TapTipTup</span>
      </Link>
      <button
        onClick={toggleTheme}
        className="cursor-pointer h-[40px] w-[40px] flex items-center justify-center rounded-none border bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  </nav>
);

// ─── State: tidak ada poll aktif ──────────────────────────────────────────────
const NoPollState = ({ username }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-violet-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 pt-24">
    <div className="bg-white dark:bg-slate-900 rounded-none shadow-xl border border-blue-100 dark:border-slate-800 p-10 text-center max-w-sm w-full">
      <p className="text-5xl mb-4">🗳️</p>
      <h2 className="font-black text-slate-800 dark:text-white text-lg mb-2">Tidak Ada Poll Aktif</h2>
      <p className="text-sm text-slate-400 dark:text-slate-500 font-medium mb-6">
        @{username} belum membuka poll saat ini. Cek lagi nanti!
      </p>
      <Link
        to={`/donate/${username}`}
        className="inline-block px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-none font-black text-sm transition-all"
      >
        Donasi Biasa →
      </Link>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const PollDonatePage = () => {
  const { username } = useParams();
  const { theme, toggle: toggleTheme } = useTheme();

  const [streamer, setStreamer]         = useState(null);
  const [poll, setPoll]                 = useState(null);
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [snapReady, setSnapReady]       = useState(false);

  const [selectedOption, setSelectedOption] = useState(null);
  const [amount, setAmount]             = useState(0);
  const [donorName, setDonorName]       = useState('');
  const [email, setEmail]               = useState('');
  const [isAnonymous, setIsAnonymous]   = useState(false);

  const authPayload = getPayload();
  const isLoggedIn  = !!authPayload;

  // Ambil profil lengkap jika login
  useEffect(() => {
    if (!isLoggedIn) return;
    axios.get(`${BASE_URL}/api/overlay/settings`, { headers: authHeader() })
      .then(r => {
        const u = r.data?.user || r.data?.User;
        if (u) {
          setDonorName(u.username || '');
          setEmail(u.email || '');
        }
      })
      .catch(() => {});
  }, [isLoggedIn]);

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

  // Fetch streamer + poll aktif
  useEffect(() => {
    if (!username) return;
    const cleanUsername = username.replace(/^@+/, '');

    Promise.all([
      axios.get(`${BASE_URL}/api/overlay/public/${cleanUsername}`),
      axios.get(`${BASE_URL}/api/polls/active/${cleanUsername}`),
    ])
      .then(([streamerRes, pollRes]) => {
        setStreamer(streamerRes.data);
        setPoll(pollRes.data);

        // Set default amount ke minVoteAmount jika ada, fallback ke minDonate
        const setting = streamerRes.data?.overlaySetting || streamerRes.data?.OverlaySetting || {};
        const minVote = setting.minVoteAmount || setting.minDonate || 5000;
        setAmount(minVote);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [username]);

  // Quick amounts berdasarkan minVoteAmount
  const overlaySetting = streamer?.overlaySetting || streamer?.OverlaySetting || {};
  const minVoteAmount  = overlaySetting.minVoteAmount || overlaySetting.minDonate || 5000;
  const maxDonate      = overlaySetting.maxDonate || 10000000;

  const quickAmounts = (() => {
    const base = minVoteAmount;
    const candidates = [base, base * 2, base * 5, base * 10];
    return candidates.filter(v => v <= maxDonate);
  })();

  const handleSubmit = async () => {
    if (!selectedOption) return alert('Pilih salah satu opsi poll dulu!');
    if (!amount || amount < minVoteAmount)
      return alert(`Minimal donasi untuk vote adalah Rp ${minVoteAmount.toLocaleString('id-ID')}`);
    if (amount > maxDonate)
      return alert(`Maksimal donasi Rp ${maxDonate.toLocaleString('id-ID')}`);
    if (!streamer?._id) return alert('Data streamer belum siap.');

    try {
      setSubmitting(true);

      const payload = {
        amount: Math.round(Number(amount)),
        donorName: isAnonymous ? 'Anonim' : donorName || 'Anonim',
        message: '',
        userId: streamer._id,
        email: email.trim() || 'guest@mail.com',
        mediaUrl: null,
        mediaType: null,
        donorUserId: authPayload?.id || undefined,
        pollVote: {
          pollId:   poll._id,
          optionId: selectedOption,
        },
      };

      const res = await axios.post(`${BASE_URL}/api/midtrans/create-invoice`, payload);

      if (res.data.token && snapReady && window.snap) {
        window.snap.pay(res.data.token, {
          onSuccess: () => window.location.href = `/donation/success?username=${streamer.username}`,
          onPending: () => window.location.href = `/donation/pending?username=${streamer.username}`,
          onError:   () => alert('Pembayaran gagal.'),
          onClose:   () => {},
        });
      } else {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error(err);
      alert('Gagal membuat invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <>
        <PollNavbar theme={theme} toggleTheme={toggleTheme} />
        <div className="min-h-screen flex items-center justify-center bg-blue-50 dark:bg-slate-900 pt-16">
          <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={28} />
        </div>
      </>
    );
  }

  // Tidak ada poll aktif
  if (!poll) {
    return (
      <>
        <PollNavbar theme={theme} toggleTheme={toggleTheme} />
        <NoPollState username={username} />
      </>
    );
  }

  const selectedOptText = poll.options.find(o => o._id === selectedOption)?.text;

  return (
    <>
      <PollNavbar theme={theme} toggleTheme={toggleTheme} />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-violet-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex justify-center items-start p-4 pt-20 md:pt-24 pb-10">
        <div className="w-full max-w-xl space-y-4">

          {/* Header streamer */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 px-8 py-6 rounded-none shadow-xl shadow-blue-100/50 dark:shadow-slate-800/50 text-center border border-blue-100 dark:border-slate-800 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 via-violet-500 to-purple-500" />
            <div className="w-16 h-16 mt-2 mx-auto rounded-none bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-2xl font-black shadow-lg mb-3">
              {streamer?.username?.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-xl font-black text-slate-800 dark:text-white">@{streamer?.username}</h1>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Vote sambil dukung streamer favoritmu 🗳️</p>
          </motion.div>

          {/* Section poll */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-none shadow-xl shadow-blue-100/50 dark:shadow-slate-800/50 border border-blue-100 dark:border-slate-800"
          >
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Pilih Opsi Poll</p>

            {/* Info minimum */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-none text-[10px] font-black text-blue-600 dark:text-blue-400 mb-4">
              ℹ️ Min. donasi Rp {minVoteAmount.toLocaleString('id-ID')} untuk ikut vote
            </div>

            {/* Pertanyaan */}
            <p className="font-black text-slate-800 dark:text-white text-base mb-4 leading-snug">
              {poll.question}
            </p>

            {/* Opsi */}
            <div className="space-y-2">
              {poll.options.map((opt) => {
                const isSelected = selectedOption === opt._id;
                return (
                  <button
                    key={opt._id}
                    onClick={() => setSelectedOption(isSelected ? null : opt._id)}
                    className={`cursor-pointer active:scale-[0.99] w-full text-left px-4 py-3.5 rounded-none border-2 font-bold text-sm transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    {/* Radio visual */}
                    <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                    </span>
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Section nominal */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-none shadow-xl shadow-blue-100/50 dark:shadow-slate-800/50 border border-blue-100 dark:border-slate-800"
          >
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Nominal Donasi</p>

            {/* Quick amounts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {quickAmounts.map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val)}
                  className={`cursor-pointer py-3 rounded-none font-black text-xs transition-all border-2 active:scale-[0.99] ${
                    amount === val
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Rp {val.toLocaleString('id-ID')}
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-blue-600 dark:text-blue-400 text-sm">Rp</span>
              <input
                type="number"
                value={amount || ''}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full p-4 pl-12 rounded-none font-black text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-300 dark:focus:border-blue-500 outline-none transition-all"
                placeholder="Nominal custom..."
              />
            </div>

            {amount > 0 && amount < minVoteAmount && (
              <p className="text-[10px] text-red-500 dark:text-red-400 font-bold mt-2 ml-1">
                ⚠️ Minimal Rp {minVoteAmount.toLocaleString('id-ID')} untuk bisa vote
              </p>
            )}
          </motion.div>

          {/* Section identitas */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-none shadow-xl shadow-blue-100/50 dark:shadow-slate-800/50 border border-blue-100 dark:border-slate-800 space-y-4"
          >
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Identitas</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Nama</label>
                <input
                  type="text"
                  disabled={isAnonymous || isLoggedIn}
                  value={isAnonymous ? '' : donorName}
                  onChange={e => setDonorName(e.target.value)}
                  placeholder="Nama kamu"
                  className="w-full p-3.5 rounded-none bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-300 dark:focus:border-blue-500 disabled:opacity-40 outline-none transition-all text-slate-700 dark:text-white text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Email (opsional)</label>
                <input
                  type="email"
                  disabled={isLoggedIn}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@kamu.com"
                  className="w-full p-3.5 rounded-none bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-300 dark:focus:border-blue-500 disabled:opacity-40 outline-none transition-all text-slate-700 dark:text-white text-sm font-bold"
                />
              </div>
            </div>

            {/* Anonymous toggle */}
            <label className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
              <div
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`w-10 h-6 rounded-none relative flex-shrink-0 transition-all cursor-pointer ${
                  isAnonymous ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-none shadow transition-all ${isAnonymous ? 'left-5' : 'left-1'}`} />
              </div>
              Vote sebagai anonim
            </label>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Ringkasan sebelum submit */}
            <AnimatePresence>
              {selectedOption && amount >= minVoteAmount && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-none px-4 py-3 text-xs font-bold text-blue-700 dark:text-blue-400 space-y-1 mb-4">
                    <p>✅ Vote: <span className="font-black">"{selectedOptText}"</span></p>
                    <p>💜 Donasi: <span className="font-black">Rp {Number(amount).toLocaleString('id-ID')}</span></p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.99 }}
              onClick={handleSubmit}
              disabled={submitting || !amount || !selectedOption || amount < minVoteAmount}
              className="cursor-pointer w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-none font-black text-base disabled:opacity-50 flex items-center justify-center gap-2 hover:brightness-110 transition-all"
            >
              {submitting ? (
                <><Loader2 size={18} className="animate-spin" /> Memproses...</>
              ) : (
                <><Send size={16} /> Vote + Kirim Donasi{amount > 0 ? ` Rp ${Number(amount).toLocaleString('id-ID')}` : ''}</>
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default PollDonatePage;