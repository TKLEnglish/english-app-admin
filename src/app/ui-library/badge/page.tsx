import { Badge } from '@/components/badge/Badge';

export default function BadgePage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Badge</h1>
        <p className="page-description">
          Status labels with dot indicator, multiple variants, sizes and removable chips.
        </p>
      </header>

      <section className="demo-section">
        <h2 className="demo-section-title">Variants</h2>
        <div className="demo-card">
          <div className="demo-row">
            <Badge variant="default" label="Default" />
            <Badge variant="primary" label="Primary" />
            <Badge variant="secondary" label="Secondary" />
            <Badge variant="success" label="Success" />
            <Badge variant="warning" label="Warning" />
            <Badge variant="danger" label="Danger" />
            <Badge variant="info" label="Info" />
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Sizes</h2>
        <div className="demo-card">
          <div className="demo-row">
            <Badge variant="primary" size="sm" label="Small" />
            <Badge variant="primary" size="md" label="Medium" />
            <Badge variant="primary" size="lg" label="Large" />
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">With Dot Indicator</h2>
        <div className="demo-card">
          <div className="demo-row">
            <Badge variant="success" dot label="Online" />
            <Badge variant="warning" dot label="Away" />
            <Badge variant="danger" dot label="Offline" />
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Removable</h2>
        <div className="demo-card">
          <div className="demo-row">
            <Badge variant="primary" label="React" removable />
            <Badge variant="secondary" label="Next.js" removable />
            <Badge variant="info" label="TypeScript" removable />
          </div>
        </div>
      </section>
    </div>
  );
}
