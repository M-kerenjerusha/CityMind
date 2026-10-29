import React, { useEffect, useState } from 'react';

interface ScoreCardProps {
  label: string;
  value: number;
  icon: string;
  max?: number;
  suffix?: string;
  prefix?: string;
  color?: 'emerald' | 'sky' | 'amber' | 'rose' | 'purple' | 'slate';
  tooltip?: string;
  subtext?: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  label,
  value,
  icon,
  max = 100,
  suffix = '',
  prefix = '',
  color = 'emerald',
  tooltip,
  subtext,
}) => {
  const [displayVal, setDisplayVal] = useState(value);

  // Animated count-up / count-down effect
  useEffect(() => {
    let start = displayVal;
    const end = value;
    if (start === end) return;

    const duration = 400;
    const stepTime = 30;
    const steps = duration / stepTime;
    const increment = (end - start) / steps;

    const timer = setInterval(() => {
      start += increment;
      if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
        setDisplayVal(end);
        clearInterval(timer);
      } else {
        setDisplayVal(Math.round(start * 10) / 10);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  const colorThemes = {
    emerald: {
      bg: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400',
      bar: 'bg-emerald-500',
      badge: 'bg-emerald-500/20 text-emerald-300',
    },
    sky: {
      bg: 'bg-sky-500/10 border-sky-500/40 text-sky-400',
      bar: 'bg-sky-500',
      badge: 'bg-sky-500/20 text-sky-300',
    },
    amber: {
      bg: 'bg-amber-500/10 border-amber-500/40 text-amber-400',
      bar: 'bg-amber-500',
      badge: 'bg-amber-500/20 text-amber-300',
    },
    rose: {
      bg: 'bg-rose-500/10 border-rose-500/40 text-rose-400',
      bar: 'bg-rose-500',
      badge: 'bg-rose-500/20 text-rose-300',
    },
    purple: {
      bg: 'bg-purple-500/10 border-purple-500/40 text-purple-400',
      bar: 'bg-purple-500',
      badge: 'bg-purple-500/20 text-purple-300',
    },
    slate: {
      bg: 'bg-slate-700/30 border-slate-600 text-slate-300',
      bar: 'bg-slate-400',
      badge: 'bg-slate-700 text-slate-300',
    },
  }[color];

  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      className={`rounded-2xl border-2 p-3 relative transition-all duration-300 ${colorThemes.bg}`}
      title={tooltip || label}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <span>{icon}</span> {label}
        </span>
        {subtext && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${colorThemes.badge}`}>
            {subtext}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1 my-1">
        <span className="text-2xl font-black font-display text-white tracking-tight">
          {prefix}
          {displayVal}
          {suffix}
        </span>
        {max === 100 && <span className="text-xs text-slate-400 font-bold">/100</span>}
      </div>

      {/* Progress mini bar */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorThemes.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
