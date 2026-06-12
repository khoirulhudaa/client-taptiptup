import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowRight, CheckCircle2, Clock, CreditCard, Eye, EyeOff, Loader2, ShieldCheck, Smartphone, Wallet, XCircle, AlertTriangle, List, Grid } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import TwoFactorSetup from './twofactorSetup';

const BASE_URL = import.meta.env.VITE_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const fetchProfile = async () => (await axios.get(`${BASE_URL}/api/overlay/settings`, { headers: authHeader() })).data;
// const postWithdraw = async (d) => (await axios.post(`${BASE_URL}/api/midtrans/withdraw`, d, { headers: authHeader() })).data;

// ─────────────────────────────────────────────────────────────
// API CALLS
// ─────────────────────────────────────────────────────────────
const postWithdraw = async (d) => 
  (await axios.post(`${BASE_URL}/api/midtrans/withdraw`, d, { headers: authHeader() })).data;

// Cek status (jika masih pakai midtransReference)
const checkWithdrawStatus = async (referenceNo) =>
  (await axios.get(`${BASE_URL}/api/midtrans/withdraw/status/${referenceNo}`, { headers: authHeader() })).data;
// Note: Jika backend belum punya endpoint /status/:referenceNo, bisa dihapus atau disesuaikan nanti

const fetchWDHistory = async ({ page = 1 } = {}) =>
  (await axios.get(`${BASE_URL}/api/midtrans/withdraw/history?page=${page}&limit=10`, { headers: authHeader() })).data;

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const formatRupiah = (num) => new Intl.NumberFormat('id-ID').format(Math.round(num));

const STATUS_CONFIG = {
  PENDING: { label: 'Menunggu', icon: <Clock size={13} />, className: 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800' },
  COMPLETED: { label: 'Berhasil', icon: <CheckCircle2 size={13} />, className: 'bg-green-50 text-green-600 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800' },
  FAILED: { label: 'Ditolak', icon: <XCircle size={13} />, className: 'bg-red-50 text-red-500 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800' },
};

const MIN_TARIK = 15000;
const MAX_TARIK = 10000000;
const MIN_SALDO = 15000;
// const FEE_PERCENT = 0.025;
// const ADMIN_FEE = 0;

// ── Alert Modal ──
// ── Alert Modal (Support Success & Error) ──
const AlertModal = ({ modal, onClose }) => {
  if (!modal) return null;

  const isSuccess = modal.type === 'success';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-none shadow-2xl overflow-hidden"
        >
          <div className="p-7 flex flex-col items-center text-center gap-4">
            <div className={`w-14 h-14 flex items-center justify-center rounded-full
              ${isSuccess ? 'bg-green-50 dark:bg-green-950/40' : 'bg-red-50 dark:bg-red-950/40'}`}>
              {isSuccess ? (
                <CheckCircle2 size={28} className="text-green-500" />
              ) : (
                <AlertTriangle size={28} className="text-red-500" />
              )}
            </div>
            
            <div>
              <p className="font-black text-slate-800 dark:text-slate-100 text-base">
                {modal.title}
              </p>
              {modal.message && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {modal.message}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="cursor-pointer w-full py-3 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-black text-sm transition-all active:scale-[0.98]"
            >
              Mengerti
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const WithdrawPage = () => {
  const queryClient = useQueryClient();
  const [method, setMethod] = useState('BANK');
  const [formData, setFormData] = useState({
    amount: '', formattedAmount: '', channelCode: 'BCA', accountNumber: '', accountName: '',
  });
  const [viewMode, setViewMode] = useState('card'); 
  const [historyPage, setHistoryPage] = useState(1);
  const [showBalance, setShowBalance] = useState(() => localStorage.getItem('showBalance') === 'true');

  // === Alert Modal State ===
  const [alertModal, setAlertModal] = useState(null);

  // === Google Authenticator States ===
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTotpModal, setShowTotpModal] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [totpError, setTotpError] = useState('');

  const showAlert = (title, message = '', type = 'error') => {
    setAlertModal({ title, message, type });
  };
  const closeAlert = () => setAlertModal(null);

  // === PIN States ===
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pinAttempts, setPinAttempts] = useState(3);        // ← Tambahan
  const [isLocked, setIsLocked] = useState(false);          // ← Tambahan
  const [lockTimeLeft, setLockTimeLeft] = useState(0);      // ← Tambahan (detik)

  // Simpan data penarikan saat lock
  const [pendingWithdrawData, setPendingWithdrawData] = useState(null);
  const WITHDRAW_DATA_KEY = 'pending_withdraw_data';
  const pinRefs = [useRef(), useRef(), useRef(), useRef()];
  
  // === Persist Lock ke localStorage ===
  const LOCK_KEY = 'withdraw_pin_lock_until';
  
  useEffect(() => {
    const handleStorageChange = () => setShowBalance(localStorage.getItem('showBalance') === 'true');
    window.addEventListener('balanceUpdate', handleStorageChange);
    return () => window.removeEventListener('balanceUpdate', handleStorageChange);
  }, []);

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    refetchInterval: 30000
  });

  const totalWallet      = parseFloat(profileData?.User?.walletBalance    || profileData?.walletBalance    || 0);
  const availableBalance = parseFloat(profileData?.User?.availableBalance || profileData?.availableBalance || 0);
  const pendingBalance   = Math.max(0, totalWallet - availableBalance);

  const { data: historyData, isLoading: historyLoading, refetch: refetchHistory, isFetching: historyFetching } = useQuery({
    queryKey: ['withdrawHistory', historyPage],
    queryFn: () => fetchWDHistory({ page: historyPage }),
    keepPreviousData: true,
    refetchInterval: 30000,
  });

  const withdrawals = historyData?.withdrawals || [];
  const pagination = historyData?.pagination || {};

  const statsPending   = withdrawals.filter(w => w.status === 'PENDING').length;
  const statsCompleted = withdrawals.filter(w => w.status === 'COMPLETED').reduce((sum, w) => sum + Number(w.amount || 0), 0);
  const statsFailed    = withdrawals.filter(w => w.status === 'FAILED').length;

  const withdrawMutation = useMutation({
    mutationFn: postWithdraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawHistory'] });
      setFormData({ amount: '', formattedAmount: '', channelCode: 'BCA', accountNumber: '', accountName: '' });
      setShowTotpModal(false);
      setTotpCode('');
      setTotpError('');
      showAlert('Penarikan Berhasil Diajukan!', 'Admin akan memproses dalam 1×24 jam hari kerja.', 'success');
    },
    onError: (err) => showAlert('Gagal Mengajukan Penarikan', err.response?.data?.message || 'Silakan coba lagi.'),
  });

  // Load lock + data penarikan saat mount
  useEffect(() => {
    // Load Lock
    const lockedUntil = localStorage.getItem(LOCK_KEY);
    if (lockedUntil) {
      const remaining = Math.ceil((new Date(lockedUntil) - new Date()) / 1000);
      if (remaining > 0) {
        setIsLocked(true);
        setLockTimeLeft(remaining);
        setPinAttempts(0);
        setShowPinModal(true);

        // Load data penarikan yang tersimpan
        const savedData = localStorage.getItem(WITHDRAW_DATA_KEY);
        if (savedData) {
          const data = JSON.parse(savedData);
          setPendingWithdrawData(data);
          setFormData(data.formData || formData);
        }
      } else {
        localStorage.removeItem(LOCK_KEY);
        localStorage.removeItem(WITHDRAW_DATA_KEY);
      }
    }
  }, []);

  // Countdown + persist
  useEffect(() => {
    let timer;
    if (isLocked && lockTimeLeft > 0) {
      timer = setInterval(() => {
        setLockTimeLeft(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setIsLocked(false);
            setPinAttempts(3);
            setPinError("");
            localStorage.removeItem(LOCK_KEY);
            localStorage.removeItem(WITHDRAW_DATA_KEY);
            return 0;
          }
          const expireTime = new Date(Date.now() + newTime * 1000).toISOString();
          localStorage.setItem(LOCK_KEY, expireTime);
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLocked, lockTimeLeft]);
  
  const WITHDRAW_FEE = 3000;
  const amt = parseFloat(pendingWithdrawData?.amount || formData.amount) || 0;
  const netAmount = Math.max(0, amt - WITHDRAW_FEE);

  const handlePinInput = (index, value) => {
    if (isLocked) return;
    if (!/^\d?$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setPinError("");
    if (value && index < 3) pinRefs[index + 1].current?.focus();
  };

  const ConfirmWithdrawModal = ({ isOpen, onClose, onConfirm, formData, netAmount, method }) => {
    if (!isOpen) return null;

    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[999998] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-slate-900 w-[99%] md:max-w-lg rounded-none shadow-2xl overflow-hidden"
          >
            <div className="p-4 md:p-8 text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center rounded-full">
                <AlertTriangle size={32} className="text-blue-600" />
              </div>

              <div>
                <p className="font-bold text-xl text-slate-800 dark:text-slate-100">Konfirmasi Penarikan</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Pastikan data berikut sudah benar
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-5 text-left rounded-none space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Metode</span>
                  <span className="font-bold">{method === 'BANK' ? 'Transfer Bank' : 'E-Wallet DANA'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tujuan</span>
                  <span className="font-medium text-right">
                    {formData.channelCode} • {formData.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Pemilik</span>
                  <span className="font-medium">{formData.accountName}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-emerald-600">
                  <span>Yang diterima</span>
                  <span>Rp {formatRupiah(netAmount)}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="cursor-pointer active:scale-[0.99] flex-1 py-3.5 border border-slate-300 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={onConfirm}
                  className="cursor-pointer active:scale-[0.99] flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all active:scale-[0.98]"
                >
                  Lanjut ke PIN
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  };

  const resetPinState = () => {
    setPin(["", "", "", ""]);
    setPinError("");
    setIsSubmitting(false);
    setPinAttempts(3);
    setIsLocked(false);
    setLockTimeLeft(0);
    setPendingWithdrawData(null);
    localStorage.removeItem(LOCK_KEY);
    localStorage.removeItem(WITHDRAW_DATA_KEY);
  };

  const handlePinKeyDown = (index, e) => {
    if (isLocked) return;
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
  };

  const handlePinSubmit = async () => {
    const fullPin = pin.join("");
    if (fullPin.length < 4) {
      setPinError("Masukkan 4 digit PIN keamanan");
      return;
    }

    setIsSubmitting(true);
    setPinError("");

    try {
      await withdrawMutation.mutateAsync({ 
        amount: formData.amount,
        paymentMethod: method,
        channelCode: formData.channelCode,
        accountNumber: formData.accountNumber,
        accountName: formData.accountName,
        securityPin: fullPin 
      });

      // Sukses → reset
      resetPinState();
      setShowPinModal(false);

    } catch (err) {
      const message = err.response?.data?.message || "PIN salah";

      setPinError(message);
      
      // Kurangi percobaan
      const newAttempts = pinAttempts - 1;
      setPinAttempts(newAttempts);

      if (newAttempts <= 0) {
        setIsLocked(true);
        setLockTimeLeft(180); // 3 menit = 180 detik
        setPinError("Terlalu banyak percobaan salah. Tunggu 3 menit.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    const currentAmt = parseFloat(formData.amount) || 0;

    // Validasi
    if (!formData.amount || isNaN(currentAmt) || currentAmt <= 0) {
      return showAlert('Nominal Tidak Valid', 'Masukkan nominal penarikan yang valid sebelum melanjutkan.');
    }

    if (availableBalance < MIN_SALDO) {
      return showAlert('Saldo Tidak Mencukupi', 
        `Kamu membutuhkan minimal saldo tersedia Rp ${formatRupiah(MIN_SALDO)} untuk mengajukan penarikan.`);
    }

    if (currentAmt < MIN_TARIK) {
      return showAlert('Di Bawah Minimal Tarik', 
        `Nominal penarikan minimal adalah Rp ${formatRupiah(MIN_TARIK)}.`);
    }

    if (currentAmt > MAX_TARIK) {
      return showAlert('Melebihi Maksimal Tarik', 
        `Nominal penarikan maksimal adalah Rp ${formatRupiah(MAX_TARIK)} per pengajuan.`);
    }

    if (currentAmt > availableBalance) {
      return showAlert('Saldo Tidak Cukup', 
        `Saldo tersedia kamu Rp ${formatRupiah(availableBalance)}, tidak cukup untuk menarik Rp ${formatRupiah(currentAmt)}.`);
    }

    if (!formData.accountNumber?.trim() || !formData.accountName?.trim()) {
      return showAlert('Data Rekening Belum Lengkap', 
        'Lengkapi nomor rekening / e-wallet dan nama pemilik akun terlebih dahulu.');
    }

    // Simpan data penarikan (untuk berjaga-jaga jika lock aktif)
    const withdrawData = {
      amount: formData.amount,
      formattedAmount: formData.formattedAmount,
      channelCode: formData.channelCode,
      accountNumber: formData.accountNumber,
      accountName: formData.accountName,
      method: method,
      netAmount: Math.max(0, currentAmt - WITHDRAW_FEE)
    };

    setPendingWithdrawData(withdrawData); // pastikan state ini ada di atas

    // Simpan ke localStorage juga
    localStorage.setItem(WITHDRAW_DATA_KEY, JSON.stringify(withdrawData));

    // Buka modal konfirmasi
    setShowConfirmModal(true);
  };

  const handleConfirmWithdraw = () => {
    setShowConfirmModal(false);
    setShowTotpModal(true);
    setTotpCode('');
    setTotpError('');
  };

  const handleVerifyTOTP = async () => {
    if (totpCode.length !== 6) {
      setTotpError("Masukkan 6 digit kode dari Google Authenticator");
      return;
    }

    setIsSubmitting(true);
    setTotpError("");

    try {
      await withdrawMutation.mutateAsync({
        amount: formData.amount,
        paymentMethod: method,
        channelCode: formData.channelCode,
        accountNumber: formData.accountNumber,
        accountName: formData.accountName,
        totpCode: totpCode,           // ← Kirim ke backend
      });
    } catch (err) {
      setTotpError(err.response?.data?.message || "Kode Google Authenticator salah");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = 
    availableBalance >= MIN_SALDO && 
    amt >= MIN_TARIK && 
    amt <= MAX_TARIK &&
    amt <= availableBalance &&
    !!formData.accountNumber && 
    !!formData.accountName;

  const getSubmitLabel = () => {
    if (!formData.amount || isNaN(amt) || amt <= 0) return 'Masukkan nominal penarikan';
    if (availableBalance < MIN_SALDO) return `Saldo minimal Rp ${formatRupiah(MIN_SALDO)}`;
    if (amt < MIN_TARIK) return `Minimal tarik Rp ${formatRupiah(MIN_TARIK)}`;
    if (amt > MAX_TARIK) return `Maksimal tarik Rp ${formatRupiah(MAX_TARIK)}`;
    if (amt > availableBalance) return 'Saldo tidak mencukupi';
    if (!formData.accountNumber) return 'Isi nomor rekening';
    if (!formData.accountName) return 'Isi nama pemilik akun';
    return 'Ajukan Penarikan Dana';
  };

  return (
    <motion.div className="w-full mx-auto" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      
      <TwoFactorSetup />
      <div className='space-y-5 mt-0'>
        
        {/* Alert Modal */}
        <AlertModal modal={alertModal} onClose={closeAlert} />

        {/* ── Balance Card ── */}
        <div className="bg-blue-600 py-7 rounded-none p-4 md:p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 md:flex hidden"><Wallet size={120} /></div>
          <div className="relative z-[2]">
            <div className="flex flex-col items-start gap-3 mb-2">
              <p className="text-blue-100 font-bold uppercase tracking-widest text-xs">Saldo Bisa Ditarik</p>
              <div className='flex w-max items-center'>
                <h1 className="text-3xl font-black">
                  Rp {showBalance ? availableBalance.toLocaleString('id-ID') : "*********"}
                </h1>
                <button
                  onClick={() => {
                    const next = !showBalance;
                    setShowBalance(next);
                    localStorage.setItem('showBalance', String(next));
                    window.dispatchEvent(new Event('balanceUpdate'));
                  }}
                  className="relative bg-white top-[1.4px] ml-3 cursor-pointer active:scale-[0.98] flex items-center gap-1 bg-blue-500/40 hover:bg-white/90 border border-blue-400/40 rounded-none px-2 py-0.5 text-[10px] font-black text-slate-900 transition-all active:scale-95"
                >
                  {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {showBalance && (
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                <span className="text-blue-200">
                  Total masuk:{' '}
                  <span className="font-bold text-white">Rp {totalWallet.toLocaleString('id-ID')}</span>
                </span>
                {pendingBalance > 0 && (
                  <>
                    <div className="w-px h-3 bg-white/40" />
                    <span className="text-amber-200">
                      ⏳ Menunggu 2 hari:{' '}
                      <span className="font-bold text-amber-100">Rp {pendingBalance.toLocaleString('id-ID')}</span>
                    </span>
                  </>
                )}
              </div>
            )}
            <p className="text-blue-200 text-xs font-medium mt-2">
              Penarikan diproses oleh admin dalam 1×24 jam hari kerja
            </p>
          </div>
        </div>

        {/* ── Banner saldo tidak cukup ── */}
        {availableBalance < MIN_SALDO && (
          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-none px-5 py-4">
            <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
            <div>
              <p className="font-black text-amber-700 dark:text-amber-400 text-sm">Saldo belum mencukupi untuk penarikan</p>
              <p className="text-xs text-amber-600 dark:text-amber-500 font-medium mt-0.5">
                Kamu perlu minimal saldo tersedia <strong>Rp {MIN_SALDO.toLocaleString('id-ID')}</strong> untuk mengajukan penarikan.
                Saldo tersedia kamu saat ini: <strong>Rp {availableBalance.toLocaleString('id-ID')}</strong>
              </p>
            </div>
          </div>
        )}

        {/* ── Stats ringkas ── */}
        {withdrawals.length > 0 && (
          <div className="px-4 md:px-0 grid grid-cols-3 gap-3">
            {[
              { label: 'Menunggu', value: statsPending,    unit: 'request', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900' },
              { label: 'Berhasil', value: `${statsCompleted.toLocaleString('id-ID')}`, unit: '', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-950/30 border-green-100 dark:border-green-900' },
              { label: 'Ditolak',  value: statsFailed,     unit: 'request', color: 'text-red-500 dark:text-red-400',    bg: 'bg-red-100 dark:bg-red-950/30 border-red-100 dark:border-red-900' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} justify-center items-center md:justify-normalp border rounded-none px-4 py-3 md:px-4 md:py-4 flex items-center text-center`}>
                <p className={`font-black text-sm ${s.color}`}>{s.value} <span className="text-xs font-bold relative -top-[0.3px]">{s.label}</span></p>
              </div>
            ))}
          </div>
        )}

        {/* ── Form Penarikan ── */}
        <div className="bg-white dark:bg-slate-900 rounded-none p-4 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
          <h2 className="text-sm uppercase md:capitalize md:text-xl font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-3">
            <CreditCard className="text-blue-600" size={20} /> Ajukan Penarikan Dana
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
            {[
              { label: 'Min. Tarik',  value: `Rp ${MIN_TARIK.toLocaleString('id-ID')}` },
              { label: 'Maks. Tarik', value: `Rp ${(MAX_TARIK / 1000000).toFixed(0)}jt` },
              { label: 'Biaya Layanan', value: '3.500' },
            ].map(r => (
              <div key={r.label} className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-none p-3 text-center">
                <p className="font-black text-blue-600 dark:text-white text-sm">{r.value}</p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-bold mt-0.5">{r.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {[
              { id: 'BANK',  label: 'Transfer Bank',  icon: <CreditCard size={18} /> },
              { id: 'DANA',  label: 'E-Wallet DANA',  icon: <Smartphone size={18} /> },
            ].map(m => (
              <button key={m.id}
                onClick={() => { setMethod(m.id); setFormData({ ...formData, channelCode: m.id === 'BANK' ? 'BCA' : m.id }); }}
                className={`cursor-pointer active:scale-[0.99] flex flex-col items-center gap-2 p-4 rounded-none border transition-all font-black text-sm ${
                  method === m.id
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-50 dark:shadow-none'
                    : 'border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-200 dark:hover:border-slate-600'
                }`}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          <div className="space-y-5">
            <div className={`grid grid-cols-1 ${method === 'BANK' ? 'md:grid-cols-2' : ''} gap-3`}>
              {method === 'BANK' && (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Pilih Bank</label>
                  <select
                    className="w-full px-5 py-3 bg-slate-100 dark:bg-slate-800 border-1 border-slate-100 dark:border-slate-700 rounded-none font-bold outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
                    value={formData.channelCode}
                    onChange={e => setFormData({ ...formData, channelCode: e.target.value })}>
                    <option value="BCA">BCA (Bank Central Asia)</option>
                    <option value="BNI">BNI (Bank Negara Indonesia)</option>
                    <option value="MANDIRI">Mandiri</option>
                    <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                    <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                  </select>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {method === 'BANK' ? 'Nomor Rekening' : 'Nomor Handphone'}
                </label>
                <input
                  value={formData.accountNumber}
                  placeholder={method === 'BANK' ? '0000000000000' : '08xx-xxxx-xxxx'}
                  className="w-full px-5 py-3 bg-slate-100 dark:bg-slate-800 border-1 border-slate-100 dark:border-slate-700 rounded-none font-bold outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  onChange={e => setFormData({ ...formData, accountNumber: e.target.value })} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nama Lengkap Pemilik Akun</label>
              <input
                value={formData.accountName}
                placeholder="Sesuaikan dengan Buku Tabungan / Nama di App"
                className="w-full px-5 py-3 bg-slate-100 dark:bg-slate-800 border-1 border-slate-100 dark:border-slate-700 rounded-none font-bold outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                onChange={e => setFormData({ ...formData, accountName: e.target.value })} />
            </div>

            <div className="w-full flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nominal Penarikan (Rp)</label>
              <div className="relative w-[99.8%] mx-auto">
                <span className="absolute left-5 top-[47%] -translate-y-1/2 font-black text-xl text-slate-400 dark:text-slate-500">Rp</span>
                <input
                  type="text"
                  value={formData.formattedAmount || ''}
                  placeholder="0"
                  className="w-full py-4 pl-14 bg-slate-900 dark:bg-slate-950 text-white ring-1 dark:ring-white/10 rounded-none font-bold text-xl outline-none focus:ring-1 dark:focus:ring-blue-900 transition-all placeholder:text-slate-600"
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^0-9]/g, '');
                    if (value === '') { setFormData(prev => ({ ...prev, amount: '', formattedAmount: '' })); return; }
                    const numericValue = parseInt(value, 10);
                    setFormData(prev => ({ ...prev, amount: numericValue.toString(), formattedAmount: numericValue.toLocaleString('id-ID') }));
                  }}
                />
              </div>

              {amt > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/60 border p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nominal penarikan</span>
                    <span>Rp {formatRupiah(amt)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-xs">
                    <span>Biaya layanan</span>
                    <span>Rp {formatRupiah(WITHDRAW_FEE)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-emerald-400 font-bold">
                    <span>Yang kamu terima</span>
                    <span>Rp {formatRupiah(netAmount)}</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={withdrawMutation.isPending || !canSubmit}
              className="cursor-pointer active:scale-[0.99] hover:brightness-90 w-full bg-blue-600 text-white py-4 rounded-none font-black text-base hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 dark:shadow-blue-900/20 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed">
              {withdrawMutation.isPending ? (
                <><div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-none animate-spin" /> Memproses...</>
              ) : (
                <>{getSubmitLabel()} <ArrowRight size={18} className='relative top-[1px]' /></>
              )}
            </button>

            {withdrawMutation.isSuccess && (
              <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-none px-5 py-4">
                <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                <div>
                  <p className="font-black text-green-700 dark:text-green-400 text-sm">Pengajuan berhasil dikirim!</p>
                  <p className="text-[11px] text-green-600 dark:text-green-500 font-medium">Admin akan memproses dalam 1×24 jam hari kerja. Pantau status di riwayat di bawah.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── PIN Modal ── */}
      <AnimatePresence>
          {showPinModal && (
            <div className={`fixed ${isLocked ? 'md:w-[80vw] bg-slate-80/5' : 'w-[100vw] bg-black/70'} h-screen right-0 ml-auto inset-0 z-[999999] flex items-center justify-center p-4 backdrop-blur-md`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-slate-900 w-full max-w-xl h-max rounded-none shadow-2xl overflow-hidden relative"
              >
                {/* Blue Overlay saat Locked */}
                {isLocked && (
                  <div className="absolute inset-0 bg-blue-700 flex flex-col items-center justify-center z-10 text-white p-8 text-center">
                    <ShieldCheck size={48} className="mb-4 opacity-80" />
                    <p className="font-black text-xl mb-2">PIN DIBLOKIR SEMENTARA</p>
                    <p className="text-blue-100 mb-6">Terlalu banyak percobaan salah</p>
                    <p className="text-3xl font-mono font-bold mb-1">
                      {Math.floor(lockTimeLeft / 60)}:{(lockTimeLeft % 60).toString().padStart(2, '0')}
                    </p>
                    <p className="text-sm opacity-75">Silakan coba lagi setelah waktu habis</p>
                  </div>
                )}

                <div className="p-4 md:p-8 text-center space-y-6">
                  <div className="w-16 h-16 mx-auto bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                    <ShieldCheck size={32} className="text-amber-500" />
                  </div>

                  <div>
                    <p className="font-bold text-xl">Konfirmasi PIN Keamanan</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Penarikan <span className="font-bold text-emerald-500">Rp {formatRupiah(netAmount)}</span>
                    </p>
                  </div>

                  {/* Attempt Counter */}
                  <div className="flex justify-center">
                    <div className={`px-4 text-sm font-bold
                      ${pinAttempts <= 1 ? 'text-red-400 ' : ' text-white'}`}>
                      Percobaan tersisa: <span className="font-mono">{pinAttempts}/3</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    {pin.map((digit, i) => (
                      <input
                        key={i}
                        ref={pinRefs[i]}
                        type={showPin ? "text" : "password"}
                        maxLength={1}
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) => handlePinInput(i, e.target.value)}
                        onKeyDown={(e) => handlePinKeyDown(i, e)}
                        disabled={isLocked}
                      className={`w-14 h-14 ${showPin ? 'pb-1' : 'pb-2'} text-center text-3xl font-black border-2 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-none outline-none`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="text-xs cursor-pointer active:scale-[0.99] flex items-center gap-1 text-slate-400 hover:text-blue-600"
                    >
                      {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                      {showPin ? 'Sembunyikan' : 'Tampilkan'} PIN
                    </button>
                  </div>
                  {pinError && (
                    <div className="flex w-max mx-auto items-center text-center justify-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 rounded-none">
                      <AlertCircle size={16} className="text-red-500" />
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">{pinError}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => { setShowPinModal(false); resetPinState(); }}
                      className="flex-1 py-3.5 border border-slate-300 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handlePinSubmit}
                      disabled={isSubmitting || pin.join("").length < 4 || isLocked}
                      className="cursor-pointer active:scale-[0.98] flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                      {isSubmitting ? "Memverifikasi..." : "Konfirmasi"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── Riwayat Withdrawal ── */}
        <div className="bg-white dark:bg-slate-900 rounded-none shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 md:px-8 py-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="font-black text-slate-800 dark:text-slate-100">Riwayat Penarikan</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{pagination.total || 0} total request</p>
            </div>
            <div className="flex gap-1.5 rounded-none overflow-hidden">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-1 flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 text-xs cursor-pointer font-black transition-all ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 hover:border-white'}`}
                >
                  <List size={13} className='relative top-[-0.5px]' />
                  Table
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`px-4 py-1 flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 text-xs cursor-pointer font-black transition-all ${viewMode === 'card' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 hover:border-white'}`}
                >
                  <Grid size={13} className='relative top-[-0.5px]' />
                  Card
                </button>
              </div>
          </div>

          {historyLoading ? (
              <div className="flex items-center justify-center py-16 text-slate-400 dark:text-slate-500 font-bold gap-3">
                <div className="w-5 h-5 border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 rounded-none animate-spin" /> 
                Memuat riwayat...
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <p className="text-4xl mb-3">💸</p>
                <p className="font-black text-slate-500 dark:text-slate-400">Belum ada riwayat penarikan</p>
                <p className="text-sm font-medium mt-1 text-slate-400 dark:text-slate-500">Ajukan penarikan pertamamu di atas</p>
              </div>
            ) : viewMode === 'card' ? (
              /* ==================== CARD VIEW ==================== */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 md:p-8">
                {withdrawals.map((wd) => {
                  const cfg = STATUS_CONFIG[wd.status] || STATUS_CONFIG.PENDING;
                  return (
                    <div key={wd._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-none p-5 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xl font-medium text-slate-800 dark:text-slate-100">
                            Rp {Number(wd.amount - 3500).toLocaleString('id-ID')}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {wd.channelCode} {wd.accountNumber}
                          </p>
                        </div>
                        <span className={`relative top-1 flex items-center gap-1.5 px-3 py-1 rounded-none text-xs font-black ${cfg.className}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{wd.accountName}</p>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between text-xs">
                        <span className="text-slate-400">{formatDate(wd.createdAt)}</span>
                        {wd.status === 'FAILED' && wd.note && (
                          <span className="text-red-500 text-right text-[10px] max-w-[140px] line-clamp-2">{wd.note}</span>
                        )}
                      </div>
                      {wd.status === 'PENDING' && wd.midtransReference && (
                        <button
                          onClick={async () => {
                            try {
                              const result = await checkWithdrawStatus(wd.midtransReference);
                              if (result.status !== wd.status) {
                                queryClient.invalidateQueries({ queryKey: ['withdrawHistory'] });
                                queryClient.invalidateQueries({ queryKey: ['profile'] });
                              }
                              showAlert(
                                `Status: ${result.status}`,
                                `Doku: ${result.dokuStatus || 'Menunggu'}`,
                                result.status === 'COMPLETED' ? 'success' : 'error'
                              );
                            } catch (err) {
                              showAlert('Gagal cek status', err.message);
                            }
                          }}
                          className="text-[10px] font-black text-blue-500 hover:text-blue-700 flex items-center gap-1 mt-2"
                        >
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ==================== TABLE VIEW ==================== */
              <div className="overflow-x-auto">
                <table className="w-full text-left md:min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      <th className="px-5 md:px-8 py-4">Nominal</th>
                      <th className="px-5 md:px-8 py-4">Fee</th>
                      <th className="px-5 md:px-8 py-4">Metode</th>
                      <th className="px-5 md:px-8 py-4">No. Rekening</th>
                      <th className="px-5 md:px-8 py-4 text-center">Status</th>
                      <th className="px-5 md:px-8 py-4">Waktu Pengajuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {withdrawals.map((wd) => {
                      const cfg = STATUS_CONFIG[wd.status] || STATUS_CONFIG.PENDING;
                      return (
                        <tr key={wd._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-all">
                          <td className="px-5 md:px-8 py-5">
                            <p className="text-sm text-slate-800 dark:text-green-300 font-medium">
                              Rp {Number(wd.amount - 3500).toLocaleString('id-ID')}
                            </p>
                          </td>
                          <td className="px-5 md:px-8 py-5">
                            <p className="text-sm text-slate-400 dark:text-red-300">Rp 3.500</p>
                          </td>
                          <td className="px-5 md:px-8 py-5">
                            <p className="text-slate-600 dark:text-slate-300 text-sm">{wd.paymentMethod || 'BANK'}</p>
                          </td>
                          <td className="px-5 md:px-8 py-5">
                            <p className="font-mono font-bold text-slate-600 dark:text-slate-300 text-sm">{wd.accountNumber}</p>
                          </td>
                          <td className="px-5 md:px-8 py-5 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none text-[10px] font-black ${cfg.className}`}>
                              {cfg.icon} {cfg.label}
                            </span>
                          </td>
                          <td className="px-5 md:px-8 py-5">
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                              {formatDate(wd.createdAt)}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 md:px-8 py-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
              disabled={historyPage === 1}
              className="px-4 py-2 rounded-none bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              ← Sebelumnya
            </button>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
              Halaman <span className="text-blue-600 dark:text-blue-400 font-black">{historyPage}</span> dari {pagination.totalPages}
            </span>
            <button
              onClick={() => setHistoryPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={historyPage === pagination.totalPages}
              className="px-4 py-2 rounded-none bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              Berikutnya →
            </button>
          </div>
        )}

        <AnimatePresence>
          {showConfirmModal && (
            <div className="fixed inset-0 z-[999998] flex items-center justify-center bg-black/70 backdrop-blur-md">
              <motion.div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-none p-8 text-center">
                <AlertTriangle size={40} className="mx-auto text-amber-500 mb-4" />
                <p className="font-black text-xl">Konfirmasi Penarikan</p>
                <div className="mt-6 bg-slate-50 dark:bg-slate-800 p-5 text-left text-sm space-y-2">
                  <div className="flex justify-between"><span className="text-slate-500">Nominal</span><span>Rp {amt.toLocaleString('id-ID')}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Biaya Layanan</span><span>Rp {WITHDRAW_FEE}</span></div>
                  <div className="flex justify-between font-bold text-emerald-600 border-t pt-2"><span>Diterima</span><span>Rp {netAmount.toLocaleString('id-ID')}</span></div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-3 border font-bold">Batal</button>
                  <button onClick={handleConfirmWithdraw} className="flex-1 py-3 bg-blue-600 text-white font-bold">Lanjut Verifikasi 2FA</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* === GOOGLE AUTHENTICATOR MODAL === */}
        <AnimatePresence>
          {showTotpModal && (
            <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 backdrop-blur-md">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-none p-8">
                <div className="text-center">
                  <ShieldCheck size={48} className="mx-auto text-blue-600 mb-4" />
                  <p className="font-black text-xl">Verifikasi Google Authenticator</p>
                  <p className="text-sm text-slate-500 mt-1">Masukkan 6 digit kode dari aplikasi Google Authenticator kamu</p>
                </div>

                <input
                  type="text"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => {
                    setTotpCode(e.target.value.replace(/[^0-9]/g, ''));
                    setTotpError('');
                  }}
                  className="w-full text-center text-4xl tracking-[12px] font-mono py-6 mt-8 bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-none focus:border-blue-500 outline-none"
                  placeholder="000000"
                />

                {totpError && <p className="text-red-500 text-center mt-3 text-sm">{totpError}</p>}

                <div className="flex gap-3 mt-8">
                  <button onClick={() => { setShowTotpModal(false); setTotpCode(''); setTotpError(''); }} className="cursor-pointer active:scale-[0.99] flex-1 py-4 border font-bold hover:bg-slate-100 dark:hover:bg-slate-800">Batal</button>
                  <button onClick={handleVerifyTOTP} disabled={isSubmitting || totpCode.length !== 6} className="cursor-pointer active:scale-[0.99] flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black disabled:opacity-60">
                    {isSubmitting ? 'Memverifikasi...' : 'Verifikasi'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Confirmation Modal */}
        <ConfirmWithdrawModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmWithdraw}
          formData={formData}
          netAmount={netAmount}
          method={method}
        />

      </div>
    </motion.div>
  );
};