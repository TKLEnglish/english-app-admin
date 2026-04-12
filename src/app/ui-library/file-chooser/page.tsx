'use client'
import { useState } from 'react'
import { FileChooserField } from '@/components/file-chooser-field/FileChooserField'

export default function FileChooserPage() {
  const [basic, setBasic] = useState<File | null>(null)
  const [sm, setSm] = useState<File | null>(null)
  const [md, setMd] = useState<File | null>(null)
  const [lg, setLg] = useState<File | null>(null)
  const [withHint, setWithHint] = useState<File | null>(null)
  const [withError, setWithError] = useState<File | null>(null)
  const [required, setRequired] = useState<File | null>(null)
  const [audio, setAudio] = useState<File | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [disabled, setDisabled] = useState<File | null>(null)

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">File Chooser</h1>
        <p className="page-description">Glassmorphism file input with label, hint, validation, sizes, and accept filtering.</p>
      </header>

      <section className="demo-section">
        <h2 className="demo-section-title">Basic</h2>
        <div className="demo-card">
          <FileChooserField label="Upload File" value={basic} onChange={setBasic} />
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Sizes</h2>
        <div className="demo-card">
          <div className="demo-grid">
            <FileChooserField label="Small" size="sm" value={sm} onChange={setSm} />
            <FileChooserField label="Medium (default)" size="md" value={md} onChange={setMd} />
            <FileChooserField label="Large" size="lg" value={lg} onChange={setLg} />
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">With Hint</h2>
        <div className="demo-card">
          <FileChooserField
            label="Upload Document"
            value={withHint}
            onChange={setWithHint}
            hint="Accepted formats: PDF, DOC, DOCX (max 10MB)"
          />
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">File Type Filtering</h2>
        <div className="demo-card">
          <div className="demo-grid">
            <FileChooserField
              label="Audio File"
              value={audio}
              onChange={setAudio}
              accept="audio/*"
              hint="MP3, WAV, OGG, etc."
            />
            <FileChooserField
              label="Image File"
              value={image}
              onChange={setImage}
              accept="image/*"
              hint="PNG, JPG, GIF, etc."
            />
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">States</h2>
        <div className="demo-card">
          <FileChooserField
            label="With Error"
            value={withError}
            onChange={setWithError}
            validateMessage="File format not supported"
          />
          <FileChooserField label="Required" value={required} onChange={setRequired} required />
          <FileChooserField label="Disabled" value={disabled} onChange={setDisabled} disabled />
        </div>
      </section>
    </div>
  )
}
