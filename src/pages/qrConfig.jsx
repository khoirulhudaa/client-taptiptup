import { useState, useCallback, useRef, useEffect } from 'react';
import { Copy, CheckCircle2, Download, QrCode, Save, RotateCcw } from 'lucide-react';
import QRCode from 'qrcode';

const DEFAULT_QR_CONFIG = {
  darkColor: '#000000',
  lightColor: '#ffffff',
  bgColor: 'transparent',
  padding: 14,
  borderRadius: 16,
  borderWidth: 0,
  borderColor: 'rgba(255,255,255,0.15)',
  boxShadow: true,
  showUsername: false,
  usernameColor: '#ffffff',
  logoUrl: '/jellyfish.png',
  showLogo: true,
  logoSize: 36,
  size: 220,
};

const LOCAL_KEY = 'ttt_qr_config';

const loadConfig = () => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? { ...DEFAULT_QR_CONFIG, ...JSON.parse(raw) } : DEFAULT_QR_CONFIG;
  } catch {
    return DEFAULT_QR_CONFIG;
  }
};

const saveConfig = (cfg) => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(cfg));
};

// ── Tiny helpers ──────────────────────────────────────────────────────────────
const Label = ({ children }) => (
  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
    {children}
  </p>
);

const Row = ({ label, children }) => (
  <div>
    <Label>{label}</Label>
    {children}
  </div>
);

const ColorRow = ({ label, value, onChange }) => (
  <Row label={label}>
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 flex-shrink-0">
        <input
          type="color"
          value={value.startsWith('rgba') || value === 'transparent' ? '#ffffff' : value}
          onChange={e => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="absolute inset-0" style={{ background: value }} />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 font-mono text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 transition-all"
      />
    </div>
  </Row>
);

const Slider = ({ label, value, min, max, step = 1, unit = '', onChange }) => (
  <Row label={`${label}: ${value}${unit}`}>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full accent-blue-600"
    />
  </Row>
);

const Toggle = ({ label, desc, value, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
    <div>
      <p className="font-black text-sm text-slate-700 dark:text-slate-200">{label}</p>
      {desc && <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>}
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-7 w-14 items-center rounded-lg transition-colors duration-300 cursor-pointer ${value ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-lg bg-white shadow-md transition-transform duration-300 ${value ? 'translate-x-8' : 'translate-x-1'}`} />
    </button>
  </div>
);

// ── QR Preview (renders the actual canvas) ────────────────────────────────────
const QrPreview = ({ donateUrl, cfg }) => {
  const canvasRef = useCallback((node) => {
    if (!node || !donateUrl) return;
    QRCode.toCanvas(node, donateUrl, {
      width: cfg.size,
      margin: 0,
      errorCorrectionLevel: 'M',
      color: { dark: cfg.darkColor, light: cfg.lightColor },
    });
  }, [donateUrl, cfg.darkColor, cfg.lightColor, cfg.size]);

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          background: cfg.bgColor === 'transparent' ? 'rgba(15,15,25,0.85)' : cfg.bgColor,
          padding: cfg.padding,
          borderRadius: cfg.borderRadius,
          border: cfg.borderWidth > 0 ? `${cfg.borderWidth}px solid ${cfg.borderColor}` : 'none',
          boxShadow: cfg.boxShadow ? '0 10px 40px rgba(0,0,0,0.4)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          position: 'relative',
        }}
      >
        <div
          style={{
            background: cfg.lightColor,
            padding: 10,
            borderRadius: Math.max(0, cfg.borderRadius - 6),
            lineHeight: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <canvas ref={canvasRef} />
          {cfg.showLogo && (
            <div
              style={{
                position: 'absolute',
                width: cfg.logoSize ?? 36,
                height: cfg.logoSize ?? 36,
                background: 'white',
                padding: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #eee',
                borderRadius: 6,
              }}
            >
              <img
                src={cfg.logoUrl || '/jellyfish.png'}
                alt="Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          )}
        </div>
        {cfg.showUsername && (
          <p
            style={{
              color: cfg.usernameColor,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.03em',
              margin: '2px 0 0',
            }}
          >
            Scan untuk donasi
          </p>
        )}
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const QrConfigPage = ({ overlayToken, username }) => {
  const [cfg, setCfg] = useState(loadConfig);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const donateUrl = `https://taptiptup.vercel.app/donate/${username}`;
  const widgetUrl = `${window.location.origin}/widget/${overlayToken}/qrcode`;

  const upd = (key, val) => setCfg(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    saveConfig(cfg);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => setCfg(DEFAULT_QR_CONFIG);

  const handleCopy = () => {
    const params = new URLSearchParams({
      dark: cfg.darkColor,
      light: cfg.lightColor,
      bg: cfg.bgColor,
      pad: cfg.padding,
      br: cfg.borderRadius,
      bw: cfg.borderWidth,
      bc: cfg.borderColor,
      shadow: cfg.boxShadow ? '1' : '0',
      showText: cfg.showUsername ? '1' : '0',
      textColor: cfg.usernameColor,
      showLogo: cfg.showLogo ? '1' : '0',
      logoSize: cfg.logoSize ?? 36,
      size: cfg.size,
    });
    navigator.clipboard.writeText(`${widgetUrl}?${params.toString()}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download as PNG
  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    const size = cfg.size + cfg.padding * 2 + 20;
    canvas.width = size;
    canvas.height = size + (cfg.showUsername ? 28 : 0);
    const ctx = canvas.getContext('2d');

    // bg
    if (cfg.bgColor !== 'transparent') {
      ctx.fillStyle = cfg.bgColor;
    } else {
      ctx.fillStyle = 'rgba(15,15,25,0.9)';
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // inner QR
    const inner = document.createElement('canvas');
    QRCode.toCanvas(inner, donateUrl, {
      width: cfg.size,
      margin: 0,
      errorCorrectionLevel: 'M',
      color: { dark: cfg.darkColor, light: cfg.lightColor },
    }, () => {
      const off = cfg.padding + 10;
      ctx.fillStyle = cfg.lightColor;
      ctx.roundRect?.(off - 10, off - 10, cfg.size + 20, cfg.size + 20, 8);
      ctx.fill();
      ctx.drawImage(inner, off, off);
      const link = document.createElement('a');
      link.download = `qrcode-${username}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  // Widget URL params to send config — stored locally and read by widget via URL hash
  // (Widget reads from API; for local preview we just show live preview here)

  return (
    <div className="space-y-6 pb-6">

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* ── Controls ── */}
        <div className="xl:col-span-8 space-y-4">

          {/* Ukuran & Padding */}
          <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-slate-100 dark:border-slate-800 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="bg-violet-600 p-3 rounded-lg text-white shadow-lg flex-shrink-0">
                    <QrCode size={20} />
                    </div>
                    <div>
                    <h3 className="text-sm uppercase md:capitalize md:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                        Kustom QR Code
                    </h3>
                </div>
            </div>
            <div className='w-full grid grid-cols-1 mt-[-1px] md:grid-cols-2 gap-3'>
                <Slider label="Ukuran QR" value={cfg.size} min={120} max={360} step={4} unit="px" onChange={v => upd('size', v)} />
                <Slider label="Padding" value={cfg.padding} min={0} max={40} unit="px" onChange={v => upd('padding', v)} />
                <Slider label="Border Radius" value={cfg.borderRadius} min={0} max={40} unit="px" onChange={v => upd('borderRadius', v)} />
                <Slider label="Ketebalan Border" value={cfg.borderWidth} min={0} max={8} unit="px" onChange={v => upd('borderWidth', v)} />
            </div>
          </div>

          {/* Warna */}
          <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-slate-100 dark:border-slate-800 space-y-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Warna</p>
            <div className='w-full grid gap-3 grid-cols-1 md:grid-cols-2'>
                <ColorRow label="Warna QR (gelap)" value={cfg.darkColor} onChange={v => upd('darkColor', v)} />
                <ColorRow label="Warna Background QR (terang)" value={cfg.lightColor} onChange={v => upd('lightColor', v)} />
                <ColorRow label="Background Card" value={cfg.bgColor} onChange={v => upd('bgColor', v)} />
                {cfg.borderWidth > 0 && (
                <ColorRow label="Warna Border" value={cfg.borderColor} onChange={v => upd('borderColor', v)} />
                )}
            </div>
          </div>

             {/* Preset Cepat */}
          <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Preset Cepat</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Dark',    dark: '#000000', light: '#ffffff', bg: 'rgba(15,15,25,0.9)',  border: 0 },
                { label: 'Neon',    dark: '#39ff14', light: '#0a1f0a',  bg: 'rgba(10,31,10,0.95)', border: 1 },
                { label: 'Light',   dark: '#0f172a', light: '#f8fafc',  bg: '#f8fafc',             border: 1 },
                { label: 'Purple',  dark: '#7c3aed', light: '#ede9fe',  bg: 'rgba(30,10,60,0.9)',  border: 1 },
              ].map(p => (
                <button
                  key={p.label}
                  onClick={() => setCfg(prev => ({
                    ...prev,
                    darkColor: p.dark,
                    lightColor: p.light,
                    bgColor: p.bg,
                    borderWidth: p.border,
                    borderColor: p.dark + '60',
                  }))}
                  style={{ background: p.bg, border: `2px solid ${p.dark}40` }}
                  className="cursor-pointer active:scale-[0.98] py-3 rounded-lg font-black text-xs transition-all"
                >
                  <span style={{ color: p.dark === '#000000' ? '#fff' : p.dark }}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Opsi Tampilan */}
            <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-slate-100 dark:border-slate-800 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Opsi Tampilan</p>
            <div className='w-full grid md:grid-cols-2 grid-cols-1 gap-3'>
                <Toggle label="Bayangan (Box Shadow)" desc="Efek shadow di sekitar card" value={cfg.boxShadow} onChange={v => upd('boxShadow', v)} />
                <Toggle label="Tampilkan Teks Donasi" desc="Teks 'Scan untuk donasi' di bawah QR" value={cfg.showUsername} onChange={v => upd('showUsername', v)} />
                <Toggle label="Tampilkan Logo" desc="Logo kecil di tengah QR Code" value={cfg.showLogo} onChange={v => upd('showLogo', v)} />
                {cfg.showLogo && (
                <div className="md:col-span-1">
                    {/* <Label>Ukuran Logo</Label> */}
                    <div className="grid grid-cols-2 gap-2">
                    {[
                        { label: 'Small', value: 24 },
                        { label: 'Medium', value: 36 },
                        { label: 'Large', value: 48 },
                        { label: 'Extra Large', value: 64 },
                    ].map(opt => (
                        <button
                        key={opt.label}
                        onClick={() => upd('logoSize', opt.value)}
                        className={`cursor-pointer active:scale-[0.98] py-2.5 rounded-lg font-black text-xs transition-all border-2 ${
                            (cfg.logoSize ?? 36) === opt.value
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500'
                        }`}
                        >
                        {opt.label}
                        </button>
                    ))}
                    </div>
                </div>
                )}
                {cfg.showUsername && (
                <div className="md:col-span-2">
                    <ColorRow label="Warna Teks" value={cfg.usernameColor} onChange={v => upd('usernameColor', v)} />
                </div>
                )}
            </div>
            </div>
          
          {/* Actions */}
          <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
            <button
              onClick={handleReset}
              className="cursor-pointer active:scale-[0.99] w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg font-black text-sm flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <RotateCcw size={16} /> Reset ke Default
            </button>
            <button
              onClick={handleSave}
              className="cursor-pointer active:scale-[0.99] hover:brightness-90 w-full py-3 md:py-4 bg-blue-600 text-white rounded-lg font-black text-sm flex items-center justify-center gap-3 transition-all"
            >
              {saved ? <><CheckCircle2 size={18} /> Tersimpan!</> : <><Save size={18} /> Simpan Konfigurasi</>}
            </button>
          </div>
        </div>

        {/* ── Preview ── */}
        <div className="xl:col-span-4 z-[2] self-start relative top-0">
            {/* Live Preview */}
            <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-5">Preview Live</p>
              <div
                className="flex items-center justify-center rounded-lg min-h-[360px]"
                style={{ background: 'repeating-conic-gradient(#e2e8f0 0% 25%, transparent 0% 50%) 0 0 / 20px 20px', }}
              >
                <QrPreview donateUrl={donateUrl} cfg={cfg} />
              </div>
            </div>

            {/* URL Widget OBS */}
            <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-lg mt-4 p-4 md:p-6 border border-slate-100 dark:border-slate-800 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">URL Widget OBS</p>
              <div className="flex justify-between items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                <p className="flex-1 max-w-[74%] font-mono text-xs text-blue-500 dark:text-blue-400 truncate">{widgetUrl}</p>
                <button
                  onClick={handleCopy}
                  className="cursor-pointer active:scale-[0.98] p-2 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 flex-shrink-0 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all"
                >
                  {copied ? <CheckCircle2 size={15} className="text-green-500" /> : <Copy size={15} />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Ukuran yang disarankan: <span className="font-black text-slate-600 dark:text-slate-300">{cfg.size + cfg.padding * 2 + 20}×{cfg.size + cfg.padding * 2 + (cfg.showUsername ? 48 : 20)}px</span>
              </p>
              <button
                onClick={handleDownload}
                className="cursor-pointer active:scale-[0.99] w-full py-3 bg-slate-900/70 dark:bg-slate-700 text-white rounded-lg font-black text-sm flex items-center justify-center gap-3 hover:brightness-90 transition-all"
              >
                <Download size={16} /> Download PNG
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default QrConfigPage;