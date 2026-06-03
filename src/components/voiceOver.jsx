import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

// Format detik → mm:ss
const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// Waveform visualizer — animasi bar saat recording
const WaveformBars = ({ isRecording }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 32 }}>
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        animate={isRecording ? {
          height: ['6px', `${10 + Math.random() * 20}px`, '6px'],
        } : { height: '4px' }}
        transition={isRecording ? {
          duration: 0.4 + (i % 3) * 0.15,
          repeat: Infinity,
          delay: i * 0.05,
          ease: 'easeInOut',
        } : { duration: 0.2 }}
        style={{
          width: 3,
          background: isRecording ? '#ef4444' : 'rgba(148,163,184,0.4)',
          borderRadius: 0,
          minHeight: 4,
        }}
      />
    ))}
  </div>
);

/**
 * VoiceRecorder
 * Props:
 *  - onVoiceReady(url: string | null) — dipanggil saat URL tersedia atau dihapus
 *  - maxSeconds (default 60)
 *  - disabled
 */
export const VoiceRecorder = ({ onVoiceReady, maxSeconds = 60, disabled = false }) => {
  const [phase, setPhase] = useState('idle'); // idle | recording | preview | uploading | done | error
  const [elapsed, setElapsed] = useState(0);
  const [blobUrl, setBlobUrl] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => () => {
    clearInterval(timerRef.current);
    if (blobUrl) URL.revokeObjectURL(blobUrl);
  }, []);

  const startRecording = useCallback(async () => {
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];

      // Pilih format yang didukung browser
      const mimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
      ].find(m => MediaRecorder.isTypeSupported(m)) || '';

      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setPhase('preview');
      };

      mr.start(100); // collect every 100ms
      setPhase('recording');
      setElapsed(0);

      timerRef.current = setInterval(() => {
        setElapsed(prev => {
          if (prev + 1 >= maxSeconds) {
            stopRecording();
            return maxSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      setErrorMsg('Mikrofon tidak dapat diakses. Pastikan izin sudah diberikan.');
      setPhase('error');
    }
  }, [maxSeconds]);

  const stopRecording = useCallback(() => {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
    }
  }, []);

  const discardRecording = useCallback(() => {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
    }
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    setUploadedUrl(null);
    setElapsed(0);
    setPhase('idle');
    onVoiceReady(null);
  }, [blobUrl, onVoiceReady]);

  const uploadVoice = useCallback(async () => {
    if (!blobUrl) return;
    setPhase('uploading');
    try {
      const res = await fetch(blobUrl);
      const blob = await res.blob();

      const formData = new FormData();
      const ext = blob.type.includes('ogg') ? 'ogg' : blob.type.includes('mp4') ? 'mp4' : 'webm';
      formData.append('voice', blob, `voice-${Date.now()}.${ext}`);

      const uploadRes = await axios.post(`${BASE_URL}/api/voice/upload`, formData);
      const rawUrl = uploadRes.data.voiceUrl;

      // ← FIX: jadikan absolute URL
      const url = rawUrl?.startsWith('http') 
        ? rawUrl 
        : `${BASE_URL}${rawUrl}`;

      console.log('url (absolute):', url);
      setPhase('done');
      onVoiceReady(url);
    } catch (err) {
      setErrorMsg('Upload gagal. Coba lagi.');
      setPhase('preview');
    }
  }, [blobUrl, onVoiceReady]);

  // ── Render ──────────────────────────────────────────────────────────────────

  // IDLE — tombol mulai rekam
  if (phase === 'idle') {
    return (
      <motion.button
        type="button"
        disabled={disabled}
        onClick={startRecording}
        whileTap={{ scale: 0.97 }}
        className={`w-full flex items-center justify-center gap-3 py-4 rounded-none border-2 font-black text-xs transition-all
          ${disabled
            ? 'border-slate-100 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed'
            : 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 cursor-pointer'
          }`}
      >
        <span style={{ fontSize: 12 }}>🎙️</span>
        Rekam Pesan Suara
      </motion.button>
    );
  }

  // RECORDING — animasi + stop button
  if (phase === 'recording') {
    const pct = (elapsed / maxSeconds) * 100;
    return (
      <div className="rounded-none border-2 border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950/30 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ width: 10, height: 10, borderRadius: 0, background: '#ef4444', display: 'inline-block' }}
            />
            <span className="font-black text-sm text-red-600 dark:text-red-400">Merekam...</span>
          </div>
          <span className="font-mono text-sm font-black text-red-600 dark:text-red-400">
            {formatDuration(elapsed)} / {formatDuration(maxSeconds)}
          </span>
        </div>

        <div className="flex items-center justify-center py-1">
          <WaveformBars isRecording={true} />
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-red-100 dark:bg-red-900/40 rounded-none overflow-hidden">
          <motion.div
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: 'linear' }}
            style={{ height: '100%', background: '#ef4444' }}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={stopRecording}
            className="cursor-pointer flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-none font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            ⏹ Berhenti
          </button>
          <button
            type="button"
            onClick={discardRecording}
            className="cursor-pointer px-4 py-2.5 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-none font-black text-sm hover:bg-red-200 active:scale-[0.98] transition-all"
          >
            ✕ Batal
          </button>
        </div>
      </div>
    );
  }

  // PREVIEW — putar ulang + konfirmasi upload atau ulang
  if (phase === 'preview') {
    return (
      <div className="rounded-none border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            Preview Suara
          </span>
          <span className="font-mono text-xs text-slate-400">
            {formatDuration(elapsed)}
          </span>
        </div>

        {/* Audio player native */}
        <audio
          ref={audioRef}
          src={blobUrl}
          controls
          className="w-full"
          style={{ height: 36, outline: 'none' }}
        />

        {errorMsg && (
          <p className="text-xs text-red-500 font-bold">{errorMsg}</p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={uploadVoice}
            className="cursor-pointer flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-none font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            ✓ Pakai Suara Ini
          </button>
          <button
            type="button"
            onClick={discardRecording}
            className="cursor-pointer px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-none font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98] transition-all"
          >
            🔄 Ulang
          </button>
        </div>
      </div>
    );
  }

  // UPLOADING
  if (phase === 'uploading') {
    return (
      <div className="rounded-none border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4 flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
        <span className="text-sm font-black text-blue-600 dark:text-blue-400">Mengupload suara...</span>
      </div>
    );
  }

  // DONE — suara siap
  if (phase === 'done') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-none border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 p-4 space-y-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 text-lg">✅</span>
            <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
              Voice message siap! ({formatDuration(elapsed)})
            </span>
          </div>
          <button
            type="button"
            onClick={discardRecording}
            className="cursor-pointer text-emerald-400 hover:text-red-500 transition-colors text-xs font-black px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            ✕ Hapus
          </button>
        </div>
        <audio src={blobUrl} controls className="w-full" style={{ height: 36 }} />
        <p className="text-[10px] text-emerald-500 dark:text-emerald-500 font-medium">
          Suara ini akan diputar di overlay streamer saat donasi masuk
        </p>
      </motion.div>
    );
  }

  // ERROR state (permission denied etc.)
  if (phase === 'error') {
    return (
      <div className="rounded-none border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4 space-y-2">
        <p className="text-sm font-black text-red-600 dark:text-red-400">⚠️ {errorMsg}</p>
        <button
          type="button"
          onClick={() => setPhase('idle')}
          className="cursor-pointer text-xs font-black text-red-500 underline"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  return null;
};