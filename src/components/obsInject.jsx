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
    <span className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${s.color}`}>
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
          className="bg-white dark:bg-slate-900 w-full max-w-full h-max overflow-hidden rounded-xl flex flex-col border border-slate-200 dark:border-slate-700 shadow-2xl"
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
                className="
                w-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white hover:text-blue-500 transition-colors"
              >
                <div className={`w-4 h-4 border-2 flex items-center justify-center transition-colors ${selected.size === allItems.length ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-600'}`}>
                  {selected.size === allItems.length && <Check size={10} className="text-white" />}
                </div>
                {selected.size === allItems.length ? 'Uncheck Semua' : 'Pilih Semua'}
              </button>
            )}

            {groups.map(group => (
              <div key={group.key}>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400 mb-2">{group.label}</p>
                <div className="space-y-1.5 md:mt-3 md:space-y-0 md:grid-cols-3 grid gap-3.5">
                  {allItems.filter(i => i.group === group.key).map(item => {
                    const isSelected = selected.has(item.id);
                    const result = results[item.id];
                    return (
                      <button
                        key={item.id}
                        onClick={() => !done && toggle(item.id)}
                        disabled={done}
                        className={`
                          cursor-pointer
                          text-slate-900 dark:text-white 
                          -translate-y-[3px] translate-x-[-3px]
                          [box-shadow:4px_6px_0_#f1f5f9]
                          md:mt-0 mt-4
                          dark:[box-shadow:4px_4px_0_#99a3b1]
                          hover:translate-y-0 hover:translate-x-0
                          border border-slate-300
                          hover:[box-shadow:0_0_0_#f1f5f9]
                          dark:hover:[box-shadow:0_0_0_#94a3b8]
                          active:translate-y-[2px] active:translate-x-[2px]
                          active:[box-shadow:none]
                          active:bg-slate-300 dark:active:bg-slate-800
                          w-full rounded-xl flex items-center gap-3 px-3 py-2.5 border transition-all text-left ${
                          result === 'success' ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30' :
                          result === 'exists'  ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20' :
                          result === 'error'   ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20' :
                          isSelected
                            ? 'border-blue-300 dark:border-white bg-blue-50 dark:bg-blue-950/30'
                            : 'border-slate-100 dark:border-slate-300 bg-slate-50 dark:bg-slate-800/50 opacity-50'
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

          {/* Footer */}
          <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex-shrink-0 space-y-2">
            {!done ? (
              <div className='w-full flex items-center gap-3'>
                <button
                  onClick={handleAdd}
                  disabled={adding || selected.size === 0}
                  className="
                  text-slate-900 dark:text-white 
                  -translate-y-[3px] translate-x-[-3px]
                  [box-shadow:4px_6px_0_#f1f5f9]
                  mt-3
                  dark:[box-shadow:4px_4px_0_#99a3b1]
                  hover:translate-y-0 hover:translate-x-0
                  border border-slate-300
                  hover:[box-shadow:0_0_0_#f1f5f9]
                  dark:hover:[box-shadow:0_0_0_#94a3b8]
                  active:translate-y-[2px] active:translate-x-[2px]
                  active:[box-shadow:none]
                  rounded-xl cursor-pointer w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
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
                  className="
                  text-slate-900 dark:text-white 
                  -translate-y-[3px] translate-x-[-3px]
                  [box-shadow:4px_6px_0_#f1f5f9]
                  mt-3
                  dark:[box-shadow:4px_4px_0_#99a3b1]
                  hover:translate-y-0 hover:translate-x-0
                  border border-slate-300
                  hover:[box-shadow:0_0_0_#f1f5f9]
                  dark:hover:[box-shadow:0_0_0_#94a3b8]
                  active:translate-y-[2px] active:translate-x-[2px]
                  active:[box-shadow:none]
                  active:bg-slate-300 dark:active:bg-slate-800
                  rounded-xl cursor-pointer hover:bg-slate-100/10 w-full py-3 border border-slate-100/10 disabled:opacity-50 text-white font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
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
      <div className="bg-slate-800/60 dark:bg-slate-900/80 border border-slate-700 dark:border-slate-700 rounded-xl p-4 space-y-4">

        {/* Header row */}
        <div className="flex items-center justify-between border-b border-slate-100/20 pb-4">
          <div className="flex items-center gap-2.5">
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
              className="rounded-xl flex items-center gap-2 px-3 py-2 bg-emerald-950/40 border border-emerald-800/50"
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
            <div className="md:grid md:grid-cols-5 space-y-2.5 md:space-y-0 md:gap-2.5">
              {/* Port */}
              <div className="col-span-1 rounded-xl flex p-[3px] pl-[4px] items-center bg-slate-700/50 border border-slate-600 overflow-hidden focus-within:border-blue-500 transition-all">
                <div className="rounded-xl px-2.5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap border-r border-slate-600 bg-slate-700/80 flex-shrink-0">
                  Port
                </div>
                <input
                  type="text"
                  value={port}
                  onChange={e => setPort(e.target.value)}
                  placeholder="4455"
                  className="w-full flex-1 bg-transparent px-3 py-3.5 text-slate-200 font-mono text-xs outline-none min-w-0"
                />
              </div>

              {/* Password */}
              <div className="col-span-4 rounded-xl flex p-[3px] pl-[4px] items-center bg-slate-700/50 border border-slate-600 overflow-hidden focus-within:border-blue-500 transition-all">
                <div className="rounded-xl px-2.5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap border-r border-slate-600 bg-slate-700/80 flex-shrink-0">
                  Password
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleConnect()}
                  placeholder="OBS WebSocket password"
                  className="flex-1 bg-transparent px-3 py-3.5 text-slate-200 font-mono text-xs outline-none w-full min-w-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="pr-3 text-slate-500 hover:text-slate-300 flex-shrink-0"
                >
                  {showPass ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleConnect}
              disabled={status === 'connecting'}
              className="
                text-slate-900 dark:text-white 
                -translate-y-[3px] translate-x-[-3px]
                [box-shadow:4px_6px_0_#f1f5f9]
                mt-3
                dark:[box-shadow:4px_4px_0_#99a3b1]
                hover:translate-y-0 hover:translate-x-0
                border border-slate-300
                hover:[box-shadow:0_0_0_#f1f5f9]
                dark:hover:[box-shadow:0_0_0_#94a3b8]
                active:translate-y-[2px] active:translate-x-[2px]
                active:[box-shadow:none]
                active:bg-slate-300 dark:active:bg-slate-800
              cursor-pointer rounded-xl active:scale-[0.99] w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] rounded-xl"
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
              className="
                text-slate-900 dark:text-white 
                -translate-y-[3px] translate-x-[-3px]
                [box-shadow:4px_6px_0_#f1f5f9]
                mt-3
                dark:[box-shadow:4px_4px_0_#99a3b1]
                hover:translate-y-0 hover:translate-x-0
                border border-slate-300
                hover:[box-shadow:0_0_0_#f1f5f9]
                dark:hover:[box-shadow:0_0_0_#94a3b8]
                active:translate-y-[2px] active:translate-x-[2px]
                active:[box-shadow:none]
                active:bg-slate-300 dark:active:bg-slate-800
              cursor-pointer active:scale-[0.99] py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] rounded-xl"
            >
              <Plus size={13} /> Tambah ke OBS
            </button>
            <button
              onClick={handleDisconnect}
              className="
                text-slate-900 dark:text-white 
                -translate-y-[3px] translate-x-[-3px]
                [box-shadow:4px_6px_0_#f1f5f9]
                mt-3
                dark:[box-shadow:4px_4px_0_#99a3b1]
                hover:translate-y-0 hover:translate-x-0
                border border-slate-300
                hover:[box-shadow:0_0_0_#f1f5f9]
                dark:hover:[box-shadow:0_0_0_#94a3b8]
                active:translate-y-[2px] active:translate-x-[2px]
                active:[box-shadow:none]
                active:bg-slate-300 dark:active:bg-slate-800
              cursor-pointer active:scale-[0.99] py-3.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] rounded-xl"
            >
              <WifiOff size={13} className='mr-[1px]' /> Disconnect
            </button>
          </div>
        )}

        {/* Guide toggle */}
        <details className="group">
          <summary className="cursor-pointer text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors list-none flex items-center gap-1.5">
            <span className="group-open:rotate-90 transition-transform inline-block relative">
              <AlertCircle size={13} />
            </span>
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