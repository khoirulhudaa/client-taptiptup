import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

const fmt = (s) =>
  String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.floor(s % 60)).padStart(2, '0');

// ── Waveform bars ────────────────────────────────────────────────────────────

const HEIGHTS = [8, 14, 22, 18, 30, 20, 36, 24, 32, 18, 26, 14, 8, 12, 20, 22, 18, 28, 22, 16, 10, 12];

const AnimatedWaveform = () => (
  <div className="flex items-center justify-center gap-[3px] h-10">
    {HEIGHTS.map((maxH, i) => (
      <motion.div
        key={i}
        animate={{ height: ['4px', `${maxH}px`, '4px'] }}
        transition={{
          duration: 0.3 + (i % 5) * 0.1,
          repeat: Infinity,
          delay: i * 0.04,
          ease: 'easeInOut',
        }}
        style={{ width: 3, borderRadius: 2 }}
        className="bg-red-500 opacity-80"
      />
    ))}
  </div>
);

const StaticWaveform = () => (
  <div className="flex items-center justify-center gap-[3px] h-10">
    {HEIGHTS.map((maxH, i) => (
      <div
        key={i}
        style={{
          width: 3,
          borderRadius: 2,
          height: Math.round(4 + maxH * 0.6),
          opacity: 0.3 + (maxH / 36) * 0.5,
        }}
        className="bg-blue-400 dark:bg-blue-500"
      />
    ))}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

/**
 * VoiceRecorder
 * Props:
 *  - onVoiceReady(url: string | null)
 *  - maxSeconds (default 60)
 *  - disabled
 */
export const VoiceRecorder = ({ onVoiceReady, maxSeconds = 60, disabled = false }) => {
  const [phase, setPhase] = useState('idle'); // idle | recording | preview | uploading | done | error
  const [elapsed, setElapsed] = useState(0);
  const [blobUrl, setBlobUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const blobRef = useRef(null);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    if (blobUrl) URL.revokeObjectURL(blobUrl);
  }, []);

  const startRecording = useCallback(async () => {
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];

      const mimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
      ].find((m) => MediaRecorder.isTypeSupported(m)) || '';

      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        blobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setPhase('preview');
      };

      mr.start(100);
      setPhase('recording');
      setElapsed(0);

      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev + 1 >= maxSeconds) {
            stopRecording();
            return maxSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
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

  const discard = useCallback(() => {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
    }
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    blobRef.current = null;
    setElapsed(0);
    setPhase('idle');
    onVoiceReady(null);
  }, [blobUrl, onVoiceReady]);

  const uploadVoice = useCallback(async () => {
    if (!blobRef.current) return;
    setPhase('uploading');
    setErrorMsg('');
    try {
      const blob = blobRef.current;
      const formData = new FormData();
      const ext = blob.type.includes('ogg') ? 'ogg' : blob.type.includes('mp4') ? 'mp4' : 'webm';
      formData.append('voice', blob, `voice-${Date.now()}.${ext}`);

      const uploadRes = await axios.post(`${BASE_URL}/api/voice/upload`, formData);
      const rawUrl = uploadRes.data.voiceUrl;
      const url = rawUrl?.startsWith('http') ? rawUrl : `${BASE_URL}${rawUrl}`;

      setPhase('done');
      onVoiceReady(url);
    } catch {
      setErrorMsg('Upload gagal. Coba lagi.');
      setPhase('preview');
    }
  }, [onVoiceReady]);

  const pct = (elapsed / maxSeconds) * 100;

  // ── IDLE ──────────────────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <div className="rounded-2xl mt-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="flex flex-col items-center gap-3 py-7 px-6">
          <motion.button
            type="button"
            disabled={disabled}
            onClick={startRecording}
            whileHover={disabled ? {} : { scale: 1.06 }}
            whileTap={disabled ? {} : { scale: 0.97 }}
            className={`w-[72px] h-[72px] rounded-full flex items-center justify-center transition-colors
              ${disabled
                ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed'
                : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 cursor-pointer hover:bg-red-100 dark:hover:bg-red-950/60'
              }`}
            aria-label="Mulai rekam"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke={disabled ? '#94a3b8' : '#ef4444'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="12" rx="3"/>
              <path d="M19 10a7 7 0 0 1-14 0"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
              <line x1="9" y1="22" x2="15" y2="22"/>
            </svg>
          </motion.button>
          <p className={`text-sm font-medium ${disabled ? 'text-slate-300 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300'}`}>
            Rekam pesan suara
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Maks. {fmt(maxSeconds)} 
          </p>
        </div>
      </div>
    );
  }

  // ── RECORDING ─────────────────────────────────────────────────────────────
  if (phase === 'recording') {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="flex flex-col gap-4 p-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-red-500"
              />
              <span className="text-[13px] font-medium text-red-500">Merekam</span>
            </div>
            <span className="text-[13px] tabular-nums text-slate-400">
              {fmt(elapsed)} / {fmt(maxSeconds)}
            </span>
          </div>

          {/* Waveform */}
          <AnimatedWaveform />

          {/* Progress */}
          <div className="h-[3px] rounded-full bg-red-50 dark:bg-red-950/30 overflow-hidden">
            <motion.div
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5, ease: 'linear' }}
              className="h-full rounded-full bg-red-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={stopRecording}
              className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-medium transition-colors active:scale-[0.98]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
              </svg>
              Berhenti
            </button>
            <button
              type="button"
              onClick={discard}
              className="cursor-pointer px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[13px] font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PREVIEW ───────────────────────────────────────────────────────────────
  if (phase === 'preview') {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="flex flex-col gap-3.5 p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium tracking-widest uppercase text-blue-500">
              Preview
            </span>
            <span className="text-xs tabular-nums text-slate-400">{fmt(elapsed)}</span>
          </div>

          <StaticWaveform />

          <audio src={blobUrl} controls className="w-full" style={{ height: 36, outline: 'none' }} />

          {errorMsg && (
            <p className="text-xs text-red-500">{errorMsg}</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={uploadVoice}
              className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-medium transition-colors active:scale-[0.98]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Pakai suara ini
            </button>
            <button
              type="button"
              onClick={discard}
              className="cursor-pointer flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[13px] font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Ulang
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── UPLOADING ─────────────────────────────────────────────────────────────
  if (phase === 'uploading') {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="flex flex-col items-center gap-3 py-7 px-6">
          <div className="w-8 h-8 rounded-full border-2 border-blue-200 dark:border-blue-800 border-t-blue-500 animate-spin" />
          <span className="text-[13px] text-slate-500 dark:text-slate-400">Mengupload suara…</span>
        </div>
      </div>
    );
  }

  // ── DONE ──────────────────────────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden"
      >
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            {/* Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span className="text-[12px] font-medium text-emerald-600 dark:text-emerald-400">
                Voice message siap! ({fmt(elapsed)})
              </span>
            </div>

            <button
              type="button"
              onClick={discard}
              className="cursor-pointer flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-transparent text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:border-red-800 dark:hover:bg-red-950/30 text-[12px] font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
              Hapus
            </button>
          </div>

          <audio src={blobUrl} controls className="w-full" style={{ height: 36, outline: 'none' }} />

          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Akan diputar di overlay streamer saat donasi masuk
          </p>
        </div>
      </motion.div>
    );
  }

  // ── ERROR ─────────────────────────────────────────────────────────────────
  if (phase === 'error') {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 overflow-hidden">
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2 text-[13px] text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            {errorMsg}
          </div>
          <button
            type="button"
            onClick={() => setPhase('idle')}
            className="cursor-pointer self-start px-3.5 py-1.5 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-transparent text-red-500 text-[12px] font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  return null;
};