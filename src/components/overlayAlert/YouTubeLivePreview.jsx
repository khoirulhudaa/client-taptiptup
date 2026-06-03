import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { renderIconPreview } from './AlertConfig';

// ─── Helper ───────────────────────────────────────────────────────────────────

export const getDuration = (settings, amount) => {
  const tiers = settings.durationTiers || [];
  if (tiers.length > 0) {
    const sorted = [...tiers].sort((a, b) => b.minAmount - a.minAmount);
    for (const t of sorted) {
      if (amount >= t.minAmount && (t.maxAmount === null || amount <= t.maxAmount)) return t.duration;
    }
  }
  const extras = Math.floor(amount / (settings.extraPerAmount || 10000));
  return (settings.baseDuration || 5) + extras * (settings.extraDuration || 1);
};

// ─── Animation variants ───────────────────────────────────────────────────────

const animVariants = {
  bounce:        { initial: { scale: 0.5, opacity: 0 }, animate: { scale: [0.5, 1.08, 1], opacity: 1, transition: { duration: 0.5 } }, exit: { scale: 0.8, opacity: 0, transition: { duration: 0.3 } } },
  'slide-left':  { initial: { x: -80, opacity: 0 }, animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } }, exit: { x: -60, opacity: 0, transition: { duration: 0.3 } } },
  'slide-right': { initial: { x: 80,  opacity: 0 }, animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } }, exit: { x:  60, opacity: 0, transition: { duration: 0.3 } } },
  fade:          { initial: { opacity: 0, y: -12 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } }, exit: { opacity: 0, y: -8, transition: { duration: 0.3 } } },
};

const posMap = {
  'top-left':      { top: '14%', left: '2%' },
  'top-right':     { top: '14%', right: '2%' },
  'bottom-left':   { bottom: '18%', left: '2%' },
  'bottom-right':  { bottom: '18%', right: '2%' },
  'top-center':    { top: '14%', left: '50%', transform: 'translateX(-50%)' },
  'bottom-center': { bottom: '18%', left: '50%', transform: 'translateX(-50%)' },
};

// ─── Alert Renderers ──────────────────────────────────────────────────────────

const renderAlert = (settings, currentDonor) => {
  if (!currentDonor) return null;

  const bg    = settings.primaryColor || '#6366f1';
  const fg    = settings.textColor || '#ffffff';
  const hl    = settings.highlightColor || '#a5b4fc';
  const maxW  = settings.maxWidth || 280;
  const theme = settings.theme || 'modern';

  const ts = settings.showTimestamp !== false
    ? <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
        🕐 {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
      </div>
    : <div />;

  const modernInner = (
    <>
      <div style={{ height: 4, background: hl }} />
      <div style={{ padding: '14px 16px 0px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ width: 42, height: 42, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, marginTop: 7 }}>
          {renderIconPreview(settings.customIcon, 22)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.25)', padding: '2px 8px', fontSize: 26, fontWeight: 900, color: hl, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>
            <span style={{ width: 4, height: 4, background: '#22c55e', borderRadius: '50%', display: 'inline-block' }} />
            Donasi Masuk
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: fg, lineHeight: 1.2, marginBottom: 2 }}>@{currentDonor.name}</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: hl, letterSpacing: '-0.5px', lineHeight: 1, marginBottom: 5 }}>
            Rp {currentDonor.amount.toLocaleString('id-ID')}
          </div>
          {currentDonor.msg && <div style={{ fontSize: 26, color: fg, opacity: 0.8, lineHeight: 1.4 }}>"{currentDonor.msg}"</div>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 10px', background: 'rgba(0,0,0,0.2)', marginTop: 10 }}>
        {ts}
        <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.15)', marginLeft: 12 }}>
          <div style={{ height: '100%', width: '60%', background: hl }} />
        </div>
      </div>
    </>
  );

  const classicInner = (
    <>
      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 9, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <span style={{ fontSize: 26, position: 'relative', top: -3 }}>{renderIconPreview(settings.customIcon, 18)}</span>
        <span style={{ fontSize: 26, fontWeight: 900, color: fg, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Dukungan Masuk!</span>
      </div>
      <div style={{ padding: '12px 14px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: fg }}>@{currentDonor.name}</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: hl, letterSpacing: '-0.5px' }}>Rp {currentDonor.amount.toLocaleString('id-ID')}</div>
        </div>
        {currentDonor.msg && <div style={{ fontSize: 26, color: fg, lineHeight: 1.4, padding: '6px 10px', background: 'rgba(0,0,0,0.2)', borderLeft: `2px solid ${hl}` }}>{currentDonor.msg}</div>}
        {ts}
        <div style={{ height: 2, background: 'rgba(255,255,255,0.1)', marginTop: 10 }}>
          <div style={{ height: '100%', width: '45%', background: hl }} />
        </div>
      </div>
    </>
  );

  const minimalInner = (
    <>
      <div style={{ padding: '14px 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: hl, letterSpacing: '-1px', lineHeight: 1 }}>Rp {currentDonor.amount.toLocaleString('id-ID')}</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Donasi</div>
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: fg, marginBottom: 3 }}>@{currentDonor.name}</div>
        {currentDonor.msg && <div style={{ fontSize: 26, color: fg, lineHeight: 1.35 }}>"{currentDonor.msg}"</div>}
        {ts}
        <div style={{ height: 2, background: 'rgba(255,255,255,0.08)', marginTop: 10 }}>
          <div style={{ height: '100%', width: '75%', background: hl }} />
        </div>
      </div>
    </>
  );

  const innerMap = { modern: modernInner, classic: classicInner, minimal: minimalInner };

  return (
    <div style={{
      backgroundColor: bg,
      color: fg,
      maxWidth: `${maxW}px`,
      width: '100%',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
      border: `1px solid ${settings.borderColor || 'rgba(255,255,255,0.15)'}`,
    }}>
      {innerMap[theme] ?? modernInner}
    </div>
  );
};

// ─── YouTubeLivePreview ───────────────────────────────────────────────────────

const DONORS = [
  { name: 'Budi Santoso', amount: 50000,  msg: 'Semangat terus ngodingnya bang!' },
  { name: 'Siti Rahayu',  amount: 150000, msg: 'Mantap kontennya, keep it up!'   },
  { name: 'Anonim',       amount: 10000,  msg: 'Good luck!'                       },
  { name: 'RizkyDev',     amount: 200000, msg: 'Dukung terus creator lokal!'      },
];

const YouTubeLivePreview = ({ settings, username, testFullScreen }) => {
  const [showAlert, setShowAlert] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [currentDonor, setCurrentDonor] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timerRef = useRef(null);
  const donorIdxRef = useRef(0);

  const triggerDemo = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const d = DONORS[donorIdxRef.current % DONORS.length];
    donorIdxRef.current++;
    setCurrentDonor(d);
    setShowAlert(false);
    setTimeout(() => { setAnimKey(k => k + 1); setShowAlert(true); }, 50);
    const dur = getDuration(settings, d.amount);
    timerRef.current = setTimeout(() => setShowAlert(false), dur * 1000 + 500);
  };

  useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), []);

  const anim = animVariants[settings.animation] || animVariants.bounce;
  const pos  = posMap[settings.overlayPosition || 'bottom-right'];
  const dur  = currentDonor ? getDuration(settings, currentDonor.amount) : 5;

  const handleFullScreen = () => {
    testFullScreen();
    setIsFullscreen(!isFullscreen);
  };

  const FullscreenPreview = () => (
    <AnimatePresence>
      {isFullscreen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed w-[100%] right-0 inset-0 z-[999999999] bg-black flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-sm border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-none animate-pulse" />
              <span className="text-white font-black text-sm tracking-wide">LIVE PREVIEW</span>
              <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded-none tracking-widest">OBS SIMULATION</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={triggerDemo}
                className="cursor-pointer active:scale-[0.97] flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-none font-black text-xs transition-all">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-none animate-pulse" /> Simulasi Donasi
              </button>
              <button onClick={() => handleFullScreen()}
                className="cursor-pointer active:scale-[0.97] flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-none font-black text-xs transition-all border border-white/10">
                ✕ Tutup
              </button>
            </div>
          </div>
          <div className="flex-1 relative overflow-hidden" style={{ background: 'linear-gradient(155deg,#1a1a2e 0%,#0d0d1a 60%,#12121f 100%)' }}>
            <span className="absolute inset-0 flex items-center justify-center text-[clamp(60px,15vw,180px)] font-black text-white/[0.02] pointer-events-none select-none" style={{ letterSpacing: -8 }}>LIVE</span>
            <div className="absolute inset-0 pointer-events-none">
              <AnimatePresence>
                {showAlert && (
                  <motion.div key={animKey}
                    initial={animVariants[settings.animation]?.initial || animVariants.bounce.initial}
                    animate={animVariants[settings.animation]?.animate || animVariants.bounce.animate}
                    exit={animVariants[settings.animation]?.exit || animVariants.bounce.exit}
                    style={{ position: 'absolute', ...posMap[settings.overlayPosition || 'bottom-right'], zIndex: 10 }}>
                    {renderAlert(settings, currentDonor)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="sticky top-12 space-y-3">
      <FullscreenPreview />

      {/* Preview frame */}
      <div className="relative overflow-hidden border-[10px] border-slate-800 rounded-none shadow-2xl" style={{ aspectRatio: '16/9', background: '#000' }}>
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(155deg,#1a1a2e 0%,#0d0d1a 60%,#12121f 100%)' }}>
          <span style={{ fontSize: 80, fontWeight: 800, color: 'rgba(255,255,255,0.04)', letterSpacing: -3, userSelect: 'none' }}>LIVE</span>
        </div>
        <div className="absolute top-0 left-0 right-0 flex items-center gap-2 px-3 py-2"
          style={{ background: 'linear-gradient(to bottom,rgba(0,0,0,.65) 0%,transparent 100%)' }}>
          <div className="w-5 h-5 rounded-none bg-red-600 flex items-center justify-center text-white text-[8px] font-black flex-shrink-0">YT</div>
          <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-none tracking-wide">LIVE</span>
          <span className="text-white text-[9px] font-medium opacity-80 flex-1 truncate">Ngoding Bareng | Demo</span>
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence>
            {showAlert && (
              <motion.div key={animKey} initial={anim.initial} animate={anim.animate} exit={anim.exit}
                style={{ position: 'absolute', ...pos, zIndex: 10 }}>
                {renderAlert(settings, currentDonor)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="absolute top-2 right-3">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-none animate-pulse block" />
        </div>
      </div>

      {/* Info bar */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold px-1 flex-wrap gap-1">
        <span>Lebar: <span className="text-indigo-600">{settings.maxWidth || 280}px</span></span>
        <span>Tema: <span className="text-indigo-600">{settings.theme || 'modern'}</span></span>
        <span>Durasi demo: <span className="text-indigo-600">{currentDonor ? dur : '-'}s</span></span>
      </div>

      {/* Buttons */}
      <button onClick={triggerDemo}
        className="cursor-pointer active:scale-[0.97] hover:brightness-90 w-full py-3 rounded-none bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-black text-sm border-2 border-indigo-100 dark:border-indigo-900 transition-all flex items-center justify-center gap-2">
        <span className="w-2 h-2 bg-red-500 rounded-none animate-pulse" /> Simulasi Donasi Masuk
      </button>
      <button onClick={() => handleFullScreen()}
        className="cursor-pointer active:scale-[0.97] hover:brightness-90 w-full py-3.5 rounded-none bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-black text-sm transition-all flex items-center justify-center gap-2 border border-slate-700">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
        </svg>
        Full Screen Preview
      </button>
    </div>
  );
};

export default YouTubeLivePreview;