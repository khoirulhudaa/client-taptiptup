import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Save, ShieldCheck, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../lib/axiosInstance';
import { SectionHeader } from './AlertConfig';

const fetchBannedWords = async () => (await api.get('/api/banned-words')).data;
const saveBannedWords  = async (d) => (await api.put('/api/banned-words', d)).data;

const BannedWordsEditor = ({ saveSettingsMutation, settings }) => {
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [localAction, setLocalAction] = useState('block');
  const [localReplacement, setLocalReplacement] = useState('');
  const [synced, setSynced] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['bannedWords'], queryFn: fetchBannedWords });
  const words = data?.words || [];

  useEffect(() => {
    if (data && !synced) {
      setLocalAction(data.action || 'block');
      setLocalReplacement(data.replacement || '');
      setSynced(true);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: saveBannedWords,
    onSuccess: (responseData) => queryClient.setQueryData(['bannedWords'], responseData),
  });

  const save = (overrides = {}) =>
    saveMutation.mutate({ words, action: localAction, replacement: localReplacement, ...overrides });

  const add = () => {
    const w = input.trim().toLowerCase();
    if (!w || words.includes(w)) return;
    save({ words: [...words, w] });
    setInput('');
  };

  const remove = (word) => save({ words: words.filter(w => w !== word) });

  const ACTION_OPTIONS = [
    { id: 'block',   emoji: '🚫', title: 'Tolak Pesan',  desc: 'Donasi dengan kata terlarang langsung ditolak.', active: 'border-red-500 bg-red-50 dark:bg-red-950/30' },
    { id: 'censor',  emoji: '✱',  title: 'Sensor Kata',  desc: 'Kata diganti dengan bintang (***). Donasi tetap masuk.', active: 'border-amber-500 bg-amber-50 dark:bg-amber-950/30' },
    { id: 'replace', emoji: '✏️', title: 'Ganti Teks',   desc: 'Kata diganti dengan teks pilihanmu.', active: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-none p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-7">
      <SectionHeader icon={<ShieldCheck size={20} />} title="Filter Kata Terlarang" color="bg-red-500" />

      <div className="space-y-3">
        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Aksi saat kata terlarang terdeteksi
        </label>
        <div className="grid grid-cols-1 gap-3">
          {ACTION_OPTIONS.map(opt => (
            <button key={opt.id}
              onClick={() => { setLocalAction(opt.id); saveMutation.mutate({ words, action: opt.id, replacement: localReplacement }); }}
              className={`cursor-pointer active:scale-[0.99] text-left p-4 rounded-none border-2 transition-all space-y-1.5 ${
                localAction === opt.id
                  ? opt.active + ' shadow-md'
                  : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
              }`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{opt.emoji}</span>
                <span className="font-black text-sm text-slate-700 dark:text-slate-200">{opt.title}</span>
              </div>
              <p className="text-[11px] font-medium leading-relaxed text-slate-400 dark:text-slate-500">{opt.desc}</p>
            </button>
          ))}
        </div>

        {localAction === 'replace' && (
          <input
            value={localReplacement}
            onChange={e => setLocalReplacement(e.target.value)}
            onBlur={() => save({ replacement: localReplacement })}
            placeholder="contoh: [dihapus], ❤️, [sensor]"
            className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-none px-5 py-3 font-bold text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-400 transition-all"
          />
        )}
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800" />

      <div className="space-y-4">
        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Daftar kata terlarang
        </label>
        <div className="md:flex gap-3 md:space-y-0 space-y-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
            placeholder="Ketik kata lalu tekan Enter..."
            className="w-full flex-1 bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-none px-5 py-3 font-bold text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-red-400 transition-all"
          />
          <button onClick={add}
            className="md:w-max w-max mt-1 md:mt-0 cursor-pointer active:scale-[0.97] px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-none font-black text-sm transition-all flex items-center gap-2">
            <Plus size={16} /> Tambah
          </button>
        </div>

        {isLoading
          ? <div className="text-slate-400 text-sm font-bold animate-pulse">Memuat...</div>
          : words.length === 0
            ? (
              <div className="rounded-none border-2 border-dashed border-slate-200 dark:border-slate-700 py-8 text-center text-slate-400">
                <p className="text-2xl mb-2">🚫</p>
                <p className="font-black text-sm">Belum ada kata terlarang</p>
              </div>
            )
            : (
              <div className="flex flex-wrap gap-2">
                {words.map(word => (
                  <span key={word} className="w-max flex justify-center md:justify-start items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-none text-sm font-black border border-red-100 dark:border-red-900">
                    {word}
                    <button onClick={() => remove(word)} className="cursor-pointer hover:text-red-800 dark:hover:text-red-300 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )
        }

        <button
          onClick={() => saveSettingsMutation.mutate(settings)}
          disabled={saveSettingsMutation.isPending}
          className="cursor-pointer active:scale-[0.97] hover:brightness-90 w-full bg-slate-900 dark:bg-slate-700 text-white py-4 rounded-none font-black text-sm transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-70 flex items-center justify-center gap-2"
        >
          <Save size={20} />
          {saveSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Filter Kata'}
        </button>
      </div>
    </div>
  );
};

export default BannedWordsEditor;