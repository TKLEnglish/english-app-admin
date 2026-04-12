'use client';
import { useState } from 'react';
import { Button } from '@/components/button/Button';

export default function ButtonPage() {
  const [loading, setLoading] = useState(false);

  function simulate() {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Button</h1>
        <p className="page-description">
          Five variants, three sizes, loading spinner, disabled and full-width states.
        </p>
      </header>

      <section className="demo-section">
        <h2 className="demo-section-title">Variants</h2>
        <div className="demo-card">
          <div className="demo-row">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="outline">Outline</Button>
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Sizes</h2>
        <div className="demo-card">
          <div className="demo-row">
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" size="md">
              Medium
            </Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">States</h2>
        <div className="demo-card">
          <div className="demo-row">
            <Button variant="primary" disabled>
              Disabled
            </Button>
            <Button variant="primary" loading={loading} onClick={simulate}>
              {loading ? 'Loading…' : 'Click to Load'}
            </Button>
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Full Width</h2>
        <div className="demo-card">
          <Button variant="primary" fullWidth>
            Full Width Button
          </Button>
        </div>
      </section>
    </div>
  );
}
