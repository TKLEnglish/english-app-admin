import { Tooltip } from '@/components/tooltip/Tooltip';
import { Button } from '@/components/button/Button';

export default function TooltipPage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Tooltip</h1>
        <p className="page-description">
          Hover or focus tooltip with 4 placement options and configurable delay.
        </p>
      </header>

      <section className="demo-section">
        <h2 className="demo-section-title">Placements</h2>
        <div className="demo-card">
          <div
            className="demo-row"
            style={{ flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', padding: '2rem 0' }}
          >
            <Tooltip content="This is a top tooltip" placement="top">
              <Button variant="outline">Top</Button>
            </Tooltip>
            <Tooltip content="This is a bottom tooltip" placement="bottom">
              <Button variant="outline">Bottom</Button>
            </Tooltip>
            <Tooltip content="This is a left tooltip" placement="left">
              <Button variant="outline">Left</Button>
            </Tooltip>
            <Tooltip content="This is a right tooltip" placement="right">
              <Button variant="outline">Right</Button>
            </Tooltip>
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Custom Delay</h2>
        <div className="demo-card">
          <div className="demo-row">
            <Tooltip content="Instant tooltip (0ms)" placement="top" delay={0}>
              <Button variant="ghost">No Delay</Button>
            </Tooltip>
            <Tooltip content="Default delay (300ms)" placement="top" delay={300}>
              <Button variant="ghost">300ms Delay</Button>
            </Tooltip>
            <Tooltip content="Long delay (800ms)" placement="top" delay={800}>
              <Button variant="ghost">800ms Delay</Button>
            </Tooltip>
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Text Triggers</h2>
        <div className="demo-card">
          <p>
            Hover over{' '}
            <Tooltip content="This term means 'beyond the physical'" placement="bottom">
              <span style={{ textDecoration: 'underline dotted', cursor: 'help' }}>
                metaphysical
              </span>
            </Tooltip>{' '}
            to see the tooltip on text.
          </p>
        </div>
      </section>
    </div>
  );
}
