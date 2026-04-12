'use client'
import { useState, useEffect, useRef } from 'react'

export interface SelectOption {
  label: string
  value: string | number
}

interface SelectorFieldProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary'
  label?: string
  hint?: string
  validateMessage?: string
  options?: SelectOption[]
  placeholder?: string
  disabled?: boolean
  required?: boolean
  value?: string | number
  onChange?: (value: string | number) => void
}

export function SelectorField({
  size = 'md', color = 'primary', label, hint, validateMessage,
  options = [], placeholder = 'Select an option',
  disabled = false, required = false, value, onChange,
}: SelectorFieldProps) {
  const [selected, setSelected] = useState<string | number>(value ?? '')
  const [isOpen, setIsOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = () => { if (isOpen) { setIsOpen(false); setHighlighted(-1) } }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [isOpen])

  function toggleDropdown(e: React.MouseEvent) {
    e.stopPropagation()
    if (disabled) return
    setIsOpen(v => !v)
    if (isOpen) setHighlighted(-1)
  }

  function selectOption(option: SelectOption, e: React.MouseEvent) {
    e.stopPropagation()
    setSelected(option.value)
    setIsOpen(false)
    setHighlighted(-1)
    onChange?.(option.value)
  }

  function onKeydown(e: React.KeyboardEvent) {
    if (disabled) return
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!isOpen) setIsOpen(true); else setHighlighted(i => Math.min(i + 1, options.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(i => Math.max(i - 1, 0)) }
    if (e.key === 'Escape') setIsOpen(false)
    if ((e.key === 'Enter' || e.key === ' ') && isOpen && highlighted >= 0) {
      e.preventDefault()
      const opt = options[highlighted]
      setSelected(opt.value); setIsOpen(false); setHighlighted(-1); onChange?.(opt.value)
    }
  }

  const selectedLabel = options.find(o => o.value === selected)?.label ?? ''

  return (
    <div className="field">
      {label && <label className={`field-label${required ? ' required' : ''}`}>{label}</label>}
      <div
        ref={wrapperRef}
        className={`field-input-wrapper ${size} ${color}${isOpen ? ' open' : ''}${validateMessage ? ' error' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={`field-trigger${selected !== '' ? ' has-value' : ''}${disabled ? ' is-disabled' : ''}`}
          disabled={disabled}
          onClick={toggleDropdown}
          onKeyDown={onKeydown}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={label || placeholder}
        >
          <span className="field-trigger-label">{selectedLabel || placeholder}</span>
          <svg className={`field-trigger-arrow${isOpen ? ' rotated' : ''}`} xmlns="http://www.w3.org/2000/svg"
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {isOpen && (
          <div className="field-dropdown" role="listbox">
            {options.map((option, i) => (
              <div
                key={option.value}
                className={`field-option${selected === option.value ? ' selected' : ''}${highlighted === i ? ' highlighted' : ''}`}
                role="option"
                aria-selected={selected === option.value}
                onClick={(e) => selectOption(option, e)}
                onMouseEnter={() => setHighlighted(i)}
              >
                <span>{option.label}</span>
                {selected === option.value && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {hint && !validateMessage && <div className="field-hint">{hint}</div>}
      {validateMessage && <div className="validate-message">{validateMessage}</div>}
    </div>
  )
}
