// components/SuggestionsManager.jsx
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axiosInstance';
import { 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Eye,
  Check,
  X,
  Clock,
  Lightbulb,
  Bug,
  Zap,
  HelpCircle,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  ChevronDown,
  PlusCircleIcon
} from 'lucide-react';

const CATEGORIES = [
  { value: 'feature', label: 'Fitur Baru', icon: <Zap size={14} />, desc: 'Request fitur baru' },
  { value: 'bug', label: 'Bug / Error', icon: <Bug size={14} />, desc: 'Laporan bug' },
  { value: 'improvement', label: 'Perbaikan', icon: <Lightbulb size={14} />, desc: 'Saran perbaikan' },
  { value: 'other', label: 'Lainnya', icon: <HelpCircle size={14} />, desc: 'Masukan lainnya' },
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

export const SuggestionsManager = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ category: 'feature', title: '', message: '' });
  const [toast, setToast] = useState(null);
  const toastTimeout = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(null), 3500);
  };

  // Fetch my suggestions
  const { data: suggestionsData, isLoading, refetch } = useQuery({
    queryKey: ['mySuggestions'],
    queryFn: async () => {
      const res = await api.get('/api/suggestions/my');
      return res.data;
    },
  });

  const mySuggestions = suggestionsData?.suggestions || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/api/suggestions', data);
      return res.data;
    },
    onSuccess: () => {
      showToast('Saran berhasil dikirim! Terima kasih 🙏');
      setFormData({ category: 'feature', title: '', message: '' });
      setShowForm(false);
      refetch();
    },
    onError: (err) => {
      showToast(err.response?.data?.message || 'Gagal mengirim saran', 'error');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      return showToast('Judul dan pesan wajib diisi', 'error');
    }
    createMutation.mutate({
      category: formData.category,
      title: formData.title.trim(),
      message: formData.message.trim(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-none shadow-2xl font-bold text-sm ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-none p-6 text-white relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle size={20} />
            <span className="text-blue-200 text-xs font-black uppercase tracking-widest">Feedback</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Saran & Masukan</h2>
          <p className="text-blue-200 text-sm font-medium mt-1">Bantu kami improve TapTipTup lebih baik</p>
        </div>
      </div>

      {/* Form Kirim Saran */}
      <div className="bg-white dark:bg-slate-900 rounded-none border border-slate-100 dark:border-slate-800 overflow-hidden">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/40 rounded-none flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Send size={18} />
            </div>
            <div className="text-left">
              <p className="font-black text-slate-700 dark:text-slate-200">Kirim Saran Baru</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Ceritakanidemu kepada kami</p>
            </div>
          </div>
          <div className={`w-8 h-8 flex items-center justify-center rounded-none transition-all ${showForm ? 'rotate-180' : ''}`}>
            <PlusCircleIcon size={21} className="text-slate-400" />
          </div>
        </button>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 pb-6 space-y-5 border-t border-slate-100 dark:border-slate-800"
          >
            <form onSubmit={handleSubmit} className="space-y-4 pt-5">
              {/* Category */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                  Kategori
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.value })}
                      className={`cursor-pointer py-2.5 rounded-none font-black text-xs transition-all border-2 ${
                        formData.category === cat.value
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-blue-200'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        {cat.icon}
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                  Judul <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Tambahkan fitur dark mode untuk widget"
                  maxLength={200}
                  className="w-full p-4 rounded-none bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 outline-none font-bold text-sm text-slate-700 dark:text-slate-200 transition-all"
                />
                <p className="text-[10px] text-slate-400 mt-1 text-right">{formData.title.length}/200</p>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                  Detail Masukan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Jelaskan saran atau masukanmu secara detail..."
                  maxLength={2000}
                  rows={4}
                  className="w-full p-4 rounded-none bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 outline-none font-medium text-sm text-slate-700 dark:text-slate-200 transition-all resize-none"
                />
                <p className="text-[10px] text-slate-400 mt-1 text-right">{formData.message.length}/2000</p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={createMutation.isPending || !formData.title.trim() || !formData.message.trim()}
                className="active:scale-[0.99] cursor-pointer w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-none font-black text-sm shadow-lg shadow-blue-200 dark:shadow-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 transition-all"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Mengirim...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Kirim Saran
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </div>

      {/* Riwayat Saran */}
      <div className="bg-white dark:bg-slate-900 rounded-none border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="font-black text-slate-700 dark:text-slate-200">Riwayat Saran</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{mySuggestions.length} saran terkirim</p>
          </div>
          <button onClick={() => refetch()} className="cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-none transition-all">
            <RefreshCw size={20} className="text-slate-400" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 font-bold gap-3">
            <div className="w-5 h-5 border-4 border-slate-200 border-t-blue-600 rounded-none animate-spin" />Memuat...
          </div>
        ) : mySuggestions.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <MessageCircle size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-black text-sm">Belum ada saran</p>
            <p className="text-xs mt-1">Kirim saran pertama kamu!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {mySuggestions.map((s) => (
              <div key={s._id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-none flex items-center justify-center flex-shrink-0 ${
                    s.category === 'feature' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-600' :
                    s.category === 'bug' ? 'bg-red-100 dark:bg-red-950/40 text-red-600' :
                    s.category === 'improvement' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-600'
                  }`}>
                    {CATEGORY_ICONS[s.category]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-sm text-slate-700 dark:text-slate-200 truncate">{s.title}</span>
                      <span className={`px-2 py-0.5 rounded-none text-[9px] font-black ${STATUS_COLORS[s.status]}`}>
                        {STATUS_LABELS[s.status]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2">{s.message}</p>
                    <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-2">{formatDate(s.createdAt)}</p>
                    {s.adminNote && (
                      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-none border border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Respon Admin:</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{s.adminNote}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};