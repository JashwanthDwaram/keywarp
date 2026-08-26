import React from 'react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';
  delta?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  delta,
  className = ''
}) => {
  return (
    <div
      className={`rounded border border-ink-400/15 bg-surface p-3.5 sm:p-4 transition-colors flex flex-col justify-between overflow-hidden min-w-0 ${className}`}
    >
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <span className="text-[11px] sm:text-xs text-ink-400 font-sans truncate">
          {title}
        </span>
        {icon ? (
          <div className="text-ink-400 w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center shrink-0">
            {icon}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
        <div className="text-xl sm:text-3xl font-medium text-ink-100 font-mono tabular-nums truncate">
          {value}
        </div>
        {delta ? (
          <span
            className={`text-[10px] sm:text-xs font-mono px-1.5 py-0.5 rounded bg-bg/70 border border-ink-400/10 shrink-0 max-w-full truncate ${
              delta.isNeutral
                ? 'text-ink-400'
                : delta.isPositive
                ? 'text-correct'
                : 'text-incorrect'
            }`}
          >
            {delta.value}
          </span>
        ) : null}
      </div>

      {subtitle ? (
        <p className="text-[11px] sm:text-xs text-ink-400 mt-1 font-sans truncate">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
};
