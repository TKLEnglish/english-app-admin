'use client'
import React from 'react'

interface BadgeProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  label?: string
  dot?: boolean
  removable?: boolean
  onRemove?: () => void
  children?: React.ReactNode
}

export function Badge({
  variant = 'default', size = 'md', label, dot = false, removable = false, onRemove, children
}: BadgeProps) {
  return (
    <span className={`badge variant-${variant} size-${size}`}>
      {dot && <span className="badge-dot" />}
      <span className="badge-label">{label ?? children}</span>
      {removable && (
        <button type="button" className="badge-remove" onClick={onRemove} aria-label="Remove">×</button>
      )}
    </span>
  )
}
