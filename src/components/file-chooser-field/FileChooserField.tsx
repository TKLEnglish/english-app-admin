'use client'
import { useRef } from 'react'

interface FileChooserFieldProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  hint?: string
  validateMessage?: string
  accept?: string
  value?: File | null
  disabled?: boolean
  required?: boolean
  onChange?: (file: File | null) => void
}

export function FileChooserField({
  size = 'md',
  label,
  hint,
  validateMessage,
  accept,
  value,
  disabled = false,
  required = false,
  onChange,
}: FileChooserFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange?.(e.target.files?.[0] ?? null)
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    if (inputRef.current) inputRef.current.value = ''
    onChange?.(null)
  }

  return (
    <div className="field">
      {label && (
        <label className={`field-label${required ? ' required' : ''}`}>{label}</label>
      )}
      <div
        className={`file-chooser-trigger ${size}${validateMessage ? ' error' : ''}${disabled ? ' disabled' : ''}`}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !disabled) inputRef.current?.click() }}
        aria-label={label ?? 'Choose file'}
      >
        <span className="file-chooser-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </span>
        <span className={`file-chooser-text${value ? '' : ' placeholder'}`}>
          {value ? value.name : 'Choose file…'}
        </span>
        {value && !disabled && (
          <button
            type="button"
            className="file-chooser-clear"
            onClick={handleClear}
            aria-label="Clear file"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="11" y2="11" />
              <line x1="11" y1="1" x2="1" y2="11" />
            </svg>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      {hint && !validateMessage && <div className="field-hint">{hint}</div>}
      {validateMessage && <div className="validate-message">{validateMessage}</div>}
    </div>
  )
}
