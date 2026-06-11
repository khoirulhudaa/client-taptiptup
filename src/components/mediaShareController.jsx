// components/MediaShareControl.jsx
import { useState, useRef } from 'react';
import { CheckCircle2, Copy, SkipForward, Volume2, VolumeX } from 'lucide-react';
import api from '../lib/axiosInstance';

const PRESETS = [
  { label: 'Mute', value: 0 },
  { label: '25%',  value: 25 },
  { label: '50%',  value: 50 },
  { label: '70%',  value: 70 },
  { label: '100%', value: 100 },
];

export const MediaShareControl = ({ overlayToken }) => {
  const [volume, setVolume]     = useState(70);
  const [status, setStatus]     = useState('');
  const [skipping, setSkipping] = useState(false);
  const volTimeout = useRef(null);

  const pushStatus = (msg) => {
    setStatus(msg);
    setTimeout(() => setStatus(''), 3000);
  };

  const BASE = window.location.origin;
  const shortcuts = [
    { label: 'Skip',     url: `${BASE}/api/mediashare/shortcut/${overlayToken}/skip`,             color: 'red' },
    { label: 'Mute',     url: `${BASE}/api/mediashare/shortcut/${overlayToken}/volume?volume=0`,  color: 'slate' },
    { label: 'Vol 50%',  url: `${BASE}/api/mediashare/shortcut/${overlayToken}/volume?volume=50`, color: 'blue' },
    { label: 'Vol 100%', url: `${BASE}/api/mediashare/shortcut/${overlayToken}/volume?volume=100`,color: 'blue' },
  ];

  const [copiedIdx, setCopiedIdx] = useState(null);
  const copyShortcut = (url, idx) => {
    navigator.clipboard.writeText(url);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const sendControl = async (action, vol) => {
    try {
      await api.post('/api/midtrans/mediashare/control', {
        action,
        volume: vol ?? volume,
      });
    } catch (err) {
      pushStatus('Gagal: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSkip = async () => {
    setSkipping(true);
    await sendControl('skip');
    pushStatus('Skip terkirim — alert ditutup di OBS');
    setTimeout(() => setSkipping(false), 800);
  };

  const handleVolumeChange = (v) => {
    const val = Number(v);
    setVolume(val);
    clearTimeout(volTimeout.current);
    volTimeout.current = setTimeout(() => {
      sendControl('volume', val);
      pushStatus(`Volume diset ke ${val}%`);
    }, 200); // debounce saat drag
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-none p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 w-10 h-10 bg-red-500 rounded-none flex items-center justify-center text-white">
          <SkipForward size={18} />
        </div>
        <div>
          <p className="font-black text-slate-800 dark:text-white text-sm md:capitalize uppercase md:text-xl">Medshare Control</p>
          <p className="text-[11px] text-slate-400 dark:text-white">Skip atau atur volume langsung dari dashboard</p>
        </div>
      </div>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        disabled={skipping}
        className="cursor-pointer w-full flex items-center justify-center gap-2 py-3 rounded-none border-2 border-red-400 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-black text-sm transition-all hover:bg-red-950/50 active:scale-[0.98] disabled:opacity-60"
      >
        <SkipForward size={18} />
        {skipping ? 'Mengirim skip...' : 'Skip MediaShare Sekarang'}
      </button>

      {/* Volume */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-none p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-slate-400 dark:text-white uppercase tracking-widest">
            Volume Overlay
          </span>
          <span className="font-black text-slate-700 dark:text-slate-200 text-sm">{volume}%</span>
        </div>

        <div className="flex items-center gap-3">
          <VolumeX size={16} className="text-slate-400 flex-shrink-0" />
          <input
            type="range" min={0} max={100} step={1}
            value={volume}
            onChange={e => handleVolumeChange(e.target.value)}
            className="flex-1 accent-blue-600"
          />
          <Volume2 size={16} className="text-slate-400 flex-shrink-0" />
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-none p-0 py-3 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-black text-slate-400 dark:text-white uppercase tracking-widest">
              Stream Deck / Shortcut URLs
            </span>
          </div>

          <div className="space-y-2">
            {shortcuts.map(({ label, url }, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5">
                <span className="text-[12px] relative top-[-1.8px] w-max font-black text-slate-500 w-16 flex-shrink-0 uppercase">{label}</span>
                <span className="flex-1 font-mono text-[14px] text-blue-500 dark:text-blue-400 truncate">{url}</span>
                <button
                  onClick={() => copyShortcut(url, idx)}
                  className="cursor-pointer flex-shrink-0 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
                >
                  {copiedIdx === idx
                    ? <CheckCircle2 size={14} className="text-green-500" />
                    : <Copy size={14} className="text-slate-400" />
                  }
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Preset buttons */}
        <div className="flex gap-2">
          {PRESETS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => handleVolumeChange(value)}
              className={`cursor-pointer flex-1 py-2 text-xs font-black rounded-none border transition-all active:scale-[0.97] ${
                volume === value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-white hover:border-slate-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};