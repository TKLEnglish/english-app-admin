'use client'
import { useState, useEffect, useRef } from 'react'

interface CalendarSelectorProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary'
  label?: string
  hint?: string
  validateMessage?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  value?: Date
  onChange?: (date: Date) => void
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function formatDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
}

function parseDate(s: string): Date | null {
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

function buildCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: (Date | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d))
  return days
}

export function CalendarSelector({
  size = 'md', color = 'primary', label, hint, validateMessage,
  placeholder = 'MM/DD/YYYY', disabled = false, required = false, value, onChange
}: CalendarSelectorProps) {
  const now = new Date()
  const [selected, setSelected] = useState<Date | null>(value ?? null)
  const [textInput, setTextInput] = useState(value ? formatDate(value) : '')
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(value ? value.getMonth() : now.getMonth())
  const [currentYear, setCurrentYear] = useState(value ? value.getFullYear() : now.getFullYear())
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  function toggleOpen(e: React.MouseEvent) {
    e.stopPropagation()
    if (disabled) return
    setIsOpen(v => !v)
  }

  function onTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setTextInput(v)
    const d = parseDate(v)
    if (d) {
      setSelected(d)
      setCurrentMonth(d.getMonth())
      setCurrentYear(d.getFullYear())
      onChange?.(d)
    }
  }

  function selectDay(d: Date) {
    setSelected(d)
    setTextInput(formatDate(d))
    setIsOpen(false)
    onChange?.(d)
  }

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }
  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const days = buildCalendarDays(currentYear, currentMonth)
  const today = new Date()

  return (
    <div className="field">
      {label && <label className={`field-label${required ? ' required' : ''}`}>{label}</label>}
      <div
        ref={wrapperRef}
        className={`field-input-wrapper ${size} ${color}${isOpen ? ' open' : ''}${validateMessage ? ' error' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`field-control field-calendar-control${disabled ? ' is-disabled' : ''}`}>
          <input
            type="text"
            className="field-calendar-input"
            placeholder={placeholder}
            value={textInput}
            disabled={disabled}
            onChange={onTextChange}
            onFocus={() => { if (!disabled) setIsOpen(true) }}
          />
          <button type="button" className="field-calendar-btn" onClick={toggleOpen} disabled={disabled} aria-label="Open calendar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="cal-dropdown" onClick={(e) => e.stopPropagation()}>
            <div className="cal-header">
              <button type="button" className="cal-nav-btn" onClick={prevMonth} aria-label="Previous month">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <span className="cal-month-title">{MONTHS[currentMonth]} {currentYear}</span>
              <button type="button" className="cal-nav-btn" onClick={nextMonth} aria-label="Next month">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
            <div className="cal-grid">
              {DAYS.map(day => (
                <div key={day} className="cal-day-name">{day}</div>
              ))}
              {days.map((d, i) => {
                if (!d) return <div key={`empty-${i}`} className="cal-day empty" />
                const isSelected = selected && d.toDateString() === selected.toDateString()
                const isToday = d.toDateString() === today.toDateString()
                return (
                  <button
                    key={d.toISOString()}
                    type="button"
                    className={`cal-day${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}`}
                    onClick={() => selectDay(d)}
                  >
                    {d.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
      {hint && !validateMessage && <div className="field-hint">{hint}</div>}
      {validateMessage && <div className="validate-message">{validateMessage}</div>}
    </div>
  )
}
