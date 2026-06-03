// components/MediaShareSettings.jsx
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  ImageIcon,
  RefreshCw,
  Video,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import api from '../lib/axiosInstance';
import toast from 'react-hot-toast';
import { MediaShareControl } from './mediaShareController';

// ─── InstantTestMediaShare ────────────────────────────────────────────────────

const PRESET_MEDIA = [
  { url: 'https://picsum.photos/400/300?random=1', type: 'image', label: '🖼️ Random Image', thumb: 'https://picsum.photos/80/60?random=1' },
  { url: 'https://picsum.photos/400/300?random=2', type: 'image', label: '🖼️ Image 2',      thumb: 'https://picsum.photos/80/60?random=2' },
  { url: 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif', type: 'image', label: '🎬 GIF', thumb: 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy-preview.webp' },
  { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', type: 'video', label: '📺 YouTube', thumb: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
];

export const InstantTestMediaShare = ({ overlayToken, user }) => {
  const [isSending, setIsSending] = useState(false);
  const [lastSent, setLastSent]   = useState(null);
  const [formData, setFormData]   = useState({
    donorName: 'TestDonor',
    amount: '',
    message: 'Terima kasih atas dukungannya! 🔥',
    mediaUrl: 'https://picsum.photos/400/300',
    mediaType: 'image',
  });

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const sendTestMedia = async () => {
    if (!overlayToken || !formData.mediaUrl) return;
    setIsSending(true);
    try {
      await api.post('/api/midtrans/test-mediashare/send', {
        targetUsername: user.username,
        donorName: formData.donorName,
        amount: Number(formData.amount) || 0,
        message: formData.message || null,
        mediaUrl: formData.mediaUrl,
        mediaType: formData.mediaType,
      });
      setLastSent(new Date());
      toast.success('✅ Test MediaShare terkirim ke OBS!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-none p-4 md:p-6 shadow-xl border border-slate-100 dark:border-slate-800 space-y-4">
      <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-none text-white shadow-lg">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 14H5v-2h2v2zm0-4H5V9h2v6zm4 4H9v-2h2v2zM9 11H9V9h2v2zm4 4h-2v-2h2v2zm0-4h-2V9h2v6z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Instant Test MediaShare</h3>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { label: 'Nama Donor', field: 'donorName', type: 'text',   ph: '@TestDonor' },
          { label: 'Nominal',    field: 'amount',    type: 'number', ph: '25000' },
        ].map(({ label, field, type, ph }) => (
          <div key={field} className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</label>
            <input 
              type={type} 
              value={formData[field]} 
              onChange={e => update(field, type === 'number' ? (e.target.value === '' ? '' : e.target.value) : e.target.value)}
              placeholder={ph}
              className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none font-bold text-sm focus:border-purple-400 focus:outline-none transition-all" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Pesan (opsional)</label>
        <textarea value={formData.message} onChange={e => update('message', e.target.value)} rows={2}
          className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none font-medium text-sm resize-none focus:border-blue-400 focus:outline-none transition-all"
          placeholder="Terima kasih dukungannya!" />
      </div>

      {/* Media URL + Type */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex-1">Media URL</label>
          <select value={formData.mediaType} onChange={e => update('mediaType', e.target.value)}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none text-xs font-bold">
            <option value="image">🖼️ Image/GIF</option>
            <option value="video">▶ MP4/YouTube</option>
          </select>
        </div>
        <input value={formData.mediaUrl} onChange={e => update('mediaUrl', e.target.value)}
          className="w-full p-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-none font-bold text-sm focus:border-purple-400 focus:outline-none transition-all"
          placeholder="https://example.com/image.jpg" />
      </div>

      {/* Preset thumbnails */}
      <div className="pt-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Quick Presets</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {PRESET_MEDIA.map((preset, i) => (
            <button key={i} onClick={() => { update('mediaUrl', preset.url); update('mediaType', preset.type); }}
              className={`cursor-pointer active:scale-[0.99] group relative p-2 rounded-none border-2 transition-all overflow-hidden hover:shadow-md ${
                formData.mediaUrl === preset.url ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 bg-slate-50 dark:bg-slate-800/50'
              }`}>
              <div className="w-full h-16 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded overflow-hidden">
                <img src={preset.thumb} alt={preset.label} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <button onClick={sendTestMedia} disabled={isSending || !overlayToken || !formData.mediaUrl}
        className="cursor-pointer hover:brightness-90 w-full py-3 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 text-white rounded-none font-black text-sm shadow-2xl active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
        {isSending ? <><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Mengirim...</span></> : <><Zap size={18} /> Kirim Test MediaShare ke OBS</>}
      </button>

      <AnimatePresence>
        {lastSent && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 rounded-none px-4 py-3 border border-emerald-100 dark:border-emerald-900">
            <CheckCircle2 size={14} /> MediaShare berhasil dikirim: {lastSent.toLocaleTimeString('id-ID')}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── MediaShareSettingsPage ───────────────────────────────────────────────────
// Wrapper utama untuk tab mediashare — berisi test + control

const MediaShareSettingsPage = ({ overlayToken, user, settings, upd, saveSettingsMutation }) => {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-none p-6 text-white relative overflow-hidden">
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full" />
        <div className="relative z-10">
          <p className="text-purple-200 text-xs font-black uppercase tracking-widest mb-2">Media Share</p>
          <h2 className="text-3xl font-black tracking-tight">MediaShare.</h2>
          <p className="text-purple-200 text-sm font-medium mt-1">Kontrol & test media yang dikirim donatur</p>
        </div>
        <div className="absolute top-3 right-4 text-5xl opacity-20">🎬</div>
      </div>

      {/* MediaShare Controller — skip, skip all, volume */}
      <div className="bg-white dark:bg-slate-900 rounded-none p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-600 rounded-none text-white shadow-lg">
            <Video size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">Kontrol Live</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Skip media atau atur volume saat stream berlangsung</p>
          </div>
        </div>
        <MediaShareControl />
      </div>

      {/* Test MediaShare */}
      <InstantTestMediaShare overlayToken={overlayToken} user={user} />

      {/* Info box */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-none p-6 text-white">
        <p className="text-slate-300 text-xs font-black uppercase tracking-widest mb-4">Cara Kerja MediaShare</p>
        <div className="space-y-3">
          {[
            { step: '01', text: 'Donatur memasukkan link gambar atau YouTube saat donasi' },
            { step: '02', text: 'Setelah pembayaran sukses, media masuk ke antrian MediaShare overlay' },
            { step: '03', text: 'Buka URL MediaShare OBS di Browser Source untuk menampilkan media' },
            { step: '04', text: 'Gunakan kontrol di atas untuk skip atau atur volume saat live' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <span className="text-[10px] font-black text-slate-400 mt-0.5 flex-shrink-0 w-5">{step}</span>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MediaShareSettingsPage;