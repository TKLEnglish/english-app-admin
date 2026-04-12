'use client'
import { useState } from 'react'

type MaskType = 'phone' | 'currency' | 'decimal' | 'integer' | 'none'

interface NumberFieldProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary'
  label?: string
  hint?: string
  validateMessage?: string
  placeholder?: string
  mask?: MaskType
  customMask?: (value: string) => string
  decimalPlaces?: number
  value?: string
  disabled?: boolean
  required?: boolean
  onChange?: (value: string) => void
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`
  return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`
}
function maskInteger(v: string) { return v.replace(/\D/g, '') }
function maskDecimal(v: string, places: number) {
  const clean = v.replace(/[^\d.]/g, '')
  const parts = clean.split('.')
  return parts.length > 1 ? `${parts[0]}.${parts[1].slice(0, places)}` : clean
}
function maskCurrency(v: string) {
  const n = parseFloat(v.replace(/[^\d.]/g, ''))
  if (isNaN(n)) return ''
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export function NumberField({
  size = 'md', color = 'primary', label, hint, validateMessage,
  placeholder = '', mask = 'integer', customMask, decimalPlaces = 2,
  value = '', disabled = false, required = false, onChange,
}: NumberFieldProps) {
  const [displayValue, setDisplayValue] = useState(value)

  function applyMask(v: string): string {
    if (!v) return ''
    if (customMask) return customMask(v)
    switch (mask) {
      case 'phone': return maskPhone(v)
      case 'currency': return maskCurrency(v)
      case 'decimal': return maskDecimal(v, decimalPlaces)
      case 'integer': return maskInteger(v)
      default: return v
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = applyMask(e.target.value)
    setDisplayValue(formatted)
    e.target.value = formatted
    const num = parseFloat(formatted.replace(/[^\d.-]/g, ''))
    onChange?.(isNaN(num) ? formatted : String(num))
  }

  return (
    <div className="field">
      {label && <label className={`field-label${required ? ' required' : ''}`}>{label}</label>}
      <div className={`field-input-wrapper ${size} ${color}${validateMessage ? ' error' : ''}`}>
        <input
          className="field-input"
          type="text"
          value={displayValue}
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
  )
}
