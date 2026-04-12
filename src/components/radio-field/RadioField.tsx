'use client';
import { useState } from 'react';

export interface RadioOption {
  label: string;
  value: string | number;
}

interface RadioFieldProps {
  label?: string;
  hint?: string;
  validateMessage?: string;
  options?: RadioOption[];
  value?: string | number;
  disabled?: boolean;
  required?: boolean;
  layout?: 'horizontal' | 'vertical';
  onChange?: (value: string | number) => void;
}

export function RadioField({
  label,
  hint,
  validateMessage,
  options = [],
  value,
  disabled = false,
  required = false,
  layout = 'vertical',
  onChange,
}: RadioFieldProps) {
  const [selected, setSelected] = useState<string | number>(value ?? '');

  function select(val: string | number) {
    if (disabled) return;
    setSelected(val);
    onChange?.(val);
  }

  return (
    <div className="field radio-field">
      {label && <label className={`field-label${required ? ' required' : ''}`}>{label}</label>}
      <div className={`radio-group ${layout}${validateMessage ? ' error' : ''}`}>
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`radio-label${disabled ? ' disabled' : ''}`}
            onClick={() => select(opt.value)}
          >
            <div className={`radio-box${selected === opt.value ? ' checked' : ''}`}>
              {selected === opt.value && <div className="radio-dot" />}
            </div>
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      {hint && !validateMessage && <div className="field-hint">{hint}</div>}
      {validateMessage && <div className="validate-message">{validateMessage}</div>}
    </div>
  );
}
