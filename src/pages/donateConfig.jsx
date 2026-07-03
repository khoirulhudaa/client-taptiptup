import { useState } from 'react';
import { Heart, Save, Trophy, Sparkles, History, HandCoins, CheckCircle2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const DonatePageConfig = ({ settings, upd, saveSettingsMutation, activeSlot, user }) => {

  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copiedLabel, setCopiedLabel]     = useState('');
  const [copiedUrl, setCopiedUrl]         = useState('');

  const copyToClipboard = (text, label = 'URL') => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text); setCopiedLabel(label); setShowCopyModal(true);
  };

  return (
    <motion.div
      key="donatePageConfig"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 pb-0 w-full"
    >
      <div className="mb-5 bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-100 dark:border-slate-800 rounded-xl p-4 md:p-5 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #6366f1 0%, transparent 50%)' }} />
          <div className="relative flex items-start justify-between gap-4">
          <div>
              <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg">
                  <HandCoins size={20} />
              </div>
              <div>
                  <h3 className="md:capitalize text-sm uppercase md:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                      Halaman donasi
                  </h3>
              </div>
              </div>
          </div>
        </div>
      </div>
      {/* Header */}
      <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-6">

        <div className="space-y-3">

          {/* Toggle: Tampilkan Leaderboard */}
          <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <Trophy size={16} className="text-yellow-500" />
              </div>
              <div>
                <p className="font-black text-slate-700 dark:text-slate-200 text-sm">
                  Peringkat Dukungan
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                  Top donor ditampilkan
                </p>
              </div>
            </div>
            <button
              onClick={() => upd('showLeaderboardOnDonate', !settings.showLeaderboardOnDonate)}
              className={`mt-0 relative inline-flex h-8 md:h-7 w-14 items-center rounded-xl transition-colors duration-300 cursor-pointer focus:outline-none ${
                settings.showLeaderboardOnDonate ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-xl bg-white shadow-md transition-transform duration-300 ${
                settings.showLeaderboardOnDonate ? 'translate-x-8' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center">
                <History size={16} className="text-pink-500" />
                </div>
                <div>
                <p className="font-black text-slate-700 dark:text-slate-200 text-sm">
                  3 Dukungan Terbaru
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                  Daftar pendukung
                </p>
                </div>
            </div>
            <button
                onClick={() => upd('showRecentDonationsOnDonate', !settings.showRecentDonationsOnDonate)}
                className={`mt-0 relative inline-flex h-8 md:h-7 w-14 items-center rounded-xl transition-colors duration-300 cursor-pointer focus:outline-none ${
                settings.showRecentDonationsOnDonate ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
            >
                <span className={`inline-block h-5 w-5 transform rounded-xl bg-white shadow-md transition-transform duration-300 ${
                settings.showRecentDonationsOnDonate ? 'translate-x-8' : 'translate-x-1'
                }`} />
            </button>
            </div>

          {/* Toggle: GIF Recommendation */}
          <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Sparkles size={16} className="text-purple-500" />
              </div>
              <div>
                <p className="font-black text-slate-700 dark:text-slate-200 text-sm">
                  Rekomendasi GIF
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                  4 GIF rekomendasi
                </p>
              </div>
            </div>
            <button
              onClick={() => upd('giphyOnDonate', !settings.giphyOnDonate)}
              className={`mt-0 relative inline-flex h-8 md:h-7 w-14 items-center rounded-xl transition-colors duration-300 cursor-pointer focus:outline-none ${
                settings.giphyOnDonate !== false ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-xl bg-white shadow-md transition-transform duration-300 ${
                settings.giphyOnDonate !== false ? 'translate-x-8' : 'translate-x-1'
              }`} />
            </button>
          </div>

        </div>


        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className='w-[85%]'>
          <p className="text-[10px] font-black text-blue-400 dark:text-white uppercase tracking-widest mb-1">
            Link Donate
          </p>
          <input
            readOnly
            value={`${window.location.origin}/donate/${user.username}`}
            className="flex-1 w-full bg-transparent font-mono text-xs text-blue-600 dark:text-blue-300 font-bold outline-none truncate max-w-[86%]"
            />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => copyToClipboard(`${window.location.origin}/donate/${user.username}`, 'URL OBS Alert')}
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
            cursor-pointer active:scale-[0.99] cursor-pointer active:scale-[0.98] px-3 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-3.5 bg-blue-600 hover:bg-blue-700 text-white`}>
            Salin
          </button>
        </div>
        </div>

        <button
          onClick={() => saveSettingsMutation.mutate({ settings, slot: activeSlot })}
          disabled={saveSettingsMutation.isPending}
          className="
          text-slate-900 dark:text-white 
          bg-slate-100 dark:bg-white/20
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
          cursor-pointer active:scale-[0.99] hover:brightness-90 w-full bg-slate-900/70 dark:bg-slate-700 text-white py-3 md:py-4 rounded-xl font-black text-sm transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-70 flex items-center justify-center gap-3"
        >
          <Save size={20} />
          {saveSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Konfigurasi'}
        </button>
      </div>

      <AnimatePresence>
        {showCopyModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-4" onClick={() => setShowCopyModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-3xl md:max-w-sm max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-500/40" onClick={e => e.stopPropagation()}>
              <div className="py-4 p-6 pb-6 text-center">
                <div className="w-16 h-16 mx-auto mb-6 mt-1 md:mt-2 bg-green-100 dark:bg-blue-950/40 rounded-xl  flex items-center justify-center">
                  <CheckCircle2 size={40} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Berhasil</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6"><span className="font-bold text-blue-600 dark:text-blue-400">{"URL"}</span> sudah selesai disalin</p>
                <button onClick={() => setShowCopyModal(false)} 
                className="
                    text-slate-900 dark:text-white
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
                cursor-pointer hover:brightness-90 w-full py-3 md:py-4 bg-slate-900/70 dark:bg-blue-600 text-white font-black rounded-xl  transition-all active:scale-[0.99]">Tutup sekarang</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default DonatePageConfig;