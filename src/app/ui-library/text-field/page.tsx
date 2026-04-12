'use client';
import { useState } from 'react';
import { TextField } from '@/components/text-field/TextField';

export default function TextFieldPage() {
  const [basic, setBasic] = useState('');
  const [sm, setSm] = useState('');
  const [md, setMd] = useState('');
  const [lg, setLg] = useState('');
  const [primary, setPrimary] = useState('');
  const [secondary, setSecondary] = useState('');
  const [withError] = useState('');
  const [req, setReq] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Text Field</h1>
        <p className="page-description">
          Glassmorphism text input with label, hint, validation, sizes, and colors.
        </p>
      </header>

      <section className="demo-section">
        <h2 className="demo-section-title">Basic</h2>
        <div className="demo-card">
          <TextField
            value={basic}
            onChange={setBasic}
            label="Full Name"
            placeholder="Enter your full name"
            hint="Your legal first and last name"
          />
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Sizes</h2>
        <div className="demo-card">
          <div className="demo-grid">
            <TextField value={sm} onChange={setSm} label="Small" placeholder="sm input" size="sm" />
            <TextField
              value={md}
              onChange={setMd}
              label="Medium (default)"
              placeholder="md input"
              size="md"
            />
            <TextField value={lg} onChange={setLg} label="Large" placeholder="lg input" size="lg" />
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Colors</h2>
        <div className="demo-card">
          <div className="demo-grid">
            <TextField
              value={primary}
              onChange={setPrimary}
              label="Primary"
              placeholder="Primary color"
              color="primary"
            />
            <TextField
              value={secondary}
              onChange={setSecondary}
              label="Secondary"
              placeholder="Secondary color"
              color="secondary"
            />
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">States</h2>
        <div className="demo-card">
          <TextField
            value={withError}
            label="With Error"
            placeholder="Required field"
            validateMessage="This field is required"
          />
          <TextField value="Disabled value" label="Disabled" placeholder="Cannot edit" disabled />
          <TextField
            value={req}
            onChange={setReq}
            label="Required"
            placeholder="Required field"
            required
          />
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Input Types</h2>
        <div className="demo-card">
          <div className="demo-grid">
            <TextField
              value={email}
              onChange={setEmail}
              label="Email"
              placeholder="you@example.com"
              type="email"
            />
            <TextField
              value={password}
              onChange={setPassword}
              label="Password"
              placeholder="Enter password"
              type="password"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
