'use client';
import { useState } from 'react';
import { RadioField } from '@/components/radio-field/RadioField';

const SIZE_OPTIONS = [
  { label: 'Small', value: 'sm' },
  { label: 'Medium', value: 'md' },
  { label: 'Large', value: 'lg' },
];

const PLAN_OPTIONS = [
  { label: 'Free', value: 'free' },
  { label: 'Pro', value: 'pro' },
  { label: 'Enterprise', value: 'enterprise' },
];

export default function RadioPage() {
  const [size, setSize] = useState<string | number>('md');
  const [plan, setPlan] = useState<string | number>('free');

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Radio</h1>
        <p className="page-description">
          Option group with horizontal and vertical layout support.
        </p>
      </header>

      <section className="demo-section">
        <h2 className="demo-section-title">Vertical Layout (Default)</h2>
        <div className="demo-card">
          <RadioField label="Plan" options={PLAN_OPTIONS} value={plan} onChange={setPlan} />
          {plan && <p className="demo-value">Selected: {plan}</p>}
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Horizontal Layout</h2>
        <div className="demo-card">
          <RadioField
            label="Size"
            options={SIZE_OPTIONS}
            value={size}
            onChange={setSize}
            layout="horizontal"
          />
          {size && <p className="demo-value">Selected: {size}</p>}
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">States</h2>
        <div className="demo-card">
          <RadioField
            label="With Error"
            options={SIZE_OPTIONS}
            validateMessage="Please choose a size"
          />
          <RadioField label="Disabled" options={SIZE_OPTIONS} disabled />
          <RadioField label="Required" options={SIZE_OPTIONS} required />
        </div>
      </section>
    </div>
  );
}
