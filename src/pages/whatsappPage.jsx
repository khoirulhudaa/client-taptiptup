// pages/WhatsAppPage.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  QrCode, 
  Loader2 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/axiosInstance';

const fetchWAStatus = async () => (await api.get('/api/wa/status')).data;
const fetchQR = async () => (await api.get('/api/wa/qr')).data;
const reconnectWA = async () => (await api.post('/api/wa/reconnect')).data;

export const WhatsAppPage = () => {
  const queryClient = useQueryClient();
  const [qrImage, setQrImage] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const { data: status, isLoading, refetch } = useQuery({
    queryKey: ['waStatus'],
    queryFn: fetchWAStatus,
    refetchInterval: 10000,
  });

  const reconnectMutation = useMutation({
    mutationFn: reconnectWA,
    onSuccess: () => {
      toast.success('Mencoba reconnect...');
      queryClient.invalidateQueries({ queryKey: ['waStatus'] });
      setTimeout(() => refetch(), 5000);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Gagal reconnect'),
  });

  const loadQR = async () => {
    try {
      const res = await fetchQR();
      if (res.success) {
        setQrImage(res.qrImage);
        setShowQRModal(true);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('Gagal load QR');
    }
  };

  const isReady = status?.isReady;
  const stats = status?.stats || {};

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-6"
    >
      {/* Header Card */}
      <div className={`rounded-none p-6 text-white ${
        isReady 
          ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
          : 'bg-gradient-to-br from-red-500 to-orange-500'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs font-black uppercase tracking-widest mb-1">
              WhatsApp Notification
            </p>
            <h2 className="text-2xl font-black flex items-center gap-2">
              {isReady ? (
                <>
                  <CheckCircle2 size={24} /> Terhubung
                </>
              ) : (
                <>
                  <XCircle size={24} /> Tidak Terhubung
                </>
              )}
            </h2>
            <p className="text-white/70 text-sm font-medium mt-1">
              {isReady 
                ? 'Notifikasi withdrawal akan dikirim otomatis' 
                : 'Scan QR code untuk menghubungkan'}
            </p>
          </div>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isReady ? 'bg-white/20' : 'bg-white/10'
          }`}>
            <MessageCircle size={32} />
          </div>
        </div>
      </div>

      {/* Status Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-none p-5 border border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-400 font-black uppercase mb-1">Status</p>
          <p className={`font-black text-lg ${isReady ? 'text-green-600' : 'text-red-500'}`}>
            {isReady ? '🟢 Online' : '🔴 Offline'}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-none p-5 border border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-400 font-black uppercase mb-1">Pesan Kirim</p>
          <p className="font-black text-lg text-blue-600">
            {stats.sent || 0} / {stats.max || 50}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-none p-5 border border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-400 font-black uppercase mb-1">Sisa Kuota</p>
          <p className="font-black text-lg text-emerald-600">
            {stats.remaining || 50}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-none p-6 border border-slate-100 dark:border-slate-800 space-y-4">
        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
          Pengaturan WhatsApp
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={loadQR}
            disabled={isReady || reconnectMutation.isPending}
            className="flex items-center justify-center gap-3 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-none font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isReady ? (
              <CheckCircle2 size={20} />
            ) : (
              <QrCode size={20} />
            )}
            {isReady ? 'Sudah Terhubung' : 'Lihat QR Code'}
          </button>
          
          <button
            onClick={() => reconnectMutation.mutate()}
            disabled={reconnectMutation.isPending}
            className="flex items-center justify-center gap-3 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-none font-black transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {reconnectMutation.isPending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <RefreshCw size={20} />
            )}
            Reconnect
          </button>
        </div>

        {/* Info */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-none p-4 text-sm">
          <p className="font-medium text-slate-600 dark:text-slate-400">
            ℹ️ Notifikasi akan dikirim ke nomor: <span className="font-black text-blue-600">089513093406</span>
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Setiap ada request penarikan dana, sistem akan otomatis mengirim notifikasi ke WhatsApp admin.
          </p>
        </div>
      </div>

      {/* QR Modal */}
      {showQRModal && qrImage && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-none max-w-sm w-full p-6 text-center">
            <h3 className="text-xl font-black mb-4">Scan QR Code</h3>
            <div className="bg-white p-4 inline-block border-2 border-slate-900">
              <img src={qrImage} alt="QR Code" className="w-[250px] h-[250px]" />
            </div>
            <p className="text-sm text-slate-500 mt-4">
              Buka WhatsApp → Settings → Linked Devices → Link a Device
            </p>
            <button
              onClick={() => { setShowQRModal(false); setQrImage(null); }}
              className="mt-6 w-full py-3 bg-slate-900 text-white rounded-none font-black"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};