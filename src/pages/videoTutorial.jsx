import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Play, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const TUTORIALS = [
  {
    id: 'auto',
    title: 'Pasang Alert Otomatis',
    subtitle: 'Via web browser — tanpa OBS manual',
    desc: 'Cara tercepat untuk aktifkan overlay dengan cepat ke OBS',
    emoji: '⚡',
    badge: 'REKOMENDASI',
    badgeColor: 'bg-purple-500',
    videoSrc: '/video1.mp4',
    poster: '/man1.png',
    duration: '35 detik',
    borderActive: 'border-slate-500/40',
  },
  {
    id: 'manual',
    title: 'Pasang Overlay Manual',
    subtitle: 'Konfigurasi OBS step-by-step',
    desc: 'Panduan lengkap menambahkan Browser di OBS Studio',
    emoji: '🎬',
    badge: 'MANUAL',
    badgeColor: 'bg-blue-500',
    videoSrc: '/video2.mp4',
    poster: '/man1.png',
    duration: '75 detik',
    borderActive: 'border-slate-500/40',
  },
];

const VideoModal = ({ tutorial, onClose }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      videoRef.current?.play().catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="video-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ zIndex: 2147483647 }}
        className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
        onClick={onClose}
      >
        <motion.div
          key="video-modal-content"
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-4xl rounded-none overflow-hidden shadow-2xl border border-white/10"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 bg-slate-900 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div>
                <p className="font-black text-white text-sm">{tutorial.title}</p>
                <p className="text-[10px] text-slate-400 font-medium">{tutorial.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer p-2 rounded-none bg-white/10 hover:bg-white/20 text-white transition-colors active:scale-95"
              aria-label="Tutup video"
            >
              <X size={16} />
            </button>
          </div>

          {/* Video player */}
          <div className="relative w-full bg-black" style={{ paddingTop: '56.25%' }}>
            <video
              ref={videoRef}
              src={tutorial.videoSrc}
              poster={tutorial.poster || undefined}
              controls
              playsInline
              className="absolute inset-0 w-full h-full object-contain"
              style={{ background: '#000' }}
            />
          </div>

          {/* Footer */}
          <div className="px-5 py-4 bg-slate-900 border-t border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <p className="text-xs text-slate-400 font-medium leading-relaxed truncate">
                {tutorial.desc}
              </p>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer flex-shrink-0 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-black text-xs rounded-none transition-all active:scale-[0.98]"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export const VideoTutorialSection = () => {
  const [activeModal, setActiveModal] = useState(null);
  const activeTutorial = TUTORIALS.find(t => t.id === activeModal);

  return (
    <>
      <div className="mt-3.5">
        <div className="grid grid-cols-2 gap-2.5">
          {TUTORIALS.map((tut) => (
            <div
              key={tut.id}
              className={`group relative rounded-none border-2 ${tut.borderActive} bg-slate-50 dark:bg-slate-800/60 overflow-hidden transition-all hover:border-opacity-80`}
            >
              {/* Thumbnail — hanya tampil di desktop */}
              <div
                className="hidden md:block relative w-full aspect-video bg-slate-900 overflow-hidden cursor-pointer"
                onClick={() => setActiveModal(tut.id)}
              >
                <video
                  src={tut.videoSrc}
                  poster={tut.poster || undefined}
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-50 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent pointer-events-none" />

                {/* Play button overlay */}
                {/* <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Play size={16} className="text-white relative left-0.5" fill="white" />
                  </div>
                </div> */}

                <div className="absolute bottom-2 right-4 pointer-events-none">
                  <span className="px-2 py-0.5 bg-black/70 text-white text-[9px] font-black rounded-none tracking-wider">
                    {tut.duration}
                  </span>
                </div>
              </div>

              {/* Info — selalu tampil */}
              <div className="p-3 md:p-4 space-y-2">
                <div>
                  <p className="font-black text-xs md:text-sm text-slate-800 dark:text-slate-100 leading-snug">{tut.title}</p>
                  <p className="hidden md:block text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{tut.subtitle}</p>
                </div>

                <button
                  onClick={() => setActiveModal(tut.id)}
                  className="cursor-pointer active:scale-[0.98] w-full py-2 md:py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 border border-white/10 text-white font-black text-[10px] md:text-xs rounded-none flex items-center justify-center gap-1.5 transition-all"
                >
                  <Play size={11} fill="white" className="md:flex hidden" />
                  Tonton Tutorial
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeModal && activeTutorial && (
        <VideoModal
          tutorial={activeTutorial}
          onClose={() => setActiveModal(null)}
        />
      )}
    </>
  );
};