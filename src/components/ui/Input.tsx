import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  icon,
  rightElement,
  showPasswordToggle = false,
  className = '',
  type = 'text',
  id,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const isPassword = type === 'password';
  const effectiveType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-bold text-[var(--text-main)] uppercase tracking-wider mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none flex items-center">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          type={effectiveType}
          className={`w-full py-2.5 px-3.5 rounded-xl border-2 text-xs sm:text-sm font-semibold bg-[var(--bg-card)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] transition-all duration-150 focus:outline-none shadow-[2px_2px_0px_var(--shadow-color)] ${
            icon ? 'pl-10' : ''
          } ${rightElement || isPassword || showPasswordToggle ? 'pr-11' : ''} ${
            error
              ? 'border-rose-500 focus:border-rose-400 shadow-[3px_3px_0px_0px_#881337]'
              : 'border-[var(--border-main)] hover:border-indigo-500 focus:border-indigo-500 focus:shadow-[3px_3px_0px_var(--shadow-color)]'
          } ${className}`}
          {...props}
        />

        {isPassword || showPasswordToggle ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] focus:outline-none cursor-pointer"
            title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        ) : rightElement ? (
          <div className="absolute right-3 flex items-center">{rightElement}</div>
        ) : null}
      </div>

      {error ? (
        <p className="mt-1 text-[11px] font-bold text-rose-500 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-[11px] text-[var(--text-muted)] font-medium">{hint}</p>
      ) : null}
    </div>
  );
};
