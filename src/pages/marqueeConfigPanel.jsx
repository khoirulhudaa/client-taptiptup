import { useState, useEffect, useRef, useCallback } from 'react';
import { Copy, CheckCircle2, ExternalLink, Text, List, View, Monitor, Cog, Link, Link2 } from 'lucide-react';

const DEMO_TOP_DONORS = [
  { name: 'BudiDev',    totalAmount: 1500000, count: 12 },
  { name: 'RezaGun',    totalAmount: 750000,  count: 7  },
  { name: 'Anonim',     totalAmount: 250000,  count: 3  },
  { name: 'RizkyDev',   totalAmount: 100000,  count: 5  },
  { name: 'Sultan99',   totalAmount: 50000,   count: 1  },
  { name: 'KangJoko',   totalAmount: 30000,   count: 2  },
  { name: 'PakBambang', totalAmount: 20000,   count: 1  },
  { name: 'BuNeneng',   totalAmount: 15000,   count: 1  },
  { name: 'MasDimas',   totalAmount: 12000,   count: 1  },
  { name: 'DewiSari',   totalAmount: 10000,   count: 1  },
];

const DEMO_RECENT = [
  { name: 'DewiSari',   amount: 10000,  message: 'Semangat terus kak!' },
  { name: 'RizkyDev',   amount: 25000,  message: 'Gas poll 🔥'         },
  { name: 'Sultan99',   amount: 100000, message: 'mantap'              },
  { name: 'BudiDev',    amount: 50000,  message: ''                    },
  { name: 'KangJoko',   amount: 15000,  message: 'Lanjutkan!'          },
  { name: 'Anonim',     amount: 5000,   message: ''                    },
  { name: 'RezaGun',    amount: 75000,  message: 'Hore 🎉'             },
  { name: 'PakBambang', amount: 20000,  message: 'Terus berkarya'      },
  { name: 'MasDimas',   amount: 12000,  message: ''                    },
  { name: 'BuNeneng',   amount: 8000,   message: 'Support selalu 💜'   },
];

const MEDALS = ['🥇', '🥈', '🥉'];

const BG_PRESETS = [
  { label: 'Transparan', value: 'transparent' },
  { label: 'Hitam',      value: '#000000'     },
  { label: 'Dark Navy',  value: '#1a1a2e'     },
  { label: 'Slate',      value: '#0f172a'     },
  { label: 'Custom',     value: 'custom'      },
];

const MarqueeConfigPanel = ({ overlayToken }) => {
  const BASE = window.location.origin;

  const [cfg, setCfg] = useState({
    mode:      'top',     // 'top' | 'recent'
    limit:     10,
    speed:     40,
    color:     '#ffffff',
    highlight: '#4da6ff',
    fontSize:  16,
    bg:        'transparent',
    customBg:  '#1a1a2e',
  });
  const [copied,     setCopied]     = useState(false);
  const [showCustom, setShowCustom] = useState(false);

  const trackRef = useRef(null);
  const animRef  = useRef(null);
  const posRef   = useRef(0);
  const lastRef  = useRef(null);

  const upd = useCallback((key, val) => setCfg(prev => ({ ...prev, [key]: val })), []);

  const effectiveBg = cfg.bg === 'custom' ? cfg.customBg : cfg.bg;

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams({
      mode:      cfg.mode,
      speed:     cfg.speed,
      color:     cfg.color,
      highlight: cfg.highlight,
      fontSize:  cfg.fontSize,
    });
    if (effectiveBg !== 'transparent') params.set('bg', effectiveBg);
    return `${BASE}/widget/${overlayToken}/marquee?limit=${cfg.limit}&${params}`;
  }, [cfg, effectiveBg, BASE, overlayToken]);

  const copy = () => {
    navigator.clipboard.writeText(buildUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Preview animation ──────────────────────────────────────
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    posRef.current = 0;
    lastRef.current = null;
    if (animRef.current) cancelAnimationFrame(animRef.current);

    const animate = (ts) => {
      if (!lastRef.current) lastRef.current = ts;
      const dt = ts - lastRef.current;
      lastRef.current = ts;

      posRef.current -= (cfg.speed * dt) / 1000;

      const half = el.scrollWidth / 2;
      if (half > 0 && Math.abs(posRef.current) >= half) posRef.current = 0;

      el.style.transform = `translateY(-50%) translateX(${posRef.current}px)`;
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [cfg.mode, cfg.limit, cfg.speed, cfg.color, cfg.highlight, cfg.fontSize]);

  // ── Demo items berdasarkan mode ────────────────────────────
  const demoItems = cfg.mode === 'top'
    ? DEMO_TOP_DONORS.slice(0, cfg.limit).map((d, i) => (
        <span
          key={i}
          style={{
            display: 'inline-flex', alignItems: 'center',
            gap: 6, marginRight: 48, whiteSpace: 'nowrap',
            fontSize: cfg.fontSize, fontFamily: "'Courier New', monospace",
          }}
        >
          <span>{MEDALS[i] || `#${i + 1}`}</span>
          <span style={{ fontWeight: 900, color: cfg.color }}>{d.name}</span>
          <span style={{ color: cfg.highlight, fontWeight: 700 }}>
            Rp {Number(d.totalAmount).toLocaleString('id-ID')}
          </span>
          <span style={{ color: cfg.color, opacity: 0.4, fontSize: cfg.fontSize * 0.85 }}>
            ({d.count}x)
          </span>
          <span style={{ color: cfg.color, opacity: 0.2, marginLeft: 12 }}>•</span>
        </span>
      ))
    : DEMO_RECENT.slice(0, cfg.limit).map((d, i) => (
        <span
          key={i}
          style={{
            display: 'inline-flex', alignItems: 'center',
            gap: 6, marginRight: 48, whiteSpace: 'nowrap',
            fontSize: cfg.fontSize, fontFamily: "'Courier New', monospace",
          }}
        >
          <span style={{ color: cfg.highlight, opacity: 0.5 }}>#{i + 1}</span>
          <span style={{ fontWeight: 900, color: cfg.color }}>{d.name}</span>
          <span style={{ color: cfg.highlight, fontWeight: 700 }}>
            Rp {Number(d.amount).toLocaleString('id-ID')}
          </span>
          {d.message && (
            <span style={{ color: cfg.color, opacity: 0.6, fontSize: cfg.fontSize * 0.85 }}>
              — {d.message}
            </span>
          )}
          <span style={{ color: cfg.color, opacity: 0.2, marginLeft: 12 }}>•</span>
        </span>
      ));

  return (
    <div className="space-y-5 pb-6">

      {/* ── Mode: Top Donor vs Dukungan Terbaru ─────────────────── */}
      <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 space-y-5">
         <div className="flex items-center gap-4 pb-[2px]">
          <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg">
            <Monitor size={20} />
          </div>
          <div>
            <h3 className="text-sm uppercase md:capitalize md:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Mode Tampilan
            </h3>
          </div>
        </div>
        <div className="grid md:grid-cols-1 gap-3">
          {[
            { val: 'top',    label: '🏆 Top Donor',       desc: 'Berdasarkan total dukungan terbesar' },
            { val: 'recent', label: '⚡ Dukungan Terbaru',   desc: 'Dukungan yang baru masuk' },
          ].map(m => (
            <button
              key={m.val}
              onClick={() => upd('mode', m.val)}
              className={`
                text-slate-900 dark:text-white
                -translate-y-[3px] translate-x-[-3px]
                [box-shadow:4px_6px_0_#f1f5f9]
                dark:[box-shadow:4px_4px_0_#99a3b1]
                hover:translate-y-0 hover:translate-x-0
                border border-slate-300
                hover:[box-shadow:0_0_0_#f1f5f9]
                dark:hover:[box-shadow:0_0_0_#94a3b8]
                active:translate-y-[2px] active:translate-x-[2px]
                active:[box-shadow:none]
              active:bg-slate-300 dark:active:bg-slate-800
                cursor-pointer text-left p-4 rounded-xl border-2 transition-all active:scale-[0.99] space-y-1 ${
                cfg.mode === m.val
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 hover:border-blue-300'
              }`}
            >
              <p className="font-black text-sm relative left-[-3px]">{m.label}</p>
              <p className={`text-[10px] font-medium ${cfg.mode === m.val ? 'text-blue-200' : 'text-slate-400'}`}>
                {m.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Jumlah Item ───────────────────────────────────────── */}
      <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 space-y-5">
        <div className="flex items-center gap-4 pb-[2px]">
          <div className="bg-emerald-600 p-3 rounded-xl text-white shadow-lg">
            <List size={20} />
          </div>
          <div>
            <h3 className="text-sm uppercase md:capitalize md:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              {cfg.mode === 'top' ? 'Jumlah Top Donor' : 'Jumlah Dukungan Terbaru'}
            </h3>
          </div>
        </div>
        <div className="md:flex gap-3">
          {[5, 10, 20].map(n => (
            <button
              key={n}
              onClick={() => upd('limit', n)}
              className={`
                 text-slate-900 dark:text-white 
                 
                  -translate-y-[3px] translate-x-[-3px]
                  [box-shadow:4px_6px_0_#f1f5f9]
                  dark:[box-shadow:4px_4px_0_#99a3b1]
                  hover:translate-y-0 hover:translate-x-0
                  border border-slate-300
                  hover:[box-shadow:0_0_0_#f1f5f9]
                  dark:hover:[box-shadow:0_0_0_#94a3b8]
                  active:translate-y-[2px] active:translate-x-[2px]
                  active:[box-shadow:none]
                  active:bg-slate-300 dark:active:bg-slate-800
                w-full md:mb-0 mb-2.5 cursor-pointer text-left pl-3.5 flex-1 py-3.5 rounded-xl font-black text-sm border-2 transition-all active:scale-[0.97] ${
                cfg.limit === n
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-300'
              }`}
            >
              {cfg.mode === 'top' ? `Top ${n} donatur` : `${n} terakhir`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tampilan Teks ─────────────────────────────────────── */}
      <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 space-y-5">
        <div className="flex items-center gap-4 pb-[0px]">
          <div className="bg-rose-500 p-3 rounded-xl text-white shadow-lg">
            <Text size={20} />
          </div>
          <div>
            <h3 className="text-sm uppercase md:capitalize md:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Tampilan Teks</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase md:capitalize tracking-widest block mb-2">
              NAMA DONOR
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={cfg.color}
                onChange={e => upd('color', e.target.value)}
                className="w-12 h-11.5 cursor-pointer rounded-xl border border-slate-300 dark:border-slate-600"
              />
              <span className="font-mono text-sm text-slate-500">{cfg.color}</span>
              <div className="flex-1 h-11.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700" style={{ background: cfg.color }} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase md:capitalize tracking-widest block mb-2">
              NOMINAL
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={cfg.highlight}
                onChange={e => upd('highlight', e.target.value)}
                className="w-12 h-11.5 cursor-pointer rounded-xl border border-slate-300 dark:border-slate-600"
              />
              <span className="font-mono text-sm text-slate-500">{cfg.highlight}</span>
              <div className="flex-1 h-11.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700" style={{ background: cfg.highlight }} />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-black text-slate-400 uppercase md:capitalize tracking-widest">Ukuran Font</label>
            <span className="text-sm md:text-xl font-black text-slate-700 dark:text-slate-200">{cfg.fontSize}px</span>
          </div>
          <input
            type="range" min={12} max={28} step={1}
            value={cfg.fontSize}
            onChange={e => upd('fontSize', Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>12px</span><span>28px</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-black text-slate-400 uppercase md:capitalize tracking-widest">Kecepatan Scroll</label>
            <span className="text-sm md:text-xl font-black text-slate-700 dark:text-slate-200">{cfg.speed} px/s</span>
          </div>
          <input
            type="range" min={10} max={120} step={5}
            value={cfg.speed}
            onChange={e => upd('speed', Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Lambat</span><span>Cepat</span>
          </div>
        </div>
      </div>

      {/* ── Background OBS ────────────────────────────────────── */}
      <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 space-y-5">
        <div className="flex items-center gap-4 pb-[2px]">
          <div className="bg-pink-500 p-3 rounded-xl text-white shadow-lg">
            <Cog size={20} />
          </div>
          <div>
            <h3 className="text-sm uppercase md:capitalize md:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Background OBS
            </h3>
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {BG_PRESETS.map(preset => (
            <button
              key={preset.value}
              onClick={() => {
                if (preset.value === 'custom') {
                  setShowCustom(true);
                  upd('bg', 'custom');
                } else {
                  setShowCustom(false);
                  upd('bg', preset.value);
                }
              }}
              className={`
                 text-slate-900 dark:text-white 
                -translate-y-[3px] translate-x-[-3px]
                [box-shadow:4px_6px_0_#f1f5f9]
                dark:[box-shadow:4px_4px_0_#99a3b1]
                hover:translate-y-0 hover:translate-x-0
                border border-slate-300
                hover:[box-shadow:0_0_0_#f1f5f9]
                dark:hover:[box-shadow:0_0_0_#94a3b8]
                active:translate-y-[2px] active:translate-x-[2px]
                active:[box-shadow:none]
                active:bg-slate-300 dark:active:bg-slate-800
                cursor-pointer px-4 py-3 min-h-11.5 rounded-xl font-black text-xs border-2 transition-all active:scale-[0.97] ${
                cfg.bg === preset.value
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-300'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {showCustom && (
          <div className="flex items-center gap-3 mt-2">
            <input
              type="color"
              value={cfg.customBg}
              onChange={e => { upd('customBg', e.target.value); upd('bg', 'custom'); }}
              className="w-10 h-11.5 py-3 cursor-pointer rounded-xl border border-slate-300 dark:border-slate-600 p-0.5"
            />
            <span className="font-mono text-sm text-slate-500">{cfg.customBg}</span>
          </div>
        )}

        {/* Live Preview Bar */}
        <div
          className="relative overflow-hidden rounded-xl border border-slate-700"
          style={{ height: 56, background: effectiveBg === 'transparent' ? '#111827' : effectiveBg }}
        >
          {effectiveBg === 'transparent' && (
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, #888 0, #888 1px, transparent 0, transparent 50%)',
                backgroundSize: '8px 8px',
              }}
            />
          )}
          <div
            ref={trackRef}
            style={{
              display: 'inline-flex', position: 'absolute',
              top: '50%', transform: 'translateY(-50%)',
              willChange: 'transform',
            }}
          >
            {demoItems}
            {demoItems}
          </div>
        </div>
        <p className="text-[10px] text-slate-400 font-medium">
          💡 Preview pratinjau — ukuran OBS yang disarankan:{' '}
          <span className="font-black text-slate-600 dark:text-slate-300">1920×60px</span>
        </p>
      </div>

      {/* ── URL OBS ───────────────────────────────────────────── */}
      <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 space-y-5">
        <div className="flex items-center gap-4 pb-[2px]">
          <div className="bg-blue-500 p-3 rounded-xl text-white shadow-lg">
            <Link2 size={20} />
          </div>
          <div>
            <h3 className="text-sm uppercase md:capitalize md:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              URL Browser OBS
            </h3>
          </div>
        </div>

        <div className="bg-slate-100 truncate max-w-[100%] dark:bg-slate-800 rounded-xl px-4 py-3 min-h-11.5 font-mono text-xs text-blue-600 dark:text-blue-400 break-all border border-slate-200 dark:border-slate-700 select-all">
          {buildUrl()}
        </div>

        <div className="gap-3 grid grid-cols-2">
          <button
            onClick={copy}
            className={`
              text-slate-900 dark:text-white bg-slate-100 dark:bg-white/20
              -translate-y-[3px] translate-x-[-3px]
              [box-shadow:4px_6px_0_#f1f5f9]
              dark:[box-shadow:4px_4px_0_#99a3b1]
              hover:translate-y-0 hover:translate-x-0
              hover:bg-slate-200 dark:hover:bg-slate-700
              border border-slate-300
              hover:[box-shadow:0_0_0_#f1f5f9]
              dark:hover:[box-shadow:0_0_0_#94a3b8]
              active:translate-y-[2px] active:translate-x-[2px]
              active:[box-shadow:none]
              active:bg-slate-300 dark:active:bg-slate-800
              w-full cursor-pointer active:scale-[0.97] flex items-center gap-3 px-4 py-3 min-h-11.5 rounded-xl font-black text-sm transition-all border-2 ${
              copied
                ? 'bg-green-600 border-green-600 text-white'
                : 'bg-slate-900/70 dark:bg-slate-700 border-transparent text-white hover:brightness-90'
            }`}
          >
            {copied ? <><CheckCircle2 size={16} /> Tersalin!</> : <><Copy size={16} /> Salin URL</>}
          </button>
          <a
            href={buildUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="
            text-slate-900 dark:text-white bg-slate-100 dark:bg-white/20
            -translate-y-[3px] translate-x-[-3px]
            [box-shadow:4px_6px_0_#f1f5f9]
            dark:[box-shadow:4px_4px_0_#99a3b1]
            hover:translate-y-0 hover:translate-x-0
            hover:bg-slate-200 dark:hover:bg-slate-700
            border border-slate-300
            hover:[box-shadow:0_0_0_#f1f5f9]
            dark:hover:[box-shadow:0_0_0_#94a3b8]
            active:translate-y-[2px] active:translate-x-[2px]
            active:[box-shadow:none]
            active:bg-slate-300 dark:active:bg-slate-800
            w-full cursor-pointer active:scale-[0.97] flex items-center gap-3 px-4 py-3 min-h-11.5 rounded-xl font-black text-sm border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-300 transition-all"
          >
            <ExternalLink size={16} /> Buka Preview
          </a>
        </div>
      </div>

    </div>
  );
};

export default MarqueeConfigPanel;