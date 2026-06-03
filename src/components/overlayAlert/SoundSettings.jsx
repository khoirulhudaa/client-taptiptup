import { Music, Plus, Save, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/axiosInstance';
import { SectionHeader } from './AlertConfig';

// ─── Sound presets ─────────────────────────────────────────────────────────────

const APP_URL = window.location.origin;

export const SOUND_PRESETS = [
  { label: 'Ding 🔔',     url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
  { label: 'Cash 💰',     url: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3' },
  { label: 'Kururing 📢', url: `${APP_URL}/kururing.mpeg` },
  { label: 'Kaching 💸',  url: `${APP_URL}/kaching.mpeg` },
  { label: 'Booom 💥',     url: `${APP_URL}/boom.mp3` },
  { label: 'Tuturu 🎊',    url: `${APP_URL}/tuturu.mp3` },
  { label: 'Dana 🤑',      url: `${APP_URL}/dana.mp3` },
  { label: 'Cihuy 🔥',     url: `${APP_URL}/cihuy.mp3` },
  { label: 'Tada 🎉',     url: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3' },
  { label: 'Gold 🪙',     url: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3' },
  { label: 'Whooo 🗣️',   url: 'https://assets.mixkit.co/active_storage/sfx/2010/2010-preview.mp3' },
  { label: 'Jackpot 🎰',  url: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3' },
  { label: 'Bling ✨',    url: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3' },
  { label: 'Payout 💸',   url: 'https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3' },
];

// ─── SoundPicker ──────────────────────────────────────────────────────────────

export const SoundPicker = ({ value, onChange, label = 'Pilih Suara' }) => {
  const [mode, setMode] = useState(value && !SOUND_PRESETS.find(p => p.url === value) ? 'custom' : 'preset');
  const audioRef = useRef(null);

  const playPreview = (url) => {
    if (!url) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = url;
      audioRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="space-y-3">
      {label && <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</label>}
      <div className="flex gap-2">
        {[{ id: 'preset', label: '🎵 Pilih Preset' }, { id: 'custom', label: '🔗 URL Custom' }].map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className={`cursor-pointer active:scale-[0.97] px-4 py-2 rounded-none font-black text-xs transition-all ${
              mode === m.id
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}>
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'preset' && (
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => onChange('')}
            className={`cursor-pointer active:scale-[0.97] flex flex-col items-center gap-1.5 p-3 rounded-none border-2 font-black text-xs transition-all ${
              !value ? 'border-slate-600 bg-slate-800 text-white shadow-md' : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400'
            }`}>
            <span className="text-lg">🔇</span><span>Tanpa Suara</span>
          </button>
          {SOUND_PRESETS.map(preset => (
            <button key={preset.url} onClick={() => { onChange(preset.url); playPreview(preset.url); }}
              className={`cursor-pointer active:scale-[0.97] flex flex-col items-center gap-1.5 p-3 rounded-none border-2 font-black text-xs transition-all ${
                value === preset.url
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-md'
                  : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500'
              }`}>
              <span className="text-lg">{preset.label.split(' ')[1]}</span>
              <span>{preset.label.split(' ')[0]}</span>
              <span onClick={e => { e.stopPropagation(); playPreview(preset.url); }}
                className="text-[9px] font-medium text-slate-400 hover:text-indigo-600 transition-colors">
                ▶ preview
              </span>
            </button>
          ))}
        </div>
      )}

      {mode === 'custom' && (
        <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder="https://... .mp3"
          className="w-full p-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-none font-bold text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-400 transition-all" />
      )}

      {value && (
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-none p-3 border border-slate-100 dark:border-slate-700">
          <button onClick={() => playPreview(value)}
            className="cursor-pointer active:scale-[0.97] w-8 h-8 bg-indigo-600 rounded-none flex items-center justify-center text-white text-xs hover:bg-indigo-700 transition-all flex-shrink-0">
            ▶
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400">
              {SOUND_PRESETS.find(p => p.url === value)?.label || 'Custom Sound'}
            </p>
            <p className="text-[9px] text-slate-300 dark:text-slate-600 font-mono truncate">{value}</p>
          </div>
          <button onClick={() => onChange('')} className="cursor-pointer text-slate-300 hover:text-red-400 transition-colors text-sm flex-shrink-0">✕</button>
        </div>
      )}
      <audio ref={audioRef} />
    </div>
  );
};

// ─── SoundTiersEditor ─────────────────────────────────────────────────────────

export const SoundTiersEditor = ({ tiers = [], onChange, saveSettingsMutation, settings }) => {
  const add    = () => onChange([...tiers, { minAmount: 50000, maxAmount: null, soundUrl: '', label: '' }]);
  const remove = (i) => onChange(tiers.filter((_, idx) => idx !== i));
  const upd    = (i, key, val) =>
    onChange(tiers.map((t, idx) => idx === i
      ? { ...t, [key]: key === 'minAmount' || key === 'maxAmount' ? (val === '' ? null : Number(val)) : val }
      : t));

  return (
    <div className="space-y-3">
      {tiers.map((t, i) => (
        <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-none p-4 border border-slate-100 dark:border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-black text-slate-600 dark:text-slate-300 text-sm">{t.label || `Tier Suara ${i + 1}`}</span>
            <button onClick={() => remove(i)} className="cursor-pointer text-red-400 hover:text-red-600 p-1">
              <Trash2 size={15} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['Min (Rp)', 'minAmount', t.minAmount], ['Max (kosong=∞)', 'maxAmount', t.maxAmount ?? '']].map(([lbl, key, val]) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{lbl}</label>
                <input type="number" value={val} placeholder={key === 'maxAmount' ? '∞' : ''}
                  onChange={e => upd(i, key, e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-none font-bold text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-400" />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Label (opsional)</label>
            <input value={t.label} placeholder="contoh: Sultan Alert Sound"
              onChange={e => upd(i, 'label', e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-none font-bold text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-400" />
          </div>
          <SoundPicker value={t.soundUrl} onChange={v => upd(i, 'soundUrl', v)} />
        </div>
      ))}
      <button onClick={add}
        className="cursor-pointer active:scale-[0.97] w-full py-3 border-2 border-dashed border-indigo-200 dark:border-indigo-900 text-indigo-500 dark:text-indigo-400 rounded-none font-black text-sm hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all flex items-center justify-center gap-2">
        <Plus size={16} /> Tambah Suara per Nominal
      </button>
      <button onClick={() => saveSettingsMutation.mutate(settings)} disabled={saveSettingsMutation.isPending}
        className="cursor-pointer active:scale-[0.97] hover:brightness-90 w-full bg-slate-900 dark:bg-slate-700 text-white py-4 rounded-none font-black text-sm transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-70 flex items-center justify-center gap-2">
        <Save size={20} />
        {saveSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Audio Terbaru'}
      </button>
    </div>
  );
};

// ─── SoundSettings (main component) ──────────────────────────────────────────

const SoundSettings = ({ settings, upd, saveSettingsMutation, formData, setFormData, setLocalSettings }) => {
  const [uploading, setUploading] = useState(false);

  const handleUploadAudio = async (file) => {
    const uploadFormData = new FormData();
    uploadFormData.append('audio', file);
    try {
      setUploading(true);
      const res = await api.post('/api/overlay/upload-audio', uploadFormData);
      const newSound = {
        url: res.data.url,
        label: file.name.replace(/\.[^/.]+$/, ''),
        emoji: '🎵'
      };
      const updatedSounds = [...(formData.publicSounds || []), newSound];
      setFormData(prev => ({ ...prev, publicSounds: updatedSounds }));
      setLocalSettings(prev => ({ ...prev, publicSounds: updatedSounds }));
      toast.success('✅ Suara berhasil diupload!');
    } catch (err) {
      toast.error('❌ Upload gagal: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-none p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-8">
      <SectionHeader icon={<Music size={20} />} title="Pengaturan Suara Alert" color="bg-gradient-to-r from-emerald-500 to-indigo-500" />

      {/* Default sound */}
      <div className="space-y-6">
        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-none border border-slate-200 dark:border-slate-700">
          <h4 className="font-black text-sm text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            📢 Suara Default (Semua Donasi)
          </h4>
          <SoundPicker
            label="Pilih suara default"
            value={settings.soundUrl || ''}
            onChange={v => upd('soundUrl', v)}
          />
        </div>

        <SoundTiersEditor
          saveSettingsMutation={saveSettingsMutation}
          settings={settings}
          tiers={settings.soundTiers || []}
          onChange={v => upd('soundTiers', v)}
        />
      </div>

      {/* TTS */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
        <SectionHeader icon={<span className="text-xl">🔊</span>} title="Text-to-Speech Alert" color="bg-rose-500" />

        <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-none border border-slate-100 dark:border-slate-700 mt-4">
          <div>
            <p className="font-black text-slate-700 dark:text-slate-200">Aktifkan Text-to-Speech</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Suara akan otomatis membaca: Nama + Nominal + Pesan</p>
          </div>
          <button
            onClick={() => upd('ttsEnabled', !settings.ttsEnabled)}
            className={`relative inline-flex h-7 w-14 items-center rounded-none transition-colors duration-300 cursor-pointer ${settings.ttsEnabled ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-600'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-none bg-white shadow-md transition-transform ${settings.ttsEnabled ? 'translate-x-8' : 'translate-x-1'}`} />
          </button>
        </div>

        {settings.ttsEnabled && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Kecepatan', key: 'ttsRate', min: 0.5, max: 2, step: 0.1, suffix: 'x' },
              { label: 'Nada Suara', key: 'ttsPitch', min: 0.5, max: 2, step: 0.1, suffix: '' },
              { label: 'Volume', key: 'ttsVolume', min: 0.1, max: 1, step: 0.1, isPercent: true },
            ].map(({ label, key, min, max, step, suffix, isPercent }) => (
              <div key={key}>
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{label}</label>
                <input type="range" min={min} max={max} step={step}
                  value={settings[key] || 1}
                  onChange={e => upd(key, parseFloat(e.target.value))}
                  className="w-full accent-rose-500"
                />
                <div className="text-center text-xs text-slate-400 mt-1">
                  {isPercent
                    ? `${Math.round((settings[key] || 1) * 100)}%`
                    : `${(settings[key] || 1).toFixed(1)}${suffix}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save */}
      <button
        onClick={() => saveSettingsMutation.mutate(settings)}
        disabled={saveSettingsMutation.isPending || uploading}
        className="cursor-pointer active:scale-[0.99] w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-90 text-white font-black rounded-none shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {saveSettingsMutation.isPending || uploading
          ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Menyimpan...</>
          : <><Save size={20} /> Simpan Pengaturan Suara</>
        }
      </button>
    </div>
  );
};

export default SoundSettings;