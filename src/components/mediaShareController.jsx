// components/MediaShareControl.jsx
import { useState, useRef } from 'react';
import { Check, Copy, SkipForward, Volume2, VolumeX, Zap } from 'lucide-react';
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
  const [copiedIdx, setCopiedIdx] = useState(null);
  const volTimeout = useRef(null);

  const pushStatus = (msg) => {
    setStatus(msg);
    setTimeout(() => setStatus(''), 3000);
  };

  const BASE = window.location.origin;
  const shortcuts = [
    { label: 'skip',     icon: <SkipForward size={14} />, url: `${BASE}/api/mediashare/shortcut/${overlayToken}/skip` },
    { label: 'mute',     icon: <VolumeX size={14} />,     url: `${BASE}/api/mediashare/shortcut/${overlayToken}/volume?volume=0` },
    { label: 'vol 50%',  icon: <Volume2 size={14} />,     url: `${BASE}/api/mediashare/shortcut/${overlayToken}/volume?volume=50` },
    { label: 'vol 100%', icon: <Volume2 size={14} />,     url: `${BASE}/api/mediashare/shortcut/${overlayToken}/volume?volume=100` },
  ];

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
    }, 200);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white">
          <SkipForward size={18} />
        </div>
        <div>
          <p className="font-black text-slate-800 dark:text-white text-sm uppercase md:capitalize md:text-xl">
            Mediashare Control
          </p>
          <p className="text-[11px] text-slate-400">
            Skip atau atur volume langsung dari dashboard
          </p>
        </div>
      </div>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        disabled={skipping}
        className="cursor-pointer active:scale-[0.99] hover:brightness-90 w-full bg-slate-900/70 dark:bg-slate-700 text-white py-3 md:py-4 rounded-lg font-black text-sm transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-70 flex items-center justify-center gap-3"
      >
        {/* <SkipForward size={18} /> */}
        {skipping ? 'Mengirim skip...' : 'Skip MediaShare Sekarang'}
      </button>

      {/* Volume */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
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

        {/* Preset buttons */}
        <div className="flex gap-2">
          {PRESETS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => handleVolumeChange(value)}
              className={`cursor-pointer flex-1 py-2 text-xs font-black rounded-lg border transition-all active:scale-[0.99] ${
                volume === value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-300 hover:border-slate-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stream Deck Shortcuts */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 mb-2">
          <Zap size={11} className="text-slate-400" />
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Stream Deck Shortcuts
          </span>
        </div>

        <div className="space-y-1.5">
          {shortcuts.map(({ label, url, icon }, idx) => {
            const copied = copiedIdx === idx;
            return (
              <button
                key={idx}
                onClick={() => copyShortcut(url, idx)}
                className={`w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 border transition-all active:scale-[0.99] rounded-lg text-left ${
                  copied
                    ? 'border-green-400 bg-green-50 dark:bg-green-950/30'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {/* Icon */}
                <span className={`flex-shrink-0 w-7 h-7 rounded flex items-center justify-center ${
                  copied
                    ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {copied ? <Check size={13} /> : icon}
                </span>

                {/* Label */}
                <span className={`flex-shrink-0 text-sm font-bold w-max relative top-[-1.6px] ${
                  copied ? 'text-green-700 dark:text-green-400' : 'text-slate-700 dark:text-slate-200'
                }`}>
                  {label}
                </span>

                {/* URL preview */}
                <span className={`flex-1 font-mono text-sm truncate min-w-0 ${
                  copied ? 'text-green-600 dark:text-green-500' : 'text-slate-400 dark:text-blue-400'
                }`}>
                  {url}
                </span>

                {/* Copy icon */}
                <span className={`flex-shrink-0 transition-colors ${
                  copied ? 'text-green-500' : 'text-slate-300 dark:text-slate-500'
                }`}>
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status toast */}
      {status && (
        <div className="text-[11px] font-black text-center text-blue-600 dark:text-blue-400 py-1.5 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
          {status}
        </div>
      )}
    </div>
  );
};