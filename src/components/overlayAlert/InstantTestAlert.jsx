import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, RefreshCw, Zap } from 'lucide-react';
import { useState } from 'react';
import api from '../../lib/axiosInstance';

const InstantTestAlert = ({ overlayToken, settings, user }) => {
  const [isSending, setIsSending] = useState(false);
  const [lastSent, setLastSent] = useState(null);
  const [customAmount, setCustomAmount] = useState(50000);
  const [customName, setCustomName] = useState('TestDonor');
  const [customMsg, setCustomMsg] = useState('Ini test donasi dari dashboard! 🎉');
  const [customVoiceUrl, setCustomVoiceUrl] = useState('');

  const sendTest = async () => {
    if (!overlayToken) return;
    setIsSending(true);
    try {
      await api.post('/api/test-alert/send', {
        targetUsername: user.username,
        donorName: customName,
        amount: Number(customAmount),
        message: customMsg,
        mediaUrl: null,
        mediaType: null,
        voiceUrl: customVoiceUrl.trim() || null,
      });
      setLastSent(new Date());
    } catch (err) {
      console.log('err', err);
      alert(err.response?.data?.message || 'Gagal mengirim test alert');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-none p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-5">
      <div className="flex items-center gap-4">
        <div className="bg-rose-500 p-3 rounded-none text-white shadow-lg">
          <Zap size={20} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Instant Test Alert</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Kirim notif donasi test ke OBS tanpa perlu bayar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Nama Donor', value: customName, onChange: setCustomName, placeholder: 'TestDonor', type: 'text' },
          { label: 'Nominal (Rp)', value: customAmount, onChange: setCustomAmount, placeholder: '', type: 'number' },
          { label: 'Pesan', value: customMsg, onChange: setCustomMsg, placeholder: 'Pesan test...', type: 'text' },
        ].map(({ label, value, onChange, placeholder, type }) => (
          <div key={label} className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</label>
            <input
              type={type}
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full p-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-none font-bold text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-rose-400 transition-all"
            />
          </div>
        ))}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Voice URL <span className="normal-case font-medium text-slate-300">(opsional)</span>
          </label>
          <input
            value={customVoiceUrl}
            onChange={e => setCustomVoiceUrl(e.target.value)}
            className="w-full p-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-none font-bold text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-rose-400 transition-all"
            placeholder="https://... (URL audio)"
          />
        </div>
      </div>

      {/* Quick amounts */}
      <div className="flex flex-wrap gap-2">
        {[10000, 50000, 100000, 500000, 1000000].map(v => (
          <button key={v} onClick={() => setCustomAmount(v)}
            className={`cursor-pointer active:scale-[0.97] px-3 py-1.5 rounded-none text-xs font-black transition-all border-2 ${
              Number(customAmount) === v
                ? 'bg-rose-500 border-rose-500 text-white'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-rose-300'
            }`}>
            {v >= 1000000 ? `${v / 1000000}jt` : v >= 1000 ? `${v / 1000}K` : v}
          </button>
        ))}
      </div>

      <button
        onClick={sendTest}
        disabled={isSending || !overlayToken}
        className="cursor-pointer active:scale-[0.97] hover:brightness-90 w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-none font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-rose-200 dark:shadow-rose-900/30"
      >
        {isSending
          ? <><RefreshCw size={18} className="animate-spin" /> Mengirim...</>
          : <><Zap size={18} /> Kirim Test ke OBS Sekarang</>
        }
      </button>

      <AnimatePresence>
        {lastSent && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 rounded-none px-4 py-3 border border-emerald-100 dark:border-emerald-900">
            <CheckCircle2 size={14} /> Test terakhir dikirim: {lastSent.toLocaleTimeString('id-ID')}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium text-center">
        ⚠️ Pastikan OBS overlay kamu sudah dibuka di browser source sebelum test
      </p>
    </div>
  );
};

export default InstantTestAlert;