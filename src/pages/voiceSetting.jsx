    // pages/VoiceSettings.jsx
    // Tab baru di sidebar — activeTab = 'voiceSettings'
    // Fitur: test kirim voice note (rekam langsung), pengaturan durasi, URL overlay

    import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
    import { AnimatePresence, motion } from 'framer-motion';
    import {
    CheckCircle2,
    Copy,
    Mic,
    RefreshCw,
    Save,
    Timer,
    Zap,
    Plus,
    } from 'lucide-react';
    import { useCallback, useEffect, useRef, useState } from 'react';
    import api from '../lib/axiosInstance';
    import toast from 'react-hot-toast';
    import { VoiceRecorder } from '../components/voiceOver';

    // ─── Helpers ──────────────────────────────────────────────────────────────────

    const APP_URL = window.location.origin;

    const SectionHeader = ({ icon, title, color }) => (
    <div className="flex items-center gap-4">
        {icon && (
        <div className={`${color} p-2 rounded-none text-white shadow-lg`}>{icon}</div>
        )}
        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{title}</h3>
    </div>
    );

    // ─── VoiceDurationSettings ────────────────────────────────────────────────────

    const VoiceDurationSettings = ({ settings, onChange, saveSettingsMutation }) => {
    const base    = Number(settings.voiceBaseDuration)     || 10;
    const perAmt  = Number(settings.voiceExtraPerAmount)   || 10000;
    const extraDur= Number(settings.voiceExtraDuration)    || 5;

    const previewDurations = [
        { label: 'Rp 10.000', amount: 10000 },
        { label: 'Rp 50.000', amount: 50000 },
        { label: 'Rp 100.000', amount: 100000 },
        { label: 'Rp 500.000', amount: 500000 },
        { label: 'Rp 1.000.000', amount: 1000000 },
    ].map(({ label, amount }) => ({
        label,
        seconds: base + Math.floor(amount / (perAmt || 1)) * extraDur,
    }));

    return (
        <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-none p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-8">
        <SectionHeader icon={<Timer size={20} />} title="Durasi VN" color="bg-violet-500" />
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Atur berapa lama voice note tampil di overlay berdasarkan nominal donasi.
            Durasi total = durasi dasar + (nominal ÷ per-amount × tambahan detik).
        </p>

        <div className="space-y-6">
            {/* Durasi Dasar */}
            <div>
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2">
                Durasi Dasar (detik)
            </label>
            <input
                type="number"
                min={1}
                value={settings.voiceBaseDuration ?? 10}
                onChange={e => onChange('voiceBaseDuration', e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full text-lg font-black text-center bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-none p-2 outline-none focus:border-violet-400 text-slate-900 dark:text-slate-100 transition-all"
            />
            </div>

            {/* Tambahan per nominal */}
            <div>
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2">
                Tambahan Durasi
            </label>
            <div className="md:flex items-center gap-3 space-y-3 md:space-y-0">
                <div className="flex-1">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">
                    Setiap Rp
                </label>
                <input
                    type="number"
                    min={1000}
                    value={settings.voiceExtraPerAmount ?? 10000}
                    onChange={e => onChange('voiceExtraPerAmount', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-center text-lg font-bold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-none p-2 outline-none focus:border-violet-400 text-slate-900 dark:text-slate-100 transition-all"
                />
                </div>
                <div className="hidden md:flex items-center text-slate-400 dark:text-slate-500 font-black mt-4">
                <Plus size={18} />
                </div>
                <div>
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">
                    Detik Tambah
                </label>
                <input
                    type="number"
                    min={0}
                    value={settings.voiceExtraDuration ?? 5}
                    onChange={e => onChange('voiceExtraDuration', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full md:w-24 text-center text-lg font-bold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-none p-2 outline-none focus:border-violet-400 text-slate-900 dark:text-slate-100 transition-all"
                />
                </div>
            </div>
            </div>
        </div>

        {/* Preview kalkulasi */}
        <div className="md:bg-slate-50 md:dark:bg-slate-800/70 md:p-5 md:rounded-none md:border border-dashed border-slate-200 dark:border-slate-700">
            <p className="font-black text-xs text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-widest">
            Simulasi Durasi
            </p>
            <div className="flex flex-wrap md:gap-0 gap-x-2 md:justify-between">
            {previewDurations.map(({ label, seconds }, index) => (
                <div className='md:flex mb-2 md:mb-0 items-center gap-4'>
                    <div 
                        key={label} 
                        className={`w-max border border-slate-100/20 py-1 px-3 flex justify-between gap-4 items-center`}
                    >
                        <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
                        <span className="font-black text-slate-900 dark:text-white text-sm">
                        {seconds} detik
                        </span>
                    </div>
                    {/* <div className={`h-4 w-[1px] bg-white ${index === 4 ? 'hidden' : 'flex'}`}>
                    </div> */}
                </div>
                ))}
            </div>
        </div>

        <button
            onClick={() => saveSettingsMutation.mutate(settings)}
            disabled={saveSettingsMutation.isPending}
            className="cursor-pointer active:scale-[0.97] hover:brightness-90 w-full bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-none font-black text-sm transition-all disabled:opacity-70 flex items-center justify-center gap-2"
        >
            <Save size={20} />
            {saveSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Durasi Voice'}
        </button>
        </div>
    );
    };

    // ─── InstantTestVoice ─────────────────────────────────────────────────────────

    const InstantTestVoice = ({ user, localSettings }) => {
        const [isSending, setIsSending]         = useState(false);
        const [lastSent, setLastSent]           = useState(null);
        const [voiceUrl, setVoiceUrl]           = useState('');
        const [customName, setCustomName]       = useState('Mas Dev');
        const [customAmount, setCustomAmount]   = useState(50000);
        const [customMsg, setCustomMsg]         = useState('');

        // Perhitungan Durasi
        const base   = Number(localSettings?.voiceBaseDuration)     || 10;
        const perAmt = Number(localSettings?.voiceExtraPerAmount)   || 10000;
        const extra  = Number(localSettings?.voiceExtraDuration)    || 5;

        const extraSeconds = perAmt > 0 
            ? Math.floor(customAmount / perAmt) * extra 
            : 0;

        const actualDuration = base + extraSeconds;
        const maxRecordSeconds = actualDuration;   // ← Diubah jadi sama persis

        const sendTest = async () => {
            if (!user?.overlayToken || !voiceUrl) return;
            setIsSending(true);
            try {
                await api.post('/api/test-alert/send', {
                    targetUsername: user.username,
                    donorName:      customName,
                    amount:         Number(customAmount),
                    message:        customMsg || null,
                    mediaUrl:       null,
                    mediaType:      null,
                    voiceUrl:       voiceUrl,
                });
                setLastSent(new Date());
                toast.success('✅ Voice test terkirim ke OBS!');
            } catch (err) {
                toast.error(err.response?.data?.message || 'Gagal mengirim test');
            } finally {
                setIsSending(false);
            }
        };

        return (
            <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-none p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="bg-rose-500 p-3 rounded-none text-white shadow-lg">
                        <Zap size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                            Testing VN
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                            Rekam suara → kirim langsung ke OBS overlay
                        </p>
                    </div>
                </div>

                {/* Form data donasi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ... input nama, nominal, pesan tetap sama ... */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            Nama Donor
                        </label>
                        <input
                            value={customName}
                            onChange={e => setCustomName(e.target.value)}
                            className="w-full p-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-none font-bold text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-rose-400 transition-all"
                            placeholder="Mas Dev"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            Nominal (Rp)
                        </label>
                        <input
                            type="number"
                            value={customAmount}
                            onChange={e => setCustomAmount(e.target.value)}
                            className="w-full p-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-none font-bold text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-rose-400 transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            Pesan Teks <span className="normal-case font-medium text-slate-300 dark:text-slate-600">(opsional)</span>
                        </label>
                        <input
                            value={customMsg}
                            onChange={e => setCustomMsg(e.target.value)}
                            className="w-full p-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-none font-bold text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-rose-400 transition-all"
                            placeholder="Semangat terus bang! (opsional)"
                        />
                    </div>
                </div>

                {/* Quick amount */}
                <div className="flex flex-wrap gap-2">
                    {[1000, 5000, 10000, 50000, 100000, 500000].map(v => (
                        <button
                            key={v}
                            onClick={() => setCustomAmount(v)}
                            className={`cursor-pointer active:scale-[0.97] px-3 py-1.5 rounded-none text-xs font-black transition-all border-2 ${
                                Number(customAmount) === v
                                    ? 'bg-rose-500 border-rose-500 text-white'
                                    : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-rose-300'
                            }`}
                        >
                            {v >= 1000000 ? `${v / 1000000}jt` : `${v / 1000}K`}
                        </button>
                    ))}
                </div>

                {/* VoiceRecorder */}
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                        <span className="text-white font-medium">
                            Maksimal {maxRecordSeconds} detik
                        </span>
                    </label>

                    <VoiceRecorder
                        onVoiceReady={(url) => setVoiceUrl(url || '')}
                        maxSeconds={maxRecordSeconds}
                        disabled={false}
                    />
                </div>

                {/* Tombol kirim */}
                <button
                    onClick={sendTest}
                    disabled={isSending || !voiceUrl || !user?.overlayToken}
                    className="cursor-pointer active:scale-[0.97] hover:brightness-90 w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-none font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-rose-200 dark:shadow-rose-900/30"
                >
                    {isSending ? (
                        <><RefreshCw size={18} className="animate-spin" /> Mengirim...</>
                    ) : (
                        <><Zap size={18} /> Kirim Voice Test ke OBS</>
                    )}
                </button>

                {/* Last sent notification */}
                <AnimatePresence>
                    {lastSent && (
                        <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 rounded-none px-4 py-3 border border-emerald-100 dark:border-emerald-900"
                        >
                            <CheckCircle2 size={14} />
                            Voice test terakhir dikirim: {lastSent.toLocaleTimeString('id-ID')}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    // ─── VoiceOverlayUrls ─────────────────────────────────────────────────────────

    const VoiceOverlayUrls = ({ overlayToken, onCopy }) => {
    const urls = [
        {
        label: 'VOICE NOTE',
        url: `${APP_URL}/overlay/${overlayToken}/voice`,
        desc: 'Pasang di OBS sebagai Browser Source, ukuran 400×160px',
        },
    ];

    return (
        <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-none p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-4">
        <SectionHeader icon={<Mic size={20} />} title="Overlay VN" color="bg-violet-500" />
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Tambahkan URL ini ke OBS sebagai Browser Source. Voice note dari donatur akan
            diputar otomatis saat donasi masuk.
        </p>
        {urls.map(({ label, url, desc }) => (
            <div
            key={label}
            className="bg-slate-100 dark:bg-slate-800 p-5 rounded-none border-2 border-dashed border-slate-200 dark:border-slate-700"
            >
            <div className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-widest">
                {label}
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mb-2">{desc}</p>
            <div className="flex gap-3 items-center">
                <input
                readOnly
                value={url}
                className="flex-1 bg-transparent font-mono text-sm text-blue-600 dark:text-blue-400 font-bold outline-none overflow-hidden text-ellipsis"
                />
                <button
                onClick={() => onCopy(url, label)}
                className="text-slate-400 hover:text-blue-600 cursor-pointer active:scale-[0.98] transition-colors"
                >
                <Copy size={18} />
                </button>
            </div>
            </div>
        ))}
        </div>
    );
    };

    // ─── VoiceSettingsInfo ────────────────────────────────────────────────────────

    const VoiceSettingsInfo = () => (
    <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-none p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-4">
        <SectionHeader icon={<span className="text-xl">🎙️</span>} title="Tentang VN" color="bg-indigo-500" />
        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
        {[
            {
            icon: '🎤',
            title: 'Donatur Rekam Langsung',
            desc: 'Donatur bisa rekam pesan suara langsung dari halaman donasi, tanpa perlu app tambahan',
            },
            {
            icon: '📡',
            title: 'Stream ke OBS Real-time',
            desc: 'Suara diputar otomatis di overlay OBS kamu segera setelah donasi dikonfirmasi',
            },
            {
            icon: '⏱️',
            title: 'Durasi Otomatis',
            desc: 'Overlay tetap tampil selama audio diputar + buffer kecil, sesuai durasi rekaman donatur',
            },
            {
            icon: '🗑️',
            title: 'File Temporer 30 Menit',
            desc: 'File audio disimpan di memory server, otomatis terhapus setelah 30 menit',
            },
        ].map(({ icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-none border border-slate-100 dark:border-slate-700">
            <span className="text-lg flex-shrink-0">{icon}</span>
            <div>
                <p className="text-sm font-black text-slate-700 dark:text-slate-200">{title}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5 leading-relaxed">{desc}</p>
            </div>
            </div>
        ))}
        </div>
    </div>
    );

    // ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

    const fetchProfile  = async () => (await api.get('/api/overlay/settings')).data;
    const saveSettings  = async (s) => {
    const clean = JSON.parse(JSON.stringify(s, (key, val) => {
        if (val instanceof HTMLElement || val instanceof Element) return undefined;
        return val;
    }));
    return (await api.put('/api/overlay/settings', clean)).data;
    };

    export const VoiceSettingsPage = ({ user, onCopyUrl }) => {
    const queryClient = useQueryClient();
    const [localSettings, setLocalSettings] = useState(null);
    const [showToast, setShowToast]         = useState(false);

    const { data: profileData } = useQuery({
        queryKey: ['profile'],
        queryFn: fetchProfile,
        refetchInterval: 60000,
    });

    useEffect(() => {
        if (profileData) {
            const s = profileData.settings || profileData.overlaySetting || {};
            setLocalSettings({
                voiceBaseDuration:   s.voiceBaseDuration   ?? 10,
                voiceExtraPerAmount: s.voiceExtraPerAmount ?? 10000,
                voiceExtraDuration:  s.voiceExtraDuration  ?? 5,
                ...s,                    // ini tetap dipertahankan
            });
        }
    }, [profileData]); // hapus kondisi !localSettings

    const saveSettingsMutation = useMutation({
        mutationFn: saveSettings,
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        toast.success('✅ Pengaturan voice tersimpan!');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Gagal menyimpan'),
    });

    const upd = useCallback((key, val) => {
        setLocalSettings(prev => ({ ...prev, [key]: val }));
    }, []);

    const handleCopy = (url, label) => {
        navigator.clipboard.writeText(url);
        toast.success(`✅ URL ${label} tersalin!`);
        if (onCopyUrl) onCopyUrl(url, label);
    };

    if (!localSettings) {
        return (
        <div className="flex items-center justify-center py-20 text-slate-400 font-bold gap-3">
            <div className="w-5 h-5 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin" />
            Memuat pengaturan...
        </div>
        );
    }

    return (
        <div className="space-y-6 pb-6 w-full">
        {/* ── Save Toast ── */}
        <AnimatePresence>
            {showToast && (
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 20, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/70 text-white px-8 py-4 rounded-none shadow-2xl flex items-center gap-3 font-bold border border-white/10 backdrop-blur-md"
            >
                <CheckCircle2 size={18} className="text-green-500" /> Pengaturan Voice Tersimpan!
            </motion.div>
            )}
        </AnimatePresence>

        {/* Info card */}
        <VoiceSettingsInfo />

        {/* URL Overlay */}
        {user?.overlayToken && (
            <VoiceOverlayUrls overlayToken={user.overlayToken} onCopy={handleCopy} />
        )}

        {/* Durasi */}
        <VoiceDurationSettings
            settings={localSettings}
            onChange={upd}
            saveSettingsMutation={saveSettingsMutation}
        />

        {/* Instant Test */}
        <InstantTestVoice user={user} localSettings={localSettings} />
        </div>
    );
    };

    export default VoiceSettingsPage;