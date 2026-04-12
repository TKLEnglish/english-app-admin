'use client'
import { useState } from 'react'
import { SelectorField } from '@/components/selector-field/SelectorField'

const FRUITS = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Durian', value: 'durian' },
  { label: 'Elderberry', value: 'elderberry' },
]

const COLORS = [
  { label: 'Red', value: 'red' },
  { label: 'Green', value: 'green' },
  { label: 'Blue', value: 'blue' },
]

export default function SelectorPage() {
  const [fruit, setFruit] = useState<string | number>('')
  const [color, setColor] = useState<string | number>('')

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Selector</h1>
        <p className="page-description">Dropdown single-select with keyboard navigation and accessible markup.</p>
      </header>

      <section className="demo-section">
        <h2 className="demo-section-title">Basic</h2>
        <div className="demo-card">
          <SelectorField value={fruit} onChange={setFruit} label="Favourite Fruit" options={FRUITS} hint="Choose one fruit" />
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Colors</h2>
        <div className="demo-card">
          <div className="demo-grid">
            <SelectorField value={color} onChange={setColor} label="Primary Color" options={COLORS} color="primary" />
            <SelectorField value={color} onChange={setColor} label="Secondary Color" options={COLORS} color="secondary" />
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Sizes</h2>
        <div className="demo-card">
          <div className="demo-grid">
            <SelectorField label="Small" options={FRUITS} size="sm" />
            <SelectorField label="Medium" options={FRUITS} size="md" />
            <SelectorField label="Large" options={FRUITS} size="lg" />
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">States</h2>
        <div className="demo-card">
          <SelectorField label="With Error" options={FRUITS} validateMessage="Please select an option" />
          <SelectorField label="Disabled" options={FRUITS} disabled />
          <SelectorField label="Required" options={FRUITS} required />
        </div>
      </section>
    </div>
  )
}
