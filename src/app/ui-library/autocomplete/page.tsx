'use client'
import { useState } from 'react'
import { AutocompleteField } from '@/components/autocomplete-field/AutocompleteField'

const COUNTRIES = [
  { label: 'United States', value: 'us' },
  { label: 'United Kingdom', value: 'uk' },
  { label: 'Canada', value: 'ca' },
  { label: 'Australia', value: 'au' },
  { label: 'Germany', value: 'de' },
  { label: 'France', value: 'fr' },
  { label: 'Japan', value: 'jp' },
  { label: 'Brazil', value: 'br' },
  { label: 'India', value: 'in' },
  { label: 'China', value: 'cn' },
]

export default function AutocompletePage() {
  const [single, setSingle] = useState<string | number>('')
  const [multi, setMulti] = useState<(string | number)[]>([])

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Autocomplete</h1>
        <p className="page-description">Searchable single and multi-select with chip tags and keyboard navigation.</p>
      </header>

      <section className="demo-section">
        <h2 className="demo-section-title">Single Select</h2>
        <div className="demo-card">
          <AutocompleteField
            label="Country" options={COUNTRIES} placeholder="Search countries…"
            value={single} onChange={setSingle} hint="Start typing to filter results"
          />
          {single && <p className="demo-value">Selected: {single}</p>}
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Multi Select</h2>
        <div className="demo-card">
          <AutocompleteField
            label="Countries" options={COUNTRIES} placeholder="Search and add countries…"
            multi values={multi} onChanges={setMulti}
          />
          {multi.length > 0 && <p className="demo-value">Selected: {multi.join(', ')}</p>}
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">States</h2>
        <div className="demo-card">
          <AutocompleteField label="With Error" options={COUNTRIES} validateMessage="A selection is required" />
          <AutocompleteField label="Disabled" options={COUNTRIES} disabled />
          <AutocompleteField label="Required" options={COUNTRIES} required />
        </div>
      </section>
    </div>
  )
}
