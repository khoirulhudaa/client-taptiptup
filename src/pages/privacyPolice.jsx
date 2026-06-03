import { useState } from "react";
import { Link } from "react-router-dom";

/* ─────────────────────────────────────────
   COLORS (Konsisten dengan TapTipTup)
───────────────────────────────────────── */
const C = {
  bg: "#0a0b10",
  bg2: "#12141d",
  line: "#232736",
  line2: "#2d334a",
  text: "#f8fafc",
  muted: "#64748b",
  dim: "#334155",
  lime: "#fda4af", // Soft Rose Pink
};

/* ─────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────── */
function SectionTitle({ children }) {
  return (
    <h3 className="w-max md:text-[20px] text-[16px]" style={{
      fontFamily: "'Bebas Neue', sans-serif",
      color: C.lime,
      fontWeight: 800,
      marginTop: 48,
      marginBottom: 16,
      letterSpacing: "0.02em"
    }}>
      {children}
    </h3>
  );
}

function PolicyText({ children }) {
  return (
    <p style={{
      fontSize: 15,
      lineHeight: 1.8,
      color: "rgba(248, 250, 252, 0.8)",
      marginBottom: 16,
      fontWeight: 400
    }}>
      {children}
    </p>
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Space Grotesk', sans-serif" }}>
        <nav
          className="px-[30px] md:px-[40px] py-[24px] flex justify-between items-center sticky top-0 z-10 backdrop-blur-[10px] bg-[rgba(10,11,16,0.8)]"
          style={{ borderBottom: `1px solid ${C.line}` }}
        > 
        <Link to="/" style={{ textDecoration: "none", color: C.text, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 24, height: 24, background: C.lime, color: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900 }}>🪼</div>
          TAP-TIP-TUP
        </Link>
        <Link className="text-white flex items-center gap-[5px] hover:text-white/80 active:scale-[0.98]" to="/" style={{ fontSize: 14, textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Kembali <span className="md:flex hidden">ke Beranda</span> →
        </Link>
      </nav>

      {/* Header Halaman */}
      <header className="w-full md:w-[56vw] md:text-justify text-center flex justify-start items-start flex-col mx-auto border-x border-slate-100/10 px-[28px] md:px-[38px] pt-[40px] md:pt-[80px] pb-[40px]" style={{ textAlign: "center" }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: C.lime, textTransform: "uppercase", letterSpacing: "0.2em" }}>Taptiptup official</span>
        <h1 className="w-max text-[30px] md:text-[50px]" style={{ fontWeight: 800, fontFamily: "'Bebas Neue', sans-serif", lineHeight: 1, marginTop: 16 }}>
          KEBIJAKAN <span style={{ color: C.lime }}>PRIVASI</span>
        </h1>
        <div className="text-slate-400" style={{ fontSize: 16, marginTop: 12 }}>
          Terakhir diperbarui: 30 Mei 2026
        </div>
      </header>

      {/* Konten Utama */}
      <main className="border-x border-t border-slate-100/10 w-full md:w-[56vw] md:text-justify py-[30px] md:py-[60px] px-[30px] md:px-[40px]" style={{ margin: "0 auto"}}>
        <PolicyText>
          Selamat datang di TapTipTup. Kami menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan menjaga informasi Anda saat Anda menggunakan platform kami.
        </PolicyText>

        <SectionTitle>Informasi yang Kami Kumpulkan</SectionTitle>
        <PolicyText>
          Kami mengumpulkan informasi yang Anda berikan langsung kepada kami saat mendaftar, seperti:
        </PolicyText>
        <div className="text-slate-400" style={{ fontSize: 14, marginBottom: 20, lineHeight: 2 }}>
          <p>Nama lengkap dan nama pengguna (username).</p>
          <p>Alamat email untuk verifikasi dan notifikasi.</p>
          <p>Data akun bank atau e-wallet (untuk pencairan donasi).</p>
          <p>Informasi profil media sosial yang Anda hubungkan (seperti Twitch atau YouTube).</p>
        </div>

        <SectionTitle>Penggunaan Data</SectionTitle>
        <PolicyText>
          Data yang kami kumpulkan digunakan untuk tujuan berikut:
        </PolicyText>
        <div className="text-slate-400" style={{ fontSize: 14, marginBottom: 20, lineHeight: 2 }}>
          <p>Memproses transaksi donasi secara real-time.</p>
          <p>Menampilkan alert donasi pada overlay OBS Anda.</p>
          <p>Mengelola sistem leaderboard dan milestone donasi.</p>
          <p>Meningkatkan keamanan akun dan mencegah tindakan penipuan (fraud).</p>
        </div>

        <SectionTitle>Berbagi Informasi dengan Pihak Ketiga</SectionTitle>
        <PolicyText>
          Kami tidak menjual data pribadi Anda. Namun, kami berbagi data dengan mitra penyedia layanan untuk operasional:
        </PolicyText>
        <div className="text-slate-400" style={{ fontSize: 14, marginBottom: 20, lineHeight: 2 }}>
          <p><strong>Payment Gateway:</strong> Untuk memproses pembayaran via QRIS dan transfer bank.</p>
          <p><strong>Penyedia Cloud:</strong> Untuk menyimpan data overlay dan aset media Anda dengan aman.</p>
        </div>

        <SectionTitle>Keamanan Data</SectionTitle>
        <PolicyText>
          Kami menerapkan standar keamanan industri untuk melindungi informasi Anda dari akses tidak sah. Semua transaksi keuangan dienkripsi dan kami secara rutin memantau sistem kami dari kerentanan.
        </PolicyText>

        <SectionTitle>Hak Anda</SectionTitle>
        <PolicyText>
          Anda memiliki hak untuk mengakses, mengoreksi, atau menghapus data pribadi Anda kapan saja melalui dashboard pengaturan akun. Jika Anda ingin menutup akun secara permanen, Anda dapat menghubungi tim dukungan kami.
        </PolicyText>

        <div style={{ 
          marginTop: 80, 
          padding: 32, 
          background: C.bg2, 
          borderLeft: `4px solid ${C.lime}`,
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: C.lime }}>Pertanyaan atau Masukan?</div>
          <PolicyText>
            Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini, silakan hubungi kami di: 
            <br />
            <strong style={{ color: C.text }}>taptiptup.support@gmail.com</strong>
          </PolicyText>
        </div>
      </main>

      {/* Footer Sederhana */}
      <footer className="text-slate-500" style={{ padding: "40px", borderTop: `1px solid ${C.line}`, textAlign: "center" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.05em" }}>
          © 2026 TAP-TIP-TUP OFFICIAL.
        </p>
      </footer>
    </div>
  );
}