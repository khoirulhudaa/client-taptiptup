// components/AudioManager.jsx
import { AnimatePresence, motion } from 'framer-motion';
import { Ear, Music, Pause, Play, Trash2, Upload, Volume2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/axiosInstance';

const AudioManager = ({
  publicSounds = [],
  onUpdatePublicSounds,
}) => {
  const [uploading, setUploading] = useState(false);
  const [playingPreview, setPlayingPreview] = useState(null);
  const [previewError, setPreviewError] = useState(false);
  const audioRef = useRef(null);

  // ── Cleanup on unmount ────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // ── Save ke MongoDB ───────────────────────────────────────────
  // Terima sounds sebagai parameter agar tidak stale
  const saveToServer = async (sounds) => {
    try {
      await api.put('/api/overlay/settings', { publicSounds: sounds });
      toast.success('✅ Suara tersimpan!');
    } catch (err) {
      toast.error('❌ Gagal menyimpan: ' + (err.response?.data?.message || err.message));
    }
  };

  // ── Upload file lokal ke Cloudinary ──────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset input agar file yang sama bisa dipilih lagi
    e.target.value = '';

    if (!file.type.startsWith('audio/')) {
      toast.error('❌ Hanya file audio (.mp3, .wav, .ogg, .m4a)!');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('❌ File terlalu besar! Max 10MB');
      return;
    }
    if (publicSounds.length >= 20) {
      toast.error('❌ Maksimal 20 suara!');
      return;
    }

    try {
      setUploading(true);
      toast.loading('⏳ Mengupload...', { id: 'upload' });

      const formData = new FormData();
      formData.append('audio', file);

      const res = await api.post('/api/overlay/upload-audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });

      toast.dismiss('upload');

      const soundUrl = res.data.url; // URL Cloudinary
      const soundName = file.name.replace(/\.[^/.]+$/, '');

      const newSoundObj = {
        url: soundUrl,
        proxyUrl: soundUrl, // Cloudinary sudah CORS-friendly
        label: soundName,
        emoji: '🎵',
      };

      // Buat array baru dengan sounds terbaru
      const updatedSounds = [...publicSounds, newSoundObj];

      // Update state parent
      onUpdatePublicSounds(updatedSounds);

      // Langsung simpan ke server dengan array terbaru (bukan state yang stale)
      await saveToServer(updatedSounds);

    } catch (err) {
      toast.dismiss('upload');
      console.error('Upload error:', err);
      toast.error('❌ Upload gagal: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  // ── Hapus suara ───────────────────────────────────────────────
  const removeSound = async (index) => {
    const updated = publicSounds.filter((_, i) => i !== index);
    onUpdatePublicSounds(updated);
    await saveToServer(updated);
  };

  // ── Preview audio ─────────────────────────────────────────────
  const playPreview = useCallback((url) => {
    if (!url || !audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current.src = url;
    setPreviewError(false);

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setPlayingPreview(url))
        .catch(() => setPreviewError(true));
    } else {
      setPlayingPreview(url);
    }

    audioRef.current.onended = () => setPlayingPreview(null);
    audioRef.current.onerror = () => {
      setPlayingPreview(null);
      setPreviewError(true);
    };
  }, []);

  const stopPreview = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlayingPreview(null);
    setPreviewError(false);
  }, []);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="rounded-none bg-white dark:bg-slate-900 shadow-sm">
        <div className="pt-1">
          <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
            📁 Upload File Audio
          </label>
          <div className="relative">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className={`flex items-center gap-3 p-4 border-2 border-dashed rounded-none transition-all cursor-pointer
              border-slate-200 dark:border-slate-700 hover:border-blue-300 bg-white dark:bg-slate-800
              ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Upload size={18} className="text-blue-500" />
              <div className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                  {uploading ? 'Mengupload...' : 'Pilih file audio (.mp3, .wav, .ogg)'}
                </span>
                <span className="text-xs text-slate-400">Max 10MB · Langsung tersimpan</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daftar Suara */}
      {publicSounds.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-black text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Music /> Suara Aktif ({publicSounds.length}/20)
            </h4>
            {playingPreview && (
              <button
                onClick={stopPreview}
                className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-none text-sm font-bold shadow-md active:scale-[0.98] transition-all"
              >
                Stop
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto rounded-none border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-900/30">
            {publicSounds.map((sound, index) => (
              <motion.div
                key={`${sound.url}-${index}`}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group flex items-center justify-between p-4 bg-white/80 dark:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50 rounded-none hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-none flex items-center justify-center shadow-lg flex-shrink-0">
                    <Ear className="text-white" size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-base text-slate-800 dark:text-slate-100 truncate">
                      {sound.label || `Suara ${index + 1}`}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate max-w-[220px] bg-slate-100/50 dark:bg-slate-900/50 px-2 py-0.5 rounded">
                      {(() => {
                        try { return new URL(sound.url).hostname; }
                        catch { return 'local'; }
                      })()}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      playingPreview === sound.url ? stopPreview() : playPreview(sound.url)
                    }
                    className={`p-3 h-[40px] cursor-pointer rounded-none active:scale-[0.95] transition-all flex-shrink-0 flex items-center justify-center ${
                      playingPreview === sound.url
                        ? 'bg-emerald-500 text-white'
                        : previewError
                          ? 'text-red-500 border-2 border-red-200 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:brightness-90'
                    }`}
                    title={previewError ? 'Audio tidak bisa diputar' : 'Preview suara'}
                    disabled={previewError && playingPreview !== sound.url}
                  >
                    {playingPreview === sound.url ? <Pause size={18} /> : previewError ? <Volume2 size={18} /> : <Play size={18} />}
                  </button>
                </div>

                <button
                  onClick={() => removeSound(index)}
                  className="p-3 ml-3 h-[40px] cursor-pointer hover:brightness-90 text-red-500 rounded-none active:scale-[0.95] transition-all flex-shrink-0"
                  title="Hapus suara"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden audio player */}
      <audio ref={audioRef} preload="metadata" className="hidden" />

      {/* Preview error toast */}
      <AnimatePresence>
        {previewError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 left-6 z-[1000] bg-red-500 text-white px-6 py-3 rounded-none shadow-2xl font-bold flex items-center gap-3 max-w-sm"
          >
            <Volume2 size={18} />
            <span>Audio tidak bisa diputar</span>
            <button onClick={() => setPreviewError(false)} className="ml-auto text-white/80 hover:text-white">×</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AudioManager;