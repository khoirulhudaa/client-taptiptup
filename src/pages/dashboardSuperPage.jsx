import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Activity, AlertTriangle, ArrowUpRight,
    Clock, DollarSign,
    Loader,
    RefreshCw, Server, Shield, TrendingUp,
    Trophy, Users, Wallet
} from 'lucide-react';
import api from '../lib/axiosInstance';

// ─── Fetch ────────────────────────────────────────────────────────────────────

const fetchSuperStats  = async () => (await api.get('/api/superadmin/stats')).data;
const fetchServerHealth = async () => {
  const start = Date.now();
  await api.get('/api/health'); // or any lightweight endpoint
  return { latency: Date.now() - start, status: 'ok' };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => new Intl.NumberFormat('id-ID').format(Math.round(n || 0));
const fmtRp = (n) => `Rp ${fmt(n)}`;

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

const staggerChild = (i) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] } },
});

// ─── StatCard ─────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, icon: Icon, accent, index }) => (
  <motion.div
    {...staggerChild(index)}
    className="relative overflow-hidden rounded-none border dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col gap-3"
  >
    {/* accent line */}
    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: accent }} />
    <div className="flex items-start justify-between">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <div className="w-9 h-9 rounded-none flex items-center justify-center" style={{ background: accent + '18', border: `1px solid ${accent}30` }}>
        <Icon size={16} style={{ color: accent }} />
      </div>
    </div>
    <p className="text-md font-black text-slate-900 dark:text-white leading-none tracking-tight">{value}</p>
    {sub && <p className="text-[11px] text-slate-500 font-medium">{sub}</p>}
  </motion.div>
);

// ─── CustomTooltip ────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-none px-4 py-3 shadow-2xl">
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-black" style={{ color: p.color }}>
          {p.name === 'total' ? fmtRp(p.value) : fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

// ─── HealthBadge ──────────────────────────────────────────────────────────────

const HealthBadge = ({ latency, status }) => {
  const ok = status === 'ok' && latency < 800;
  const warn = latency >= 800 && latency < 2000;
  const color = ok ? '#22c55e' : warn ? '#f59e0b' : '#ef4444';
  const label = ok ? 'Healthy' : warn ? 'Degraded' : 'Down';
  return (
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-none animate-pulse" style={{ background: color }} />
      <span className="text-xs font-black" style={{ color }}>{label}</span>
      <span className="text-[10px] text-slate-500 font-mono">{latency}ms</span>
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export const DashboardSuperPage = () => {
  const { data: stats, isLoading, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ['superAdminStats'],
    queryFn: fetchSuperStats,
    refetchInterval: 30000,
  });

  const { data: health, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['serverHealth'],
    queryFn: fetchServerHealth,
    refetchInterval: 15000,
    retry: false,
  });

  // Build chart data from monthlyRevenue
  const chartData = (stats?.monthlyRevenue || []).map((d) => ({
    name: MONTH_NAMES[(d._id.month - 1)],
    total: d.total,
    count: d.count,
  }));

  // Pie data: donations vs withdrawals
  const pieData = [
    { name: 'Donasi Masuk', value: stats?.totalDonation?.amount || 0, color: '#6366f1' },
    { name: 'Dicairkan',    value: stats?.totalWithdrawal?.amount || 0, color: '#22d3ee' },
  ];

  const retained = (stats?.totalDonation?.amount || 0) - (stats?.totalWithdrawal?.amount || 0);

  const lastUpdate = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('id-ID') : '-';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-10 h-10 animate-spin" />
          <p className="text-slate-400 font-black text-sm tracking-widest uppercase">Memuat data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-max text-white pb-0 px-4 md:px-0 pt-2 md:pt-0 space-y-8 font-sans">

      {/* ── Header ── */}
      <motion.div {...staggerChild(0)} className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[18px] text-slate-900  dark:text-white md:text-[20px] font-black tracking-tight">
            Pusat <span className="text-indigo-400">Statistik</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Platform overview — semua data real-time</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Server Health */}
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-none">
            <Server size={14} className="text-slate-400" />
            {healthLoading
              ? <span className="text-xs text-slate-500 font-bold animate-pulse">Checking...</span>
              : <HealthBadge latency={health?.latency ?? 9999} status={health?.status ?? 'error'} />
            }
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
            <span>Update: {lastUpdate}</span>
            <button
              onClick={() => { refetch(); refetchHealth(); }}
              disabled={isFetching}
              className="cursor-pointer p-1.5 bg-slate-800 hover:bg-slate-700 rounded-none transition-all disabled:opacity-50"
            >
              <RefreshCw size={12} className={isFetching ? 'animate-spin text-indigo-400' : 'text-slate-400'} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard index={1} label="Total Donasi Masuk"   value={fmtRp(stats?.totalDonation?.amount)}   sub={`${fmt(stats?.totalDonation?.count)} transaksi`}    icon={DollarSign}   accent="#6366f1" />
        <StatCard index={2} label="Total Users"           value={fmt(stats?.totalUsers)}                sub="Akun streamer aktif"                                   icon={Users}        accent="#22d3ee" />
        <StatCard index={3} label="Total Pencairan"       value={fmtRp(stats?.totalWithdrawal?.amount)} sub={`${fmt(stats?.totalWithdrawal?.count)} transaksi`}      icon={Wallet}       accent="#34d399" />
        <StatCard index={4} label="Dana Tertahan"         value={fmtRp(retained)}                       sub="Belum dicairkan"                                        icon={TrendingUp}   accent="#f59e0b" />
        <StatCard index={5} label="Pending Withdraw"      value={fmt(stats?.pendingWithdrawals)}         sub="Menunggu diproses"                                     icon={Clock}        accent="#ef4444" />
        <StatCard index={6} label="Status Server"         value={healthLoading ? '—' : health?.status === 'ok' ? 'Online' : 'Offline'} sub={healthLoading ? 'checking...' : `${health?.latency}ms latency`} icon={Activity} accent="#a78bfa" />
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Top Donatur */}
        <motion.div {...staggerChild(10)} className="md:bg-white md:dark:bg-slate-900 md:border dark:border-slate-800 rounded-none p-0 md:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/20 rounded-none flex items-center justify-center">
              <Trophy size={14} className="text-amber-400" />
            </div>
            <div>
              <p className="font-black text-sm text-slate-900 dark:text-white">Top 3 Donatur</p>
            </div>
          </div>
          <div className="space-y-3">
            {(stats?.topDonors || []).length === 0 && (
              <p className="text-slate-600 text-sm font-bold text-center py-6">Belum ada data</p>
            )}
            {(stats?.topDonors || []).map((d, i) => {
              const medals = ['🥇', '🥈', '🥉'];
              const accents = ['#f59e0b', '#94a3b8', '#b45309'];
              return (
                <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800/50 border border-slate-700/50 rounded-none">
                  <span className="text-xl flex-shrink-0">{medals[i]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-slate-900 dark:text-white truncate">{d.name}</p>
                    <p className="text-[10px] text-slate-900 dark:text-slate-500 font-medium">{d.count}x donasi</p>
                  </div>
                  <p className="font-black text-sm flex-shrink-0" style={{ color: accents[i] }}>
                    {fmtRp(d.totalAmount)}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Pending Withdrawals Alert */}
        <motion.div {...staggerChild(11)} className="w-full md:bg-white md:dark:bg-slate-900 md:border dark:border-slate-800 rounded-none p-0 md:my-0 my-2 md:p-6 flex justify-center md:items-center text-center flex-col">
          {/* <div className="flex justify-center items-center gap-2 pt-0 mb-5">
            <div>
              <p className="font-black text-sm text-slate-900 dark:text-white">Pending Withdraw</p>
            </div>
          </div> */}

          <div className="w-full flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-full h-full flex justify-center items-center relative">
              <div
                className="w-full h-full md:py-4 py-6 rounded-none border-[3.5px] flex items-center justify-center"
                style={{
                  borderColor: stats?.pendingWithdrawals > 0 ? '#ef4444' : '#22c55e',
                  background: stats?.pendingWithdrawals > 0 ? '#ef444410' : '#22c55e10',
                }}
              >
                <div className="text-center">
                  <p
                    className="text-4xl font-black leading-none"
                    style={{ color: stats?.pendingWithdrawals > 0 ? '#ef4444' : '#22c55e' }}
                  >
                    {fmt(stats?.pendingWithdrawals)}
                  </p>
                  <p className="mt-4 text-[10px] text-slate-500 w-max font-black uppercase tracking-wider mt-1">request penarikan</p>
                </div>
              </div>
            </div>
            {/* <p className="text-xs text-slate-500 font-medium text-center">
              {stats?.pendingWithdrawals > 0
                ? 'Segera proses permintaan penarikan'
                : 'Semua penarikan sudah diproses'}
            </p> */}
          </div>
{/* 
          {stats?.pendingWithdrawals > 0 && (
            <div className="mt-4 hidden md:flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-none">
              <Clock size={12} className="text-red-400 flex-shrink-0" />
              <p className="text-[11px] text-red-400 font-bold">Buka tab "Admin" untuk memproses</p>
            </div>
          )} */}
        </motion.div>

        {/* Donasi Terbaru */}
        <motion.div {...staggerChild(12)} className="md:bg-white md:dark:bg-slate-900 md:border dark:border-slate-800 rounded-none p-0 md:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-indigo-500/10 border border-indigo-500/20 rounded-none flex items-center justify-center">
              <ArrowUpRight size={14} className="text-indigo-400" />
            </div>
            <div>
              <p className="font-black text-sm text-slate-900 dark:text-white">Donasi Terbaru</p>
            </div>
          </div>
          <div className="space-y-2">
            {(stats?.recentDonations || []).length === 0 && (
              <p className="text-slate-600 text-sm font-bold text-center py-6">Belum ada donasi</p>
            )}
            {(stats?.recentDonations || []).map((d, i) => (
              <div key={d._id || i} className="flex items-center gap-3 py-2.5 border-b border-slate-800 last:border-0">
                <div className="w-7 h-7 bg-indigo-500/10 rounded-none flex items-center justify-center flex-shrink-0 text-xs font-black text-indigo-400">
                  {d.donorName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate">{d.donorName || 'Anonim'}</p>
                  <p className="text-[10px] text-slate-500 font-medium truncate">→ @{d.userId?.username || '?'}</p>
                </div>
                <p className="text-xs font-black text-emerald-400 flex-shrink-0">{fmtRp(d.amount)}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardSuperPage;