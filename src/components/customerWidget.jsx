import { AnimatePresence, motion } from 'framer-motion';
import { HeadphonesIcon, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const CS_TEMPLATES = [
  { label: 'Cara withdraw saldo',   text: 'Cara withdraw saldo ke rekening?' },
  { label: 'Overlay tidak muncul',  text: 'Kenapa overlay OBS tidak muncul?' },
  { label: 'Apa saja overlay OBS tersedia',  text: 'Apa saja overlay OBS yang tersedia?' },
  { label: 'Setup sound alert',     text: 'Bagaimana cara setup sound alert?' },
  { label: 'Saldo tidak bertambah', text: 'Donasi masuk tapi saldo tidak bertambah?' },
  { label: 'Instagram TapTipTup',   text: 'Instagram TapTipTup?' },
  { label: 'Saldo saya',            text: 'Berapa saldo saya sekarang?' },
  { label: 'Status akun',           text: 'Apa status akun streamer saya?' },
  { label: 'Ganti kata sandi akun', text: 'Cara ganti kata sandi akun?' },
  { label: 'Siapa top 3 donatur', text: 'Siapa top 3 donatur saya?' },
];

const CS_REPLIES = {
  'Cara withdraw saldo ke rekening?':
    'Untuk withdraw, buka menu Wallet di sidebar kiri. Minimal penarikan Rp 20.000 dan diproses admin dalam 1×24 jam kerja.',

  'Kenapa overlay OBS tidak muncul?':
    'Pastikan URL overlay sudah benar di Browser Source OBS. Cek juga koneksi internet dan refresh cache dengan Ctrl+R di OBS.',

  'Apa saja overlay OBS yang tersedia?':
    'Saat ini tersedia beberapa overlay OBS seperti Alert Donasi, Media Share, Voice Note, Milestones Goal, Subathon Timer, dan QR Code Payment.',

  'Bagaimana cara setup sound alert?':
    'Pergi ke menu Alert OBS › Pengaturan Suara. Pilih preset atau upload file MP3 kamu. Klik "Simpan" lalu test menggunakan tombol Instant Test.',

  'Donasi masuk tapi saldo tidak bertambah?':
    'Saldo tersedia akan masuk otomatis setelah masa pending 24 jam selesai. Jika donasi sudah settlement tetapi saldo belum masuk lebih dari 1 jam, hubungi admin support.',

  'Instagram TapTipTup?':
    'Instagram resmi TapTipTup adalah @taptiptup.official',

  'Cara ganti kata sandi akun?':
    'Gunakan fitur Lupa Password di halaman login lalu lakukan verifikasi akun menggunakan email atau PIN keamanan.',

  'Apa status akun streamer saya?':
    'Status akun streamer kamu saat ini aktif dan dapat menerima donasi.',

  'Berapa saldo saya sekarang?':
    'Saldo streamer kamu bisa dilihat di halaman Wallet / Withdraw. Saldo tersedia adalah saldo yang sudah melewati masa pending 24 jam.',
};

const DEFAULT_REPLY =
  'Pertanyaan kamu sudah kami catat. Tim support akan merespons dalam 1×24 jam kerja. Terima kasih!';

export const CustomerServiceWidget = () => {
  const [isOpen, setIsOpen]       = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [stats, setStats] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [messages, setMessages]   = useState([
    { id: 1, type: 'cs', text: 'Halo! Ada yang bisa kami bantu? Pilih pertanyaan di bawah atau ketik langsung ya.' },
  ]);
  const [input, setInput]         = useState('');
  const [isTyping, setIsTyping]   = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [profile, setProfile] = useState(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const BASE_URL = import.meta.env.VITE_API_URL;


useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/donations/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchStats();
}, []);

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/overlay/settings`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setProfile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchProfile();
}, []);


const addMsg = (text, type) =>
  setMessages(prev => [
    ...prev,
    {
      id: crypto.randomUUID(),
      type,
      text,
      time: nowStr()
    }
  ]);

const getSafe = (...vals) => {
  for (const v of vals) {
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return null;
};

const formatRp = (num) =>
  `Rp ${Number(num || 0).toLocaleString('id-ID')}`;

const getAIReply = (questionRaw) => {
  const q = questionRaw.toLowerCase();
  const topDonors = stats?.topDonors || [];

  const hasKeyword = (...words) =>
    words.some(w => q.includes(w));

  const user =
    profile?.User ||
    profile ||
    {};

  // ===== BASIC DATA =====
  const username = getSafe(
    user.username,
    user.slug,
    user.channelName,
    user.displayName,
    'Streamer'
  );

  const verified =
    user.isVerified ||
    user.verified ||
    user.isPremium ||
    false;

  const availableBalance = parseFloat(
    getSafe(
      user.availableBalance,
      profile?.availableBalance,
      0
    )
  );

  const walletBalance = parseFloat(
    getSafe(
      user.walletBalance,
      profile?.walletBalance,
      0
    )
  );

  const pendingBalance = Math.max(
    0,
    walletBalance - availableBalance
  );

  const totalDonation = parseFloat(
    getSafe(
      user.totalDonation,
      user.totalDonate,
      profile?.totalDonation,
      walletBalance,
      0
    )
  );

   const overlayUrl = getSafe(
    user.overlayUrl,
    profile?.overlayUrl,
    `${window.location.origin}/overlay/${username}`
  );

  const activeOverlay = parseInt(
    getSafe(
      user.activeOverlayCount,
      user.overlayCount,
      6
    )
  );

  const latestDonatur = getSafe(
    user.latestDonatur,
    user.topDonatur,
    'Belum ada'
  );

  const pendingWithdraw = parseFloat(
    getSafe(
      user.pendingWithdraw,
      profile?.pendingWithdraw,
      0
    )
  );

  // ===== FULL PROFILE =====
  if (
    hasKeyword(
      'profil',
      'profile',
      'data akun',
      'akun saya',
      'info akun',
      'detail akun',
      'profile lengkap',
      'profil lengkap',
      'channel saya'
    )
  ) {
    return `
📌 INFORMASI AKUN STREAMER

👤 Username: ${username}

📺 Channel: ${username}

✅ Status: ${verified ? 'Verified' : 'Belum Verified'}

💰 Saldo Tersedia: ${formatRp(availableBalance)}

⏳ Saldo Pending: ${formatRp(pendingBalance)}

💸 Pending Withdrawal: ${formatRp(pendingWithdraw)}

🎁 Total Donasi: ${formatRp(totalDonation)}

🧩 Overlay Aktif: ${activeOverlay} overlay

🏆 Top Donatur: ${latestDonatur}

🔗 Link Overlay OBS: ${overlayUrl}

📅 Estimasi Pencairan:
1×24 jam hari kerja
`;
  }

  // saldo
  if (
    hasKeyword(
      'saldo',
      'wallet',
      'uang',
      'duit',
      'income',
      'pemasukan'
    )
  ) {
    return `Saldo tersedia akun ${username} saat ini adalah ${formatRp(availableBalance)}. ${
      pendingBalance > 0
        ? `Terdapat saldo pending ${formatRp(pendingBalance)} yang akan cair otomatis setelah 24 jam.`
        : 'Tidak ada saldo pending saat ini.'
    }`;
  }

  // akun / channel
  if (
    q.includes('akun') ||
    q.includes('channel') ||
    q.includes('streamer')
  ) {
    return `Channel streamer ${username} saat ini ${
      verified
        ? 'sudah terverifikasi'
        : 'belum terverifikasi'
    } dan dapat menerima donasi.`;
  }

  // verified
  if (
    q.includes('verified') ||
    q.includes('verifikasi') ||
    q.includes('centang')
  ) {
    return verified
      ? `Akun ${username} sudah terverifikasi ✓`
      : `Akun ${username} saat ini belum terverifikasi.`;
  }

  // overlay obs
  if (
    q.includes('overlay') ||
    q.includes('obs')
  ) {
    return `Overlay OBS tersedia: Alert Donasi, Media Share, Voice Note, Milestones, Subathon Timer, QR Code Payment, dan Goal Progress. Link overlay akun kamu:\n${overlayUrl}`;
  }

  // sound alert
  if (
    q.includes('sound') ||
    q.includes('suara') ||
    q.includes('alert')
  ) {
    return 'Masuk ke menu Alert OBS → Pengaturan Suara. Kamu bisa upload MP3 sendiri lalu klik tombol Instant Test.';
  }

  // withdraw
  if (
    q.includes('withdraw') ||
    q.includes('penarikan') ||
    q.includes('cair')
  ) {
    return `Status withdrawal pending saat ini: ${formatRp(pendingWithdraw)}. Semua withdrawal diproses manual admin dalam estimasi 1×24 jam hari kerja.`;
  }

  // total donasi
  if (
    q.includes('donasi') ||
    q.includes('total donate') ||
    q.includes('pemasukan')
  ) {
    return `Total donasi yang sudah masuk ke akun ${username} adalah ${formatRp(totalDonation)}.`;
  }

  // overlay aktif
  if (
    q.includes('overlay aktif') ||
    q.includes('widget aktif')
  ) {
    return `Saat ini terdapat ${activeOverlay} overlay/widget aktif pada akun streamer ${username}.`;
  }

  // // ================= TOP DONATUR =================
    if (hasKeyword('top donatur', 'top donor', 'donatur teratas')) {
        const top1 = topDonors?.[0];

        if (!top1) return 'Belum ada data top donatur saat ini.';

        return `🏆 TOP DONATUR

        👤 Nama: ${top1.name}
        💰 Total: Rp ${Number(top1.totalAmount).toLocaleString('id-ID')}
        `;
        }

        if (hasKeyword('top 3', '3 donatur', 'ranking donatur')) {
        if (!topDonors.length) return 'Belum ada data donatur.';

        return `🏆 TOP 3 DONATUR

        ${topDonors.slice(0, 3).map((d, i) =>
        `${i + 1}. ${d.name} - Rp ${Number(d.totalAmount).toLocaleString('id-ID')}`
        ).join('\n')}
        `;
        }

        if (hasKeyword('semua top donatur', 'list donatur', 'ranking lengkap')) {
    if (!topDonors.length) return 'Belum ada data donatur.';

    return `🏆 DAFTAR TOP DONATUR

    ${topDonors.map((d, i) =>
    `${i + 1}. ${d.name} - Rp ${Number(d.totalAmount).toLocaleString('id-ID')}`
    ).join('\n')}
    `;
    }

    if (q.includes('donatur')) {
        const top1 = topDonors?.[0];

        return top1
            ? `Top donatur saat ini adalah ${top1.name} dengan total Rp ${Number(top1.totalAmount).toLocaleString('id-ID')}`
            : 'Belum ada data donatur.';
        }

  // instagram
  if (
    q.includes('instagram') ||
    q.includes('ig')
  ) {
    return 'Instagram resmi TapTipTup adalah @taptiptup.official';
  }

  // password
  if (
    q.includes('password') ||
    q.includes('kata sandi')
  ) {
    return 'Gunakan fitur Lupa Password di halaman login lalu lakukan verifikasi akun menggunakan email atau PIN keamanan.';
  }

  // overlay tidak muncul
  if (
    q.includes('overlay tidak muncul') ||
    q.includes('obs tidak muncul')
  ) {
    return 'Pastikan Browser Source OBS menggunakan URL overlay yang benar. Refresh source OBS menggunakan Ctrl+R lalu cek koneksi internet.';
  }

  return DEFAULT_REPLY;
};

const replyFromCS = (question) => {
  setIsTyping(true);

  setTimeout(() => {
    setIsTyping(false);

    const aiReply = getAIReply(question);

    addMsg(aiReply, 'cs');

    if (!isOpen) {
      setHasUnread(true);
    }
  }, 1000 + Math.random() * 800);
};

  const handleSend = (text) => {
    if (!text.trim()) return;
    addMsg(text, 'user');
    setInput('');
    replyFromCS(text);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setHasUnread(false);
  };

  const toggleOpen = () => {
    setIsOpen(prev => {
        const next = !prev;
        
        if (next === true) {
        setHasUnread(false);
        }

        return next;
    });
    };

  const nowStr = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  return (
    <>
      {/* ── Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              zIndex: 9998,
            //   minWidth: 300,
            //   maxWidth: 420,
              display: 'flex',
              flexDirection: 'column',
            }}
            className="md:w-[33vw] w-[100vw] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-700"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-4 bg-indigo-600 flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white flex-shrink-0">
                <HeadphonesIcon size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white leading-tight">Customer Support</p>
                <p className="text-[11px] text-indigo-200 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                  Online sekarang
                </p>
              </div>
              {/* ← satu-satunya tombol X, di header */}
              <button
                onClick={() => setIsOpen(false)}
                className="text-white active:scale-[0.99] cursor-pointer hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-all"
                aria-label="Tutup panel"
              >
                <X size={30} />
              </button>
            </div>

            {/* Messages */}
            <div ref={bodyRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(m => (
                <div key={m.id}   className={`flex ${
                        m.type === 'user'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                    >
                  <div>
                    <div className={`px-3 py-2 text-[13px] leading-relaxed whitespace-pre-line break-words ${
                        m.type === 'cs'
                            ? 'w-[100%]'
                            : '-w-[100%]'
                        }  ${
                      m.type === 'user'
                        ? 'bg-indigo-600 text-white rounded-t-xl rounded-bl-xl'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-t-xl rounded-br-xl'
                    }`}>
                      {m.text}
                    </div>
                    <p className={`text-[10px] text-slate-400 mt-0.5 ${m.type === 'user' ? 'text-right' : ''}`}>
                      {m.type === 'user' ? 'Kamu' : 'CS'} · {nowStr()}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-t-xl rounded-br-xl">
                    {[0, 150, 300].map(delay => (
                      <span
                        key={delay}
                        className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Templates */}
            <div className="px-4 pb-2 pt-3 border-t border-slate-100 dark:border-slate-700 flex-shrink-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-semibold">
                Pertanyaan umum
              </p>
              <div className="flex flex-wrap gap-1.5">
                {CS_TEMPLATES.map(t => (
                  <button
                    key={t.text}
                    onClick={() => handleSend(t.text)}
                    className="text-[11px] px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-300 transition-all cursor-pointer active:scale-[0.97]"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-700 flex-shrink-0">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend(input)}
                placeholder="Tulis pesan..."
                className="flex-1 text-[13px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-400 transition-all"
              />
              <button
                onClick={() => handleSend(input)}
                className="w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white flex-shrink-0 transition-all active:scale-95 cursor-pointer"
              >
                <Send size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB — selalu tampilkan HeadphonesIcon, tidak pernah X ── */}
        <motion.button
            drag
            dragMomentum={false}
            dragElastic={0.1}

            onDragStart={() => setIsDragging(false)}
            onDrag={() => setIsDragging(true)}

            onDragEnd={(event, info) => {
                setPosition({
                x: position.x + info.offset.x,
                y: position.y + info.offset.y,
                });

                setTimeout(() => {
                setIsDragging(false);
                }, 50);
            }}

            animate={{ x: position.x, y: position.y }}

            onClick={(e) => {
                if (isDragging) return; // 🚨 ini kuncinya
                toggleOpen();
            }}

            style={{
                position: 'fixed',
                bottom: 16,
                right: 27.9,
                zIndex: 9999,
                width: 56,
                height: 56,
                border: 'none',
            }}

            className={`${isOpen ? 'hidden' : ''} relative p-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-yellow-400 shadow-2xl cursor-grab active:cursor-grabbing`}
            >
        {/* inner button */}
        <div className="w-full h-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white  shadow-indigo-200 dark:shadow-indigo-900/40 transition-colors relative">

            <HeadphonesIcon size={22} />

            {/* Unread badge */}
            {hasUnread && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-950" />
            )}
        </div>
        </motion.button>
    </>
  );
};

export default CustomerServiceWidget;