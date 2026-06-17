import { AnimatePresence, motion } from 'framer-motion';
import { GripVertical, Plus, Save, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

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
  { emoji: '🎵', label: 'Musik' },
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

  // Tambahan
  { emoji: '👑', label: 'Mahkota' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '🎤', label: 'Mic' },
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
  { emoji: '🐻', label: 'Beruang' },
  { emoji: '🌙', label: 'Bulan' },
  { emoji: '☀️', label: 'Matahari' },
];

const getTierColor = (amount) => {
  if (amount >= 500000) return { bg: 'from-yellow-400 to-amber-500',   badge: 'bg-amber-500',  text: 'LEGENDARY' };
  if (amount >= 100000) return { bg: 'from-purple-400 to-violet-600',  badge: 'bg-violet-500', text: 'EPIC'      };
  if (amount >= 50000)  return { bg: 'from-blue-400 to-cyan-500',      badge: 'bg-blue-500',   text: 'RARE'      };
  if (amount >= 10000)  return { bg: 'from-emerald-400 to-green-500',  badge: 'bg-emerald-500',text: 'UNCOMMON'  };
  return                       { bg: 'from-slate-300 to-slate-400',    badge: 'bg-slate-400',  text: 'COMMON'    };
};

// ── Single Item Row ────────────────────────────────────────────────────────────
const ItemRow = ({ item, index, onChange, onRemove }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef(null);
  const tier = getTierColor(item.price || 0);

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
      className="bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 overflow-visible"
    >
      {/* <div className={`h-1 w-full bg-gradient-to-r ${tier.bg}`} /> */}
      <div className="p-4 space-y-1">
        <div className="flex items-center gap-3">
          {/* Emoji picker */}
          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => setShowEmojiPicker(v => !v)}
              className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all cursor-pointer active:scale-95 border-2 border-slate-200 dark:border-slate-600"
            >
              {item.emoji || '❓'}
            </button>
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute shadow-2xl left-[-2.1px] top-13 z-[99999] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 md:w-max w-[83.5vw] h-max overflow-y-auto"
                >
                  {/* <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Pilih Ikon Item</p> */}
                  <div className="grid grid-cols-7 md:grid-cols-10 gap-1.5">
                    {EMOJI_PRESETS.map(({ emoji, label }) => (
                      <button
                        key={emoji}
                        onClick={() => { onChange(index, 'emoji', emoji); setShowEmojiPicker(false); }}
                        title={label}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all cursor-pointer active:scale-95 ${
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
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Atau ketik emoji</p>
                    <input
                      type="text"
                      value={item.emoji || ''}
                      onChange={(e) => onChange(index, 'emoji', e.target.value.slice(0, 2))}
                      placeholder="😊"
                      className="w-full py-2.5 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-bold text-lg outline-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <input
            type="text"
            value={item.name || ''}
            onChange={(e) => onChange(index, 'name', e.target.value)}
            placeholder={`Item ${index + 1} (contoh: Kopi)`}
            maxLength={30}
            className="w-[71%] md:flex-1 p-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-lg font-bold text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-blue-400 transition-all"
          />

          <button
            onClick={() => onRemove(index)}
            className="shrink-0 cursor-pointer bg-red-700 h-[40px] w-[40px] flex justify-center items-center text-slate-300 hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-800 rounded-lg transition-all active:scale-95"
          >
            <Trash2 size={16} className='relative left-[-1px]' />
          </button>
        </div>

        <div className="flex items-center gap-2.5 mt-3">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Nominal</label>
            <input
              type="number"
              value={item.price || ''}
              onChange={(e) => onChange(index, 'price', Number(e.target.value))}
              placeholder="10000"
              min={0}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-lg font-black text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-blue-400 transition-all"
            />
          </div>

          {/* Max quantity per order */}
          <div className="flex flex-col gap-1 min-w-[90px]">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Maks qty</label>
            <input
              type="number"
              value={item.maxQty ?? 10}
              onChange={(e) => onChange(index, 'maxQty', Math.max(1, Number(e.target.value)))}
              min={1}
              max={99}
              className="w-full px-2.5 py-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-lg font-black text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-blue-400 transition-all text-center"
            />
          </div>
        </div>

        <div className="mt-[-4px]">
          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Deskripsi</label>
          <input
            type="text"
            value={item.description || ''}
            onChange={(e) => onChange(index, 'description', e.target.value)}
            placeholder="Deskripsi singkat (opsional)"
            maxLength={60}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-lg font-medium text-xs text-slate-500 dark:text-slate-400 outline-none focus:border-blue-400 transition-all"
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
    <div className="relative bg-white dark:bg-slate-800 rounded-lg border-2 border-slate-100 dark:border-slate-700">
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
        {(item.maxQty ?? 10) > 1 && (
          <p className="text-[9px] text-slate-400 font-medium">maks {item.maxQty ?? 10}×</p>
        )}
      </div>
    </div>
  );
};

// ── Mode descriptions ──────────────────────────────────────────────────────────
const MODE_OPTIONS = [
  {
    value: 'both',
    label: 'Item + Nominal',
    desc: 'Donor bisa item atau isi nominal',
    icon: '🔀',
  },
  {
    value: 'items_only',
    label: 'Item Saja',
    desc: 'Donor hanya bisa pilih item',
    icon: '🎁',
  },
  {
    value: 'amount_only',
    label: 'Nominal Saja',
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
    // JANGAN panggil onChange di sini → ini penyebab undo
  }, []);

  const handleRemove = useCallback((index) => {
    const next = localItems.filter((_, i) => i !== index);
    setLocalItems(next);
    onChange(next);
  }, [localItems, onChange]);

  const handleAdd = () => {
    if (localItems.length >= 20) return;
    const next = [
      ...localItems,
      { id: Date.now().toString(), emoji: '🎁', name: '', price: 10000, description: '', maxQty: 10 },
    ];
    setLocalItems(next);
    onChange(next);
  };

  const syncAndSave = () => {
    // Update parent dulu
    onChange(localItems);

    saveSettingsMutation.mutate({
      settings: { 
        ...settings, 
        donationItems: localItems,
        donationItemsMode: localMode,
        donationItemsEnabled: localMode !== 'amount_only'
      },
      slot: activeSlot,
    });
  };

  const handleModeChange = (mode) => {
    setLocalMode(mode); // Optimistic update

    const enabled = mode !== 'amount_only';
    saveSettingsMutation.mutate({
      settings: { 
        ...settings, 
        donationItemsEnabled: enabled, 
        donationItemsMode: mode 
      },
      slot: activeSlot,
    });
  };

  const currentMode = localMode; // pakai localMode

  // const currentMode = settings.donationItemsMode || (settings.donationItemsEnabled ? 'both' : 'amount_only');

  const sortedPreview = [...localItems].filter(i => i.name && i.price > 0).sort((a, b) => a.price - b.price);

  return (
    <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 w-11 h-11 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg flex items-center justify-center text-white shadow-lg flex-shrink-0">
            🎁
          </div>
          <div>
            <h4 className="text-sm uppercase md:capitalize md:text-base font-black text-slate-800 dark:text-white">
              Item Donasi
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              Donor bisa pilih item atau nominal langsung
            </p>
          </div>
        </div>
      </div>

      {/* Preview grid */}
      <AnimatePresence>
        {showPreview && sortedPreview.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Tampilan di halaman donasi
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

      {/* ── MODE SELECTOR (3 pilihan) ── */}
      <div className="space-y-2">
        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Mode Tampilan Donasi
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
          {MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleModeChange(opt.value)}
              className={`text-left px-4 pt-2.5 pb-3.5 rounded-xl border-2 transition-all cursor-pointer active:scale-[0.99] ${
                currentMode === opt.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 relative top-[1px]">
                {/* <span className="text-2xl relative ml-[-2.1px]">{opt.icon}</span> */}
                <div>
                  <span className={`font-black text-xs ${
                    currentMode === opt.value
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}>
                    {opt.label}
                  </span>
                  <p className={`text-[10px] font-medium leading-relaxed ${
                    currentMode === opt.value
                      ? 'text-blue-500 dark:text-blue-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {opt.desc}
                  </p>
                </div>
                {/* {currentMode === opt.value && (
                  <span className="ml-auto text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded-md font-black">AKTIF</span>
                )} */}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Item list — hanya tampil kalau mode bukan amount_only */}
      {currentMode !== 'amount_only' && (
        <>
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {localItems.map((item, index) => (
                <ItemRow
                  key={item.id || index}
                  item={item}
                  index={index}
                  onChange={handleChange}
                  onRemove={handleRemove}
                />
              ))}
            </AnimatePresence>

            {localItems.length === 0 && (
              <div className="text-center py-8 text-slate-300 dark:text-slate-600">
                <div className="text-4xl mb-3">🎁</div>
                <p className="text-sm font-bold">Belum ada item</p>
                <p className="text-xs font-medium mt-1">Klik tombol di bawah untuk menambah item pertama</p>
              </div>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={localItems.length >= 20}
            className="cursor-pointer active:scale-[0.99] w-full py-3 border-2 border-dashed border-pink-200 dark:border-pink-900 text-pink-500 dark:text-pink-400 rounded-xl font-black text-sm hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/30 transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={16} /> Tambah Item Donasi
          </button>

          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-400 font-medium">
              {localItems.length} / 20 item
            </p>
            {localItems.length >= 20 && (
              <p className="text-[10px] text-orange-500 font-bold">Maksimal 20 item</p>
            )}
          </div>

          <button
            onClick={syncAndSave}
            disabled={saveSettingsMutation.isPending}
            className="cursor-pointer active:scale-[0.99] hover:brightness-90 w-full bg-slate-900/70 dark:bg-slate-700 text-white py-3 md:py-4 rounded-xl font-black text-sm transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-70 flex items-center justify-center gap-3"
          >
            <Save size={20} />
            {saveSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Item Donasi'}
          </button>
        </>
      )}
    </div>
  );
};

export default DonationItemsEditor;