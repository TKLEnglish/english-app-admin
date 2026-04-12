'use client';
import { useState } from 'react';
import { CheckboxField } from '@/components/checkbox-field/CheckboxField';

export default function CheckboxPage() {
  const [terms, setTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [partial] = useState(false);

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Checkbox</h1>
        <p className="page-description">
          Boolean toggle with indeterminate state and validation support.
        </p>
      </header>

      <section className="demo-section">
        <h2 className="demo-section-title">Basic</h2>
        <div className="demo-card">
          <CheckboxField label="Accept Terms & Conditions" checked={terms} onChange={setTerms} />
          <CheckboxField
            label="Subscribe to newsletter"
            checked={newsletter}
            onChange={setNewsletter}
          />
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Indeterminate</h2>
        <div className="demo-card">
          <CheckboxField label="Select all (partial)" checked={partial} indeterminate />
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">States</h2>
        <div className="demo-card">
          <CheckboxField
            label="With validation error"
            validateMessage="You must accept the terms"
          />
          <CheckboxField label="Disabled unchecked" disabled />
          <CheckboxField label="Disabled checked" checked disabled />
          <CheckboxField label="Required field" required />
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">With Hint</h2>
        <div className="demo-card">
          <CheckboxField
            label="Enable notifications"
            hint="We will send you important updates via email"
          />
        </div>
      </section>
    </div>
  );
}
