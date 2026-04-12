'use client'
import { useState } from 'react'
import { NumberField } from '@/components/number-field/NumberField'

export default function NumberFieldPage() {
  const [phone, setPhone] = useState('')
  const [currency, setCurrency] = useState('')
  const [decimal, setDecimal] = useState('')
  const [integer, setInteger] = useState('')
  const [custom, setCustom] = useState('')

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Number Field</h1>
        <p className="page-description">Masked numeric input supporting phone, currency, decimal, integer formats.</p>
      </header>

      <section className="demo-section">
        <h2 className="demo-section-title">Phone Mask</h2>
        <div className="demo-card">
          <NumberField value={phone} onChange={(v) => setPhone(String(v))} label="Phone Number" placeholder="(555) 000-0000" mask="phone" />
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Currency Mask</h2>
        <div className="demo-card">
          <NumberField value={currency} onChange={(v) => setCurrency(String(v))} label="Amount" placeholder="$0.00" mask="currency" />
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Decimal Mask</h2>
        <div className="demo-card">
          <div className="demo-grid">
            <NumberField value={decimal} onChange={(v) => setDecimal(String(v))} label="Decimal (2 places)" placeholder="0.00" mask="decimal" decimalPlaces={2} />
            <NumberField value={custom} onChange={(v) => setCustom(String(v))} label="Decimal (4 places)" placeholder="0.0000" mask="decimal" decimalPlaces={4} />
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Integer Mask</h2>
        <div className="demo-card">
          <NumberField value={integer} onChange={(v) => setInteger(String(v))} label="Quantity" placeholder="0" mask="integer" />
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Sizes</h2>
        <div className="demo-card">
          <div className="demo-grid">
            <NumberField label="Small" placeholder="sm" size="sm" mask="integer" />
            <NumberField label="Medium" placeholder="md" size="md" mask="integer" />
            <NumberField label="Large" placeholder="lg" size="lg" mask="integer" />
          </div>
        </div>
      </section>
    </div>
  )
}
