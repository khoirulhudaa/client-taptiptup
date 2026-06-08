import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, WifiOff, Loader2, X, CheckCircle2, 
  AlertCircle, Monitor, Plus, RefreshCw, Eye, EyeOff,
  Layers, Check, SkipForward
} from 'lucide-react';

// ─── Konstanta URL Overlay ────────────────────────────────────────────────────
const getOverlayList = (origin, token) => [
  // OBS Alert URLs
  { id: 'alert',      label: 'Alert Donasi',      emoji: '🔔', path: `/overlay/${token}`,              w: 1920, h: 1080, group: 'overlay' },
  { id: 'mediashare', label: 'Media Share',        emoji: '🎬', path: `/overlay/${token}/mediashare`,   w: 1920, h: 1080, group: 'overlay' },
  { id: 'voice',      label: 'Voice Note',         emoji: '🎙️', path: `/overlay/${token}/voice`,        w: 1920, h: 1080, group: 'overlay' },
  { id: 'combined',   label: 'Combined (All-in-1)',emoji: '⚡', path: `/overlay/${token}/combined`,     w: 1920, h: 1080, group: 'overlay' },
  // Widget URLs
  { id: 'milestones', label: 'Milestones',         emoji: '🎯', path: `/widget/${token}/milestones`,   w: 800,  h: 400,  group: 'widget' },
  { id: 'leaderboard',label: 'Leaderboard',        emoji: '🏆', path: `/widget/${token}/leaderboard`,  w: 400,  h: 800,  group: 'widget' },
  { id: 'qrcode',     label: 'QR Code',            emoji: '◼',  path: `/widget/${token}/qrcode`,       w: 300,  h: 300,  group: 'widget' },
  { id: 'poll',       label: 'Poll & Voting',      emoji: '🗳️', path: `/widget/${token}/poll`,         w: 500,  h: 400,  group: 'widget' },
  { id: 'marquee',    label: 'Marquee Donor',      emoji: '📜', path: `/widget/${token}/marquee?limit=10`, w: 1920, h: 120, group: 'widget' },
  { id: 'subathon',   label: 'Subathon Timer',     emoji: '⏱',  path: `/widget/${token}/subathon`,    w: 400,  h: 200,  group: 'widget' },
  { id: 'store',      label: 'Toko OBS',           emoji: '🛍️', path: `/widget/${token}/store`,        w: 800,  h: 600,  group: 'widget' },
].map(item => ({ ...item, url: `${origin}${item.path}` }));

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    idle:        { color: 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400', dot: 'bg-slate-400', label: 'Belum Konek' },
    connecting:  { color: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800', dot: 'bg-amber-400 animate-pulse', label: 'Menghubungkan...' },
    connected:   { color: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500 animate-pulse', label: 'Terhubung' },
    error:       { color: 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800', dot: 'bg-red-500', label: 'Gagal Konek' },
  };
  const s = map[status] || map.idle;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-[10px] font-black uppercase tracking-widest ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

// ─── Modal Add ke OBS ─────────────────────────────────────────────────────────
const OBSAddModal = ({ isOpen, onClose, obsStatus, sceneName, overlayToken, origin }) => {
  const allItems = getOverlayList(origin, overlayToken);
  const [selected, setSelected] = useState(() => new Set(allItems.map(i => i.id)));
  const [results, setResults]   = useState({}); // { id: 'success' | 'exists' | 'error' }
  const [adding, setAdding]     = useState(false);
  const [done, setDone]         = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const scrollRef = useRef(null);

  // Reset tiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      setSelected(new Set(allItems.map(i => i.id)));
      setResults({});
      setDone(false);
    }
  }, [isOpen]);

  const toggleAll = () => {
    if (selected.size === allItems.length) setSelected(new Set());
    else setSelected(new Set(allItems.map(i => i.id)));
  };

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAdd = async () => {
    if (!obsStatus?.ws) return;
    setAdding(true);
    setResults({});

    // Ambil existing sources dulu
    let existingNames = new Set();
    try {
      const res = await obsStatus.ws.call('GetInputList');
      existingNames = new Set(res.inputs.map(i => i.inputName));
    } catch {}

    const toAdd = allItems.filter(item => selected.has(item.id));
    const newResults = {};

    for (const item of toAdd) {
      if (existingNames.has(item.label)) {
        newResults[item.id] = 'exists';
        continue;
      }
      try {
        await obsStatus.ws.call('CreateInput', {
          sceneName,
          inputName: item.label,
          inputKind: 'browser_source',
          inputSettings: {
            url: item.url,
            width: item.w,
            height: item.h,
            fps: 30,
            shutdown: true,
            reroute_audio: false,
          },
          sceneItemEnabled: true,
        });
        newResults[item.id] = 'success';
      } catch (err) {
        console.error('CreateInput error:', item.label, err); // ← tambah sini
        newResults[item.id] = 'error';
      }
    }

    setResults(newResults);
    setAdding(false);
    setDone(true);
  };

  const resultIcon = (id) => {
    const r = results[id];
    if (!r) return null;
    if (r === 'success') return <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />;
    if (r === 'exists')  return <SkipForward  size={14} className="text-amber-400 flex-shrink-0" />;
    if (r === 'error')   return <AlertCircle  size={14} className="text-red-500 flex-shrink-0" />;
  };

  const groups = [
    { key: 'overlay', label: 'Overlay Alert' },
    { key: 'widget',  label: 'Widget OBS' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[99999] flex p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white dark:bg-slate-900 w-full max-w-md max-h-[82vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >

          {/* Checklist */}
          <div 
            ref={scrollRef}
            onScroll={e => {
              const el = e.currentTarget;
              setShowScrollHint(el.scrollTop < el.scrollHeight - el.clientHeight - 10);
            }}
            className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* Pilih semua */}
            {!done && (
              <button
                onClick={toggleAll}
                className="w-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-500 transition-colors"
              >
                <div className={`w-4 h-4 border-2 flex items-center justify-center transition-colors ${selected.size === allItems.length ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-600'}`}>
                  {selected.size === allItems.length && <Check size={10} className="text-white" />}
                </div>
                {selected.size === allItems.length ? 'Uncheck Semua' : 'Pilih Semua'}
              </button>
            )}

            {groups.map(group => (
              <div key={group.key}>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">{group.label}</p>
                <div className="space-y-1.5">
                  {allItems.filter(i => i.group === group.key).map(item => {
                    const isSelected = selected.has(item.id);
                    const result = results[item.id];
                    return (
                      <button
                        key={item.id}
                        onClick={() => !done && toggle(item.id)}
                        disabled={done}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 border transition-all text-left ${
                          result === 'success' ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30' :
                          result === 'exists'  ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20' :
                          result === 'error'   ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20' :
                          isSelected
                            ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30'
                            : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 opacity-50'
                        }`}
                      >
                        {!done ? (
                          <div className={`w-4 h-4 border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-600'
                          }`}>
                            {isSelected && <Check size={10} className="text-white" />}
                          </div>
                        ) : resultIcon(item.id)}
                        <span className="text-lg flex-shrink-0">{item.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-xs text-slate-700 dark:text-slate-200">{item.label}</p>
                          <p className="text-[9px] text-slate-400 font-mono truncate">{item.w}×{item.h}px</p>
                        </div>
                        {result === 'exists' && (
                          <span className="text-[9px] font-black text-amber-500 uppercase">Skip</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Legend hasil */}
            {done && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {[
                  { icon: <CheckCircle2 size={12} className="text-emerald-500" />, label: 'Berhasil ditambah', key: 'success' },
                  { icon: <SkipForward  size={12} className="text-amber-400" />,  label: 'Sudah ada, dilewati', key: 'exists' },
                  { icon: <AlertCircle  size={12} className="text-red-500" />,    label: 'Gagal', key: 'error' },
                ].map(l => (
                  <div key={l.key} className="flex items-center gap-1.5">
                    {l.icon}
                    <span className="text-[9px] text-slate-400 font-medium leading-tight">{l.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scroll Hint - Mouse Icon */}
          <AnimatePresence>
            {showScrollHint && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
              >
                {/* Mouse shape */}
                <motion.div
                  animate={{ y: [-3, 2, -3] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                  className="flex flex-col h-max pb-3 py-3 items-center gap-0.5"
                >
                  <p className='text-xs text-slate-400 mb-1'>Scroll ke bawah</p>
                  {/* Panah bawah */}
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-slate-500" />
                  </svg>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>


          {/* <div className="relative flex-shrink-0 pointer-events-none -mt-8 h-8 bg-gradient-to-t from-white dark:from-slate-900 to-transparent" /> */}

          {/* Footer */}
          <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex-shrink-0 space-y-2">
            {!done ? (
              <div className='w-full flex items-center gap-2'>
                <button
                  onClick={handleAdd}
                  disabled={adding || selected.size === 0}
                  className="cursor-pointer w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  {adding ? (
                    <><Loader2 size={15} className="animate-spin" /> Menambahkan...</>
                  ) : (
                    <>Buatkan {selected.size} browse OBS</>
                  )}
                </button>
                <button
                  onClick={onClose}
                  disabled={adding || selected.size === 0}
                  className="cursor-pointer hover:bg-slate-100/10 w-full py-3 border border-slate-100/10 disabled:opacity-50 text-white font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  {adding ? (
                    <><Loader2 size={15} className="animate-spin" /> Menambahkan...</>
                  ) : (
                    <>Batalkan</>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={onClose}
                className="cursor-pointer hover:brightness-85 w-full py-3 bg-slate-900 dark:bg-slate-700 text-white font-black text-sm transition-all active:scale-[0.99]"
              >
                Selesai
              </button>
            )}
            {/* {!done && (
              <p className="text-center !mt-3 text-[10px] text-slate-400 font-medium">
                Source ditambahkan ke scene <span className="font-black text-slate-600 dark:text-slate-300">"{sceneName}"</span>
              </p>
            )} */}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Komponen Utama ───────────────────────────────────────────────────────────
export const OBSConnectPanel = ({ overlayToken }) => {
  const origin = window.location.origin;

  const [password, setPassword]     = useState(() => localStorage.getItem('obs_ws_password') || '');
  const [port, setPort]             = useState(() => localStorage.getItem('obs_ws_port') || '4455');
  const [showPass, setShowPass]     = useState(false);
  const [status, setStatus]         = useState('idle'); // idle | connecting | connected | error
  const [errorMsg, setErrorMsg]     = useState('');
  const [sceneName, setSceneName]   = useState('');
  const [obsRef, setObsRef]         = useState(null); // instance OBSWebSocket
  const [showModal, setShowModal]   = useState(false);

  // Lazy load obs-websocket-js dari CDN karena tidak ada di node_modules
  const loadOBSWS = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.OBSWebSocket) return resolve(window.OBSWebSocket);
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/obs-websocket-js@5.0.0-beta.2/dist/obs-ws.min.js';
      script.onload = () => {
        console.log('window.OBSWebSocket:', window.OBSWebSocket); // ← tambah sini
        resolve(window.OBSWebSocket);
      };
      script.onerror = () => reject(new Error('Gagal load obs-websocket-js'));
      document.head.appendChild(script);
    });
  }, []);

  // const loadOBSWS = useCallback(() => {
  //   return new Promise((resolve, reject) => {
  //     if (window.OBSWebSocket) return resolve(window.OBSWebSocket);
  //     const script = document.createElement('script');
  //     // Pakai versi stable dengan UMD build
  //     script.src = 'https://cdn.jsdelivr.net/npm/obs-websocket-js@5.0.6/dist/obs-ws.min.js';
  //     script.onload = () => {
  //       // v5 stable ekspornya di window.OBSWebSocket.default
  //       const cls = window.OBSWebSocket?.default || window.OBSWebSocket;
  //       if (cls) resolve(cls);
  //       else reject(new Error('OBSWebSocket tidak ditemukan di window'));
  //     };
  //     script.onerror = () => reject(new Error('Gagal load obs-websocket-js'));
  //     document.head.appendChild(script);
  //   });
  // }, []);

  const handleConnect = async () => {
    setStatus('connecting');
    setErrorMsg('');
    try {
      const OBSWebSocket = await loadOBSWS();
      const obs = new OBSWebSocket();

      // OBS WebSocket v5 gunakan wss jika port 4455 + HTTPS — fallback ke ws
      // Karena dari HTTPS ke ws:// akan diblok, kita coba keduanya
      const wsUrl = `ws://localhost:${port}`;

      await obs.connect(wsUrl, password || undefined);

      const { currentProgramSceneName } = await obs.call('GetCurrentProgramScene');
      setSceneName(currentProgramSceneName);
      setObsRef({ ws: obs });
      setStatus('connected');

      localStorage.setItem('obs_ws_password', password);
      localStorage.setItem('obs_ws_port', port);

      // Handle disconnect dari sisi OBS
      obs.on('ConnectionClosed', () => {
        setStatus('idle');
        setObsRef(null);
        setSceneName('');
      });

    } catch (err) {
      setStatus('error');
      const msg = err?.message || '';
      if (msg.includes('Authentication'))   setErrorMsg('Password salah');
      else if (msg.includes('ECONNREFUSED') || msg.includes('connect')) setErrorMsg('OBS tidak ditemukan. Pastikan OBS terbuka & WebSocket aktif');
      else setErrorMsg(msg || 'Koneksi gagal');
    }
  };

  const handleDisconnect = () => {
    obsRef?.ws?.disconnect();
    setObsRef(null);
    setStatus('idle');
    setSceneName('');
  };

  return (
    <>
      {/* ── Panel Utama ── */}
      <div className="bg-slate-800/60 dark:bg-slate-900/80 border border-slate-700 dark:border-slate-700 rounded-none p-4 space-y-4 mb-5">

        {/* Header row */}
        <div className="flex items-center justify-between border-b border-slate-100/20 pb-4">
          <div className="flex items-center gap-2.5">
            {/* <div className="w-12 h-12 bg-slate-700 flex items-center justify-center flex-shrink-0">
              <Monitor size={18} className="text-slate-300" />
            </div> */}
            <div>
              <p className="font-black text-xs text-slate-200 uppercase tracking-wider">OBS Connect - opsional</p>
              <p className="text-[10px] text-slate-500 font-medium">Bikin browse secara cepat & otomatis</p>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Scene info jika sudah connect */}
        <AnimatePresence>
          {status === 'connected' && sceneName && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-950/40 border border-emerald-800/50"
            >
              <Wifi size={12} className="text-emerald-400 flex-shrink-0" />
              <p className="text-[11px] font-bold text-emerald-300">
                Scene aktif: <span className="font-black text-white">{sceneName}</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error msg */}
        <AnimatePresence>
          {status === 'error' && errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 px-3 py-2 bg-red-950/40 border border-red-800/50"
            >
              <AlertCircle size={12} className="text-red-400 flex-shrink-0" />
              <p className="text-[11px] font-bold text-red-300">{errorMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form - hanya tampil jika belum connect */}
        {status !== 'connected' && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-5 gap-2">
              {/* Port */}
              <div className="flex flex-col gap-1">
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Port</label>
                <input
                  type="text"
                  value={port}
                  onChange={e => setPort(e.target.value)}
                  placeholder="4455"
                  className="w-full px-2.5 py-3.5 bg-slate-700/50 border border-slate-600 text-slate-200 font-mono text-xs outline-none focus:border-blue-500 rounded-none"
                />
              </div>
              {/* Password */}
              <div className="col-span-4 flex flex-col gap-1">
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Password WebSocket</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleConnect()}
                    placeholder="OBS WebSocket password"
                    className="w-full pl-2.5 pr-8 py-3.5 bg-slate-700/50 border border-slate-600 text-slate-200 font-mono text-xs outline-none focus:border-blue-500 rounded-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPass ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleConnect}
              disabled={status === 'connecting'}
              className="cursor-pointer active:scale-[0.99] w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] rounded-none"
            >
              {status === 'connecting' ? (
                <><Loader2 size={13} className="animate-spin" /> Menghubungkan...</>
              ) : (
                <><Wifi size={13} /> Hubungkan ke OBS</>
              )}
            </button>
          </div>
        )}

        {/* Action jika sudah connect */}
        {status === 'connected' && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="cursor-pointer active:scale-[0.99] py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] rounded-none"
            >
              <Plus size={13} /> Tambah ke OBS
            </button>
            <button
              onClick={handleDisconnect}
              className="cursor-pointer active:scale-[0.99] py-3.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] rounded-none"
            >
              <WifiOff size={13} className='mr-[1px]' /> Disconnect
            </button>
          </div>
        )}

        {/* Guide toggle */}
        <details className="group">
          <summary className="cursor-pointer text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors list-none flex items-center gap-1.5">
            <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
            Cara aktifkan OBS WebSocket
          </summary>
          <div className="mt-2.5 space-y-1.5 pl-4 border-l border-slate-700">
            {[
              'Buka OBS Studio',
              'Klik menu Tools → WebSocket Server Settings',
              'Centang "Enable WebSocket Server"',
              'Klik "Show Connect Info" → copy password',
              'Paste password di kolom di atas → Hubungkan',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[9px] font-black text-blue-500 mt-0.5 flex-shrink-0">{i + 1}.</span>
                <p className="text-[10px] text-slate-400 font-medium">{step}</p>
              </div>
            ))}
          </div>
        </details>
      </div>

      {/* ── Modal ── */}
      <OBSAddModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        obsStatus={obsRef}
        sceneName={sceneName}
        overlayToken={overlayToken}
        origin={origin}
      />
    </>
  );
};

export default OBSConnectPanel;