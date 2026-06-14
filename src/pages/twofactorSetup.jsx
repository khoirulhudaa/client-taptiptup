import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2, Shield, ShieldCheck, ShieldOff,
  Smartphone, X, Loader2, Copy, Check, AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useState } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const fetch2FAStatus = async () =>
  (await axios.get(`${BASE_URL}/api/midtrans/2fa-status`, { headers: authHeader() })).data;

const enable2FA = async () =>
  (await axios.post(`${BASE_URL}/api/midtrans/enable-2fa`, {}, { headers: authHeader() })).data;

// ─── QR Code Modal ──────────────────────────────────────────────────────────
const QRModal = ({ isOpen, onClose, qrCodeUrl, secret, onSuccess }) => {
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(1); // 1 = scan, 2 = verify
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verify2FA = async (code) =>
    (await axios.post(`${BASE_URL}/api/midtrans/verify-2fa`, { totpCode: code }, { headers: authHeader() })).data;

  // Di dalam handleVerify:
  const handleVerify = async () => {
    if (verifyCode.length !== 6) {
      setError('Masukkan 6 digit kode dari Google Authenticator');
      return;
    }
    setIsVerifying(true);
    setError('');

    try {
      await verify2FA(verifyCode); // ← hit endpoint verify
      setIsDone(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Kode salah. Pastikan waktu di HP sudah benar.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setVerifyCode('');
    setError('');
    setIsDone(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-lg shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 flex items-center justify-center">
                <Shield size={16} className="text-white" />
              </div>
              <p className="font-black text-slate-800 dark:text-slate-100 text-sm">
                Google Authenticator
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex border-b border-slate-100 dark:border-slate-800">
            {['Scan QR', 'Verifikasi'].map((label, i) => (
              <button
                key={i}
                onClick={() => !isDone && setStep(i + 1)}
                className={`flex-1 py-3 text-xs font-black transition-all cursor-pointer ${
                  step === i + 1
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {i + 1}. {label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Done State */}
            {isDone ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center"
              >
                <div className="w-16 h-16 bg-green-50 dark:bg-green-950/40 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <p className="font-black text-slate-800 dark:text-slate-100 text-base">
                  Google Authenticator Aktif!
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                  Sekarang kamu bisa menggunakan kode 6 digit untuk penarikan dana.
                </p>
              </motion.div>
            ) : step === 1 ? (
              /* Step 1: QR Code */
              <div className="space-y-5">
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Scan QR ini dengan Google Authenticator
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Buka aplikasi → Tambah akun → Scan kode QR
                  </p>
                </div>

                {/* QR Code */}
                {qrCodeUrl ? (
                  <div className="flex justify-center">
                    <div className="p-3 bg-white border-4 border-slate-900 dark:border-slate-100 inline-block">
                      <img
                        src={qrCodeUrl}
                        alt="QR Code 2FA"
                        className="w-44 h-44 object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-44 bg-slate-100 dark:bg-slate-800">
                    <Loader2 size={28} className="animate-spin text-slate-400" />
                  </div>
                )}

                {/* Manual Secret */}
                {secret && (
                  <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                      Atau masukkan kode manual
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs font-mono text-slate-700 dark:text-slate-300 break-all leading-relaxed">
                        {secret}
                      </code>
                      <button
                        onClick={handleCopySecret}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-blue-400 transition-all cursor-pointer"
                      >
                        {copied
                          ? <Check size={13} className="text-green-500" />
                          : <Copy size={13} className="text-slate-400" />
                        }
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold text-sm transition-all active:scale-[0.98] cursor-pointer"
                >
                  Sudah Discan → Lanjut Verifikasi
                </button>
              </div>
            ) : (
              /* Step 2: Verify */
              <div className="space-y-5">
                <div className="text-center">
                  <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mx-auto mb-3">
                    <Smartphone size={24} className="text-blue-600" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Masukkan kode dari Google Authenticator
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Kode berganti setiap 30 detik
                  </p>
                </div>

                <input
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  value={verifyCode}
                  onChange={(e) => {
                    setVerifyCode(e.target.value.replace(/[^0-9]/g, ''));
                    setError('');
                  }}
                  placeholder="000000"
                  className="w-full text-center text-4xl tracking-[14px] font-mono py-5 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-none rounded-lg transition-all"
                  autoFocus
                />

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3">
                    <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border border-slate-300 dark:border-slate-700 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    ← Kembali
                  </button>
                  <button
                    onClick={handleVerify}
                    disabled={isVerifying || verifyCode.length !== 6}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isVerifying
                      ? <><Loader2 size={15} className="animate-spin" /> Memverifikasi...</>
                      : <><ShieldCheck size={15} /> Konfirmasi</>
                    }
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const TwoFactorSetup = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [qrData, setQrData] = useState(null);

  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['2fa-status'],
    queryFn: fetch2FAStatus,
  });

  const isEnabled = statusData?.twoFactorEnabled && statusData?.hasSecret;

  const enableMutation = useMutation({
    mutationFn: enable2FA,
    onSuccess: (data) => {
      setQrData(data);
      setShowModal(true);
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Gagal mengaktifkan 2FA');
    },
  });

  const handleActivate = () => {
    if (isEnabled) return; // sudah aktif
    enableMutation.mutate();
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
  };

  return (
    <>
      {/* ── Card ── */}
      <div className={`${isEnabled ? 'hidden' : 'hidden md:block'} bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden`}>
        {/* Top accent */}
        <div className={`h-1 w-full ${isEnabled ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`} />

        <div className="p-4 md:p-6">
          <div className='w-full md:flex items-center justify-between'>
            <div className="flex items-center md:items-start gap-4">
              {/* Icon */}
              <div className={`w-12 h-11 flex-shrink-0 flex items-center justify-center rounded-lg transition-all
                ${isEnabled
                  ? 'bg-green-50 dark:bg-green-800'
                  : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                {isEnabled
                  ? <ShieldCheck size={22} className="text-green-300" />
                  : <ShieldOff size={22} className="text-slate-400 dark:text-slate-500" />
                }
              </div>

              {/* Text */}
              <div className="w-full md:w-max min-w-0">
                <div className="flex items-center justify-between md:justify-normal gap-2 flex-wrap">
                  <p className="font-black text-slate-800 dark:text-slate-100 text-sm">
                    Google Authenticator (2FA)
                  </p>
                  {statusLoading ? (
                    <span className="relative md:top-0 top-2 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-400">
                      <Loader2 size={10} className="animate-spin" /> Memuat...
                    </span>
                  ) : isEnabled ? (
                    <span className="relative md:top-0 top-2 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">
                      <CheckCircle2 size={10} /> Aktif
                    </span>
                  ) : (
                    <span className="relative md:top-0 top-2 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      Belum Aktif
                    </span>
                  )}
                </div>

                <p className="text-slate-500 dark:text-slate-400 md:mt-1 text-xs md:text-sm leading-relaxed">
                  {isEnabled
                    ? 'Akun kamu terlindungi untuk WD.'
                    : 'Wajib diaktifkan untuk WD.'
                  }
                </p>
              </div>
            </div>

            {/* Action */}
            {!isEnabled && !statusLoading && (
              <button
                onClick={handleActivate}
                disabled={enableMutation.isPending}
                className="w-full md:mt-0 mt-4 md:w-max flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-xs transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {enableMutation.isPending ? (
                  <><Loader2 size={16} className="animate-spin" /> Menyiapkan QR Code...</>
                ) : (
                  <><Shield size={16} /> Aktifkan Google Authenticator</>
                )}
              </button>
            )}
          </div>

          {isEnabled && (
            <div className="mt-5 hidden md:flex items-center gap-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 px-4 py-3">
              <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
              <p className="text-xs text-green-700 dark:text-green-400 font-bold">
                Penarikan dana sudah diamankan dengan Google Authenticator
              </p>
            </div>
          )}
        </div>

        <div className={`border-t border-slate-100 ${isEnabled ? 'hidden' : 'hidden md:block'} dark:border-slate-800 px-5 md:px-7 pt-4 pb-2 md:pb-4 md:pt-4 bg-slate-50 dark:bg-slate-800/50`}>
          <div className="md:flex items-start gap-0">
            {[
              'Install Google Authenticator di HP',
              'Klik tombol "Aktifkan" di atas',
              'Scan QR Code yang muncul',
              'Masukkan kode 6 digit untuk konfirmasi',
            ].map((step, i, arr) => (
              <div key={i} className="w-full justify-between flex items-center flex-1 md:mb-0 mb-2">
                <div className="flex items-center justify-between pr-7 text-center flex-1">
                  <div className='w-max flex items-center'>
                    <span className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0 flex items-center justify-center bg-blue-600 text-white text-[10px] md:text-[14px] font-black">
                      {i + 1}
                    </span>
                    <p className="relative top-[-3px] ml-2 text-[10px] md:text-[12px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed px-1">
                      {step}
                    </p>
                  </div>
                  {i < arr.length - 1 && (
                    <span className="text-blue-400 text-xs mb-0  md:flex hidden flex-shrink-0"><ArrowRight size={20} /></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      <QRModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        qrCodeUrl={qrData?.qrCodeUrl}
        secret={qrData?.secret}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default TwoFactorSetup;