import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  className?: string;
  accentColor?: 'indigo' | 'emerald' | 'amber' | 'cyan' | 'rose' | 'default';
}

export const Card: React.FC<CardProps> = ({
  children,
  interactive = false,
  className = '',
  accentColor = 'default',
  ...props
}) => {
  const accentBorders = {
    default: 'border-[var(--border-main)]',
    indigo: 'border-indigo-500/70 dark:border-indigo-400/80',
    emerald: 'border-emerald-500/70 dark:border-emerald-400/80',
    amber: 'border-amber-500/70 dark:border-amber-400/80',
    cyan: 'border-cyan-500/70 dark:border-cyan-400/80',
    rose: 'border-rose-500/70 dark:border-rose-400/80',
  };

  return (
    <div
      className={`rounded-2xl border-2 ${accentBorders[accentColor]} bg-[var(--bg-card)] text-[var(--text-main)] p-4 sm:p-5 shadow-[3px_3px_0px_var(--shadow-color)] transition-all duration-150 ${
        interactive
          ? 'hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

