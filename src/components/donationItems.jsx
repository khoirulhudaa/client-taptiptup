import { AnimatePresence, motion } from 'framer-motion';
import { Diamond, Flower, Plus, Save, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

const EMOJI_PRESETS = [
  { emoji: '☕', label: 'Kopi' },
  { emoji: '🍕', label: 'Pizza' },
  { emoji: '🎮', label: 'Game' },
  { emoji: '🌸', label: 'Bunga' },
  { emoji: '💎', label: 'Berlian' },
  { emoji: '🚀', label: 'Roket' },
  { emoji: '🎁', label: 'Hadiah' },
  { emoji: '🍜', label: 'Mie' },
  { emoji: '🧋', label: 'Boba' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '⭐', label: 'Bintang' },
  { emoji: '🍣', label: 'Sushi' },
  { emoji: '🍰', label: 'Kue' },
  { emoji: '🎯', label: 'Target' },
  { emoji: '💡', label: 'Ide' },
  { emoji: '🦄', label: 'Unicorn' },
  { emoji: '🐉', label: 'Naga' },
  { emoji: '🌈', label: 'Pelangi' },
  { emoji: '💰', label: 'Uang' },
  { emoji: '👑', label: 'Mahkota' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '🎸', label: 'Gitar' },
  { emoji: '🏎️', label: 'Mobil Balap' },
  { emoji: '✈️', label: 'Pesawat' },
  { emoji: '🌹', label: 'Mawar' },
  { emoji: '🦋', label: 'Kupu-kupu' },
  { emoji: '🍔', label: 'Burger' },
  { emoji: '🥤', label: 'Minuman' },
  { emoji: '💍', label: 'Cincin' },
  { emoji: '🏆', label: 'Trofi' },
  { emoji: '🎊', label: 'Party' },
  { emoji: '🎇', label: 'Kembang Api' },
  { emoji: '🛥️', label: 'Yacht' },
  { emoji: '🚁', label: 'Helikopter' },
  { emoji: '🦁', label: 'Singa' },
];

const getTierColor = (amount) => {
  if (amount >= 500000) return { bg: 'from-yellow-400 to-amber-500',   badge: 'bg-amber-500',  text: 'LEGENDARY' };
  if (amount >= 100000) return { bg: 'from-purple-400 to-violet-600',  badge: 'bg-violet-500', text: 'EPIC'      };
  if (amount >= 50000)  return { bg: 'from-blue-400 to-cyan-500',      badge: 'bg-blue-500',   text: 'RARE'      };
  if (amount >= 10000)  return { bg: 'from-emerald-400 to-green-500',  badge: 'bg-emerald-500',text: 'UNCOMMON'  };
  return                       { bg: 'from-slate-300 to-slate-400',    badge: 'bg-slate-400',  text: 'COMMON'    };
};

// ── InputField with label ──────────────────────────────────────────────────────
const InputField = ({ label, className = '', inputClassName = '', ...props }) => (
  <div className={`w-full flex pl-[2.7px] items-center bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-all shadow-sm ${className}`}>
    <div className="w-max px-3 py-3 rounded-lg text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap border-r border-slate-200 dark:border-slate-700 bg-slate-200/50 dark:bg-slate-700/50">
      {label}
    </div>
    <input
      className={`flex-1 bg-transparent p-3 pl-3 outline-none font-bold text-sm text-slate-900 dark:text-slate-100 ${inputClassName}`}
      {...props}
    />
  </div>
);

// ── Single Item Row ────────────────────────────────────────────────────────────
const ItemRow = ({ item, index, onChange, onRemove }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-visible"
    >
      <div className="p-3 space-y-2">
        {/* Row 1: Emoji + Nama + Hapus */}
        <div className="flex items-center gap-3">
          {/* Nama item */}
          <InputField
            label={`Item ${index + 1}`}
            type="text"
            value={item.name || ''}
            onChange={(e) => onChange(index, 'name', e.target.value)}
            placeholder="contoh: Kopi"
            maxLength={30}
            className="flex-1"
          />

            <div className="relative" ref={pickerRef}>
            <button
              onClick={() => setShowEmojiPicker(v => !v)}
              className="
                 text-slate-900 dark:text-white
                -translate-y-[3px] translate-x-[-3px]
                [box-shadow:4px_6px_0_#f1f5f9]
                dark:[box-shadow:4px_4px_0_#99a3b1]
                hover:translate-y-0 hover:translate-x-0
                border border-slate-300
                hover:[box-shadow:0_0_0_#f1f5f9]
                dark:hover:[box-shadow:0_0_0_#94a3b8]
                active:translate-y-[2px] active:translate-x-[2px]
                active:[box-shadow:none]
                active:bg-slate-300 dark:active:bg-slate-800
              w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all cursor-pointer active:scale-95"
            >
              {item.emoji || '❓'}
            </button>
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute z-[999999999999999999] shadow-2xl right-[-56px] top-13 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 md:w-max w-[83.5vw] h-max overflow-y-auto"
                >
                  <div className="grid grid-cols-7 md:grid-cols-10 gap-3">
                    {EMOJI_PRESETS.map(({ emoji, label }) => (
                      <button
                        key={emoji}
                        onClick={() => { onChange(index, 'emoji', emoji); setShowEmojiPicker(false); }}
                        title={label}
                        className={`
                            text-slate-900 dark:text-white
                          -translate-y-[3px] translate-x-[-3px]
                          [box-shadow:4px_6px_0_#f1f5f9]
                          dark:[box-shadow:4px_4px_0_#99a3b1]
                          hover:translate-y-0 hover:translate-x-0
                          hover:[box-shadow:0_0_0_#f1f5f9]
                          dark:hover:[box-shadow:0_0_0_#94a3b8]
                          active:translate-y-[2px] active:translate-x-[2px]
                          active:[box-shadow:none]
                          border border-slate-300
                          active:bg-slate-300 dark:active:bg-slate-800
                          w-9 h-9 rounded-xl flex items-center justify-center text-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all cursor-pointer active:scale-95 ${
                          item.emoji === emoji
                            ? 'bg-blue-100 dark:bg-blue-900/50 ring-2 ring-blue-500'
                            : 'bg-slate-50 dark:bg-slate-800'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 border-t border-slate-100 dark:border-slate-700 pt-2">
                    <InputField
                      label="Emoji"
                      type="text"
                      value={item.emoji || ''}
                      onChange={(e) => onChange(index, 'emoji', e.target.value.slice(0, 2))}
                      placeholder="😊"
                      inputClassName="text-center text-lg"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => onRemove(index)}
            className="
               text-slate-900 dark:text-white
              -translate-y-[3px] translate-x-[-3px]
              [box-shadow:4px_6px_0_#f1f5f9]
              dark:[box-shadow:4px_4px_0_#99a3b1]
              hover:translate-y-0 hover:translate-x-0
              border border-slate-300
              hover:[box-shadow:0_0_0_#f1f5f9]
              dark:hover:[box-shadow:0_0_0_#94a3b8]
              active:translate-y-[2px] active:translate-x-[2px]
              active:[box-shadow:none]
              active:bg-slate-300 dark:active:bg-slate-800
            shrink-0 cursor-pointer bg-red-700 h-[44px] w-[44px] flex justify-center items-center text-slate-300 hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-800 rounded-xl transition-all active:scale-95"
          >
            <Trash2 size={18} className='relative left-[-1px]' />
          </button>
        </div>

        {/* Row 2: Nominal + Maks Qty */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-3">
          <InputField
            label="Nominal"
            type="number"
            value={item.price || ''}
            onChange={(e) => onChange(index, 'price', Number(e.target.value))}
            placeholder="10000"
            min={0}
            className="flex-1"
            inputClassName="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <InputField
            label="Maks Qty"
            type="number"
            value={item.maxQty ?? 1000}
            onChange={(e) => onChange(index, 'maxQty', Math.max(1, Number(e.target.value)))}
            min={1}
            max={100}
            className="hidden"
            inputClassName="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          {/* Row 3: Deskripsi */}
          <InputField
            label="Deskripsi"
            type="text"
            className='md:flex hidden '
            value={item.description || `Item`}
            onChange={(e) => onChange(index, 'description', e.target.value)}
            placeholder="Item 1"
            maxLength={60}
          />
        </div>
      </div>
    </motion.div>
  );
};

// ── Preview Card ───────────────────────────────────────────────────────────────
const ItemPreviewCard = ({ item }) => {
  const tier = getTierColor(item.price || 0);
  return (
    <div className="relative bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700">
      <div className={`h-0.5 w-full bg-gradient-to-r ${tier.bg}`} />
      <div className="p-3 text-center space-y-1.5">
        <div className="text-3xl">{item.emoji || '❓'}</div>
        <p className="font-black text-xs text-slate-800 dark:text-slate-100 leading-tight">{item.name || '—'}</p>
        {item.description && (
          <p className="text-[9px] text-slate-400 font-medium leading-tight">{item.description}</p>
        )}
        <p className="font-black text-xs text-blue-600 dark:text-blue-400">
          Rp {Number(item.price || 0).toLocaleString('id-ID')}
        </p>
        {(item.maxQty ?? 100) > 1 && (
          <p className="text-[9px] text-slate-400 font-medium">maks {item.maxQty ?? 1000}×</p>
        )}
      </div>
    </div>
  );
};

// ── Mode descriptions ──────────────────────────────────────────────────────────
const MODE_OPTIONS = [
  {
    value: 'both',
    label: 'Semua',
    desc: 'Donor bisa item atau isi nominal',
    icon: '🔀',
  },
  {
    value: 'items_only',
    label: 'Gift Item',
    desc: 'Donor hanya bisa pilih item',
    icon: '🎁',
  },
  {
    value: 'amount_only',
    label: 'Nominal',
    desc: 'Donor hanya bisa pilih nominal',
    icon: '💸',
  },
];


// ── Main Editor ────────────────────────────────────────────────────────────────
const DonationItemsEditor = ({
  items = [],
  onChange,
  saveSettingsMutation,
  settings,
  activeSlot,
}) => {
  const [localItems, setLocalItems] = useState(() => items.map(i => ({ ...i })));
  const [showPreview, setShowPreview] = useState(false);
  const [blockModal, setBlockModal] = useState(null); // { title, body }
  const [localMode, setLocalMode] = useState(
    settings.donationItemsMode ||
    (settings.donationItemsEnabled ? 'both' : 'amount_only')
  );

  useEffect(() => {
    if (settings.donationItemsMode) {
      setLocalMode(settings.donationItemsMode);
    } else {
      setLocalMode(settings.donationItemsEnabled ? 'both' : 'amount_only');
    }
  }, [settings.donationItemsMode, settings.donationItemsEnabled]);

  useEffect(() => {
    setLocalItems(items.map(i => ({ ...i })));
  }, [items]);

  const handleChange = useCallback((index, key, value) => {
    setLocalItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  }, []);

  const BlockModal = () => {
    if (!blockModal) return null;
    return (
      <div
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 3, padding: '1rem',
        }}
        onClick={() => setBlockModal(null)}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-sm text-center flex justify-center items-center flex-col shadow-2xl space-y-4"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-2xl">
            ⚠️
          </div>
          <div>
            <h3 className="font-black text-slate-800 dark:text-slate-100 text-base">{blockModal.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{blockModal.body}</p>
          </div>
          <button
            onClick={() => setBlockModal(null)}
            className="cursor-pointer w-full py-3 bg-slate-900 dark:bg-slate-700 text-white font-black text-sm rounded-xl active:scale-[0.99] hover:brightness-90 transition-all"
          >
            Oke, tambah item dulu
          </button>
        </motion.div>
      </div>
    );
  };

  const handleRemove = useCallback((index) => {
    const next = localItems.filter((_, i) => i !== index);
    setLocalItems(next);
    onChange(next);
  }, [localItems, onChange]);

  const handleAdd = () => {
    if (localItems.length >= 20) return;
    const next = [
      ...localItems,
      { id: Date.now().toString(), emoji: '🎁', name: '', price: 10000, description: '', maxQty: 1000 },
    ];
    setLocalItems(next);
    onChange(next);
  };

  const syncAndSave = () => {
    if (currentMode !== 'amount_only') {
      const valid = localItems.filter(i => i.name && i.price > 0);
      if (valid.length === 0) {
        setBlockModal({
          title: 'Tambahkan item',
          body: 'Kamu harus mengisi minimal 1 item sebelum menyimpan mode ini',
        });
        return;
      }
    }
    onChange(localItems);
    saveSettingsMutation.mutate({
      settings: {
        ...settings,
        donationItems: localItems,
        donationItemsMode: localMode,
        donationItemsEnabled: localMode !== 'amount_only',
      },
      slot: activeSlot,
    });
  };

  const handleModeChange = (mode) => {
    setLocalMode(mode);
  };

  const currentMode = localMode;
  const sortedPreview = [...localItems].filter(i => i.name && i.price > 0).sort((a, b) => a.price - b.price);

  return (
    <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl p-3 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-4.5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <Flower />
          </div>
          <div>
            <h4 className="text-sm uppercase md:capitalize md:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Jenis Dukungan
            </h4>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {blockModal && <BlockModal />}
      </AnimatePresence>

      {/* Preview grid */}
      <AnimatePresence>
        {showPreview && sortedPreview.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Tampilan di halaman dukungan
              </p>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {sortedPreview.map((item, i) => (
                  <ItemPreviewCard key={item.id || i} item={item} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        {showPreview && sortedPreview.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-6 text-slate-400 dark:text-slate-500 text-sm font-medium"
          >
            Tambahkan item dulu untuk melihat preview
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Selector */}
      <div className="space-y-3">
        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Mode Tampilan Dukungan
        </label>
        <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
          {MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleModeChange(opt.value)}
              className={`
                 text-slate-900 dark:text-white 
                  -translate-y-[3px] translate-x-[-3px]
                  [box-shadow:4px_6px_0_#f1f5f9]
                  dark:[box-shadow:4px_4px_0_#99a3b1]
                  hover:translate-y-0 hover:translate-x-0
                  border border-slate-300
                  hover:[box-shadow:0_0_0_#f1f5f9]
                  dark:hover:[box-shadow:0_0_0_#94a3b8]
                  active:translate-y-[2px] active:translate-x-[2px]
                  active:[box-shadow:none]
                  active:bg-slate-300 dark:active:bg-slate-800
                text-left px-4 pt-2.5 pb-3.5 rounded-xl border-2 transition-all cursor-pointer active:scale-[0.99] ${
                currentMode === opt.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-300 bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-center md:justify-start gap-2 relative top-[1px]">
                <div>
                  <span className={`font-black text-xs ${
                    currentMode === opt.value
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}>
                    {opt.label}
                  </span>
                  <p className={`text-[10px] md:flex hidden font-medium leading-relaxed ${
                    currentMode === opt.value
                      ? 'text-blue-500 dark:text-blue-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {opt.desc}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Item list */}
      {currentMode !== 'amount_only' && (
        <>
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              <div className='grid grid-cols-1 md:grid-cols-1 gap-3'>
                {localItems.map((item, index) => (
                  <ItemRow
                    key={item.id || index}
                    item={item}
                    index={index}
                    onChange={handleChange}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </AnimatePresence>

            {localItems.length === 0 && (
              <div className="text-center py-8 text-slate-300 dark:text-slate-400">
                <div className="text-4xl mb-3">🎁</div>
                <p className="text-sm font-bold">Belum ada item</p>
                <p className="text-xs font-medium mt-1">Klik tombol di bawah untuk menambah item pertama</p>
              </div>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={localItems.length >= 20}
            className="cursor-pointer active:scale-[0.99] w-full py-3 border-1 border-dashed border-pink-200 dark:border-pink-900 text-pink-500 dark:text-pink-400 rounded-xl font-black text-sm hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/30 transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Tambah Item Dukungan
            <Plus size={16} />
          </button>

          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-400 font-medium">
              {localItems.length} / 20 item
            </p>
            {localItems.length >= 20 && (
              <p className="text-[10px] text-orange-500 font-bold">Maksimal 20 item</p>
            )}
          </div>

        </>
      )}
      <button
        onClick={syncAndSave}
        disabled={saveSettingsMutation.isPending}
        className="
        text-slate-900 dark:text-white bg-slate-100 dark:bg-white/20
        -translate-y-[3px] translate-x-[-3px]
        [box-shadow:4px_6px_0_#f1f5f9]
        dark:[box-shadow:4px_4px_0_#99a3b1]
        hover:translate-y-0 hover:translate-x-0
        hover:bg-slate-200 dark:hover:bg-slate-700
        border border-slate-300
        hover:[box-shadow:0_0_0_#f1f5f9]
        dark:hover:[box-shadow:0_0_0_#94a3b8]
        active:translate-y-[2px] active:translate-x-[2px]
        active:[box-shadow:none]
        active:bg-slate-300 dark:active:bg-slate-800
        cursor-pointer active:scale-[0.99] hover:brightness-90 w-full bg-slate-900/70 dark:bg-slate-700 text-white py-3 md:py-4 rounded-xl font-black text-sm transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-70 flex items-center justify-center gap-3"
      >
        <Save size={20} />
        {saveSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Sekarang'}
      </button>
    </div>
  );
};

export default DonationItemsEditor;