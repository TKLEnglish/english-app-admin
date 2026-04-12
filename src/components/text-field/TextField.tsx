'use client';
import { useState } from 'react';

interface TextFieldProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary';
  label?: string;
  hint?: string;
  validateMessage?: string;
  value?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (value: string) => void;
}

export function TextField({
  size = 'md',
  color = 'primary',
  label,
  hint,
  validateMessage,
  value = '',
  placeholder = '',
  type = 'text',
  disabled = false,
  required = false,
  onChange,
}: TextFieldProps) {
  const [inputValue, setInputValue] = useState(value);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
    onChange?.(e.target.value);
  }

  return (
    <div className="field">
      {label && <label className={`field-label${required ? ' required' : ''}`}>{label}</label>}
      <div className={`field-input-wrapper ${size} ${color}${validateMessage ? ' error' : ''}`}>
        <input
          className="field-input"
          type={type}
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onChange={handleChange}
          aria-label={label || placeholder}
        />
      </div>
      {hint && !validateMessage && <div className="field-hint">{hint}</div>}
      {validateMessage && <div className="validate-message">{validateMessage}</div>}
    </div>
  );
}
