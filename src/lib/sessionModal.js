let isShowing = false;

export const showSessionExpiredModal = () => {
  const path = window.location.pathname;

  const isOverlayPage = path.startsWith('/overlay') || path.startsWith('/widget');
  if (isOverlayPage) return; // ← tambah ini

  if (isShowing) return;
  isShowing = true;

  localStorage.removeItem('token');

  const TOTAL = 5;
  let remaining = TOTAL;
  const circumference = 2 * Math.PI * 22;

  const backdrop = document.createElement('div');
  backdrop.style.cssText = `
    position: fixed; inset: 0; z-index: 999999;
    background: rgba(0,0,0,0.55);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
  `;

  const modal = document.createElement('div');
  modal.style.cssText = `
    background: #fff;
    border-radius: 20px;
    padding: 2.5rem 1rem;
    max-width: 480px;
    width: 100%;
    text-align: center;
    box-shadow: 0 24px 60px rgba(0,0,0,0.18);
  `;

  modal.innerHTML = `
    <style>
      #sei-btn {
        width: 100%; padding: 13px;
        background: #FEE2E2; color: #991B1B;
        border: 1px solid #FECACA;
        border-radius: 12px;
        font-size: 15px; font-weight: 700;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center; gap: 8px;
        margin-top: 1.5rem; transition: background 0.15s;
        font-family: inherit;
      }
      #sei-btn:hover { background: #FECACA; }
    </style>

    <div style="width:60px;height:60px;border-radius:50%;background:#FEE2E2;
      display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    </div>

    <p style="font-size:20px;font-weight:800;color:#0f172a;margin:0 0 8px;font-family:inherit;">Sesi Berakhir</p>
    <p style="font-size:14px;color:#64748b;line-height:1.6;margin:0 0 1.5rem;font-family:inherit;">
      Token kamu sudah tidak valid atau kedaluwarsa.<br/>Silakan login ulang untuk melanjutkan.
    </p>

    <div style="display:flex;align-items:center;justify-content:center;gap:12px;">
      <svg width="52" height="52" viewBox="0 0 52 52" style="transform:rotate(-90deg);flex-shrink:0;">
        <circle cx="26" cy="26" r="22" fill="none" stroke="#E2E8F0" stroke-width="3.5"/>
        <circle id="sei-ring" cx="26" cy="26" r="22" fill="none" stroke="#DC2626"
          stroke-width="3.5" stroke-linecap="round"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="0"/>
        <text id="sei-count" x="26" y="26"
          text-anchor="middle" dominant-baseline="middle"
          style="transform:rotate(90deg);transform-origin:26px 26px;"
          font-size="16" font-weight="800" fill="#DC2626" font-family="inherit">
          ${TOTAL}
        </text>
      </svg>
    </div>

    <button id="sei-btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
        <polyline points="10 17 15 12 10 7"/>
        <line x1="15" y1="12" x2="3" y2="12"/>
      </svg>
      Login ulang sekarang
    </button>
  `;

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  const redirect = () => {
    clearInterval(tick);
    if (document.body.contains(backdrop)) document.body.removeChild(backdrop);
    isShowing = false;
    window.location.href = '/login';
  };

  modal.querySelector('#sei-btn').addEventListener('click', redirect);

  const ring  = modal.querySelector('#sei-ring');
  const count = modal.querySelector('#sei-count');
  const label = modal.querySelector('#sei-label');

  const tick = setInterval(() => {
    if (remaining <= 1) {
        redirect();
        return;
    }

    remaining--;
    
    const filled = (remaining / TOTAL) * circumference;
    ring.setAttribute('stroke-dashoffset', String(circumference - filled));
    count.textContent = String(remaining);

  }, 1000);
};