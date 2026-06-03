import { useEffect, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'qrcode';

const BASE_URL = import.meta.env.VITE_API_URL;

const QrCodeWidget = () => {
  const { token } = useParams();
  const [username, setUsername] = useState('');
  const [donateUrl, setDonateUrl] = useState('');

  useEffect(() => {
    if (!token) return;
    axios.get(`${BASE_URL}/widget/${token}/qrcode`, {
      headers: { 'Accept': 'application/json' }
    })
      .then(res => {
        const uname = res.data?.username || '';
        setUsername(uname);
        setDonateUrl(`https://taptiptup.vercel.app/donate/${uname}`);
      })
      .catch(() => console.error('Failed to fetch qrcode data'));
  }, [token]);

  const canvasCallbackRef = useCallback((node) => {
    if (!node || !donateUrl) return;
    QRCode.toCanvas(node, donateUrl, {
      width: 220,        // naikan dari 160 → 220
      margin: 3, 
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#ffffff' },
    });
  }, [donateUrl]);

  if (!donateUrl) return null;

  return (
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '12px',
      background: 'transparent',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        background: 'rgba(15, 15, 25, 0.9)',
        padding: '20px',
        border: '1.5px solid rgba(255,255,255,0.1)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          position: 'relative',
          background: '#ffffff',
          padding: '12px',
          lineHeight: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Pakai canvasCallbackRef, bukan canvasRef */}
          <canvas ref={canvasCallbackRef} />
          <div style={{
            position: 'absolute',
            width: '36px',
            height: '36px',
            background: 'white',
            padding: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #eee',
          }}>
            <img
              src="/jellyfish.png"
              alt="Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: '14px',
            fontWeight: '900',
            color: '#fff',
            margin: 0,
            letterSpacing: '0.02em'
          }}>
            @{username}
          </p>
          <p style={{
            fontSize: '9px',
            color: 'rgba(255,255,255,0.4)',
            margin: '2px 0 0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Scan to Support
          </p>
        </div>
      </div>
    </div>
  );
};

export default QrCodeWidget;