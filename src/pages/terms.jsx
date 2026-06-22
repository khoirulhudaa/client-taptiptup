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

function ListItem({ children }) {
  return (
    <p
      style={{
        fontSize: 14,
        lineHeight: 2,
        color: "rgba(100, 116, 139, 1)",
        marginBottom: 2,
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
export default function TermsConditions() {
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

      {/* NAV */}
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

      {/* HEADER */}
      <header
        className="w-full md:w-[56vw] md:text-justify text-center flex justify-start items-start flex-col mx-auto border-x border-slate-100/10 px-[28px] md:px-[38px] pt-[40px] md:pt-[80px] pb-[40px]"
        style={{ position: "relative", zIndex: 1 }}
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
          SYARAT &amp;{" "}
          <span style={{ color: 'white' }}>KETENTUAN</span>
        </h1>
        <div className="text-slate-400" style={{ fontSize: 16, marginTop: 12 }}>
          Terakhir diperbarui: 30 Mei 2026
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main
        className="border-x border-t border-slate-100/10 w-full md:w-[56vw] md:text-justify py-[30px] md:py-[60px] px-[30px] md:px-[40px]"
        style={{ margin: "0 auto", position: "relative", zIndex: 1 }}
      >
        <PolicyText>
          Selamat datang di TapTipTup. Dengan mengakses atau menggunakan platform
          kami, Anda menyetujui untuk terikat dengan Syarat dan Ketentuan berikut.
          Harap baca dengan seksama sebelum menggunakan layanan kami.
        </PolicyText>

        {/* 1 */}
        <SectionTitle>1. Penerimaan Ketentuan</SectionTitle>
        <PolicyText>
          Dengan mendaftar dan menggunakan layanan TapTipTup, Anda menyatakan bahwa
          Anda telah membaca, memahami, dan menyetujui Syarat dan Ketentuan ini.
          Jika Anda tidak menyetujui ketentuan ini, harap hentikan penggunaan
          platform kami.
        </PolicyText>

        {/* 2 */}
        <SectionTitle>2. Deskripsi Layanan</SectionTitle>
        <PolicyText>
          TapTipTup adalah platform dukungan dan tipping real-time yang dirancang
          untuk streamer dan kreator konten. Layanan kami meliputi:
        </PolicyText>
        <div style={{ marginBottom: 20 }}>
          <ListItem>Sistem dukungan real-time dengan alert OBS overlay.</ListItem>
          <ListItem>Leaderboard dan milestone dukungan yang dapat dikustomisasi.</ListItem>
          <ListItem>Integrasi dengan platform streaming seperti Twitch dan YouTube.</ListItem>
          <ListItem>Dashboard analitik untuk memantau performa dukungan.</ListItem>
          <ListItem>Pencairan dana ke rekening bank atau e-wallet pilihan Anda.</ListItem>
        </div>

        {/* 3 */}
        <SectionTitle>3. Persyaratan Akun</SectionTitle>
        <PolicyText>
          Untuk menggunakan layanan kami secara penuh, Anda harus memenuhi
          persyaratan berikut:
        </PolicyText>
        <div style={{ marginBottom: 20 }}>
          <ListItem>Berusia minimal 17 tahun atau memiliki izin orang tua/wali.</ListItem>
          <ListItem>Memberikan informasi pendaftaran yang akurat dan terkini.</ListItem>
          <ListItem>Menjaga kerahasiaan kata sandi akun Anda.</ListItem>
          <ListItem>
            Bertanggung jawab atas seluruh aktivitas yang terjadi di akun Anda.
          </ListItem>
        </div>

        {/* 4 */}
        <SectionTitle>4. Transaksi dan Pembayaran</SectionTitle>
        <PolicyText>
          Semua transaksi dukungan yang dilakukan melalui platform TapTipTup tunduk
          pada ketentuan berikut:
        </PolicyText>
        <div style={{ marginBottom: 20 }}>
          <ListItem>
            <strong style={{ color: C.text }}>Biaya Layanan:</strong> TapTipTup
            mengenakan biaya platform sebesar 5% dari setiap dukungan yang diterima.
          </ListItem>
          <ListItem>
            <strong style={{ color: C.text }}>Pencairan Dana:</strong> Permintaan
            pencairan diproses dalam 1–3 hari kerja setelah verifikasi.
          </ListItem>
          <ListItem>
            <strong style={{ color: C.text }}>Minimum Pencairan:</strong> Saldo
            minimum untuk pencairan adalah Rp 50.000.
          </ListItem>
          <ListItem>
            <strong style={{ color: C.text }}>Dukungan Tidak Dapat Dikembalikan:</strong>{" "}
            Semua dukungan yang telah diproses bersifat final dan tidak dapat
            dikembalikan (non-refundable).
          </ListItem>
        </div>

        {/* 5 */}
        <SectionTitle>5. Konten yang Dilarang</SectionTitle>
        <PolicyText>
          Pengguna dilarang keras menggunakan platform TapTipTup untuk aktivitas
          berikut:
        </PolicyText>
        <div style={{ marginBottom: 20 }}>
          <ListItem>Penipuan atau penyalahgunaan sistem dukungan.</ListItem>
          <ListItem>Penyebaran konten yang melanggar hukum, pornografi, atau SARA.</ListItem>
          <ListItem>Pencucian uang atau aktivitas keuangan ilegal lainnya.</ListItem>
          <ListItem>Manipulasi sistem leaderboard atau data dukungan.</ListItem>
          <ListItem>Penggunaan bot atau skrip otomatis tanpa izin tertulis dari kami.</ListItem>
        </div>

        {/* 6 */}
        <SectionTitle>6. Penangguhan dan Penutupan Akun</SectionTitle>
        <PolicyText>
          TapTipTup berhak menangguhkan atau menutup akun Anda tanpa pemberitahuan
          sebelumnya jika kami mendeteksi adanya pelanggaran terhadap Syarat dan
          Ketentuan ini, aktivitas penipuan, atau penggunaan yang merugikan pihak
          lain. Saldo yang tersisa akan dicairkan setelah proses verifikasi
          selesai, kecuali jika penutupan akun disebabkan oleh aktivitas ilegal.
        </PolicyText>

        {/* 7 */}
        <SectionTitle>7. Batasan Tanggung Jawab</SectionTitle>
        <PolicyText>
          TapTipTup tidak bertanggung jawab atas:
        </PolicyText>
        <div style={{ marginBottom: 20 }}>
          <ListItem>Kerugian yang timbul akibat gangguan teknis atau downtime platform.</ListItem>
          <ListItem>Kehilangan data akibat force majeure atau serangan siber.</ListItem>
          <ListItem>
            Konten, komentar, atau tindakan yang dilakukan oleh pengguna lain di
            platform.
          </ListItem>
          <ListItem>
            Keterlambatan pencairan yang disebabkan oleh kendala pihak payment
            gateway.
          </ListItem>
        </div>

        {/* 8 */}
        <SectionTitle>8. Hak Kekayaan Intelektual</SectionTitle>
        <PolicyText>
          Seluruh elemen platform TapTipTup, termasuk nama merek, logo, desain
          antarmuka, dan kode sumber adalah milik eksklusif TapTipTup dan
          dilindungi oleh hukum hak cipta yang berlaku. Pengguna dilarang
          mereproduksi, mendistribusikan, atau membuat karya turunan tanpa izin
          tertulis.
        </PolicyText>

        {/* 9 */}
        <SectionTitle>9. Perubahan Ketentuan</SectionTitle>
        <PolicyText>
          Kami berhak mengubah Syarat dan Ketentuan ini sewaktu-waktu. Perubahan
          yang signifikan akan diberitahukan melalui email terdaftar atau notifikasi
          dalam platform setidaknya 7 hari sebelum berlaku. Penggunaan platform
          yang berlanjut setelah perubahan dianggap sebagai persetujuan Anda
          terhadap ketentuan yang diperbarui.
        </PolicyText>

        {/* 10 */}
        <SectionTitle>10. Hukum yang Berlaku</SectionTitle>
        <PolicyText>
          Syarat dan Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum
          Republik Indonesia. Setiap sengketa yang timbul akan diselesaikan melalui
          Pengadilan Negeri yang berwenang di wilayah hukum Indonesia.
        </PolicyText>

        {/* CONTACT BOX */}
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
            Jika Anda memiliki pertanyaan mengenai Syarat dan Ketentuan ini,
            silakan hubungi kami di:
            <br />
            <strong style={{ color: C.text }}>taptiptup.support@gmail.com</strong>
          </PolicyText>
        </div>
      </main>

      {/* FOOTER */}
      <footer
        className="text-slate-500"
        style={{
          padding: "40px",
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