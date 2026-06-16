// components/DonationItemsEditor.jsx
// Taruh di folder components/ yang sama dengan komponen lainnya
// Dipakai di DashboardStreamer.jsx → tab 'settings' (bawah QuickAmountsEditor)

import { AnimatePresence, motion } from 'framer-motion';
import { GripVertical, Plus, Save, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

// ── Emoji preset yang bisa dipilih ────────────────────────────────────────────
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
];

// ── Warna badge tier otomatis berdasarkan nominal ─────────────────────────────
const getTierColor = (amount) => {
  if (amount >= 500000) return { bg: 'from-yellow-400 to-amber-500',   badge: 'bg-amber-500',  text: 'LEGENDARY' };
  if (amount >= 100000) return { bg: 'from-purple-400 to-violet-600',  badge: 'bg-violet-500', text: 'EPIC'      };
  if (amount >= 50000)  return { bg: 'from-blue-400 to-cyan-500',      badge: 'bg-blue-500',   text: 'RARE'      };
  if (amount >= 10000)  return { bg: 'from-emerald-400 to-green-500',  badge: 'bg-emerald-500',text: 'UNCOMMON'  };
  return                       { bg: 'from-slate-300 to-slate-400',    badge: 'bg-slate-400',  text: 'COMMON'    };
};

// ── Single Item Row ────────────────────────────────────────────────────────────
const ItemRow = ({ item, index, onChange, onRemove, onEmojiPick }) => {
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
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden"
    >
      {/* Header bar dengan tier color */}
      <div className={`h-1 w-full bg-gradient-to-r ${tier.bg}`} />

      <div className="p-4 space-y-3">
        {/* Row atas: drag handle + emoji + nama + hapus */}
        <div className="flex items-center gap-3">
          <GripVertical size={16} className="text-slate-300 dark:text-slate-600 flex-shrink-0 cursor-grab" />

          {/* Emoji picker */}
          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => setShowEmojiPicker(v => !v)}
              className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all cursor-pointer active:scale-95 border-2 border-slate-200 dark:border-slate-600"
            >
              {item.emoji || '❓'}
            </button>
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute left-0 top-13 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-3 w-56"
                >
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Pilih Ikon Item</p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {EMOJI_PRESETS.map(({ emoji, label }) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          onChange(index, 'emoji', emoji);
                          setShowEmojiPicker(false);
                        }}
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
                  {/* Custom emoji input */}
                  <div className="mt-2 border-t border-slate-100 dark:border-slate-700 pt-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Atau ketik emoji</p>
                    <input
                      type="text"
                      value={item.emoji || ''}
                      onChange={(e) => onChange(index, 'emoji', e.target.value.slice(0, 2))}
                      placeholder="😊"
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-bold text-lg outline-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Nama item */}
          <input
            type="text"
            value={item.name || ''}
            onChange={(e) => onChange(index, 'name', e.target.value)}
            placeholder={`Item ${index + 1} (contoh: Kopi)`}
            maxLength={30}
            className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-blue-400 transition-all"
          />

          <button
            onClick={() => onRemove(index)}
            className="cursor-pointer p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all active:scale-95"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Row bawah: harga + tier badge */}
        <div className="flex items-center gap-3 pl-7">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-blue-500 text-sm">Rp</span>
            <input
              type="number"
              value={item.price || ''}
              onChange={(e) => onChange(index, 'price', Number(e.target.value))}
              placeholder="10000"
              min={0}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl font-black text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-blue-400 transition-all"
            />
          </div>

          {/* Tier badge */}
          {item.price > 0 && (
            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black text-white ${tier.badge}`}>
              {tier.text}
            </span>
          )}
        </div>

        {/* Deskripsi opsional */}
        <div className="pl-7">
          <input
            type="text"
            value={item.description || ''}
            onChange={(e) => onChange(index, 'description', e.target.value)}
            placeholder="Deskripsi singkat (opsional)"
            maxLength={60}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl font-medium text-xs text-slate-500 dark:text-slate-400 outline-none focus:border-blue-400 transition-all"
          />
        </div>
      </div>
    </motion.div>
  );
};

// ── Preview Card (simulasi tampilan di SupporterPage) ─────────────────────────
const ItemPreviewCard = ({ item }) => {
  const tier = getTierColor(item.price || 0);
  return (
    <div className="relative bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700 overflow-hidden cursor-pointer hover:border-blue-400 transition-all active:scale-[0.98]">
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
      </div>
    </div>
  );
};

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

  // Sync when props change (length change = external update)
  useEffect(() => {
    setLocalItems(items.map(i => ({ ...i })));
  }, [items.length]);

  const handleChange = useCallback((index, key, value) => {
    setLocalItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  }, []);

  const handleRemove = useCallback((index) => {
    const next = localItems.filter((_, i) => i !== index);
    setLocalItems(next);
    onChange(next);
  }, [localItems, onChange]);

  const handleAdd = () => {
    const next = [
      ...localItems,
      { id: Date.now().toString(), emoji: '🎁', name: '', price: 10000, description: '' },
    ];
    setLocalItems(next);
    onChange(next);
  };

  const syncAndSave = () => {
    onChange(localItems);
    // Beri sedikit waktu agar state parent update sebelum save
    setTimeout(() => {
      saveSettingsMutation.mutate({
        settings: { ...settings, donationItems: localItems },
        slot: activeSlot,
      });
    }, 80);
  };

  const sortedPreview = [...localItems].filter(i => i.name && i.price > 0).sort((a, b) => a.price - b.price);

  return (
    <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 w-11 h-11 text-xl bg-white rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
            💎
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

        <button
          onClick={() => setShowPreview(v => !v)}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer active:scale-95 ${
            showPreview
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
          }`}
        >
          {showPreview ? 'Tutup Preview' : 'Preview'}
        </button>
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
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
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

      {/* Enable toggle */}
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
        <div>
          <p className="font-black text-slate-700 dark:text-slate-200 text-sm">Aktifkan Mode Item</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
            Donor dapat memilih item ATAU nominal langsung
          </p>
        </div>
        <button
          onClick={() => {
            const next = !settings.donationItemsEnabled;
            onChange(localItems);
            saveSettingsMutation.mutate({
              settings: { ...settings, donationItemsEnabled: next },
              slot: activeSlot,
            });
          }}
          className={`relative inline-flex h-7 w-14 items-center rounded-xl transition-colors duration-300 cursor-pointer focus:outline-none ${
            settings.donationItemsEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-lg bg-white shadow-md transition-transform duration-300 ${
              settings.donationItemsEnabled ? 'translate-x-8' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Item list */}
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

      {/* Add button */}
      <button
        onClick={handleAdd}
        className="cursor-pointer active:scale-[0.99] w-full py-3 border-2 border-dashed border-pink-200 dark:border-pink-900 text-pink-500 dark:text-pink-400 rounded-xl font-black text-sm hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/30 transition-all flex items-center justify-center gap-3"
      >
        <Plus size={16} /> Tambah Item Donasi
      </button>

      {/* Limit info */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-slate-400 font-medium">
          {localItems.length} / 20 item
        </p>
        {localItems.length >= 20 && (
          <p className="text-[10px] text-orange-500 font-bold">Maksimal 20 item</p>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={syncAndSave}
        disabled={saveSettingsMutation.isPending}
        className="cursor-pointer active:scale-[0.99] hover:brightness-90 w-full bg-slate-900/70 dark:bg-slate-700 text-white py-3 md:py-4 rounded-xl font-black text-sm transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-70 flex items-center justify-center gap-3"
      >
        <Save size={20} />
        {saveSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Item Donasi'}
      </button>
    </div>
  );
};

export default DonationItemsEditor;