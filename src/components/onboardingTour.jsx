import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  Clock,
  HeadphonesIcon,
  History,
  Layout,
  Mail,
  Map,
  Mic,
  Play,
  Receipt,
  ShoppingBag,
  Sun,
  TrendingUp,
  Trophy,
  User,
  Users,
  Video,
  Vote,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const TOUR_STEPS = [
  {
    target: 'tour-settings',
    icon: <Layout size={18} />,
    title: 'Editor Overlay',
    desc: 'Kustomisasi tampilan overlay OBS kamu — posisi nama donatur, animasi, warna, dan font bisa diatur bebas dari sini.',
  },
  {
    target: 'tour-alertSettings',
    icon: <Zap size={18} />,
    title: 'Alert OBS',
    desc: 'Kelola efek suara dan animasi yang muncul otomatis di stream saat ada donasi masuk.',
  },
  {
    target: 'tour-mediaSettings',
    icon: <Video size={18} />,
    title: 'Media Share',
    desc: 'Donatur bisa request video YouTube atau GIF yang langsung tampil di stream-mu secara realtime.',
  },
  {
    target: 'tour-voiceSettings',
    icon: <Mic size={18} />,
    title: 'Voice Note',
    desc: 'Donatur bisa kirim pesan suara yang akan diputar otomatis di stream kamu.',
  },
  {
    target: 'tour-store',
    icon: <ShoppingBag size={18} />,
    title: 'Toko OBS',
    desc: 'Buat item yang bisa dibeli donatur — efek khusus, sound effect, atau interaksi unik lainnya.',
  },
  {
    target: 'tour-history',
    icon: <History size={18} />,
    title: 'Riwayat Donasi',
    desc: 'Lihat semua riwayat donasi yang masuk lengkap dengan nama, jumlah, dan pesan dari donatur.',
  },
  {
    target: 'tour-wallet',
    icon: <Wallet size={18} />,
    title: 'Penarikan Dana',
    desc: 'Tarik saldo donasi kamu ke rekening bank atau e-wallet kapan saja.',
  },
  {
    target: 'tour-inbox',
    icon: <Mail size={18} />,
    title: 'Inbox',
    desc: 'Baca semua pesan dan notifikasi penting dari platform di satu tempat.',
  },
  {
    target: 'tour-poll',
    icon: <Vote size={18} />,
    title: 'Poll & Voting',
    desc: 'Buat poll interaktif yang bisa diikuti penonton dan donatur selama live berlangsung.',
  },
  {
    target: 'tour-subathon',
    icon: <Clock size={18} />,
    title: 'Subathon',
    desc: 'Atur timer Subathon yang akan bertambah otomatis setiap ada donasi atau subscriber baru.',
},
{
target: 'tour-milestones',
icon: <TrendingUp size={18} />,
title: 'Milestones',
desc: 'Tetapkan target donasi dan beri hadiah spesial ketika target tercapai oleh komunitas kamu.',
},
{
target: 'tour-leaderboard',
icon: <Trophy size={18} />,
title: 'Leaderboard',
desc: 'Tampilkan donatur terbesar di overlay untuk mendorong semangat penonton bersaing.',
},
{
target: 'tour-feeConfig',
icon: <Receipt size={18} />,
title: 'Konfigurasi Fee',
desc: 'Atur besaran fee platform dan lihat transparansi potongan dari setiap donasi yang masuk.',
},
{
target: 'tour-sidebar-toggle',
icon: <Layout size={18} />,
title: 'Sidebar Navigation',
desc: 'Klik tombol ini untuk menyempitkan atau memperlebar sidebar. Sangat berguna saat layar kecil atau fokus ke satu fitur.',
placement: 'bottom',
},
{
target: 'tour-balance',
icon: <Wallet size={18} />,
title: 'Saldo & Kirim Dana',
desc: 'Pantau saldo kamu di navbar dan kirim saldo ke sesama streamer dengan satu klik.',
placement: 'bottom',
},
{
target: 'tour-theme-toggle',
icon: <Sun size={18} />,
title: 'Tema Gelap / Terang',
desc: 'Ganti tampilan dashboard antara mode Light dan Dark sesuai kenyamanan mata kamu.',
placement: 'bottom',
},
{
target: 'tour-help',
icon: <HeadphonesIcon size={18} />,   // pastikan import HeadphonesIcon
title: 'Bantuan & Kontak',
desc: 'Hubungi tim support, developer, atau admin Taptiptup jika butuh bantuan.',
placement: 'bottom',
},
{
target: 'tour-community',
icon: <Users size={18} />,   // pastikan import Users
title: 'Komunitas Streamer',
desc: 'Bertemu, berdiskusi, dan saling support dengan sesama streamer Taptiptup.',
placement: 'bottom',
},
{
target: 'tour-profile',
icon: <User size={18} />,   // pastikan import User dari lucide-react
title: 'Profil & Logout',
desc: 'Akses profil kamu, pengaturan akun, dan tombol keluar (logout).',
placement: 'bottom',
},
];

// ─── Scroll elemen target agar terlihat di dalam sidebar ──────────────────────
function scrollTargetIntoView(targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;

  // Cari ancestor scrollable (sidebar pakai overflow-y: auto)
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

    if (relTop < 0) {
      scrollable.scrollBy({ top: relTop - 16, behavior: 'smooth' });
    } else if (relBottom > containerRect.height) {
      scrollable.scrollBy({ top: relBottom - containerRect.height + 16, behavior: 'smooth' });
    }
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ─── Hook: posisi elemen target ───────────────────────────────────────────────
const PAD = 6;

function useTargetRect(targetId, active) {
  const [rect, setRect] = useState(null);

  useLayoutEffect(() => {
    if (!active || !targetId) return;

    let timer;
    const update = () => {
      const el = document.getElementById(targetId);
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    update();
    // Update lagi setelah scroll selesai (~420ms)
    timer = setTimeout(update, 420);

    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [targetId, active]);

  return rect;
}

// ─── Spotlight ────────────────────────────────────────────────────────────────
const Spotlight = ({ rect }) => {
  if (!rect) return null;
  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none z-[99990]"
        style={{ background: 'rgba(0,0,0,0.55)' }}
      />
      <motion.div
        className="fixed pointer-events-none z-[99991] rounded-lg"
        style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0)' }}
        animate={{
          top:       rect.top  - PAD,
          left:      rect.left - PAD,
          width:     rect.width  + PAD * 2,
          height:    rect.height + PAD * 2,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
          outline:   '2px solid #3b82f6',
          outlineOffset: '0px',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
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
      className="fixed z-[99999] w-[300px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none shadow-2xl p-5"
      style={{ top: pos.top, left: pos.left }}
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 8 }}
      transition={{ duration: 0.2 }}
      key={stepIndex}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
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
            className={`h-1.5 rounded-none transition-all duration-300 ${
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
          className="flex-1 py-2 text-xs font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          Lewati
        </button>
        <button
          onClick={onNext}
          className="flex-[2] py-2 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
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
      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-none flex items-center justify-center mx-auto mb-5">
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
      className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none p-8 w-full max-w-md text-center shadow-2xl"
    >
      <div className="w-16 h-16 bg-green-50 dark:bg-green-950/40 text-green-600 rounded-none flex items-center justify-center mx-auto mb-5">
        <Check size={28} />
      </div>
      <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">Tur selesai! 🎉</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
        Kamu sudah mengenal semua fitur TAPTIPTUP. Selamat streaming dan semoga donasimu melimpah!
      </p>
      <button
        onClick={onDone}
        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-black rounded-none text-sm cursor-pointer transition-all active:scale-[0.99] shadow-lg shadow-green-100 dark:shadow-green-900/20"
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

    // Jangan tampilkan tour di mobile
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