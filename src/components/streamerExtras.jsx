import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  Plus,
  RotateCcw,
  Save,
  Pause,
  Play,
  Trash2,
  Trophy,
  Vote,
  Milestone,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.VITE_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
import { Subath1, Subath2 } from './subathonWidget';
import { Miles1, Miles2 } from './milestoneWidget';

// ─── API Calls ────────────────────────────────────────────────────────────────

const fetchMyPolls  = async () => (await axios.get(`${BASE_URL}/api/polls`, { headers: authHeader() })).data;
const createPoll    = async (d) => (await axios.post(`${BASE_URL}/api/polls`, d, { headers: authHeader() })).data;
const closePoll     = async (id) => (await axios.post(`${BASE_URL}/api/polls/${id}/close`, {}, { headers: authHeader() })).data;
const deletePoll    = async (id) => (await axios.delete(`${BASE_URL}/api/polls/${id}`, { headers: authHeader() })).data;

const fetchSubathon   = async () => (await axios.get(`${BASE_URL}/api/subathon`, { headers: authHeader() })).data;
const updateSubConfig = async (d) => (await axios.put(`${BASE_URL}/api/subathon/config`, d, { headers: authHeader() })).data;
const startSubathon   = async () => (await axios.post(`${BASE_URL}/api/subathon/start`, {}, { headers: authHeader() })).data;
const pauseSubathon   = async (data) => (await axios.post(`${BASE_URL}/api/subathon/pause`, data, { headers: authHeader() })).data;
const resetSubathon   = async () => (await axios.post(`${BASE_URL}/api/subathon/reset`, {}, { headers: authHeader() })).data;
const addTimeSubathon = async (s) => (await axios.post(`${BASE_URL}/api/subathon/add-time`, { seconds: s }, { headers: authHeader() })).data;

const fetchProfile  = async () => (await axios.get(`${BASE_URL}/api/overlay/settings`, { headers: authHeader() })).data;
const saveSettings  = async (s) => (await axios.put(`${BASE_URL}/api/overlay/settings`, s, { headers: authHeader() })).data;

const fetchMilestones = async () => (await axios.get(`${BASE_URL}/api/milestones`, { headers: authHeader() })).data;
const saveMilestones  = async (d) => (await axios.put(`${BASE_URL}/api/milestones`, { milestones: d }, { headers: authHeader() })).data;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatSeconds = (s) => {
  if (!s && s !== 0) return '00:00:00';
  const totalSec = Math.max(0, Math.floor(s));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const sec = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

// ─── PollManager ─────────────────────────────────────────────────────────────

export const PollManager = ({ overlayToken, username }) => {
  const queryClient = useQueryClient();
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '']);
  const [showResults, setShowResults] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [livePolls, setLivePolls] = useState({});
  const [pollCopied, setPollCopied] = useState(false);

  const { data: polls = [] } = useQuery({
    queryKey: ['myPolls'],
    queryFn: fetchMyPolls,
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (!overlayToken) return;
    const socket = io(BASE_URL);
    socket.emit('join-room', overlayToken);
    socket.on('poll-updated', (poll) => {
      setLivePolls(prev => ({ ...prev, [poll._id]: poll }));
      queryClient.invalidateQueries({ queryKey: ['myPolls'] });
    });
    return () => socket.disconnect();
  }, [overlayToken]);

  const createMutation = useMutation({
    mutationFn: createPoll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPolls'] });
      setNewQuestion('');
      setNewOptions(['', '']);
      setShowCreate(false);
    },
    onError: (e) => alert(e.response?.data?.message || 'Gagal membuat poll'),
  });

  const closeMutation = useMutation({
    mutationFn: closePoll,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myPolls'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePoll,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myPolls'] }),
  });

  const addOption = () => setNewOptions(o => [...o, '']);
  const removeOption = (i) => setNewOptions(o => o.filter((_, idx) => idx !== i));
  const updateOption = (i, val) => setNewOptions(o => o.map((x, idx) => idx === i ? val : x));

  const handleCreate = () => {
    const validOptions = newOptions.filter(o => o.trim());
    if (!newQuestion.trim()) return alert('Pertanyaan wajib diisi!');
    if (validOptions.length < 2) return alert('Minimal 2 opsi!');
    createMutation.mutate({ question: newQuestion, options: validOptions, showResults });
  };

  const activePoll = polls.find(p => p.status === 'active');
  const closedPolls = polls.filter(p => p.status === 'closed');

  const getPollData = (poll) => livePolls[poll._id] || poll;
  const getTotalVotes = (poll) => (getPollData(poll).options || []).reduce((s, o) => s + (o.votes || 0), 0);
  const getPercent = (votes, total) => total === 0 ? 0 : Math.round((votes / total) * 100);

  return (
    <div className="space-y-5">
      {/* Active Poll */}
      {activePoll ? (
        <div className="mt-5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 md:py-4 border-b border-slate-100 dark:border-slate-800 bg-green-50 dark:bg-green-950/30">
            <div className="flex w-full justify-between gap-2">
              <button
                onClick={() => closeMutation.mutate(activePoll._id)}
                disabled={closeMutation.isPending}
                className="cursor-pointer active:scale-[0.99] px-4 py-2 hover:bg-slate-600/20 border border-slate-200/20 text-white rounded-xl font-black text-xs transition-all disabled:opacity-60">
                Tutup Poll
              </button>
              <button
                onClick={() => { if (window.confirm('Hapus poll ini?')) deleteMutation.mutate(activePoll._id); }}
                className="relative top-[-1px] cursor-pointer active:scale-[0.99] text-red-500 hover:bg-red-200 dark:hover:bg-red-950/60 rounded-xl transition-all">
                <Trash2 size={24} />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <h3 className="font-black text-slate-800 dark:text-slate-100 text-md md:text-lg">{getPollData(activePoll).question}</h3>
            <div className="space-y-3">
              {(getPollData(activePoll).options || []).map((opt) => {
                const total = getTotalVotes(activePoll);
                const pct = getPercent(opt.votes, total);
                return (
                  <div key={opt._id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{opt.text}</span>
                      <span className="font-black text-blue-600 dark:text-blue-400">{pct}% <span className="text-slate-400 dark:text-slate-500 font-medium text-xs">({opt.votes} votes)</span></span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden">
                      <motion.div
                        className="h-full bg-blue-500 rounded-xl"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">Total: {getTotalVotes(activePoll)} votes</p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 py-8 text-center">
          <p className="text-3xl mb-2">🗳️</p>
          <p className="font-black text-slate-500 dark:text-slate-400 text-sm">Tidak ada poll aktif</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">Buat poll baru agar donor bisa ikut voting</p>
        </div>
      )}

      {/* Buat Poll Baru */}
      <button
        onClick={() => setShowCreate(!showCreate)}
        className="cursor-pointer active:scale-[0.99] w-full py-3 border-2 border-dashed border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 rounded-xl font-black text-sm hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all flex items-center justify-center gap-2">
        <Plus size={16} /> {showCreate ? 'Batal' : 'Buat Poll Baru'}
      </button>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-100 dark:border-slate-700 space-y-5">

            {activePoll && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-400">
                ⚠️ Membuat poll baru akan menutup poll yang sedang aktif secara otomatis.
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Pertanyaan</label>
              <input
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
                placeholder="Contoh: Mau main game apa malam ini?"
                className="w-full p-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Pilihan Jawaban</label>
              {newOptions.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={opt}
                    onChange={e => updateOption(i, e.target.value)}
                    placeholder={`Opsi ${i + 1}`}
                    className="flex-1 p-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  />
                  {newOptions.length > 2 && (
                    <button onClick={() => removeOption(i)} className="cursor-pointer p-3 text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addOption}
                className="cursor-pointer active:scale-[0.99] text-sm font-black text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1.5">
                <Plus size={14} /> Tambah Opsi
              </button>
            </div>

            {/* Toggle show results */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
              <div>
                <p className="font-black text-slate-700 dark:text-slate-200 text-sm">Tampilkan Hasil di OBS</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Persentase vote terlihat live di widget OBS</p>
              </div>
              <button
                onClick={() => setShowResults(!showResults)}
                className={`relative inline-flex h-7 w-14 items-center rounded-xl transition-colors duration-300 cursor-pointer ${showResults ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                <span className={`inline-block h-5 w-5 transform rounded-xl bg-white shadow-md transition-transform duration-300 ${showResults ? 'translate-x-8' : 'translate-x-1'}`} />
              </button>
            </div>

            <button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="cursor-pointer active:scale-[0.99] w-full py-3 md:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70">
              <Vote size={16} /> {createMutation.isPending ? 'Membuat...' : 'Mulai Poll Sekarang'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OBS Widget URL */}
      {overlayToken && (
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Widget URL untuk OBS (420×300px)</p>
          <div className="flex gap-2">
            <input readOnly value={`${window.location.origin}/widget/${overlayToken}/poll`}
              className="flex-1 bg-transparent font-mono text-xs text-blue-600 dark:text-blue-400 font-bold outline-none truncate" />
            <button onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/widget/${overlayToken}/poll`);
                setPollCopied(true);
                setTimeout(() => setPollCopied(false), 2000);
              }}
              className={`cursor-pointer active:scale-[0.99] cursor-pointer active:scale-[0.98] px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${pollCopied ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
              {pollCopied ? <><CheckCircle2 size={12} /> Tersalin!</> : 'Salin'}
            </button>
          </div>
        </div>
      )}

      {overlayToken && (
        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
          <p className="text-[10px] font-black text-blue-400 dark:text-blue-500 uppercase tracking-widest mb-1">
            Link Vote untuk Donor
          </p>
          <p className="text-[10px] text-blue-400 dark:text-blue-500 font-medium mb-2">
            Bagikan link ini ke penonton agar bisa vote sambil donasi
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={`${window.location.origin}/poll/${/* username dari props atau context */ 'USERNAME'}`}
              className="flex-1 bg-transparent font-mono text-xs text-blue-600 dark:text-blue-400 font-bold outline-none truncate"
            />
            <button
              onClick={() => {
                // Ganti USERNAME dengan username streamer yang login
                // Bisa diambil dari props, context, atau localStorage
                const pollUrl = `${window.location.origin}/poll/USERNAME`;
                navigator.clipboard.writeText(pollUrl);
                // Tambahkan state copied jika mau (opsional)
              }}
              className="cursor-pointer active:scale-[0.99] cursor-pointer active:scale-[0.98] px-3 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white transition-all"
            >
              Salin
            </button>
          </div>
        </div>
      )}
      

      {/* Riwayat Poll */}
      {closedPolls.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Riwayat Poll ({closedPolls.length})</p>
          {closedPolls.slice(0, 5).map(poll => {
            const data = getPollData(poll);
            const total = getTotalVotes(poll);
            const winner = [...(data.options || [])].sort((a, b) => b.votes - a.votes)[0];
            return (
              <div key={poll._id} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-700 dark:text-slate-200 text-sm truncate">{data.question}</p>
                  {winner && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                      🏆 {winner.text} — {getPercent(winner.votes, total)}% ({total} votes total)
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-[10px] font-black">Closed</span>
                  <button onClick={() => { if (window.confirm('Hapus poll ini?')) deleteMutation.mutate(poll._id); }}
                    className="cursor-pointer p-2 text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── SubathonManager ──────────────────────────────────────────────────────────


export const SubathonManager = ({ overlayToken }) => {
  const queryClient = useQueryClient();
  const [localTimer, setLocalTimer] = useState(null);
  const [manualAdd, setManualAdd] = useState(60);
  const [displaySeconds, setDisplaySeconds] = useState(0);
  const [saved, setSaved] = useState(false);
  const [subCopied, setSubCopied] = useState(false);
  const intervalRef = useRef(null);
  const [showTiersTable, setShowTiersTable] = useState(false);
  const [newTierAmount, setNewTierAmount] = useState(5000);
  const [newTierHours, setNewTierHours] = useState(0);
  const [newTierMinutes, setNewTierMinutes] = useState(1);
  const [newTierSeconds, setNewTierSeconds] = useState(0);
  const [subTimerColor, setSubTimerColor] = useState('ffffff');
  const [subBgColor, setSubBgColor] = useState('0f0f19');
  const [subLabelColor, setSubLabelColor] = useState('ffffff');

  const { data, isLoading } = useQuery({
    queryKey: ['subathon'],
    queryFn: fetchSubathon,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (data) {
      setLocalTimer(t => t ? { ...t, ...data } : { ...data });
      setDisplaySeconds(data.currentSeconds || 0);
    }
  }, [data]);

  
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (localTimer?.isRunning) {
      intervalRef.current = setInterval(() => {
        setDisplaySeconds(s => {
          if (localTimer.mode === 'countup') {
            if (localTimer.maxSeconds && s >= localTimer.maxSeconds) return s;
            return s + 1;
          }
          return Math.max(0, s - 1);
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [localTimer?.isRunning, localTimer?.mode, localTimer?.maxSeconds]);

  useEffect(() => {
    if (!overlayToken) return;
    const socket = io(BASE_URL);
    socket.emit('join-room', overlayToken);
    socket.on('subathon-updated', (data) => {
      setTimer(data);
      setDisplaySeconds(data.currentSeconds || 0);
    });
    return () => socket.disconnect();
  }, [overlayToken]);
  
  const addTier = () => {
    if (!newTierAmount || newTierAmount <= 0) return;
    
    const totalSec = (newTierHours * 3600) + (newTierMinutes * 60) + newTierSeconds;
    const newTier = {
      amount: newTierAmount,
      hours: newTierHours,
      minutes: newTierMinutes,
      seconds: newTierSeconds
    };
    
    upd('durationTiers', [...(localTimer.durationTiers || []), newTier]);
    // Reset form
    setNewTierAmount(5000);
    setNewTierHours(0);
    setNewTierMinutes(1);
    setNewTierSeconds(0);
  };

  const removeTier = (index) => {
    const tiers = localTimer.durationTiers || [];
    upd('durationTiers', tiers.filter((_, i) => i !== index));
  };

  const configMutation = useMutation({
    mutationFn: updateSubConfig,
    onSuccess: (d) => { setLocalTimer(d); setSaved(true); setTimeout(() => setSaved(false), 2000); },
    onError: (e) => alert(e.response?.data?.message || 'Gagal simpan'),
  });

  const startMutation = useMutation({
    mutationFn: startSubathon,
    onSuccess: (d) => { setLocalTimer(d); setDisplaySeconds(d.currentSeconds); },
  });

  const pauseMutation = useMutation({
    mutationFn: pauseSubathon,
    onSuccess: (d) => setLocalTimer(d),
  });

  const resetMutation = useMutation({
    mutationFn: resetSubathon,
    onSuccess: (d) => { setLocalTimer(d); setDisplaySeconds(d.currentSeconds); },
  });

  const addTimeMutation = useMutation({
    mutationFn: addTimeSubathon,
    onSuccess: (d) => { setLocalTimer(d); setDisplaySeconds(d.currentSeconds); },
  });

  const upd = (k, v) => setLocalTimer(t => ({ ...t, [k]: v }));

  const save = () => {
    configMutation.mutate({
      mode: localTimer.mode,
      initialSeconds: localTimer.initialSeconds,
      autoAddEnabled: localTimer.autoAddEnabled,
      maxSeconds: localTimer.maxSeconds,
      title: localTimer.title,
      durationTiers: localTimer.durationTiers,  // ← INI YANG BARU
    });
  };

  if (isLoading || !localTimer) {
    return <div className="text-slate-400 dark:text-slate-500 text-sm font-bold animate-pulse py-3 md:py-4">Memuat timer...</div>;
  }

  const isRunning = localTimer.isRunning;
  const progressPct = localTimer.initialSeconds > 0
    ? Math.min(100, (displaySeconds / localTimer.initialSeconds) * 100) : 0;

  const progressColor = progressPct > 50 ? 'bg-green-500' : progressPct > 20 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="space-y-5 bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-100 dark:border-slate-800 rounded-xl p-4 md:p-5">
      {/* Timer Display */}
      <div className={`rounded-xl px-8 py-10 text-center relative overflow-hidden ${isRunning ? 'bg-blue-600' : 'bg-slate-800 dark:bg-slate-700'}`}>
        <div className="relative z-10">
          <p className="text-white/60 text-xs font-black uppercase tracking-widest mb-3">
            {localTimer.title || 'Subathon Timer'}
          </p>
          <div className={`text-4xl md:text-6xl font-black text-white tracking-tight font-mono transition-all ${!isRunning ? 'opacity-60' : ''}`}>
            {formatSeconds(displaySeconds)}
          </div>
          <p className="text-white/50 text-xs font-medium mt-3">
            {localTimer.mode === 'countdown' ? 'Countdown' : 'Count Up'} ·
            {isRunning ? <span className="text-green-300"> Berjalan</span> : <span className="text-slate-300"> Berhenti</span>}
          </p>
          {localTimer.mode === 'countdown' && (
            <div className="mt-5 h-2 bg-white/20 rounded-xl overflow-hidden">
              <motion.div
                className={`h-full rounded-xl ${progressColor}`}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Kontrol Utama */}
      <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
        <button
          onClick={() => isRunning 
            ? pauseMutation.mutate({ currentSeconds: displaySeconds }) 
            : startMutation.mutate()
          }
          disabled={startMutation.isPending || pauseMutation.isPending}
          className={`cursor-pointer active:scale-[0.99] flex justify-center md:flex-col items-center gap-2 py-3 md:py-4 rounded-xl font-black text-sm transition-all disabled:opacity-60 ${
            isRunning ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
          }`}>
          {isRunning ? <Pause size={20} /> : <Play size={20} />}
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={() => { if (window.confirm('Reset timer ke waktu awal?')) resetMutation.mutate(); }}
          disabled={resetMutation.isPending}
          className="cursor-pointer active:scale-[0.99] flex justify-center md:flex-col items-center gap-2 py-3 md:py-4 rounded-xl font-black text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all disabled:opacity-60">
          <RotateCcw size={20} />
          Reset
        </button>
        <button
          onClick={() => addTimeMutation.mutate(manualAdd)}
          disabled={addTimeMutation.isPending}
          className="cursor-pointer active:scale-[0.99] flex justify-center md:flex-col items-center gap-2 py-3 md:py-4 rounded-xl font-black text-sm bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-60">
          <Plus size={20} />
          Waktu
        </button>
      </div>

      {/* Slider tambah waktu manual */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tambah Waktu Manual</label>
          <span className="font-black text-blue-600 dark:text-blue-400 text-sm">{formatSeconds(manualAdd)}</span>
        </div>
        <input
          type="range" min={30} max={3600} step={30} value={manualAdd}
          onChange={e => setManualAdd(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold">
          <span>30 detik</span><span>30 menit</span><span>1 jam</span>
        </div>
      </div>

      {/* Konfigurasi */}
      <div className="md:bg-white md:dark:bg-slate-900 rounded-xl md:p-6 md:border border-slate-100 dark:border-slate-800 space-y-5">
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Konfigurasi Timer</p>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Judul Timer</label>
          <input value={localTimer.title || ''}
            onChange={e => upd('title', e.target.value)}
            placeholder="Subathon Timer"
            className="w-full p-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mode</label>
          <div className="grid grid-cols-2 gap-3">
            {[{ id: 'countdown', label: 'Countdown', desc: 'Waktu berkurang' }, { id: 'countup', label: 'Count Up', desc: 'Waktu bertambah' }].map(m => (
              <button key={m.id} onClick={() => upd('mode', m.id)}
                className={`cursor-pointer active:scale-[0.99] p-3 rounded-xl border-2 text-left font-black text-xs transition-all ${
                  localTimer.mode === m.id
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                }`}>
                {m.label}<br/><span className="font-medium text-[10px] text-slate-400 dark:text-slate-500">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Waktu Awal (detik)</label>
            <input type="number" value={localTimer.initialSeconds}
              onChange={e => upd('initialSeconds', Number(e.target.value))}
              className="w-full p-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500">{formatSeconds(localTimer.initialSeconds)}</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Batas Maks (kosong=∞)</label>
            <input type="number" value={localTimer.maxSeconds ?? ''} placeholder="∞"
              onChange={e => upd('maxSeconds', e.target.value === '' ? null : Number(e.target.value))}
              className="w-full p-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
            {localTimer.maxSeconds && <p className="text-[10px] text-slate-400 dark:text-slate-500">{formatSeconds(localTimer.maxSeconds)}</p>}
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-black text-slate-700 dark:text-slate-200 text-sm">Auto Tambah Waktu dari Donasi</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Waktu otomatis bertambah saat ada donasi</p>
            </div>
            <button
              onClick={() => upd('autoAddEnabled', !localTimer.autoAddEnabled)}
              className={`relative inline-flex h-7 w-14 items-center rounded-xl transition-colors duration-300 cursor-pointer ${localTimer.autoAddEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
              <span className={`inline-block h-5 w-5 transform rounded-xl bg-white shadow-md transition-transform duration-300 ${localTimer.autoAddEnabled ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
          </div>

          {localTimer.autoAddEnabled && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-slate-700 dark:text-slate-200 text-sm">Kelipatan Durasi Donasi</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                    Setiap tier donasi tambah durasi otomatis
                  </p>
                </div>
                {/* Tombol Edit Tabel */}
                <button
                  onClick={() => setShowTiersTable(!showTiersTable)}
                  className="cursor-pointer active:scale-[0.99] px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-black hover:bg-blue-200 dark:hover:bg-blue-800 transition-all">
                  {showTiersTable ? 'Tutup' : 'Edit'}
                </button>
              </div>

              {/* **PREVIEW Tiers** */}
              <div className="grid grid-cols-2 md:flex flex-wrap gap-2">
                {(localTimer.durationTiers || []).length === 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Belum ada tier</p>
                )}
                {(localTimer.durationTiers || []).map((tier, i) => {
                  const totalSec = (tier.hours * 3600) + (tier.minutes * 60) + tier.seconds;
                  return (
                    <div key={i} className="w-full justify-between md:w-max flex items-center gap-1.5 px-3 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="font-black text-blue-600 dark:text-blue-400 text-xs">
                        Rp {tier.amount.toLocaleString('id-ID')}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600 text-xs">→</span>
                      <span className="font-black text-green-600 dark:text-green-400 text-xs font-mono">
                        {formatSeconds(totalSec)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* **EDIT Tabel (toggle)** */}
              <AnimatePresence>
                {showTiersTable && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex-1">
                        Tambah Tier Baru
                      </p>
                      <button
                        onClick={() => setShowTiersTable(false)}
                        className="text-xs font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        Tutup ×
                      </button>
                    </div>

                    {/* Form Tambah Tier Baru */}
                    <TierForm 
                      onAdd={(newTier) => {
                        upd('durationTiers', [...(localTimer.durationTiers || []), newTier]);
                      }}
                    />

                    {/* Daftar Tier Existing */}
                    {(localTimer.durationTiers || []).map((tier, i) => (
                      <TierForm
                        key={i}
                        tier={tier}
                        index={i}
                        isEditing={true}
                        onChange={(updatedTier) => {
                          const tiers = [...(localTimer.durationTiers || [])];
                          tiers[i] = updatedTier;
                          upd('durationTiers', tiers);
                        }}
                        onRemove={(index) => {
                          const tiers = localTimer.durationTiers || [];
                          upd('durationTiers', tiers.filter((_, i) => i !== index));
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {overlayToken && (
          <div className="md:mt-0 mt-8 rounded-xl space-y-3">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Widget URL OBS</p>

            {/* Color pickers */}
            <div className="md:flex gap-1.5 w-full">
              {[
                { label: 'Warna Timer', value: subTimerColor, onChange: setSubTimerColor, default: 'ffffff' },
                { label: 'Warna Overlay', value: subBgColor, onChange: setSubBgColor, default: '0f0f19' },
                { label: 'Warna Label', value: subLabelColor, onChange: setSubLabelColor, default: 'ffffff' },
              ].map(({ label, value, onChange, default: def }) => (
                <div key={label} className="w-full md:w-max flex items-center md:mb-0 mb-2.5 gap-2 px-3 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <input
                    type="color"
                    value={`#${value}`}
                    onChange={e => onChange(e.target.value.replace('#', ''))}
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent flex-shrink-0"
                  />
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400 flex-1">#{value}</span>
                  <span className="text-[10px] ml-5 font-black text-slate-400 dark:text-slate-500 uppercase whitespace-nowrap">{label}</span>
                  {/* <button onClick={() => onChange(def)} className="text-[10px] font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all flex-shrink-0">↺</button> */}
                </div>
              ))}
            </div>

            {/* ─── PREVIEW SUBATHON ─── */}
            <div className="space-y-2 md:mt-0 mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           {[
              {
                key: 'subath1',
                label: 'Subath 1',
                Component: Subath1,
                scale: 'scale-[1.16] md:scale-[1]',  // ← custom scale
                props: {
                  timer: { ...localTimer, title: localTimer.title || 'Subathon Timer' },
                  displaySeconds,
                  timerColor: subTimerColor,
                  bgColor: subBgColor,
                  labelColor: subLabelColor
                }
              },
              {
                key: 'subath2',
                label: 'Subath 2',
                Component: Subath2,
                scale: 'scale-[0.93] md:scale-[1]',    // ← scale lama
                props: {
                  displaySeconds,
                  isRunning: localTimer.isRunning,
                  timerColor: subTimerColor,
                  bgColor: subBgColor,
                  labelColor: subLabelColor
                }
              },
            ].map(({ key, label, Component, props, scale }) => (
              <div key={key} className="space-y-1">
                <p className="text-[10px] mb-2.5 font-black text-slate-400 uppercase tracking-widest text-left">{label}</p>
                <div className="bg-slate-500/20 min-h-[250px] py-10 rounded-xl overflow-hidden relative flex justify-center items-center">
                  <div className={`flex justify-center items-center ${scale}`}>
                    <Component {...props} />
                  </div>
                </div>
              </div>
            ))}
              </div>
            </div>
            {/* ─── END PREVIEW ─── */}

            {['subath1', 'subath2'].map(t => (
              <div key={t} className="w-full justify-between flex gap-2 items-center bg-slate-500/20 px-3 p-2 rounded-xl">
                <div className='flex items-center w-full'>
                  <span className="text-[12px] font-black text-slate-400 w-14 flex-shrink-0">{t === 'subath1' ? 'Subath 1' : 'Subath 2'}</span>
                  <input readOnly
                    value={`${window.location.origin}/widget/${overlayToken}/subathon?theme=${t}&timercolor=${subTimerColor}&bgcolor=${subBgColor}&labelcolor=${subLabelColor}`}
                    className="flex-1 max-w-[70%] truncate bg-transparent font-mono text-[12px] text-blue-600 dark:text-blue-400 font-bold outline-none" />
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/widget/${overlayToken}/subathon?theme=${t}&timercolor=${subTimerColor}&bgcolor=${subBgColor}&labelcolor=${subLabelColor}`);
                    setSubCopied(prev => ({ ...prev, [t]: true }));
                    setTimeout(() => setSubCopied(prev => ({ ...prev, [t]: false })), 500);
                  }}
                  className={`cursor-pointer active:scale-[0.98] px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 flex-shrink-0 ${
                    subCopied[t] ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}>
                  {subCopied[t] ? <><CheckCircle2 size={12} /> Tersalin!</> : 'Salin'}
                </button>
              </div>
            ))}
          </div>
        )}

        <button onClick={save} disabled={configMutation.isPending}
          className={`cursor-pointer active:scale-[0.99] w-full py-3 md:py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
            saved ? 'bg-green-500 text-white' : 'bg-slate-900 dark:bg-slate-100 hover:bg-blue-600 dark:hover:bg-blue-500 text-white dark:text-slate-900 dark:hover:text-white'
          } disabled:opacity-70`}>
          {saved ? <><CheckCircle2 size={16} /> Tersimpan!</> : configMutation.isPending ? 'Menyimpan...' : <><Save size={16} /> Simpan Konfigurasi</>}
        </button>
      </div>
    </div>
  );
};

// ─── LeaderboardSettings ──────────────────────────────────────────────────────

export const LeaderboardSettings = ({ overlayToken }) => {
  const queryClient = useQueryClient();
  const [local, setLocal] = useState(null);
  const [saved, setSaved] = useState(false);
  const [lbCopied, setLbCopied] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['profile'], queryFn: fetchProfile });

  useEffect(() => {
    if (data && !local) {
      const s = data.settings || data.overlaySetting || {};
      setLocal({
        leaderboardShowAmount: s.leaderboardShowAmount !== false,
        leaderboardLimit: s.leaderboardLimit || 10,
        leaderboardPeriod: s.leaderboardPeriod || 'alltime',
      });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: saveSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (e) => alert(e.response?.data?.message || 'Gagal simpan'),
  });

  const upd = (k, v) => setLocal(s => ({ ...s, [k]: v }));

  if (isLoading || !local) return <div className="text-slate-400 dark:text-slate-500 text-sm animate-pulse py-3 md:py-4">Memuat...</div>;

  return (
    <div className="space-y-5">
      <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-100 dark:border-slate-800 rounded-xl p-4 md:p-5 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #6366f1 0%, transparent 50%)' }} />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-4">
              <div className="bg-rose-500 p-3 rounded-xl text-white shadow-lg">
                  <Milestone size={20} />
              </div>
              <div>
                  <h3 className="md:capitalize text-sm uppercase md:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                      Leaderboard
                  </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 md:p-6">
        <div className="flex items-center gap-3 mb-5">
          <Trophy size={20} className="text-amber-400" />
          <span className="font-black text-slate-900 dark:text-slate-100 text-sm md:capitalize uppercase">Preview Leaderboard</span>
        </div>
        <div className="space-y-2">
          {[
            { rank: 1, name: 'Sultan Ganteng', amount: 500000, count: 12 },
            { rank: 2, name: 'Budi Gacor',     amount: 250000, count: 7  },
            { rank: 3, name: 'Anonymous',       amount: 100000, count: 3  },
          ].slice(0, Math.min(local.leaderboardLimit, 3)).map((d, i) => (
            <div key={i} className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl px-2 md:px-4 py-2.5">
              <span className="text-lg w-8 text-center">{['🥇','🥈','🥉'][i]}</span>
              <span className="flex-1 text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{d.name}</span>
              {local.leaderboardShowAmount && (
                <span className="font-black text-slate-900 dark:text-slate-100 text-sm">Rp {d.amount.toLocaleString('id-ID')}</span>
              )}
              <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">{d.count}x</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pengaturan */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 space-y-5">

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Periode Leaderboard</label>
          <div className="grid md:grid-cols-2 gap-3 pt-1">
            {[
              { id: 'alltime', label: '⏳ Semua Waktu', desc: 'Total donasi sejak awal' },
              { id: 'today',   label: '📅 Hari Ini',    desc: 'Donasi hari ini saja' },
            ].map(p => (
              <button key={p.id} onClick={() => upd('leaderboardPeriod', p.id)}
                className={`cursor-pointer active:scale-[0.99] p-4 rounded-xl border-2 text-left font-black text-xs transition-all ${
                  local.leaderboardPeriod === p.id
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                }`}>
                {p.label}<br/>
                <span className="font-medium text-[10px] text-slate-400 dark:text-slate-500">{p.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Jumlah Donatur Ditampilkan</label>
            <span className="font-black text-blue-600 dark:text-blue-400 text-sm">Top {local.leaderboardLimit}</span>
          </div>
          <input
            type="range" min={3} max={20} step={1} value={local.leaderboardLimit}
            onChange={e => upd('leaderboardLimit', Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold">
            <span>Top 3</span><span>Top 10</span><span>Top 20</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
          <div>
            <p className="font-black text-slate-700 dark:text-slate-200 text-sm">Tampilkan Nominal Donasi</p>
            <p className="text-[11px] md:flex hidden text-slate-400 dark:text-slate-500 font-medium mt-0.5">Sembunyikan jika tidak ingin nominal terlihat publik</p>
          </div>
          <button
            onClick={() => upd('leaderboardShowAmount', !local.leaderboardShowAmount)}
            className={`relative inline-flex h-7 w-14 items-center rounded-xl transition-colors duration-300 cursor-pointer ${local.leaderboardShowAmount ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
            <span className={`inline-block h-5 w-5 transform rounded-xl bg-white shadow-md transition-transform duration-300 ${local.leaderboardShowAmount ? 'translate-x-8' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 rounded-xl p-4 text-xs text-amber-700 dark:text-amber-400 font-medium">
          💡 Pengaturan ini memengaruhi widget OBS
        </div>

        {overlayToken && (
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Widget URL untuk OBS (420×300px)</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={`${window.location.origin}/widget/${overlayToken}/leaderboard`}
                className="flex-1 bg-transparent font-mono text-xs text-blue-600 dark:text-blue-400 font-bold outline-none truncate"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/widget/${overlayToken}/leaderboard`);
                  setLbCopied(true);
                  setTimeout(() => setLbCopied(false), 500);
                }}
                className={`cursor-pointer active:scale-[0.99] cursor-pointer active:scale-[0.98] px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  lbCopied ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}>
                {lbCopied ? <><CheckCircle2 size={12} /> Tersalin!</> : 'Salin'}
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => saveMutation.mutate(local)}
          disabled={saveMutation.isPending}
          className={`cursor-pointer active:scale-[0.99] w-full py-3 md:py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
            saved ? 'bg-green-500 text-white' : 'bg-slate-900 dark:bg-slate-100 hover:bg-blue-600 dark:hover:bg-blue-500 text-white dark:text-slate-900 dark:hover:text-white'
          } disabled:opacity-70`}>
          {saved ? <><CheckCircle2 size={16} /> Tersimpan!</> : saveMutation.isPending ? 'Menyimpan...' : <><Save size={16} /> Simpan Pengaturan Leaderboard</>}
        </button>
      </div>
    </div>
  );
};

// ─── TierForm Component ────────────────────────────────────────────────────────
const TierForm = ({ 
  tier, 
  onChange, 
  onAdd, 
  onRemove, 
  index,
  isEditing = false 
}) => {
  const [amount, setAmount] = useState(tier?.amount || '');
  const [hours, setHours] = useState(tier?.hours || '');
  const [minutes, setMinutes] = useState(tier?.minutes || '1');
  const [seconds, setSeconds] = useState(tier?.seconds || '');

  useEffect(() => {
    if (tier) {
      setAmount(tier.amount || '');
      setHours(tier.hours || '');
      setMinutes(tier.minutes || '');
      setSeconds(tier.seconds || '');
    }
  }, [tier]);

  const handleChange = (key, value) => {
    const handlers = {
      amount: setAmount,
      hours: setHours,
      minutes: setMinutes,
      seconds: setSeconds
    };
    handlers[key](value);
    onChange?.({ ...tier, [key]: value === '' ? null : Number(value) });
  };

  const handleAdd = () => {
    if (!amount || Number(amount) <= 0) return;
    onAdd({ 
      amount: Number(amount), 
      hours: Number(hours) || 0, 
      minutes: Number(minutes) || 0, 
      seconds: Number(seconds) || 0 
    });
    // Reset form
    setAmount('');
    setHours('');
    setMinutes('1');
    setSeconds('');
  };

  const totalSec = ((Number(hours) || 0) * 3600) + ((Number(minutes) || 0) * 60) + (Number(seconds) || 0);

  return (
    <div className="space-y-3">
      {isEditing && (
        <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border">
          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">
            Tier {index + 1} • {formatSeconds(totalSec)}
          </span>
          <button
            onClick={() => onRemove(index)}
            className="p-1 text-red-500 hover:text-red-700 transition-colors"
            title="Hapus tier"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2">
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={e => handleChange('amount', e.target.value)}
            placeholder="5000"
            className="w-full p-2 bg-white dark:bg-slate-800 border rounded-xl font-bold text-xs focus:border-blue-400 focus:outline-none pr-6"
            min="1"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">Rp</span>
        </div>
        <input
          type="number"
          value={hours}
          onChange={e => handleChange('hours', e.target.value)}
          placeholder="0"
          className="p-2 bg-white dark:bg-slate-800 border rounded-xl font-bold text-xs focus:border-blue-400 focus:outline-none"
          min="0"
        />
        <input
          type="number"
          value={minutes}
          onChange={e => handleChange('minutes', e.target.value)}
          placeholder="1"
          className="p-2 bg-white dark:bg-slate-800 border rounded-xl font-bold text-xs focus:border-blue-400 focus:outline-none"
          min="0"
        />
        <input
          type="number"
          value={seconds}
          onChange={e => handleChange('seconds', e.target.value)}
          placeholder="30"
          className="p-2 bg-white dark:bg-slate-800 border rounded-xl font-bold text-xs focus:border-blue-400 focus:outline-none"
          min="0"
        />
      </div>
      
      <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-400 dark:text-slate-500">
        <span>Donasi</span><span>Jam</span><span>Menit</span><span>Detik</span>
      </div>

      {isEditing ? (
        <div className="text-xs text-center text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-950/30 p-2 rounded-xl">
          {formatSeconds(totalSec)}
        </div>
      ) : (
        <button
          onClick={handleAdd}
          disabled={!amount || Number(amount) <= 0}
          className="w-full py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-xl font-bold text-xs disabled:cursor-not-allowed transition-all"
        >
          Tambah Tier
        </button>
      )}
    </div>
  );
};

// ─── MilestonesManager ────────────────────────────────────────────────────────

export const MilestonesManager = ({ overlayToken }) => {
  const queryClient = useQueryClient();
  const { data: raw, isLoading } = useQuery({ queryKey: ['milestones'], queryFn: fetchMilestones });
  const [local, setLocal] = useState(null);
  const [mlCopied, setMlCopied] = useState(false);
  const [mlColor, setMlColor] = useState('6366f1'); 
  const [mlBgcolor, setMlBgcolor] = useState('0f0f19'); 

  useEffect(() => {
    if (raw && !local) setLocal(Array.isArray(raw) ? raw : []);
  }, [raw]);

  const mutation = useMutation({
    mutationFn: saveMilestones,
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      setLocal(saved);
    },
    onError: (e) => alert(e.response?.data?.message || 'Gagal simpan'),
  });

  const list = local || [];
  const add    = () => setLocal([...list, { title: '', targetAmount: 1000000, order: list.length, period: 'alltime' }]);
  const remove = (i) => setLocal(list.filter((_, idx) => idx !== i));
  const upd    = (i, key, val) => setLocal(list.map((m, idx) => idx === i ? { ...m, [key]: val } : m));

  if (isLoading) return <div className="text-slate-400 dark:text-slate-500 text-sm font-bold animate-pulse py-3 md:py-4">Memuat...</div>;

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {list.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 py-10 text-center">
            <p className="text-3xl mb-2">🎯</p>
            <p className="font-black text-slate-500 dark:text-slate-400 text-sm">Belum ada milestone</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">Tambah target donasi untuk ditampilkan ke donor</p>
          </div>
        )}

        <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-100 dark:border-slate-800 rounded-xl p-4 md:p-5 text-white relative overflow-hidden !mb-5">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #6366f1 0%, transparent 50%)' }} />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-4">
                <div className="bg-purple-500 p-3 rounded-xl text-white shadow-lg">
                    <Milestone size={20} />
                </div>
                <div>
                    <h3 className="md:capitalize text-sm uppercase md:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                        Milestone
                    </h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {list.map((m, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Milestone {i + 1}</span>
              <button
                onClick={() => remove(i)}
                className="cursor-pointer relative top-[-2px] p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Judul</label>
                <input
                  value={m.title}
                  onChange={e => upd(i, 'title', e.target.value)}
                  placeholder="contoh: Beli mic baru!"
                  className="w-full p-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-green-400 dark:focus:border-green-500 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Target (Rp)</label>
                <input
                  type="number"
                  value={m.targetAmount}
                  onChange={e => upd(i, 'targetAmount', Number(e.target.value))}
                  className="w-full p-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-green-400 dark:focus:border-green-500 transition-all text-slate-800 dark:text-slate-100"
                />
              </div>
              {/* Tambah di dalam grid form milestone, setelah input targetAmount */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Periode Penghitungan Donasi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'alltime',   label: '⏳ Semua Waktu', desc: 'Total sejak awal' },
                    { id: 'today',     label: '📅 Hari Ini',    desc: 'Donasi hari ini' },
                    { id: 'thismonth', label: '📆 Bulan Ini',   desc: 'Donasi bulan ini' },
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => upd(i, 'period', p.id)}
                      className={`cursor-pointer active:scale-[0.99] p-3 rounded-xl border-2 text-left font-black text-xs transition-all ${
                        (m.period || 'alltime') === p.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300'
                          : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {p.label}
                      <br/>
                      <span className="font-medium text-[10px] text-slate-400 dark:text-slate-500">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-black text-slate-400 dark:text-slate-500">
                <span>Progress (preview)</span>
                <span>0 / Rp {Number(m.targetAmount || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden">
                <div className="h-full bg-green-400 rounded-xl" style={{ width: '0%' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className='md:w-full w-[100vw] p-5 mx-auto space-y-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800'>
        <button
          onClick={add}
          className="cursor-pointer active:scale-[0.99] w-full py-3 border-2 border-dashed border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 rounded-xl font-black text-sm hover:border-green-400 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 transition-all flex items-center justify-center gap-2">
          <Plus size={16} /> Tambah Milestone
        </button>

        {list.length > 0 && (
          <button
            onClick={() => mutation.mutate(list)}
            disabled={mutation.isPending}
            className="cursor-pointer active:scale-[0.99] w-full py-3 md:py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70">
            <Save size={16} /> {mutation.isPending ? 'Menyimpan...' : 'Simpan Milestone'}
          </button>
        )}

        {overlayToken && (
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Widget URL OBS</p>
            {/* Color pickers */}
              <div className="space-y-2 md:flex gap-1.5 w-full">
                {[
                  { label: 'Warna Progres', value: mlColor, onChange: setMlColor, default: '6366f1' },
                  { label: 'Warna Overlay',  value: mlBgcolor, onChange: setMlBgcolor, default: '0f0f19' },
                ].map(({ label, value, onChange, default: def }) => (
                  <div key={label} className="w-full md:w-max flex items-center md:mb-0 mb-2.5 gap-3 px-3 py-2.5 bg-slate-500/20 rounded-xl border border-slate-200 dark:border-slate-700">
                    <input
                      type="color"
                      value={`#${value}`}
                      onChange={e => onChange(e.target.value.replace('#', ''))}
                      className="w-10 h-7 rounded cursor-pointer border-0 bg-transparent flex-shrink-0"
                    />
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400 flex-1">#{value}</span>
                    <label className="text-[10px] ml-4 min-w-max font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest w-16 flex-shrink-0">{label}</label>
                  </div>
                ))}
              </div>

              {/* ─── PREVIEW MILES ─── */}
              {list.length > 0 && (
                <div className="space-y-2 mt-3">
                  {/* <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Preview</p> */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { key: 'miles1', label: 'Miles 1', Component: Miles1, props: { displayList: list.slice(0, 3), totalDonation: 0, activeIdx: 0, color: mlColor, bgcolor: mlBgcolor } },
                      { key: 'miles2', label: 'Miles 2', Component: Miles2, props: { displayList: list.slice(0, 2), totalDonation: 0, color: mlColor, bgcolor: mlBgcolor } },
                    ].map(({ key, label, Component, props }) => (
                      <div key={key} className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">{label}</p>
                        <div
                          className="bg-slate-500/20 h-max md:min-h-[300px] py-10 rounded-xl overflow-hidden relative flex justify-center items-center"
                        >
                          <div 
                            className='flex justify-center items-center scale-[0.55] md:scale-[0.8] 2xl: 2xl:scale-[]scale-[1]'>
                            <Component {...props} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className="space-y-3 mt-8">
              {['miles1', 'miles2'].map(t => (
                <div key={t} className="flex gap-2 items-center bg-slate-500/20 px-4 p-2 rounded-xl">
                  <span className="text-[12px] font-black text-slate-400 w-14 flex-shrink-0">{t === 'miles1' ? 'Miles 1' : 'Miles 2'}</span>
                  <input
                    readOnly
                    value={`${window.location.origin}/widget/${overlayToken}/milestones?theme=${t}&color=${mlColor}&bgcolor=${mlBgcolor}`}
                    className="flex-1 bg-transparent font-mono text-[12px] text-blue-600 dark:text-blue-400 font-bold outline-none truncate"
                  />
                 <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/widget/${overlayToken}/milestones?theme=${t}&color=${mlColor}&bgcolor=${mlBgcolor}`);
                      setMlCopied(prev => ({ ...prev, [t]: true }));
                      setTimeout(() => setMlCopied(prev => ({ ...prev, [t]: false })), 500);
                    }}
                    className={`cursor-pointer active:scale-[0.98] px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 flex-shrink-0 ${
                      mlCopied[t] ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}>
                    {mlCopied[t] ? <><CheckCircle2 size={12} /> Tersalin!</> : 'Salin'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};