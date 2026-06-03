// components/TransferModal.jsx
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Search,
  SendHorizonal,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const formatRp = (val) =>
  val ? `Rp ${Number(val).toLocaleString("id-ID")}` : "";

export const TransferModal = ({ user, onClose, onSuccess }) => {
  const [step, setStep]           = useState("list"); // list | form | confirm | done
  const [mutuals, setMutuals]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState(null);
  const [amount, setAmount]       = useState("");
  const [note, setNote]           = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError]         = useState("");
  const [submitting, setSubmitting] = useState(false);
  const amountRef = useRef(null);
  const [pin, setPin] = useState(["", "", "", ""]);
  const pinRefs = [useRef(), useRef(), useRef(), useRef()];

  // ── Fetch mutual follows ──────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/transfer/mutual-follows`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setMutuals(d.users || []))
      .catch(() => setError("Gagal memuat daftar streamer"))
      .finally(() => setLoading(false));
  }, []);

  // ── Focus amount input when entering form step ────────────────────────────
  useEffect(() => {
    if (step === "form") {
      setTimeout(() => amountRef.current?.focus(), 200);
    }
  }, [step]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const filtered = mutuals.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const handlePinInput = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newPin = [...pin];
    // ← ambil digit terakhir saja, bukan value penuh (handle paste/replace)
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError("");
    if (value && index < 3) pinRefs[index + 1].current?.focus();
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
  };

  const handlePinSubmit = () => {
    const fullPin = pin.join("");
    if (fullPin.length < 4) {
      setError("Masukkan 4 digit PIN keamanan");
      return;
    }
    handleSubmit(fullPin);
  };

  const numAmount = Number(amount.replace(/\D/g, "")) || 0;
  const amountValid = numAmount >= 1_000 && numAmount <= 1_000_000;

  const handleAmountInput = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setAmount(raw);
    setError("");
  };

  const handleSelectUser = (u) => {
    setSelected(u);
    setStep("form");
    setError("");
  };

  const handleConfirm = () => {
    if (!amountValid) {
      setError("Jumlah harus antara Rp 1.000 – Rp 1.000.000");
      return;
    }
    setStep("pin"); 
  };

  const handleSubmit = async (securityPin) => {  // ← tambah parameter
    setSubmitting(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: selected._id,
          amount: numAmount,
          note,
          securityPin,  // ← sekarang terisi dari parameter
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Transfer gagal");
      setStep("done");
      onSuccess?.(data.newBalance);
    } catch (err) {
      setError(err.message);
      setStep("pin");  // ← kembali ke pin bukan form supaya user bisa coba lagi
    } finally {
      setSubmitting(false);
    }
  };

  const QUICK_AMOUNTS = [5_000, 10_000, 25_000, 50_000, 100_000, 250_000];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-[9999] overflow-hidden"
        style={{ borderRadius: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center">
              <SendHorizonal size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">
                Kirim Saldo
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                {step === "list" && "Pilih penerima"}
                {step === "form" && `Ke @${selected?.username}`}
                {step === "confirm" && "Konfirmasi transfer"}
                {step === "pin" && "Verifikasi PIN"}
                {step === "done" && "Transfer berhasil"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-red-600 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* ── STEP: LIST ─────────────────────────────────────────────────── */}
          {step === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.18 }}
            >
              <div className="px-6 pt-4 pb-2">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari username streamer..."
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-all font-medium"
                    style={{ borderRadius: 0 }}
                  />
                </div>
              </div>

              <div className="overflow-y-auto max-h-72 px-3 pb-4">
                {loading && (
                  <div className="flex flex-col items-center gap-3 py-10 text-slate-400">
                    <Loader2 size={22} className="animate-spin" />
                    <p className="text-sm font-medium">Memuat daftar...</p>
                  </div>
                )}

                {!loading && filtered.length === 0 && (
                  <div className="flex flex-col items-center gap-3 py-10 text-slate-400">
                    <Users size={28} className="opacity-40" />
                    <p className="text-sm font-medium text-center">
                      {mutuals.length === 0
                        ? "Belum ada streamer yang saling follow denganmu"
                        : "Tidak ada hasil untuk pencarian ini"}
                    </p>
                  </div>
                )}

                {!loading &&
                  filtered.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => handleSelectUser(u)}
                      className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all active:scale-[0.99] group"
                    >
                      <div className="w-9 h-9 bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                        {u.profilePicture ? (
                          <img
                            src={u.profilePicture}
                            alt={u.username}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentElement.innerText =
                                u.username?.charAt(0).toUpperCase();
                            }}
                          />
                        ) : (
                          u.username?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                          @{u.username}
                        </p>
                        <p className="text-xs text-slate-400 font-medium">
                          Saling follow
                        </p>
                      </div>
                      <ArrowRight
                        size={14}
                        className="text-slate-300 group-hover:text-blue-500 transition-colors"
                      />
                    </button>
                  ))}
              </div>
            </motion.div>
          )}

          {/* ── STEP: FORM ─────────────────────────────────────────────────── */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18 }}
              className="px-6 py-5 space-y-5"
            >
              {/* Penerima */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <div className="w-10 h-10 bg-blue-600 flex items-center justify-center text-white font-bold text-md flex-shrink-0 overflow-hidden">
                  {selected?.profilePicture ? (
                    <img
                      src={selected.profilePicture}
                      alt={selected.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    selected?.username?.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    @{selected?.username}
                  </p>
                </div>
                <button
                  onClick={() => { setStep("list"); setSelected(null); setAmount(""); }}
                  className="cursor-pointer ml-auto text-xs text-slate-400 hover:text-blue-600 font-bold transition-colors"
                >
                  Ganti
                </button>
              </div>

              {/* Jumlah */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                  Jumlah Transfer
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    ref={amountRef}
                    type="text"
                    inputMode="numeric"
                    value={amount ? Number(amount).toLocaleString("id-ID") : ""}
                    onChange={handleAmountInput}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-3 text-lg font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-300 outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-all"
                    style={{ borderRadius: 0 }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <p className="text-xs text-slate-400 font-medium">
                    Min Rp 1.000 · Maks Rp 1.000.000
                  </p>
                  <p className="text-xs font-bold text-blue-500">
                    Saldo: {formatRp(user?.balance ?? 0)}
                  </p>
                </div>
              </div>

              {/* Quick amounts */}
              <div className="grid grid-cols-3 gap-2">
                {QUICK_AMOUNTS.map((v) => (
                  <button
                    key={v}
                    onClick={() => { setAmount(String(v)); setError(""); }}
                    className={`cursor-pointer py-1.5 text-xs font-bold border transition-all active:scale-[0.97] ${
                      numAmount === v
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600"
                    }`}
                    style={{ borderRadius: 0 }}
                  >
                    {formatRp(v)}
                  </button>
                ))}
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                  Catatan (opsional)
                </label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={60}
                  placeholder="Tulis catatan..."
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-all font-medium"
                  style={{ borderRadius: 0 }}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                  <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setStep("list"); setSelected(null); }}
                  className="cursor-pointer flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-[0.99]"
                  style={{ borderRadius: 0 }}
                >
                  Kembali
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!amountValid}
                  className="cursor-pointer flex-[2] py-3 bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                  style={{ borderRadius: 0 }}
                >
                  <SendHorizonal size={15} />
                  Lanjutkan
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP: CONFIRM ──────────────────────────────────────────────── */}
          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18 }}
              className="px-6 py-6 text-center space-y-5"
            >
              <div className="w-16 h-16 mx-auto bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                <SendHorizonal size={28} className="text-blue-600 dark:text-blue-400" />
              </div>

              <div>
                <p className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                  {formatRp(numAmount)}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                  akan dikirim ke{" "}
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    @{selected?.username}
                  </span>
                </p>
                {note && (
                  <p className="text-xs text-slate-400 mt-2 italic">"{note}"</p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                  <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setStep("form")}
                  disabled={submitting}
                  className="cursor-pointer flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 transition-all active:scale-[0.99] disabled:opacity-40"
                  style={{ borderRadius: 0 }}
                >
                  Ubah
                </button>
                <button
                  onClick={() => setStep("pin")}  
                  disabled={submitting}
                  className="cursor-pointer flex-[2] py-3.5 bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70"
                  style={{ borderRadius: 0 }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />
                      Ya, Kirim Sekarang
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

           {step === "pin" && (
              <motion.div
                key="pin"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
                className="px-6 py-8 text-center space-y-6"
              >
                <div>
                  <div className="w-12 h-12 mx-auto bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center mb-4">
                    <ShieldCheck size={22} className="text-amber-500" />
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-base">
                    Masukkan PIN Keamanan
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    Konfirmasi transfer{" "}
                    <span className="font-bold text-slate-600 dark:text-slate-300">
                      {formatRp(numAmount)}
                    </span>{" "}
                    ke{" "}
                    <span className="font-bold text-slate-600 dark:text-slate-300">
                      @{selected?.username}
                    </span>
                  </p>
                </div>

                {/* 4 PIN inputs */}
                {/* Toggle show/hide */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPin(v => !v)}
                    className="cursor-pointer flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-500 transition-colors"
                  >
                    {showPin ? <EyeOff size={13} /> : <Eye size={13} />}
                    {showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                  </button>
                </div>

                {/* 4 PIN inputs */}
                <div className="flex items-center justify-center gap-3">
                  {pin.map((digit, i) => (
                    <input
                      key={i}
                      ref={pinRefs[i]}
                      type={showPin ? 'text' : 'password'}
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinInput(i, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(i, e)}
                      onFocus={(e) => e.target.select()}  // ← select saat focus agar langsung replace
                      className={`w-14 h-14 text-center text-2xl font-black bg-slate-50 dark:bg-slate-800 border-2 outline-none transition-all
                        ${digit
                          ? "border-blue-500 dark:border-blue-400 text-slate-800 dark:text-slate-100"
                          : "border-slate-200 dark:border-slate-700 text-slate-300"
                        }
                        focus:border-blue-500 dark:focus:border-blue-400`}
                      style={{ borderRadius: 0 }}
                    />
                  ))}
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 justify-center bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                    <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                    <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => { setStep("confirm"); setPin(["", "", "", ""]); setError(""); }}
                    disabled={submitting}
                    className="cursor-pointer flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 transition-all active:scale-[0.99] disabled:opacity-40"
                    style={{ borderRadius: 0 }}
                  >
                    Kembali
                  </button>
                  <button
                    onClick={handlePinSubmit}
                    disabled={submitting || pin.join("").length < 4}
                    className="cursor-pointer flex-[2] py-3.5 bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ borderRadius: 0 }}
                  >
                    {submitting ? (
                      <><Loader2 size={15} className="animate-spin" /> Memproses...</>
                    ) : (
                      <><ShieldCheck size={15} /> Konfirmasi PIN</>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

          {/* ── STEP: DONE ─────────────────────────────────────────────────── */}
          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="px-6 py-10 text-center space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 28, delay: 0.1 }}
                className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-950/40 flex items-center justify-center"
              >
                <CheckCircle2 size={36} className="text-green-600 dark:text-green-400" />
              </motion.div>

              <div>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                  Transfer Berhasil!
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                  {formatRp(numAmount)} terkirim ke{" "}
                  <span className="font-bold">@{selected?.username}</span>
                </p>
              </div>

              <button
                onClick={onClose}
                className="cursor-pointer w-full py-3.5 bg-slate-800 dark:bg-slate-700 text-white font-bold text-sm hover:bg-slate-700 dark:hover:bg-slate-600 transition-all active:scale-[0.99]"
                style={{ borderRadius: 0 }}
              >
                Selesai
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};