import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './CustomSelect.css';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value?: string;
  defaultValue?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
}

export function CustomSelect({
  value: controlledValue,
  defaultValue,
  options,
  onChange,
  placeholder,
  style,
  className = '',
  disabled = false,
}: CustomSelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const selected = options.find(o => o.value === value);
  const label = selected?.label || placeholder || '';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  // Scroll active option into view when opened
  useEffect(() => {
    if (open && listRef.current) {
      const active = listRef.current.querySelector('.cselect__option--active') as HTMLElement;
      if (active) {
        active.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const idx = options.findIndex(o => o.value === value);
        const next = e.key === 'ArrowDown'
          ? Math.min(idx + 1, options.length - 1)
          : Math.max(idx - 1, 0);
        const newVal = options[next]?.value;
        if (newVal !== undefined) {
          if (controlledValue === undefined) setInternalValue(newVal);
          onChange?.(newVal);
        }
      } else if (e.key === 'Enter') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, value, options, onChange, controlledValue]);

  const handleSelect = (val: string) => {
    if (controlledValue === undefined) setInternalValue(val);
    onChange?.(val);
    setOpen(false);
  };

  return (
    <div
      className={`cselect ${open ? 'cselect--open' : ''} ${disabled ? 'cselect--disabled' : ''} ${className}`}
      ref={ref}
      style={style}
    >
      <button
        type="button"
        className="cselect__trigger"
        onClick={() => !disabled && setOpen(!open)}
        tabIndex={disabled ? -1 : 0}
      >
        <span className={`cselect__label ${!selected && placeholder ? 'cselect__label--placeholder' : ''}`}>
          {selected?.icon && <span className="cselect__icon">{selected.icon}</span>}
          {label}
        </span>
        <ChevronDown size={15} className={`cselect__chevron ${open ? 'cselect__chevron--open' : ''}`} />
      </button>

      {open && (
        <div className="cselect__dropdown" ref={listRef}>
          {options.map(opt => (
            <div
              key={opt.value}
              className={`cselect__option ${opt.value === value ? 'cselect__option--active' : ''}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.icon && <span className="cselect__icon">{opt.icon}</span>}
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
