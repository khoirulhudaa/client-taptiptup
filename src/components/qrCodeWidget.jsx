import { useEffect, useCallback, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'qrcode';

const BASE_URL = import.meta.env.VITE_API_URL;

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
  showLogo: true,
  logoSize: 36,
  size: 220,
};

const QrCodeWidget = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const [donateUrl, setDonateUrl] = useState('');

  // Baca config dari URL params, fallback ke default
  const cfg = {
    darkColor:    searchParams.get('dark')     || DEFAULT_QR_CONFIG.darkColor,
    lightColor:   searchParams.get('light')    || DEFAULT_QR_CONFIG.lightColor,
    bgColor:      searchParams.get('bg')       || DEFAULT_QR_CONFIG.bgColor,
    padding:      Number(searchParams.get('pad'))  || DEFAULT_QR_CONFIG.padding,
    borderRadius: Number(searchParams.get('br'))   || DEFAULT_QR_CONFIG.borderRadius,
    borderWidth:  Number(searchParams.get('bw'))   || DEFAULT_QR_CONFIG.borderWidth,
    borderColor:  searchParams.get('bc')       || DEFAULT_QR_CONFIG.borderColor,
    boxShadow:    searchParams.get('shadow')   !== '0',
    showUsername: searchParams.get('showText') === '1',
    usernameColor: searchParams.get('textColor') || DEFAULT_QR_CONFIG.usernameColor,
    showLogo:     searchParams.get('showLogo') !== '0',
    logoSize:     Number(searchParams.get('logoSize')) || DEFAULT_QR_CONFIG.logoSize,
    size:         Number(searchParams.get('size'))     || DEFAULT_QR_CONFIG.size,
  };

  useEffect(() => {
    if (!token) return;
    axios.get(`${BASE_URL}/widget/${token}/qrcode`, {
      headers: { 'Accept': 'application/json' }
    })
      .then(res => {
        const uname = res.data?.username || '';
        setDonateUrl(`https://taptiptup.vercel.app/donate/${uname}`);
      })
      .catch(() => console.error('Failed to fetch qrcode data'));
  }, [token]);

  const canvasCallbackRef = useCallback((node) => {
    if (!node || !donateUrl) return;
    QRCode.toCanvas(node, donateUrl, {
      width: cfg.size,
      margin: 0,
      errorCorrectionLevel: 'M',
      color: { dark: cfg.darkColor, light: cfg.lightColor },
    });
  }, [donateUrl, cfg.darkColor, cfg.lightColor, cfg.size]);

  if (!donateUrl) return null;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', fontFamily: "'Inter', sans-serif" }}>
      <div style={{
        background: cfg.bgColor === 'transparent' ? 'rgba(15,15,25,0.85)' : cfg.bgColor,
        padding: cfg.padding,
        borderRadius: cfg.borderRadius,
        border: cfg.borderWidth > 0 ? `${cfg.borderWidth}px solid ${cfg.borderColor}` : 'none',
        boxShadow: cfg.boxShadow ? '0 10px 40px rgba(0,0,0,0.4)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          background: cfg.lightColor,
          padding: 10,
          borderRadius: Math.max(0, cfg.borderRadius - 6),
          lineHeight: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          <canvas ref={canvasCallbackRef} />
          {cfg.showLogo && (
            <div style={{
              position: 'absolute',
              width: cfg.logoSize,
              height: cfg.logoSize,
              background: 'white',
              padding: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #eee',
              borderRadius: 6,
            }}>
              <img src="/jellyfish.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          )}
        </div>
        {cfg.showUsername && (
          <p style={{ color: cfg.usernameColor, fontSize: 13, fontWeight: 700, letterSpacing: '0.03em', margin: '2px 0 0' }}>
            Scan untuk donasi
          </p>
        )}
      </div>
    </div>
  );
};

export default QrCodeWidget;