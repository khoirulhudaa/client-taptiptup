// feeConfigPage.jsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeDollarSignIcon, CheckCircle2, Disc, DollarSign, Info, Save, Settings2, ShieldCheck, Users, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../lib/axiosInstance';

const fetchFeeConfig = async () => (await api.get('/api/overlay/settings')).data;
const saveFeeConfig  = async (d) => (await api.put('/api/overlay/settings', d)).data;

const FEE_PERCENT = 0.030; // 3.0%
const ADMIN_FEE   = 3500;  // Rp 1.500 tetap ditanggung streamer

const formatRupiah = (num) =>
  new Intl.NumberFormat('id-ID').format(Math.round(num));

const InputField = ({ label, ...props }) => (
  <div className="w-full flex pl-[3px] items-center bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-all shadow-sm">
    <div className="w-max px-3 py-3 rounded-lg text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap border-r border-slate-200 dark:border-slate-700 bg-slate-200/50 dark:bg-slate-700/50">
      {label}
    </div>
    <input
      className="flex-1 bg-transparent p-3 h-11.5 pl-3 outline-none font-bold text-sm text-slate-900 dark:text-slate-100"
      {...props}
      onChange={e => props.onChange?.(e.target.value)}
    />
  </div>
);

// ─── Simulator ────────────────────────────────────────────────────────────────
const FeeSimulator = ({ feeBearer }) => {
  const [nominal, setNominal] = useState(100000);
  const amt = parseFloat(nominal) || 0;

  const percentFee = Math.round(amt * FEE_PERCENT);

  // Donor membayar
  const donorPays = feeBearer === 'donor' 
    ? amt + percentFee 
    : amt;

  // Streamer menerima (setelah potongan 3.0%)
  const streamerGets = feeBearer === 'donor' 
    ? amt 
    : amt - percentFee;

  const PRESETS = [10000, 50000, 100000, 500000, 1000000];

  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl p-5 space-y-4">
      <p className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
        SIMULASI KALKULASI FEE
      </p>

      {/* Preset buttons */}
      <div className="w-full grid grid-cols-5 md:grid-cols-5 gap-3">
        {PRESETS.map(v => (
          <button
            key={v}
            onClick={() => setNominal(v)}
            className={`px-3 py-3 rounded-xl text-xs font-black transition-all border-2 cursor-pointer active:scale-[0.97] ${
              nominal === v
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-indigo-300'
            }`}
          >
            {v >= 1000000 ? `${v / 1000000}jt` : `${v / 1000}K`}
          </button>
        ))}
      </div>

      {/* Input nominal */}
      <InputField
        label="Rupiah"
        type="number"
        value={nominal}
        onChange={val => setNominal(Number(val))}
      />

      {/* Breakdown */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="font-medium text-slate-400 dark:text-slate-400">Nominal donasi</span>
          <span className="font-medium">Rp {formatRupiah(amt)}</span>
        </div>

        <div className="flex justify-between text-red-300">
          <spa className='font-medium'>Biaya admin 3.0%</spa>
          <span className='font-medium'>- Rp {formatRupiah(percentFee)}</span>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-2">
          {feeBearer === 'donor' && (
            <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
              <span className='font-medium'>Donor membayar total</span>
              <span className='font-medium'>Rp {formatRupiah(donorPays)}</span>
            </div>
          )}
          <div className="flex justify-between pb-1 text-emerald-600 dark:text-emerald-400 font-bold">
            <span>Streamer menerima</span>
            <span>Rp {formatRupiah(streamerGets)}</span>
          </div>
        </div>  

        <p className="text-[10px] text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-700 ">
          Biaya Rp 4.000 saat penarikan tetap ditanggung streamer
        </p>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const FeeConfigPage = () => {
  const queryClient = useQueryClient();
  const [feeBearer, setFeeBearer] = useState('streamer');
  const [saved, setSaved] = useState(false);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchFeeConfig,
  });

  useEffect(() => {
    if (profileData) {
      const s = profileData.settings || profileData.overlaySetting || {};
      setFeeBearer(s.feeBearer || 'streamer');
    }
  }, [profileData]);

  const saveMutation = useMutation({
    mutationFn: (bearer) => {
      const current = profileData?.settings || profileData?.overlaySetting || {};
      const payload = { ...current, feeBearer: bearer };
      console.log("💾 Mengirim ke backend:", payload);
      return saveFeeConfig(payload);
    },
    onSuccess: (response) => {
      console.log("✅ Berhasil disimpan dari server:", response);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
    onError: (err) => {
      console.error("❌ Gagal menyimpan:", err.response?.data || err);
      alert(err.response?.data?.message || 'Gagal menyimpan konfigurasi');
    },
  });

  const OPTIONS = [
    {
      id: 'streamer',
      icon: <Wallet size={19} />,
      title: 'Streamer Menanggung',
      subtitle: '3.0% dipotong dari saldo streamer',
      desc: 'Donor hanya membayar sesuai nominal yang diketik. Biaya 3.0% akan dipotong otomatis dari saldo kamu saat donasi masuk. Biaya tetap Rp4.000 dibebankan saat penarikan.',
      badge: 'Ramah Donor',
      badgeColor: 'bg-indigo-100 dark:bg-white text-slate-900',
      borderActive: 'border-indigo-600',
      bgActive: 'bg-indigo-50 dark:bg-indigo-950/30',
      iconColor: 'bg-indigo-600',
    },
    {
      id: 'donor',
      icon: <Users size={19} />,
      title: 'Donatur Menanggung',
      subtitle: '3.0% ditambahkan ke nominal donasi',
      desc: 'Donor akan membayar nominal + 3.0%. Streamer menerima persis sesuai nominal yang diinput donor. Biaya tetap Rp4.000 tetap ditanggung streamer saat penarikan.',
      badge: 'Saldo Penuh',
      badgeColor: 'bg-emerald-100 dark:bg-white text-slate-900',
      borderActive: 'border-emerald-500',
      bgActive: 'bg-emerald-50 dark:bg-emerald-950/30',
      iconColor: 'bg-emerald-500',
    },
  ];

  return (
    <motion.div className="w-full space-y-5 pb-10" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-5 bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-100 dark:border-slate-800 rounded-xl p-4 md:p-5 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #6366f1 0%, transparent 50%)' }} />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg">
                  <BadgeDollarSignIcon size={20} />
              </div>
              <div>
                  <h3 className="md:capitalize text-sm uppercase md:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                      Biaya layanan
                  </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 md:p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
        {isLoading ? (
          <div className="py-12 text-center text-slate-400">Memuat konfigurasi...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setFeeBearer(opt.id)}
                className={`cursor-pointer active:scale-[0.98] text-left p-6 rounded-xl border-2 transition-all space-y-4 ${
                  feeBearer === opt.id
                    ? `${opt.borderActive} ${opt.bgActive} shadow-lg`
                    : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`${opt.iconColor} p-3 rounded-xl text-white shadow-md`}>
                    {opt.icon}
                  </div>
                  <div className={`px-3 py-1 rounded-xl text-[10px] font-bold ${opt.badgeColor}`}>
                    {opt.badge}
                  </div>
                </div>

                <div>
                  <p className="font-black text-base">{opt.title}</p>
                  <p className="text-[11px] text-slate-400 font-bold">{opt.subtitle}</p>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed border-t pt-3">
                  {opt.desc}
                </p>
              </button>
            ))}
          </div>
        )}

        <FeeSimulator feeBearer={feeBearer} />

        {/* Ringkasan */}
        <div className={`p-5 rounded-xl border ${feeBearer === 'streamer' 
          ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30' 
          : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30'}`}>
          <p className="font-black text-sm mb-1">
            {feeBearer === 'streamer' 
              ? 'Mode Aktif: Streamer Menanggung 3.0%' 
              : 'Mode Aktif: Donor Menanggung 3.0%'}
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            {feeBearer === 'streamer' 
              ? 'Donor bayar Rp100.000 → Streamer terima Rp97.000' 
              : 'Donor bayar Rp103.093 → Streamer terima Rp100.000'}
          </p>
          {/* <p className="text-[10px] text-slate-400 mt-2">* Rp4.000 selalu dipotong saat penarikan dana</p> */}
        </div>

        <button
          onClick={() => saveMutation.mutate(feeBearer)}
          disabled={saveMutation.isPending}
          className="cursor-pointer active:scale-[0.98] hover:brightness-90 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black md-text-md text-sm rounded-xl transition-all active:scale-[0.98] disabled:opacity-60"
        >
          {saveMutation.isPending ? 'Menyimpan...' : 'Simpan Konfigurasi Fee'}
        </button>
      </div>

    </motion.div>
  );
};