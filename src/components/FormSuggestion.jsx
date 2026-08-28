import { useState } from "react";
import { motion } from "framer-motion";
 
/* ─────────────────────────────────────────
   Reveal helper (copy dari file utama agar
   file ini bisa berdiri sendiri / mudah di-import)
───────────────────────────────────────── */
function Reveal({ children, delay = 0, y = 40, x = 0, once = true, amount = 0.2, duration = 0.7, style, className }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export default function SuggestionForm({ C }) {
  const [form, setForm] = useState({ category: "other", title: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const CATEGORIES = [
    { id: "feature", label: "💡 Request Fitur" },
    { id: "bug", label: "🐛 Laporkan Bug" },
    { id: "improvement", label: "⚡ Perbaikan" },
    { id: "other", label: "💬 Lainnya" },
  ];

  const handleChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setErrorMsg("Judul wajib diisi");
      setStatus("error");
      return;
    }
    if (!form.message.trim()) {
      setErrorMsg("Pesan wajib diisi");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      // Sesuaikan key localStorage dengan yang dipakai auth system-mu (mis. "token", "authToken", "accessToken")
      const token = localStorage.getItem("token");

      if (!token) {
        setErrorMsg("Kamu harus login dulu untuk mengirim saran");
        setStatus("error");
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/suggestions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mengirim saran");
      }

      setStatus("success");
      setForm({ category: "other", title: "", message: "" });
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(255,255,255,0.15)",
    borderRadius: 10,
    padding: "12px 16px",
    color: "white",
    fontFamily: "'Space Grotesk',sans-serif",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    fontFamily: "'Space Mono',monospace",
    fontSize: 10,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.5)",
    marginBottom: 8,
    display: "block",
  };

  return (
    <section
      id="saran"
      className="relative overflow-hidden w-full flex flex-col justify-center !pt-[80px] md:!pt-[100px] !pb-[60px] md:!pb-[100px] items-center"
      style={{
        background: "#0a0f1e",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none select-none" style={{ zIndex: 0 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="suggestion-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#suggestion-grid)" />
        </svg>
      </div>

      <Reveal className="relative text-center flex flex-col items-center px-6 mb-12" style={{ zIndex: 2 }}>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
          color: "azure", marginBottom: 20, display: "block",
        }}>
          Kami Dengerin Kamu
        </span>
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(32px,6vw,72px)",
          lineHeight: 1.1, color: "white", letterSpacing: "0.01em",
        }}>
          ADA SARAN ATAU <span style={{ color: "azure" }}>MASUKAN?</span>
        </h2>
      </Reveal>

      <Reveal delay={0.1} className="relative w-[90vw] md:w-[80vw] !mt-4" style={{ zIndex: 2 }}>
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: "32px 28px",
        }}>

          {status === "success" ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: "white", marginBottom: 8 }}>
                Saran Terkirim!
              </div>
              <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 20 }}>
                Terima kasih atas masukanmu. Kamu bisa cek statusnya di halaman "Saran Saya".
              </p>
              <button
                onClick={() => setStatus("idle")}
                style={{
                  fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: 700,
                  letterSpacing: "0.05em", textTransform: "uppercase",
                  padding: "10px 24px", borderRadius: 8,
                  border: "1px solid azure", background: "transparent", color: "azure",
                  cursor: "pointer",
                }}
              >
                Kirim Saran Lain
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              <div>
                <label style={labelStyle}>Kategori</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {CATEGORIES.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleChange("category", c.id)}
                      style={{
                        padding: "8px 14px", borderRadius: 8,
                        border: form.category === c.id ? "1.5px solid azure" : "1.5px solid rgba(255,255,255,0.15)",
                        background: form.category === c.id ? "rgba(240,255,255,0.1)" : "transparent",
                        color: form.category === c.id ? "azure" : "rgba(255,255,255,0.6)",
                        fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: 600,
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Judul *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => handleChange("title", e.target.value)}
                  placeholder="Ringkasan singkat saranmu"
                  maxLength={200}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Pesan *</label>
                <textarea
                  value={form.message}
                  onChange={e => handleChange("message", e.target.value)}
                  placeholder="Jelaskan lebih detail saran, bug, atau masukanmu..."
                  rows={5}
                  maxLength={2000}
                  style={{ ...inputStyle, resize: "vertical", fontFamily: "'Space Grotesk',sans-serif" }}
                />
              </div>

              {status === "error" && (
                <div style={{
                  fontFamily: "'Space Grotesk',sans-serif", fontSize: 12,
                  color: "#ff6b6b", background: "rgba(255,107,107,0.1)",
                  border: "1px solid rgba(255,107,107,0.3)", borderRadius: 8,
                  padding: "10px 14px",
                }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                style={{
                  fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 700,
                  letterSpacing: "0.05em", textTransform: "uppercase",
                  padding: "14px 24px", borderRadius: 10,
                  border: "1px solid azure",
                  background: status === "loading" ? "rgba(240,255,255,0.3)" : "azure",
                  color: "#0d2b45", cursor: status === "loading" ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                }}
              >
                {status === "loading" ? "Mengirim..." : "Kirim Saran"}
              </button>
            </form>
          )}
        </div>
      </Reveal>
    </section>
  );
}