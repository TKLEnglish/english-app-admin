'use client'
import { useEffect } from 'react'
import React from 'react'

interface DialogProps {
  open: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closable?: boolean
  onClose?: () => void
  children?: React.ReactNode
  footer?: React.ReactNode
}

export function Dialog({ open, title, size = 'md', closable = true, onClose, children, footer }: DialogProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && closable) onClose?.() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, closable, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="dialog-backdrop" onClick={() => { if (closable) onClose?.() }} role="dialog" aria-modal="true">
      <div className={`dialog-panel size-${size}`} onClick={(e) => e.stopPropagation()}>
        {(title || closable) && (
          <div className="dialog-header">
            {title && <h2 className="dialog-title">{title}</h2>}
            {closable && (
              <button type="button" className="dialog-close" onClick={onClose} aria-label="Close dialog">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        )}
        {children && <div className="dialog-body">{children}</div>}
        {footer && <div className="dialog-footer">{footer}</div>}
      </div>
    </div>
  )
}
