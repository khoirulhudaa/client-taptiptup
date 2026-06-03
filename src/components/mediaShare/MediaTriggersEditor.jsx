import { ImageIcon, Plus, Save, Trash2, Video } from 'lucide-react';
import { SectionHeader } from '../overlayAlert/AlertConfig';

const MediaTriggersEditor = ({ triggers, onChange, saveSettingsMutation, settings }) => {
  const add    = () => onChange([...triggers, { minAmount: 50000, mediaType: 'both', label: '' }]);
  const remove = (i) => onChange(triggers.filter((_, idx) => idx !== i));
  const update = (i, key, val) =>
    onChange(triggers.map((t, idx) => idx === i ? { ...t, [key]: val } : t));

  const mediaTypeOptions = [
    { value: 'image', icon: <ImageIcon size={13} />, label: 'Gambar', desc: 'jpg, gif, png' },
    { value: 'video', icon: <Video size={13} />,     label: 'Video',  desc: 'mp4, webm'    },
    { value: 'both',  icon: <span className="flex items-center gap-0.5"><ImageIcon size={11} /><Video size={11} /></span>, label: 'Keduanya', desc: 'gambar & video' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-none p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800">
      <SectionHeader icon={<ImageIcon size={20} />} title="Izinkan Donor Kirim Media" color="bg-purple-500" />

      <div className="space-y-4 mt-6">
        {triggers.length === 0 && (
          <div className="rounded-none bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 px-5 py-6 text-center">
            <div className="w-10 h-10 rounded-none bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
              <ImageIcon size={18} className="text-slate-400" />
            </div>
            <p className="text-sm font-black text-slate-500 dark:text-slate-400">Belum ada ketentuan media</p>
          </div>
        )}

        {triggers.map((t, i) => (
          <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-none p-5 border border-slate-100 dark:border-slate-700 space-y-5">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-700 dark:text-slate-200 text-sm">{t.label || `Media Alert ${i + 1}`}</span>
              <button onClick={() => remove(i)}
                className="cursor-pointer active:scale-[0.97] text-red-400 hover:text-red-600 transition-colors p-1">
                <Trash2 size={15} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['Label (opsional)', 'label', t.label, 'text', 'contoh: Sultan Alert'],
                ['Nominal Min (Rp)', 'minAmount', t.minAmount, 'number', ''],
              ].map(([lbl, key, val, type, ph]) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{lbl}</label>
                  <input type={type} value={val} placeholder={ph}
                    onChange={e => update(i, key, type === 'number' ? Number(e.target.value) : e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-none font-bold text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-400 transition-all"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {mediaTypeOptions.map(opt => (
                <button key={opt.value} onClick={() => update(i, 'mediaType', opt.value)}
                  className={`cursor-pointer active:scale-[0.97] flex flex-col items-center gap-1.5 py-3 px-2 rounded-none border-2 font-black text-xs transition-all ${
                    t.mediaType === opt.value
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-100 dark:border-slate-700 text-slate-400 hover:border-slate-300 hover:bg-white dark:hover:bg-slate-700'
                  }`}>
                  {opt.icon}
                  <span>{opt.label}</span>
                  <span className="text-[9px] font-medium text-slate-300 dark:text-slate-500">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        <button onClick={add}
          className="cursor-pointer active:scale-[0.97] w-full py-3 border-2 border-dashed border-indigo-200 dark:border-indigo-900 text-indigo-500 dark:text-indigo-400 rounded-none font-black text-sm hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all flex items-center justify-center gap-2">
          <Plus size={16} /> Tambah Ketentuan Media Alert
        </button>

        <button
          onClick={() => saveSettingsMutation.mutate(settings)}
          disabled={saveSettingsMutation.isPending}
          className="cursor-pointer active:scale-[0.97] hover:brightness-90 w-full bg-slate-900 dark:bg-slate-700 text-white py-4 rounded-none font-black text-sm transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-70 flex items-center justify-center gap-2"
        >
          <Save size={20} />
          {saveSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Izin Media'}
        </button>
      </div>
    </div>
  );
};

export default MediaTriggersEditor;