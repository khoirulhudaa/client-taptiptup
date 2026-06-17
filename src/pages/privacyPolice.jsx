// import { useState } from "react";
// import { Link } from "react-router-dom";

// /* ─────────────────────────────────────────
//    COLORS (Konsisten dengan TapTipTup)
// ───────────────────────────────────────── */
// const C = {
//   bg: "#0a0b10",
//   bg2: "#12141d",
//   line: "#232736",
//   line2: "#2d334a",
//   text: "#f8fafc",
//   muted: "#64748b",
//   dim: "#334155",
//   lime: "#fda4af", // Soft Rose Pink
// };

// /* ─────────────────────────────────────────
//    SUB-COMPONENTS
// ───────────────────────────────────────── */
// function SectionTitle({ children }) {
//   return (
//     <h3 className="w-max md:text-[20px] text-[16px]" style={{
//       fontFamily: "'Bebas Neue', sans-serif",
//       color: 'white',
//       fontWeight: 800,
//       marginTop: 48,
//       marginBottom: 16,
//       letterSpacing: "0.02em"
//     }}>
//       {children}
//     </h3>
//   );
// }

// function PolicyText({ children }) {
//   return (
//     <p style={{
//       fontSize: 15,
//       lineHeight: 1.8,
//       color: "rgba(248, 250, 252, 0.8)",
//       marginBottom: 16,
//       fontWeight: 400
//     }}>
//       {children}
//     </p>
//   );
// }

// /* ─────────────────────────────────────────
//    MAIN COMPONENT
// ───────────────────────────────────────── */
// export default function PrivacyPolicy() {
//   return (
//     <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Space Grotesk', sans-serif" }}>
//         <nav
//           className="px-[30px] md:px-[40px] py-[18px] flex justify-between items-center sticky top-0 z-10 backdrop-blur-[10px] bg-[rgba(10,11,16,0.8)]"
//           style={{ borderBottom: `1px solid ${C.line}` }}
//         > 
//         <Link to="/" style={{ textDecoration: "none", color: C.text, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
//           <div style={{ width: 34, height: 34, background: 'white', color: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900 }}>
//             <img src="/logttt.png" alt="logo" className="w-[82%]" />
//           </div>
//           TAP-TIP-TUP
//         </Link>
//         <Link className="text-white flex items-center gap-[5px] hover:text-white/80 active:scale-[0.98]" to="/" style={{ fontSize: 14, textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.1em" }}>
//           Kembali <span className="md:flex hidden">ke Beranda</span> →
//         </Link>
//       </nav>

//       {/* Header Halaman */}
//       <header className="w-full md:w-[56vw] md:text-justify text-center flex justify-start items-start flex-col mx-auto border-x border-slate-100/10 px-[28px] md:px-[38px] pt-[40px] md:pt-[80px] pb-[40px]" style={{ textAlign: "center" }}>
//         <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'white', textTransform: "uppercase", letterSpacing: "0.2em" }}>Taptiptup official</span>
//         <h1 className="w-max text-[30px] md:text-[50px]" style={{ fontWeight: 800, fontFamily: "'Bebas Neue', sans-serif", lineHeight: 1, marginTop: 16 }}>
//           KEBIJAKAN <span style={{ color: 'white' }}>PRIVASI</span>
//         </h1>
//         <div className="text-slate-400" style={{ fontSize: 16, marginTop: 12 }}>
//           Terakhir diperbarui: 30 Mei 2026
//         </div>
//       </header>

//       {/* Konten Utama */}
//       <main className="border-x border-t border-slate-100/10 w-full md:w-[56vw] md:text-justify py-[30px] md:py-[60px] px-[30px] md:px-[40px]" style={{ margin: "0 auto"}}>
//         <PolicyText>
//           Selamat datang di TapTipTup. Kami menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan menjaga informasi Anda saat Anda menggunakan platform kami.
//         </PolicyText>

//         <SectionTitle>Informasi yang Kami Kumpulkan</SectionTitle>
//         <PolicyText>
//           Kami mengumpulkan informasi yang Anda berikan langsung kepada kami saat mendaftar, seperti:
//         </PolicyText>
//         <div className="text-slate-400" style={{ fontSize: 14, marginBottom: 20, lineHeight: 2 }}>
//           <p>Nama lengkap dan nama pengguna (username).</p>
//           <p>Alamat email untuk verifikasi dan notifikasi.</p>
//           <p>Data akun bank atau e-wallet (untuk pencairan donasi).</p>
//           <p>Informasi profil media sosial yang Anda hubungkan (seperti Twitch atau YouTube).</p>
//         </div>

//         <SectionTitle>Penggunaan Data</SectionTitle>
//         <PolicyText>
//           Data yang kami kumpulkan digunakan untuk tujuan berikut:
//         </PolicyText>
//         <div className="text-slate-400" style={{ fontSize: 14, marginBottom: 20, lineHeight: 2 }}>
//           <p>Memproses transaksi donasi secara real-time.</p>
//           <p>Menampilkan alert donasi pada overlay OBS Anda.</p>
//           <p>Mengelola sistem leaderboard dan milestone donasi.</p>
//           <p>Meningkatkan keamanan akun dan mencegah tindakan penipuan (fraud).</p>
//         </div>

//         <SectionTitle>Berbagi Informasi dengan Pihak Ketiga</SectionTitle>
//         <PolicyText>
//           Kami tidak menjual data pribadi Anda. Namun, kami berbagi data dengan mitra penyedia layanan untuk operasional:
//         </PolicyText>
//         <div className="text-slate-400" style={{ fontSize: 14, marginBottom: 20, lineHeight: 2 }}>
//           <p><strong>Payment Gateway:</strong> Untuk memproses pembayaran via QRIS dan transfer bank.</p>
//           <p><strong>Penyedia Cloud:</strong> Untuk menyimpan data overlay dan aset media Anda dengan aman.</p>
//         </div>

//         <SectionTitle>Keamanan Data</SectionTitle>
//         <PolicyText>
//           Kami menerapkan standar keamanan industri untuk melindungi informasi Anda dari akses tidak sah. Semua transaksi keuangan dienkripsi dan kami secara rutin memantau sistem kami dari kerentanan.
//         </PolicyText>

//         <SectionTitle>Hak Anda</SectionTitle>
//         <PolicyText>
//           Anda memiliki hak untuk mengakses, mengoreksi, atau menghapus data pribadi Anda kapan saja melalui dashboard pengaturan akun. Jika Anda ingin menutup akun secara permanen, Anda dapat menghubungi tim dukungan kami.
//         </PolicyText>

//         <div style={{ 
//           marginTop: 80, 
//           padding: 32, 
//           background: C.bg2, 
//           borderLeft: `4px solid ${'white'}`,
//           display: "flex",
//           flexDirection: "column",
//           gap: 12
//         }}>
//           <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: 'white' }}>Pertanyaan atau Masukan?</div>
//           <PolicyText>
//             Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini, silakan hubungi kami di: 
//             <br />
//             <strong style={{ color: C.text }}>taptiptup.support@gmail.com</strong>
//           </PolicyText>
//         </div>
//       </main>

//       {/* Footer Sederhana */}
//       <footer className="text-slate-500" style={{ padding: "40px", borderTop: `1px solid ${C.line}`, textAlign: "center" }}>
//         <p style={{ fontSize: 11, letterSpacing: "0.05em" }}>
//           © 2026 TAP-TIP-TUP OFFICIAL.
//         </p>
//       </footer>
//     </div>
//   );
// }


import { useState, useEffect, useRef } from "react";
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
  lime: "#fda4af",
};

/* ─────────────────────────────────────────
   GALAXY STAR CANVAS
───────────────────────────────────────── */
function GalaxyCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    };
    resize();

    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.2,
      alpha: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.004 + 0.001,
      phase: Math.random() * Math.PI * 2,
    }));

    const nebulas = Array.from({ length: 5 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 200 + 80,
      hue: [220, 260, 290, 310, 200][Math.floor(Math.random() * 5)],
      alpha: Math.random() * 0.04 + 0.01,
    }));

    let frame;
    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nebulas.forEach((n) => {
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        grad.addColorStop(0, `hsla(${n.hue},80%,70%,${n.alpha})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      });

      stars.forEach((s) => {
        const pulse = Math.sin(t * s.speed * 60 + s.phase) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha * pulse})`;
        ctx.fill();

        if (s.r > 1.1) {
          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.strokeStyle = `rgba(200,210,255,${s.alpha * pulse * 0.5})`;
          ctx.lineWidth = 0.4;
          ctx.beginPath();
          ctx.moveTo(-s.r * 3, 0); ctx.lineTo(s.r * 3, 0);
          ctx.moveTo(0, -s.r * 3); ctx.lineTo(0, s.r * 3);
          ctx.stroke();
          ctx.restore();
        }
      });

      t++;
      frame = requestAnimationFrame(draw);
    };
    draw();

    const onScroll = () => {
      canvas.height = document.documentElement.scrollHeight;
    };
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.9,
      }}
    />
  );
}

/* ─────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────── */
function SectionTitle({ children }) {
  return (
    <h3
      className="w-max md:text-[20px] text-[16px]"
      style={{
        fontFamily: "'Bebas Neue', sans-serif",
        color: "white",
        fontWeight: 800,
        marginTop: 48,
        marginBottom: 16,
        letterSpacing: "0.02em",
        position: "relative",
        zIndex: 1,
      }}
    >
      {children}
    </h3>
  );
}

function PolicyText({ children }) {
  return (
    <p
      style={{
        fontSize: 15,
        lineHeight: 1.8,
        color: "rgba(248, 250, 252, 0.8)",
        marginBottom: 16,
        fontWeight: 400,
        position: "relative",
        zIndex: 1,
      }}
    >
      {children}
    </p>
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function PrivacyPolicy() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: "'Space Grotesk', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <GalaxyCanvas />

      <nav
        className="px-[30px] md:px-[40px] py-[18px] flex justify-between items-center sticky top-0 z-10 backdrop-blur-[10px] bg-[rgba(10,11,16,0.8)]"
        style={{ borderBottom: `1px solid ${C.line}` }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: C.text,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              background: "white",
              color: C.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            <img src="/logttt.png" alt="logo" className="w-[82%]" />
          </div>
          TAP-TIP-TUP
        </Link>
        <Link
          className="text-white flex items-center gap-[5px] hover:text-white/80 active:scale-[0.98]"
          to="/"
          style={{
            fontSize: 14,
            textDecoration: "none",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Kembali <span className="md:flex hidden">ke Beranda</span> →
        </Link>
      </nav>

      {/* Header Halaman */}
      <header
        className="w-full md:w-[56vw] md:text-justify text-center flex justify-start items-start flex-col mx-auto border-x border-slate-100/10 px-[28px] md:px-[38px] pt-[40px] md:pt-[80px] pb-[40px]"
        style={{ textAlign: "center", position: "relative", zIndex: 1 }}
      >
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            color: "white",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
          }}
        >
          Taptiptup official
        </span>
        <h1
          className="w-max text-[30px] md:text-[50px]"
          style={{
            fontWeight: 800,
            fontFamily: "'Bebas Neue', sans-serif",
            lineHeight: 1,
            marginTop: 16,
          }}
        >
          KEBIJAKAN <span style={{ color: "white" }}>PRIVASI</span>
        </h1>
        <div className="text-slate-400" style={{ fontSize: 16, marginTop: 12 }}>
          Terakhir diperbarui: 30 Mei 2026
        </div>
      </header>

      {/* Konten Utama */}
      <main
        className="border-x border-t border-slate-100/10 w-full md:w-[56vw] md:text-justify py-[30px] md:py-[60px] px-[30px] md:px-[40px]"
        style={{ margin: "0 auto", position: "relative", zIndex: 1 }}
      >
        <PolicyText>
          Selamat datang di TapTipTup. Kami menghargai privasi Anda dan berkomitmen
          untuk melindungi data pribadi Anda. Kebijakan Privasi ini menjelaskan
          bagaimana kami mengumpulkan, menggunakan, dan menjaga informasi Anda saat
          Anda menggunakan platform kami.
        </PolicyText>

        <SectionTitle>Informasi yang Kami Kumpulkan</SectionTitle>
        <PolicyText>
          Kami mengumpulkan informasi yang Anda berikan langsung kepada kami saat
          mendaftar, seperti:
        </PolicyText>
        <div
          className="text-slate-400"
          style={{ fontSize: 14, marginBottom: 20, lineHeight: 2, position: "relative", zIndex: 1 }}
        >
          <p>Nama lengkap dan nama pengguna (username).</p>
          <p>Alamat email untuk verifikasi dan notifikasi.</p>
          <p>Data akun bank atau e-wallet (untuk pencairan donasi).</p>
          <p>
            Informasi profil media sosial yang Anda hubungkan (seperti Twitch atau
            YouTube).
          </p>
        </div>

        <SectionTitle>Penggunaan Data</SectionTitle>
        <PolicyText>
          Data yang kami kumpulkan digunakan untuk tujuan berikut:
        </PolicyText>
        <div
          className="text-slate-400"
          style={{ fontSize: 14, marginBottom: 20, lineHeight: 2, position: "relative", zIndex: 1 }}
        >
          <p>Memproses transaksi donasi secara real-time.</p>
          <p>Menampilkan alert donasi pada overlay OBS Anda.</p>
          <p>Mengelola sistem leaderboard dan milestone donasi.</p>
          <p>
            Meningkatkan keamanan akun dan mencegah tindakan penipuan (fraud).
          </p>
        </div>

        <SectionTitle>Berbagi Informasi dengan Pihak Ketiga</SectionTitle>
        <PolicyText>
          Kami tidak menjual data pribadi Anda. Namun, kami berbagi data dengan
          mitra penyedia layanan untuk operasional:
        </PolicyText>
        <div
          className="text-slate-400"
          style={{ fontSize: 14, marginBottom: 20, lineHeight: 2, position: "relative", zIndex: 1 }}
        >
          <p>
            <strong>Payment Gateway:</strong> Untuk memproses pembayaran via QRIS
            dan transfer bank.
          </p>
          <p>
            <strong>Penyedia Cloud:</strong> Untuk menyimpan data overlay dan aset
            media Anda dengan aman.
          </p>
        </div>

        <SectionTitle>Keamanan Data</SectionTitle>
        <PolicyText>
          Kami menerapkan standar keamanan industri untuk melindungi informasi Anda
          dari akses tidak sah. Semua transaksi keuangan dienkripsi dan kami secara
          rutin memantau sistem kami dari kerentanan.
        </PolicyText>

        <SectionTitle>Hak Anda</SectionTitle>
        <PolicyText>
          Anda memiliki hak untuk mengakses, mengoreksi, atau menghapus data
          pribadi Anda kapan saja melalui dashboard pengaturan akun. Jika Anda
          ingin menutup akun secara permanen, Anda dapat menghubungi tim dukungan
          kami.
        </PolicyText>

        <div
          style={{
            marginTop: 80,
            padding: 32,
            background: C.bg2,
            borderLeft: `4px solid white`,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 12,
              color: "white",
            }}
          >
            Pertanyaan atau Masukan?
          </div>
          <PolicyText>
            Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini, silakan
            hubungi kami di:
            <br />
            <strong style={{ color: C.text }}>taptiptup.support@gmail.com</strong>
          </PolicyText>
        </div>
      </main>

      {/* Footer Sederhana */}
      <footer
        className="text-slate-500"
        style={{
          padding: "20px 40px",
          borderTop: `1px solid ${C.line}`,
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <p style={{ fontSize: 11, letterSpacing: "0.05em" }}>
          © 2026 TAP-TIP-TUP OFFICIAL.
        </p>
      </footer>
    </div>
  );
}