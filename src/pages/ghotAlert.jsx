// import axios from 'axios';
// import { AnimatePresence, motion } from 'framer-motion';
// import {
//   AlertCircle,
//   CheckCircle2,
//   ChevronDown,
//   HeadphonesIcon,
//   Loader2,
//   Radio,
//   Send,
//   ShieldAlert,
//   User2,
//   Video,
//   Zap,
// } from 'lucide-react';
// import { useEffect, useRef, useState } from 'react';

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const getTokenPayload = () => {
//   const token = localStorage.getItem('token');
//   if (!token) return null;
//   try { return JSON.parse(atob(token.split('.')[1])); }
//   catch { return null; }
// };

// const formatRp = (n) => {
//   if (!n) return '–';
//   return `Rp ${Number(n).toLocaleString('id-ID')}`;
// };

// const PRESET_AMOUNTS = [
//   { label: '10K',  value: 10000   },
//   { label: '50K',  value: 50000   },
//   { label: '100K', value: 100000  },
//   { label: '500K', value: 500000  },
//   { label: '1jt',  value: 1000000 },
// ];

// const PRESET_MESSAGES = [
//   'Mantap banget streamernya! 🔥',
//   'GG bro, keep it up!',
//   'Semangat terus, ditunggu konten selanjutnya!',
//   'Test donasi dari admin 👑',
// ];

// const MEDIA_TYPES = [
//   { value: 'image',   label: 'Gambar / GIF' },
//   { value: 'video',   label: 'Video Langsung' },
//   { value: 'youtube', label: 'YouTube' },
// ];

// // ─── Toast ────────────────────────────────────────────────────────────────────
// const Toast = ({ message, type }) => (
//   <motion.div
//     initial={{ opacity: 0, y: 16, scale: 0.96 }}
//     animate={{ opacity: 1, y: 0, scale: 1 }}
//     exit={{ opacity: 0, y: 8, scale: 0.96 }}
//     transition={{ duration: 0.25 }}
//     className={`flex items-center gap-3 px-5 py-4 rounded-none shadow-2xl font-bold text-sm ${
//       type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
//     }`}
//   >
//     {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
//     {message}
//   </motion.div>
// );

// // ─── Streamer Select Dropdown ─────────────────────────────────────────────────
// const StreamerSelect = ({ streamers, value, onChange, loading }) => {
//   const [open, setOpen] = useState(false);
//   const ref = useRef(null);

//   useEffect(() => {
//     const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, []);

//   const selected = streamers.find((s) => s._id === value);

//   return (
//     <div ref={ref} className="relative">
//       <button
//         type="button"
//         onClick={() => setOpen((p) => !p)}
//         className="cursor-pointer w-full flex items-center justify-between gap-3 px-4 py-4 rounded-none bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none transition-all font-bold text-sm text-slate-700 dark:text-slate-200"
//       >
//         <div className="flex items-center gap-3 min-w-0">
//           {selected ? (
//             <>
//               <div className="w-8 h-8 rounded-none bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
//                 {selected.username?.charAt(0).toUpperCase()}
//               </div>
//               <span className="truncate">@{selected.username}</span>
//             </>
//           ) : (
//             <>
//               <User2 size={16} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
//               <span className="text-slate-400 dark:text-slate-500 font-medium">
//                 {loading ? 'Memuat streamer...' : 'Pilih streamer target...'}
//               </span>
//             </>
//           )}
//         </div>
//         <ChevronDown size={16} className={`text-slate-400 dark:text-slate-500 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
//       </button>

//       <AnimatePresence>
//         {open && (
//           <motion.div
//             initial={{ opacity: 0, y: -8 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -8 }}
//             transition={{ duration: 0.18 }}
//             className="absolute z-50 top-full mt-2 left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
//           >
//             {streamers.length === 0 ? (
//               <div className="px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500 font-medium">
//                 Tidak ada streamer ditemukan
//               </div>
//             ) : (
//               streamers.map((s) => (
//                 <button
//                   key={s._id}
//                   type="button"
//                   onClick={() => { onChange(s._id); setOpen(false); }}
//                   className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors ${
//                     s._id === value ? 'bg-indigo-50 dark:bg-indigo-950/30' : ''
//                   }`}
//                 >
//                   <div className="w-8 h-8 rounded-none bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
//                     {s.username?.charAt(0).toUpperCase()}
//                   </div>
//                   <div className="min-w-0">
//                     <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">@{s.username}</p>
//                     {s.email && <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{s.email}</p>}
//                   </div>
//                   {s._id === value && <CheckCircle2 size={14} className="ml-auto flex-shrink-0 text-indigo-500" />}
//                 </button>
//               ))
//             )}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// // ─── Log Entry ────────────────────────────────────────────────────────────────
// const LogEntry = ({ entry }) => (
//   <motion.div
//     initial={{ opacity: 0, x: -12 }}
//     animate={{ opacity: 1, x: 0 }}
//     className="flex items-start gap-3 py-3 border-b border-slate-50 dark:border-slate-800 last:border-0"
//   >
//     <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${entry.status === 'ok' ? 'bg-emerald-400' : 'bg-red-400'}`} />
//     <div className="min-w-0 flex-1">
//       <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
//         @{entry.streamer} — {formatRp(entry.amount)}
//       </p>
//       {entry.message && (
//         <p className="text-[10px] text-slate-400 dark:text-slate-500 italic truncate">"{entry.message}"</p>
//       )}
//       <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5 font-mono">{entry.time}</p>
//     </div>
//     <span className={`text-[10px] font-black px-2 py-0.5 rounded-none flex-shrink-0 ${
//       entry.status === 'ok'
//         ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
//         : 'bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400'
//     }`}>
//       {entry.status === 'ok' ? 'SENT' : 'ERR'}
//     </span>
//   </motion.div>
// );

// // ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
// const GhostAlertPage = () => {
//   const payload = getTokenPayload();
//   const isSuperAdmin = payload?.role === 'superAdmin';

//   const [streamers, setStreamers]           = useState([]);
//   const [loadingStreamers, setLoadingStreamers] = useState(false);
//   const [sending, setSending]               = useState(false);
//   const [toast, setToast]                   = useState(null);
//   const [log, setLog]                       = useState([]);

//   const [form, setForm] = useState({
//     targetUserId: '',
//     donorName: 'SuperAdmin 👑',
//     amount: 50000,
//     message: '',
//     mediaUrl: '',
//     mediaType: 'image',
//     voiceUrl: '',              
//   });

//   const toastTimeout = useRef(null);

//   const showToast = (message, type = 'success') => {
//     setToast({ message, type });
//     clearTimeout(toastTimeout.current);
//     toastTimeout.current = setTimeout(() => setToast(null), 3500);
//   };

//   useEffect(() => {
//     if (!isSuperAdmin) return;
//     setLoadingStreamers(true);
//     axios
//       .get(`${import.meta.env.VITE_API_URL}/api/midtrans/admin/users`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//       })
//       .then((res) => setStreamers(res.data?.users || res.data || []))
//       .catch(() =>
//         axios
//           .get(`${import.meta.env.VITE_API_URL}/api/overlay/admin/streamers`, {
//             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//           })
//           .then((res) => setStreamers(res.data || []))
//           .catch(() => showToast('Gagal memuat daftar streamer', 'error'))
//       )
//       .finally(() => setLoadingStreamers(false));
//   }, [isSuperAdmin]);

//   const handleSend = async () => {
//     if (!form.targetUserId)             return showToast('Pilih streamer target terlebih dahulu', 'error');
//     if (!form.amount || form.amount < 1000) return showToast('Nominal minimal Rp 1.000', 'error');

//     setSending(true);
//     try {
//       await axios.post(
//         `${import.meta.env.VITE_API_URL}/api/midtrans/ghost-alert`,
//         {
//           targetUserId: form.targetUserId,
//           donorName: form.donorName || 'SuperAdmin 👑',
//           amount: Number(form.amount),
//           message: form.message,
//           mediaUrl: form.mediaUrl.trim() || null,
//           mediaType: form.mediaUrl.trim() ? form.mediaType : null,
//           voiceUrl: form.voiceUrl.trim() || null,   // ← TAMBAH INI
//         },
//         { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//       );
//       const streamer = streamers.find((s) => s._id === form.targetUserId);
//       setLog((prev) => [{ streamer: streamer?.username || form.targetUserId, amount: form.amount, message: form.message, status: 'ok', time: new Date().toLocaleTimeString('id-ID') }, ...prev.slice(0, 19)]);
//       showToast(`Alert berhasil dikirim ke @${streamer?.username}! 🚀`);
//     } catch (err) {
//       const streamer = streamers.find((s) => s._id === form.targetUserId);
//       setLog((prev) => [{ streamer: streamer?.username || form.targetUserId, amount: form.amount, message: form.message, status: 'error', time: new Date().toLocaleTimeString('id-ID') }, ...prev.slice(0, 19)]);
//       showToast(err?.response?.data?.message || 'Gagal mengirim alert', 'error');
//     } finally {
//       setSending(false);
//     }
//   };

//   // ── Unauthorized ──────────────────────────────────────────────────────────
//   if (!isSuperAdmin) {
//     return (
//       <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
//         <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/40 text-red-500 flex items-center justify-center mb-6">
//           <ShieldAlert size={36} />
//         </div>
//         <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Akses Ditolak</h2>
//         <p className="text-slate-400 dark:text-slate-500 font-medium">Halaman ini hanya untuk SuperAdmin.</p>
//       </div>
//     );
//   }

//   // ── Main UI ───────────────────────────────────────────────────────────────
//   return (
//     <div className="max-w-7xl mx-auto px-4 md:px-0 py-0 space-y-6">

//       {/* Toast */}
//       <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
//         <AnimatePresence>
//           {toast && <Toast key={toast.message} message={toast.message} type={toast.type} />}
//         </AnimatePresence>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

//         {/* ── Form Panel ── */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.05 }}
//           className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-none border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none p-7 space-y-6"
//         >
//           {/* Streamer Target */}
//           <div>
//             <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">
//               Streamer Target
//             </label>
//             <StreamerSelect streamers={streamers} value={form.targetUserId} onChange={(id) => setForm({ ...form, targetUserId: id })} loading={loadingStreamers} />
//           </div>

//           {/* Donor Name */}
//           <div>
//             <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">
//               Nama Pengirim
//             </label>
//             <input
//               type="text"
//               value={form.donorName}
//               onChange={(e) => setForm({ ...form, donorName: e.target.value })}
//               className="w-full p-4 rounded-none bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-300 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-800 outline-none font-bold text-sm text-slate-700 dark:text-slate-200 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
//               placeholder="Nama yang muncul di overlay..."
//             />
//           </div>

//           {/* Amount */}
//           <div>
//             <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">
//               Nominal (digunakan untuk trigger media & durasi)
//             </label>
//             <div className="grid grid-cols-5 gap-2 mb-3">
//               {PRESET_AMOUNTS.map((p) => (
//                 <button
//                   key={p.value}
//                   type="button"
//                   onClick={() => setForm({ ...form, amount: p.value })}
//                   className={`cursor-pointer active:scale-[0.96] py-2.5 rounded-none font-black text-sm transition-all border-2 ${
//                     form.amount === p.value
//                       ? 'bg-indigo-600 border-indigo-600 text-white'
//                       : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-200 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400'
//                   }`}
//                 >
//                   {p.label}
//                 </button>
//               ))}
//             </div>
//             <div className="relative">
//               <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-indigo-600 dark:text-indigo-400 text-sm pointer-events-none">Rp</span>
//               <input
//                 type="number"
//                 value={form.amount || ''}
//                 onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
//                 className="w-full p-4 pl-12 rounded-none font-black text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-300 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
//                 placeholder="Custom nominal..."
//               />
//             </div>
//           </div>

//           {/* Message */}
//           <div>
//             <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">
//               Pesan
//             </label>
//             <div className="flex flex-wrap gap-1.5 mb-2">
//               {PRESET_MESSAGES.map((msg) => (
//                 <button
//                   key={msg}
//                   type="button"
//                   onClick={() => setForm({ ...form, message: msg })}
//                   className="cursor-pointer px-3 py-1 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 rounded-none text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
//                 >
//                   {msg}
//                 </button>
//               ))}
//             </div>
//             <textarea
//               value={form.message}
//               onChange={(e) => setForm({ ...form, message: e.target.value })}
//               className="w-full p-4 rounded-none bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-300 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-800 outline-none min-h-[80px] font-medium text-sm text-slate-700 dark:text-slate-200 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
//               placeholder="Isi pesan overlay (opsional)..."
//             />
//           </div>

//           {/* Media (Optional) */}
//           <div className="rounded-none border-2 border-dashed border-slate-200 dark:border-slate-700 p-5 space-y-4">
//             <div className="flex items-center gap-2">
//               <Video size={14} className="text-slate-400 dark:text-slate-500" />
//               <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
//                 Media Alert (Opsional)
//               </span>
//             </div>

//             <div className="grid grid-cols-3 gap-2">
//               {MEDIA_TYPES.map((mt) => (
//                 <button
//                   key={mt.value}
//                   type="button"
//                   onClick={() => setForm({ ...form, mediaType: mt.value })}
//                   className={`cursor-pointer py-2 rounded-none font-bold text-xs transition-all border-2 ${
//                     form.mediaType === mt.value
//                       ? 'bg-purple-600 border-purple-600 text-white'
//                       : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-purple-200 dark:hover:border-purple-700 hover:text-purple-600 dark:hover:text-purple-400'
//                   }`}
//                 >
//                   {mt.label}
//                 </button>
//               ))}
//             </div>

//             <input
//               type="url"
//               value={form.mediaUrl}
//               onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
//               className="w-full p-3.5 rounded-none bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-purple-300 dark:focus:border-purple-600 outline-none font-mono text-xs text-slate-700 dark:text-slate-300 transition-all placeholder:font-sans placeholder:text-slate-400 dark:placeholder:text-slate-600"
//               placeholder="https://i.imgur.com/... atau https://youtu.be/..."
//             />

//             <div className="rounded-none border-2 border-dashed border-slate-200 dark:border-slate-700 p-5 space-y-3">
//               <div className="flex items-center gap-2">
//                 <HeadphonesIcon size={14} className="text-slate-400 dark:text-slate-500" />
//                 <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
//                   Voice Message (Opsional)
//                 </span>
//               </div>
//               <input
//                 type="url"
//                 value={form.voiceUrl}
//                 onChange={(e) => setForm({ ...form, voiceUrl: e.target.value })}
//                 className="w-full p-3.5 rounded-none bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-300 dark:focus:border-indigo-600 outline-none font-mono text-xs text-slate-700 dark:text-slate-300 transition-all placeholder:font-sans placeholder:text-slate-400 dark:placeholder:text-slate-600"
//                 placeholder="https://... (URL audio .mp3, .ogg, dll)"
//               />
//             </div>
//           </div>

//           {/* Submit */}
//           <motion.button
//             whileHover={{ scale: 1.012 }}
//             whileTap={{ scale: 0.97 }}
//             type="button"
//             onClick={handleSend}
//             disabled={sending || !form.targetUserId || !form.amount}
//             className="cursor-pointer w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-none font-black text-base shadow-xl shadow-indigo-200 dark:shadow-indigo-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 transition-all"
//           >
//             {sending ? (
//               <><Loader2 size={18} className="animate-spin" /> Mengirim Alert...</>
//             ) : (
//               <><Send size={18} /> Kirim Ghost Alert {form.amount ? `(${formatRp(form.amount)})` : ''}</>
//             )}
//           </motion.button>
//         </motion.div>

//         {/* ── Right Panel: Info + Log ── */}
//         <div className="lg:col-span-2 space-y-5">

//           {/* Info Card — gradient, no dark mode needed */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-none p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-indigo-900/30"
//           >
//             <div className="flex items-center gap-2.5 mb-4">
//               <Radio size={16} className="text-indigo-200" />
//               <p className="text-xs font-black uppercase tracking-widest text-indigo-200">Cara Kerja</p>
//             </div>
//             <div className="space-y-3">
//               {[
//                 { step: '01', text: 'Pilih streamer target dan isi form' },
//                 { step: '02', text: 'Nominal digunakan untuk trigger media & durasi overlay' },
//                 { step: '03', text: 'Alert langsung dikirim ke OBS via Socket.IO' },
//                 { step: '04', text: 'Tidak ada transaksi Midtrans yang dibuat' },
//               ].map((item) => (
//                 <div key={item.step} className="flex items-start gap-3">
//                   <span className="text-[10px] font-black text-indigo-300 mt-0.5 flex-shrink-0 w-5">{item.step}</span>
//                   <p className="text-xs text-indigo-100 font-medium leading-relaxed">{item.text}</p>
//                 </div>
//               ))}
//             </div>
//           </motion.div>

//           {/* Activity Log */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.15 }}
//             className="bg-white dark:bg-slate-900 rounded-none border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none overflow-hidden"
//           >
//             <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 dark:border-slate-800">
//               <p className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Log Aktivitas</p>
//               {log.length > 0 && (
//                 <button
//                   type="button"
//                   onClick={() => setLog([])}
//                   className="cursor-pointer text-[10px] font-bold text-slate-300 dark:text-slate-600 hover:text-red-400 dark:hover:text-red-400 transition-colors"
//                 >
//                   Hapus
//                 </button>
//               )}
//             </div>

//             <div className="px-5 py-2 max-h-72 overflow-y-auto">
//               <AnimatePresence>
//                 {log.length === 0 ? (
//                   <motion.div
//                     key="empty"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     className="py-10 text-center"
//                   >
//                     <p className="text-sm text-slate-300 dark:text-slate-600 font-bold">Belum ada aktivitas</p>
//                     <p className="text-[10px] text-slate-200 dark:text-slate-700 mt-1">Alert yang terkirim akan muncul di sini</p>
//                   </motion.div>
//                 ) : (
//                   log.map((entry, i) => <LogEntry key={i} entry={entry} />)
//                 )}
//               </AnimatePresence>
//             </div>
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default GhostAlertPage;

import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  HeadphonesIcon,
  Loader2,
  Radio,
  Send,
  ShieldAlert,
  User2,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { VoiceRecorder } from '../components/voiceOver';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getTokenPayload = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try { return JSON.parse(atob(token.split('.')[1])); }
  catch { return null; }
};

const formatRp = (n) => {
  if (!n) return '–';
  return `Rp ${Number(n).toLocaleString('id-ID')}`;
};

const PRESET_AMOUNTS = [
  { label: '10K',  value: 10000   },
  { label: '50K',  value: 50000   },
  { label: '100K', value: 100000  },
  { label: '500K', value: 500000  },
  { label: '1jt',  value: 1000000 },
];

const PRESET_MESSAGES = [
  'Mantap banget streamernya! 🔥',
  'GG bro, keep it up!',
  'Semangat terus, ditunggu konten selanjutnya!',
  'Test donasi dari admin 👑',
];

// ✅ Hapus 'video' (Video Langsung), sisakan image/gif dan youtube
const MEDIA_TYPES = [
  { value: 'image',   label: 'Gambar / GIF' },
  { value: 'youtube', label: 'YouTube' },
];

// ─── YouTube Helpers ───────────────────────────────────────────────────────────
const isYouTubeUrl = (url) => {
  if (!url) return false;
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)/i.test(url);
};

const getYouTubeEmbedUrl = (url, startSeconds = 0) => {
  if (!url) return '';
  let videoId = '';
  if (url.includes('youtu.be')) {
    videoId = url.split('youtu.be/')[1]?.split(/[?&]/)[0];
  } else {
    try {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v') || '';
    } catch { /* fallback */ }
  }
  if (!videoId) return url;
  let embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
  if (startSeconds > 0) embedUrl += `&start=${startSeconds}`;
  return embedUrl;
};

// ─── YouTube Time Picker ───────────────────────────────────────────────────────
const YouTubeTimePicker = ({ startTime, onChange }) => {
  const [hours, setHours]     = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const total = Math.floor(startTime || 0);
    setHours(Math.floor(total / 3600));
    setMinutes(Math.floor((total % 3600) / 60));
    setSeconds(total % 60);
  }, [startTime]);

  useEffect(() => {
    onChange(hours * 3600 + minutes * 60 + seconds);
  }, [hours, minutes, seconds]);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-3 p-4 bg-gradient-to-r from-yellow-50/70 to-orange-50/70 dark:from-yellow-900/30 dark:to-orange-900/30 border border-yellow-200 dark:border-yellow-800 rounded-none space-y-3"
    >
      <p className="text-xs font-black text-yellow-700 dark:text-yellow-400 leading-none">
        Kustom Waktu Mulai Video
      </p>
      <p className="text-[10px] text-yellow-500 dark:text-yellow-400 font-medium">
        Video akan dimulai dari waktu yang kamu pilih
      </p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Jam',   value: hours,   set: setHours,   max: 23 },
          { label: 'Menit', value: minutes, set: setMinutes, max: 59 },
          { label: 'Detik', value: seconds, set: setSeconds, max: 59 },
        ].map(({ label, value, set, max }) => (
          <div key={label} className="space-y-1">
            <label className="block text-[9px] font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-wider text-center">
              {label}
            </label>
            <input
              type="number"
              min="0"
              max={max}
              value={value}
              onChange={(e) => set(Math.max(0, Math.min(max, parseInt(e.target.value) || 0)))}
              className="w-full p-2 text-center rounded-none bg-white dark:bg-slate-800 border border-yellow-200 dark:border-yellow-700 focus:border-yellow-400 font-mono text-sm font-bold text-slate-700 dark:text-white outline-none"
            />
          </div>
        ))}
      </div>
      {/* Preview label waktu */}
      {(hours > 0 || minutes > 0 || seconds > 0) && (
        <p className="text-[10px] font-mono font-bold text-yellow-600 dark:text-yellow-400">
          Mulai dari: {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </p>
      )}
    </motion.div>
  );
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type }) => (
  <motion.div
    initial={{ opacity: 0, y: 16, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 8, scale: 0.96 }}
    transition={{ duration: 0.25 }}
    className={`flex items-center gap-3 px-5 py-4 rounded-none shadow-2xl font-bold text-sm ${
      type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
    }`}
  >
    {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
    {message}
  </motion.div>
);

// ─── Streamer Select Dropdown ─────────────────────────────────────────────────
const StreamerSelect = ({ streamers, value, onChange, loading }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = streamers.find((s) => s._id === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="cursor-pointer w-full flex items-center justify-between gap-3 px-4 py-4 rounded-none bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none transition-all font-bold text-sm text-slate-700 dark:text-slate-200"
      >
        <div className="flex items-center gap-3 min-w-0">
          {selected ? (
            <>
              <div className="w-8 h-8 rounded-none bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                {selected.username?.charAt(0).toUpperCase()}
              </div>
              <span className="truncate">@{selected.username}</span>
            </>
          ) : (
            <>
              <User2 size={16} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <span className="text-slate-400 dark:text-slate-500 font-medium">
                {loading ? 'Memuat streamer...' : 'Pilih streamer target...'}
              </span>
            </>
          )}
        </div>
        <ChevronDown size={16} className={`text-slate-400 dark:text-slate-500 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute z-50 top-full mt-2 left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
          >
            {streamers.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500 font-medium">
                Tidak ada streamer ditemukan
              </div>
            ) : (
              streamers.map((s) => (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => { onChange(s._id); setOpen(false); }}
                  className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors ${
                    s._id === value ? 'bg-indigo-50 dark:bg-indigo-950/30' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-none bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                    {s.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">@{s.username}</p>
                    {s.email && <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{s.email}</p>}
                  </div>
                  {s._id === value && <CheckCircle2 size={14} className="ml-auto flex-shrink-0 text-indigo-500" />}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Log Entry ────────────────────────────────────────────────────────────────
const LogEntry = ({ entry }) => (
  <motion.div
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-start gap-3 py-3 border-b border-slate-50 dark:border-slate-800 last:border-0"
  >
    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${entry.status === 'ok' ? 'bg-emerald-400' : 'bg-red-400'}`} />
    <div className="min-w-0 flex-1">
      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
        @{entry.streamer} — {formatRp(entry.amount)}
      </p>
      {entry.message && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 italic truncate">"{entry.message}"</p>
      )}
      <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5 font-mono">{entry.time}</p>
    </div>
    <span className={`text-[10px] font-black px-2 py-0.5 rounded-none flex-shrink-0 ${
      entry.status === 'ok'
        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
        : 'bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400'
    }`}>
      {entry.status === 'ok' ? 'SENT' : 'ERR'}
    </span>
  </motion.div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const GhostAlertPage = () => {
  const payload = getTokenPayload();
  const isSuperAdmin = payload?.role === 'superAdmin';

  const [streamers, setStreamers]               = useState([]);
  const [loadingStreamers, setLoadingStreamers] = useState(false);
  const [sending, setSending]                   = useState(false);
  const [toast, setToast]                       = useState(null);
  const [log, setLog]                           = useState([]);

  // ✅ Tambah startTime untuk YouTube time picker
  const [startTime, setStartTime] = useState(0);

  const [form, setForm] = useState({
    targetUserId: '',
    donorName:    'SuperAdmin 👑',
    amount:       50000,
    message:      '',
    mediaUrl:     '',
    mediaType:    'image', // default image/gif
    voiceUrl:     '',
  });

  const toastTimeout = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(null), 3500);
  };

  // Reset startTime kalau mediaUrl berubah atau bukan YouTube
  useEffect(() => {
    if (!isYouTubeUrl(form.mediaUrl)) setStartTime(0);
  }, [form.mediaUrl]);

  // Auto-set mediaType ke 'youtube' kalau URL adalah YouTube
  useEffect(() => {
    if (isYouTubeUrl(form.mediaUrl) && form.mediaType !== 'youtube') {
      setForm((prev) => ({ ...prev, mediaType: 'youtube' }));
    }
  }, [form.mediaUrl]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    setLoadingStreamers(true);
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/midtrans/admin/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => setStreamers(res.data?.users || res.data || []))
      .catch(() =>
        axios
          .get(`${import.meta.env.VITE_API_URL}/api/overlay/admin/streamers`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          })
          .then((res) => setStreamers(res.data || []))
          .catch(() => showToast('Gagal memuat daftar streamer', 'error'))
      )
      .finally(() => setLoadingStreamers(false));
  }, [isSuperAdmin]);

  const handleSend = async () => {
    if (!form.targetUserId)                  return showToast('Pilih streamer target terlebih dahulu', 'error');
    if (!form.amount || form.amount < 1000)  return showToast('Nominal minimal Rp 1.000', 'error');

    setSending(true);
    try {
      await axios.post(
      `${import.meta.env.VITE_API_URL}/api/midtrans/ghost-alert`,
        {
          targetUserId: form.targetUserId,
          donorName: form.donorName || 'SuperAdmin',
          amount: Number(form.amount),
          message: form.message,
          mediaUrl: form.mediaUrl.trim() || null,
          mediaType: form.mediaUrl.trim() ? form.mediaType : null,
          startTime: isYouTubeUrl(form.mediaUrl) ? startTime : 0,  // ← Sudah dikirim
          voiceUrl: form.voiceUrl.trim() || null,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const streamer = streamers.find((s) => s._id === form.targetUserId);
      setLog((prev) => [{
        streamer: streamer?.username || form.targetUserId,
        amount:   form.amount,
        message:  form.message,
        status:   'ok',
        time:     new Date().toLocaleTimeString('id-ID'),
      }, ...prev.slice(0, 19)]);
      showToast(`Alert berhasil dikirim ke @${streamer?.username}! 🚀`);
    } catch (err) {
      const streamer = streamers.find((s) => s._id === form.targetUserId);
      setLog((prev) => [{
        streamer: streamer?.username || form.targetUserId,
        amount:   form.amount,
        message:  form.message,
        status:   'error',
        time:     new Date().toLocaleTimeString('id-ID'),
      }, ...prev.slice(0, 19)]);
      showToast(err?.response?.data?.message || 'Gagal mengirim alert', 'error');
    } finally {
      setSending(false);
    }
  };

  // ── Unauthorized ──────────────────────────────────────────────────────────
  if (!isSuperAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/40 text-red-500 flex items-center justify-center mb-6">
          <ShieldAlert size={36} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Akses Ditolak</h2>
        <p className="text-slate-400 dark:text-slate-500 font-medium">Halaman ini hanya untuk SuperAdmin.</p>
      </div>
    );
  }

  const isYouTube = isYouTubeUrl(form.mediaUrl);

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-8xl mx-auto px-0 md:px-0 py-0 space-y-6">

      {/* Toast */}
      <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
        <AnimatePresence>
          {toast && <Toast key={toast.message} message={toast.message} type={toast.type} />}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* ── Form Panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-none border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none p-4 md:p-4.5 space-y-6"
        >
          {/* Streamer Target */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">
              Streamer Target
            </label>
            <StreamerSelect
              streamers={streamers}
              value={form.targetUserId}
              onChange={(id) => setForm({ ...form, targetUserId: id })}
              loading={loadingStreamers}
            />
          </div>

          {/* Donor Name */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">
              Nama Pengirim
            </label>
            <input
              type="text"
              value={form.donorName}
              onChange={(e) => setForm({ ...form, donorName: e.target.value })}
              className="w-full p-4 rounded-none bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-300 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-800 outline-none font-bold text-sm text-slate-700 dark:text-slate-200 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
              placeholder="Nama yang muncul di overlay..."
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">
              Nominal
            </label>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {PRESET_AMOUNTS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setForm({ ...form, amount: p.value })}
                  className={`cursor-pointer active:scale-[0.96] py-2.5 rounded-none font-black text-sm transition-all border-2 ${
                    form.amount === p.value
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-200 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-indigo-600 dark:text-indigo-400 text-sm pointer-events-none">Rp</span>
              <input
                type="number"
                value={form.amount || ''}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                className="w-full p-4 pl-12 rounded-none font-black text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-300 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                placeholder="Custom nominal..."
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">
              Pesan
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_MESSAGES.map((msg) => (
                <button
                  key={msg}
                  type="button"
                  onClick={() => setForm({ ...form, message: msg })}
                  className="cursor-pointer px-3 py-1 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 rounded-none text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                >
                  {msg}
                </button>
              ))}
            </div>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full p-4 rounded-none bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-300 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-800 outline-none min-h-[80px] font-medium text-sm text-slate-700 dark:text-slate-200 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
              placeholder="Isi pesan overlay (opsional)..."
            />
          </div>

          {/* ✅ Media Section — hanya Gambar/GIF dan YouTube */}
          <div className="rounded-none border-2 border-dashed border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 dark:text-slate-500 text-sm">🖼️</span>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Media Alert (Opsional)
              </span>
            </div>

            {/* Type selector — 2 opsi saja */}
            <div className="grid grid-cols-2 gap-2">
              {MEDIA_TYPES.map((mt) => (
                <button
                  key={mt.value}
                  type="button"
                  onClick={() => setForm({ ...form, mediaType: mt.value })}
                  className={`cursor-pointer py-2 rounded-none font-bold text-xs transition-all border-2 ${
                    form.mediaType === mt.value
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-purple-200 dark:hover:border-purple-700 hover:text-purple-600 dark:hover:text-purple-400'
                  }`}
                >
                  {mt.value === 'image' ? '🖼️' : '📺'} {mt.label}
                </button>
              ))}
            </div>

            {/* URL input */}
            <input
              type="url"
              value={form.mediaUrl}
              onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
              className="w-full p-3.5 rounded-none bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-purple-300 dark:focus:border-purple-600 outline-none font-mono text-xs text-slate-700 dark:text-slate-300 transition-all placeholder:font-sans placeholder:text-slate-400 dark:placeholder:text-slate-600"
              placeholder={
                form.mediaType === 'youtube'
                  ? 'https://youtu.be/xxxx atau https://youtube.com/watch?v=xxxx'
                  : 'https://i.imgur.com/xxxx.gif atau https://example.com/image.png'
              }
            />

            {/* ✅ YouTube Time Picker — muncul kalau URL adalah YouTube */}
            <AnimatePresence>
              {isYouTube && form.mediaUrl && (
                <YouTubeTimePicker
                  startTime={startTime}
                  onChange={setStartTime}
                />
              )}
            </AnimatePresence>

            {/* Preview sederhana kalau ada URL */}
            <AnimatePresence>
              {form.mediaUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-none overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900"
                  style={{ maxHeight: 180 }}
                >
                  {isYouTube ? (
                    <iframe
                      src={getYouTubeEmbedUrl(form.mediaUrl, startTime)}
                      className="w-full aspect-video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <img
                      src={form.mediaUrl}
                      alt="Preview"
                      className="w-full object-cover"
                      style={{ maxHeight: 180 }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div className="px-3 py-1.5 bg-black/60">
                    <p className="text-[10px] text-white/80 font-bold">
                      {isYouTube
                        ? <>📺 YouTube{startTime > 0 && (
                            <span className="ml-1 bg-yellow-500/30 px-1 py-0.5 text-[9px]">
                              {String(Math.floor(startTime / 3600)).padStart(2, '0')}:{String(Math.floor((startTime % 3600) / 60)).padStart(2, '0')}:{String(startTime % 60).padStart(2, '0')}
                            </span>
                          )}</>
                        : '🖼️ Gambar / GIF'
                      } — Preview
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ✅ Voice Note section - Pakai VoiceRecorder kayak SupporterPage */}
            <div className="rounded-none border-2 border-dashed border-slate-200 dark:border-slate-700 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <HeadphonesIcon size={14} className="text-slate-400 dark:text-slate-500" />
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Voice Note (Opsional)
                </span>
              </div>
              
              {/* ✅ Ganti input URL dengan VoiceRecorder */}
              <VoiceRecorder
                onVoiceReady={(url) => setForm({ ...form, voiceUrl: url || '' })}
                maxSeconds={60}
                disabled={sending}
              />
            </div>
          </div>

          {/* Submit */}
          <motion.button
            // whileHover={{ scale: 1.012 }}
            // whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleSend}
            disabled={sending || !form.targetUserId || !form.amount}
            className="active:scale-[0.99] cursor-pointer w-full py-3 text-sm bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-none font-black text-base shadow-xl shadow-indigo-200 dark:shadow-indigo-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 transition-all"
          >
            {sending ? (
              <><Loader2 size={18} className="animate-spin" /> Mengirim Alert...</>
            ) : (
              <><Send size={18} /> Kirim Ghost Alert {form.amount ? `(${formatRp(form.amount)})` : ''}</>
            )}
          </motion.button>
        </motion.div>

        {/* ── Right Panel: Info + Log ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:flex flex-col hidden bg-gradient-to-br from-indigo-600 to-violet-700 rounded-none p-4 md:p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-indigo-900/30"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <Radio size={16} className="text-indigo-200" />
              <p className="text-xs font-black uppercase tracking-widest text-indigo-200">Cara Kerja</p>
            </div>
            <div className="space-y-3">
              {[
                { step: '01', text: 'Pilih streamer target dan isi form' },
                { step: '02', text: 'Nominal digunakan untuk trigger durasi overlay' },
                { step: '03', text: 'Pilih media: Gambar/GIF atau YouTube (dengan custom start time)' },
                { step: '04', text: 'Opsional: tambahkan Voice Note via URL audio' },
                { step: '05', text: 'Alert langsung dikirim ke OBS via Socket.IO tanpa transaksi Midtrans' },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <span className="text-[10px] font-black text-indigo-300 mt-0.5 flex-shrink-0 w-5">{item.step}</span>
                  <p className="text-xs text-indigo-100 font-medium leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activity Log */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-slate-900 rounded-none border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 dark:border-slate-800">
              <p className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Log Aktivitas</p>
              {log.length > 0 && (
                <button
                  type="button"
                  onClick={() => setLog([])}
                  className="cursor-pointer text-[10px] font-bold text-slate-300 dark:text-slate-600 hover:text-red-400 dark:hover:text-red-400 transition-colors"
                >
                  Hapus
                </button>
              )}
            </div>
            <div className="px-5 py-2 max-h-72 overflow-y-auto">
              <AnimatePresence>
                {log.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-10 text-center"
                  >
                    <p className="text-sm text-slate-300 dark:text-slate-600 font-bold">Belum ada aktivitas</p>
                    <p className="text-[10px] text-slate-200 dark:text-slate-700 mt-1">Alert yang terkirim akan muncul di sini</p>
                  </motion.div>
                ) : (
                  log.map((entry, i) => <LogEntry key={i} entry={entry} />)
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GhostAlertPage;