// components/Badge.jsx
import React, { useState } from 'react';

const Badge = ({ type = 'streamer', name, active = true, className = '' }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const icons = {
    streamer: {
      '10k': '💰', '50k': '💎', '100k': '⭐', '500k': '🌟', '1jt': '👑'
    },
    donor: {
      '1x': '❤️', '5x': '💖', '10k': '💝', '50k': '💎', '100k': '⭐', '1jt': '👑'
    }
  };

  const labels = {
    streamer: { '10k': '10K', '50k': '50K', '100k': '100K', '500k': '500K', '1jt': '1JT' },
    donor: { '1x': '1x', '5x': '5x', '10k': '10K', '50k': '50K', '100k': '100K', '1jt': '1JT' }
  };

  // ← TAMBAH INI
  const tooltips = {
    streamer: {
      '10k':  'Streamer yang telah menerima total donasi Rp 10.000',
      '50k':  'Streamer yang telah menerima total donasi Rp 50.000',
      '100k': 'Streamer yang telah menerima total donasi Rp 100.000',
      '500k': 'Streamer yang telah menerima total donasi Rp 500.000',
      '1jt':  'Streamer yang telah menerima total donasi Rp 1.000.000',
    },
    donor: {
      '1x':   'Pernah berdonasi minimal 1 kali',
      '5x':   'Sudah berdonasi minimal 5 kali',
      '10k':  'Total donasi kamu mencapai Rp 10.000',
      '50k':  'Total donasi kamu mencapai Rp 50.000',
      '100k': 'Total donasi kamu mencapai Rp 100.000',
      '1jt':  'Total donasi kamu mencapai Rp 1.000.000',
    }
  };

  const colors = {
    streamer: {
      '10k':  'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
      '50k':  'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
      '100k': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
      '500k': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
      '1jt':  'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700'
    },
    donor: {
      '1x':   'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700',
      '5x':   'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
      '10k':  'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
      '50k':  'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
      '100k': 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700',
      '1jt':  'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-600',
    }
  };

  const icon       = icons[type]?.[name]    || '🏆';
  const label      = labels[type]?.[name]   || name.toUpperCase();
  const tooltip    = tooltips[type]?.[name] || '';
  const colorClass = colors[type]?.[name]   || 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';

  return (
    // ← wrapper relative untuk posisikan tooltip
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onTouchStart={() => setShowTooltip(true)}
      onTouchEnd={() => setTimeout(() => setShowTooltip(false), 1500)}
    >
      {/* Tooltip */}
      {showTooltip && tooltip && (
        <div className="
          absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
          w-max max-w-[180px]
          px-2.5 py-1.5
          bg-slate-800 dark:bg-slate-700
          text-white text-[10px] font-medium leading-snug
          rounded-none shadow-lg
          pointer-events-none
          text-center
        ">
          {tooltip}
          {/* Arrow */}
          <div className="
            absolute top-full left-1/2 -translate-x-1/2
            border-4 border-transparent border-t-slate-800 dark:border-t-slate-700
          " />
        </div>
      )}

      {/* Badge itu sendiri — sama persis */}
      <div className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 h-full rounded-none text-xs font-bold border transition-all
        cursor-${active ? 'pointer' : 'default'}
        hover:${active ? 'scale-105 shadow-md' : ''}
        ${active ? colorClass : 'bg-slate-100/50 text-slate-500 border-slate-200/50 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/50 opacity-70'}
        ${className}
      `}>
        <span className="text-base flex-shrink-0 relative top-[-2.8px]">{icon}</span>
        <span className="font-bold tracking-tight uppercase">{label}</span>
        {!active && <span className="ml-1 text-[8px]">🔒</span>}
      </div>
    </div>
  );
};

export default Badge;