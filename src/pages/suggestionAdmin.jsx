// components/SuggestionsAdmin.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axiosInstance';
import { 
  MessageCircle, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  RefreshCw,
  Check,
  X,
  Clock,
  Lightbulb,
  Bug,
  Zap,
  HelpCircle,
  Filter,
  Eye,
  Edit,
  Trash2,
  Send
} from 'lucide-react';

const CATEGORIES = [
  { value: 'feature', label: 'Fitur Baru', icon: <Zap size={14} /> },
  { value: 'bug', label: 'Bug / Error', icon: <Bug size={14} /> },
  { value: 'improvement', label: 'Perbaikan', icon: <Lightbulb size={14} /> },
  { value: 'other', label: 'Lainnya', icon: <HelpCircle size={14} /> },
];

const STATUS_OPTIONS = [
  { value: 'new', label: 'Baru' },
  { value: 'reviewed', label: 'Di Review' },
  { value: 'planned', label: 'Direncanakan' },
  { value: 'implemented', label: 'Sudah Dibuat' },
  { value: 'rejected', label: 'Ditolak' },
];

const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  reviewed: 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
  planned: 'bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
  implemented: 'bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400',
  rejected: 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400',
};

const STATUS_LABELS = {
  new: 'Baru',
  reviewed: 'Di Review',
  planned: 'Direncanakan',
  implemented: 'Sudah Dibuat',
  rejected: 'Ditolak',
};

const CATEGORY_ICONS = {
  feature: <Zap size={16} />,
  bug: <Bug size={16} />,
  improvement: <Lightbulb size={16} />,
  other: <HelpCircle size={16} />,
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

export const SuggestionsAdmin = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [showToast, setShowToast] = useState(null);
  const toastTimeout = useRef(null);

  const showToastMsg = (message, type = 'success') => {
    setShowToast({ message, type });
    clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setShowToast(null), 3000);
  };

  // Fetch all suggestions (admin)
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['adminSuggestions', statusFilter],
    queryFn: async () => {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/api/suggestions${params}`);
      return res.data;
    },
    refetchInterval: 30000,
  });

  const suggestions = data?.suggestions || [];
  const pagination = data?.pagination || {};

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, status, adminNote }) => {
      const res = await api.put(`/api/suggestions/${id}`, { status, adminNote });
      return res.data;
    },
    onSuccess: () => {
      showToastMsg('Status saran berhasil diupdate!');
      setSelectedSuggestion(null);
      setAdminNote('');
      queryClient.invalidateQueries({ queryKey: ['adminSuggestions'] });
    },
    onError: (err) => {
      showToastMsg(err.response?.data?.message || 'Gagal update status', 'error');
    },
  });

  const handleUpdateStatus = (suggestion, newStatus) => {
    updateMutation.mutate({
      id: suggestion._id,
      status: newStatus,
      adminNote: adminNote,
    });
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-none shadow-2xl font-bold text-sm ${
              showToast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {showToast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            {showToast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 from-blue-700 to-indigo-800  rounded-none p-6 text-white relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {/* <MessageCircle size={20} /> */}
              <span className="text-blue-200 dark:text-slate-400 text-xs font-black uppercase tracking-widest">Super Admin</span>
            </div>
            <h2 className="text-md md:text-lg font-black tracking-tight">Kelola Masukan Streamer</h2>
            <p className="text-blue-300 dark:text-slate-400 text-sm font-medium mt-1">{pagination.total || 0} total saran masuk</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-none animate-pulse" />
            <span className="text-xs font-bold text-blue-200 dark:text-slate-400">Auto 30s</span>
            <button onClick={() => refetch()} disabled={isFetching} className="cursor-pointer p-2 hover:bg-white/10 rounded-none transition-all">
              <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap px-5 md:px-0">
        <button
          onClick={() => setStatusFilter('')}
          className={`cursor-pointer px-4 py-2 rounded-none font-black text-xs transition-all ${
            statusFilter === '' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Semua
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={`cursor-pointer px-4 py-2 rounded-none font-black text-xs transition-all ${
              statusFilter === s.value ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-900 rounded-none border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <th className="px-6 py-5">Streamer</th>
              <th className="px-6 py-5">Kategori</th>
              <th className="px-6 py-5">Judul</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5">Waktu</th>
              <th className="px-6 py-5 text-center">Aksi</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400 font-bold">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-4 border-slate-200 border-t-blue-600 rounded-none animate-spin" />Memuat...
                    </div>
                  </td>
                </tr>
              ) : suggestions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    <MessageCircle size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-black text-sm">Belum ada saran</p>
                  </td>
                </tr>
              ) : (
                suggestions.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                    <td className="px-6 py-4">
                      <p className="font-black text-sm text-slate-700 dark:text-slate-200">@{s.username}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-[10px] font-black ${
                        s.category === 'feature' ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' :
                        s.category === 'bug' ? 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400' :
                        s.category === 'improvement' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {CATEGORY_ICONS[s.category]}
                        {s.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-[250px]">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{s.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{s.message}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-none text-[10px] font-black ${STATUS_COLORS[s.status]}`}>
                        {STATUS_LABELS[s.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[10px] text-slate-400">{formatDate(s.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => { setSelectedSuggestion(s); setAdminNote(s.adminNote || ''); }}
                        className="cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-none transition-all"
                      >
                        <Edit size={16} className="text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit */}
      <AnimatePresence>
        {selectedSuggestion && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSuggestion(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-none p-6 z-[9999] shadow-2xl border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">Review Saran</h3>
                <button onClick={() => setSelectedSuggestion(null)} className="cursor-pointer p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-none">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dari</label>
                  <p className="font-black text-slate-700 dark:text-slate-200">@{selectedSuggestion.username}</p>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori</label>
                  <p className="font-medium text-slate-600 dark:text-slate-300 capitalize">{selectedSuggestion.category}</p>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Judul</label>
                  <p className="font-black text-slate-700 dark:text-slate-200">{selectedSuggestion.title}</p>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pesan</label>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{selectedSuggestion.message}</p>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleUpdateStatus(selectedSuggestion, opt.value)}
                        disabled={updateMutation.isPending}
                        className={`cursor-pointer py-2 rounded-none font-black text-xs transition-all ${
                          selectedSuggestion.status === opt.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Catatan Admin</label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Tulis catatan untuk streamer..."
                    rows={3}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none font-medium text-sm text-slate-700 dark:text-slate-200 focus:border-blue-500 outline-none resize-none"
                  />
                </div>

                <button
                  onClick={() => handleUpdateStatus(selectedSuggestion, selectedSuggestion.status)}
                  disabled={updateMutation.isPending}
                  className="cursor-pointer w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-none font-black text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updateMutation.isPending ? (
                    <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
                  ) : (
                    <><Send size={16} /> Simpan Perubahan</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};