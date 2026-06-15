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
  Zap,
  ZapIcon
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

const Sidebar = ({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [superMode, setSuperMode] = useState(() => {
    return localStorage.getItem('adminMode') === 'true';
  });

  const payload = getTokenPayload();
  const isSuperAdmin = payload?.role === 'superAdmin';
  const isStreamerSuper = payload?.role === 'streamerSuper'; // ← tambah

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const syncAdminMode = () => {
      setSuperMode(localStorage.getItem('adminMode') === 'true');
    };

    syncAdminMode(); // <-- tambahkan ini

    window.addEventListener('storage', syncAdminMode);

    return () => {
      window.removeEventListener('storage', syncAdminMode);
    };
  }, []);

  const superAdminOnly = ['whatsapp', 'suggestions', 'ghostAlert'];

  const hideForSuperAdmin = [
    'alertSettings',
    'mediaSettings',
    'voiceSettings',
    'store',
    'history',
    'wallet',
    'poll',
    'feeConfig',
    'subathon',
    'milestones',
    'leaderboard'
  ];

  const hideForAdminMode = [
    'alertSettings', 'mediaSettings', 'voiceSettings', 'store',
    'history', 'wallet', 'poll', 'feeConfig', 'subathon', 'milestones', 'leaderboard'
  ];

  const menuItems = [
    { id: 'settings',      label: 'Editor Overlay',   icon: <Layout size={20} /> },
    { id: 'alertSettings', label: 'Alert OBS',         icon: <ZapIcon size={20} /> },
    { id: 'mediaSettings', label: 'Media Share',       icon: <Video size={20} /> },
    { id: 'voiceSettings', label: 'Voice Note',        icon: <Mic size={20} /> },
    { id: 'store',         label: 'Label produk',          icon: <ShoppingBag size={20} /> },
    { id: 'history',       label: 'Riwayat Donasi',    icon: <History size={20} /> },
    { id: 'wallet',        label: 'Penarikan Dana',    icon: <Wallet size={20} /> },
    { id: 'poll',          label: 'Poll & Voting',     icon: <Vote size={20} /> },
    { id: 'feeConfig',     label: 'Konfigurasi Fee',   icon: <ReceiptText size={20} /> },
    { id: 'subathon',      label: 'Subathon',          icon: <Timer size={20} /> },
    { id: 'milestones',    label: 'Milestones',        icon: <TrendingUp size={20} /> },
    { id: 'leaderboard',   label: 'Leaderboard',       icon: <Trophy size={20} /> },

    ...(isSuperAdmin ? [
      { id: 'whatsapp',    label: 'WhatsApp',          icon: <MessageSquare size={20} /> },
      { id: 'suggestions', label: 'Masukan Streamer',  icon: <MessageSquare size={20} /> },
      { id: 'ghostAlert',  label: 'Admin Notif Hantu', icon: <Zap size={20} /> },
      {
        id: 'streamerManager',
        label: 'Kelola Streamer',
        icon: <Users size={20} />,
      },
    ] : [])
  ];

  // Function to toggle Admin/Streamer mode
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
        { id: 'settings',      label: isSuperAdmin ? 'Statistik Overall' : 'Editor Overlay', icon: <Layout size={20} /> },
        { id: 'alertSettings', label: 'Notifikasi Alert',      icon: <ZapIcon size={20} /> },
        { id: 'mediaSettings', label: 'Mediashare',    icon: <Video size={20} /> },
        { id: 'marquee', label: 'Marquee Donor', icon: <Users size={20} /> },
        { id: 'voiceSettings', label: 'Voice Note',     icon: <Mic size={20} /> },
        { id: 'store',         label: 'Label produk',       icon: <ShoppingBag size={20} /> },
      ]
    },
    {
      groupLabel: 'Keuangan',
      items: [
        { id: 'history', label: 'Riwayat Donasi', icon: <History size={20} /> },
        { id: 'wallet',  label: 'Penarikan Dana', icon: <Wallet size={20} /> },
      ]
    },
    {
      groupLabel: 'Interaksi',
      items: [
        { id: 'inbox',       label: 'Pesan Masuk',        icon: <Mail size={20} /> },
        { id: 'poll',        label: 'Poll & Voting', icon: <Vote size={20} /> },
        { id: 'subathon',    label: 'Subathon',      icon: <Timer size={20} /> },
        { id: 'milestones',  label: 'Milestones',    icon: <TrendingUp size={20} /> },
        { id: 'leaderboard', label: 'Leaderboard',   icon: <Trophy size={20} /> },
      ]
    },
    {
      groupLabel: 'Konfigurasi',
      items: [
        { id: 'donatePageConfig', label: 'Halaman Donasi', icon: <Heart size={20} /> },
        { id: 'feeConfig',        label: 'Biaya layanan',    icon: <ReceiptText size={20} /> },
      ]
    },

    ...(isSuperAdmin ? [{
      groupLabel: 'Admin',
      items: [
        { id: 'suggestions',  label: 'Masukan Streamer', icon: <MessageSquare size={20} /> },
        { id: 'ghostAlert',   label: 'Testing notif',      icon: <Zap size={20} /> },
        {
          id: 'streamerManager',
          label: 'Kelola Streamer',
          icon: <Users size={20} />,
        },
        { id: 'terminal',     label: 'Log Donasi',       icon: <Terminal size={20} /> },
        { id: 'maintenance',  label: 'Maintenance Mode', icon: <ShieldAlert size={20} /> },
        { id: 'announcements',label: 'Pengumuman',       icon: <Megaphone size={20} /> },
      ]
    }] : [])
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (isSuperAdmin && hideForSuperAdmin.includes(item.id)) return false;
    return true;
  });

  return (
    <>
      {/* ── MODAL LOGOUT ── */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-6">
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
        className={`
          fixed lg:sticky top-0 left-0 h-[100dvh] lg:h-screen overflow-y-auto overflow-x-hidden
          bg-white/5 dark:bg-slate-900
          // backdrop-blur-sm
          border-r border-slate-100 dark:border-slate-800
          py-4 z-[99999] lg:z-[1] flex flex-col
          transition-all duration-300 ease-in-out
          w-full lg:w-auto
          px-2
          ${isCollapsed ? 'lg:max-w-[120px] lg:min-w-[120px]' : 'lg:max-w-[19vw] lg:min-w-[20vw]'}
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center mb-8 md:mb-11 ${isCollapsed ? 'justify-center px-2' : 'px-2 justify-between md:px-[8.5px] relative top-[1px]'}`}>
          {!isCollapsed && (
            <a href='/'>
              <div className="flex shadow-none items-center gap-3">
                <div className="ml-0 mt-[-2px] w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xl italic">
                  <img src="/tttnews.png" alt="icon" className="w-[88%]" />
                </div>
                <h1 className="text-lg ml-0 font-black tracking-tight text-slate-800 dark:text-slate-100 whitespace-nowrap">TAPTIPTUP</h1>
              </div>
            </a>
          )}
          {isCollapsed && ( 
            <a href='/'>
              <div className="w-full h-12 bg-blue-600 shadow-none rounded-lg flex items-center justify-center">
                <img src="/tttnews.png" alt="icon" className={`${isCollapsed ? 'w-[40%]' : 'w-[60%]'}`} />
              </div>
            </a>
          )}

          {/* Close button (mobile only) */}
          {!isCollapsed && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="relative left-3.5 w-max cursor-pointer active:scale-[0.95] hover:text-red-600 lg:hidden p-2 text-red-500"
            >
              <X size={30} />
            </button>
          )}
        </div>

        {/* Toggle Admin/Streamer Mode (Mobile Only) */}
        {isStreamerSuper && (
          <div className="lg:hidden mb-4 px-2">
            <div className='relative text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white mb-2'>
              {superMode ? 'Mode Admin' : 'Mode Streamer'}
            </div>
            <div className="flex items-center justify-stsrt gap-2 rounded-lg">
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

        {/* Section label */}
        {!isCollapsed && (
          <div className="md:flex hidden pt-2 pb-2 px-2 relative mb-4">
            <div className='top-1/2 absolute right-0 w-[66%] h-[1px] bg-white/10'></div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-100 uppercase tracking-widest">Menu Utama</p>
          </div>
        )}

        {/* Navigation */}
        <nav className={`${isCollapsed ? 'mt-[-4px]' : 'mt-0'} md:flex-1 space-y-4 px-2`}>
          {menuGroups.map((group) => {
            const visibleItems = group.items.filter(item => {
              if (isSuperAdmin && hideForSuperAdmin.includes(item.id)) return false;
              if (isStreamerSuper && superMode && hideForAdminMode.includes(item.id)) return false; // ← tambah
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
                  <div className="w-6 h-[1px] mx-auto bg-slate-300 dark:bg-slate-700 mb-1" />
                )}

                {/* Items */}
                <div className="space-y-1">
                  {visibleItems.map((item) => (
                    <button
                      key={item.id}
                      id={`tour-${item.id}`}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsSidebarOpen(false);
                      }}
                      title={isCollapsed ? item.label : undefined}
                      className={`cursor-pointer mb-2 active:scale-[0.99] w-full flex items-center gap-4 rounded-lg font-black text-sm 
                        ${isCollapsed ? 'justify-center px-0 py-3' : 'px-4 py-3'}
                        ${
                          activeTab === item.id
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-900 dark:text-white bg-slate-100 dark:bg-white/20 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {/* {!isCollapsed && (
            <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="md:hidden w-full flex items-center gap-4 p-3 px-4 bg-red-100 dark:bg-red-900 text-white hover:bg-red-50 dark:hover:bg-red-950 rounded-lg cursor-pointer active:scale-[0.99] font-black"
              >
                <LogOut size={18} className='relative left-[1.2px]' />
                <span className="text-sm ml-[2.2px]">Keluar</span>
              </button>
            </div>
          )} */}

          <div className="w-full h-[1px] my-3 bg-slate-200 dark:bg-slate-800" />

          {isSuperAdmin && (
            <button
              id="tour-admin" 
              onClick={() => {
                setActiveTab('admin');
                setIsSidebarOpen(false);
              }}
              title={isCollapsed ? 'Permintaan Penarikan' : undefined}
              className={`cursor-pointer mb-2 w-full flex items-center rounded-lg font-black text-sm
                ${isCollapsed ? 'justify-center px-0 py-3' : 'gap-4 px-4 py-3'}
                ${
                  activeTab === 'admin'
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 dark:shadow-blue-900/30'
                    : 'text-slate-400 bg-white/20 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
            >
              <ShieldAlert size={20} />
              {!isCollapsed && <span className="whitespace-nowrap">Permintaan Penarikan</span>}
            </button>
          )}

          {isStreamerSuper && superMode && (
            <>
              <div className="relative text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                {'Super Admin'}
                <div className='top-1/2 absolute right-0 w-[66%] h-[1px] bg-white/10'></div>
              </div>

              {/* Menu admin yang muncul jika superMode ON */}
              {superMode && (
                <div className="space-y-1">
                  {[
                    { id: 'suggestions',     label: 'Masukan Streamer', icon: <MessageSquare size={20} /> },
                    { id: 'ghostAlert',      label: 'Testing notif',      icon: <Zap size={20} /> },
                    { id: 'streamerManager', label: 'Kelola Streamer',  icon: <Users size={20} /> },
                    { id: 'terminal',        label: 'Log Donasi',       icon: <Terminal size={20} /> },
                    { id: 'maintenance',     label: 'Maintenance Mode', icon: <ShieldAlert size={20} /> },
                    { id: 'announcements',   label: 'Pengumuman',       icon: <Megaphone size={20} /> },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                      title={isCollapsed ? item.label : undefined}
                      className={`cursor-pointer mb-2 active:scale-[0.99] w-full flex items-center gap-4 rounded-lg font-black text-sm
                        ${isCollapsed ? 'justify-center px-0 py-3' : 'px-4 py-3'}
                        ${activeTab === item.id
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-900 dark:text-white bg-slate-100 dark:bg-white/20 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      {!isCollapsed && (
                        <span className="whitespace-nowrap overflow-hidden">{item.label}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {!isCollapsed && (
            <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="md:hidden w-full flex items-center gap-4 p-3 px-4 bg-red-100 dark:bg-red-900 text-white hover:bg-red-50 dark:hover:bg-red-950 rounded-lg cursor-pointer active:scale-[0.99] font-black"
              >
                <LogOut size={18} className='relative left-[1.2px]' />
                <span className="text-sm ml-[2.2px]">Keluar</span>
              </button>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;