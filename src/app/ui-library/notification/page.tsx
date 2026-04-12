'use client'
import { useState } from 'react'
import { Notification } from '@/components/notification/Notification'
import { Button } from '@/components/button/Button'

export default function NotificationPage() {
  const [showToast, setShowToast] = useState(false)

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Notification</h1>
        <p className="page-description">Alert banners with four types, dismissible support, and auto-dismiss toast.</p>
      </header>

      <section className="demo-section">
        <h2 className="demo-section-title">Types</h2>
        <div className="demo-card">
          <Notification type="success" title="Success" message="Your changes have been saved successfully." dismissible={false} />
          <Notification type="error" title="Error" message="There was a problem processing your request." dismissible={false} />
          <Notification type="warning" title="Warning" message="Your subscription expires in 3 days." dismissible={false} />
          <Notification type="info" title="Info" message="A new version of the app is available." dismissible={false} />
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Dismissible</h2>
        <div className="demo-card">
          <Notification type="success" title="Dismissible" message="Click the × button to dismiss this notification." />
          <Notification type="info" message="This notification can be dismissed." />
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Auto-Dismiss Toast</h2>
        <div className="demo-card">
          <Button variant="primary" onClick={() => setShowToast(true)}>Show Auto-Dismiss (3s)</Button>
          {showToast && (
            <Notification
              type="success"
              title="Done!"
              message="This will disappear in 3 seconds."
              autoDismissMs={3000}
              onDismiss={() => setShowToast(false)}
            />
          )}
        </div>
      </section>
    </div>
  )
}
