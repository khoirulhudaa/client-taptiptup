// pages/DonationTerminal.jsx
// Khusus superAdmin — log aktivitas donasi real-time

import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/axiosInstance';
import {
  Activity, Search, RefreshCw, Play, Pause, Calendar, X,
  CheckCircle2, Clock, XCircle, Wallet, Image, Mic, Sparkles, Users
} from 'lucide-react';

const fetchLogs = async ({ streamer = 'all', limit = 50, page = 1, status = '', startDate = '', endDate = '' }) => {
  const params = new URLSearchParams({
    streamer, limit, page, status,
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  });
  return (await api.get(`/api/midtrans/admin/donation-logs?${params}`)).data;
};

const fetchStreamers = async () =>
  (await api.get('/api/midtrans/admin/streamers-list')).data;

const formatRp = (n) => `Rp ${Number(n).toLocaleString('id-ID')}`;

const formatTs = (d) =>
  new Date(d).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const STATUS_CONFIG = {
  PAID:    { label: 'Berhasil', icon: <CheckCircle2 size={12} />, className: 'bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400' },
  PENDING: { label: 'Pending',  icon: <Clock size={12} />,        className: 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' },
  EXPIRED: { label: 'Expired',  icon: <XCircle size={12} />,      className: 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black ${cfg.className}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

const TypeIcon = ({ d }) => {
  if (d.voiceUrl) return <Mic size={14} className="text-pink-500" />;
  if (d.mediaUrl) return <Image size={14} className="text-purple-500" />;
  return <Sparkles size={14} className="text-slate-300" />;
};

// ── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-100 dark:border-slate-800 rounded-lg p-3 md:p-4 flex flex-col gap-2">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-base md:text-lg font-black text-slate-800 dark:text-slate-100 leading-tight truncate">{value}</p>
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{label}</p>
    </div>
  </div>
);

// ── Log Card (semua ukuran layar) ──────────────────────────────────────────
const LogCard = ({ d, idx, highlight }) => (
  <motion.div
    initial={highlight ? { backgroundColor: '#22c55e22', opacity: 0 } : { opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0, backgroundColor: 'transparent' }}
    transition={{ duration: highlight ? 0.6 : 0.15, delay: highlight ? 0 : idx * 0.005 }}
    className="border border-slate-100 dark:border-slate-800 rounded-lg p-4 flex flex-col gap-2 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all"
  >
    <div className="flex items-center justify-between">
      <p className="font-black text-sm text-slate-800 dark:text-slate-100 truncate">{d.donorName}</p>
      <p className="font-black text-sm text-emerald-600 dark:text-emerald-400 whitespace-nowrap ml-2">{formatRp(d.amount)}</p>
    </div>
    <div className="flex items-center justify-between">
      <p className="text-xs font-bold text-blue-600 dark:text-blue-400">@{d.userId?.username || '—'}</p>
      <StatusBadge status={d.status} />
    </div>
    {d.message && (
      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg px-3 py-2">
        <TypeIcon d={d} />
        <p className="text-xs text-slate-600 dark:text-slate-300 truncate">{d.message}</p>
      </div>
    )}
    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{formatTs(d.createdAt)}</p>
  </motion.div>
);

// ── Log Row (Desktop table) ────────────────────────────────────────────────
const LogRowDesktop = ({ d, idx, highlight }) => (
  <motion.tr
    initial={highlight ? { backgroundColor: '#22c55e22' } : { opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0, backgroundColor: 'transparent' }}
    transition={{ duration: highlight ? 0.6 : 0.15, delay: highlight ? 0 : idx * 0.005 }}
    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
  >
    <td className="px-6 py-4 text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">{formatTs(d.createdAt)}</td>
    <td className="px-6 py-4 font-black text-sm text-slate-700 dark:text-slate-200 whitespace-nowrap">@{d.userId?.username || '—'}</td>
    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">{d.donorName}</td>
    <td className="px-6 py-4 font-black text-sm text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{formatRp(d.amount)}</td>
    <td className="px-6 py-4"><StatusBadge status={d.status} /></td>
    <td className="px-6 py-4 max-w-[220px]">
      <div className="flex items-center gap-2">
        <TypeIcon d={d} />
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{d.message || '—'}</p>
      </div>
    </td>
  </motion.tr>
);

// ── Log Row (Mobile card) ──────────────────────────────────────────────────
const LogRowMobile = ({ d, idx, highlight }) => (
  <motion.div
    initial={highlight ? { backgroundColor: '#22c55e22', opacity: 0 } : { opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0, backgroundColor: 'transparent' }}
    transition={{ duration: highlight ? 0.6 : 0.15, delay: highlight ? 0 : idx * 0.005 }}
    className="border border-slate-100 dark:border-slate-800 rounded-lg p-4 flex flex-col gap-2"
  >
    <div className="flex items-center justify-between">
      <p className="font-black text-sm text-slate-800 dark:text-slate-100">{d.donorName}</p>
      <p className="font-black text-sm text-emerald-600 dark:text-emerald-400">{formatRp(d.amount)}</p>
    </div>
    <div className="flex items-center justify-between">
      <p className="text-xs font-bold text-blue-600 dark:text-blue-400">@{d.userId?.username || '—'}</p>
      <StatusBadge status={d.status} />
    </div>
    {d.message && (
      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg px-3 py-2">
        <TypeIcon d={d} />
        <p className="text-xs text-slate-600 dark:text-slate-300 truncate">{d.message}</p>
      </div>
    )}
    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{formatTs(d.createdAt)}</p>
  </motion.div>
);

// ── Pagination ──────────────────────────────────────────────────────────────
const Pagination = ({ page, totalPages, onPage, isFetching }) => {
  const pages = [];
  const WINDOW = 1;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - WINDOW && i <= page + WINDOW)) pages.push(i);
    else if (pages[pages.length - 1] !== '...') pages.push('...');
  }
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button onClick={() => onPage(page - 1)} disabled={page <= 1 || isFetching}
        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
        ←
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} className="px-1 text-slate-300 dark:text-slate-600 text-xs font-bold">···</span>
        ) : (
          <button key={p} onClick={() => onPage(p)} disabled={isFetching}
            className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all ${
              p === page ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}>
            {p}
          </button>
        )
      )}
      <button onClick={() => onPage(page + 1)} disabled={page >= totalPages || isFetching}
        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
        →
      </button>
    </div>
  );
};

// ── Main ────────────────────────────────────────────────────────────────────
const DonationTerminal = () => {
  const [selectedStreamer, setSelectedStreamer] = useState('all');
  const [statusFilter, setStatusFilter]         = useState('');
  const [limit, setLimit]                       = useState(50);
  const [page, setPage]                         = useState(1);
  const [autoRefresh, setAutoRefresh]           = useState(true);
  const [searchDonor, setSearchDonor]           = useState('');
  const [newIds, setNewIds]                     = useState(new Set());
  const [startDate, setStartDate]               = useState('');
  const [endDate, setEndDate]                   = useState('');
  const prevIdsRef = useRef(new Set());

  useEffect(() => { setPage(1); }, [selectedStreamer, statusFilter, limit, startDate, endDate, searchDonor]);

  const { data: streamersData } = useQuery({
    queryKey: ['adminStreamersList'],
    queryFn: fetchStreamers,
    staleTime: 60000,
  });

  const { data, isLoading, dataUpdatedAt, refetch, isFetching } = useQuery({
    queryKey: ['adminDonationLogs', selectedStreamer, limit, page, statusFilter, startDate, endDate],
    queryFn: () => fetchLogs({ streamer: selectedStreamer, limit, page, status: statusFilter, startDate, endDate }),
    refetchInterval: autoRefresh ? 8000 : false,
    staleTime: 4000,
    keepPreviousData: true,
  });

  const allDonations = data?.donations || [];
  const donations = allDonations.filter(d =>
    !searchDonor || d.donorName?.toLowerCase().includes(searchDonor.toLowerCase())
  );
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.total      || 0;

  useEffect(() => {
    if (!allDonations.length) return;
    const currIds = new Set(allDonations.map(d => d._id));
    const fresh = new Set([...currIds].filter(id => !prevIdsRef.current.has(id)));
    if (prevIdsRef.current.size > 0 && fresh.size > 0) {
      setNewIds(fresh);
      setTimeout(() => setNewIds(new Set()), 3000);
    }
    prevIdsRef.current = currIds;
  }, [allDonations]);

  const streamers  = streamersData?.users || [];
  const paid       = donations.filter(d => d.status === 'PAID');
  const pending    = donations.filter(d => d.status === 'PENDING');
  const expired    = donations.filter(d => d.status === 'EXPIRED');
  const totalPaid  = paid.reduce((s, d) => s + (d.amount || 0), 0);
  const withMedia  = paid.filter(d => d.mediaUrl).length;
  const withVoice  = paid.filter(d => d.voiceUrl).length;

  const handlePage = (p) => { if (p >= 1 && p <= totalPages) setPage(p); };

  const statusFilters = [
    { val: '', label: 'Semua' },
    { val: 'PAID', label: 'Berhasil' },
    { val: 'PENDING', label: 'Pending' },
    { val: 'EXPIRED', label: 'Expired' },
  ];

  const inputClass = "px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg font-bold text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 transition-all";

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 from-blue-700 to-indigo-800 rounded-lg p-4 md:p-6 text-white relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="text-blue-200 dark:text-slate-400 text-xs font-black uppercase tracking-widest">Super Admin</span>
            <h2 className="text-md md:text-lg font-black tracking-tight mt-1">Riwayat Pembayaran</h2>
            <p className="text-blue-300 dark:text-slate-400 text-sm font-medium mt-1">{totalCount} total transaksi tercatat</p>
          </div>
          {isFetching && (
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-green-200">Live</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 md:grid-cols-7 gap-2 md:gap-3">
        <StatCard label="Total"      value={donations.length}                          icon={<Activity size={16} className="text-indigo-500" />}     color="bg-indigo-50 dark:bg-indigo-950/40" />
        <StatCard label="Berhasil"   value={paid.length}                               icon={<CheckCircle2 size={16} className="text-green-500" />}  color="bg-green-50 dark:bg-green-950/40" />
        <StatCard label="Pending"    value={pending.length}                            icon={<Clock size={16} className="text-amber-500" />}         color="bg-amber-50 dark:bg-amber-950/40" />
        <StatCard label="Expired"    value={expired.length}                            icon={<XCircle size={16} className="text-red-500" />}         color="bg-red-50 dark:bg-red-950/40" />
        <StatCard label="Total Masuk" value={formatRp(totalPaid)}                      icon={<Wallet size={16} className="text-emerald-500" />}      color="bg-emerald-50 dark:bg-emerald-950/40" />
        <StatCard label="W/ Media"    value={withMedia}                                icon={<Image size={16} className="text-purple-500" />}        color="bg-purple-50 dark:bg-purple-950/40" />
        <StatCard label="W/ Voice"    value={withVoice}                                icon={<Mic size={16} className="text-pink-500" />}            color="bg-pink-50 dark:bg-pink-950/40" />
      </div>

      {/* ── Filters ── */}
      <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-lg border border-slate-100 dark:border-slate-800 p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <select value={selectedStreamer} onChange={e => setSelectedStreamer(e.target.value)}
            className={`${inputClass} cursor-pointer flex-1 min-w-[140px] md:max-w-[260px]`}>
            <option value="all">Semua Streamer</option>
            {streamers.map(u => (
              <option key={u._id} value={u.username}>@{u.username}</option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[160px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={searchDonor} onChange={e => setSearchDonor(e.target.value)}
              placeholder="Cari nama donatur..."
              className={`${inputClass} w-full pl-9`} />
          </div>

          <button onClick={() => setAutoRefresh(v => !v)}
            className={`${inputClass} cursor-pointer flex items-center gap-2 ${autoRefresh ? 'bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400 border-green-200 dark:border-green-800' : ''}`}>
            {autoRefresh ? <Pause size={13} /> : <Play size={13} />} Auto
          </button>

          <button onClick={() => refetch()}
            className={`${inputClass} cursor-pointer flex items-center gap-2`}>
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-1.5 flex-wrap">
            {statusFilters.map(f => (
              <button key={f.val} onClick={() => setStatusFilter(f.val)}
                className={`px-3.5 py-2 rounded-lg font-black text-[11px] transition-all ${
                  statusFilter === f.val ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}>
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Calendar size={14} className="text-slate-400" />
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
            <span className="text-slate-300 dark:text-slate-600 text-xs">–</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClass} />
            {(startDate || endDate) && (
              <button onClick={() => { setStartDate(''); setEndDate(''); }}
                className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rows</span>
            <div className="flex gap-1">
              {[25, 50, 100, 200].map(n => (
                <button key={n} onClick={() => setLimit(n)}
                  className={`px-2.5 py-1 rounded-lg font-black text-[11px] transition-all ${
                    limit === n ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          {/* <span className="text-[10px] font-bold text-slate-400">
            Menampilkan {donations.length} dari {totalCount}
            {autoRefresh ? ' · auto refresh 8s' : ''}
          </span> */}
        </div>
      </div>

      {/* ── Data List ── */}
      <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 font-bold gap-3">
            <div className="w-5 h-5 border-4 border-slate-200 border-t-blue-600 rounded-lg animate-spin" />
            Memuat data...
          </div>
        ) : donations.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Activity size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-black text-sm">Belum ada transaksi</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4" style={{ opacity: isFetching ? 0.65 : 1, transition: 'opacity 0.2s' }}>
            <AnimatePresence initial={false}>
              {donations.map((d, i) => (
                <LogCard key={d._id} d={d} idx={i} highlight={newIds.has(d._id)} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-3 px-1">
          <span className="text-[11px] font-bold text-slate-400">
            Halaman <span className="text-blue-600 dark:text-blue-400 font-black">{page}</span> dari {totalPages}
          </span>
          <Pagination page={page} totalPages={totalPages} onPage={handlePage} isFetching={isFetching} />
        </div>
      )}
    </div>
  );
};

export default DonationTerminal;