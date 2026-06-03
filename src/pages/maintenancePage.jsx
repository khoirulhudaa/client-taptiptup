import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Save, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import api from '../lib/axiosInstance';
import toast from 'react-hot-toast';

const CustomToast = ({ toastState }) => {
  if (!toastState) return null;
  const isSuccess = toastState.type === 'success';
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-[toast-in_0.25s_ease_forwards]">
      <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border text-[13px] font-medium whitespace-nowrap
        ${isSuccess
          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
          : 'bg-red-500/10 border-red-500/25 text-red-400'
        }`}>
        {isSuccess ? <CheckCircle size={15} /> : <XCircle size={15} />}
        {toastState.msg}
      </div>
    </div>
  );
};

const MaintenancePage = () => {
  const [settings, setSettings] = useState({
    auth: false,
    supporter: false,
    withdrawal: false,
    dashboard: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastState, setToastState] = useState(null);
  const toastTimer = useRef(null);

  const showToast = (msg, type) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastState({ msg, type });
    toastTimer.current = setTimeout(() => setToastState(null), 2800);
  };

  const fetchMaintenance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/maintenance/settings');
      setSettings(res.data);
    } catch (err) {
      showToast('Gagal memuat pengaturan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, []);

  const toggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.put('/api/maintenance/settings', settings);
      showToast('Pengaturan berhasil disimpan', 'success');
    } catch (err) {
      showToast('Gagal menyimpan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const pages = [
    { key: 'auth', label: 'Halaman Login / Register', desc: 'Auth Page' },
    { key: 'supporter', label: 'Halaman Donasi (Supporter)', desc: '/donate/:username' },
    { key: 'withdrawal', label: 'Penarikan Dana (Streamer)', desc: 'Withdraw Page' },
    { key: 'dashboard', label: 'Dashboard Streamer', desc: 'Seluruh halaman dashboard' },
  ];

  return (
    <div className="relative space-y-6">
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translate(-50%, -8px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

      <CustomToast toastState={toastState} />

      <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-100/10 p-4 md:p-5 rounded-none">
        <div className="grid gap-4">
          {pages.map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <div>
                <p className="font-bold">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
              <button
                onClick={() => toggle(key)}
                className={`cursor-pointer active:scale-[0.99] hover:brightness-90 relative w-14 h-8 rounded-none transition-all ${
                  settings[key] ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-none shadow transition-all ${settings[key] ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="cursor-pointer active:scale-[0.99] mt-8 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98]"
        >
          {saving ? <RefreshCw className="animate-spin" /> : <Save size={20} />}
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan Maintenance'}
        </button>
      </div>
    </div>
  );
};

export default MaintenancePage;