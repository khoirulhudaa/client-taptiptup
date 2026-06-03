import { useState, useEffect, useRef, useCallback } from "react";

// ─── Utility ──────────────────────────────────────────────────────────────────
const fmtRp = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
const fmtTime = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return [h, m, sec].map((v) => String(v).padStart(2, "0")).join(":");
};
const cls = (...args) => args.filter(Boolean).join(" ");

// ─── Tab System ───────────────────────────────────────────────────────────────
const TABS = [
  { id: "filter", icon: "🚫", label: "Filter Teks" },
  { id: "sound", icon: "🔊", label: "Suara" },
  { id: "tts", icon: "🗣️", label: "TTS" },
  { id: "milestone", icon: "🎯", label: "Milestones" },
  { id: "leaderboard", icon: "🏆", label: "Leaderboard" },
  { id: "qrcode", icon: "📱", label: "QR Code" },
  { id: "subathon", icon: "⏱️", label: "Subathon" },
  { id: "polling", icon: "📊", label: "Polling" },
];

// ────────────────────────────────────────────────────────────────────────────────
// 1. FILTER TEKS TERLARANG
// ────────────────────────────────────────────────────────────────────────────────
const FilterPanel = ({ settings, onChange }) => {
  const [newWord, setNewWord] = useState("");
  const words = settings.bannedWords || [];
  const addWord = () => {
    const w = newWord.trim().toLowerCase();
    if (w && !words.includes(w)) {
      onChange({ ...settings, bannedWords: [...words, w] });
      setNewWord("");
    }
  };
  const removeWord = (w) => onChange({ ...settings, bannedWords: words.filter((x) => x !== w) });
  const modes = [
    { id: "block", label: "Blokir donasi", desc: "Tolak donasi jika pesan mengandung kata terlarang" },
    { id: "censor", label: "Sensor bintang", desc: 'Tampilkan pesan dengan *** menggantikan kata terlarang' },
    { id: "replace", label: "Ganti teks", desc: "Ganti kata terlarang dengan teks pengganti" },
  ];
  return (
    <div className="space-y-6">
      <SectionCard icon="🚫" title="Filter Kata Terlarang" color="#ef4444">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {modes.map((m) => (
              <label key={m.id} className={cls(
                "flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all",
                settings.filterMode === m.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-slate-100 hover:border-slate-200"
              )}>
                <input type="radio" name="filterMode" value={m.id}
                  checked={settings.filterMode === m.id}
                  onChange={() => onChange({ ...settings, filterMode: m.id })}
                  className="mt-1 accent-blue-600" />
                <div>
                  <p className="font-black text-sm text-slate-800">{m.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                </div>
              </label>
            ))}
          </div>

          {settings.filterMode === "replace" && (
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Teks Pengganti</label>
              <input value={settings.filterReplacement || ""}
                onChange={(e) => onChange({ ...settings, filterReplacement: e.target.value })}
                placeholder="contoh: [dihapus]"
                className="w-full p-3 bg-slate-100 border-2 border-slate-50 rounded-2xl font-bold text-sm outline-none focus:border-blue-500" />
            </div>
          )}

          <ToggleRow label="Aktifkan Filter Nama Donatur" desc="Filter juga berlaku pada nama pengirim donasi"
            value={settings.filterDonorName} onChange={(v) => onChange({ ...settings, filterDonorName: v })} />
        </div>
      </SectionCard>

      <SectionCard icon="📝" title="Daftar Kata Terlarang" color="#f59e0b">
        <div className="flex gap-2 mb-4">
          <input value={newWord} onChange={(e) => setNewWord(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addWord()}
            placeholder="Tambah kata terlarang..."
            className="flex-1 p-3 bg-slate-100 border-2 border-slate-50 rounded-2xl font-bold text-sm outline-none focus:border-blue-500" />
          <button onClick={addWord}
            className="px-5 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all active:scale-[0.97]">
            + Tambah
          </button>
        </div>
        {words.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <div className="text-3xl mb-2">📝</div>
            <p className="font-bold text-sm">Belum ada kata terlarang</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {words.map((w) => (
              <span key={w} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-full text-xs font-black">
                {w}
                <button onClick={() => removeWord(w)} className="text-red-400 hover:text-red-600 font-black leading-none">×</button>
              </span>
            ))}
          </div>
        )}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl">
          <p className="text-xs text-amber-700 font-bold">💡 Tips: Kata terlarang tidak case-sensitive. Tambahkan variasi ejaan jika perlu.</p>
        </div>
      </SectionCard>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────────
// 2. CUSTOM SUARA NOTIFIKASI
// ────────────────────────────────────────────────────────────────────────────────
const SoundPanel = ({ settings, onChange }) => {
  const [testIdx, setTestIdx] = useState(null);
  const presets = [
    { id: "none", label: "Tidak ada suara", url: "" },
    { id: "bell", label: "Bell klasik", url: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" },
    { id: "chime", label: "Chime ceria", url: "https://assets.mixkit.co/active_storage/sfx/1003/1003-preview.mp3" },
    { id: "pop", label: "Pop simpel", url: "https://assets.mixkit.co/active_storage/sfx/2357/2357-preview.mp3" },
    { id: "coin", label: "Koin masuk", url: "https://assets.mixkit.co/active_storage/sfx/888/888-preview.mp3" },
    { id: "custom", label: "Custom URL", url: "" },
  ];

  const tiers = settings.soundTiers || [];
  const addTier = () => onChange({ ...settings, soundTiers: [...tiers, { minAmount: 10000, maxAmount: null, soundUrl: "", volume: 100, label: "" }] });
  const removeTier = (i) => onChange({ ...settings, soundTiers: tiers.filter((_, idx) => idx !== i) });
  const updateTier = (i, key, val) => onChange({ ...settings, soundTiers: tiers.map((t, idx) => idx === i ? { ...t, [key]: val } : t) });

  const testSound = (url) => {
    if (!url) return;
    try {
      const audio = new Audio(url);
      audio.volume = (settings.globalVolume || 100) / 100;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      <SectionCard icon="🔊" title="Suara Notifikasi Global" color="#6366f1">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Preset Suara</label>
            <div className="grid grid-cols-2 gap-2">
              {presets.filter((p) => p.id !== "custom").map((p) => (
                <button key={p.id}
                  onClick={() => onChange({ ...settings, notifSoundPreset: p.id, notifSoundUrl: p.url })}
                  className={cls(
                    "flex items-center gap-2 p-3 rounded-2xl border-2 text-sm font-black transition-all text-left",
                    settings.notifSoundPreset === p.id
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-100 text-slate-500 hover:border-slate-200"
                  )}>
                  {p.id === "none" ? "🔇" : "🎵"} {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Custom URL Suara</label>
            <div className="flex gap-2">
              <input value={settings.notifSoundUrl || ""}
                onChange={(e) => onChange({ ...settings, notifSoundUrl: e.target.value, notifSoundPreset: "custom" })}
                placeholder="https://example.com/sound.mp3"
                className="flex-1 p-3 bg-slate-100 border-2 border-slate-50 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 font-mono" />
              <button onClick={() => testSound(settings.notifSoundUrl)}
                className="px-4 py-3 bg-green-600 text-white rounded-2xl font-black text-sm hover:bg-green-700 transition-all active:scale-[0.97]">
                ▶ Test
              </button>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume Global ({settings.globalVolume || 100}%)</label>
            </div>
            <input type="range" min={0} max={100} step={5}
              value={settings.globalVolume || 100}
              onChange={(e) => onChange({ ...settings, globalVolume: Number(e.target.value) })}
              className="w-full accent-blue-600" />
          </div>
        </div>
      </SectionCard>

      <SectionCard icon="🎵" title="Suara Berdasarkan Nominal" color="#8b5cf6">
        <p className="text-xs text-slate-500 mb-4">Atur suara berbeda untuk nominal donasi tertentu. Tier yang lebih spesifik akan diprioritaskan.</p>
        <div className="space-y-3">
          {tiers.map((tier, i) => (
            <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-slate-700">{tier.label || `Sound Tier ${i + 1}`}</span>
                <button onClick={() => removeTier(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Label</label>
                  <input value={tier.label || ""} onChange={(e) => updateTier(i, "label", e.target.value)}
                    placeholder="Sultan Alert Sound"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Volume (%)</label>
                  <input type="number" min={0} max={100} value={tier.volume || 100}
                    onChange={(e) => updateTier(i, "volume", Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Min (Rp)</label>
                  <input type="number" value={tier.minAmount}
                    onChange={(e) => updateTier(i, "minAmount", Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Max (kosong=∞)</label>
                  <input type="number" value={tier.maxAmount ?? ""}
                    onChange={(e) => updateTier(i, "maxAmount", e.target.value === "" ? null : Number(e.target.value))}
                    placeholder="∞"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-400" />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">URL Suara</label>
                <div className="flex gap-2">
                  <input value={tier.soundUrl || ""} onChange={(e) => updateTier(i, "soundUrl", e.target.value)}
                    placeholder="https://example.com/sultan.mp3"
                    className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-400 font-mono" />
                  <button onClick={() => testSound(tier.soundUrl)}
                    className="px-3 py-2 bg-green-100 text-green-700 rounded-xl font-black text-xs hover:bg-green-200 transition-all">
                    ▶
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button onClick={addTier}
            className="w-full py-3 border-2 border-dashed border-blue-200 text-blue-500 rounded-2xl font-black text-sm hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
            + Tambah Sound Tier
          </button>
        </div>
      </SectionCard>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────────
// 3. TEXT TO SPEECH
// ────────────────────────────────────────────────────────────────────────────────
const TTSPanel = ({ settings, onChange }) => {
  const [preview, setPreview] = useState("");
  const voices = typeof window !== "undefined" && window.speechSynthesis
    ? window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("id") || v.lang.startsWith("en"))
    : [];

  const testTTS = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(
      preview || "Budi Santoso mengirimkan donasi sebesar lima puluh ribu rupiah. Semangat terus!"
    );
    utter.rate = settings.ttsRate || 1;
    utter.pitch = settings.ttsPitch || 1;
    utter.volume = (settings.ttsVolume || 100) / 100;
    if (settings.ttsVoice) {
      const v = window.speechSynthesis.getVoices().find((v) => v.name === settings.ttsVoice);
      if (v) utter.voice = v;
    }
    window.speechSynthesis.speak(utter);
  };

  const templates = [
    { id: "short", label: "Singkat", template: "{name} donasi {amount}" },
    { id: "medium", label: "Standar", template: "{name} mengirimkan {amount}. {message}" },
    { id: "full", label: "Lengkap", template: "Terima kasih {name} atas donasi sebesar {amount}! {message}" },
    { id: "custom", label: "Custom", template: "" },
  ];

  return (
    <div className="space-y-6">
      <SectionCard icon="🗣️" title="Text to Speech" color="#10b981">
        <ToggleRow label="Aktifkan TTS" desc="Baca donasi masuk secara otomatis dengan suara"
          value={settings.ttsEnabled} onChange={(v) => onChange({ ...settings, ttsEnabled: v })} />
        <ToggleRow label="Baca pesan donatur" desc="Ikutkan pesan dari donatur saat dibacakan"
          value={settings.ttsReadMessage} onChange={(v) => onChange({ ...settings, ttsReadMessage: v })} />
        <ToggleRow label="Baca nominal" desc="Sebut nominal donasi saat dibacakan"
          value={settings.ttsReadAmount} onChange={(v) => onChange({ ...settings, ttsReadAmount: v })} />
      </SectionCard>

      <SectionCard icon="⚙️" title="Konfigurasi Suara TTS" color="#6366f1">
        <div className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Template Pesan TTS</label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {templates.map((t) => (
                <button key={t.id}
                  onClick={() => onChange({ ...settings, ttsTemplate: t.id, ttsCustomTemplate: t.template })}
                  className={cls(
                    "p-3 rounded-2xl border-2 text-xs font-black transition-all text-left",
                    settings.ttsTemplate === t.id
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-100 text-slate-500 hover:border-slate-200"
                  )}>
                  <div className="font-black">{t.label}</div>
                  {t.template && <div className="text-[9px] opacity-60 mt-0.5 font-normal">{t.template}</div>}
                </button>
              ))}
            </div>
            {settings.ttsTemplate === "custom" && (
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Template Custom</label>
                <input value={settings.ttsCustomTemplate || ""}
                  onChange={(e) => onChange({ ...settings, ttsCustomTemplate: e.target.value })}
                  placeholder="{name} donasi {amount}. {message}"
                  className="w-full p-3 bg-slate-100 border-2 border-slate-50 rounded-2xl font-mono text-xs outline-none focus:border-blue-500" />
                <p className="text-[9px] text-slate-400 font-medium mt-1">Variabel: {"{name}"}, {"{amount}"}, {"{message}"}</p>
              </div>
            )}
          </div>

          <SliderRow label="Kecepatan Bicara" min={0.5} max={2} step={0.1}
            value={settings.ttsRate || 1} suffix="x"
            onChange={(v) => onChange({ ...settings, ttsRate: v })} />
          <SliderRow label="Nada Suara" min={0} max={2} step={0.1}
            value={settings.ttsPitch || 1} suffix=""
            onChange={(v) => onChange({ ...settings, ttsPitch: v })} />
          <SliderRow label="Volume TTS" min={0} max={100} step={5}
            value={settings.ttsVolume || 100} suffix="%"
            onChange={(v) => onChange({ ...settings, ttsVolume: v })} />

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Batas Panjang Pesan (karakter)</label>
            <input type="number" min={0} max={500}
              value={settings.ttsMaxLength || 150}
              onChange={(e) => onChange({ ...settings, ttsMaxLength: Number(e.target.value) })}
              className="w-full p-3 bg-slate-100 border-2 border-slate-50 rounded-2xl font-bold text-sm outline-none focus:border-blue-500" />
            <p className="text-[9px] text-slate-400 font-medium mt-1">Pesan lebih panjang dari ini akan dipotong. 0 = tidak ada batas</p>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Preview TTS</label>
            <div className="flex gap-2">
              <input value={preview} onChange={(e) => setPreview(e.target.value)}
                placeholder="Ketik teks untuk preview..."
                className="flex-1 p-3 bg-slate-100 border-2 border-slate-50 rounded-2xl font-bold text-sm outline-none focus:border-blue-500" />
              <button onClick={testTTS}
                className="px-4 py-3 bg-green-600 text-white rounded-2xl font-black text-sm hover:bg-green-700 transition-all active:scale-[0.97]">
                ▶ Play
              </button>
              <button onClick={() => window.speechSynthesis?.cancel()}
                className="px-4 py-3 bg-red-100 text-red-600 rounded-2xl font-black text-sm hover:bg-red-200 transition-all active:scale-[0.97]">
                ⏹
              </button>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon="🎯" title="TTS per Nominal" color="#f59e0b">
        <ToggleRow label="TTS hanya untuk nominal tertentu" desc="TTS hanya aktif jika donasi mencapai minimal tertentu"
          value={settings.ttsMinAmountEnabled} onChange={(v) => onChange({ ...settings, ttsMinAmountEnabled: v })} />
        {settings.ttsMinAmountEnabled && (
          <div className="mt-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Minimal Nominal untuk TTS</label>
            <input type="number" value={settings.ttsMinAmount || 10000}
              onChange={(e) => onChange({ ...settings, ttsMinAmount: Number(e.target.value) })}
              className="w-full p-3 bg-slate-100 border-2 border-slate-50 rounded-2xl font-bold text-sm outline-none focus:border-blue-500" />
          </div>
        )}
      </SectionCard>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────────
// 4. MILESTONES
// ────────────────────────────────────────────────────────────────────────────────
const MilestonePanel = ({ settings, onChange }) => {
  const milestones = settings.milestones || [];
  const addMilestone = () => onChange({
    ...settings,
    milestones: [...milestones, {
      id: Date.now(), label: "", description: "", targetAmount: 100000,
      currentAmount: 0, icon: "🎯", color: "#6366f1", completed: false,
    }]
  });
  const removeMilestone = (id) => onChange({ ...settings, milestones: milestones.filter((m) => m.id !== id) });
  const updateMilestone = (id, key, val) => onChange({
    ...settings,
    milestones: milestones.map((m) => m.id === id ? { ...m, [key]: val } : m)
  });

  const totalRaised = settings.totalRaisedDemo || 350000;
  const icons = ["🎯", "🏆", "🎮", "🌟", "🚀", "💜", "🔥", "⭐", "🎵", "🎪"];

  return (
    <div className="space-y-6">
      <SectionCard icon="🎯" title="Milestone Goals" color="#6366f1">
        <ToggleRow label="Aktifkan Milestone" desc="Tampilkan progress bar goal di overlay OBS"
          value={settings.milestonesEnabled} onChange={(v) => onChange({ ...settings, milestonesEnabled: v })} />
        <ToggleRow label="Tampilkan di halaman donasi" desc="Donor bisa melihat progress milestone saat donasi"
          value={settings.milestonesPublic} onChange={(v) => onChange({ ...settings, milestonesPublic: v })} />
        <ToggleRow label="Animasi pencapaian" desc="Tampilkan efek animasi saat milestone tercapai"
          value={settings.milestoneAnimation} onChange={(v) => onChange({ ...settings, milestoneAnimation: v })} />
      </SectionCard>

      <SectionCard icon="📊" title="Demo Progres Milestone" color="#10b981">
        <div className="mb-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Total Donasi (Demo)</label>
          <input type="number" value={totalRaised}
            onChange={(e) => onChange({ ...settings, totalRaisedDemo: Number(e.target.value) })}
            className="w-full p-3 bg-slate-100 border-2 border-slate-50 rounded-2xl font-bold text-sm outline-none focus:border-blue-500" />
        </div>
        {milestones.length > 0 && (
          <div className="space-y-3">
            {[...milestones].sort((a, b) => a.targetAmount - b.targetAmount).map((m) => {
              const pct = Math.min(100, Math.round((totalRaised / m.targetAmount) * 100));
              const done = totalRaised >= m.targetAmount;
              return (
                <div key={m.id} className={cls(
                  "p-4 rounded-2xl border-2",
                  done ? "border-green-300 bg-green-50" : "border-slate-100 bg-slate-50"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{m.icon}</span>
                      <div>
                        <p className="font-black text-sm text-slate-800">{m.label || "Milestone"}</p>
                        <p className="text-[10px] text-slate-500">{m.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm" style={{ color: done ? "#16a34a" : "#6366f1" }}>{pct}%</p>
                      <p className="text-[10px] text-slate-400">{fmtRp(Math.min(totalRaised, m.targetAmount))} / {fmtRp(m.targetAmount)}</p>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: done ? "#16a34a" : m.color || "#6366f1" }} />
                  </div>
                  {done && <p className="text-[10px] text-green-600 font-black mt-1">✅ Tercapai!</p>}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard icon="✏️" title="Kelola Milestone" color="#f59e0b">
        <div className="space-y-4">
          {milestones.map((m, i) => (
            <div key={m.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-slate-700">Milestone {i + 1}</span>
                <button onClick={() => removeMilestone(m.id)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
              </div>
              <div className="grid grid-cols-5 gap-2 mb-2">
                {icons.map((ic) => (
                  <button key={ic} onClick={() => updateMilestone(m.id, "icon", ic)}
                    className={cls(
                      "p-2 rounded-xl text-lg border-2 transition-all",
                      m.icon === ic ? "border-blue-600 bg-blue-50" : "border-slate-100 hover:border-slate-200"
                    )}>
                    {ic}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Label</label>
                  <input value={m.label} onChange={(e) => updateMilestone(m.id, "label", e.target.value)}
                    placeholder="Setup Studio"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Target (Rp)</label>
                  <input type="number" value={m.targetAmount}
                    onChange={(e) => updateMilestone(m.id, "targetAmount", Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-400" />
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Deskripsi</label>
                  <input value={m.description} onChange={(e) => updateMilestone(m.id, "description", e.target.value)}
                    placeholder="Beli mic baru untuk streaming..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Warna</label>
                  <input type="color" value={m.color || "#6366f1"}
                    onChange={(e) => updateMilestone(m.id, "color", e.target.value)}
                    className="w-full h-10 p-1 bg-white border border-slate-200 rounded-xl cursor-pointer" />
                </div>
              </div>
            </div>
          ))}
          <button onClick={addMilestone}
            className="w-full py-3 border-2 border-dashed border-blue-200 text-blue-500 rounded-2xl font-black text-sm hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
            + Tambah Milestone
          </button>
        </div>
      </SectionCard>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────────
// 5. LEADERBOARD
// ────────────────────────────────────────────────────────────────────────────────
const LeaderboardPanel = ({ settings, onChange }) => {
  const demoData = [
    { name: "RizkyDev", total: 500000, count: 5 },
    { name: "Budi Santoso", total: 350000, count: 3 },
    { name: "Siti Rahayu", total: 200000, count: 8 },
    { name: "Anonim", total: 150000, count: 2 },
    { name: "GamerPro99", total: 100000, count: 4 },
    { name: "StreamFan", total: 75000, count: 1 },
    { name: "SawerQueen", total: 50000, count: 6 },
    { name: "JakartaVibes", total: 25000, count: 2 },
  ];
  const maxShow = settings.lbMaxEntries || 5;
  const shown = demoData.slice(0, maxShow);
  const maxAmt = shown[0]?.total || 1;
  const periods = [
    { id: "all", label: "Sepanjang Waktu" },
    { id: "month", label: "Bulan Ini" },
    { id: "week", label: "Minggu Ini" },
    { id: "today", label: "Hari Ini" },
    { id: "stream", label: "Stream Ini" },
  ];
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-6">
      <SectionCard icon="🏆" title="Konfigurasi Leaderboard" color="#f59e0b">
        <div className="space-y-5">
          <ToggleRow label="Aktifkan Leaderboard" desc="Tampilkan leaderboard donatur di overlay OBS"
            value={settings.lbEnabled} onChange={(v) => onChange({ ...settings, lbEnabled: v })} />
          <ToggleRow label="Tampilkan Nominal" desc="Tampilkan jumlah rupiah per donatur"
            value={settings.lbShowAmount} onChange={(v) => onChange({ ...settings, lbShowAmount: v })} />
          <ToggleRow label="Tampilkan Jumlah Donasi" desc="Tampilkan berapa kali donatur telah berdonasi"
            value={settings.lbShowCount} onChange={(v) => onChange({ ...settings, lbShowCount: v })} />
          <ToggleRow label="Tampilkan Anonim" desc="Ikutkan donatur anonim dalam leaderboard"
            value={settings.lbShowAnon} onChange={(v) => onChange({ ...settings, lbShowAnon: v })} />
          <ToggleRow label="Progress Bar" desc="Tampilkan bar progress relatif terhadap top donatur"
            value={settings.lbShowBar} onChange={(v) => onChange({ ...settings, lbShowBar: v })} />

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Maks Donatur Ditampilkan ({maxShow})
            </label>
            <input type="range" min={3} max={20} step={1} value={maxShow}
              onChange={(e) => onChange({ ...settings, lbMaxEntries: Number(e.target.value) })}
              className="w-full accent-blue-600" />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
              <span>3</span><span>10</span><span>20</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Periode Leaderboard</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {periods.map((p) => (
                <button key={p.id}
                  onClick={() => onChange({ ...settings, lbPeriod: p.id })}
                  className={cls(
                    "p-3 rounded-2xl border-2 text-xs font-black transition-all",
                    settings.lbPeriod === p.id
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-100 text-slate-500 hover:border-slate-200"
                  )}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {settings.lbPeriod === "stream" && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl">
              <p className="text-xs text-blue-700 font-bold">💡 Leaderboard "Stream Ini" otomatis reset setiap kali kamu memulai stream baru dari dashboard.</p>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard icon="👀" title="Preview Leaderboard" color="#6366f1">
        <div className="space-y-2">
          {shown.map((d, i) => (
            <div key={i} className={cls(
              "flex items-center gap-3 p-3 rounded-2xl",
              i === 0 ? "bg-amber-50 border border-amber-200" : "bg-slate-50"
            )}>
              <div className="w-8 text-center text-lg">{medals[i] || <span className="text-sm font-black text-slate-400">{i + 1}</span>}</div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm text-slate-800 truncate">{d.name}</p>
                {settings.lbShowBar && (
                  <div className="h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.round((d.total / maxAmt) * 100)}%` }} />
                  </div>
                )}
              </div>
              <div className="text-right">
                {settings.lbShowAmount !== false && (
                  <p className="font-black text-sm text-blue-600">{fmtRp(d.total)}</p>
                )}
                {settings.lbShowCount && (
                  <p className="text-[10px] text-slate-400">{d.count}x donasi</p>
                )}
              </div>
            </div>
          ))}
          <div className="pt-2 text-[10px] text-slate-400 text-center font-bold">
            Periode: {periods.find((p) => p.id === (settings.lbPeriod || "all"))?.label}
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────────
// 6. QR CODE
// ────────────────────────────────────────────────────────────────────────────────
const QRCodePanel = ({ settings, onChange }) => {
  const [qrUrl, setQrUrl] = useState("");
  const username = settings.username || "streamer";
  const donateUrl = `https://taptiptup.vercel.app/donate/${username}`;

  useEffect(() => {
    const encoded = encodeURIComponent(settings.qrCustomUrl || donateUrl);
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}&bgcolor=ffffff&color=3730a3&margin=10`);
  }, [settings.qrCustomUrl, username]);

  const sizes = [
    { id: "small", label: "Kecil", px: 150, obs: "180×180" },
    { id: "medium", label: "Sedang", px: 200, obs: "240×240" },
    { id: "large", label: "Besar", px: 250, obs: "300×300" },
  ];
  const positions = [
    { id: "top-left", label: "Kiri Atas" },
    { id: "top-right", label: "Kanan Atas" },
    { id: "bottom-left", label: "Kiri Bawah" },
    { id: "bottom-right", label: "Kanan Bawah" },
  ];
  const styles = [
    { id: "plain", label: "Polos", desc: "QR saja tanpa frame" },
    { id: "card", label: "Card", desc: "QR dalam kotak putih dengan label" },
    { id: "branded", label: "Branded", desc: "QR dengan nama dan branding kamu" },
  ];

  return (
    <div className="space-y-6">
      <SectionCard icon="📱" title="QR Code Tempel Layar" color="#8b5cf6">
        <ToggleRow label="Tampilkan QR Code" desc="Tampilkan QR code halaman donasi di overlay OBS"
          value={settings.qrEnabled} onChange={(v) => onChange({ ...settings, qrEnabled: v })} />

        <div className="mt-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">URL yang Dipindai</label>
          <div className="flex gap-2">
            <input value={settings.qrCustomUrl || donateUrl}
              onChange={(e) => onChange({ ...settings, qrCustomUrl: e.target.value })}
              className="flex-1 p-3 bg-slate-100 border-2 border-slate-50 rounded-2xl font-mono text-sm outline-none focus:border-blue-500" />
            <button onClick={() => onChange({ ...settings, qrCustomUrl: donateUrl })}
              className="px-4 py-3 bg-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-300 transition-all">
              Reset
            </button>
          </div>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <SectionCard icon="🎨" title="Tampilan QR" color="#f59e0b">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Style</label>
              {styles.map((s) => (
                <label key={s.id} className={cls(
                  "flex items-start gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all mb-2",
                  settings.qrStyle === s.id ? "border-blue-600 bg-blue-50" : "border-slate-100"
                )}>
                  <input type="radio" name="qrStyle" value={s.id}
                    checked={settings.qrStyle === s.id}
                    onChange={() => onChange({ ...settings, qrStyle: s.id })}
                    className="mt-0.5 accent-blue-600" />
                  <div>
                    <p className="font-black text-sm text-slate-800">{s.label}</p>
                    <p className="text-[10px] text-slate-500">{s.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Ukuran</label>
              <div className="grid grid-cols-3 gap-2">
                {sizes.map((s) => (
                  <button key={s.id}
                    onClick={() => onChange({ ...settings, qrSize: s.id })}
                    className={cls(
                      "p-2.5 rounded-2xl border-2 text-xs font-black transition-all",
                      settings.qrSize === s.id ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-100 text-slate-500"
                    )}>
                    {s.label}
                    <div className="text-[9px] font-normal opacity-60">{s.obs}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Posisi</label>
              <div className="grid grid-cols-2 gap-2">
                {positions.map((p) => (
                  <button key={p.id}
                    onClick={() => onChange({ ...settings, qrPosition: p.id })}
                    className={cls(
                      "p-2.5 rounded-2xl border-2 text-xs font-black transition-all",
                      settings.qrPosition === p.id ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-100 text-slate-500"
                    )}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Warna QR</label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <p className="text-[9px] text-slate-400 font-bold mb-1">Warna Kode</p>
                  <input type="color" value={settings.qrFgColor || "#3730a3"}
                    onChange={(e) => onChange({ ...settings, qrFgColor: e.target.value })}
                    className="w-full h-10 p-1 bg-white border border-slate-200 rounded-xl cursor-pointer" />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] text-slate-400 font-bold mb-1">Background</p>
                  <input type="color" value={settings.qrBgColor || "#ffffff"}
                    onChange={(e) => onChange({ ...settings, qrBgColor: e.target.value })}
                    className="w-full h-10 p-1 bg-white border border-slate-200 rounded-xl cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard icon="👁️" title="Preview QR" color="#10b981">
          <div className="flex flex-col items-center gap-4">
            {settings.qrStyle === "plain" && (
              <img src={qrUrl} alt="QR Preview" className="rounded-xl border border-slate-200" style={{ width: 160, height: 160 }} />
            )}
            {settings.qrStyle === "card" && (
              <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col items-center gap-2">
                <img src={qrUrl} alt="QR Preview" style={{ width: 140, height: 140 }} />
                <p className="text-xs font-black text-slate-700">Scan untuk donasi!</p>
              </div>
            )}
            {settings.qrStyle === "branded" && (
              <div className="bg-blue-600 p-4 rounded-2xl flex flex-col items-center gap-2">
                <p className="text-white font-black text-sm">@{username}</p>
                <div className="bg-white p-2 rounded-xl">
                  <img src={qrUrl} alt="QR Preview" style={{ width: 130, height: 130 }} />
                </div>
                <p className="text-blue-200 text-[10px] font-bold">Scan untuk donasi</p>
              </div>
            )}
            {!settings.qrStyle && (
              <img src={qrUrl} alt="QR Preview" className="rounded-xl border border-slate-200" style={{ width: 160, height: 160 }} />
            )}
            <div className="text-center">
              <p className="text-[10px] text-slate-400 font-bold">URL:</p>
              <p className="text-xs font-mono text-blue-600 break-all">{settings.qrCustomUrl || donateUrl}</p>
            </div>
            <ToggleRow label="Tampilkan label di bawah QR" desc=""
              value={settings.qrShowLabel} onChange={(v) => onChange({ ...settings, qrShowLabel: v })} />
            {settings.qrShowLabel && (
              <input value={settings.qrLabel || "Scan untuk donasi!"}
                onChange={(e) => onChange({ ...settings, qrLabel: e.target.value })}
                className="w-full p-2.5 bg-slate-100 border-2 border-slate-50 rounded-2xl font-bold text-xs outline-none focus:border-blue-500 text-center" />
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────────
// 7. SUBATHON TIMER
// ────────────────────────────────────────────────────────────────────────────────
const SubathonPanel = ({ settings, onChange }) => {
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(settings.subathonBaseTime || 3600);
  const intervalRef = useRef(null);

  useEffect(() => {
    setTimeLeft(settings.subathonBaseTime || 3600);
  }, [settings.subathonBaseTime]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => Math.max(0, t - 1));
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const addTime = (seconds) => setTimeLeft((t) => t + seconds);
  const reset = () => { setRunning(false); setTimeLeft(settings.subathonBaseTime || 3600); };

  const tiers = settings.subathonTiers || [];
  const addTier = () => onChange({ ...settings, subathonTiers: [...tiers, { minAmount: 10000, addSeconds: 60, label: "" }] });
  const removeTier = (i) => onChange({ ...settings, subathonTiers: tiers.filter((_, idx) => idx !== i) });
  const updateTier = (i, key, val) => onChange({ ...settings, subathonTiers: tiers.map((t, idx) => idx === i ? { ...t, [key]: val } : t) });

  const pct = Math.round((timeLeft / (settings.subathonMaxTime || 86400)) * 100);
  const urgency = timeLeft < 300 ? "red" : timeLeft < 900 ? "amber" : "blue";

  return (
    <div className="space-y-6">
      <SectionCard icon="⏱️" title="Subathon Timer" color="#ef4444">
        <ToggleRow label="Aktifkan Subathon Timer" desc="Timer akan berkurang seiring waktu dan bertambah saat ada donasi"
          value={settings.subathonEnabled} onChange={(v) => onChange({ ...settings, subathonEnabled: v })} />
        <ToggleRow label="Tampilkan di Overlay OBS" desc="Timer muncul di layar OBS sebagai overlay"
          value={settings.subathonOverlay} onChange={(v) => onChange({ ...settings, subathonOverlay: v })} />
        <ToggleRow label="Auto-pause saat tidak live" desc="Timer berhenti otomatis saat stream offline"
          value={settings.subathonAutoPause} onChange={(v) => onChange({ ...settings, subathonAutoPause: v })} />
      </SectionCard>

      <SectionCard icon="🎬" title="Demo Timer" color="#6366f1">
        <div className="flex flex-col items-center gap-4">
          <div className={cls(
            "w-full p-6 rounded-3xl text-center font-mono",
            urgency === "red" ? "bg-red-50 border-2 border-red-300" :
            urgency === "amber" ? "bg-amber-50 border-2 border-amber-300" :
            "bg-blue-50 border-2 border-blue-200"
          )}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">SUBATHON TIMER</p>
            <p className={cls(
              "text-5xl font-black tracking-widest",
              urgency === "red" ? "text-red-600" :
              urgency === "amber" ? "text-amber-600" : "text-blue-600"
            )}>{fmtTime(timeLeft)}</p>
            {urgency === "red" && <p className="text-red-500 text-xs font-black mt-2 animate-pulse">⚠️ Waktu hampir habis!</p>}
          </div>

          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
            <div className={cls(
              "h-full rounded-full transition-all duration-1000",
              urgency === "red" ? "bg-red-500" : urgency === "amber" ? "bg-amber-500" : "bg-blue-500"
            )} style={{ width: `${Math.min(100, pct)}%` }} />
          </div>

          <div className="grid grid-cols-3 gap-2 w-full">
            <button onClick={() => addTime(60)}
              className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-2xl font-black text-sm hover:bg-green-100 transition-all">
              +1 menit
            </button>
            <button onClick={() => addTime(300)}
              className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-2xl font-black text-sm hover:bg-green-100 transition-all">
              +5 menit
            </button>
            <button onClick={() => addTime(600)}
              className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-2xl font-black text-sm hover:bg-green-100 transition-all">
              +10 menit
            </button>
          </div>

          <div className="flex gap-3 w-full">
            <button onClick={() => setRunning((r) => !r)}
              className={cls(
                "flex-1 py-3 rounded-2xl font-black text-sm transition-all active:scale-[0.97]",
                running
                  ? "bg-amber-600 text-white hover:bg-amber-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}>
              {running ? "⏸ Pause" : "▶ Mulai"}
            </button>
            <button onClick={reset}
              className="px-5 py-3 bg-slate-200 text-slate-700 rounded-2xl font-black text-sm hover:bg-slate-300 transition-all active:scale-[0.97]">
              ↺ Reset
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon="⚙️" title="Konfigurasi Subathon" color="#8b5cf6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Waktu Awal (detik)</label>
              <input type="number" value={settings.subathonBaseTime || 3600}
                onChange={(e) => onChange({ ...settings, subathonBaseTime: Number(e.target.value) })}
                className="w-full p-3 bg-slate-100 border-2 border-slate-50 rounded-2xl font-bold text-sm outline-none focus:border-blue-500" />
              <p className="text-[9px] text-slate-400 mt-1">{fmtTime(settings.subathonBaseTime || 3600)}</p>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Waktu Maksimal (detik)</label>
              <input type="number" value={settings.subathonMaxTime || 86400}
                onChange={(e) => onChange({ ...settings, subathonMaxTime: Number(e.target.value) })}
                className="w-full p-3 bg-slate-100 border-2 border-slate-50 rounded-2xl font-bold text-sm outline-none focus:border-blue-500" />
              <p className="text-[9px] text-slate-400 mt-1">{fmtTime(settings.subathonMaxTime || 86400)}</p>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Pengurangan per Menit (detik)</label>
            <input type="number" value={settings.subathonDecayRate || 60}
              onChange={(e) => onChange({ ...settings, subathonDecayRate: Number(e.target.value) })}
              className="w-full p-3 bg-slate-100 border-2 border-slate-50 rounded-2xl font-bold text-sm outline-none focus:border-blue-500" />
            <p className="text-[9px] text-slate-400 mt-1">Default: 60 (realtime). Atur lebih kecil untuk timer lebih lambat berkurang.</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon="💰" title="Tambah Waktu per Donasi" color="#10b981">
        <p className="text-xs text-slate-500 mb-4">Atur berapa detik waktu yang ditambahkan berdasarkan nominal donasi.</p>
        <div className="space-y-3">
          {tiers.map((tier, i) => (
            <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="font-black text-sm text-slate-700">{tier.label || `Tier ${i + 1}`}</span>
                <button onClick={() => removeTier(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Min (Rp)</label>
                  <input type="number" value={tier.minAmount}
                    onChange={(e) => updateTier(i, "minAmount", Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">+Waktu (detik)</label>
                  <input type="number" value={tier.addSeconds}
                    onChange={(e) => updateTier(i, "addSeconds", Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Label</label>
                  <input value={tier.label || ""} onChange={(e) => updateTier(i, "label", e.target.value)}
                    placeholder="Sultan"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-400" />
                </div>
              </div>
              <div className="mt-2 px-2 py-1 bg-green-50 rounded-xl">
                <p className="text-[10px] text-green-700 font-bold">
                  Donasi ≥ {fmtRp(tier.minAmount)} → +{fmtTime(tier.addSeconds)} ditambahkan
                </p>
              </div>
            </div>
          ))}
          <button onClick={addTier}
            className="w-full py-3 border-2 border-dashed border-blue-200 text-blue-500 rounded-2xl font-black text-sm hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
            + Tambah Tier Waktu
          </button>
        </div>
      </SectionCard>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────────
// 8. POLLING
// ────────────────────────────────────────────────────────────────────────────────
const PollingPanel = ({ settings, onChange }) => {
  const [newOption, setNewOption] = useState("");
  const [demoVotes, setDemoVotes] = useState({ a: 12, b: 8, c: 3, d: 5 });
  const polls = settings.polls || [];
  const activePoll = settings.activePoll || null;

  const createNewPoll = () => {
    const poll = {
      id: Date.now(),
      question: "",
      options: [{ id: "a", text: "Opsi A" }, { id: "b", text: "Opsi B" }],
      voteMode: "message",
      minAmountToVote: 0,
      multipleVotes: false,
      active: false,
      createdAt: new Date().toISOString(),
    };
    onChange({ ...settings, polls: [...polls, poll] });
  };

  const updatePoll = (id, key, val) => onChange({
    ...settings,
    polls: polls.map((p) => p.id === id ? { ...p, [key]: val } : p)
  });

  const removePoll = (id) => onChange({ ...settings, polls: polls.filter((p) => p.id !== id) });

  const addOption = (pollId) => {
    const poll = polls.find((p) => p.id === pollId);
    if (!poll || !newOption.trim()) return;
    const optId = String.fromCharCode(97 + poll.options.length);
    updatePoll(pollId, "options", [...poll.options, { id: optId, text: newOption.trim() }]);
    setNewOption("");
  };

  const removeOption = (pollId, optId) => {
    const poll = polls.find((p) => p.id === pollId);
    updatePoll(pollId, "options", poll.options.filter((o) => o.id !== optId));
  };

  const totalDemoVotes = Object.values(demoVotes).reduce((a, b) => a + b, 0);
  const demoOptions = [
    { id: "a", text: "Among Us", votes: demoVotes.a },
    { id: "b", text: "Minecraft", votes: demoVotes.b },
    { id: "c", text: "GTA V", votes: demoVotes.c },
    { id: "d", text: "Valorant", votes: demoVotes.d },
  ];

  return (
    <div className="space-y-6">
      <SectionCard icon="📊" title="Live Polling" color="#10b981">
        <ToggleRow label="Aktifkan Polling" desc="Donor bisa vote melalui pesan donasi"
          value={settings.pollingEnabled} onChange={(v) => onChange({ ...settings, pollingEnabled: v })} />
        <ToggleRow label="Tampilkan di Overlay OBS" desc="Hasil polling muncul realtime di layar OBS"
          value={settings.pollingOverlay} onChange={(v) => onChange({ ...settings, pollingOverlay: v })} />
        <ToggleRow label="Tampilkan persentase" desc="Tampilkan % vote per opsi"
          value={settings.pollingShowPct} onChange={(v) => onChange({ ...settings, pollingShowPct: v })} />
      </SectionCard>

      <SectionCard icon="🎮" title="Demo Polling Realtime" color="#6366f1">
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-center">
            <p className="font-black text-blue-800 text-sm mb-1">🗳️ Game apa yang dimainkan berikutnya?</p>
            <p className="text-[10px] text-blue-400 font-bold">{totalDemoVotes} votes total</p>
          </div>
          {demoOptions.map((opt) => {
            const pct = Math.round((opt.votes / totalDemoVotes) * 100);
            const isWinning = opt.votes === Math.max(...demoOptions.map((o) => o.votes));
            return (
              <div key={opt.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-black text-sm text-slate-700 flex items-center gap-2">
                    {isWinning && <span className="text-amber-500">👑</span>} {opt.text}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-500">{opt.votes} votes</span>
                    {settings.pollingShowPct !== false && (
                      <span className="text-xs font-black text-blue-600">{pct}%</span>
                    )}
                  </div>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className={cls(
                    "h-full rounded-full transition-all duration-500",
                    isWinning ? "bg-amber-500" : "bg-blue-400"
                  )} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          <div className="flex gap-2 pt-2">
            {demoOptions.map((opt) => (
              <button key={opt.id}
                onClick={() => setDemoVotes((v) => ({ ...v, [opt.id]: v[opt.id] + 1 }))}
                className="flex-1 py-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-xl font-black text-xs transition-all active:scale-[0.97]">
                +{opt.text.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard icon="🗳️" title="Buat Polling Baru" color="#f59e0b">
        <div className="space-y-4">
          {polls.map((poll) => (
            <div key={poll.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-slate-700">Polling #{poll.id}</span>
                <div className="flex gap-2">
                  <button onClick={() => updatePoll(poll.id, "active", !poll.active)}
                    className={cls(
                      "px-3 py-1.5 rounded-xl text-[10px] font-black transition-all",
                      poll.active ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"
                    )}>
                    {poll.active ? "● AKTIF" : "○ Non-aktif"}
                  </button>
                  <button onClick={() => removePoll(poll.id)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Pertanyaan</label>
                <input value={poll.question} onChange={(e) => updatePoll(poll.id, "question", e.target.value)}
                  placeholder="Game apa yang dimainkan berikutnya?"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Opsi Jawaban</label>
                <div className="space-y-2 mb-2">
                  {poll.options.map((opt) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-blue-500 w-5 text-center">{opt.id.toUpperCase()}</span>
                      <input value={opt.text}
                        onChange={(e) => updatePoll(poll.id, "options", poll.options.map((o) => o.id === opt.id ? { ...o, text: e.target.value } : o))}
                        className="flex-1 p-2 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-400" />
                      {poll.options.length > 2 && (
                        <button onClick={() => removeOption(poll.id, opt.id)} className="text-red-400 hover:text-red-600">×</button>
                      )}
                    </div>
                  ))}
                </div>
                {poll.options.length < 6 && (
                  <div className="flex gap-2">
                    <input value={newOption} onChange={(e) => setNewOption(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addOption(poll.id)}
                      placeholder="Tambah opsi baru..."
                      className="flex-1 p-2 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-400" />
                    <button onClick={() => addOption(poll.id)}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-xl font-black text-xs hover:bg-blue-200 transition-all">
                      +
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Cara Vote</label>
                  <select value={poll.voteMode} onChange={(e) => updatePoll(poll.id, "voteMode", e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-400">
                    <option value="message">Ketik opsi di pesan</option>
                    <option value="donate">Donasi ke opsi tertentu</option>
                    <option value="amount">Nominal = bobot vote</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Min Donasi (Rp)</label>
                  <input type="number" value={poll.minAmountToVote || 0}
                    onChange={(e) => updatePoll(poll.id, "minAmountToVote", Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-400" />
                </div>
              </div>
              {poll.voteMode === "message" && (
                <div className="px-3 py-2 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-[10px] text-blue-700 font-bold">
                    💬 Donor mengetik "A", "B", "C" dll di kolom pesan saat donasi
                  </p>
                </div>
              )}
              {poll.voteMode === "donate" && (
                <div className="px-3 py-2 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-[10px] text-green-700 font-bold">
                    💰 Setiap donasi otomatis dihitung sebagai 1 vote untuk pilihan yang disebutkan
                  </p>
                </div>
              )}
              {poll.voteMode === "amount" && (
                <div className="px-3 py-2 bg-purple-50 rounded-xl border border-purple-100">
                  <p className="text-[10px] text-purple-700 font-bold">
                    📊 Nominal donasi = bobot vote. Rp 50.000 = 50 vote
                  </p>
                </div>
              )}
            </div>
          ))}
          <button onClick={createNewPoll}
            className="w-full py-3 border-2 border-dashed border-blue-200 text-blue-500 rounded-2xl font-black text-sm hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
            + Buat Polling Baru
          </button>
        </div>
      </SectionCard>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────────
// SHARED SUB-COMPONENTS
// ────────────────────────────────────────────────────────────────────────────────
const SectionCard = ({ icon, title, color, children }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg"
        style={{ backgroundColor: color + "22" }}>
        {icon}
      </div>
      <h3 className="font-black text-slate-800">{title}</h3>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const ToggleRow = ({ label, desc, value, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
    <div className="flex-1 pr-4">
      <p className="font-black text-sm text-slate-700">{label}</p>
      {desc && <p className="text-[11px] text-slate-400 font-medium mt-0.5">{desc}</p>}
    </div>
    <button onClick={() => onChange(!value)}
      className={cls(
        "relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 cursor-pointer flex-shrink-0",
        value ? "bg-blue-600" : "bg-slate-300"
      )}>
      <span className={cls(
        "inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300",
        value ? "translate-x-8" : "translate-x-1"
      )} />
    </button>
  </div>
);

const SliderRow = ({ label, min, max, step, value, suffix, onChange }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <span className="text-sm font-black text-blue-600">{value}{suffix}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-blue-600" />
  </div>
);

// ────────────────────────────────────────────────────────────────────────────────
// SAVE BUTTON (generates backend config)
// ────────────────────────────────────────────────────────────────────────────────
const SaveBar = ({ settings, onSave, saving }) => (
  <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-t border-slate-200 px-6 py-4 flex items-center justify-between shadow-xl">
    <div>
      <p className="font-black text-slate-800 text-sm">Perubahan belum disimpan</p>
      <p className="text-[10px] text-slate-400 font-medium">Klik simpan untuk menerapkan ke overlay OBS</p>
    </div>
    <button onClick={onSave} disabled={saving}
      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all active:scale-[0.97] disabled:opacity-70">
      {saving ? (
        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
      ) : (
        <>💾 Simpan Semua Fitur</>
      )}
    </button>
  </div>
);

// ────────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ────────────────────────────────────────────────────────────────────────────────
const DEFAULT = {
  // filter
  bannedWords: ["anjing", "babi", "kampret"],
  filterMode: "censor",
  filterReplacement: "[dihapus]",
  filterDonorName: false,
  // sound
  notifSoundPreset: "none",
  notifSoundUrl: "",
  globalVolume: 80,
  soundTiers: [],
  // tts
  ttsEnabled: false,
  ttsReadMessage: true,
  ttsReadAmount: true,
  ttsRate: 1,
  ttsPitch: 1,
  ttsVolume: 100,
  ttsTemplate: "medium",
  ttsMaxLength: 150,
  // milestones
  milestonesEnabled: false,
  milestonesPublic: true,
  milestoneAnimation: true,
  milestones: [
    { id: 1, label: "Setup Lighting", description: "Beli ring light baru", targetAmount: 500000, icon: "💡", color: "#f59e0b", completed: false },
    { id: 2, label: "Mic Pro", description: "Upgrade ke condenser mic", targetAmount: 1500000, icon: "🎙️", color: "#6366f1", completed: false },
    { id: 3, label: "PC Gaming", description: "PC baru buat gaming 4K", targetAmount: 15000000, icon: "🖥️", color: "#10b981", completed: false },
  ],
  totalRaisedDemo: 350000,
  // leaderboard
  lbEnabled: true,
  lbShowAmount: true,
  lbShowCount: true,
  lbShowAnon: false,
  lbShowBar: true,
  lbMaxEntries: 5,
  lbPeriod: "all",
  // qr
  qrEnabled: false,
  qrStyle: "card",
  qrSize: "medium",
  qrPosition: "bottom-right",
  qrShowLabel: true,
  qrLabel: "Scan untuk donasi!",
  qrFgColor: "#3730a3",
  qrBgColor: "#ffffff",
  username: "streamer",
  // subathon
  subathonEnabled: false,
  subathonOverlay: true,
  subathonAutoPause: true,
  subathonBaseTime: 3600,
  subathonMaxTime: 86400,
  subathonDecayRate: 60,
  subathonTiers: [
    { minAmount: 10000, addSeconds: 60, label: "Starter" },
    { minAmount: 50000, addSeconds: 300, label: "Sultan" },
  ],
  // polling
  pollingEnabled: false,
  pollingOverlay: true,
  pollingShowPct: true,
  polls: [],
};

export default function StreamerFeatures() {
  const [activeTab, setActiveTab] = useState("filter");
  const [settings, setSettings] = useState(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  const handleChange = useCallback((newSettings) => {
    setSettings(newSettings);
    setDirty(true);
    setSaved(false);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    setSaved(true);
    setDirty(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const panels = {
    filter: <FilterPanel settings={settings} onChange={handleChange} />,
    sound: <SoundPanel settings={settings} onChange={handleChange} />,
    tts: <TTSPanel settings={settings} onChange={handleChange} />,
    milestone: <MilestonePanel settings={settings} onChange={handleChange} />,
    leaderboard: <LeaderboardPanel settings={settings} onChange={handleChange} />,
    qrcode: <QRCodePanel settings={settings} onChange={handleChange} />,
    subathon: <SubathonPanel settings={settings} onChange={handleChange} />,
    polling: <PollingPanel settings={settings} onChange={handleChange} />,
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3 py-4">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black italic text-sm">D</div>
            <div>
              <h1 className="font-black text-slate-900 leading-none">Fitur Lanjutan</h1>
              <p className="text-[10px] text-slate-400 font-medium">DUKUNG.IN Dashboard</p>
            </div>
            {saved && (
              <span className="ml-auto px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-black flex items-center gap-1">
                ✅ Tersimpan!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="bg-white border-b border-slate-100 sticky top-[61px] z-30">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-1 py-2 scrollbar-hide">
            {TABS.map((tab) => (
              <button key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cls(
                  "flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                    : "text-slate-500 hover:bg-slate-100"
                )}>
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        {panels[activeTab]}
      </div>

      {/* Save Bar */}
      {dirty && <SaveBar settings={settings} onSave={handleSave} saving={saving} />}
    </div>
  );
}