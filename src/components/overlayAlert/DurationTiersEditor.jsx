import { Plus, Save, Trash2 } from 'lucide-react';
import { SectionHeader } from './AlertConfig';
import { Timer } from 'lucide-react';

const DurationTiersEditor = ({ tiers, onChange, saveSettingsMutation, settings }) => {
  const addTier    = () => onChange([...tiers, { minAmount: 0, maxAmount: null, duration: 10 }]);
  const removeTier = (i) => onChange(tiers.filter((_, idx) => idx !== i));
  const updateTier = (i, key, val) =>
    onChange(tiers.map((t, idx) => idx === i ? { ...t, [key]: val === '' ? null : Number(val) } : t));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-none p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800">
      <SectionHeader icon={<Timer size={20} />} title="Durasi Tampil per Nominal" color="bg-amber-500" />

      <div className="space-y-3 mt-5">
        {tiers.map((tier, i) => (
          <div key={i} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-none p-4 border border-slate-100 dark:border-slate-700">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                ['Min (Rp)', 'minAmount', tier.minAmount],
                ['Max (Rp, kosong=∞)', 'maxAmount', tier.maxAmount ?? ''],
                ['Durasi (detik)', 'duration', tier.duration],
              ].map(([lbl, key, val]) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{lbl}</label>
                  <input
                    type="number"
                    value={val}
                    placeholder={key === 'maxAmount' ? '∞' : ''}
                    onChange={e => updateTier(i, key, e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-none font-bold text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-400"
                  />
                </div>
              ))}
            </div>
            <button onClick={() => removeTier(i)}
              className="cursor-pointer active:scale-[0.97] text-red-400 hover:text-red-600 transition-colors flex-shrink-0 p-1">
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <button onClick={addTier}
          className="cursor-pointer active:scale-[0.97] w-full py-3 border-2 border-dashed border-indigo-200 dark:border-indigo-900 text-indigo-500 dark:text-indigo-400 rounded-none font-black text-sm hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all flex items-center justify-center gap-2">
          <Plus size={16} /> Tambah Ketentuan Durasi
        </button>

        <button
          onClick={() => saveSettingsMutation.mutate(settings)}
          disabled={saveSettingsMutation.isPending}
          className="cursor-pointer active:scale-[0.97] hover:brightness-90 w-full bg-slate-900 dark:bg-slate-700 text-white py-4 rounded-none font-black text-sm transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-70 flex items-center justify-center gap-2"
        >
          <Save size={20} />
          {saveSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Durasi Terbaru'}
        </button>
      </div>
    </div>
  );
};

export default DurationTiersEditor;