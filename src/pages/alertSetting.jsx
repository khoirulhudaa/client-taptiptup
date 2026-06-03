// components/AlertSettings.jsx
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  Copy,
  ImageIcon,
  Music,
  Plus,
  RefreshCw,
  Save,
  Timer,
  Trash2,
  Video,
  Zap,
  Settings,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api from '../lib/axiosInstance';
import toast from 'react-hot-toast';
import AudioManager from './AudioManager';

// ─── Constants ────────────────────────────────────────────────────────────────

const APP_URL = window.location.origin;

export const SOUND_PRESETS = [
  { label: 'Ding 🔔',     url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
  { label: 'Cash 💰',     url: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3' },
  { label: 'Kururing 📢', url: `${APP_URL}/kururing.mpeg` },
  { label: 'Kaching 💸',  url: `${APP_URL}/kaching.mpeg` },
  { label: 'Booom 💥',    url: `${APP_URL}/boom.mp3` },
  { label: 'Tuturu 🎊',   url: `${APP_URL}/tuturu.mp3` },
  { label: 'Dana 🤑',     url: `${APP_URL}/dana.mp3` },
  { label: 'Cihuy 🔥',   url: `${APP_URL}/cihuy.mp3` },
  { label: 'Tada 🎉',    url: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3' },
  { label: 'Gold 🪙',    url: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3' },
  { label: 'Whooo 🗣️',  url: 'https://assets.mixkit.co/active_storage/sfx/2010/2010-preview.mp3' },
  { label: 'Jackpot 🎰', url: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3' },
  { label: 'Bling ✨',   url: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3' },
  { label: 'Payout 💸',  url: 'https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3' },
];

export const ICON_PRESETS = [
  { emoji: '💜', label: 'Default'   }, { emoji: '❤️',  label: 'Merah'    },
  { emoji: '🐧', label: 'Penguin'  }, { emoji: '🔥',  label: 'Api'      },
  { emoji: '⭐', label: 'Bintang'  }, { emoji: '🎮',  label: 'Gamer'    },
  { emoji: '🎵', label: 'Musik'    }, { emoji: '🐉',  label: 'Naga'     },
  { emoji: '💰', label: 'Duit'     }, { emoji: '🎯',  label: 'Target'   },
  { emoji: '👑', label: 'Raja'     }, { emoji: '🌟',  label: 'Gemilang' },
  { emoji: '🚀', label: 'Roket'    }, { emoji: '⚡',  label: 'Kilat'    },
  { emoji: '💎', label: 'Permata' }, { emoji: '🤖',  label: 'Robot'    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const renderIconPreview = (customIcon, size = 20) => {
  if (!customIcon) return '💜';
  if (customIcon.startsWith('http') || customIcon.startsWith('/'))
    return <img src={customIcon} alt="icon" style={{ width: size, height: size, objectFit: 'contain', borderRadius: 4, display: 'inline-block' }} />;
  return customIcon;
};

const isValidHex = (v) =>
  /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v);

const normalizeToPickerHex = (v) => {
  if (!v) return '#000000';
  if (/^#[0-9a-fA-F]{3}$/.test(v))
    return '#' + [...v.slice(1)].map(c => c + c).join('');
  return v.slice(0, 7);
};

// ─── Sub-components ───────────────────────────────────────────────────────────

export const SectionHeader = ({ icon, title, color }) => (
  <div className="flex items-center gap-4">
    {icon && <div className={`${color} p-3 rounded-none text-white shadow-lg`}>{icon}</div>}
    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{title}</h3>
  </div>
);

export const InputField = ({ label, ...props }) => (
  <div className="w-full">
    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">{label}</label>
    <input
      className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-none p-3 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all font-bold text-sm text-slate-900 dark:text-slate-100 shadow-sm"
      {...props}
      onChange={e => props.onChange?.(e.target.value)}
    />
  </div>
);

export const ColorInput = React.memo(({ label, value, onChange, allowAlpha = false, id }) => {
  const inputId = id || `color-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const [raw, setRaw] = useState(value);

  const handleTextChange = useCallback((e) => {
    const v = e.target.value;
    setRaw(v);
    const clean = allowAlpha ? v : v.slice(0, 7);
    const timeoutId = setTimeout(() => onChange(clean), 300);
    return () => clearTimeout(timeoutId);
  }, [onChange, allowAlpha]);

  const handleTextBlur = useCallback(() => {
    if (!isValidHex(raw)) { setRaw(value); onChange(value); }
  }, [raw, value, onChange]);

  const handlePickerChange = useCallback((e) => {
    const picked = e.target.value;
    if (allowAlpha) {
      const alpha = isValidHex(value) && value.length === 9 ? value.slice(7, 9) : '';
      const next = picked + alpha;
      setRaw(next); onChange(next);
    } else {
      setRaw(picked); onChange(picked);
    }
  }, [value, onChange, allowAlpha]);

  const pickerHex  = useMemo(() => normalizeToPickerHex(isValidHex(raw) ? raw : value), [raw, value]);
  const previewColor = useMemo(() => isValidHex(raw) ? raw : value, [raw, value]);

  useEffect(() => { setRaw(value); }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</label>
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 flex-shrink-0 rounded-none overflow-hidden border border-slate-300 dark:border-slate-600 relative group">
          <input id={`${inputId}-picker`} type="color" value={pickerHex} onChange={handlePickerChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer peer z-10"
            style={{ width: '100%', height: '100%', padding: 0, border: 0, backgroundColor: 'transparent' }} />
          <div className="absolute inset-0 w-full h-full border-2 border-transparent group-hover:border-blue-400 transition-all" style={{ backgroundColor: pickerHex }} />
        </div>
        <input id={inputId} type="text" value={raw} onChange={handleTextChange} onBlur={handleTextBlur}
          spellCheck={false} placeholder={allowAlpha ? '#rrggbbaa' : '#rrggbb'}
          maxLength={allowAlpha ? 9 : 7}
          className="w-28 bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-none px-3 py-2 font-mono text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 transition-all" />
        <div className="flex-1 h-10 rounded-none border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-all" style={{ backgroundColor: previewColor }} />
      </div>
      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate bg-slate-50/50 dark:bg-slate-800/50 px-2 py-1 rounded">{previewColor}</div>
    </div>
  );
});
ColorInput.displayName = 'ColorInput';

// ─── SoundPicker ──────────────────────────────────────────────────────────────

export const SoundPicker = ({ value, onChange, label = 'Pilih Suara' }) => {
  const [mode, setMode] = useState(value && !SOUND_PRESETS.find(p => p.url === value) ? 'custom' : 'preset');
  const audioRef = useRef(null);
  const playPreview = (url) => {
    if (!url) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = url; audioRef.current.play().catch(() => {}); }
  };
  return (
    <div className="space-y-3">
      {label && <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</label>}
      <div className="flex gap-2">
        {[{ id: 'preset', label: '🎵 Pilih Preset' }, { id: 'custom', label: '🔗 URL Custom' }].map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className={`cursor-pointer active:scale-[0.97] px-4 py-2 rounded-none font-black text-xs transition-all ${mode === m.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
            {m.label}
          </button>
        ))}
      </div>
      {mode === 'preset' && (
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => onChange('')}
            className={`cursor-pointer active:scale-[0.97] flex flex-col items-center gap-1.5 p-3 rounded-none border-2 font-black text-xs transition-all ${!value ? 'border-slate-600 bg-slate-800 text-white shadow-md' : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
            <span className="text-lg">🔇</span><span>Tanpa Suara</span>
          </button>
          {SOUND_PRESETS.map(preset => (
            <button key={preset.url} onClick={() => { onChange(preset.url); playPreview(preset.url); }}
              className={`cursor-pointer active:scale-[0.97] flex flex-col items-center gap-1.5 p-3 rounded-none border-2 font-black text-xs transition-all ${value === preset.url ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-md' : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500'}`}>
              <span className="text-lg">{preset.label.split(' ')[1]}</span>
              <span>{preset.label.split(' ')[0]}</span>
              <span onClick={e => { e.stopPropagation(); playPreview(preset.url); }} className="text-[9px] font-medium text-slate-400 hover:text-blue-600 transition-colors">▶ preview</span>
            </button>
          ))}
        </div>
      )}
      {mode === 'custom' && (
        <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder="https://... .mp3"
          className="w-full p-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-none font-bold text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-400 transition-all" />
      )}
      {value && (
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-none p-3 border border-slate-100 dark:border-slate-700">
          <button onClick={() => playPreview(value)} className="cursor-pointer active:scale-[0.97] w-8 h-8 bg-blue-600 rounded-none flex items-center justify-center text-white text-xs hover:bg-blue-700 transition-all flex-shrink-0">▶</button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400">{SOUND_PRESETS.find(p => p.url === value)?.label || 'Custom Sound'}</p>
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
  const upd    = (i, key, val) => onChange(tiers.map((t, idx) => idx === i ? { ...t, [key]: key === 'minAmount' || key === 'maxAmount' ? (val === '' ? null : Number(val)) : val } : t));
  return (
    <div className="space-y-3">
      {tiers.map((t, i) => (
        <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-none p-4 border border-slate-100 dark:border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-black text-slate-600 dark:text-slate-300 text-sm">{t.label || `Tier Suara ${i + 1}`}</span>
            <button onClick={() => remove(i)} className="cursor-pointer text-red-400 hover:text-red-600 p-1"><Trash2 size={15} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['Min (Rp)', 'minAmount', t.minAmount], ['Max (kosong=∞)', 'maxAmount', t.maxAmount ?? '']].map(([lbl, key, val]) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{lbl}</label>
                <input type="number" value={val} placeholder={key === 'maxAmount' ? '∞' : ''} onChange={e => upd(i, key, e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-none font-bold text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-400" />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Label (opsional)</label>
            <input value={t.label} placeholder="contoh: Sultan Alert Sound" onChange={e => upd(i, 'label', e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-none font-bold text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-400" />
          </div>
          <SoundPicker value={t.soundUrl} onChange={v => upd(i, 'soundUrl', v)} />
        </div>
      ))}
      <button onClick={add} className="cursor-pointer active:scale-[0.97] w-full py-3 border-2 border-dashed border-blue-200 dark:border-blue-900 text-blue-500 dark:text-blue-400 rounded-none font-black text-sm hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all flex items-center justify-center gap-2">
        <Plus size={16} /> Tambah Suara per Nominal
      </button>
      <button onClick={() => saveSettingsMutation.mutate(settings)} disabled={saveSettingsMutation.isPending}
        className="cursor-pointer active:scale-[0.97] hover:brightness-90 w-full bg-slate-900 dark:bg-slate-700 text-white py-4 rounded-none font-black text-sm transition-all disabled:opacity-70 flex items-center justify-center gap-2">
        <Save size={20} />{saveSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Audio Terbaru'}
      </button>
    </div>
  );
};

// ─── DurationTiersEditor ──────────────────────────────────────────────────────

export const DurationTiersEditor = ({ tiers, onChange, saveSettingsMutation, settings }) => {
  const addTier    = () => onChange([...tiers, { minAmount: 0, maxAmount: null, duration: 10 }]);
  const removeTier = (i) => onChange(tiers.filter((_, idx) => idx !== i));
  const updateTier = (i, key, val) => onChange(tiers.map((t, idx) => idx === i ? { ...t, [key]: val === '' ? null : Number(val) } : t));
  return (
    <div className="space-y-3 mt-5">
      {tiers.map((tier, i) => (
        <div key={i} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-none p-4 border border-slate-100 dark:border-slate-700">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
            {[['Min (Rp)', 'minAmount', tier.minAmount], ['Max (Rp, kosong=∞)', 'maxAmount', tier.maxAmount ?? ''], ['Durasi (detik)', 'duration', tier.duration]].map(([lbl, key, val]) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{lbl}</label>
                <input type="number" value={val} placeholder={key === 'maxAmount' ? '∞' : ''} onChange={e => updateTier(i, key, e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-none font-bold text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-400" />
              </div>
            ))}
          </div>
          <button onClick={() => removeTier(i)} className="cursor-pointer active:scale-[0.97] text-red-400 hover:text-red-600 transition-colors flex-shrink-0 p-1"><Trash2 size={16} /></button>
        </div>
      ))}
      <button onClick={addTier} className="cursor-pointer active:scale-[0.97] w-full py-3 border-2 border-dashed border-blue-200 dark:border-blue-900 text-blue-500 dark:text-blue-400 rounded-none font-black text-sm hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all flex items-center justify-center gap-2">
        <Plus size={16} /> Tambah Ketentuan Durasi
      </button>
      <button onClick={() => saveSettingsMutation.mutate(settings)} disabled={saveSettingsMutation.isPending}
        className="cursor-pointer active:scale-[0.97] hover:brightness-90 w-full bg-slate-900 dark:bg-slate-700 text-white py-4 rounded-none font-black text-sm transition-all disabled:opacity-70 flex items-center justify-center gap-2">
        <Save size={20} />{saveSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Durasi Terbaru'}
      </button>
    </div>
  );
};

// ─── MediaTriggersEditor ──────────────────────────────────────────────────────

export const MediaTriggersEditor = ({ triggers, onChange, saveSettingsMutation, settings }) => {
  const add    = () => onChange([...triggers, { minAmount: 50000, mediaType: 'both', label: '' }]);
  const remove = (i) => onChange(triggers.filter((_, idx) => idx !== i));
  const update = (i, key, val) => onChange(triggers.map((t, idx) => idx === i ? { ...t, [key]: val } : t));
  const mediaTypeOptions = [
    { value: 'image', icon: <ImageIcon size={13} />, label: 'Gambar', desc: 'jpg, gif, png' },
    { value: 'video', icon: <Video size={13} />,     label: 'Video',  desc: 'mp4, webm' },
    { value: 'both',  icon: <span className="flex items-center gap-0.5"><ImageIcon size={11} /><Video size={11} /></span>, label: 'Keduanya', desc: 'gambar & video' },
  ];
  return (
    <div className="space-y-4">
      {triggers.length === 0 && (
        <div className="rounded-none bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 px-5 py-6 text-center">
          <div className="w-10 h-10 rounded-none bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3"><ImageIcon size={18} className="text-slate-400" /></div>
          <p className="text-sm font-black text-slate-500 dark:text-slate-400">Belum ada ketentuan media</p>
        </div>
      )}
      {triggers.map((t, i) => (
        <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-none p-5 border border-slate-100 dark:border-slate-700 space-y-5">
          <div className="flex items-center justify-between">
            <span className="font-black text-slate-700 dark:text-slate-200 text-sm">{t.label || `Media Alert ${i + 1}`}</span>
            <button onClick={() => remove(i)} className="cursor-pointer active:scale-[0.97] text-red-400 hover:text-red-600 transition-colors p-1"><Trash2 size={15} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[['Label (opsional)', 'label', t.label, 'text', 'contoh: Sultan Alert'], ['Nominal Min (Rp)', 'minAmount', t.minAmount, 'number', '']].map(([lbl, key, val, type, ph]) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{lbl}</label>
                <input type={type} value={val} placeholder={ph} onChange={e => update(i, key, type === 'number' ? Number(e.target.value) : e.target.value)}
                  className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-none font-bold text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-400 transition-all" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {mediaTypeOptions.map(opt => (
              <button key={opt.value} onClick={() => update(i, 'mediaType', opt.value)}
                className={`cursor-pointer active:scale-[0.97] flex flex-col items-center gap-1.5 py-3 px-2 rounded-none border-2 font-black text-xs transition-all ${t.mediaType === opt.value ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300' : 'border-slate-100 dark:border-slate-700 text-slate-400 hover:border-slate-300'}`}>
                {opt.icon}<span>{opt.label}</span>
                <span className="text-[9px] font-medium text-slate-300 dark:text-slate-500">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={add} className="cursor-pointer active:scale-[0.97] w-full py-3 border-2 border-dashed border-blue-200 dark:border-blue-900 text-blue-500 dark:text-blue-400 rounded-none font-black text-sm hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all flex items-center justify-center gap-2">
        <Plus size={16} /> Tambah Ketentuan Media Alert
      </button>
      <button onClick={() => saveSettingsMutation.mutate(settings)} disabled={saveSettingsMutation.isPending}
        className="cursor-pointer active:scale-[0.97] hover:brightness-90 w-full bg-slate-900 dark:bg-slate-700 text-white py-4 rounded-none font-black text-sm transition-all disabled:opacity-70 flex items-center justify-center gap-2">
        <Save size={20} />{saveSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Izin Media'}
      </button>
    </div>
  );
};

// ─── InstantTestAlert ─────────────────────────────────────────────────────────

export const InstantTestAlert = ({ overlayToken, settings, user }) => {
  const [isSending, setIsSending]       = useState(false);
  const [lastSent, setLastSent]         = useState(null);
  const [customAmount, setCustomAmount] = useState(50000);
  const [customName, setCustomName]     = useState('Mas Dev');
  const [customMsg, setCustomMsg]       = useState('Ini test donasi dari dashboard! 🎉');
  const [customVoiceUrl, setCustomVoiceUrl] = useState('');

  const sendTest = async () => {
    if (!overlayToken) return;
    setIsSending(true);
    try {
      await api.post('/api/test-alert/send', {
        targetUsername: user.username,
        donorName: customName,
        amount: Number(customAmount),
        message: customMsg,
        mediaUrl: null,
        mediaType: null,
        voiceUrl: customVoiceUrl.trim() || null,
      });
      setLastSent(new Date());
      toast.success('✅ Test alert terkirim ke OBS!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim test alert');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-none p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-5">
      <div className="flex items-center gap-4">
        <div className="bg-rose-500 p-3 rounded-none text-white shadow-lg"><Zap size={20} /></div>
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Instant Test Alert</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Nama Donor',  val: customName,     set: setCustomName,     ph: 'Mas Dev',            type: 'text' },
          { label: 'Nominal (Rp)', val: customAmount,  set: setCustomAmount,   ph: '50000',                type: 'number' },
          { label: 'Pesan',       val: customMsg,      set: setCustomMsg,      ph: 'Pesan test...',        type: 'text' },
        ].map(({ label, val, set, ph, type }) => (
          <div key={label} className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</label>
            <input type={type} value={val} onChange={e => set(e.target.value)} placeholder={ph}
              className="w-full p-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-none font-bold text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-rose-400 transition-all" />
          </div>
        ))}
      </div>

      {/* Voice URL */}
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Voice URL <span className="normal-case font-medium text-slate-300 dark:text-slate-600">(opsional)</span>
        </label>
        <input value={customVoiceUrl} onChange={e => setCustomVoiceUrl(e.target.value)} placeholder="https://... (URL audio hasil upload voice recorder)"
          className="w-full p-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-none font-mono text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-rose-400 transition-all placeholder:font-sans placeholder:text-slate-400" />
      </div>

      {/* Quick amounts */}
      <div className="flex flex-wrap gap-2">
        {[10000, 50000, 100000, 500000, 1000000].map(v => (
          <button key={v} onClick={() => setCustomAmount(v)}
            className={`cursor-pointer active:scale-[0.97] px-3 py-1.5 rounded-none text-xs font-black transition-all border-2 ${
              Number(customAmount) === v ? 'bg-rose-500 border-rose-500 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-rose-300'
            }`}>
            {v >= 1000000 ? `${v / 1000000}jt` : v >= 1000 ? `${v / 1000}K` : v}
          </button>
        ))}
      </div>

      <button onClick={sendTest} disabled={isSending || !overlayToken}
        className="cursor-pointer active:scale-[0.97] hover:brightness-90 w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-none font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-rose-200 dark:shadow-rose-900/30">
        {isSending ? <><RefreshCw size={18} className="animate-spin" /> Mengirim...</> : <><Zap size={18} /> Kirim Test ke OBS Sekarang</>}
      </button>

      <AnimatePresence>
        {lastSent && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 rounded-none px-4 py-3 border border-emerald-100 dark:border-emerald-900">
            <CheckCircle2 size={14} /> Test terakhir dikirim: {lastSent.toLocaleTimeString('id-ID')}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium text-center">
        ⚠️ Pastikan OBS overlay kamu sudah dibuka di browser source sebelum test
      </p>
    </div>
  );
};

// ─── AlertConfigSection ───────────────────────────────────────────────────────
// Berisi: icon, tema, warna, animasi, min/max donate, overlay toggle, timestamp

export const AlertConfigSection = ({ settings, upd, saveSettingsMutation, copyToClipboard, user }) => (
  <div className="bg-white dark:bg-slate-900 rounded-none p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800">
    <SectionHeader icon={<Settings size={20} />} title="Konfigurasi Alert" color="bg-blue-500" />
    <div className="mt-8 space-y-6">

      {/* Toggles */}
      {[
        { key: 'overlayEnabled', label: 'Aktifkan Overlay OBS',  desc: 'Alert tidak akan muncul di OBS sama sekali' },
        { key: 'showTimestamp',  label: 'Tampilkan Jam Donasi',  desc: 'Waktu kapan donasi diterima overlay' },
      ].map(({ key, label, desc }) => (
        <div key={key} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-none border border-slate-100 dark:border-slate-700">
          <div>
            <p className="font-black text-slate-700 dark:text-slate-200 text-sm">{label}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{desc}</p>
          </div>
          <button onClick={() => upd(key, !settings[key])}
            className={`relative inline-flex h-7 w-14 items-center rounded-none transition-colors duration-300 cursor-pointer ${settings[key] ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
            <span className={`inline-block h-5 w-5 transform rounded-none bg-white shadow-md transition-transform duration-300 ${settings[key] ? 'translate-x-8' : 'translate-x-1'}`} />
          </button>
        </div>
      ))}

      {/* Donate URL */}
      <div className="bg-slate-100 dark:bg-slate-800 p-5 rounded-none border border-slate-100/10">
        <label className="block text-[10px] font-black bg-emerald-300 w-max text-slate-700 mb-2 uppercase tracking-widest px-2 rounded">DONATE URL</label>
        <div className="flex gap-3">
          <input readOnly value={`https://taptiptup.vercel.app/donate/${user.username}`}
            className="flex-1 bg-transparent font-mono text-sm text-blue-600 dark:text-blue-400 font-bold outline-none overflow-hidden text-ellipsis" />
          <button onClick={() => copyToClipboard(`https://taptiptup.vercel.app/donate/${user.username}`)} className="text-slate-400 hover:text-blue-600 cursor-pointer active:scale-[0.98]"><Copy size={18} /></button>
        </div>
      </div>

      {/* Icon Alert */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Icon Alert</label>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {ICON_PRESETS.map(({ emoji, label }) => (
            <button key={emoji} onClick={() => upd('customIcon', emoji === '💜' ? '' : emoji)} title={label}
              className={`flex flex-col items-center gap-1 p-3 rounded-none border-2 text-lg transition-all cursor-pointer active:scale-[0.95] ${
                (settings.customIcon || '💜') === emoji || (!settings.customIcon && emoji === '💜')
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40'
                  : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 bg-slate-50 dark:bg-slate-800'
              }`}>
              <span>{emoji}</span>
              <span className="text-[8px] font-black text-slate-400 leading-none">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <InputField label="Minimal Donasi" type="number" value={settings.minDonate} onChange={v => upd('minDonate', v)} />
      <InputField label="Maksimal Donasi" type="number" value={settings.maxDonate} onChange={v => upd('maxDonate', v)} />

      {/* Tema Visual */}
      <div className="md:col-span-2">
        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-widest">Tema Visual</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {['modern', 'classic', 'minimal'].map(t => (
            <button key={t} onClick={() => upd('theme', t)}
              className={`cursor-pointer active:scale-[0.97] py-4 rounded-none border-2 transition-all font-black text-sm capitalize ${settings.theme === t ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-md' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'}`}>{t}</button>
          ))}
        </div>
      </div>

      {/* Animasi */}
      <div className="md:col-span-2 w-full flex flex-col gap-3">
        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Animasi Masuk</label>
        <select value={settings.animation} onChange={e => upd('animation', e.target.value)}
          className="w-full px-5 py-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-none font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 transition-all">
          <option value="bounce">Bounce</option>
          <option value="slide-left">Slide Kiri</option>
          <option value="slide-right">Slide Kanan</option>
          <option value="fade">Fade</option>
        </select>
      </div>

      {/* Max Width */}
      <div className="md:col-span-2">
        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">
          Lebar Maks Overlay OBS <span className="text-blue-500 normal-case font-bold ml-1">({settings.maxWidth || 280}px)</span>
        </label>
        <input type="range" min={180} max={600} step={10} value={settings.maxWidth || 280} onChange={e => upd('maxWidth', Number(e.target.value))} className="w-full accent-blue-600" />
        <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1 px-0.5"><span>180px</span><span>390px</span><span>600px</span></div>
      </div>
    </div>

    {/* Warna */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
      {[
        { key: 'primaryColor',   label: 'Background Alert',  fallback: '#6366f1' },
        { key: 'highlightColor', label: 'Highlight Nominal', fallback: '#a5b4fc' },
        { key: 'textColor',      label: 'Warna Teks',        fallback: '#ffffff' },
      ].map(({ key, label, fallback }) => (
        <ColorInput key={key} id={`color-${key}`} label={label} value={settings[key] || fallback} onChange={v => upd(key, v)} />
      ))}
      <ColorInput id="color-borderColor" label="Warna Border" value={settings.borderColor || '#ffffff26'} onChange={v => upd('borderColor', v)} allowAlpha={true} />
    </div>

    <button onClick={() => saveSettingsMutation.mutate(settings)} disabled={saveSettingsMutation.isPending}
      className="cursor-pointer active:scale-[0.97] hover:brightness-90 w-full bg-slate-900 dark:bg-slate-700 text-white py-4 rounded-none font-black text-sm transition-all disabled:opacity-70 flex items-center justify-center gap-2 mt-8">
      <Save size={20} />{saveSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Overlay Terbaru'}
    </button>
  </div>
);

// ─── AlertSoundSection ────────────────────────────────────────────────────────

export const AlertSoundSection = ({ settings, upd, saveSettingsMutation, formData, setFormData, setLocalSettings }) => {
  const [uploading, setUploading] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-none p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-8">
      <SectionHeader icon={<Music size={20} />} title="Pengaturan Suara Alert" color="bg-gradient-to-r from-emerald-500 to-blue-500" />

      <div className="space-y-6">
        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-none border border-slate-200 dark:border-slate-700">
          <h4 className="font-black text-sm text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">📢 Suara Default (Semua Donasi)</h4>
          <SoundPicker label="Pilih suara default" value={settings.soundUrl || ''} onChange={v => upd('soundUrl', v)} />
        </div>
        <SoundTiersEditor saveSettingsMutation={saveSettingsMutation} settings={settings} tiers={settings.soundTiers || []} onChange={v => upd('soundTiers', v)} />
      </div>

      <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 w-11 h-11 bg-emerald-500 rounded-none flex items-center justify-center text-white shadow-lg"><Music size={20} /></div>
          <div>
            <h4 className="text-xl font-black text-slate-800 dark:text-white">Quick Soundboard</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">Donatur bisa pilih suara ini saat donasi ke streamer</p>
          </div>
        </div>

        <AudioManager
          publicSounds={formData.publicSounds}
          onUpdatePublicSounds={(sounds) => {
            setFormData(prev => ({ ...prev, publicSounds: sounds }));
            upd('publicSounds', sounds);
          }}
        />

        <div className="w-full h-[1px] bg-slate-100/10 my-4" />

        <button onClick={() => saveSettingsMutation.mutate(settings)} disabled={saveSettingsMutation.isPending || uploading}
          className="cursor-pointer active:scale-[0.99] w-full py-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:brightness-90 text-white font-black rounded-none transition-all disabled:opacity-60 flex items-center justify-center gap-2">
          {saveSettingsMutation.isPending ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Menyimpan...</> : <><Save size={20} />Simpan Semua Suara</>}
        </button>
      </div>
    </div>
  );
};

// ─── AlertTTSSection ──────────────────────────────────────────────────────────

export const AlertTTSSection = ({ settings, upd }) => (
  <div className="bg-white dark:bg-slate-900 rounded-none p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800">
    <SectionHeader icon={<span className="text-xl">🔊</span>} title="Text-to-Speech Alert" color="bg-rose-500" />
    <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-none border border-slate-100 dark:border-slate-700 mt-4">
      <div>
        <p className="font-black text-slate-700 dark:text-slate-200">Aktifkan Text-to-Speech</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">Suara akan otomatis membaca: Nama + Nominal + Pesan</p>
      </div>
      <button onClick={() => upd('ttsEnabled', !settings.ttsEnabled)}
        className={`relative inline-flex h-7 w-14 items-center rounded-none transition-colors duration-300 cursor-pointer ${settings.ttsEnabled ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
        <span className={`inline-block h-5 w-5 transform rounded-none bg-white shadow-md transition-transform ${settings.ttsEnabled ? 'translate-x-8' : 'translate-x-1'}`} />
      </button>
    </div>
    {settings.ttsEnabled && (
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Kecepatan', key: 'ttsRate',   min: 0.5, max: 2,   step: 0.1, format: v => `${v.toFixed(1)}x` },
          { label: 'Nada Suara',key: 'ttsPitch',  min: 0.5, max: 2,   step: 0.1, format: v => v.toFixed(1) },
          { label: 'Volume',    key: 'ttsVolume', min: 0.1, max: 1,   step: 0.1, format: v => `${Math.round(v * 100)}%` },
        ].map(({ label, key, min, max, step, format }) => (
          <div key={key}>
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">{label}</label>
            <input type="range" min={min} max={max} step={step} value={settings[key] || 1} onChange={e => upd(key, parseFloat(e.target.value))} className="w-full accent-rose-500" />
            <div className="text-center text-xs text-slate-400 mt-1">{format(settings[key] || 1)}</div>
          </div>
        ))}
      </div>
    )}
  </div>
);