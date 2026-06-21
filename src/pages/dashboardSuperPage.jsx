import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Activity, AlertTriangle, ArrowUpRight,
    ChartBar,
    Clock, Coins, DollarSign,
    HandFist,
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
    className="relative overflow-hidden rounded-xl border dark:border-slate-800 bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm p-4 md:p-6 flex flex-col gap-3"
  >
    {/* accent line */}
    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: accent }} />
    <div className="flex items-start justify-between">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <div className="w-9 h-9 rounded-xl hidden md:flex items-center justify-center" style={{ background: accent + '18', border: `1px solid ${accent}30` }}>
        <Icon size={16} style={{ color: accent }} />
      </div>
    </div>
    <p className="text-md font-black mt-2 md:mt-0 text-slate-900 dark:text-white leading-none tracking-tight">{value}</p>
    {sub && <p className="text-[11px] text-slate-500 font-medium">{sub}</p>}
  </motion.div>
);

// ─── CustomTooltip ────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 shadow-2xl">
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
    <div className="flex items-center gap-3">
      <span className="w-2 h-2 rounded-xl animate-pulse" style={{ background: color }} />
      <span className="relative top-[1px] text-xs font-black" style={{ color }}>{label}</span>
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

  console.log('stats', stats)

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
  
  if (isLoading) return (
    <div className="space-y-5 pb-10 px-4 md:px-0 pt-2 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-5 w-44 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-3 w-64 bg-slate-100 dark:bg-slate-700 rounded-xl" />
        </div>
        <div className="flex gap-3">
          <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* Row 1 - 4 cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-2.5 w-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              <div className="h-7 w-7 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            </div>
            <div className="h-6 w-28 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-xl" />
            <div className="h-2.5 w-24 bg-slate-100 dark:bg-slate-700 rounded-xl" />
          </div>
        ))}
      </div>

      {/* Row 2 - 4 cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-2.5 w-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              <div className="h-7 w-7 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            </div>
            <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="h-2.5 w-28 bg-slate-100 dark:bg-slate-700 rounded-xl" />
          </div>
        ))}
      </div>

      {/* Row 3 - 3 cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {[70, 100, 100].map((h, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              <div className="h-2.5 w-36 bg-slate-100 dark:bg-slate-700 rounded-xl" />
            </div>
            <div className={`h-${h === 70 ? 20 : 32} w-full bg-slate-100 dark:bg-slate-800 rounded-xl`} />
            {[...Array(i === 0 ? 0 : 3)].map((_, j) => (
              <div key={j} className="h-10 w-full bg-slate-50 dark:bg-slate-800 rounded-xl" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-max text-white pb-4 md:pb-0 px-0 md:px-0 pt-2 md:pt-0 space-y-8 font-sans">

      <div className="mb-5 bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-100 dark:border-slate-800 rounded-xl p-4 md:p-5 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #6366f1 0%, transparent 50%)' }} />
          <div className="relative flex items-start justify-between gap-3">
            <div>
                <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg">
                    <ChartBar size={20} />
                </div>
                <div>
                    <h3 className="md:capitalize text-sm uppercase md:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                      Pusat Statistik
                    </h3>
                </div>
                </div>
            </div>

            <div className="hidden md:flex items-center gap-3 relative top-[3.5px] flex-wrap">
              {/* Server Health */}
              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl">
                <Server size={14} className="text-slate-400" />
                {healthLoading
                  ? <span className="text-xs text-slate-500 font-bold animate-pulse">Checking...</span>
                  : <HealthBadge latency={health?.latency ?? 9999} status={health?.status ?? 'error'} />
                }
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold">
                <span>Update: {lastUpdate}</span>
                <button
                  onClick={() => { refetch(); refetchHealth(); }}
                  disabled={isFetching}
                  className="cursor-pointer p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all disabled:opacity-50"
                >
                  <RefreshCw size={12} className={isFetching ? 'animate-spin text-indigo-400' : 'text-slate-400'} />
                </button>
              </div>
            </div>
          </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 bg-white/30 dark:bg-slate-900/60 p-4 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard index={1} label="Donasi"   value={fmtRp(stats?.totalDonation?.amount)}   sub={`${fmt(stats?.totalDonation?.count)} transaksi`}    icon={DollarSign}   accent="#6366f1" />
        <StatCard index={2} label="Streamer"           value={fmt(stats?.totalUsers)}                sub="Akun streamer aktif"                                   icon={Users}        accent="#22d3ee" />
        <StatCard index={3} label="Pencairan"       value={fmtRp(stats?.totalWithdrawal?.amount)} sub={`${fmt(stats?.totalWithdrawal?.count)} transaksi`}      icon={Wallet}       accent="#34d399" />
        <StatCard index={4} label="Tertahan"         value={fmtRp(retained)}                       sub="Belum dicairkan"                                        icon={TrendingUp}   accent="#f59e0b" />
        <StatCard index={5} label="panarikan"      value={fmt(stats?.pendingWithdrawalsCount)}  sub="Menunggu diproses"                                     icon={Clock}        accent="#ef4444" />
        <StatCard index={6} label="Server"         value={healthLoading ? '—' : health?.status === 'ok' ? 'Online' : 'Offline'} sub={healthLoading ? 'checking...' : `${health?.latency}ms latency`} icon={Activity} accent="#a78bfa" />
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Top Donatur */}
        <motion.div {...staggerChild(10)} className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm md:border dark:border-slate-800 rounded-xl p-4 px-0 md:p-6">
          <div className="flex items-center px-4 gap-3 md:px-0 mb-5">
            <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
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
                <div key={i} className="flex items-center gap-3 p-3 md:bg-white dark:md:bg-slate-800/50 md:border border-slate-700/50 rounded-xl">
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
        <motion.div {...staggerChild(11)} className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm md:border dark:border-slate-800 rounded-xl py-4 p-0 md:p-6">
          <div className="flex items-center justify-between px-4 md:px-0 gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center">
                <Clock size={14} className="text-red-400" />
              </div>
              <div>
                <p className="font-black text-sm text-slate-900 dark:text-white">{fmt(stats?.pendingWithdrawalsCount)} Pending WD</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {(stats?.pendingWithdrawals || []).length === 0 && (
              <p className="text-slate-600 text-sm font-bold text-center py-6">Tidak ada pending</p>
            )}
            {(stats?.pendingWithdrawals || []).slice(0, 3).map((w, i) => (
              <div key={w.id || i} className="flex items-center gap-3 p-3 md:bg-white dark:md:bg-slate-800/50 md:border border-slate-700/50 rounded-xl">
                <div className="w-7 h-7 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black text-red-400">
                  {w.accountName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 dark:text-white truncate">{w.accountName || '-'}</p>
                  <p className="text-[10px] text-slate-400 font-medium truncate uppercase">{w.paymentMethod || '-'}</p>
                </div>
                <p className="font-black text-sm flex-shrink-0 text-red-400">{fmtRp(w.amount)}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Donasi Terbaru */}
        <motion.div {...staggerChild(12)} className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm md:border dark:border-slate-800 rounded-xl py-4 p-0 md:p-6">
          <div className="flex items-center px-4 gap-3 md:px-0 mb-5">
            <div className="w-8 h-8 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
              <Coins size={14} className="relative left-[0.1px] text-indigo-400" />
            </div>
            <div>
              <p className="font-black text-sm text-slate-900 dark:text-white">Donasi Terbaru</p>
            </div>
          </div>
          <div className="space-y-3">
            {(stats?.recentDonations || []).length === 0 && (
              <p className="text-slate-600 text-sm font-bold text-center py-6">Belum ada donasi</p>
            )}
            {(stats?.recentDonations || []).slice(0, 3).map((d, i) => (
              <div key={d._id || i} className="flex items-center gap-3 p-3 md:bg-white dark:md:bg-slate-800/50 md:border border-slate-700/50 rounded-xl">
                <div className="w-7 h-7 bg-indigo-500/10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black text-indigo-400">
                  {d.donorName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 dark:text-white truncate">{d.donorName || 'Anonim'}</p>
                  <p className="text-[10px] text-slate-400 font-medium truncate">@{d.userId?.username || '?'}</p>
                </div>
                <p className="font-black text-sm flex-shrink-0">{fmtRp(d.amount)}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardSuperPage;