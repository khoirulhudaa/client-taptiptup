// components/InboxBell.jsx
// Gunakan komponen InboxBell di TopNavbar
// dan InboxPage di tab 'inbox'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  Clock,
  ImageIcon,
  Info,
  Loader2,
  Megaphone,
  Star,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import api from '../lib/axiosInstance';

// ─── Config ─────────────────────────────────────────────────────────────────

export const TYPE_CONFIG = {
  info:        { label: 'Info',        icon: <Info size={13} />,          color: '#3b82f6', bg: 'bg-blue-100 dark:bg-blue-950/50',   text: 'text-blue-600 dark:text-blue-400',   border: 'border-blue-200 dark:border-blue-900' },
  warning:     { label: 'Peringatan',  icon: <AlertTriangle size={13} />, color: '#f59e0b', bg: 'bg-amber-100 dark:bg-amber-950/50', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-900' },
  update:      { label: 'Update',      icon: <Zap size={13} />,           color: '#10b981', bg: 'bg-emerald-100 dark:bg-emerald-950/50', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-900' },
  promo:       { label: 'Promo',       icon: <Star size={13} />,          color: '#ec4899', bg: 'bg-pink-100 dark:bg-pink-950/50',   text: 'text-pink-600 dark:text-pink-400',   border: 'border-pink-200 dark:border-pink-900' },
  maintenance: { label: 'Maintenance', icon: <Wrench size={13} />,        color: '#64748b', bg: 'bg-slate-100 dark:bg-slate-800',    text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700' },
};

const fmtDate = (d) => {
  if (!d) return '-';
  const date = new Date(d);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffH < 24) return `${diffH} jam lalu`;
  if (diffD < 7) return `${diffD} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ─── API ─────────────────────────────────────────────────────────────────────

const fetchAnnouncements = () => api.get('/api/announcements').then(r => r.data);
const fetchUnreadCount = () => api.get('/api/announcements/unread-count').then(r => r.data);
const markRead = (id) => api.post(`/api/announcements/${id}/read`).then(r => r.data);
const markAllRead = () => api.post('/api/announcements/read-all').then(r => r.data);

// ─── InboxBell (for TopNavbar) ────────────────────────────────────────────────

export const InboxBell = ({ setActiveTab }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const { data: unreadData } = useQuery({
    queryKey: ['announcementsUnread'],
    queryFn: fetchUnreadCount,
    refetchInterval: 60000,
  });

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: fetchAnnouncements,
    refetchInterval: 60000,
    enabled: open,
  });

  const readMutation = useMutation({
    mutationFn: markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcementsUnread'] });
    },
  });

  const readAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcementsUnread'] });
    },
  });

  const unread = unreadData?.unread || 0;

  const handleOpen = () => {
    setOpen(v => !v);
    if (!open) queryClient.invalidateQueries({ queryKey: ['announcements'] });
  };

  const handleRead = (id) => {
    setExpandedId(v => v === id ? null : id);
    readMutation.mutate(id);
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className={`cursor-pointer h-[38px] w-[38px] flex items-center justify-center rounded-none border transition-all active:scale-[0.97] relative ${
          open
            ? 'bg-blue-600 border-blue-600 text-white'
            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
      >
        <Bell size={16} className={open ? 'text-white' : ''} />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-none"
          >
            {unread > 9 ? '9+' : unread}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-[-127%] top-full mt-2 w-[88vw] md:w-120 bg-white dark:bg-slate-900 rounded-none shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-[9999]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-blue-500" />
                  <span className="font-black text-sm text-slate-700 dark:text-slate-200">Inbox</span>
                  {unread > 0 && (
                    <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-[10px] font-black rounded-none">
                      {unread} baru
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button
                      onClick={() => readAllMutation.mutate()}
                      disabled={readAllMutation.isPending}
                      className="cursor-pointer text-[10px] font-black text-blue-500 hover:text-blue-700 flex items-center gap-1"
                    >
                      <CheckCheck size={11} /> Baca semua
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="cursor-pointer text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-[68vh] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-10 text-slate-400 gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm font-bold">Memuat...</span>
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="py-10 text-center text-slate-400">
                    <Bell size={24} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-bold">Tidak ada pengumuman</p>
                  </div>
                ) : (
                  announcements.map((ann) => {
                    const cfg = TYPE_CONFIG[ann.type] || TYPE_CONFIG.info;
                    const isExpanded = expandedId === ann._id;
                    return (
                      <div
                        key={ann._id}
                        className={`border-b border-slate-50 dark:border-slate-800 last:border-0 transition-all ${
                          !ann.isRead ? 'bg-blue-50/40 dark:bg-blue-950/10' : ''
                        }`}
                      >
                        <button
                          onClick={() => handleRead(ann._id)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-7 h-7 rounded-none flex items-center justify-center flex-shrink-0 mt-0.5`}
                              style={{ background: cfg.color + '20', color: cfg.color }}>
                              {cfg.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm font-black ${ann.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-slate-100'}`}>
                                  {ann.title}
                                </p>
                                {!ann.isRead && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-none flex-shrink-0 mt-1.5" />
                                )}
                              </div>
                              <p className={`text-[11px] font-medium mt-0.5 ${isExpanded ? '' : 'line-clamp-2'} text-slate-500 dark:text-slate-400`}>
                                {ann.description}
                              </p>
                              <div className="flex items-center justify-between mt-1.5">
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-none border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                  {cfg.label}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">{fmtDate(ann.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Expanded content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pt-3 space-y-3">
                                {ann.imageUrl && (
                                  <img src={ann.imageUrl} alt={ann.title}
                                    className="w-full max-h-40 object-cover rounded-none border border-slate-200 dark:border-slate-700" />
                                )}
                                {ann.expiresAt && (
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                                    <Clock size={10} />
                                    Berlaku hingga {new Date(ann.expiresAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <button
                  onClick={() => { setOpen(false); setActiveTab('inbox'); }}
                  className="cursor-pointer w-full text-center text-[11px] font-black text-blue-500 hover:text-blue-700 py-1"
                >
                  Lihat semua pengumuman →
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── InboxPage (full page tab) ────────────────────────────────────────────────

export const InboxPage = () => {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');

  const { data: announcements = [], isLoading, refetch } = useQuery({
    queryKey: ['announcements'],
    queryFn: fetchAnnouncements,
    refetchInterval: 60000,
  });

  const readMutation = useMutation({
    mutationFn: markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcementsUnread'] });
    },
  });

  const readAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcementsUnread'] });
    },
  });

  const handleExpand = (ann) => {
    setExpandedId(v => v === ann._id ? null : ann._id);
    if (!ann.isRead) readMutation.mutate(ann._id);
  };

  const filtered = typeFilter ? announcements.filter(a => a.type === typeFilter) : announcements;
  const unreadCount = announcements.filter(a => !a.isRead).length;

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 from-blue-700 to-indigo-800 rounded-none p-4 md:p-5 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #6366f1 0%, transparent 50%)' }} />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Bell size={14} className="text-blue-200 dark:text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 dark:text-slate-400">Notifikasi</span>
            </div>
            <h1 className="text-lg md:text-lg font-black tracking-tight">Inbox</h1>
            <p className="text-blue-200 dark:text-slate-400 text-sm font-medium mt-1">
              Pengumuman & informasi terbaru dari tim TAPTIPTUP
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => readAllMutation.mutate()}
              disabled={readAllMutation.isPending}
              className="cursor-pointer flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-none font-black text-sm border border-white/20 transition-all active:scale-[0.97] disabled:opacity-60"
            >
              <CheckCheck size={15} />
              {readAllMutation.isPending ? 'Memproses...' : 'Tandai semua dibaca'}
            </button>
          )}
        </div>
        <div className="relative mt-5 flex gap-3 text-sm flex-wrap">
          <div className="px-3 py-1.5 bg-white/10 rounded-none border border-white/20 text-md">
            {announcements.length} pengumuman
          </div>
          {unreadCount > 0 && (
            <div className="px-3 py-1.5 bg-red-500/20 rounded-none border border-red-500/30 font-black text-red-300">
              {unreadCount} belum dibaca
            </div>
          )}
        </div>
      </div>

      {/* Type filters */}
      <div className="flex gap-2 flex-wrap px-4 md:px-5">
        <button onClick={() => setTypeFilter('')}
          className={`px-3 py-2 rounded-none text-[11px] font-black border transition-all cursor-pointer active:scale-[0.97] ${!typeFilter ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-transparent' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
          Semua
        </button>
        {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
          <button key={key} onClick={() => setTypeFilter(k => k === key ? '' : key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-none text-[11px] font-black border transition-all cursor-pointer active:scale-[0.97] ${typeFilter === key ? `${cfg.bg} ${cfg.text} ${cfg.border}` : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
            {cfg.icon} {cfg.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 size={20} className="animate-spin" />
          <span className="font-bold">Memuat pengumuman...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-slate-400 bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-100 dark:border-slate-800 rounded-none">
          <Bell size={36} className="mx-auto mb-4 opacity-30" />
          <p className="font-black text-slate-500 text-lg">Tidak ada pengumuman</p>
          <p className="text-sm font-medium mt-1 text-slate-400">Nantikan informasi terbaru dari kami</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ann, i) => {
            const cfg = TYPE_CONFIG[ann.type] || TYPE_CONFIG.info;
            const isExpanded = expandedId === ann._id;

            return (
              <motion.div
                key={ann._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                className={`bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm border rounded-none overflow-hidden shadow-sm transition-all ${
                  !ann.isRead
                    ? 'border-blue-200 dark:border-blue-900/50 shadow-blue-50 dark:shadow-none'
                    : 'border-slate-100 dark:border-slate-800'
                }`}
              >
                {/* Top accent */}
                <div className="h-[3px]" style={{ background: cfg.color }} />

                <button
                  onClick={() => handleExpand(ann)}
                  className="w-full text-left p-4 md:p-5 cursor-pointer hover:bg-white/40 dark:hover:bg-slate-800/40 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-none flex items-center justify-center flex-shrink-0`}
                      style={{ background: cfg.color + '20', color: cfg.color }}>
                      {cfg.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className={`font-medium text-sm md:text-md ${ann.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-slate-100'}`}>
                              {ann.title}
                            </h3>
                            {!ann.isRead && (
                              <span className="w-2 h-2 bg-blue-500 rounded-none flex-shrink-0" />
                            )}
                          </div>
                          <p className={`text-xs md:text-sm font-medium ${isExpanded ? '' : 'line-clamp-2'} ${ann.isRead ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-400'}`}>
                            {ann.description}
                          </p>
                        </div>

                        <div className="flex-shrink-0 flex items-center gap-2">
                          {ann.isRead ? (
                            <Check size={14} className="text-slate-300 dark:text-slate-600" />
                          ) : (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-[9px] font-black rounded-none border border-blue-200 dark:border-blue-900">
                              BARU
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-none border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          {cfg.label}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{fmtDate(ann.createdAt)}</span>
                        {ann.expiresAt && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                            <Clock size={9} /> Berlaku hingga {new Date(ann.expiresAt).toLocaleDateString('id-ID')}
                          </span>
                        )}
                        {ann.imageUrl && (
                          <span className="text-[10px] text-blue-400 font-medium flex items-center gap-1">
                            <ImageIcon size={9} /> Ada gambar
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                        {ann.imageUrl && (
                          <img
                            src={ann.imageUrl}
                            alt={ann.title}
                            className="w-full max-h-72 object-cover rounded-none border border-slate-200 dark:border-slate-700"
                          />
                        )}
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <p className="text-slate-600 dark:text-slate-400 font-medium whitespace-pre-wrap text-sm leading-relaxed">
                            {ann.description}
                          </p>
                        </div>
                        {ann.expiresAt && (
                          <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-none">
                            <Clock size={14} className="text-amber-500 flex-shrink-0" />
                            <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                              Pengumuman ini berlaku hingga {new Date(ann.expiresAt).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InboxBell;