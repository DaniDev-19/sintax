import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface CustomSelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  size?: 'sm' | 'md';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Selecciona una opción...',
  searchable = false,
  className = '',
  disabled = false,
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const filteredOptions = searchable
    ? options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (opt.sublabel && opt.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : options;

  const sizeButtonClasses =
    size === 'sm'
      ? 'px-2.5 py-1.5 rounded-lg text-xs'
      : 'px-3.5 py-2.5 rounded-xl text-xs sm:text-sm';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-[var(--text-main)] uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>{label}</span>
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between border-2 font-semibold transition-all text-left select-none cursor-pointer ${sizeButtonClasses} ${
          isOpen
            ? 'bg-[var(--bg-card)] border-indigo-500 text-[var(--text-main)] shadow-[3px_3px_0px_var(--shadow-color)]'
            : 'bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-main)] hover:border-indigo-400 shadow-[2px_2px_0px_var(--shadow-color)]'
        } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption ? (
            <>
              {selectedOption.icon && <span className="flex-shrink-0">{selectedOption.icon}</span>}
              <div className="truncate">
                <span className="font-bold text-[var(--text-main)]">{selectedOption.label}</span>
                {selectedOption.sublabel && (
                  <span className="text-[var(--text-muted)] text-[10px] ml-1.5 font-mono">
                    ({selectedOption.sublabel})
                  </span>
                )}
              </div>
            </>
          ) : (
            <span className="text-[var(--text-muted)] italic truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 text-[var(--text-muted)] ml-1">
          {selectedOption?.badge && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {selectedOption.badge}
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-[var(--bg-card)] border-2 border-[var(--border-main)] rounded-xl shadow-[4px_4px_0px_var(--shadow-color)] p-1.5 min-w-[180px] max-h-72 flex flex-col animate-in fade-in zoom-in-95 duration-100">
          {/* Search bar if needed */}
          {searchable && (
            <div className="relative mb-1.5">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar opción..."
                className="w-full pl-8 pr-7 py-1 rounded-lg bg-[var(--bg-app)] border border-[var(--border-main)] text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-400"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto space-y-0.5 pr-1 flex-1">
            {filteredOptions.length === 0 ? (
              <div className="text-center py-3 text-xs text-[var(--text-muted)] italic">
                No hay opciones disponibles
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all text-xs font-semibold select-none cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold shadow-[2px_2px_0px_var(--shadow-color)]'
                        : 'hover:bg-indigo-500/10 text-[var(--text-main)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {opt.icon && <span className="flex-shrink-0 text-[var(--text-muted)]">{opt.icon}</span>}
                      <div className="truncate">
                        <span className={isSelected ? 'text-white' : 'text-[var(--text-main)]'}>
                          {opt.label}
                        </span>
                        {opt.sublabel && (
                          <span
                            className={`text-[9px] font-mono block ${
                              isSelected ? 'text-indigo-200' : 'text-[var(--text-muted)]'
                            }`}
                          >
                            {opt.sublabel}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
                      {opt.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
