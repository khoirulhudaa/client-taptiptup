// pages/AdminAnnouncements.jsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  ImageIcon,
  Info,
  Loader2,
  Megaphone,
  PenLine,
  Plus,
  RefreshCw,
  Star,
  Tag,
  Trash2,
  Users,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { useRef, useState } from 'react';
import api from '../lib/axiosInstance';
import toast from 'react-hot-toast';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  info:        { label: 'Info',        icon: <Info size={13} />,         color: 'bg-blue-500',   text: 'text-blue-600',   badge: 'bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900' },
  warning:     { label: 'Peringatan',  icon: <AlertTriangle size={13} />, color: 'bg-amber-500',  text: 'text-amber-600',  badge: 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900' },
  update:      { label: 'Update',      icon: <Zap size={13} />,           color: 'bg-emerald-500',text: 'text-emerald-600',badge: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900' },
  promo:       { label: 'Promo',       icon: <Star size={13} />,          color: 'bg-pink-500',   text: 'text-pink-600',   badge: 'bg-pink-100 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-900' },
  maintenance: { label: 'Maintenance', icon: <Wrench size={13} />,        color: 'bg-slate-500',  text: 'text-slate-600',  badge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700' },
};

const fmtDate = (d) => d ? new Date(d).toLocaleString('id-ID', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '-';

const isExpired = (d) => d && new Date(d) < new Date();

// ─── API ─────────────────────────────────────────────────────────────────────

const fetchAnnouncements = async (params = {}) => {
  const q = new URLSearchParams(params);
  return (await api.get(`/api/announcements/admin?${q}`)).data;
};

// ─── AnnouncementForm ─────────────────────────────────────────────────────────

const AnnouncementForm = ({ initial, onClose, onSuccess }) => {
  const isEdit = !!initial?._id;
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    type: initial?.type || 'info',
    expiresAt: initial?.expiresAt ? new Date(initial.expiresAt).toISOString().slice(0,16) : '',
    isActive: initial?.isActive !== false,
    removeImage: false,
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(initial?.imageUrl || null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    upd('removeImage', false);
  };

  const removeImg = () => {
    setImage(null);
    setPreview(null);
    upd('removeImage', true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Judul dan deskripsi wajib diisi');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('type', form.type);
      fd.append('isActive', form.isActive);
      fd.append('removeImage', form.removeImage);
      if (form.expiresAt) fd.append('expiresAt', new Date(form.expiresAt).toISOString());
      if (image) fd.append('image', image);

      if (isEdit) {
        await api.put(`/api/announcements/admin/${initial._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('✅ Pengumuman diperbarui!');
      } else {
        await api.post('/api/announcements/admin', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('✅ Pengumuman dibuat!');
      }
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Judul *</label>
        <input
          value={form.title}
          onChange={e => upd('title', e.target.value)}
          placeholder="Judul pengumuman..."
          maxLength={120}
          className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-none font-bold text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 transition-all"
        />
        <p className="text-[10px] text-slate-400 mt-1 text-right">{form.title.length}/120</p>
      </div>

      {/* Description */}
      <div>
        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Deskripsi *</label>
        <textarea
          value={form.description}
          onChange={e => upd('description', e.target.value)}
          placeholder="Isi pengumuman secara detail..."
          rows={5}
          maxLength={2000}
          className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-none font-medium text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 transition-all resize-y"
        />
        <p className="text-[10px] text-slate-400 mt-1 text-right">{form.description.length}/2000</p>
      </div>

      {/* Type & Active row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Jenis Info</label>
          <div className="grid grid-cols-1 gap-1.5">
            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => upd('type', key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-none border-2 text-xs font-black transition-all cursor-pointer active:scale-[0.98] ${
                  form.type === key
                    ? `border-current ${cfg.badge}`
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400'
                }`}
              >
                <span className={form.type === key ? '' : 'opacity-50'}>{cfg.icon}</span>
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* Active toggle */}
          <div>
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Status</label>
            <button
              onClick={() => upd('isActive', !form.isActive)}
              className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-none border-2 font-black text-sm transition-all cursor-pointer active:scale-[0.97] ${
                form.isActive
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-400 bg-slate-50 dark:bg-slate-800'
              }`}
            >
              <span>{form.isActive ? '● Aktif' : '○ Non-aktif'}</span>
              <div className={`w-10 h-5 rounded-none relative ${form.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-none shadow transition-all ${form.isActive ? 'left-5' : 'left-0.5'}`} />
              </div>
            </button>
          </div>

          {/* Expires at */}
          <div>
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">
              Masa Berlaku <span className="normal-case font-medium">(opsional)</span>
            </label>
            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={e => upd('expiresAt', e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-none text-sm font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 transition-all"
            />
            {form.expiresAt && (
              <button onClick={() => upd('expiresAt', '')} className="text-[10px] text-red-400 hover:text-red-600 mt-1 font-bold cursor-pointer">
                ✕ Hapus masa berlaku
              </button>
            )}
          </div>

          {/* Image upload */}
          <div>
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Gambar</label>
            {preview ? (
              <div className="relative group">
                <img src={preview} alt="preview" className="w-full h-32 object-cover rounded-none border-2 border-slate-200 dark:border-slate-700" />
                <button
                  onClick={removeImg}
                  className="cursor-pointer absolute top-1.5 right-1.5 w-7 h-7 bg-red-600 text-white rounded-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-none p-4 text-center hover:border-blue-400 transition-all">
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
                <ImageIcon size={20} className="mx-auto text-slate-300 dark:text-slate-600 mb-1" />
                <p className="text-xs font-bold text-slate-400">Upload gambar</p>
                <p className="text-[10px] text-slate-300 dark:text-slate-600">maks 5MB</p>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button onClick={onClose} className="cursor-pointer flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-none font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
          Batal
        </button>
        <button onClick={handleSubmit} disabled={loading}
          className="cursor-pointer flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-none font-black text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={15} className="animate-spin" /> Menyimpan...</> : <>{isEdit ? <><PenLine size={15}/> Perbarui</> : <><Plus size={15}/> Buat</>}</>}
        </button>
      </div>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export const AdminAnnouncementsPage = () => {
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const params = {};
  if (typeFilter) params.type = typeFilter;
  if (activeFilter !== '') params.isActive = activeFilter;

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['adminAnnouncements', params],
    queryFn: () => fetchAnnouncements(params),
    refetchInterval: 30000,
  });

  const announcements = data?.announcements || [];
  const pagination = data?.pagination || {};

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/announcements/admin/${deleteId}`);
      toast.success('Pengumuman dihapus');
      queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] });
      setDeleteId(null);
    } catch (err) {
      toast.error('Gagal menghapus');
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditItem(null);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] });
    closeForm();
  };

  const toggleExpand = (id) => setExpandedId(v => v === id ? null : id);

  return (
    <div className="space-y-0 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-none p-4 md:p-5 md:p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
        <div className="relative md:flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Megaphone size={14} className="text-blue-300" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">Super Admin</span>
            </div>
            <h1 className="text-md md:text-lg font-black tracking-tight">Manajemen Pengumuman</h1>
            <p className="text-blue-200 text-sm font-medium mt-1">Kirim info, update, & promo ke semua streamer</p>
          </div>
          <button
            onClick={() => { setEditItem(null); setShowForm(true); }}
            className="cursor-pointer flex-shrink-0 mt-3 md:mt-4 flex items-center gap-2 px-2 md:pl-2 md:pr-2.5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-none font-black text-sm border border-white/30 backdrop-blur-sm transition-all active:scale-[0.97]"
          >
            <Plus size={16} /> Buat Pengumuman
          </button>
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[999] flex items-start justify-end p-0 md:py-0 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeForm}
              className="fixed inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.97 }}
              className="relative w-full max-w-2xl min-h-screen bg-white dark:bg-slate-900 rounded-none shadow-2xl border border-slate-100 dark:border-slate-800 z-10"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-black md:text-md text-slate-800 dark:text-slate-100">
                  {editItem ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
                </h3>
                <button onClick={closeForm} className="cursor-pointer text-slate-400 hover:text-slate-600 p-1"><X size={20} /></button>
              </div>
              <div className="p-4 md:p-5">
                <AnnouncementForm initial={editItem} onClose={closeForm} onSuccess={handleSuccess} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-none p-8 text-center shadow-2xl border border-slate-100 dark:border-slate-800 z-10"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 mx-auto mb-5 bg-red-100 dark:bg-red-950/40 rounded-none flex items-center justify-center">
                <Trash2 size={28} className="text-red-600" />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">Hapus Pengumuman?</h3>
              <p className="text-slate-500 text-sm font-medium mb-7">Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="cursor-pointer flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-none font-black text-sm">Batal</button>
                <button onClick={handleDelete} disabled={deleting}
                  className="cursor-pointer flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-none font-black text-sm transition-all disabled:opacity-60">
                  {deleting ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="gap-2 px-4 md:px-0 my-5">
        {/* Type filter */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-2">
          <button onClick={() => setTypeFilter('')}
            className={`px-3 py-2 rounded-none text-[11px] font-black border transition-all cursor-pointer ${!typeFilter ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-transparent' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'}`}>
            Semua Jenis
          </button>
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
            <button key={key} onClick={() => setTypeFilter(k => k === key ? '' : key)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-none text-[11px] font-black border transition-all cursor-pointer ${typeFilter === key ? cfg.badge + ' border-current' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'}`}>
              {cfg.icon} {cfg.label}
            </button>
          ))}
        </div>
        {/* Active filter */}
        <div className='w-full grid gap-2 border-t border-slate-200/20 pt-2 md:border-t-none grid-cols-3'>
          {[{ v: '', l: 'Semua Status' }, { v: 'true', l: '✅ Aktif' }, { v: 'false', l: '○ Non-aktif' }].map(f => (
            <button key={f.v} onClick={() => setActiveFilter(f.v)}
            className={`px-3 py-2 rounded-none text-[11px] font-black border transition-all cursor-pointer ${activeFilter === f.v ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-transparent' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'}`}>
              {f.l}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="relative space-y-0 md:space-y-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 gap-3 font-bold">
            <Loader2 size={20} className="animate-spin" /> Memuat pengumuman...
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-20 text-center text-slate-400 bg-white/30 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-none">
            <Megaphone size={36} className="mx-auto mb-4 opacity-30" />
            <p className="font-black text-slate-500">Belum ada pengumuman</p>
            <p className="text-sm font-medium mt-1">Buat pengumuman pertama untuk streamer</p>
          </div>
        ) : (
          announcements.map((ann, i) => {
            const cfg = TYPE_CONFIG[ann.type] || TYPE_CONFIG.info;
            const expired = isExpired(ann.expiresAt);
            const isExpanded = expandedId === ann._id;

            return (
              <motion.div
                key={ann._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                className={`relative bg-white h-[200px] dark:bg-slate-900 border rounded-none overflow-hidden shadow-sm transition-all ${
                  !ann.isActive || expired
                    ? 'border-slate-200 dark:border-slate-800 opacity-60'
                    : 'border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className={`h-[3px] ${cfg.color}`} />
                <div className="p-4 md:p-5">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-none flex items-center justify-center flex-shrink-0 ${cfg.color} text-white`}>
                      {cfg.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-black truncate max-w-[780%] overflow-hidden text-slate-800 dark:text-slate-100 truncate">{ann.title}</h3>
                          </div>
                          <p className={`text-sm text-slate-500 dark:text-slate-400 font-medium ${isExpanded ? '' : 'line-clamp-2'}`}>
                            {ann.description}
                          </p>
                          {ann.description.length > 120 && (
                            <button onClick={() => toggleExpand(ann._id)}
                              className="text-[11px] font-black text-blue-500 hover:text-blue-600 mt-0.5 cursor-pointer flex items-center gap-1">
                              {isExpanded ? 'Sembunyikan' : 'Lihat selengkapnya'}
                              <ChevronDown size={11} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          )}
                        </div>

                        {/* Actions */}
                      </div>

                      {/* Preview image */}
                      {isExpanded && ann.imageUrl && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3">
                          <img src={ann.imageUrl} alt="preview" className="max-h-48 object-cover rounded-none border border-slate-200 dark:border-slate-700" />
                        </motion.div>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-400 dark:text-slate-500 font-medium flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar size={10} /> {fmtDate(ann.createdAt)}
                        </span>
                        {ann.expiresAt && (
                          <span className={`flex items-center gap-1 ${expired ? 'text-red-400' : ''}`}>
                            <Clock size={10} /> Berlaku hingga {fmtDate(ann.expiresAt)}
                          </span>
                        )}
                        {ann.imageUrl && (
                          <span className="flex items-center gap-1 text-blue-400">
                            <ImageIcon size={10} /> Ada gambar
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Eye size={10} /> {ann.readCount || 0} sudah baca
                        </span>
                      </div>
                    </div>
                  </div>
                    <div className="absolute bottom-4 right-4 flex items-center gap-2 mt-6 flex-shrink-0">
                        <span className={`px-2 py-2.5 rounded-none text-[9px] font-black uppercase tracking-wider border ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                        {!ann.isActive && (
                          <span className="px-2 py-2.5 rounded-none text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                            Non-aktif
                          </span>
                        )}
                        {expired && (
                          <span className="px-2 py-2.5 rounded-none text-[9px] font-black bg-red-100 dark:bg-red-950/40 text-red-500 border border-red-200 dark:border-red-900">
                            Kedaluwarsa
                          </span>
                        )}
                        <button onClick={() => openEdit(ann)}
                        className="border border-white/20 active:scale-[0.98] cursor-pointer p-2 text-white hover:text-white/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-none transition-all">
                        <PenLine size={16} />
                        </button>
                        <button onClick={() => setDeleteId(ann._id)}
                        className="cursor-pointer p-2 border border-white/20 active:scale-[0.98]  text-white hover:text-white/80 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-none transition-all">
                        <Trash2 size={16} />
                        </button>
                    </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminAnnouncementsPage;