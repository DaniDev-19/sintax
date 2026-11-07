import React from 'react';

export type BadgeVariant = 'syntax' | 'logic' | 'best_practices' | 'dom' | 'architecture' | 'grade' | 'neutral' | 'playful';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  icon,
  className = '',
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    syntax: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[1.5px_1.5px_0px_0px_#064e3b]',
    logic: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40 shadow-[1.5px_1.5px_0px_0px_#312e81]',
    best_practices: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-[1.5px_1.5px_0px_0px_#164e63]',
    dom: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[1.5px_1.5px_0px_0px_#78350f]',
    architecture: 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-[1.5px_1.5px_0px_0px_#581c87]',
    grade: 'bg-emerald-400 text-slate-950 border-emerald-300 font-black shadow-[2px_2px_0px_0px_#047857]',
    playful: 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-[2px_2px_0px_0px_#b45309]',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700 shadow-[1.5px_1.5px_0px_0px_#0f172a]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider select-none ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

