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
      className={`rounded border border-ink-400/15 bg-surface p-4 transition-colors ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs text-ink-400 font-sans">
          {title}
        </span>
        {icon ? (
          <div className="text-ink-400 w-4 h-4 flex items-center justify-center">
            {icon}
          </div>
        ) : null}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl sm:text-3xl font-medium text-ink-100 font-mono tabular-nums">
          {value}
        </div>
        {delta ? (
          <span
            className={`text-xs font-mono ${
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
        <p className="text-xs text-ink-400 mt-1 font-sans truncate">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
};
