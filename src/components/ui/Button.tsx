import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost' | 'playful';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'relative inline-flex items-center justify-center font-bold tracking-tight rounded-xl transition-all duration-150 active:translate-x-0.5 active:translate-y-0.5 focus:outline-none select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2.5 gap-2',
    lg: 'text-sm sm:text-base px-6 py-3 gap-2.5',
  };

  const variantClasses: Record<ButtonVariant, string> = {
    // Neo-brutalism tech: borde marcado con sombra sólida
    primary:
      'bg-indigo-600 hover:bg-indigo-500 text-white border-2 border-indigo-400/80 shadow-[3px_3px_0px_0px_#312e81]',
    secondary:
      'bg-slate-800 hover:bg-slate-700 text-slate-100 border-2 border-slate-600 shadow-[3px_3px_0px_0px_#0f172a]',
    accent:
      'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black border-2 border-emerald-300 shadow-[3px_3px_0px_0px_#064e3b]',
    playful:
      'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black border-2 border-amber-300 shadow-[3px_3px_0px_0px_#78350f]',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white border-2 border-rose-400 shadow-[3px_3px_0px_0px_#4c0519]',
    ghost:
      'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white border-2 border-transparent',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
      ) : (
        icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>
      )}

      <span>{children}</span>

      {!loading && icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </button>
  );
};

