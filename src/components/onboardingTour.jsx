import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, Check, Clock, HeadphonesIcon, History, ImageIcon, Layers,
  Layout, Mail, Map, Mic, Monitor, Play, Receipt, ShoppingBag, Sun,
  TrendingUp, Trophy, User, Users, Video, Vote, Wallet, X, Zap,
} from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// const TOUR_STEPS = [
//   {
//     target: 'tour-settings',
//     icon: <Layout size={18} />,
//     title: 'Editor Overlay',
//     desc: 'Kustomisasi tampilan overlay OBS kamu — posisi nama donatur, animasi, warna, dan font bisa diatur bebas dari sini.',
//   },
//   {
//     target: 'tour-alertSettings',
//     icon: <Zap size={18} />,
//     title: 'Alert OBS',
//     desc: 'Kelola efek suara dan animasi yang muncul otomatis di stream saat ada donasi masuk.',
//   },
//   {
//     target: 'tour-mediaSettings',
//     icon: <Video size={18} />,
//     title: 'Media Share',
//     desc: 'Donatur bisa request video YouTube atau GIF yang langsung tampil di stream-mu secara realtime.',
//   },
//   {
//     target: 'tour-voiceSettings',
//     icon: <Mic size={18} />,
//     title: 'Voice Note',
//     desc: 'Donatur bisa kirim pesan suara yang akan diputar otomatis di stream kamu.',
//   },
//   {
//     target: 'tour-store',
//     icon: <ShoppingBag size={18} />,
//     title: 'Toko OBS',
//     desc: 'Buat item yang bisa dibeli donatur — efek khusus, sound effect, atau interaksi unik lainnya.',
//   },
//   {
//     target: 'tour-history',
//     icon: <History size={18} />,
//     title: 'Riwayat Donasi',
//     desc: 'Lihat semua riwayat donasi yang masuk lengkap dengan nama, jumlah, dan pesan dari donatur.',
//   },
//   {
//     target: 'tour-wallet',
//     icon: <Wallet size={18} />,
//     title: 'Penarikan Dana',
//     desc: 'Tarik saldo donasi kamu ke rekening bank atau e-wallet kapan saja.',
//   },
//   {
//     target: 'tour-inbox',
//     icon: <Mail size={18} />,
//     title: 'Inbox',
//     desc: 'Baca semua pesan dan notifikasi penting dari platform di satu tempat.',
//   },
//   {
//     target: 'tour-poll',
//     icon: <Vote size={18} />,
//     title: 'Poll & Voting',
//     desc: 'Buat poll interaktif yang bisa diikuti penonton dan donatur selama live berlangsung.',
//   },
//   {
//     target: 'tour-subathon',
//     icon: <Clock size={18} />,
//     title: 'Subathon',
//     desc: 'Atur timer Subathon yang akan bertambah otomatis setiap ada donasi atau subscriber baru.',
// },
// {
// target: 'tour-milestones',
// icon: <TrendingUp size={18} />,
// title: 'Milestones',
// desc: 'Tetapkan target donasi dan beri hadiah spesial ketika target tercapai oleh komunitas kamu.',
// },
// {
// target: 'tour-leaderboard',
// icon: <Trophy size={18} />,
// title: 'Leaderboard',
// desc: 'Tampilkan donatur terbesar di overlay untuk mendorong semangat penonton bersaing.',
// },
// {
// target: 'tour-feeConfig',
// icon: <Receipt size={18} />,
// title: 'Konfigurasi Fee',
// desc: 'Atur besaran fee platform dan lihat transparansi potongan dari setiap donasi yang masuk.',
// },
// {
// target: 'tour-sidebar-toggle',
// icon: <Layout size={18} />,
// title: 'Sidebar Navigation',
// desc: 'Klik tombol ini untuk menyempitkan atau memperlebar sidebar. Sangat berguna saat layar kecil atau fokus ke satu fitur.',
// placement: 'bottom',
// },
// {
// target: 'tour-balance',
// icon: <Wallet size={18} />,
// title: 'Saldo & Kirim Dana',
// desc: 'Pantau saldo kamu di navbar dan kirim saldo ke sesama streamer dengan satu klik.',
// placement: 'bottom',
// },
// {
// target: 'tour-theme-toggle',
// icon: <Sun size={18} />,
// title: 'Tema Gelap / Terang',
// desc: 'Ganti tampilan dashboard antara mode Light dan Dark sesuai kenyamanan mata kamu.',
// placement: 'bottom',
// },
// {
// target: 'tour-help',
// icon: <HeadphonesIcon size={18} />,   // pastikan import HeadphonesIcon
// title: 'Bantuan & Kontak',
// desc: 'Hubungi tim support, developer, atau admin Taptiptup jika butuh bantuan.',
// placement: 'bottom',
// },
// {
// target: 'tour-community',
// icon: <Users size={18} />,   // pastikan import Users
// title: 'Komunitas Streamer',
// desc: 'Bertemu, berdiskusi, dan saling support dengan sesama streamer Taptiptup.',
// placement: 'bottom',
// },
// {
// target: 'tour-profile',
// icon: <User size={18} />,   // pastikan import User dari lucide-react
// title: 'Profil & Logout',
// desc: 'Akses profil kamu, pengaturan akun, dan tombol keluar (logout).',
// placement: 'bottom',
// },
// ];

const TOUR_STEPS = [
  {
    target: 'tour-sidebar-group',
    icon: <Layout size={18} />,
    title: 'Menu Navigasi',
    desc: 'Semua fitur ada di sini — Editor Overlay, Notif Alert, Media Share, Voice Note, Toko, Riwayat Donasi, Penarikan Dana, Poll, Subathon, Milestones, Leaderboard, dan Konfigurasi Fee.',
  },
  {
    target: 'tour-overlay-slot',
    icon: <Layers size={18} />,
    title: 'Slot Overlay A & B',
    desc: 'Kamu bisa simpan 2 konfigurasi overlay berbeda. Aktifkan salah satu sebagai overlay yang tampil live di OBS, dan simpan yang lain sebagai cadangan atau tema alternatif.',
  },
  {
    target: 'tour-min-max-donasi',
    icon: <Wallet size={18} />,
    title: 'Minimal & Maksimal Donasi',
    desc: 'Atur batas nominal donasi yang bisa diterima dari supporter di halaman donasimu.',
  },
  {
    target: 'tour-tema-visual',
    icon: <ImageIcon size={18} />,
    title: 'Tema Visual Overlay',
    desc: 'Pilih tampilan alert donasi yang muncul di OBS — Taptip 1, Taptip 2, Taptip 3, atau Pop Card. Tiap tema punya gaya visual berbeda.',
  },
  {
    target: 'tour-donation-items',
    icon: <ShoppingBag size={18} />,
    title: 'Item Donasi',
    desc: 'Buat paket donasi dengan nominal dan label khusus, supaya supporter bisa pilih dengan cepat tanpa input manual.',
  },
  {
    target: 'tour-overlay-url',
    icon: <Monitor size={18} />,
    title: 'URL Overlay',
    desc: 'Salin link ini dan pasang sebagai Browser Source di OBS — link alert, media share, voice note, dan combined semua ada di sini.',
  },
  {
    target: 'tour-ganti-token',
    icon: <Zap size={18} />,
    title: 'Ganti Overlay Token',
    desc: 'Kalau token overlay-mu bocor atau ingin reset, ganti di sini. Semua URL OBS lama otomatis tidak berlaku setelah diganti.',
  },
  {
    target: 'tour-hapus-akun',
    icon: <X size={18} />,
    title: 'Hapus Akun',
    desc: 'Kalau suatu saat ingin berhenti, kamu bisa hapus akun secara permanen dari sini.',
  },
  {
    target: 'tour-topnavbar-group',
    icon: <Wallet size={18} />,
    title: 'Navbar Atas',
    desc: 'Di sini kamu bisa lihat saldo, kirim saldo ke streamer lain, ganti tema gelap/terang, akses bantuan, komunitas, inbox, dan profil akunmu.',
    placement: 'bottom',
  },
];

const SCROLL_PADDING = 80; // jarak aman dari tepi atas/bawah layar

// ─── Scroll elemen target agar terlihat di dalam sidebar ──────────────────────
function scrollTargetIntoView(targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;

  // Cari ancestor scrollable
  let scrollable = el.parentElement;
  while (scrollable && scrollable !== document.body) {
    const { overflowY } = window.getComputedStyle(scrollable);
    if (overflowY === 'auto' || overflowY === 'scroll') break;
    scrollable = scrollable.parentElement;
  }

  if (scrollable && scrollable !== document.body) {
    const containerRect = scrollable.getBoundingClientRect();
    const elRect        = el.getBoundingClientRect();
    const relTop        = elRect.top    - containerRect.top;
    const relBottom     = elRect.bottom - containerRect.top;

    if (relTop < SCROLL_PADDING) {
      // Elemen terlalu dekat / di atas tepi container
      scrollable.scrollBy({ top: relTop - SCROLL_PADDING, behavior: 'smooth' });
    } else if (relBottom > containerRect.height - SCROLL_PADDING) {
      // Elemen terlalu dekat / di bawah tepi container
      scrollable.scrollBy({
        top: relBottom - containerRect.height + SCROLL_PADDING,
        behavior: 'smooth',
      });
    }
  } else {
    // Fallback: scroll window dengan offset padding
    const elRect   = el.getBoundingClientRect();
    const scrollY  = window.scrollY;

    if (elRect.top < SCROLL_PADDING) {
      window.scrollTo({ top: scrollY + elRect.top - SCROLL_PADDING, behavior: 'smooth' });
    } else if (elRect.bottom > window.innerHeight - SCROLL_PADDING) {
      window.scrollTo({
        top: scrollY + elRect.bottom - window.innerHeight + SCROLL_PADDING,
        behavior: 'smooth',
      });
    }
  }
}

// ─── Hook: posisi elemen target ───────────────────────────────────────────────
const PAD = 6;

function useTargetRect(targetId, active) {
  const [rect, setRect] = useState(null);
  const prevRectRef = useRef(null);
  const rafRef = useRef(null);

  useLayoutEffect(() => {
    if (!active || !targetId) return;

    const update = () => {
      const el = document.getElementById(targetId);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const next = { top: r.top, left: r.left, width: r.width, height: r.height };

      // Hanya update state jika posisi benar-benar berubah
      const prev = prevRectRef.current;
      if (
        !prev ||
        prev.top    !== next.top   ||
        prev.left   !== next.left  ||
        prev.width  !== next.width ||
        prev.height !== next.height
      ) {
        prevRectRef.current = next;
        setRect(next);
      }

      // Loop terus via rAF selama aktif
      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetId, active]);

  return rect ?? prevRectRef.current;
}

// ─── Spotlight ────────────────────────────────────────────────────────────────
const Spotlight = ({ rect }) => {
  if (!rect) return null;

  const pad    = PAD;
  const vw     = window.innerWidth;
  const vh     = window.innerHeight;

  // Clamp agar tidak pernah keluar viewport atau negatif
  const spotTop    = Math.max(0, rect.top    - pad);
  const spotLeft   = Math.max(0, rect.left   - pad);
  const spotRight  = Math.min(vw, rect.left + rect.width  + pad);
  const spotBottom = Math.min(vh, rect.top  + rect.height + pad);

  const spotWidth  = spotRight  - spotLeft;
  const spotHeight = spotBottom - spotTop;

  const top    = spotTop;
  const left   = spotLeft;
  const width  = spotWidth;
  const height = spotHeight;

  const rightW  = Math.max(0, vw - (left + width));
  const bottomH = Math.max(0, vh - (top  + height));
  const topH    = Math.max(0, top);
  const leftW   = Math.max(0, left);

  const overlayStyle = {
    position: 'fixed',
    background: 'rgba(0,0,0,0.65)',
    zIndex: 99990,
    pointerEvents: 'none',
  };

  return (
    <>
      <div style={{ ...overlayStyle, top: 0,         left: 0,          right: 0,   height: topH   }} />
      <div style={{ ...overlayStyle, bottom: 0,      left: 0,          right: 0,   height: bottomH }} />
      <div style={{ ...overlayStyle, top,             left: 0,          width: leftW, height }} />
      <div style={{ ...overlayStyle, top,             left: left + width, width: rightW, height }} />

      <div
        style={{
          position:     'fixed',
          top,
          left,
          width,
          height,
          borderRadius: 10,
          outline:      '2px solid #3b82f6',
          boxShadow:    '0 0 0 4px rgba(59,130,246,0.2)',
          zIndex:       99991,
          pointerEvents: 'none',
        }}
      />
    </>
  );
};

// ─── Tooltip card ─────────────────────────────────────────────────────────────
const TourCard = ({ step, stepIndex, total, rect, onNext, onSkip }) => {
  const cardRef = useRef(null);
  const [pos, setPos] = useState({ top: 100, left: 100 });

  useLayoutEffect(() => {
    if (!rect || !cardRef.current) return;
    const card   = cardRef.current.getBoundingClientRect();
    const vw     = window.innerWidth;
    const vh     = window.innerHeight;
    const margin = 14;

    let left = rect.left + rect.width + PAD + margin;
    let top  = rect.top;

    if (left + card.width > vw - 8) {
      left = rect.left - card.width - margin;
    }
    if (left < 8) {
      left = Math.max(8, (vw - card.width) / 2);
      top  = rect.top + rect.height + PAD + margin;
      if (top + card.height > vh - 8) {
        top = rect.top - card.height - margin;
      }
    }
    top = Math.min(Math.max(top, 8), vh - card.height - 8);

    setPos({ top, left });
  }, [rect, stepIndex]);

  const isLast = stepIndex === total - 1;

  return (
    <motion.div
      ref={cardRef}
      className="fixed z-[99999] w-[300px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-2xl p-5"
      style={{ top: pos.top, left: pos.left }}
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 8 }}
      transition={{ duration: 0.2 }}
      key={stepIndex}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
          {step.icon}
        </div>
        <div className="min-w-0">
          <p className="font-black text-slate-800 dark:text-slate-100 text-sm leading-tight">{step.title}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{stepIndex + 1} dari {total}</p>
        </div>
        <button
          onClick={onSkip}
          className="ml-auto p-1 text-slate-300 hover:text-slate-500 dark:hover:text-slate-400 cursor-pointer"
          aria-label="Tutup tur"
        >
          <X size={14} />
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 mb-3">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-xl transition-all duration-300 ${
              i < stepIndex
                ? 'bg-blue-300 dark:bg-blue-700 w-2'
                : i === stepIndex
                ? 'bg-blue-600 w-4'
                : 'bg-slate-200 dark:bg-slate-700 w-2'
            }`}
          />
        ))}
      </div>

      {/* Description */}
      <p className="text-slate-500 dark:text-slate-400 text-[13px] leading-relaxed mb-4">
        {step.desc}
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onSkip}
          className="flex-1 py-2 text-xs font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          Lewati
        </button>
        <button
          onClick={onNext}
          className="flex-[2] py-2 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
        >
          {isLast ? (
            <><Check size={13} /> Selesai</>
          ) : (
            <>Lanjut <ArrowRight size={13} /></>
          )}
        </button>
      </div>
    </motion.div>
  );
};

// ─── Start Modal ──────────────────────────────────────────────────────────────
const TourStartModal = ({ onStart, onSkip }) => (
  <div className="fixed inset-0 z-[99999] flex items-center justify-center p-6">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      onClick={onSkip}
    />
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 16 }}
      className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-100/5 p-6 w-full max-w-md text-center shadow-2xl"
    >
      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-5">
        <Map size={28} />
      </div>
      <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">Selamat datang</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
        Kamu baru pertama kali di sini. Yuk kenalan dulu dengan semua fitur TAPTIPTUP — hanya butuh beberapa detik.
      </p>
      <div className="flex flex-col gap-2">
        <button
          onClick={onStart}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-sm cursor-pointer transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-blue-100 dark:shadow-blue-900/20"
        >
          <Play size={14} /> Mulai Tur Fitur
        </button>
        <button
          onClick={onSkip}
          className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 font-black rounded-xl text-sm cursor-pointer transition-all active:scale-[0.99]"
        >
          Nanti saja
        </button>
      </div>
    </motion.div>
  </div>
);

// ─── Finish Modal ─────────────────────────────────────────────────────────────
const TourFinishModal = ({ onDone }) => (
  <div className="fixed inset-0 z-[99999] flex items-center justify-center p-6">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
    />
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 16 }}
      className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-8 w-full max-w-md text-center shadow-2xl"
    >
      <div className="w-16 h-16 bg-green-50 dark:bg-green-950/40 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-5">
        <Check size={28} />
      </div>
      <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">Tur selesai! 🎉</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
        Kamu sudah mengenal semua fitur TAPTIPTUP. Selamat streaming dan semoga donasimu melimpah!
      </p>
      <button
        onClick={onDone}
        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl text-sm cursor-pointer transition-all active:scale-[0.99] shadow-lg shadow-green-100 dark:shadow-green-900/20"
      >
        Mulai Gunakan Dashboard
      </button>
    </motion.div>
  </div>
);

// ─── Komponen utama ───────────────────────────────────────────────────────────
const STORAGE_KEY = 'taptiptup_tour_done';

const getTokenPayload = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

const OnboardingTour = ({ forceShow = false, onComplete }) => {
  const [phase, setPhase]         = useState('idle');
  const [stepIndex, setStepIndex] = useState(0);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false); // ← jadi state
  const [isMobile, setIsMobile]   = useState(false);   // ← Tambahan

  const currentStep = TOUR_STEPS[stepIndex];
  const targetRect  = useTargetRect(currentStep?.target, phase === 'touring');

  // Cek ukuran layar
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 700);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ← cek superAdmin di useEffect, bukan di render level
  useEffect(() => {
    const payload = getTokenPayload();
    if (payload?.role === 'superAdmin') {
      setIsSuperAdmin(true);
      return;
    }
    if (isMobile) return;
    if (forceShow) { setPhase('start'); return; }
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setPhase('start');
  }, [forceShow, isMobile]);

  // Auto-scroll sidebar setiap kali step berubah
  useEffect(() => {
    if (phase !== 'touring') return;
    scrollTargetIntoView(currentStep?.target);
  }, [phase, stepIndex, currentStep?.target]);

  // ← conditional return SETELAH semua hooks
  if (isSuperAdmin || isMobile) return null;

  const handleStart = () => { setStepIndex(0); setPhase('touring'); };

  const handleNext = () => {
    if (stepIndex < TOUR_STEPS.length - 1) {
      setStepIndex(i => i + 1);
    } else {
      setPhase('finish');
    }
  };

  const handleSkip = () => {
    setPhase('idle');
    localStorage.setItem(STORAGE_KEY, '1');
    onComplete?.();
  };

  const handleDone = () => {
    setPhase('idle');
    localStorage.setItem(STORAGE_KEY, '1');
    onComplete?.();
  };

  return (
    <>
      <AnimatePresence>
        {phase === 'start' && (
          <TourStartModal onStart={handleStart} onSkip={handleSkip} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'touring' && targetRect && (
          <>
            <Spotlight rect={targetRect} />
            <TourCard
              step={currentStep}
              stepIndex={stepIndex}
              total={TOUR_STEPS.length}
              rect={targetRect}
              onNext={handleNext}
              onSkip={handleSkip}
            />
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'finish' && (
          <TourFinishModal onDone={handleDone} />
        )}
      </AnimatePresence>
    </>
  );
};

export default OnboardingTour;
export { STORAGE_KEY };