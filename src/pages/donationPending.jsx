import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, Home, RefreshCcw, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from '../hooks/useTheme';

const DonationPending = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const username = searchParams.get('username');
  const [pendingToken, setPendingToken] = useState(null);
  const [pendingUrl, setPendingUrl] = useState(null);
  const [snapReady, setSnapReady] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [checking, setChecking] = useState(false);
  const [modal, setModal] = useState(null); // { type: 'success'|'error'|'info', title, message }

  const showModal = (type, title, message) => setModal({ type, title, message });
  
  useEffect(() => {
    const token = localStorage.getItem('midtrans_pending_token');
    const url = localStorage.getItem('midtrans_pending_url');
    setPendingToken(token);
    setPendingUrl(url);
  }, []);

  useEffect(() => {
    const existing = document.querySelector('script[src*="snap.js"]');
    if (existing) {
      const checkSnap = setInterval(() => {
        if (window.snap) {
          setSnapReady(true);
          clearInterval(checkSnap);
        }
      }, 200);
      return () => clearInterval(checkSnap);
    }

    const script = document.createElement('script');
    script.src =
      import.meta.env.VITE_NODE_ENV === 'production'
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
    script.onload = () => setSnapReady(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const orderId = localStorage.getItem('midtrans_pending_order_id');
    if (!orderId) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/midtrans/status/${orderId}`);
        const data = await res.json();
        if (data.transaction_status === 'settlement') {
          localStorage.removeItem('midtrans_pending_order_id');
          clearPendingStorage();
          navigate(`/donation/success?username=${username}`);
        }
      } catch {}
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const clearPendingStorage = () => {
    localStorage.removeItem('midtrans_pending_token');
    localStorage.removeItem('midtrans_pending_username');
    localStorage.removeItem('midtrans_pending_url');
    setPendingToken(null);
    setPendingUrl(null);
  };

  const handleReopenPayment = () => {
    if (!pendingToken) {
      showModal('error', 'Token tidak ditemukan', 'Token pembayaran tidak ditemukan. Silakan buat dukungan baru.');
      return;
    }

    if (snapReady && window.snap) {
      setReopening(true);
      window.snap.pay(pendingToken, {
        onSuccess: () => {
          clearPendingStorage();
          navigate(`/donation/success?username=${username}`);
        },
        onPending: () => {
          setReopening(false);
        },
        onError: () => {
          clearPendingStorage();
          showModal('error', 'Pembayaran gagal', 'Silakan buat dukungan baru');
          setReopening(false);
        },
        onClose: () => {
          setReopening(false);
        },
      });
    } else if (pendingUrl) {
      // Fallback ke redirect URL kalau Snap tidak load
      window.location.href = pendingUrl;
    } else {
      showModal('info', 'Belum siap', 'Snap belum siap. Coba beberapa detik lagi');
    }
  };

  const steps = [
    {
      icon: '🧾',
      title: 'Invoice dibuat',
      desc: 'Transaksi sudah tercatat di sistem',
      done: true,
    },
    {
      icon: '💳',
      title: 'Menunggu pembayaran',
      desc: 'Selesaikan pembayaran sesuai metode yang dipilih',
      done: false,
    },
    {
      icon: '✅',
      title: 'Konfirmasi otomatis',
      desc: 'Sistem akan memverifikasi pembayaran secara otomatis',
      done: false,
    },
  ];

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-max">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-amber-100 dark:border-slate-800"
          >
            {/* Top banner */}
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 14 }}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                >
                  <Clock size={44} className="text-amber-400" strokeWidth={2.5} />
                </motion.div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-2xl font-black text-white"
              >
                Menunggu Pembayaran
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="text-amber-100 text-sm mt-1"
              >
                Selesaikan pembayaran sebelum waktu habis
                {username && (
                  <> · untuk <span className="font-bold">@{username}</span></>
                )}
              </motion.p>
            </div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="p-8 space-y-6"
            >
              {/* Step tracker */}
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-4 tracking-widest">
                  Status Transaksi
                </p>
                <div className="space-y-3">
                  {steps.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.12 }}
                      className={`flex items-center gap-3 rounded-xl p-4 border-2 transition-all ${
                        step.done
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800'
                          : i === 1
                          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                          : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700'
                      }`}
                    >
                      <div className="relative shrink-0 relative top-[-2px]">
                        <span className="text-xl">{step.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${
                          step.done
                            ? 'text-green-700 dark:text-green-400'
                            : i === 1
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-slate-400 dark:text-slate-600'
                        }`}>
                          {step.title}
                        </p>
                        <p className={`text-xs mt-0.5 ${
                          step.done
                            ? 'text-green-500 dark:text-green-500'
                            : i === 1
                            ? 'text-amber-500 dark:text-amber-500'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}>
                          {step.desc}
                        </p>
                      </div>
                      {step.done && (
                        <span className="text-green-500 font-black text-lg">✓</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Tombol Buka Kembali Pembayaran */}
              {pendingToken && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReopenPayment}
                    disabled={reopening}
                    className="cursor-pointer w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-blue-600 text-white font-black text-sm hover:bg-blue-700 transition-all disabled:opacity-60"
                  >
                    {reopening ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        >
                          <CreditCard size={18} />
                        </motion.div>
                        Membuka Halaman Pembayaran...
                      </>
                    ) : (
                      <>
                        <CreditCard size={18} />
                        Buka Kembali Halaman Pembayaran
                      </>
                    )}
                  </motion.button>
                  <p className="text-center mt-5 text-xs text-gray-400 dark:text-slate-500 mt-2">
                    Lihat BRIVA / QR Code yang belum kamu simpan
                  </p>
                </motion.div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    const orderId = localStorage.getItem('midtrans_pending_order_id');
                    if (!orderId) return showModal('error', 'Order ID tidak ditemukan', 'Coba refresh halaman atau buat dukungan baru');
                    setChecking(true);
                    try {
                      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/midtrans/status/${orderId}`);
                      const data = await res.json();
                      if (data.transaction_status === 'settlement') {
                        localStorage.removeItem('midtrans_pending_order_id');
                        clearPendingStorage();
                        navigate(`/donation/success?username=${username}`);
                      } else {
                        showModal('info', 'Belum terkonfirmasi', 'Pembayaran belum terdeteksi. Tunggu beberapa saat dan coba lagi');
                      }
                    } catch {
                      showModal('error', 'Gagal cek status', 'Terjadi kesalahan saat menghubungi server. Coba lagi');
                    } finally {
                      setChecking(false);
                    }
                  }}
                  disabled={checking}
                  className="cursor-pointer flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                  >
                  {checking
                    ? <><RefreshCcw size={16} className="animate-spin" /> Proses...</>
                    : <><RefreshCcw size={16} /> Cek Status</>}
                </motion.button>                
                <motion.button
                  whileHover={{ scale: 1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => navigate(`/donate/${username}`)}
                  className="cursor-pointer flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                >
                  <RefreshCcw size={16} />
                  Dukungan Baru
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => navigate(username ? `/donate/${username}` : '/')}
                  className="cursor-pointer flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
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
            transition={{ delay: 1.3 }}
            className="text-center text-xs text-gray-400 dark:text-slate-500 mt-4"
          >
            Butuh bantuan? Hubungi dukungan kami 💬
          </motion.p>
        </div>
      </div>

      {modal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setModal(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
          >
            <div className="p-6 flex flex-col items-center text-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                modal.type === 'success' ? 'bg-green-50 dark:bg-green-900/30' :
                modal.type === 'error' ? 'bg-red-50 dark:bg-red-900/30' : 'bg-blue-50 dark:bg-blue-900/30'
              }`}>
                {modal.type === 'success' ? '✅' : modal.type === 'error' ? '❌' : 'ℹ️'}
              </div>
              <p className="font-black text-slate-800 dark:text-slate-100 text-base">{modal.title}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{modal.message}</p>
              <button
                onClick={() => setModal(null)}
                className="mt-1 w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DonationPending;