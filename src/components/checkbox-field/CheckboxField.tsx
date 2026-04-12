'use client';
import { useState } from 'react';

interface CheckboxFieldProps {
  label?: string;
  hint?: string;
  validateMessage?: string;
  checked?: boolean;
  disabled?: boolean;
  required?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
}

export function CheckboxField({
  label,
  hint,
  validateMessage,
  checked = false,
  disabled = false,
  required = false,
  indeterminate = false,
  onChange,
}: CheckboxFieldProps) {
  const [isChecked, setIsChecked] = useState(checked);

  function toggle() {
    if (disabled) return;
    const next = !isChecked;
    setIsChecked(next);
    onChange?.(next);
  }

  return (
    <div className="field checkbox-field">
      <label className={`checkbox-label${disabled ? ' disabled' : ''}`} onClick={toggle}>
        <div
          className={`checkbox-box${isChecked || indeterminate ? ' checked' : ''}${disabled ? ' disabled' : ''}${validateMessage ? ' error' : ''}`}
        >
          {indeterminate && !isChecked ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          ) : isChecked ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : null}
        </div>
        {label && <span className={`checkbox-text${required ? ' required' : ''}`}>{label}</span>}
      </label>
      {hint && !validateMessage && <div className="field-hint">{hint}</div>}
      {validateMessage && <div className="validate-message">{validateMessage}</div>}
    </div>
  );
}
