'use client'
import { useState, useEffect } from 'react'

type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface NotificationProps {
  type?: NotificationType
  title?: string
  message?: string
  dismissible?: boolean
  autoDismissMs?: number
  visible?: boolean
  onDismiss?: () => void
}

const ICONS: Record<NotificationType, React.ReactNode> = {
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
}

export function Notification({
  type = 'info', title, message, dismissible = true, autoDismissMs, visible: initialVisible = true, onDismiss
}: NotificationProps) {
  const [visible, setVisible] = useState(initialVisible)

  useEffect(() => {
    setVisible(initialVisible)
  }, [initialVisible])

  useEffect(() => {
    if (!autoDismissMs) return
    const timer = setTimeout(() => { setVisible(false); onDismiss?.() }, autoDismissMs)
    return () => clearTimeout(timer)
  }, [autoDismissMs, onDismiss])

  if (!visible) return null

  function dismiss() {
    setVisible(false)
    onDismiss?.()
  }

  return (
    <div className={`notification type-${type}`} role="alert">
      <span className="notification-icon">{ICONS[type]}</span>
      <div className="notification-body">
        {title && <div className="notification-title">{title}</div>}
        {message && <div className="notification-message">{message}</div>}
      </div>
      {dismissible && (
        <button type="button" className="notification-close" onClick={dismiss} aria-label="Dismiss">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  )
}
