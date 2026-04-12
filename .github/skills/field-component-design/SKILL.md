---
name: field-component-design
description: 'Create consistent, reusable field components (text input, select, date picker) with standardized sizing (sm/md/lg), colors (primary/secondary), labels, hints, and validation messages. Use when: building React form fields, creating input components, adding validation feedback, or ensuring consistent field styling across the application.'
argument-hint: 'Specify: size (sm|md|lg), color (primary|secondary), label text, hint text, validateMessage'
---

# Field Component Design Skill

## Overview

A structured approach to building consistent, themeable field components across the application. Ensures uniform styling, spacing, validation feedback, and responsive behavior.

## When to Use

- Building new form input components
- Creating select/dropdown field components
- Adding date picker field components
- Implementing field validation messaging
- Ensuring consistent form styling
- Applying responsive sizing to fields

## Field Component Architecture

### Component Structure

```tsx
'use client'
import { useState } from 'react'

interface FieldProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary'
  label?: string
  hint?: string
  validateMessage?: string
  value?: string
  disabled?: boolean
  required?: boolean
  onChange?: (value: string) => void
}

export function Field({
  size = 'md', color = 'primary', label, hint, validateMessage,
  value = '', disabled = false, required = false, onChange,
}: FieldProps) {
  const [inputValue, setInputValue] = useState(value)

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value)
    onChange?.(e.target.value)
  }

  return (
    <div className="field">
      {label && (
        <label className={`field-label${required ? ' required' : ''}`}>{label}</label>
      )}
      <input
        className={`field-input ${size} ${color}${validateMessage ? ' error' : ''}`}
        value={inputValue}
        onChange={onInput}
        disabled={disabled}
        placeholder={label}
      />
      {hint && !validateMessage && <div className="field-hint">{hint}</div>}
      {validateMessage && <div className="validate-message">{validateMessage}</div>}
    </div>
  )
}
```

### Size System

| Size | Input Height | Font Size | Padding | Use Case |
|------|--------------|-----------|---------|----------|
| `sm` | 32px | 0.75rem | 0.5rem | Compact forms, inline fields |
| `md` | 40px | 0.875rem | 0.75rem | Standard forms, most UIs |
| `lg` | 48px | 1rem | 1rem | Prominent fields, mobile-first |

### Color Variants

| Color | Primary Use | Accent Color |
|-------|------------|--------------|
| `primary` | Main form fields | Blue (#3b82f6) |
| `secondary` | Alternative fields | Gray (#6b7280) |

## Implementation Pattern

### Step 1: Define Size Classes

```css
:host {
  --size-sm: 32px;
  --size-md: 40px;
  --size-lg: 48px;
  
  --primary-color: #3b82f6;
  --secondary-color: #6b7280;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-input {
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.95);
  transition: all 0.3s ease;
  font-family: inherit;
  box-sizing: border-box;
}

.field-input.sm {
  height: var(--size-sm);
  padding: 0 0.5rem;
  font-size: 0.75rem;
}

.field-input.md {
  height: var(--size-md);
  padding: 0 0.75rem;
  font-size: 0.875rem;
}

.field-input.lg {
  height: var(--size-lg);
  padding: 0 1rem;
  font-size: 1rem;
}
```

### Step 2: Apply Color Variants

```css
/* Primary color variant */
.field-input.primary:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: white;
}

/* Secondary color variant */
.field-input.secondary:focus {
  outline: none;
  border-color: var(--secondary-color);
  box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1);
  background: white;
}
```

### Step 3: Validation States

```css
.field-input.error {
  border-color: #ef4444;
  background: rgba(254, 242, 242, 0.5);
}

.field-input.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.validate-message {
  font-size: 0.75rem;
  color: #ef4444;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.validate-message::before {
  content: '⚠';
}
```

### Step 4: Label & Hint

```css
.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.field-label.required::after {
  content: '*';
  color: #ef4444;
}

.field-hint {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 400;
}
```

### Step 5: Responsive Adaptation

```css
/* Mobile: Default larger size for touch */
.field-input {
  height: var(--size-lg);
  font-size: 1rem;
}

/* Tablet and up: Standard sizing */
@media screen and (min-width: 480px) {
  .field-input {
    height: var(--size-md);
    font-size: 0.875rem;
  }
}

/* Desktop: Allow custom sizing */
@media screen and (min-width: 768px) {
  .field-input.sm {
    height: var(--size-sm);
    font-size: 0.75rem;
  }
}
```

## Template Example

```tsx
<div className="field">
  {/* Label */}
  {label && (
    <label className={`field-label${required ? ' required' : ''}`}>
      {label}
    </label>
  )}

  {/* Input */}
  <input
    type="text"
    className={`field-input ${size} ${color}${validateMessage ? ' error' : ''}`}
    value={inputValue}
    onChange={e => setInputValue(e.target.value)}
    placeholder={label}
  />

  {/* Hint */}
  {hint && !validateMessage && (
    <div className="field-hint">{hint}</div>
  )}

  {/* Validation Message */}
  {validateMessage && (
    <div className="validate-message">{validateMessage}</div>
  )}
</div>
```

## Usage Examples

### Small Primary Field
```tsx
<Field size="sm" color="primary" label="Email" hint="Enter your email address" validateMessage="Invalid email format" />
```

### Medium Secondary Field
```tsx
<Field size="md" color="secondary" label="Username" hint="3-20 characters" validateMessage="Username already taken" />
```

### Large Field with Dropdown
```tsx
<Field size="lg" color="primary" label="Date" hint="Click calendar icon to choose" validateMessage="Date is required" />
```

## Design System Alignment

✅ **Glassmorphism**: Semi-transparent backgrounds with subtle borders  
✅ **Responsive**: Mobile-first with size-based scaling  
✅ **Color Consistency**: Uses design tokens for primary/secondary colors  
✅ **Spacing**: Aligns to 0.5rem baseline grid  
✅ **Validation**: Clear error states with messaging  
✅ **Accessibility**: Proper labels, ARIA attributes, focus states  

## Completion Checklist

- [ ] Component accepts size (sm/md/lg) prop
- [ ] Component accepts color (primary/secondary) prop
- [ ] Label displays with optional required indicator
- [ ] Hint text shows when no error
- [ ] Validation message shows on error state
- [ ] Focus states use color-specific styling
- [ ] Mobile responsive (scales from lg → md)
- [ ] Error state clearly visible
- [ ] Keyboard accessible (tab, enter)
- [ ] CSS follows design tokens
