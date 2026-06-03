import { Copy, Save, Settings } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

export const ICON_PRESETS = [
  { emoji: '💜', label: 'Default' }, { emoji: '❤️',  label: 'Merah'  },
  { emoji: '🐧', label: 'Penguin' },
  { emoji: '🔥',  label: 'Api'    }, { emoji: '⭐',  label: 'Bintang'},
  { emoji: '🎮',  label: 'Gamer'  }, { emoji: '🎵',  label: 'Musik'  },
  { emoji: '🐉',  label: 'Naga'   }, { emoji: '💰',  label: 'Duit'   },
  { emoji: '🎯',  label: 'Target' }, { emoji: '👑',  label: 'Raja'   },
  { emoji: '🌟',  label: 'Gemilang'}, { emoji: '🚀', label: 'Roket'  },
  { emoji: '⚡',  label: 'Kilat'  },
  { emoji: '💎',  label: 'Permata'},
  { emoji: '🤖',  label: 'Robot'  },
];

export const renderIconPreview = (customIcon, size = 20) => {
  if (!customIcon) return '💜';
  if (customIcon.startsWith('http') || customIcon.startsWith('/')) {
    return <img src={customIcon} alt="icon" style={{ width: size, height: size, objectFit: 'contain', borderRadius: 4, display: 'inline-block' }} />;
  }
  return customIcon;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isValidHex = (v) =>
  /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v);

const normalizeToPickerHex = (v) => {
  if (!v) return '#000000';
  if (/^#[0-9a-fA-F]{3}$/.test(v))
    return '#' + [...v.slice(1)].map(c => c + c).join('');
  return v.slice(0, 7);
};

// ─── Sub Components ───────────────────────────────────────────────────────────

export const SectionHeader = ({ icon, title, color }) => (
  <div className="flex items-center gap-4">
    {icon && (
      <div className={`${color} p-3 rounded-none text-white shadow-lg`}>{icon}</div>
    )}
    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{title}</h3>
  </div>
);

export const InputField = ({ label, ...props }) => (
  <div className="w-full">
    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">{label}</label>
    <input
      className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-none p-3 focus:border-indigo-500 dark:focus:border-indigo-500 outline-none transition-all font-bold text-sm text-slate-900 dark:text-slate-100 shadow-sm"
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
    if (!isValidHex(raw)) {
      setRaw(value);
      onChange(value);
    }
  }, [raw, value, onChange]);

  const handlePickerChange = useCallback((e) => {
    const picked = e.target.value;
    if (allowAlpha) {
      const alpha = isValidHex(value) && value.length === 9 ? value.slice(7, 9) : '';
      const next = picked + alpha;
      setRaw(next);
      onChange(next);
    } else {
      setRaw(picked);
      onChange(picked);
    }
  }, [value, onChange, allowAlpha]);

  const pickerHex = useMemo(() =>
    normalizeToPickerHex(isValidHex(raw) ? raw : value),
    [raw, value]
  );

  const previewColor = useMemo(() =>
    isValidHex(raw) ? raw : value,
    [raw, value]
  );

  useEffect(() => { setRaw(value); }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 flex-shrink-0 rounded-none overflow-hidden border border-slate-300 dark:border-slate-600 relative group">
          <input
            id={`${inputId}-picker`}
            type="color"
            value={pickerHex}
            onChange={handlePickerChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer peer z-10"
            style={{ width: '100%', height: '100%', padding: 0, border: 0, backgroundColor: 'transparent' }}
          />
          <div
            className="absolute inset-0 w-full h-full border-2 border-transparent group-hover:border-indigo-400 transition-all"
            style={{ backgroundColor: pickerHex }}
          />
        </div>
        <input
          id={inputId}
          type="text"
          value={raw}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          spellCheck={false}
          placeholder={allowAlpha ? '#rrggbbaa' : '#rrggbb'}
          maxLength={allowAlpha ? 9 : 7}
          className="w-28 bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-none px-3 py-2 font-mono text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 transition-all"
        />
        <div
          className="flex-1 h-10 rounded-none border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-all"
          style={{ backgroundColor: previewColor }}
          title={previewColor}
        />
      </div>
      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate bg-slate-50/50 dark:bg-slate-800/50 px-2 py-1 rounded">
        {previewColor}
      </div>
    </div>
  );
});
ColorInput.displayName = 'ColorInput';

// ─── AlertConfig ──────────────────────────────────────────────────────────────

const AlertConfig = ({ settings, upd, saveSettingsMutation, user, copyToClipboard }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-none p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800">
      <SectionHeader icon={<Settings size={20} />} title="Konfigurasi Alert" color="bg-indigo-500" />
      <div className="mt-8 space-y-6">

        {/* Toggles */}
        {[
          { key: 'overlayEnabled', label: 'Aktifkan Overlay OBS', desc: 'Alert tidak akan muncul di OBS sama sekali' },
          { key: 'showTimestamp',  label: 'Tampilkan Jam Donasi', desc: 'Waktu kapan donasi diterima overlay' },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-none border border-slate-100 dark:border-slate-700">
            <div>
              <p className="font-black text-slate-700 dark:text-slate-200 text-sm">{label}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{desc}</p>
            </div>
            <button
              onClick={() => upd(key, !settings[key])}
              className={`relative inline-flex h-7 w-14 items-center rounded-none transition-colors duration-300 cursor-pointer focus:outline-none ${settings[key] ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-none bg-white shadow-md transition-transform duration-300 ${settings[key] ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}

        {/* Donate URL */}
        <div className="bg-slate-100 dark:bg-slate-800 p-5 rounded-none border border-slate-100/10 mb-2">
          <label className="block text-[10px] font-black bg-emerald-300 w-max text-slate-700 mb-2 uppercase tracking-widest px-2 rounded">DONATE URL</label>
          <div className="flex gap-3">
            <input readOnly value={`https://taptiptup.vercel.app/donate/${user.username}`}
              className="flex-1 bg-transparent font-mono text-sm text-indigo-600 dark:text-indigo-400 font-bold outline-none overflow-hidden text-ellipsis" />
            <button onClick={() => copyToClipboard(`https://taptiptup.vercel.app/donate/${user.username}`)}
              className="text-slate-400 hover:text-indigo-600 cursor-pointer active:scale-[0.98]">
              <Copy size={18} />
            </button>
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
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40'
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
                className={`cursor-pointer active:scale-[0.97] py-4 rounded-none border-2 transition-all font-black text-sm capitalize ${
                  settings.theme === t
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                }`}>{t}</button>
            ))}
          </div>
        </div>

        {/* Animasi */}
        <div className="md:col-span-2 w-full flex flex-col gap-3">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Animasi Masuk</label>
          <select value={settings.animation} onChange={e => upd('animation', e.target.value)}
            className="w-full px-5 py-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-none font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 transition-all">
            <option value="bounce">Bounce</option>
            <option value="slide-left">Slide Kiri</option>
            <option value="slide-right">Slide Kanan</option>
            <option value="fade">Fade</option>
          </select>
        </div>

        {/* Lebar */}
        <div className="md:col-span-2">
          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">
            Lebar Maks Overlay OBS <span className="text-indigo-500 normal-case font-bold ml-1">({settings.maxWidth || 280}px)</span>
          </label>
          <input type="range" min={180} max={600} step={10} value={settings.maxWidth || 280}
            onChange={e => upd('maxWidth', Number(e.target.value))} className="w-full accent-indigo-600" />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1 px-0.5">
            <span>180px</span><span>390px</span><span>600px</span>
          </div>
        </div>
      </div>

      {/* Warna */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
        {[
          { key: 'primaryColor',   label: 'Background Alert',  fallback: '#6366f1' },
          { key: 'highlightColor', label: 'Highlight Nominal', fallback: '#a5b4fc' },
          { key: 'textColor',      label: 'Warna Teks',        fallback: '#ffffff' },
        ].map(({ key, label, fallback }) => (
          <ColorInput
            key={key}
            id={`color-${key}`}
            label={label}
            value={settings[key] || fallback}
            onChange={v => upd(key, v)}
          />
        ))}
        <ColorInput
          id="color-borderColor"
          label="Warna Border"
          value={settings.borderColor || '#ffffff26'}
          onChange={v => upd('borderColor', v)}
          allowAlpha={true}
        />
      </div>

      <button
        onClick={() => saveSettingsMutation.mutate(settings)}
        disabled={saveSettingsMutation.isPending}
        className="cursor-pointer active:scale-[0.97] hover:brightness-90 w-full bg-slate-900 dark:bg-slate-700 text-white py-4 rounded-none font-black text-sm transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-70 flex items-center justify-center gap-2 mt-8"
      >
        <Save size={20} />
        {saveSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Konfigurasi Alert'}
      </button>
    </div>
  );
};

export default AlertConfig;