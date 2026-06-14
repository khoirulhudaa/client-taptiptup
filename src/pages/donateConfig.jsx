import { useState } from 'react';
import { Heart, Save, Trophy, Sparkles, History } from 'lucide-react';
import { motion } from 'framer-motion';

const DonatePageConfig = ({ settings, upd, saveSettingsMutation, activeSlot }) => {
  return (
    <motion.div
      key="donatePageConfig"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 pb-0 w-full"
    >
      {/* Header */}
      <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-lg p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center text-white">
            <Heart size={20} />
          </div>
          <div>
            <h2 className="font-black text-slate-800 dark:text-white text-base">
              Konfigurasi Halaman Donasi
            </h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              Atur tampilan dan fitur yang muncul di halaman donasi viewer
            </p>
          </div>
        </div>

        <div className="space-y-3">

          {/* Toggle: Tampilkan Leaderboard */}
          <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Trophy size={16} className="text-yellow-500" />
              </div>
              <div>
                <p className="font-black text-slate-700 dark:text-slate-200 text-sm">
                  Tampilkan Leaderboard Donasi
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                  Top donor akan tampil di halaman donasi viewer
                </p>
              </div>
            </div>
            <button
              onClick={() => upd('showLeaderboardOnDonate', !settings.showLeaderboardOnDonate)}
              className={`relative inline-flex h-7 w-14 items-center rounded-lg transition-colors duration-300 cursor-pointer focus:outline-none ${
                settings.showLeaderboardOnDonate ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-lg bg-white shadow-md transition-transform duration-300 ${
                settings.showLeaderboardOnDonate ? 'translate-x-8' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                <History size={16} className="text-pink-500" />
                </div>
                <div>
                <p className="font-black text-slate-700 dark:text-slate-200 text-sm">
                    Tampilkan 3 Donasi Terbaru
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                    Daftar donasi terbaru akan tampil di halaman donasi viewer
                </p>
                </div>
            </div>
            <button
                onClick={() => upd('showRecentDonationsOnDonate', !settings.showRecentDonationsOnDonate)}
                className={`relative inline-flex h-7 w-14 items-center rounded-lg transition-colors duration-300 cursor-pointer focus:outline-none ${
                settings.showRecentDonationsOnDonate ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
            >
                <span className={`inline-block h-5 w-5 transform rounded-lg bg-white shadow-md transition-transform duration-300 ${
                settings.showRecentDonationsOnDonate ? 'translate-x-8' : 'translate-x-1'
                }`} />
            </button>
            </div>

          {/* Toggle: GIF Recommendation */}
          <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Sparkles size={16} className="text-purple-500" />
              </div>
              <div>
                <p className="font-black text-slate-700 dark:text-slate-200 text-sm">
                  Rekomendasi GIF Otomatis
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                  Tampilkan 4 GIF Giphy yang cocok saat viewer mengetik pesan
                </p>
              </div>
            </div>
            <button
              onClick={() => upd('giphyOnDonate', !settings.giphyOnDonate)}
              className={`relative inline-flex h-7 w-14 items-center rounded-lg transition-colors duration-300 cursor-pointer focus:outline-none ${
                settings.giphyOnDonate !== false ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-lg bg-white shadow-md transition-transform duration-300 ${
                settings.giphyOnDonate !== false ? 'translate-x-8' : 'translate-x-1'
              }`} />
            </button>
          </div>

        </div>

        <button
          onClick={() => saveSettingsMutation.mutate({ settings, slot: activeSlot })}
          disabled={saveSettingsMutation.isPending}
          className="cursor-pointer active:scale-[0.99] hover:brightness-90 w-full bg-slate-900/70 dark:bg-slate-700 text-white py-3 md:py-4 rounded-lg font-black text-sm transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-70 flex items-center justify-center gap-3"
        >
          <Save size={20} />
          {saveSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Konfigurasi'}
        </button>
      </div>
    </motion.div>
  );
};

export default DonatePageConfig;