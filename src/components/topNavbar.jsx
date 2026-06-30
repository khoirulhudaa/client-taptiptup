import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ChevronRight, Expand, Eye, Shield,  EyeOff, HeadphonesIcon, LogOut, Moon, PanelLeftClose, PanelLeftOpen, SendHorizonal, Sun, Users, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InboxBell from "./inboxBell";
import { TransferModal } from "./transferModal";

const TAB_LABELS = {
  settings:      'Editor Overlay',
  alertSettings: 'Alert OBS',
  mediaSettings: 'Media Share',
  store:         'Toko OBS',
  history:       'Riwayat Donasi',
  wallet:        'Penarikan Dana',
  poll:          'Poll & Voting',
  feeConfig:     'Konfigurasi Fee',
  subathon:      'Subathon',
  milestones:    'Milestones',
  leaderboard:   'Leaderboard',
  inbox:         'Inbox',
  community:     'Komunitas',
  contact:       'Bantuan & Kontak',
  ghostAlert:    'Notif Hantu',
  whatsapp:      'WhatsApp',
  suggestions:   'Masukan Streamer',
  admin:         'Permintaan Penarikan',
};

// ─── Theme hook ───────────────────────────────────────────────────────────────

const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sawer-theme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('sawer-theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return { theme, toggle };
};


/* ─── Animasi Fade Right untuk TopNavbar ─── */
const navbarContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.20,    
      delayChildren: 1,     
    }
  }
};

const navbarItemVariants = {
  hidden: { 
    opacity: 0, 
    y: -10 
  },
  visible: { 
    opacity: 1, 
    y: -0,
    transition: {
      duration: 1,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

// ─── ThemeToggle button ───────────────────────────────────────────────────────

const ThemeToggle = ({ theme, onToggle }) => {
  const isDark = theme === 'dark';

  return (
    <motion.button
      id="tour-theme-toggle"
      onClick={onToggle}
      variants={navbarItemVariants}   // tambahkan ini
      whileTap={{ scale: 0.95 }}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
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
      cursor-pointer relative h-[38px] w-[70px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center px-1 transition-all active:scale-[0.99] hover:brightness-95 overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
            : 'linear-gradient(135deg, #1e1b4b 0%, #1e1b4b 100%)',
        }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {isDark && (
        <>
          <span className="absolute top-1.5 right-3 w-0.5 h-0.5 bg-white rounded-xl opacity-80" />
          <span className="absolute top-3 right-5 w-1 h-1 bg-white rounded-xl opacity-60" />
          <span className="absolute bottom-2 right-2 w-0.5 h-0.5 bg-white rounded-xl opacity-70" />
        </>
      )}

      {!isDark && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30">
          <svg viewBox="0 0 16 16" fill="#f59e0b">
            <circle cx="8" cy="8" r="4" />
          </svg>
        </span>
      )}

      <motion.div
        className="relative z-10 w-7 h-7 rounded-xl shadow-sm flex items-center justify-center"
        animate={{ x: isDark ? 30 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          background: isDark ? '#1e1b4b' : 'white',
          border: isDark ? '1px solid #4338ca' : '1px solid #e2e8f0',
        }}
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2 }}
            >
              <Moon size={13} className="text-blue-300" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 30, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -30, opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2 }}
            >
              <Sun size={13} className="text-amber-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
};

// ─── TopNavbar ─────────────────────────────────────────────────────────────────

export const TopNavbar = ({ user, onLogout, onProfile, activeTab, setActiveTab, navbar, isCollapsed, setIsCollapsed }) => {
  const [showLogout, setShowLogout]               = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showTransfer, setShowTransfer]           = useState(false);
  const [currentBalance, setCurrentBalance]       = useState(user?.balance ?? 0);
  const { theme, toggle } = useTheme();
  const [adminMode, setAdminMode] = useState(() => {
    return localStorage.getItem('adminMode') === 'true';
  });
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(() => {
    const saved = localStorage.getItem('showBalance');
    return saved === 'true';
  });

  useEffect(() => {
    setCurrentBalance(user?.balance ?? 0);
  }, [user?.balance]);

  useEffect(() => {
    if (!showLogout) return;
    const handleClickOutside = () => setShowLogout(false);
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showLogout]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleAdminMode = () => {
  const nextMode = !adminMode;

  setAdminMode(nextMode);
  localStorage.setItem('adminMode', String(nextMode));

  window.dispatchEvent(new Event('storage'));

  setShowLogout(false);
};

  useEffect(() => {
    localStorage.setItem('showBalance', showBalance);
  }, [showBalance]);

  const handleShowBalance = () => {
    const next = !showBalance;
    setShowBalance(next);
    localStorage.setItem('showBalance', String(next));
    window.dispatchEvent(new Event('balanceUpdate'));
  };

  const handleTransferSuccess = (newBalance) => {
    if (newBalance !== undefined) {
      setCurrentBalance(newBalance);
    }
    window.dispatchEvent(new Event('balanceUpdate'));
  };

  return (
    <>
      <div className={`hidden md:flex sticky top-0 ${navbar ? 'z-[1]' : 'z-[3]'} w-full bg-white dark:bg-transparent backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 py-4 flex items-center justify-between gap-4`}>

        {/* Kiri: Breadcrumb */}
        <div className="md:hidden 2xl:flex items-center gap-3 min-w-0">
          <div className="flex ml-[2.9px] items-center gap-1.5 min-w-0 pl-[5.8px]">
            <span 
            onClick={() => setActiveTab('settings')}
            className="
            -translate-y-[3px] translate-x-[-3px]
            [box-shadow:4px_6px_0_#f1f5f9]
            dark:[box-shadow:4px_4px_0_#99a3b1]
            hover:translate-y-0 hover:translate-x-0
            border border-slate-300
            hover:[box-shadow:0_0_0_#f1f5f9]
            dark:hover:[box-shadow:0_0_0_#94a3b8]
            active:translate-y-[2px] active:translate-x-[2px]
            active:[box-shadow:none] rounded-md px-2 cursor-pointer
            flex md:hidden 2xl:flex text-md font-bold text-slate-400 dark:text-white whitespace-nowrap">Dashboard</span>
            <ChevronRight size={16} className="text-slate-400 dark:text-slate-400 flex-shrink-0" />
            <span className="text-md font-bold text-slate-700 dark:text-slate-200 truncate">
              {TAB_LABELS[activeTab] || activeTab}
            </span>
          </div>
        </div>

        {/* Kanan */}
        <motion.div 
          variants={navbarContainerVariants}
          initial="hidden"
          animate="visible"
          id="tour-topnavbar-group" 
          className="flex items-center gap-3.5 md:pr-[7px] md:justify-end 2xl:w-max w-full flex-shrink-0">
          <motion.button
            id="tour-sidebar-toggle"
            variants={navbarItemVariants}
            style={{originX: 0}}
            onClick={() => setIsCollapsed(v => !v)}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="
              text-slate-900 dark:text-white 
              bg-slate-100 dark:bg-white/20
              -translate-y-[3px] translate-x-[-3px]
              [box-shadow:4px_6px_0_#f1f5f9]
              dark:[box-shadow:4px_4px_0_#99a3b1]
              hover:translate-y-0 hover:translate-x-0
              hover:bg-slate-200 dark:hover:bg-slate-700
              hover:[box-shadow:0_0_0_#f1f5f9]
              dark:hover:[box-shadow:0_0_0_#94a3b8]
              active:translate-y-[2px] active:translate-x-[2px]
              active:[box-shadow:none]
              active:bg-slate-300 dark:active:bg-slate-800
            rounded-xl cursor-pointer h-[40px] border border-slate-200/80 dark:border-slate-700 dark:bg-slate-800/60 w-max px-3.5 flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:brightness-110 transition-all"
          >
            <AnimatePresence mode="wait">
              {isCollapsed ? (
                <motion.span className="flex items-center justify-center gap-2 w-max" key="open">
                  <Expand size={17} />
                  <p className="text-md font-bold">Expanded</p>
                </motion.span>
              ) : (
                <motion.span className="flex items-center justify-center gap-2 w-max" key="close">
                  <PanelLeftClose size={17} />
                  <p className="text-md font-bold">Condense</p>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* ── Saldo + Tombol Kirim ─────────────────────────────────────── */}
          <motion.div
              id="tour-balance"  
              variants={navbarItemVariants}
              className="
                text-slate-900 dark:text-white 
                bg-slate-100 dark:bg-white/20
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
                hidden sm:flex items-center h-[40px] gap-0 rounded-xl border border-slate-200/80 dark:border-slate-700 overflow-hidden"
            >
            {/* Info saldo */}
            <div className="
            flex items-center gap-2 px-3.5 py-2 border-r border-slate-200/80 dark:border-slate-700">
              <Wallet size={18} className="text-white" />
              <span className="font-bold text-blue-600 dark:text-white text-md tracking-wide">
                {showBalance
                  ? `Rp ${parseFloat(currentBalance).toLocaleString('id-ID')}`
                  : 
                  <div className="gap-1.5 flex">
                    Rp 
                    <span className="relative top-1">
                      *********
                    </span>
                  </div>
                }
              </span>
              <button
                onClick={handleShowBalance}
                className="cursor-pointer p-2 rounded-xl bg-slate-100 dark:bg-slate-950/20 text-slate-400 hover:text-white transition-all hover:bg-blue-50 dark:hover:bg-blue-950/40"
              >
                {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Tombol Kirim Saldo */}
            <button
              id="tour-balance"
              onClick={() => setShowTransfer(true)}
              title="Kirim saldo ke streamer lain"
              className="cursor-pointer h-full px-3.5 flex items-center gap-1.5 text-slate-500 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-[0.97] group"
            >
              <SendHorizonal
                size={16.5}
                className="group-hover:translate-x-0.5 transition-transform"
              />
              <span className="text-md font-bold md:hidden 2xl:flex">Kirim</span>
            </button>
          </motion.div>

          {/* Theme toggle */}
          <motion.div variants={navbarItemVariants}>
            <ThemeToggle theme={theme} onToggle={toggle} />
          </motion.div>

          <motion.button
            id="tour-help"
            onClick={() => setActiveTab('contact')}
            variants={navbarItemVariants}
            className={`
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
              cursor-pointer h-[40px] active:scale-[0.99] flex items-center gap-2 px-3.5 rounded-xl border font-bold text-md transition-all ${
              activeTab === 'contact'
                ? 'bg-slate-800 dark:bg-slate-700 text-white border-transparent'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}>
            <HeadphonesIcon size={14} />
            <span className="text-md font-bold md:hidden 2xl:flex">Bantuan</span>
          </motion.button>

          <motion.div variants={navbarItemVariants}>
            <InboxBell setActiveTab={setActiveTab} />
          </motion.div>

          {/* Komunitas */}
          <motion.button
            id="tour-community"
            variants={navbarItemVariants}
            onClick={() => setActiveTab('community')}
            className="
              text-slate-900 dark:text-white 
                bg-slate-100 dark:bg-white/20
                -translate-y-[3px] translate-x-[-3px]
                [box-shadow:4px_6px_0_#f1f5f9]
                dark:[box-shadow:4px_4px_0_#99a3b1]
                hover:translate-y-0 hover:translate-x-0
                hover:bg-slate-200 dark:hover:bg-slate-700
                hover:[box-shadow:0_0_0_#f1f5f9]
                dark:hover:[box-shadow:0_0_0_#94a3b8]
                active:translate-y-[2px] active:translate-x-[2px]
                active:[box-shadow:none]
                active:bg-slate-300 dark:active:bg-slate-800
              cursor-pointer h-[38.4px] flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl px-3.5 py-3 transition-all active:scale-[0.99]"
            >
            <Users size={16} className="relative z-10 text-white/90" />
            <span className="hidden md:inline font-bold relative z-10 text-white tracking-wide">Komunitas</span>
          </motion.button>

          {/* Avatar + dropdown */}
          <div className="relative">
            <motion.button
              id="tour-profile"
              variants={navbarItemVariants}
              onClick={() => setShowLogout(v => !v)}
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
              cursor-pointer h-[38.4px] flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl px-[3.4px] py-3 transition-all active:scale-[0.99]"
            >
              <div className="relative top-[-0.5px] w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-md flex-shrink-0">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.username}
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = user.username?.charAt(0).toUpperCase() || '?';
                    }}
                  />
                ) : (
                  user.username?.charAt(0).toUpperCase() || '?'
                )}
              </div>
              <div className="text-left hidden sm:block">
                <p className="font-bold text-slate-800 dark:text-white text-md leading-tight">@{user.username}</p>
              </div>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 ml-0.5">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </motion.button>

            <AnimatePresence>
              {showLogout && (
                <>
                  <div className="fixed inset-0 z-[999999999999]" onClick={() => setShowLogout(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-20"
                  >
                    {/* Saldo mobile */}
                    <div className="sm:hidden px-4 py-3 border-b border-slate-50 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Wallet size={13} className="text-blue-400" />
                        <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                          Rp {parseFloat(currentBalance).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <button
                        onClick={() => { setShowLogout(false); setShowTransfer(true); }}
                        className="cursor-pointer mt-2 w-full flex items-center gap-2 py-2 px-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-all"
                      >
                        <SendHorizonal size={13} />
                        Kirim Saldo ke Streamer
                      </button>
                    </div>

                    {/* Theme toggle */}
                    <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400 font-bold">
                        {theme === 'dark' ? 'Mode Gelap' : 'Mode Terang'}
                      </span>
                      <ThemeToggle theme={theme} onToggle={toggle} />
                    </div>

                    <div className="p-1 space-y-1 z-[9999]">
                      <button
                        onClick={onProfile}
                        className="cursor-pointer w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold rounded-xl text-sm transition-all active:scale-[0.99]"
                      >
                        <div className="w-5 h-5 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-[10px]">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        Profil saya
                      </button>
                      {user?.role === 'streamerSuper' && (
                        <>
                          <div className="w-[92%] mx-auto h-[0.5px] bg-slate-100 dark:bg-slate-800" />
                          <button
                            onClick={handleAdminMode}
                            className={`cursor-pointer w-full flex items-center gap-3 px-4 py-2.5 font-bold rounded-xl text-sm transition-all active:scale-[0.99]
                            ${
                              adminMode
                                ? 'text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                                : 'text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30'
                            }`}
                          >
                            <Shield size={20} />
                            { adminMode ? 'Mode Streamer' : 'Mode Admin'}
                          </button>
                        </>
                      )}
                      <div className="w-[92%] mx-auto h-[0.5px] bg-slate-100 dark:bg-slate-800" />
                      <button
                        onClick={() => { setShowLogout(false); setShowLogoutConfirm(true); }}
                        className="cursor-pointer ml-[1.3px] relative w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-bold rounded-xl text-sm transition-all active:scale-[0.99]"
                      >
                        <LogOut size={19} />
                        Keluar
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* ── Modal Transfer ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showTransfer && (
          <TransferModal
            user={{ ...user, balance: currentBalance }}
            onClose={() => setShowTransfer(false)}
            onSuccess={handleTransferSuccess}
          />
        )}
      </AnimatePresence>

      {/* ── Modal Konfirmasi Logout ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-4 md:p-6 z-[9999] shadow-2xl text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-950/40 text-red-600 rounded-xl flex items-center justify-center">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Konfirmasi Keluar</h3>
              <p className="text-slate-500 dark:text-slate-400 font-bold mb-8">Apakah kamu yakin ingin akhiri sesi ini?</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleLogout}
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
                  cursor-pointer active:scale-[0.99] w-full py-4 bg-red-600 text-white rounded-xl font-bold text-md shadow-xl shadow-red-200 dark:shadow-red-900/20 hover:bg-red-700 transition-all"
                >
                  Ya, Keluar
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
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
                  cursor-pointer active:scale-[0.99] w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};