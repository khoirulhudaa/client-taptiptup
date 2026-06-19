import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */

const FEATURES = [
  { num: "01", ico: "🎨", name: "Overlay OBS Kustom", desc: "Alert Dukungan tampil langsung di stream. Tema modern, classic, atau minimal dengan animasi dan warna sesukamu." },
  { num: "02", ico: "🔊", name: "Suara per Nominal", desc: "Sultan dapat sound kenceng! Atur efek suara berbeda untuk setiap tier Dukungan. 16+ preset siap pakai." },
  { num: "03", ico: "🛡️", name: "Filter Kata Terlarang", desc: "Blokir, sensor, atau ganti kata tidak pantas otomatis. Jagain konten tetap aman dan profesional." },
  { num: "04", ico: "🎯", name: "Milestones & Goals", desc: "Tampilkan progress target Dukungan di OBS. Donor bisa lihat seberapa dekat goal tercapai." },
  { num: "05", ico: "🖼️", name: "Media Alert", desc: "Izinkan donor kirim gambar atau video saat Dukungan mencapai nominal tertentu. Sultan alert yang epic." },
  { num: "06", ico: "🗳️", name: "Poll & Subathon", desc: "Voting live untuk penonton dan timer subathon yang bertambah otomatis setiap ada Dukungan masuk." },
  { num: "07", ico: "🏆", name: "Leaderboard", desc: "Tampilkan top donor di overlay OBS. Gamifikasi Dukungan bikin penonton makin kompetitif dan seru." },
  { num: "08", ico: "👥", name: "Streamer Community", desc: "Temukan dan follow sesama streamer. Bangun network, kolaborasi, dan berkembang bersama." },
];

const HOW_IT_WORKS = [
  { num: "01", ico: "🚀", title: "Daftar Gratis", desc: "Buat akun dalam hitungan detik. Tidak perlu kartu kredit apapun." },
  { num: "02", ico: "🎨", title: "Konfigurasi Overlay", desc: "Pilih tema, warna, animasi, dan atur suara sesuai brand stream-mu." },
  { num: "03", ico: "📺", title: "Pasang di OBS", desc: "Copy URL overlay, tambahkan sebagai Browser Source di OBS Studio." },
  { num: "04", ico: "💸", title: "Terima Dukungan", desc: "Donor bayar via QRIS atau transfer — alert langsung muncul di stream!" },
];

const TESTIMONIALS = [
  { avatar: "R", avatarBg: "#7c5cbf", avatarColor: "#fff", name: "@ZulionZX", role: "Coding Streamer", text: '"Setup-nya gampang banget, 5 menit udah live. Alert-nya keren dan donatur makin semangat karena ada leaderboard!"', statNum: "2026", statLabel: "tahun ini" },
  { avatar: "S", avatarBg: "#e05a3a", avatarColor: "#fff", name: "@Krigatsu", role: "Gaming Streamer", text: '"Fitur filter kata terlarang beneran ngebantu banget. Streamku jadi lebih aman dan aku bisa fokus main."', statNum: "2026", statLabel: "tahun ini" },
  { avatar: "B", avatarBg: 'white', avatarColor: "#080808", name: "@MinusGamdes", role: "Music Streamer", text: '"Sound tier sultan pakai efek beda — penonton jadi pengen Dukungan lebih gede biar dapat sound kenceng!"', statNum: "2026", statLabel: "tahun ini" },
];

const PLANS = [
  {
    name: "Gratis", desc: "Mulai tanpa risiko", price: "Rp 0", period: "// selamanya",
    features: ["Overlay OBS basic", "Alert Dukungan real-time", "1 preset suara", "QR Code Dukungan", "Dashboard riwayat"],
    cta: "Mulai Gratis", hot: false,
  },
  {
    name: "Pro", desc: "Untuk streamer serius", price: "49rb", period: "// per bulan",
    features: ["Semua fitur Gratis", "Sound tiers tak terbatas", "Filter kata terlarang", "Media alert (gambar/video)", "Poll & Subathon timer", "Milestones & Leaderboard", "Prioritas support"],
    cta: "Coba 14 Hari Gratis", hot: true,
  },
  {
    name: "Partner", desc: "Untuk agency & partner", price: "Custom", period: "// hubungi kami",
    features: ["Semua fitur Pro", "White-label branding", "API akses penuh", "Dedicated support", "Revenue sharing"],
    cta: "Hubungi Kami", hot: false,
  },
];

/* ─────────────────────────────────────────
   THEME TOKENS
───────────────────────────────────────── */
const THEMES = {
  dark: {
    bg:    "#0a0b10",
    bg2:   "#12141d",
    bg3:   "#1b1e2b",
    line:  "#232736",
    line2: "#2d334b",
    text:  "#f8fafc",
    muted: "white",
    dim:   "#334155",
    lime:  "azure",  // teal/toska — dark mode
    navBg: "rgba(8,8,8,0.92)",
  },
  light: {
    bg:    "#f5f4f0",
    bg2:   "#eceae3",
    bg3:   "#e0ddd4",
    line:  "#d4d0c8",
    line2: "#b8b4a8",
    text:  "#0a0b10",
    muted: "#4a4a55",
    dim:   "#9a9898",
    lime:  "azure",  // teal/toska lebih gelap agar kontras di light mode
    navBg: "rgba(245,244,240,0.92)",
  },
};

/* ─────────────────────────────────────────
   HOOKS
───────────────────────────────────────── */
function useInView(threshold = 0.3) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function useCounter(target, duration, start) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    function tick(now) {
      const p = Math.min((now - t0) / duration, 1);
      setCount(Math.round(ease(p) * target));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration, start]);
  return count;
}

/* ─────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────── */

function Kicker({ children, C }) {
  return (
    <span style={{
      fontFamily: "'Space Mono', monospace",
      fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
      color: C.lime, marginBottom: 16, display: "block",
    }}>
      {children}
    </span>
  );
}

function BigTitle({ children, style, C }) {
  return (
    <h2 style={{
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: "clamp(32px,6vw,76px)",
      lineHeight: 1.2, letterSpacing: "0.01em", color: C.text,
      ...style,
    }}>
      {children}
    </h2>
  );
}

function BtnMain({ children, href, style, C }) {
  return (
    <Link 
      to={href || "/"} 
      draggable={false}
      className="rounded-xl hover:bg-[azure] active:scale-[0.98] opacity-100 text-[azure] hover:text-blue-900 select-none w-[90vw] relative flex justify-center items-center md:w-max text-center" // Tambahkan class ini
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 13, fontWeight: 700, 
        letterSpacing: "0.05em", 
        textTransform: "uppercase",
        padding: "16px 46px", 
        border: "1px solid azure", 
        cursor: "pointer", 
        textDecoration: "none",
        display: "inline-block", 
        opacity: 1,
        boxSizing: "border-box", 
        ...style,
      }}
      onMouseOver={e => e.currentTarget.style.opacity = "1"}
      onMouseOut={e => e.currentTarget.style.opacity = "1"}
    >
      {children}
    </Link>
  );
}

function BtnGhost({ children, href, style, C }) {
  return (
    <Link 
      draggable={false}
      to={href || "/"} 
      className="select-none w-[86vw] md:w-auto text-center"
      target="__blank" 
      style={{
      fontFamily: "'Space Grotesk', sans-serif",
      fontSize: 13, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase",
      padding: "14px 24px", border: `1px solid ${C.line2}`,
      background: "white", cursor: "pointer",
      textDecoration: "none", display: "inline-block", transition: "all 0.15s",
      ...style,
    }}
      onMouseOver={e => { e.currentTarget.style.borderColor = C.dim; e.currentTarget.style.color = C.text; }}
      onMouseOut={e => { e.currentTarget.style.borderColor = C.line2; e.currentTarget.style.color = C.muted; }}
    >
      {children}
    </Link>
  );
}

function AlertPop({ visible, C }) {
  return (
    <div style={{
      position: "absolute", bottom: 12, right: 12,
      background: C.bg2,
      borderLeft: `3px solid ${C.lime}`,
      padding: "10px 14px", maxWidth: 200,
      transition: "all 0.5s cubic-bezier(0.34,1.56,0.64,1)",
      transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.92)",
      opacity: visible ? 1 : 0,
    }}>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: C.lime, letterSpacing: "0.05em", marginBottom: 2 }}>@BudiSantoso</div>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, lineHeight: 1, color: C.text, letterSpacing: "0.02em" }}>Rp 150.000</div>
      <div style={{ fontSize: 10, color: C.muted, marginTop: 3, lineHeight: 1.4 }}>"Semangat terus ngodingnya bang!"</div>
    </div>
  );
}

function Hero({ C, isDark }) {
  const [alertVisible, setAlertVisible] = useState(false);
  const [ref, inView] = useInView(0.3);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const rotate = useMotionValue(0);
  const smoothRotate = useSpring(rotate, {
    stiffness: 120,
    damping: 12,
  });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;

    const offset = e.clientX - centerX;

    rotate.set(offset * 0.01);
  };

  const handleMouseLeave = () => {
    rotate.set(0);
  };

  useEffect(() => {
    const cycle = () => {
      setAlertVisible(false);
      setTimeout(() => setAlertVisible(true), 1200);
    };
    const id = setInterval(cycle, 5000);
    setTimeout(() => setAlertVisible(true), 600);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="home"
      className="select-none bg-blue-900 !border-b border-[azure] hero-wrapper md:py-0 min-h-max md:h-[95vh] overflow-hidden relative"
      style={{
        display: "grid",
        gridTemplateRows: "1fr auto",
        paddingTop: 70,
      }}
    >


      {/* Grid Background (Mobile) */}
      <div className="select-none hidden md:flex absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="crossgrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                // stroke="rgba(255,255,255,0.4)"
                strokeWidth="0.5"
                className="stroke-white/30 md:stroke-white/50"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#crossgrid)" />
        </svg>
      </div>

      <img src="/man2.png" alt="image man" className="absolute md:flex hidden bottom-0 md:bottom-[-56px] left-[-40px] 2xl:left-[-280px] md:left-[-257px] w-[44%] md:w-[50%] z-[99999]" />
      <img src="/woman1.png" alt="image woman" className="absolute bottom-0 md:flex hidden md:bottom-[-40px] left-[-34px] md:left-[-22px] 2xl:left-[-32px] w-[46%] md:w-[43.0%] z-[99999]" />
      <img src="/woman2.png" alt="image woman" className="absolute bottom-0  md:flex hidden md:bottom-[-100px] right-12 w-[32%] z-[99999]" />
      <img src="/man1.png" alt="image man" className="absolute bottom-0 md:flex hidden md:bottom-[-40px] right-[-17px] md:right-[-208px] w-[39.5%] md:w-[40%] z-[999]" />
      <div className="absolute bottom-0 flex z-[5]">
        <Marquee C={C} />
      </div>
      {/* Main Content */}
      <div
        style={{ zIndex: 4, transition: "border-color 0.4s" }}
        className="select-none relative top-[-40px] hero-main-grid relative h-full flex items-center"
      >
        <div
          className="select-none text-center mx-auto w-full flex flex-col !pt-0 md:!pt-[40px] justify-center items-center px-6"
          style={{ paddingBottom: "0px" }}
        >

        <img src="/logttt.png" alt="img" loading="lazy" className="w-[90%] md:hidden 2xl:hidden !mt-[-53px]" />
        {/* Judul Hero */}
         <h1 className="select-none hero-title md:!mt-[-10px] 2xl:!mt-[-34px] font-['Bebas_Neue'] leading-[0.85] tracking-[-0.01em] text-white mb-4 text-center hidden md:flex flex-wrap items-center justify-center gap-[0.1em] transition-colors duration-400">
            
          <span className="relative top-[-10px] text-[2.81rem] lg:text-8xl 2xl:text-[7rem] w-[100vw] md:w-[80vw] select-none hidden md:flex items-center justify-center">
            <span className="flex md:gap-x-5 flex-wrap w-[100vw] md:w-[80vw] relative mt-10 text-center justify-center items-center">

              {/* Banner + tali */}
              <motion.div
                style={{
                  rotate: isMobile ? 0 : smoothRotate,
                  transformOrigin: "top center",
                }}
                animate={
                  isMobile
                    ? {}
                    : {
                        x: [-8, 8, -8],
                      }
                }
                transition={{
                  x: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                onMouseMove={!isMobile ? handleMouseMove : undefined}
                onMouseLeave={!isMobile ? handleMouseLeave : undefined}
                className="relative inline-block"
              >
                {/* Tali kiri */}
                <div className="absolute w-[1px] h-[40vh] bg-white -rotate-30 top-[-34vh] left-[-64px] md:flex hidden" />

                {/* Tali kanan */}
                <div className="absolute w-[1px] h-[40vh] bg-white rotate-30 top-[-34vh] right-[-64px] md:flex hidden" />

                {/* Banner */}
                <span className="md:!inline-block !hidden md:!px-2 2xl:min-w-[68vw] rounded-xl min-w-[100vw] md:min-w-[69vw] relative md:text-black 2xl:h-[98px] md:h-[85px] md:bg-[azure]">
                  POTONGAN HANYA 3.0% UNTUK
                </span>
                <span className="!inline-block md:!hidden md:!px-2 2xl:min-w-[70vw] rounded-xl min-w-[100vw] md:min-w-[64vw] relative md:text-black 2xl:h-[98px] md:h-[85px] md:bg-[azure]">
                  POTONGAN HANYA 3.0%
                </span>
              </motion.div>

              {/* Tetap diam */}
              <span className="md:!inline-block !hidden">
                SETIAP DUKUNGAN MASUK
              </span>
              <span className="!inline-block md:!hidden">
                UNTUK SETIAP DUKUNGAN MASUK
              </span>

            </span>
          </span>

          </h1>

          {/* <br className="md:hidden flex" /> */}
          <br className="hidden 2xl:!flex md:hidden" />

          {/* Deskripsi */}
          <p
            className="select-none md:!mb-[26px] !mb-[20px] w-[86vw] !py-1 md:max-w-[50vw] leading-normal md:!leading-loose"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(13px, 1.5vw, 16px)",
              color: "rgba(255,255,255,0.8)",
              // marginBottom: 36,
              textAlign: "center",
            }}
          >
            Platform Dukungan streamer asal Indonesia dengan potongan terkecil yaitu 3.0%. 
          </p>

          {/* Container Tombol */}
          <div className="select-none mb-20 w-full max-w-md md:max-w-none px-4">
            <div className="select-none flex flex-col md:flex-row items-center gap-4 w-full justify-center">
              <BtnMain href="/register" C={C}>
                <p draggable={false} className="select-none w-full flex justify-center items-center mx-auto text-center flex items-center gap-2">
                  Mulai Sekarang - Gratis
                </p>
              </BtnMain>
            </div>
          </div>

          <br />
          <br />

          {/* BOUNCING MOUSE */}
          <div className="select-none hidden md:flex flex-col items-center">
            <div 
              style={{
                width: "28px",
                height: "48px",
                border: `2px solid azure`,
                borderRadius: "9999px",
                position: "relative",
                display: "flex",
                justifyContent: "center",
                opacity: 0.75,
              }}
            >
              <div
                style={{
                  width: "5px",
                  height: "10px",
                  background: 'azure',
                  borderRadius: "9999px",
                  position: "absolute",
                  top: "8px",
                  animation: "mouseScroll 2s infinite ease-in-out",
                }}
              />
            </div>

            <p 
              style={{
                marginTop: "14px",
                fontSize: "10px",
                letterSpacing: "0.12em",
                color: 'azure',
                fontFamily: "'Space Mono', monospace",
                textTransform: "uppercase",
              }}
            >
              Scroll ke bawah
            </p>
          <br className="md:hidden flex" />
        </div>
        </div>
      </div>
      {[
        { left: "18%", dur: "7s",   delay: "1.2s", emoji: "💰" },
        { left: "25%", dur: "5s", delay: "0s",   emoji: "🤑" },
        { left: "32%", dur: "9s",   delay: "0.7s", emoji: "👍" },
        { left: "38%", dur: "7.5s", delay: "1.5s", emoji: "💵" },
        { left: "42%", dur: "6s",   delay: "0.2s", emoji: "💰" },
        // { left: "50%", dur: "8.5s", delay: "1s",   emoji: "🤑" },
        { left: "55%", dur: "7s",   delay: "0s",   emoji: "👍" },
        { left: "60%", dur: "6.5s", delay: "0.8s", emoji: "💵" },
        { left: "65%", dur: "9s",   delay: "1.8s", emoji: "💰" },
        { left: "70%", dur: "7.5s", delay: "0.4s", emoji: "🤑" },
        { left: "76%", dur: "6s",   delay: "1.3s", emoji: "👍" },
        { left: "82%", dur: "8s",   delay: "0s",   emoji: "💵" },
        { left: "88%", dur: "7s",   delay: "0.6s", emoji: "💰" },
        { left: "94%", dur: "6.5s", delay: "1.1s", emoji: "🤑" },
      ].map((item, i) => (
        <span
          key={i}
          className="thumb-float md:flex hidden"
          style={{
            left: item.left,
            "--size": "26px",
            "--dur": item.dur,
            "--delay": item.delay,
            "--rot": `${i % 2 === 0 ? "-" : ""}${6 + (i % 5) * 3}deg`,
          }}
        >
          {item.emoji}
        </span>
      ))}
      {/* Global CSS (tambahkan animasi galaxy) */}
      <style>{`
       @keyframes twinkle {
          0%   { opacity: 0.35; }
          50%  { opacity: 0.95; }
          100% { opacity: 0.45; }
        }

        @keyframes galaxyDrift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(8%, 12%) scale(1.08); }
        }

        @keyframes waveLeft {
          0% { 
            transform: translateX(0) scaleX(1); 
            opacity: 0.8;
          }
          100% { 
            transform: translateX(10%) scaleX(1.1); 
            opacity: 1;
          }
        }

        @keyframes waveRight {
          0% { 
            transform: translateX(0) scaleX(1); 
            opacity: 0.8;
          }
          100% { 
            transform: translateX(-10%) scaleX(1.1); 
            opacity: 1;
          }
        }

        @keyframes wavePulse {
          0% { 
            transform: scale(1); 
            opacity: 0.6;
          }
          50% { 
            transform: scale(1.2); 
            opacity: 1;
          }
          100% { 
            transform: scale(0.9); 
            opacity: 0.7;
          }
        }

        .aurora-blob {
          position: absolute;
          width: 50vw;
          height: 50vw;
          min-width: 300px;
          min-height: 300px;
          border-radius: 50%;
          filter: blur(100px);
          mix-blend-mode: screen;
          opacity: 0.4;
          animation: move 20s infinite alternate ease-in-out;
        }

        .aurora-1 { top: -10%; left: -10%; animation-duration: 18s; }
        .aurora-2 { bottom: -10%; right: -5%; animation-delay: -5s; animation-duration: 25s; }
        .aurora-3 { top: 20%; left: 30%; animation-delay: -2s; animation-duration: 30s; }

        @keyframes move {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          50% { transform: translate(10%, 15%) scale(1.1) rotate(45deg); }
          100% { transform: translate(-5%, 10%) scale(0.9) rotate(-45deg); }
        }

        @keyframes twinkle {
          0%   { opacity: 0.35; }
          50%  { opacity: 0.95; }
          100% { opacity: 0.45; }
        }

        @keyframes galaxyDrift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(8%, 12%) scale(1.08); }
        }

        .aurora-blob {
          position: absolute;
          width: 50vw;
          height: 50vw;
          min-width: 300px;
          min-height: 300px;
          border-radius: 50%;
          filter: blur(100px);
          mix-blend-mode: screen;
          opacity: 0.4;
          animation: move 20s infinite alternate ease-in-out;
        }

        .aurora-1 { top: -10%; left: -10%; animation-duration: 18s; }
        .aurora-2 { bottom: -10%; right: -5%; animation-delay: -5s; animation-duration: 25s; }
        .aurora-3 { top: 20%; left: 30%; animation-delay: -2s; animation-duration: 30s; }

        @keyframes move {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          50% { transform: translate(10%, 15%) scale(1.1) rotate(45deg); }
          100% { transform: translate(-5%, 10%) scale(0.9) rotate(-45deg); }
        }

        {/* Tambahkan di dalam <style> yang sudah ada, setelah animasi lainnya */}
        @keyframes floatUpHero {
          0%   { transform: translateY(0) scale(0.5) rotate(var(--rot)); opacity: 0; }
          10%  { opacity: 0.7; }
          85%  { opacity: 0.5; }
          100% { transform: translateY(-44vh) scale(1.1) rotate(calc(var(--rot) + 15deg)); opacity: 0; }
        }
        .thumb-float {
          position: absolute;
          bottom: -30px;
          animation: floatUpHero var(--dur) ease-in infinite;
          animation-delay: var(--delay);
          pointer-events: none;
          user-select: none;
          z-index: 2;
          font-size: var(--size);
        }
      `}</style>
    </section>
  );
}

const MARQUEE_ITEMS = [
  { name: "BudiSantoso",    amount: "150.000" },
  { name: "RizkyGamer",     amount: "50.000"  },
  { name: "SultanStream",   amount: "500.000" },
  { name: "AnonymDonatur",  amount: "25.000"  },
  { name: "FansSetia99",    amount: "100.000" },
  { name: "GacorBanget",    amount: "250.000" },
  { name: "StreamerBro",    amount: "75.000"  },
  { name: "BudiGamer11",     amount: "1.000.000" },
];

function Marquee({ C }) {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div style={{ overflow: "hidden", borderBottom: `1px solid ${C.line}`, background: C.bg2, transition: "background 0.4s, border-color 0.4s" }}>
      <div style={{ display: "flex", animation: "marquee 28s linear infinite", width: "max-content" }}>
        {items.map((item, i) => (
          <div key={i} style={{
            padding: "14px 32px", borderRight: `1px solid ${C.line}`,
            fontFamily: "'Space Mono',monospace", fontSize: 11,
            letterSpacing: "0.06em", textTransform: "uppercase", color: C.muted,
            display: "inline-flex", alignItems: "center", gap: 10, whiteSpace: "nowrap",
            transition: "color 0.4s, border-color 0.4s",
          }}>
            <span style={{ width: 4, height: 4, borderRadius: "0%", background: C.lime, display: "inline-block", flexShrink: 0, transition: "background 0.4s" }} />
            <span style={{ color: C.text, fontWeight: 700 }}>{item.name}</span>
            <span>mengirim</span>
            <span style={{ color: C.lime, fontWeight: 700 }}>Rp.{item.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const PLATFORMS = [
  { name: "Saweria",    feeDonate: 5.0,  feeWd: 5000,  feeWdLabel: "Rp 5.000",  winner: true },
  { name: "TapTipTup", feeDonate: 3.0,  feeWd: 3500,  feeWdLabel: "Rp 4.000" },
  { name: "Sociabuzz",  feeDonate: 5.0,  feeWd: 4500,  feeWdLabel: "Rp 4.500", winner: true },
  // { name: "TipTap",  feeDonate: 3.0,  feeWd: 6.500,  feeWdLabel: "Rp 6.500" },
];

function OverlayCustom({ C }) {
  const ITEMS = [
    { title: "Kustom Tema & Warna", desc: "Pilih 4 tema berbeda. Ubah warna, font, dan animasi sesuai brand stream-mu." },
    { title: "Suara per Nominal", desc: "Sultan dapat sound kenceng! 16+ preset audio, atur sendiri tiap tier Dukungan." },
    { title: "Posisi & Ukuran Bebas", desc: "Drag & drop posisi alert, goal bar, dan leaderboard langsung dari dashboard." },
  ];

  const TAGS = ["OBS Studio", "Streamlabs OBS", "YouTube Live", "TikTok Live", "Twitch", "Facebook Gaming", "Instagram Live"];

  return (
    <section
      className="bg-blue-900 relative overflow-hidden flex md:!py-[55px] !py-[64px] flex-col justify-center items-center"
    >
      {/* Grid bg */}
      <div className="select-none hidden md:flex absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="overlay-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#overlay-grid)" />
        </svg>
      </div>

      <div className="relative w-[90vw] md:w-[82vw] mx-auto" style={{ zIndex: 10 }}>

        {/* ── HEADER ── */}
        <div className="text-center flex flex-col items-center mb-4">
          <Kicker C={C}>Desain & Akses</Kicker>

          {/* Judul dengan badge "able" */}
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(36px, 7vw, 86px)",
            lineHeight: 1.05, letterSpacing: "0.01em", color: "white",
            marginBottom: 16,
          }}>
            KESUKAAN SI PALING{" "}
            <span style={{
              display: "inline-block",
              borderRadius: 8,
            }}>
              FLEX
            </span>
            <span style={{ color: "azure" }}>IBEL</span>
          </h2>
        </div>

        {/* ── CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 rounded-xl overflow-hidden !mt-8"
          style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
          {ITEMS.map((item, i) => {
            const isLast = i === PLATFORMS.length - 1;
            return (
              <div
                key={item.num}
                style={{
                  padding: "36px 28px",
                  borderRight: i < ITEMS.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none",
                  background: i % 2 === 0 ? "#0d2b45" : "#0d2b45",
                  position: "relative",
                  borderRadius: 14,
                  borderRight: !isLast ? `1px solid ${C.line}` : "none",
                  transition: "background 0.2s",
                }}
              >
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 26, lineHeight: 1.1,
                  color: "white",
                  marginBottom: 30,
                  marginTop: 4
                }}>
                  {item.title}
                </div>

                <div style={{
                  height: 1,
                  background: "white",
                  marginBottom: 14,
                }} />

                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 13.5, lineHeight: 1.65,
                  color: "white", paddingTop: 2
                }}>
                  {item.desc}
                </div>
              </div>
            )}
          )}
        </div>

        {/* ── TAGS ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 28, justifyContent: "center" }}>
          {TAGS.map((t) => (
            <span key={t} style={{
              fontFamily: "'Space Mono', monospace", fontSize: 10,
              letterSpacing: "0.06em", textTransform: "uppercase",
              padding: "6px 14px",
              border: "1px solid rgba(173,216,230,0.7)",
              color: "rgba(173,216,230,1)", borderRadius: 8,
            }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
function NominalSection({ C }) {
  const ITEMS_GIFT = [
    { emoji: "💎", name: "Diamond",    price: "10.000"  },
    { emoji: "🍣", name: "Sushi",      price: "5.000"   },
    { emoji: "🪷", name: "Kembang",    price: "2.000"   },
    { emoji: "🚀", name: "Roket",      price: "25.000"  },
    { emoji: "👑", name: "Mahkota",    price: "50.000"  },
    { emoji: "🎮", name: "Controller", price: "7.500"   },
    { emoji: "🔥", name: "Fire",       price: "1.000"   },
    { emoji: "🏆", name: "Trophy",     price: "100.000" },
  ];

  return (
    <section
      className="bg-blue-900 relative overflow-hidden flex md:!py-[50px] !py-[20px] flex-col justify-center items-center"
    >
      {/* Grid bg */}
      <div className="select-none hidden md:flex absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="nominal-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#nominal-grid)" />
        </svg>
      </div>

      <div className="relative w-[90vw] mx-auto" style={{ zIndex: 10 }}>

        {/* ── HEADER ── */}
        <div className="text-center flex flex-col items-center mb-12">
          <Kicker C={C}>Cara Kirim Dukungan</Kicker>
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(36px, 7vw, 86px)",
            lineHeight: 1.05, color: "white", letterSpacing: "0.01em", marginBottom: 16,
          }}>
            NOMINAL BISA{" "}
            <span style={{ color: "azure" }}>KIRIM</span>{" "}
            <span style={{ color: "white" }}>ITEM JUGA BISA</span>
          </h2>
          <p className="!mb-12" style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(13px, 1.4vw, 15px)",
            color: "white", maxWidth: '90vw', lineHeight: 1.7,
          }}>
            Kirim nominal <strong style={{ color: "cyan" }}>Rp 10.000</strong> atau <strong style={{ color: "cyan" }}>Rp 150.000</strong>,
            atau kirim item <strong style={{ color: "cyan" }}>💎 Diamond ×10</strong>, <strong style={{ color: "cyan" }}>🍣 Sushi ×3</strong>, <strong style={{ color: "cyan" }}>🪷 Kembang ×5</strong>
          </p>
        </div>

        {/* ── DUA KOLOM UTAMA ── */}
        <div className="flex flex-col md:flex-row gap-6 items-stretch mb-10">

          {/* KIRI — Mode Nominal */}
          <div className="flex-1 rounded-xl overflow-hidden h-[634px]"
            style={{ border: "1px solid #e2e8f0", background: "azure" }}>

            {/* Header tab */}
            <div style={{
              background: "#0d2b45", padding: "14px 20px",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 18 }}>💸</span>
              <div className='w-full relative top-[1.6px] flex justify-between items-center'>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: "white", lineHeight: 1 }}>MODE NOMINAL</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "white", letterSpacing: "0.06em" }}>KETIK BERAPA SAJA</div>
              </div>
            </div>

            <div style={{ padding: "24px 20px" }} className="w-full h-full flex flex-col justify-between">
              <div className="w-full h-[84%]">
                {/* Nama */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 500, color: "#000", letterSpacing: "0.08em", marginBottom: 7 }}>NAMA DONATUR</div>
                  <div style={{
                    background: "#f8fafc", border: "1px solid #0d2b45",
                    borderRadius: 8, padding: "10px 14px",
                    fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, color: "#000",
                  }}>
                    RizkyGamer99 🎮
                  </div>
                </div>

                {/* Input nominal */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 500, color: "#000", letterSpacing: "0.08em", marginBottom: 7 }}>NOMINAL — KETIK BEBAS</div>
                  <div style={{
                    background: "white", borderRadius: 8, padding: "12px 16px",
                    border: '1px solid #0d2b45',
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: "black", lineHeight: 1, position: 'relative', top: 2 }}>Rp 1.275.000</span>
                  </div>
                </div>

                {/* Quick pick nominal */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 500, color: "#000", letterSpacing: "0.08em", marginBottom: 8 }}>ATAU PILIH CEPAT</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {["Rp 1rb", "Rp 5rb", "Rp 10rb", "Rp 25rb", "Rp 50rb", "Rp 100rb"].map((v, i) => (
                      <div key={v} style={{
                        padding: "6px 12px", borderRadius: 6,
                        background: i === 4 ? "#99FFFF" : "#f1f5f9",
                        border: i === 4 ? "1px solid #99FFFF" : "1px solid #0d2b45",
                        fontFamily: "'Space Mono',monospace", fontSize: 11,
                        color: "#000",
                        cursor: "pointer",
                      }}>
                        {v}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pesan */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 500, color: "#000", letterSpacing: "0.08em", marginBottom: 7 }}>PESAN</div>
                  <div style={{
                    background: "#f8fafc", border: "1px solid #0d2b45",
                    borderRadius: 8, 
                    height: '190.5px',
                    padding: "10px 14px",
                    fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: "#000",
                  }}>
                    "GG bang, mainnya mantap! 🔥"
                  </div>
                </div>
              </div>
              
              <div className="w-full h-[16%]">
                <div style={{
                  background: "#0d2b45", borderRadius: 8, padding: "13px",
                  textAlign: "center", fontFamily: "'Space Grotesk',sans-serif",
                  fontWeight: 700, fontSize: 13, color: "white", cursor: "pointer",
                }}>
                  Bayar via QRIS / Transfer →
                </div>
              </div>
            </div>
          </div>

          {/* KANAN — Mode Item */}
          <div className="flex-1 rounded-xl overflow-hidden h-[634px]"
            style={{ border: "1px solid #e2e8f0", background: "azure" }}>

            {/* Header tab */}
            <div style={{
              background: "#0d2b45", padding: "14px 20px",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 18 }}>🎁</span>
              <div className='w-full relative top-[1.6px] flex justify-between items-center'>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: "white", lineHeight: 1 }}>MODE ITEM / GIFT</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.7)", letterSpacing: "0.06em" }}>PILIH ITEM, TENTUKAN JUMLAH</div>
              </div>
            </div>

            <div style={{ padding: "24px 20px" }} className="w-full h-full flex flex-col justify-between">

              <div className="w-full h-[84%]">
                {/* Nama */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 500, color: "#000", letterSpacing: "0.08em", marginBottom: 7 }}>NAMA DONATUR</div>
                  <div style={{
                    background: "#f8fafc", border: "1px solid #0d2b45",
                    borderRadius: 8, padding: "10px 14px",
                    fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, color: "#000",
                  }}>
                    SultanStream 👑
                  </div>
                </div>

                {/* Grid item */}
                <div style={{ marginBottom: 14 }}>
                  {/* <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 500, color: "#000", letterSpacing: "0.08em", marginBottom: 8 }}>PILIH ITEM</div> */}
                  <div className="grid grid-cols-4 gap-2">
                    {ITEMS_GIFT.map((item, i) => (
                      <div key={item.name} style={{
                        borderRadius: 8, padding: "10px 6px",
                        background: i === 0 ? "#99FFFF" : "#f8fafc",
                        border: i === 0 ? "1px solid #0d2b45" : "1px solid #0d2b45",
                        textAlign: "center", cursor: "pointer",
                      }}>
                        <div style={{ fontSize: 22, marginBottom: 4 }}>{item.emoji}</div>
                        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 10, fontWeight: 700, color: "#000", marginBottom: 2 }}>{item.name}</div>
                        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 500, color: "#000" }}>{item.price}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Jumlah item */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 500, color: "#000", letterSpacing: "0.08em", marginBottom: 7 }}>JUMLAH</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["×1", "×3", "×5", "×10", "×20"].map((v, i) => (
                      <div key={v} style={{
                        flex: 1, padding: "8px 0", textAlign: "center", borderRadius: 6,
                        background: i === 2 ? "#99FFFF" : "#f1f5f9",
                        border: i === 2 ? "1px solid #0d2b45" : "1px solid #0d2b45",
                        fontFamily: "'Bebas Neue',sans-serif", fontSize: 16,
                        color: "#000",
                        cursor: "pointer",
                      }}>
                        {v}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div style={{
                  background: "#f0fffe", border: "1px solid #0d2b45",
                  borderRadius: 8, padding: "21.5px 16px", marginBottom: 16,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 500, color: "#000", letterSpacing: "0.06em", marginBottom: 4 }}>TOTAL DIKIRIM</div>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: "#000", lineHeight: 1 }}>💎 Diamond ×5</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 500, color: "#000", letterSpacing: "0.06em", marginBottom: 4 }}>NILAI</div>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: "#000", lineHeight: 1 }}>Rp 50.000</div>
                  </div>
                </div>
              </div>

              <div className="w-full h-[16%]">
                <div style={{
                  background: "#0d2b45", borderRadius: 8, padding: "13px",
                  textAlign: "center", fontFamily: "'Space Grotesk',sans-serif",
                  fontWeight: 700, fontSize: 13, color: "white", cursor: "pointer",
                }}>
                  Kirim Item via QRIS / Transfer →
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center !mt-12">
          <BtnMain href={`${window.location}/donate/taptiptup`} C={C}>Coba Kirim Dukungan Sekarang</BtnMain>
        </div>
      </div>
    </section>
  );
}

function FeeComparison({ C }) {
  const maxFee = Math.max(...PLATFORMS.map(p => p.fee));

  return (
    <section id="biaya" className="flex flex-col bg-blue-900 justify-center items-center relative overflow-hidden"
      style={{ 
        transition: "border-color 0.4s",
        padding: '40px 0px 60px 0px',           // mobile
        '@media (maxWidth: 768px)': {           // md breakpoint
          padding: '20px 0px 30px 0px'
        }
      }}>

      <div className="select-none flex absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="crossgrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#crossgrid)" />
        </svg>
      </div>

      {/* ===== GALAXY / BLACKHOLE EFFECT ===== */}
      <div className="pointer-events-none select-none absolute inset-0" style={{ zIndex: 0 }}>
        {/* Bintang-bintang */}
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 80 }).map((_, i) => (
            <circle
              key={i}
              cx={`${Math.random() * 100}%`}
              cy={`${Math.random() * 100}%`}
              r={Math.random() * 1.5 + 0.3}
              fill="white"
              opacity={Math.random() * 0.6 + 0.1}
            />
          ))}
        </svg>

        {/* Aurora galaxy di sudut */}
        <div style={{
          position: "absolute", top: "-20%", left: "-10%",
          width: "50vw", height: "50vw",
          // borderRadius: "0%",
          background: "radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)",
          filter: "blur(60px)",
          animation: "aurora-drift 15s ease-in-out infinite alternate",
        }} />
        <div style={{
          position: "absolute", top: "-20%", right: "-10%",
          width: "50vw", height: "50vw",
          // borderRadius: "0%",
          background: "radial-gradient(circle, rgba(168,85,247,0.12), transparent 70%)",
          filter: "blur(60px)",
          animation: "aurora-drift 18s ease-in-out infinite alternate-reverse",
        }} />
      </div>

      <style>{`
        @keyframes blackhole-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.05); opacity: 0.85; }
        }
        @keyframes disk-spin {
          from { transform: translate(-50%, -50%) rotateX(70deg) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotateX(70deg) rotate(360deg); }
        }
        @keyframes aurora-drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(5%, 8%) scale(1.1); }
        }
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0.2; }
        }
      `}</style>

      {/* Header */}
      <div className="select-none text-center flex flex-col justify-center items-center !py-11 !md:py-20 !px-5 transition-colors duration-400 relative z-[2]">
        <Kicker C={C}>Transparansi Biaya</Kicker>
        
        <BigTitle C={C}>POTONGAN TERKECIL DI{" "}
          <span style={{ color: C.lime }}>KELASNYA</span>
        </BigTitle>
      </div>

      {/* Grid perbandingan */}
      <div className="select-none h-max w-[90vw] relative grid gap-5 grid-cols-1 md:grid-cols-3"
        style={{ zIndex: 40, borderRadius: 10, }}
        >
          {PLATFORMS.map((p, i) => {
            const barWidth = Math.round((p.feeDonate / maxFee) * 100);
            const isLast = i === PLATFORMS.length - 1;
            const isMobile = window.innerWidth < 768;

            return (
              <div key={p.name}
                className={`${p.winner ? "bg-blue-900" : "bg-transparent"}`}
                style={{
                  padding: "24px 24px",
                  borderRadius: 10,
                  borderBottom: isMobile ? `1px solid ${C.line}` : "none",
                  background: "white",
                  border: '1px solid #ffffff80',
                  transition: "all 0.4s",
                }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#000000", marginBottom: 28, marginTop: 6, fontFamily: "'Space Grotesk',sans-serif" }}>
                  {p.name}
                </div>

                {/* Progress bar */}
                <div style={{ height: 1, background: C.line2, borderRadius: 2, marginBottom: 16, marginTop: 14 }}>
                </div>

                {/* Fee donate */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, lineHeight: 1, color: "#000000" }}>
                    {p.feeDonate.toFixed(1)}% + {p.feeWdLabel || '—'}
                  </div>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "black", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: 10 }}>
                    {p.winner || p.name === 'TipTap' ? 'potongan per Dukungan + WD semua metode' : 'potongan per Dukungan + WD Bank'}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}

function Footer({ C }) {
  return (
    <footer className="select-none text-center flex justify-center items-center" style={{ background: C.bg2, display: "grid", gridTemplateColumns: "1fr", transition: "border-color 0.4s" }}>
      <div className="select-none w-full text-center mx-auto flex flex-col justify-between items-center" style={{ padding: "20px 32px", borderRight: `1px solid ${C.line}`, transition: "border-color 0.4s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 15, marginTop: 6, marginBottom: 12, color: C.text, transition: "color 0.4s" }}>
          TapTipTup
        </div>
        <div className="md:flex items-center gap-1">
          <span style={{ fontSize: 11, color: C.muted, transition: "color 0.4s" }}>
            Platform Dukungan streaming terbaik untuk konten kreator Indonesia.
          </span>
          <a href="/privacy-policy" style={{ fontSize: 11, color: '#38bdf8', transition: "color 0.4s", whiteSpace: "nowrap" }}>
            Kebijakan privasi
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────── */
function buildGlobalStyles(C) {
  return `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Bebas+Neue&family=Space+Mono:ital,wght@0,400;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { -webkit-font-smoothing: antialiased; overflow-x: hidden; }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }

  .hide-mobile { display: flex !important; }
  .show-mobile { display: none !important; }

  .hero-title {
    width: 100%;
    max-width: 90vw;
    margin-left: auto;
    margin-right: auto;
  }

  @media (max-width: 1024px) {
    .hero-title {
      font-size: 7rem !important;
    }
  }

  @media (max-width: 768px) {
    .hide-mobile { display: none !important; }
    .show-mobile { display: flex !important; }

    .hero-title {
      font-size: 3.5rem !important;
      line-height: 1 !important;
      padding: 0 20px;
      gap: 0.1em !important;
    }
   .hero-title span {
      display: inline-block; /* Gunakan inline-block, jangan block murni */
      width: auto; /* Biarkan lebar mengikuti konten kecuali yang diberi w-full */
    }
    
    /* Hanya span yang merupakan anak langsung dan punya class w-full yang mengambil 1 baris */
    .hero-title > span.w-full {
      display: block;
      width: 100%;
    }
    .hero-main-grid { grid-template-columns: 1fr !important; }
    .how-steps-grid,
    .testimonials-grid,
    .pricing-grid,
    .feat-list-grid {
      grid-template-columns: 1fr !important;
    }
    .how-steps-grid > div,
    .testimonials-grid > div,
    .pricing-grid > div {
      border-right: none !important;
      border-bottom: 1px solid ${C.line} !important;
    }
    .cta-grid {
      grid-template-columns: 1fr !important;
    }
    .cta-grid > div {
      border-right: none !important;
      border-bottom: 1px solid ${C.line} !important;
    }
  }
`;
}


const SHARE_TEMPLATES = {
  1: {
    label: "Alert Dukungan Real-Time",
    ig: [
      { platform: "Instagram Caption", text: `🎮 Streamer Indo, dengerin dulu!\n\nTired of potongan Dukungan gede?\nTapTipTup cuma ambil 3.0% — sisanya buat kamu! 💸\n\n✅ Alert OBS real-time\n✅ QRIS + Transfer langsung\n✅ Sound kustom per tier\n✅ Gratis selamanya (plan basic)\n\nCoba sekarang di taptiptup.com 🔗\n\n#Streamer #StreamingIndonesia #TapTipTup` },
      { platform: "Instagram Story", text: `Hei streamer! 👋\n\nDukungan kamu dipotong berapa?\n5%? 10%?\n\nTapTipTup: cuma 3.0% ✨\nAlert langsung di OBS-mu!\n\nLink di bio → taptiptup.com` }
    ],
    desktop: [
      { platform: "Twitter / X", text: `Streamer Indonesia, ini buat kalian 🧵\n\nTapTipTup = platform Dukungan lokal dengan potongan TERKECIL. Cuma 3.0%.\n\n✅ Alert OBS real-time\n✅ Sound custom per tier\n✅ QRIS & transfer bank\n✅ Gratis untuk mulai\n\nCoba gratis → taptiptup.com` },
      { platform: "Facebook / Komunitas", text: `Para streamer, pernah ngerasa rugi kena potongan Dukungan gede?\n\nSaya baru cobain TapTipTup — potongannya cuma 3.0%! Setup OBS-nya juga gampang, kurang dari 5 menit udah live.\n\nCoba gratis di taptiptup.com 🚀` }
    ]
  },
  2: {
    label: "Dashboard & Fitur Lengkap",
    ig: [
      { platform: "Instagram Caption", text: `Level up stream kamu dengan TapTipTup! 🚀\n\nBukan cuma terima Dukungan —\nDashboard lengkap buat manage semuanya:\n📊 Riwayat Dukungan real-time\n🏆 Leaderboard top donor\n🎯 Milestone & goal tracker\n🗳️ Poll langsung dari penonton\n\nGratis untuk mulai. Pro mulai 49rb/bulan.\n\ntaptiptup.com ✨\n\n#ContentCreator #StreamerIndonesia #TapTipTup` },
      { platform: "Instagram Story", text: `Dashboard Dukungan streamer terlengkap 📊\n\n→ Real-time analytics\n→ Top donor leaderboard\n→ Poll & subathon timer\n→ Setup OBS < 5 menit\n\nGratis di taptiptup.com 🔥` }
    ],
    desktop: [
      { platform: "Twitter / X", text: `Nggak nyangka ada platform Dukungan streamer lokal sekeren ini.\n\nTapTipTup punya:\n📊 Dashboard analytics real-time\n🏆 Leaderboard gamifikasi donor\n🎯 Milestone tracker di OBS\n🗳️ Live poll & subathon timer\n🖼️ Media alert dari donor\n\nDan setupnya literally 5 menit.\nGratis untuk mulai → taptiptup.com` },
      { platform: "Facebook / Komunitas", text: `Sharing pengalaman pakai TapTipTup buat stream:\n\nFitur favoritku? Leaderboard donor langsung muncul di OBS. Penonton jadi kompetitif sendiri, malah bikin Dukungan naik! 😂\n\nPlus ada poll live yang bisa divotin penonton real-time, dan milestone goal yang keliatan progressnya.\n\ntaptiptup.com` }
    ]
  },
  3: {
    label: "Community & Streamer Network",
    ig: [
      { platform: "Instagram Caption", text: `Gabung komunitas streamer Indonesia bareng TapTipTup! 👥\n\nBukan cuma Dukungan —\nkamu bisa discover & follow sesama streamer,\nbangun network, dan collab bareng!\n\nMulai gratis, tanpa kartu kredit.\nLink di bio → taptiptup.com\n\nTag temen streamer kamu di sini! 👇\n\n#StreamerIndonesia #KomunitasStreamer #TapTipTup` },
      { platform: "Instagram Story", text: `Streamer Indonesia berkembang bareng! 🤝\n\nTapTipTup punya fitur:\n✅ Temukan sesama streamer\n✅ Bangun network kolaborasi\n✅ Dukungan dengan potongan 3.0% aja\n\nTag temen streamer kamu!\ntaptiptup.com` }
    ],
    desktop: [
      { platform: "Twitter / X", text: `Shoutout buat semua streamer Indonesia 🇮🇩\n\nKalian deserve platform Dukungan yang:\n✅ Buatan lokal, paham kebutuhan kita\n✅ Potongan kecil (cuma 3.0%)\n✅ Ada komunitas sesama streamer\n✅ Setup OBS gampang & cepat\n\nTapTipTup hadir buat itu semua.\nGratis untuk mulai → taptiptup.com\n\nRT kalau bermanfaat! 🙏` },
      { platform: "Facebook / Komunitas", text: `Buat semua streamer di grup ini —\n\nKalau kalian cari platform Dukungan yang:\n• Buatan Indonesia (paham ekosistem kita)\n• Potongan paling kecil (3.0%)\n• Ada fitur komunitas streamer\n• Setup simpel dan cepat\n\nTapTipTup jawabannya. Saya udah coba dan rekomendasinya 10/10 untuk streamer lokal.\n\nCoba gratis sekarang di taptiptup.com 🙏` }
    ]
  },
};

// Tambahkan komponen ini di file yang sama, setelah SharePromo dan sebelum export default

// ─── DATA FAQ ───────────────────────────────────────────────────────────────
const FAQ_DATA = [
  {
    q: "Saweria itu apa? Bedanya sama TapTipTup?",
    a: "Saweria adalah platform Dukungan lokal yang sudah ada lebih dulu. TapTipTup hadir dengan potongan lebih kecil — hanya 3.0% — dibanding Saweria yang memotong 5%. Fitur kami juga lebih lengkap: Auto-inject OBS, leaderboard, poll live, subathon timer, dan sound tier kustom.",
  },
  {
    q: "Apakah saya bisa menggunakan TapTipTup tanpa live streaming?",
    a: "Tentu bisa! Dukungan masuk ke akun kamu meskipun kamu tidak sedang live. Semua riwayat Dukungan bisa dicek di menu Transaksi kapan saja.",
  },
  {
    q: "Platform live streaming apa saja yang bisa diintegrasikan?",
    a: "TapTipTup terintegrasi dengan semua software broadcasting yang mendukung Browser Source, seperti OBS Studio dan Streamlabs OBS (SLOBS). Bisa dipakai untuk YouTube Live, TikTok Live, Twitch, Facebook Gaming, dan Instagram Live.",
  },
  {
    q: "Berapa minimal Dukungan dan minimal penarikan dana?",
    a: "Minimal Dukungan adalah Rp 1.000. Minimal penarikan dana adalah Rp 20.000. Biaya penarikan hanya Rp 4.000 — lebih murah dari platform lain.",
  },
  {
    q: "Berapa lama proses konfirmasi Dukungan sampai bisa dicairkan?",
    a: "Memakan waktu 2 hari kerja untuk konfirmasi oleh Payment Gateway. Setelah itu saldo bertambah dan siap dicairkan. Contoh: Dukungan masuk 10 Januari jam 12.00 WIB, dana bisa dicairkan 12 Januari jam 12.00 WIB.",
  },
  {
    q: "Apakah dana Dukungan yang sudah dikirim bisa ditarik kembali?",
    a: "Tidak. Dana Dukungan yang sudah dikirimkan tidak dapat ditarik kembali. Pastikan kamu sudah yakin sebelum mengirim Dukungan.",
  },
  {
    q: "Biaya apa saja yang dipotong dari Dukungan yang masuk?",
    a: "Potongan platform TapTipTup hanya 3.0% dari setiap Dukungan. Biaya penarikan semua metode hanya sebesar Rp 4.000 saja. Tidak ada biaya tersembunyi lainnya.",
  },
  {
    q: "Bagaimana cara memasang overlay TapTipTup di OBS?",
    a: "Masuk ke dashboard, salin URL overlay yang tersedia, lalu tambahkan sebagai Browser Source di OBS Studio. Prosesnya tidak lebih dari 5 menit. Tersedia video tutorial lengkap di halaman tutorial kami.",
  },
];

// ─── KOMPONEN FAQ ────────────────────────────────────────────────────────────
function FAQ({ C }) {
  const [openIndex, setOpenIndex] = useState(null);

  function toggle(i) {
    setOpenIndex(prev => (prev === i ? null : i));
  }

  return (
    <section
      id="faq"
      className="relative overflow-hidden w-full hidden md:flex flex-col justify-center !pt-[80px] md:!pt-[100px] !pb-[34px] md:!pb-[100px] items-center"
      style={{
        background: "#0a0f1e",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        // padding: "100px 0 100px",
      }}
    >
      {/* Grid background */}
      <div className="absolute inset-0 pointer-events-none select-none" style={{ zIndex: 0 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="faq-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#faq-grid)" />
        </svg>
      </div>

      {/* Header */}
      <div className="relative text-center flex flex-col items-center px-6 mb-14" style={{ zIndex: 2 }}>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
          color: "azure", marginBottom: 20, display: "block",
        }}>
          Pertanyaan Umum
        </span>
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(32px,6vw,72px)",
          lineHeight: 1.1, color: "white", letterSpacing: "0.01em",
        }}>
          ADA YANG <span style={{ color: "azure" }}>DITANYAKAN?</span>
        </h2>
      </div>

      {/* Accordion */}
      <div
        className="relative rounded-xl mx-auto grid grid-cols-2 w-[90vw] gap-10 !mt-10 px-4 md:px-0"
        style={{ zIndex: 2 }}
      >
      <div
        className="grid rounded-xl grid-cols-1 md:grid-cols-3 w-[90vw]"
        style={{
          border: "1px solid rgba(255,255,255,0.08)", // border terluar
        }}
      >
        {FAQ_DATA.map((item, i) => {
          const isOpen = openIndex === i;
          const isLeftCol  = i % 2 === 0;
          const isTopRow   = i < 2;

          return (
            <div
              key={i}
              className="w-full rounded-xl cursor-pointer hover:bg-slate-100/5 active:scale-[0.99]"
              onClick={() => toggle(i)}
              style={{
                borderLeft: !isLeftCol ? "1px solid rgba(255,255,255,0.08)" : "none",
                borderTop: !isTopRow ? "1px solid rgba(255,255,255,0.08)" : "none",
                padding: "54px 20px",
              }}
            >
              <button
                style={{
                  width: "100%", 
                  textAlign: "left", 
                  background: "none", 
                  border: "none",
                  padding: 0, 
                  cursor: "pointer",
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "flex-start",
                  gap: 16,
                }}
              >
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "clamp(13px,1.6vw,15px)",
                  fontWeight: 600, color: isOpen ? "azure" : "white",
                  lineHeight: 1.8, flex: 1,
                  transition: "color 0.2s",
                }}>
                  {item.q}
                </span>
                <span style={{
                  width: 26, height: 26, flexShrink: 0,
                  border: "1px solid rgba(255,255,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: isOpen ? "azure" : "rgba(255,255,255,0.5)",
                  fontSize: 18, lineHeight: 1,
                  transition: "all 0.2s",
                  background: isOpen ? "#1C398E" : "transparent",
                }}>
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              <div style={{
                overflow: "hidden",
                maxHeight: isOpen ? 400 : 0,
                opacity: isOpen ? 1 : 0,
                transition: "max-height 0.35s ease, opacity 0.25s ease",
              }}>
                <p style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 13, color: "rgba(255,255,255,0.55)",
                  lineHeight: 1.75, paddingTop: 12,
                }}>
                  {item.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
  );
}

function SharePromo({ C }) {
  const [format, setFormat] = useState('ig');
  const [selectedCard, setSelectedCard] = useState(1);
  const [copied, setCopied] = useState(false);

  const tpls = SHARE_TEMPLATES[selectedCard][format];

  function copyAll() {
    const all = tpls.map(t => `[${t.platform}]\n${t.text}`).join('\n\n---\n\n');
    navigator.clipboard.writeText(all);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section id="promo" className="select-none md:block hidden" style={{ borderBottom: `1px solid ${C.line}` }}>
      {/* Header */}
      <div className="select-none text-center flex flex-col justify-center items-center"
        style={{ padding: "80px 20px", borderBottom: `1px solid ${C.line}` }}>
        <Kicker C={C}>Share & Promosi</Kicker>
        <BigTitle C={C}>SEBARKAN KE SESAMA <span style={{ color: C.lime }}>STREAMER</span></BigTitle>
        <p style={{ fontSize: 14, color: C.muted, marginTop: 16 }}>
          Pilih gambar & salin teks siap pakai untuk Instagram atau media sosial lainnya
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   ROOT
───────────────────────────────────────── */
export default function TapTipTup() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [trigger, setTrigger] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Inisialisasi dari localStorage atau preferensi sistem
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem("taptiptup-theme");
      if (saved !== null) return saved === "dark";
    } catch {}
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
  });

  const C = isDark ? THEMES.dark : THEMES.light;

  // Modal Intro Logic
  useEffect(() => {
    setShowModal(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTrigger(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const audio = new Audio('/sound.mp3');
    audio.loop = true;
    audio.volume = 1.0;
    
    const play = () => {
      audio.play().catch(() => {});
      document.removeEventListener('click', play);
      document.removeEventListener('touchstart', play);
    };

    // Coba autoplay langsung
    audio.play().catch(() => {
      // Kalau browser blokir, tunggu interaksi pertama user
      document.addEventListener('click', play);
      document.addEventListener('touchstart', play);
    });

    return () => {
      audio.pause();
      audio.src = '';
      document.removeEventListener('click', play);
      document.removeEventListener('touchstart', play);
    };
  }, [trigger]);

  const closeModal = () => {
    setShowModal(false);
    localStorage.setItem("hasSeenIntro", "true");
  };

  function handleToggleTheme() {
    setIsDark(prev => {
      const next = !prev;
      try { localStorage.setItem("taptiptup-theme", next ? "dark" : "light"); } catch {}
      return next;
    });
  }

  return (
    <div
      className="select-none overflow-hidden w-[100vw]"
      style={{
        minHeight: "100vh",
        background: 'white',
        color: C.text,
        fontFamily: "'Space Grotesk', sans-serif",
        overflowX: "hidden",
        transition: "background 0.4s, color 0.4s",
      }}
    >
      <style>{buildGlobalStyles(C)}</style>
      <div className="flex">
        <Marquee C={C} />
      </div>
      <Hero C={C} isDark={isDark} />
      <FeeComparison C={C} /> 
      <NominalSection C={C} />
      <OverlayCustom C={C} />
      <section className="w-screen md:!min-h-[70vh] !pb-20 !pt-7 md:!pt-14 flex flex-col justify-center items-center bg-blue-900 !px-[20px] gap-6 relative overflow-hidden">

        <div className="select-none flex absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="crossgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#crossgrid)" />
          </svg>
        </div>
        {/* Animasi love TikTok */}
        <style>{`
          @keyframes floatUp {
            0%   { transform: translateY(0) scale(0.5) rotate(var(--rot)); opacity: 0; }
            10%  { opacity: 1; }
            80%  { opacity: 0.8; }
            100% { transform: translateY(-130vh) scale(1.2) rotate(calc(var(--rot) + 20deg)); opacity: 0; }
          }
          .love-float {
            position: absolute;
            bottom: -40px;
            animation: floatUp var(--dur) ease-in infinite;
            animation-delay: var(--delay);
            pointer-events: none;
            user-select: none;
            z-index: 1;
            font-size: var(--size);
            filter: drop-shadow(0 0 4px rgba(255,100,150,0.6));
          }
        `}</style>

        {[
          { left: "3.0%",  size: "30px", dur: "4.2s", delay: "0s",    rot: "-12deg", emoji: "❤️" },
          { left: "8%",  size: "30px", dur: "5.1s", delay: "0.8s",  rot: "8deg",   emoji: "🔁" },
          { left: "14%", size: "30px", dur: "3.8s", delay: "1.5s",  rot: "-5deg",  emoji: "❤️" },
          { left: "20%", size: "30px", dur: "6.0s", delay: "0.3s",  rot: "15deg",  emoji: "🔁" },
          { left: "27%", size: "30px", dur: "4.5s", delay: "2.1s",  rot: "-20deg", emoji: "❤️" },
          { left: "33.0%", size: "30px", dur: "5.5s", delay: "1.0s",  rot: "6deg",   emoji: "🔁" },
          { left: "40%", size: "30px", dur: "4.8s", delay: "0.5s",  rot: "-10deg", emoji: "❤️" },
          { left: "47%", size: "30px", dur: "3.6s", delay: "1.8s",  rot: "18deg",  emoji: "🔁" },
          { left: "54%", size: "30px", dur: "5.2s", delay: "0.2s",  rot: "-8deg",  emoji: "❤️" },
          { left: "61%", size: "30px", dur: "4.0s", delay: "2.5s",  rot: "12deg",  emoji: "🔁" },
          { left: "68%", size: "30px", dur: "5.8s", delay: "0.9s",  rot: "-15deg", emoji: "❤️" },
          { left: "74%", size: "30px", dur: "3.9s", delay: "1.3s",  rot: "5deg",   emoji: "🔁" },
          { left: "80%", size: "30px", dur: "6.2s", delay: "0.6s",  rot: "-18deg", emoji: "❤️" },
          { left: "86%", size: "30px", dur: "4.3s", delay: "2.0s",  rot: "10deg",  emoji: "🔁" },
          { left: "91%", size: "30px", dur: "5.0s", delay: "0.4s",  rot: "-6deg",  emoji: "❤️" },
          { left: "96%", size: "30px", dur: "4.7s", delay: "1.6s",  rot: "14deg",  emoji: "🔁" },
          { left: "5%",  size: "30px", dur: "5.3s", delay: "3.0s",  rot: "9deg",   emoji: "❤️" },
          { left: "11%", size: "30px", dur: "4.1s", delay: "3.5s",  rot: "-11deg", emoji: "🔁" },
          { left: "24%", size: "30px", dur: "6.4s", delay: "2.8s",  rot: "16deg",  emoji: "❤️" },
          { left: "37%", size: "30px", dur: "3.7s", delay: "3.2s",  rot: "-7deg",  emoji: "🔁" },
          { left: "50%", size: "30px", dur: "5.6s", delay: "2.4s",  rot: "20deg",  emoji: "❤️" },
          { left: "63.0%", size: "30px", dur: "4.4s", delay: "3.8s",  rot: "-14deg", emoji: "🔁" },
          { left: "76%", size: "30px", dur: "5.9s", delay: "1.1s",  rot: "7deg",   emoji: "❤️" },
          { left: "89%", size: "30px", dur: "4.6s", delay: "2.7s",  rot: "-9deg",  emoji: "🔁" },
        ].map((item, i) => (
          <span
            key={i}
            className="love-float"
            style={{
              left: item.left,
              "--size": item.size,
              "--dur": item.dur,
              "--delay": item.delay,
              "--rot": item.rot,
            }}
          >
            {item.emoji}
          </span>
        ))}
        {/* Judul */}
        <div className="text-center" style={{ zIndex: 2 }}>
          <Kicker C={C}>Setup Cepat</Kicker>
          <BigTitle C={C}>
            LIVE BARENG{" "}
            <span style={{ color: C.lime }}>TAPTIPTUP</span>
          </BigTitle>
        </div>

        {/* Video */}
        <video
          className="!w-[90vw] rounded-xl md:!w-[80vw] h-[100%] !border !p-4 !border-white"
          src="/live2.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
      </section>

      <FAQ C={C} />

      {/* ===== FOOTER ===== */}
     <footer className="text-center flex justify-center gap-8 items-center w-full px-0 !pt-[20px] !pb-[0px] md:!pt-[90px] md:!pb-[60px]" 
        style={{
          background: "#0a0f1e",
          borderTop: `1px solid rgba(255,255,255,0.08)`,
        }}>

        <div className="w-full md:max-w-max md:!pb-[0px] !pb-5 text-center flex  justify-center items-center"
          // style={{ gap: "32px" }}
          >

          {/* Kolom 1 — Brand */}
          <div className="w-full flex items-center justify-between mx-auto text-center text-[28px] md:text-[12px]">
            <div 
            style={{
              fontFamily: "'Space Mono', sans-serif",
              // letterSpacing: "0.4em",
              color: "white",
            }}>
              TAPTIPTUP UNTUK STREAMER LOKAL
            </div>
          </div>
        </div>
       
        {/* Bottom bar */}
        <div className="md:flex hidden" style={{
          justifyContent: "space-center", alignItems: "center"
        }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "white", letterSpacing: "0.06em" }}>
            2026 TAPTIPTUP.COM — ALL RIGHTS RESERVED
          </span>
        </div>
        
        <a href="/privacy-policy" className="md:block hidden" style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "white", letterSpacing: "0.1em", textDecoration: "none" }}>
          KEBIJAKAN PRIVASI TAPTIPTUP
        </a>

      </footer>

      {/* ==================== INTRO MODAL ==================== */}
      {showModal && (
        <div 
        className="md:!p-[20px] !p-[10px]"  
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.92)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999999,
        }}>
          <div style={{
            background: C.bg2,
            border: `1px solid ${C.line}`,
            borderRadius: "16px",
            maxWidth: "860px",
            width: "100%",
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          }}>
            {/* Header Modal */}
            <div style={{
              padding: "20px 24px",
              borderBottom: `1px solid ${C.line}`,
              display: "flex",
              justifyContent: "space-center",
              alignItems: "center",
              textAlign: 'center'
            }}>
              <div className="!mt-1.5" style={{ fontSize: "18px", width: '100%', fontWeight: 700, color: C.text, textAlign: 'center' }}>
                Selamat Datang di TapTipTup
              </div>
            </div>

            {/* Video */}
            <div style={{ padding: "20px 14px 0" }}>
              <video
                src="./live.mp4"
                controls={false}
                autoPlay
                muted
                loop
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  background: "#000",
                  height: '40vh'
                }}
              />
            </div>

            {/* Content */}
            <div 
            className="text-[22px] md:text-[36px]"  
            style={{
              textAlign: "center",
              padding: "32px 40px 30px",
            }}>
              <h2 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                lineHeight: 1.1,
                marginBottom: "14px",
                color: C.text,
              }}>
                Ubah Streaming Kamu
                Menjadi <span style={{ color: C.lime }}>Cuan</span>
              </h2>

              <p 
              className="text-[12px] md:text-[15px]"  
              style={{
                lineHeight: 1.4,
                color: C.muted,
                maxWidth: "590px",
                margin: "0 auto",
              }}>
                Platform Dukungan lokal terbaik untuk streamer Indonesia. 
                Potongan hanya 3.0%
              </p>

              <button
                className="md:!py-[14px] active:!scale-[0.98] md:!px-[42px] !py-[10px] !px-[30px]"
                onClick={closeModal}
                style={{
                  marginTop: "32px",
                  background: C.lime,
                  color: C.bg,
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
                onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
              >
                Mulai Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
