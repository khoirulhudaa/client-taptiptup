// SaveButton.jsx
import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Save, Loader2, CheckCircle, ChevronDown,
  ArrowRight, Copy,
} from 'lucide-react';

const DROPDOWN_OPTIONS = [
  {
    icon: Save,
    label: 'Simpan saja',
    sub: 'Tetap di halaman ini',
  },
  {
    icon: ArrowRight,
    label: 'Simpan & lanjut',
    sub: 'Ke halaman berikutnya',
  },
  {
    icon: Copy,
    label: 'Simpan sebagai baru',
    sub: 'Duplikat preset ini',
  },
];

const SaveButton = ({
  onClick,
  isPending = false,
  sub = 'Semua perubahan tersimpan',
  dropdownOptions = DROPDOWN_OPTIONS,
  className = '',
}) => {
  const [state, setState] = useState('idle'); // idle | loading | done
  const [ddOpen, setDdOpen] = useState(false);
  const [subText, setSubText] = useState(sub);
  const ddRef = useRef(null);
  const timerRef = useRef(null);

  // Sync external isPending
  useEffect(() => {
    if (isPending) setState('loading');
  }, [isPending]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) setDdOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSave = async (optionFn) => {
    if (state !== 'idle') return;
    setDdOpen(false);
    setState('loading');

    try {
      await (optionFn ? optionFn() : onClick?.());
      setState('done');
      setSubText(
        'Baru saja · ' +
          new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      );
      timerRef.current = setTimeout(() => {
        setState('idle');
        setSubText(sub);
      }, 2200);
    } catch {
      setState('idle');
    }
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const mainBg =
    state === 'done'
      ? 'bg-emerald-900'
      : 'bg-slate-900 hover:bg-slate-800';

  const dropBg =
    state === 'done'
      ? 'bg-emerald-800'
      : 'bg-[#1e3a5f] hover:bg-blue-800';

  const icon =
    state === 'loading' ? (
      <Loader2 size={19} className="animate-spin flex-shrink-0" />
    ) : state === 'done' ? (
      <CheckCircle size={19} className="flex-shrink-0 text-emerald-300" />
    ) : (
      <Save size={19} className="flex-shrink-0" />
    );

  const label =
    state === 'loading'
      ? 'Menyimpan...'
      : state === 'done'
      ? 'Tersimpan!'
      : 'Simpan sekarang';

  return (
    <div className={`relative w-full ${className}`} ref={ddRef}>
      {/* ── Button ── */}
      <div className="flex h-[52px] w-full overflow-hidden rounded-2xl">

        {/* Main area */}
        <button
          onClick={() => handleSave()}
          disabled={state !== 'idle'}
          className={`
            flex flex-1 cursor-pointer items-center gap-3 px-5 text-white
            transition-colors duration-150 disabled:cursor-not-allowed
            active:brightness-90 ${mainBg}
          `}
        >
          {icon}
          <div className="flex flex-col items-start gap-[3px]">
            <span className="text-[14px] font-black leading-none">{label}</span>
            <span
              className={`text-[10px] font-medium leading-none tracking-wide transition-opacity ${
                state === 'loading' ? 'opacity-40' : 'opacity-60'
              }`}
            >
              {subText}
            </span>
          </div>
        </button>

        {/* Divider */}
        <div className="my-[10px] w-px bg-white/10 flex-shrink-0" />

        {/* Dropdown trigger */}
        <button
          onClick={() => state === 'idle' && setDdOpen((v) => !v)}
          disabled={state !== 'idle'}
          className={`
            flex w-[52px] flex-shrink-0 cursor-pointer items-center justify-center
            text-blue-300 transition-colors duration-150
            disabled:cursor-not-allowed active:brightness-90 ${dropBg}
          `}
          aria-label="Opsi simpan lainnya"
        >
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${ddOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* ── Dropdown panel ── */}
      <AnimatePresence>
        {ddOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-[calc(100%+6px)] z-50 w-56 overflow-hidden rounded-xl border border-slate-500/30 bg-slate-900 shadow-xl"
          >
            {dropdownOptions.map(({ icon: Icon, label, sub, onClick: optFn }, i) => (
              <button
                key={i}
                onClick={() => handleSave(optFn)}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-800 active:bg-slate-700"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-800">
                  <Icon size={14} className="text-slate-400" />
                </div>
                <div className="flex flex-col gap-[2px]">
                  <span className="text-[13px] font-black text-white leading-none">{label}</span>
                  <span className="text-[10px] font-medium text-slate-400 leading-none">{sub}</span>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SaveButton;