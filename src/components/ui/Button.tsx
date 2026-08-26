import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'ghost' | 'glow' | 'danger' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-sans font-medium rounded transition-colors duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed';

  const sizeStyles = {
    xs: 'px-2 py-0.5 text-xs gap-1.5',
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-xs sm:text-sm gap-2',
    lg: 'px-4.5 py-2 text-sm gap-2'
  };

  const variantStyles = {
    primary: 'bg-surface text-ink-100 border border-accent/70 hover:border-accent hover:text-ink-100',
    secondary: 'bg-surface text-ink-400 border border-ink-400/20 hover:text-ink-100 hover:border-ink-400/40',
    glass: 'bg-surface text-ink-400 border border-ink-400/20 hover:text-ink-100 hover:border-ink-400/40',
    ghost: 'bg-transparent text-ink-400 hover:text-ink-100 border border-transparent',
    glow: 'bg-surface text-ink-100 border border-accent hover:bg-surface/80',
    danger: 'bg-surface text-incorrect border border-incorrect/30 hover:border-incorrect',
    outline: 'bg-transparent text-ink-400 border border-ink-400/25 hover:text-ink-100 hover:border-ink-400/50'
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : icon && iconPosition === 'left' ? (
        <span className="shrink-0">{icon}</span>
      ) : null}

      <span>{children}</span>

      {!isLoading && icon && iconPosition === 'right' ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
    </button>
  );
};
