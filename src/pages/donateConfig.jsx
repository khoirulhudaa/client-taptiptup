import { useState } from 'react';
import { Heart, Save, Trophy, Sparkles, History, HandCoins } from 'lucide-react';
import { motion } from 'framer-motion';

const DonatePageConfig = ({ settings, upd, saveSettingsMutation, activeSlot }) => {
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
    </motion.div>
  );
};

export default DonatePageConfig;