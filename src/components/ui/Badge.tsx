import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate' | 'sky' | 'accent' | 'correct' | 'incorrect';
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  className = '',
  icon
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-1.5'
  };

  const variantStyles = {
    indigo: 'bg-surface text-ink-100 border border-accent/40',
    accent: 'bg-surface text-ink-100 border border-accent/40',
    emerald: 'bg-surface text-correct border border-correct/30',
    correct: 'bg-surface text-correct border border-correct/30',
    amber: 'bg-surface text-ink-100 border border-ink-400/30',
    rose: 'bg-surface text-incorrect border border-incorrect/30',
    incorrect: 'bg-surface text-incorrect border border-incorrect/30',
    slate: 'bg-surface text-ink-400 border border-ink-400/20',
    sky: 'bg-surface text-ink-400 border border-ink-400/20'
  };

  return (
    <span
      className={`inline-flex items-center font-sans font-medium rounded border select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <span>{children}</span>
    </span>
  );
};
