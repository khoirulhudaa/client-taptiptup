import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Bell,
  Heart,
  History,
  Layout,
  LogOut,
  Mail,
  Megaphone,
  MessageSquare,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  QrCode,
  ReceiptText,
  ShieldAlert,
  ShoppingBag,
  Terminal,
  Timer,
  TrendingUp,
  Trophy,
  Users,
  Video,
  Vote,
  Wallet,
  X,
  Music,
  Zap,
  ZapIcon,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const getTokenPayload = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

/* ─── CSS untuk efek tombol melayang ─── */
const btnTransition = {
  style: {
    transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1), background 0.2s ease',
  },
};

const menuContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.24,    // cepat & natural
      delayChildren: 0.1,      // hampir instan
    }
  }
};

const menuItemVariants = {
  hidden: { 
    opacity: 0, 
    y: 25 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,                    // durasi tiap item
      ease: [0.22, 1, 0.36, 1],
    }
  }
};

const getBtnClass = (isActive, extraClass = '') => {
  const base = `
    cursor-pointer mb-4 w-max md:w-full flex rounded-lg font-black text-sm select-none
    ${extraClass}
  `;

 if (isActive) {
    return base + `
      bg-blue-600 text-white
      -translate-y-[3px] translate-x-[-3px]
      [box-shadow:4px_4px_0_#93c5fd]
      hover:translate-y-0 hover:translate-x-0
      border border-slate-300
      hover:[box-shadow:0_0_0_#93c5fd]
      active:[box-shadow:none]
    `;
  }

  return base + `
    text-slate-900 dark:text-white bg-slate-100 dark:bg-white/20
    -translate-y-[3px] translate-x-[-3px]
    [box-shadow:4px_6px_0_#f1f5f9]
    dark:[box-shadow:4px_4px_0_#99a3b1]
    hover:translate-y-0 hover:translate-x-0
    hover:bg-slate-200 dark:hover:bg-slate-700
    border border-slate-300
    hover:[box-shadow:0_0_0_#f1f5f9]
    dark:hover:[box-shadow:0_0_0_#94a3b8]
    active:[box-shadow:none]
    active:bg-slate-300 dark:active:bg-slate-800
  `;
};

const Sidebar = ({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [superMode, setSuperMode] = useState(() => {
    return localStorage.getItem('adminMode') === 'true';
  });

  const payload = getTokenPayload();
  const isSuperAdmin = payload?.role === 'superAdmin';
  const isStreamerSuper = payload?.role === 'streamerSuper';

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const syncAdminMode = () => {
      setSuperMode(localStorage.getItem('adminMode') === 'true');
    };
    syncAdminMode();
    window.addEventListener('storage', syncAdminMode);
    return () => window.removeEventListener('storage', syncAdminMode);
  }, []);

  const hideForSuperAdmin = [
    'alertSettings','mediaSettings','voiceSettings','store','songSettings',
    'history','marquee','wallet','donatePageConfig','qrConfig','poll',
    'feeConfig','subathon','milestones','leaderboard'
  ];

  const hideForAdminMode = [
    'alertSettings','mediaSettings','voiceSettings','store','songSettings','donatePageConfig',
    'history','wallet','poll','marquee','qrConfig','feeConfig','subathon','milestones','leaderboard'
  ];

  const handleAdminMode = () => {
    const nextMode = !superMode;
    setSuperMode(nextMode);
    localStorage.setItem('adminMode', String(nextMode));
    window.dispatchEvent(new Event('storage'));
  };

  const menuGroups = [
    {
      groupLabel: 'OBS & Overlay',
      items: [
        { id: 'settings',      label: isSuperAdmin ? 'Statistik' : 'Overlay', icon: <Layout size={20} /> },
        { id: 'alertSettings', label: 'Alert',      icon: <ZapIcon size={20} /> },
        { id: 'mediaSettings', label: 'Medser',     icon: <Video size={20} /> },
        { id: 'songSettings',  label: 'Req-Song',   icon: <Music size={20} /> },
        { id: 'marquee',       label: 'Marquee',    icon: <Users size={20} /> },
        { id: 'qrConfig',      label: 'QR Code',    icon: <QrCode size={20} /> },
        { id: 'voiceSettings', label: 'Voice',      icon: <Mic size={20} /> },
        { id: 'store',         label: 'Produk',     icon: <ShoppingBag size={20} /> },
      ]
    },
    {
      groupLabel: 'Keuangan',
      items: [
        { id: 'wallet',      label: 'Pencairan', icon: <Wallet size={20} /> },
        { id: 'history',     label: 'Riwayat',   icon: <History size={20} /> },
        { id: 'ipBlacklist', label: 'IP Blokir', icon: <Shield size={20} /> },
      ]
    },
    {
      groupLabel: 'Interaksi',
      items: [
        { id: 'inbox',       label: 'Pesan',     icon: <Mail size={20} /> },
        { id: 'poll',        label: 'Polling',   icon: <Vote size={20} /> },
        { id: 'subathon',    label: 'Subathon',  icon: <Timer size={20} /> },
        { id: 'milestones',  label: 'Target',    icon: <TrendingUp size={20} /> },
        { id: 'leaderboard', label: 'Peringkat', icon: <Trophy size={20} /> },
      ]
    },
    {
      groupLabel: 'Konfigurasi',
      items: [
        { id: 'donatePageConfig', label: 'Donasi', icon: <Heart size={20} /> },
        { id: 'feeConfig',        label: 'Biaya',  icon: <ReceiptText size={20} /> },
      ]
    },
    ...(isSuperAdmin ? [{
      groupLabel: 'Admin',
      items: [
        { id: 'suggestions',     label: 'Saran',      icon: <MessageSquare size={20} /> },
        { id: 'ghostAlert',      label: 'Test notif', icon: <Zap size={20} /> },
        { id: 'streamerManager', label: 'Data User',  icon: <Users size={20} /> },
        { id: 'terminal',        label: 'Riwayat',    icon: <Terminal size={20} /> },
        { id: 'maintenance',     label: 'Perbaikan',  icon: <ShieldAlert size={20} /> },
        { id: 'announcements',   label: 'Informasi',  icon: <Megaphone size={20} /> },
      ]
    }] : [])
  ];

  /* layout kelas per collapse state */
  const itemLayout = isCollapsed
    ? 'md:flex-col items-center justify-center px-3 md:px-1 py-2 gap-1'
    : 'flex-row items-center gap-3 px-4 py-3';

  return (
    <>
      {/* ── MODAL LOGOUT ── */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full md:max-w-md bg-white dark:bg-slate-900 rounded-lg p-5 md:p-10 z-[9999] shadow-2xl text-center overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-950/40 text-red-600 rounded-lg flex items-center justify-center">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Konfirmasi Keluar</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-md font-medium mb-8">
                Apakah kamu yakin ingin ahirir sesi ini?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleLogout}
                  className="cursor-pointer active:scale-[0.99] hover:brightness-90 w-full py-3 md:py-4 bg-red-600 text-white rounded-lg font-black text-md md:text-lg shadow-xl shadow-red-200 dark:shadow-red-900/20 hover:bg-red-700"
                >
                  Ya, Keluar
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="cursor-pointer active:scale-[0.99] hover:brightness-90 w-full py-3 md:py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-black text-md md:text-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── SIDEBAR ── */}
      <aside
        id="tour-sidebar-group"
        className={`
          fixed lg:sticky top-0 left-0 h-[100dvh] lg:h-screen overflow-y-auto overflow-x-hidden
          bg-white/5 dark:bg-slate-900
          border-r border-slate-100 dark:border-slate-800
          py-4 z-[99999] lg:z-[1] flex flex-col
          transition-all duration-300 ease-in-out
          w-full px-2
          ${isCollapsed ? 'lg:w-[130px] 2xl:w-[142px]' : 'lg:w-[200px] 2xl:w-[20vw]'}
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center mb-8 md:mb-11 mt-[-4px] pr-2 ${isCollapsed ? 'md:justify-center px-1' : 'px-2 justify-between md:px-[8.5px] relative top-[1px]'}`}>
          {isCollapsed && (
            <a href='/'>
              <div className="w-11 md:w-full h-11 md:h-12 bg-blue-600  border border-slate-300/80 shadow-none rounded-lg flex items-center justify-center">
                <img src="/tttnews.png" alt="icon" className="w-[75%] md:w-[40%]" />
              </div>
            </a>
          )}
          {!isCollapsed && (
            <a href='/'>
              <div className="flex shadow-none items-center gap-3">
                <div className="ml-0 mt-[-2px] w-10 h-10 bg-blue-600  border border-slate-300 rounded-lg flex items-center justify-center">
                  <img src="/tttnews.png" alt="icon" className="w-[88%]" />
                </div>
                <h1 className="text-lg ml-0 font-black tracking-tight text-slate-800 dark:text-slate-100 whitespace-nowrap">TAPTIPTUP</h1>
              </div>
            </a>
          )}
        </div>

        {/* Toggle Admin/Streamer Mode (Mobile Only) */}
        {isStreamerSuper && (
          <div className="lg:hidden mb-4 px-2">
            <div className='relative text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white mb-2'>
              {superMode ? 'Mode Admin' : 'Mode Streamer'}
            </div>
            <div className="flex items-center gap-3 rounded-lg">
              <button
                onClick={handleAdminMode}
                className={`relative cursor-pointer active:scale-[0.99] hover:brightness-95 w-16 h-8 rounded-lg transition-colors duration-200 ease-in-out ${
                  superMode ? 'bg-blue-600' : 'bg-amber-600'
                }`}
              >
                <motion.div
                  className="absolute top-1 w-7 h-6 bg-white rounded-lg"
                  animate={{ left: superMode ? '31.7px' : '4px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className={`${isCollapsed ? 'mt-[-14.5px] md:mt-[-33.5px] relative' : 'mt-0'} md:border-0 border-t border-slate-500/30 pt-5 md:flex-1 space-y-1 px-2`}>
          
          <motion.div
            variants={menuContainerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-0"
          >
            {menuGroups.map((group, groupIndex) => {
              const visibleItems = group.items.filter(item => {
                if (isSuperAdmin && hideForSuperAdmin.includes(item.id)) return false;
                if (isStreamerSuper && superMode && hideForAdminMode.includes(item.id)) return false;
                return true;
              });
              if (visibleItems.length === 0) return null;

              return (
                <div key={group.groupLabel}>
                  {/* Group Label */}
                  {!isCollapsed && (
                    <div className="relative text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white mb-2">
                      {group.groupLabel}
                      <div className='top-1/2 absolute right-0 w-[66%] h-[1px] bg-white/10'></div>
                    </div>
                  )}
                  {isCollapsed && (
                    <div className="md:hidden flex text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-left mb-1 md:px-1 leading-tight">
                      {group.groupLabel}
                    </div>
                  )}

                  {/* Menu Items */}
                  <div className="space-y-1 flex md:block flex-wrap gap-3 md:gap-0 pt-4">
                    {visibleItems.map((item) => (
                      <motion.button
                        key={item.id}
                        id={`tour-${item.id}`}
                        onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                        {...btnTransition}
                        variants={menuItemVariants}
                        className={getBtnClass(activeTab === item.id, itemLayout)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <span className="flex-shrink-0">{item.icon}</span>
                        {isCollapsed ? (
                          <span className="text-[12px] font-bold text-center leading-tight break-words w-full">
                            {item.label}
                          </span>
                        ) : (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="whitespace-nowrap overflow-hidden"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Super Admin Section */}
            {isStreamerSuper && superMode && (
              <div>
                <div className="relative text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 mt-6">
                  Super Admin
                  <div className='top-1/2 absolute right-0 w-[66%] h-[1px] bg-white/10'></div>
                </div>
                <div className="space-y-1">
                  {[
                    { id: 'suggestions',     label: 'Saran',      icon: <MessageSquare size={20} /> },
                    { id: 'ghostAlert',      label: 'Test Notif', icon: <Zap size={20} /> },
                    { id: 'streamerManager', label: 'Data User',  icon: <Users size={20} /> },
                    { id: 'terminal',        label: 'Riwayat',    icon: <Terminal size={20} /> },
                    { id: 'maintenance',     label: 'Perbaikan',  icon: <ShieldAlert size={20} /> },
                    { id: 'announcements',   label: 'Informasi',  icon: <Megaphone size={20} /> },
                  ].map((item) => (
                    <motion.button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                      {...btnTransition}
                      variants={menuItemVariants}
                      className={getBtnClass(activeTab === item.id, itemLayout)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className="text-[12px] font-bold text-center leading-tight break-words w-full">
                        {item.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          <div className="w-full h-[1px] my-3 bg-slate-200 dark:bg-slate-800" />

          {isSuperAdmin && (
            <motion.button
              id="tour-admin"
              onClick={() => { setActiveTab('admin'); setIsSidebarOpen(false); }}
              {...btnTransition}
              variants={menuItemVariants}
              className={getBtnClass(activeTab === 'admin', isCollapsed ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-3')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <ShieldAlert size={20} />
              {!isCollapsed && <span className="whitespace-nowrap">Permintaan Penarikan</span>}
            </motion.button>
          )}

          <button 
          onClick={() => setIsSidebarOpen(false)}
          className='
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
          w-full py-2.5 md:hidden flex items-center rounded-xl text-sm justify-center text-white bg-red-500 font-bold cursor-pointer active:scale-[0.98] hover:bg-red-600'>
            Tutup
          </button>

        </nav>
      </aside>
    </>
  );
};

export default Sidebar;