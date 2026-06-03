const MaintenanceScreen = ({ title = "Sedang dalam pemeliharaan", subtitle }) => (
  <div className="min-h-screen flex items-center justify-center bg-[#0d0b1e] font-sans px-4 py-8">
    <style>{`
      @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.2} }
      @keyframes float-up { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      // .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
      // .float-icon { animation: float-up 4s ease-in-out infinite; }
      .spin { animation: spin 1.6s linear infinite; transform-origin: center; }
    `}</style>

    <div className="w-full max-w-[460px] text-center">

      {/* Icon */}
      <div className="float-icon w-16 h-16 rounded-2xl bg-[rgba(245,158,11,0.12)] border border-[rgba(245,158,11,0.25)] flex items-center justify-center mx-auto mb-6">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      </div>

      {/* Heading */}
      <h1 className="text-[22px] font-medium text-slate-100 mt-0 mb-2.5 leading-snug">
        {title}
      </h1>
      <p className="text-sm text-slate-500 leading-relaxed mb-8 w-max mx-auto">
        {subtitle || 'Mohon maaf, Kami sedang melakukan pembaruan sistem'}
      </p>

      {/* Stepper */}
      <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-xl md:px-6 pt-6 pb-5 mb-4 text-left">

        {/* Step nodes */}
        <div className="grid grid-cols-4 relative mb-3">

          {/* Connector line background */}
          <div className="absolute top-[18px] left-[calc(12.5%+9px)] right-[calc(12.5%+9px)] h-0.5 bg-[rgba(255,255,255,0.07)] rounded-full z-0">
            <div className="w-1/2 h-full bg-emerald-400 rounded-full" />
          </div>

          {/* Step 1: done */}
          <div className="flex flex-col items-center gap-2 z-10">
            <div className="w-9 h-9 rounded-full bg-[rgba(52,211,153,0.12)] border-2 border-emerald-400 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <span className="text-[11px] text-emerald-400 text-center leading-snug">DB backup</span>
          </div>

          {/* Step 2: done */}
          <div className="flex flex-col items-center gap-2 z-10">
            <div className="w-9 h-9 rounded-full bg-[rgba(52,211,153,0.12)] border-2 border-emerald-400 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <span className="text-[11px] text-emerald-400 text-center leading-snug">Migrasi data</span>
          </div>

          {/* Step 3: active */}
          <div className="flex flex-col items-center gap-2 z-10">
            <div className="w-9 h-9 rounded-full bg-[rgba(245,158,11,0.12)] border-2 border-amber-400 flex items-center justify-center">
              <svg className="spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            </div>
            <span className="text-[11px] text-amber-400 font-medium text-center leading-snug">Pembaruan</span>
          </div>

          {/* Step 4: pending */}
          <div className="flex flex-col items-center gap-2 z-10">
            <div className="w-9 h-9 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <span className="text-[11px] text-slate-700 text-center leading-snug">Testing akhir</span>
          </div>

        </div>

        {/* Status bar */}
        <div className="mt-4 px-6 md:px-0 pt-4 border-t border-[rgba(255,255,255,0.06)] flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <svg className="spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <span className="text-xs text-slate-500">Pembaruan sistem sedang berjalan...</span>
          </div>
          <span className="text-xs font-medium text-indigo-400 whitespace-nowrap">Step 3/4</span>
        </div>

      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <a
          href="https://wa.me/6289513093406"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-[7px] px-4 py-2.5 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg text-[13px] text-slate-400 no-underline"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Hubungi kami
        </a>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center justify-center gap-[7px] px-4 py-2.5 bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.25)] rounded-lg text-[13px] text-indigo-300 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Coba lagi
        </button>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-[rgba(255,255,255,0.04)]">
        <p className="m-0 text-xs text-slate-500">
          TapTipTup — Platform donasi streamer Indonesia
        </p>
      </div>

    </div>
  </div>
);

export default MaintenanceScreen;