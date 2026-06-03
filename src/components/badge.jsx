// components/Badge.jsx - FLAT & CLEAN
import React from 'react';

const Badge = ({ type = 'streamer', name, active = true, className = '' }) => {
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

  const colors = {
    streamer: {
      '10k': 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
      '50k': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
      '100k': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
      '500k': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
      '1jt': 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700'
    },
    donor: {
      '1x': 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700',
      '5x': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
      '10k': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
      '50k': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
      '100k': 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700',
      '1jt': 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700'
    }
  };

  const icon = icons[type]?.[name] || '🏆';
  const label = labels[type]?.[name] || name.toUpperCase();
  const colorClass = colors[type]?.[name] || 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';

  return (
    <div className={`
      inline-flex items-center gap-1.5 px-3 py-1.5 h-full rounded-none text-xs font-bold border transition-all
      cursor-${active ? 'pointer' : 'default'}
      hover:${active ? 'scale-105 shadow-md' : ''}
      ${active ? colorClass : 'bg-slate-100/50 text-slate-500 border-slate-200/50 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/50 opacity-70'}
      ${className}
    `}>
      
      {/* Icon */}
      <span className="text-base flex-shrink-0">
        {icon}
      </span>
      
      {/* Label */}
      <span className="font-bold tracking-tight uppercase">
        {label}
      </span>
      
      {/* Locked Indicator */}
      {!active && (
        <span className="ml-1 text-[8px]">🔒</span>
      )}
    </div>
  );
};

export default Badge;