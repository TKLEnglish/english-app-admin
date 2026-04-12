'use client'
import { useState } from 'react'
import { Dropdown, DropdownItem } from '@/components/dropdown/Dropdown'
import { Button } from '@/components/button/Button'

const FILE_ITEMS = [
  { label: 'New File', value: 'new', icon: '📄' },
  { label: 'Open…', value: 'open', icon: '📂' },
  { separator: true },
  { label: 'Save', value: 'save', icon: '💾' },
  { label: 'Save As…', value: 'save-as', icon: '💾' },
  { separator: true },
  { label: 'Delete', value: 'delete', icon: '🗑️', danger: true },
]

const GROUPS = [
  {
    label: 'Actions',
    items: [
      { label: 'Edit', value: 'edit', icon: '✏️' },
      { label: 'Duplicate', value: 'duplicate', icon: '📋' },
    ],
  },
  {
    label: 'Export',
    items: [
      {
        label: 'Export As', icon: '📤',
        children: [
          { label: 'PNG', value: 'png', icon: '🖼️' },
          { label: 'PDF', value: 'pdf', icon: '📑' },
          { label: 'SVG', value: 'svg', icon: '🔷' },
        ],
      },
    ],
  },
  {
    label: 'Danger Zone',
    items: [
      { label: 'Archive', value: 'archive', icon: '📦', danger: true },
      { label: 'Delete', value: 'delete', icon: '🗑️', danger: true },
    ],
  },
]

export default function DropdownPage() {
  const [lastSelected, setLastSelected] = useState<DropdownItem | null>(null)

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Dropdown</h1>
        <p className="page-description">Context menu with groups, submenus, keyboard navigation and danger variant.</p>
      </header>

      <section className="demo-section">
        <h2 className="demo-section-title">Basic Menu</h2>
        <div className="demo-card">
          <Dropdown items={FILE_ITEMS} onSelected={setLastSelected}>
            <Button variant="primary">File ▾</Button>
          </Dropdown>
          {lastSelected && <p className="demo-value" style={{ marginTop: '1rem' }}>Selected: {lastSelected.label}</p>}
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Groups &amp; Submenus</h2>
        <div className="demo-card">
          <Dropdown groups={GROUPS} onSelected={setLastSelected} placement="bottom-end">
            <Button variant="secondary">Options ▾</Button>
          </Dropdown>
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">End Placement</h2>
        <div className="demo-card" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Dropdown items={FILE_ITEMS} onSelected={setLastSelected} placement="bottom-end">
            <Button variant="ghost">⋯ More</Button>
          </Dropdown>
        </div>
      </section>
    </div>
  )
}
