import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Heart, Home, Share2 } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const DonationSuccess = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const username = searchParams.get('username');

  const handleShare = async () => {
    const donateUrl = username
      ? `${window.location.origin}/donate/${username}`
      : window.location.origin;

    const shareText = username
      ? `💜 Aku baru aja kirim donasi buat @${username}!\n\n` +
        `Kalau kamu juga suka sama kontennya, yuk dukung bareng biar dia makin semangat berkarya! ` +
        `Setiap dukungan sekecil apapun pasti sangat berarti buat mereka 🙌\n\n` +
        `👇 Klik link ini buat donasi sekarang:\n${donateUrl}`
      : `💜 Aku baru aja support streamer favoritku!\n\n` +
        `Yuk dukung creator favoritmu juga. Setiap donasi sekecil apapun sangat berarti ` +
        `dan membantu mereka terus berkarya untuk kita semua 🙌\n\n` +
        `👇 Mulai donasi sekarang:\n${donateUrl}`;

    if (navigator.share) {
      await navigator.share({
        title: username
          ? `Dukung @${username} — Streamer Favoritku! 🎮`
          : 'Dukung Streamer Favoritmu! 🎮',
        text: shareText,
        url: donateUrl,
      });
    } else {
      await navigator.clipboard.writeText(`${shareText}`);
      alert('Link donasi berhasil disalin! 📋');
    }
  };

  const handleBack = () => {
    if (username) {
      navigate(`/donate/${username}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-6 font-sans">

        {/* Floating particles */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              initial={{ y: '110vh', x: `${Math.random() * 100}vw`, opacity: 0 }}
              animate={{ y: '-10vh', opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 4 + Math.random() * 3,
                delay: Math.random() * 3,
                repeat: Infinity,
                repeatDelay: Math.random() * 5,
              }}
            >
              {['💜', '🎉', '✨', '💫', '🌟', '❤️', '🥳', '🎊'][i % 8]}
            </motion.div>
          ))}
        </div>

        <div className="w-full max-w-md relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="bg-white dark:bg-slate-900 rounded-none shadow-2xl overflow-hidden border border-blue-100 dark:border-slate-800"
          >
            {/* Top banner */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-8 text-center relative">
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 15 }}
                className="w-20 h-20 bg-white rounded-none flex items-center justify-center mx-auto shadow-lg"
              >
                <CheckCircle2 size={44} className="text-blue-500" strokeWidth={2.5} />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-2xl font-black text-white"
              >
                Dukungan Berhasil!
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="text-blue-100 text-sm mt-1"
              >
                Pembayaranmu sudah kami terima
                {username && <> · untuk <span className="font-bold">@{username}</span></>}
              </motion.p>
            </div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="p-8 space-y-6"
            >
              {/* Thank you card */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-none p-5 text-center border border-blue-100 dark:border-blue-800">
                <Heart size={28} className="text-blue-500 mx-auto mb-2" strokeWidth={2.5} />
                <p className="text-slate-700 dark:text-slate-200 font-semibold text-base leading-relaxed">
                  Terima kasih sudah mendukung!
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  Dukunganmu sangat berarti dan memotivasi streamer favoritmu untuk terus berkarya.
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleShare}
                  className="cursor-pointer flex items-center justify-center gap-2 py-3 rounded-none border-2 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 font-bold text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                >
                  <Share2 size={16} />
                  Bagikan
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleBack}
                  className="cursor-pointer flex items-center justify-center gap-2 py-3 rounded-none bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all"
                >
                  <Home size={16} />
                  {username ? `@${username}` : 'Beranda'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center text-xs text-gray-400 dark:text-slate-500 mt-4"
          >
            Powered by Midtrans · Transaksi Aman &amp; Terenkripsi 🔒
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default DonationSuccess;