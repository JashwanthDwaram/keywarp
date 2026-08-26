import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevation?: 1 | 2 | 3;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`rounded border border-ink-400/15 bg-surface ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
