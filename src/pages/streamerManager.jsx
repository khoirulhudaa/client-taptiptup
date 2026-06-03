// pages/streamerManager.jsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Check,
  Grid,
  List,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/axiosInstance';

const fetchStreamers = async ({ page = 1, limit = 20, search = '', status = '' } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  return (await api.get(`/api/streamer-manage?${params}`)).data;
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    : '-';

// ─── Confirm modal ────────────────────────────────────────────────────────────
const ConfirmModal = ({ type, user, onConfirm, onClose, loading }) => {
  const isDelete = type === 'delete';
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative z-10 w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none p-8 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`w-16 h-16 mx-auto mb-5 rounded-none flex items-center justify-center ${
            isDelete
              ? 'bg-red-100 dark:bg-red-950/40 text-red-600'
              : user?.isActive === false
              ? 'bg-green-100 dark:bg-green-950/40 text-green-600'
              : 'bg-amber-100 dark:bg-amber-950/40 text-amber-600'
          }`}
        >
          {isDelete ? <Trash2 size={32} /> : user?.isActive === false ? <UserCheck size={32} /> : <UserX size={32} />}
        </div>
        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">
          {isDelete ? 'Hapus Permanen?' : user?.isActive === false ? 'Aktifkan User?' : 'Nonaktifkan User?'}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          {isDelete
            ? `Akun @${user?.username} akan dihapus permanen dan tidak bisa dipulihkan.`
            : `Akun @${user?.username} akan ${user?.isActive === false ? 'diaktifkan kembali' : 'dinonaktifkan sementara'}.`}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-none font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer active:scale-[0.98]"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-3 text-white rounded-none font-black text-sm cursor-pointer active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 ${
              isDelete ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {isDelete ? 'Ya, Hapus' : 'Ya, Lanjutkan'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── User card (grid view) ────────────────────────────────────────────────────
const UserCard = ({ user, onToggle, onDelete }) => {
  const isActive = user.isActive !== false;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-none p-5 flex flex-col gap-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-none bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0 overflow-hidden">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              user.username?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="font-black text-slate-800 dark:text-slate-100 truncate">@{user.username}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        <span
          className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-none flex-shrink-0 ${
            isActive
              ? 'bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-950/40 text-red-500 dark:text-red-400'
          }`}
        >
          {isActive ? 'Aktif' : 'Nonaktif'}
        </span>
      </div>

      <div className="flex justify-between w-full gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div>
          <span className="font-black text-[9px] uppercase tracking-widest text-slate-300 dark:text-slate-600 block mb-0.5">Donasi</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            Rp {Number(user.totalDonations || 0).toLocaleString('id-ID')}
          </span>
        </div>
        <div className='ml-aauto'>
          <span className="font-black text-[9px] uppercase tracking-widest text-slate-300 dark:text-slate-600 block mb-0.5">Daftar</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">{formatDate(user.createdAt)}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => onToggle(user)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-none font-black text-xs cursor-pointer active:scale-[0.99] transition-all border ${
            isActive
              ? 'border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-900/30 dark:bg-amber-900/20'
              : 'border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-900/30 dark:bg-green-900/20'
          }`}
        >
          {isActive ? <UserX size={13} /> : <UserCheck size={13} />}
          {isActive ? 'Nonaktifkan' : 'Aktifkan'}
        </button>
        <button
          onClick={() => onDelete(user)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-none font-black text-xs cursor-pointer active:scale-[0.99] border border-red-200 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const StreamerManagerPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'table' | 'grid'
  const [confirmModal, setConfirmModal] = useState(null); // { type: 'toggle'|'delete', user }

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['streamer-manage', page, search, statusFilter],
    queryFn: () => fetchStreamers({ page, limit: 20, search, status: statusFilter }),
    keepPreviousData: true,
    refetchInterval: 60000,
  });

  const users = data?.users || [];
  const pagination = data?.pagination || {};

  const toggleMutation = useMutation({
    mutationFn: (id) => api.put(`/api/streamer-manage/${id}/toggle-active`).then((r) => r.data),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ['streamer-manage'] });
      setConfirmModal(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Gagal'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/streamer-manage/${id}`).then((r) => r.data),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ['streamer-manage'] });
      setConfirmModal(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Gagal'),
  });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const isMutating = toggleMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-5 pb-0">
      <AnimatePresence>
        {confirmModal && (
          <ConfirmModal
            type={confirmModal.type}
            user={confirmModal.user}
            loading={isMutating}
            onClose={() => !isMutating && setConfirmModal(null)}
            onConfirm={() =>
              confirmModal.type === 'delete'
                ? deleteMutation.mutate(confirmModal.user._id)
                : toggleMutation.mutate(confirmModal.user._id)
            }
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-none p-5 md:p-6 text-white relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Super Admin</p>
            <h2 className="text-lg font-black flex items-center gap-2">
              Kelola Streamer
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-1">
              {pagination.total || 0} total akun terdaftar
            </p>
          </div>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="flex gap-2 flex-1 min-w-[200px]">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Cari username / email..."
            className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none font-bold text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-400 transition-all"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
              className="px-1 py-2 text-slate-500 rounded-none font-black text-xs cursor-pointer active:scale-[0.99]"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* View mode */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 rounded-none border font-black text-xs cursor-pointer active:scale-[0.99] transition-all flex items-center gap-1.5 ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Grid size={13} /> Grid
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-2 rounded-none border font-black text-xs cursor-pointer active:scale-[0.99] transition-all flex items-center gap-1.5 ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <List size={13} /> Table
          </button>
        </div>

        {/* Status filter */}
        <div className="flex gap-2">
          {[{ val: 'active', label: 'Aktif' }, { val: 'inactive', label: 'Nonaktif' }].map((f) => (
            <button
              key={f.val}
              onClick={() => { setStatusFilter(f.val); setPage(1); }}
              className={`px-4 py-2 rounded-none font-black text-xs cursor-pointer active:scale-[0.99] transition-all border ${
                statusFilter === f.val
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-none border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-slate-400 font-bold gap-3">
            <div className="w-5 h-5 border-4 border-slate-200 border-t-blue-600 rounded-none animate-spin" />
            Memuat data streamer...
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <p className="text-4xl mb-3">👤</p>
            <p className="font-black text-slate-500">Tidak ada streamer ditemukan</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 md:p-6">
            {users.map((u) => (
              <UserCard
                key={u._id}
                user={u}
                onToggle={(user) => setConfirmModal({ type: 'toggle', user })}
                onDelete={(user) => setConfirmModal({ type: 'delete', user })}
              />
            ))}
          </div>
        ) : (
          // TABLE VIEW
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  {['Streamer', 'Email', 'Total Donasi', 'Saldo', 'Status', 'Daftar', 'Aksi'].map((h) => (
                    <th key={h} className="px-5 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {users.map((u) => {
                  const isActive = u.isActive !== false;
                  return (
                    <tr key={u._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-none bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black flex-shrink-0 overflow-hidden text-sm">
                            {u.profilePicture ? (
                              <img src={u.profilePicture} alt={u.username} className="w-full h-full object-cover" />
                            ) : (
                              u.username?.charAt(0).toUpperCase()
                            )}
                          </div>
                          <p className="font-black text-slate-800 dark:text-slate-100 text-sm">@{u.username}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">{u.email}</td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                          Rp {Number(u.totalDonations || 0).toLocaleString('id-ID')}
                        </p>
                        <p className="text-[10px] text-slate-400">{u.totalDonationCount || 0}x</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-sm text-blue-600 dark:text-blue-400">
                          Rp {Number(u.walletBalance || 0).toLocaleString('id-ID')}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-none text-[10px] font-black ${
                            isActive
                              ? 'bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-950/40 text-red-500 dark:text-red-400'
                          }`}
                        >
                          {isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[11px] text-slate-400 whitespace-nowrap">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setConfirmModal({ type: 'toggle', user: u })}
                            title={isActive ? 'Nonaktifkan' : 'Aktifkan'}
                            className={`px-2.5 py-2 rounded-none font-black text-xs cursor-pointer active:scale-[0.99] transition-all ${
                              isActive
                                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                                : 'bg-green-50 dark:bg-green-950/30 text-green-600 border border-green-200 dark:border-green-800 hover:bg-green-100'
                            }`}
                          >
                            {isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                          <button
                            onClick={() => setConfirmModal({ type: 'delete', user: u })}
                            title="Hapus permanen"
                            className="px-2.5 py-2 rounded-none font-black text-xs cursor-pointer active:scale-[0.99] bg-red-50 dark:bg-red-950/30 text-red-500 border border-red-200 dark:border-red-900 hover:bg-red-100 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-none bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-black text-xs cursor-pointer disabled:opacity-40 hover:bg-slate-100 transition-all"
            >
              ← Sebelumnya
            </button>
            <span className="text-xs font-bold text-slate-400">
              Halaman <span className="text-blue-600 font-black">{page}</span> dari {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-4 py-2 rounded-none bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-black text-xs cursor-pointer disabled:opacity-40 hover:bg-slate-100 transition-all"
            >
              Berikutnya →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamerManagerPage;