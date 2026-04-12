'use client'
import React from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type ButtonType = 'button' | 'submit' | 'reset'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  type?: ButtonType
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  iconOnly?: boolean
  style?: React.CSSProperties
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  children?: React.ReactNode
}

export function Button({
  variant = 'primary', size = 'md', type = 'button',
  disabled = false, loading = false, fullWidth = false, iconOnly = false,
  style, onClick, children,
}: ButtonProps) {
  const classes = [
    'btn', variant, size,
    loading ? 'loading' : '',
    fullWidth ? 'full-width' : '',
    iconOnly ? 'icon-only' : '',
  ].filter(Boolean).join(' ')

  return (
    <button
      className={classes}
      type={type}
      disabled={disabled || loading}
      style={style}
      onClick={(e) => { if (!disabled && !loading) onClick?.(e) }}
    >
      {loading && <span className="btn-spinner" aria-hidden="true" />}
      <span className={`btn-content${loading ? ' hidden' : ''}`}>{children}</span>
    </button>
  )
}
