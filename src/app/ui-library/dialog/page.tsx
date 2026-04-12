'use client';
import { useState } from 'react';
import { Dialog } from '@/components/dialog/Dialog';
import { Button } from '@/components/button/Button';

export default function DialogPage() {
  const [openSm, setOpenSm] = useState(false);
  const [openMd, setOpenMd] = useState(false);
  const [openLg, setOpenLg] = useState(false);
  const [openNc, setOpenNc] = useState(false);

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Dialog</h1>
        <p className="page-description">
          Modal with backdrop blur, multiple sizes, footer slot, and Escape/backdrop close.
        </p>
      </header>

      <section className="demo-section">
        <h2 className="demo-section-title">Sizes</h2>
        <div className="demo-card">
          <div className="demo-row">
            <Button variant="primary" onClick={() => setOpenSm(true)}>
              Small
            </Button>
            <Button variant="primary" onClick={() => setOpenMd(true)}>
              Medium
            </Button>
            <Button variant="primary" onClick={() => setOpenLg(true)}>
              Large
            </Button>
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Non-Closable</h2>
        <div className="demo-card">
          <Button variant="secondary" onClick={() => setOpenNc(true)}>
            Open Non-Closable
          </Button>
        </div>
      </section>

      {/* Small Dialog */}
      <Dialog
        open={openSm}
        title="Small Dialog"
        size="sm"
        onClose={() => setOpenSm(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpenSm(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setOpenSm(false)}>
              Confirm
            </Button>
          </>
        }
      >
        <p>This is a small dialog with a footer action area.</p>
      </Dialog>

      {/* Medium Dialog */}
      <Dialog
        open={openMd}
        title="Medium Dialog"
        size="md"
        onClose={() => setOpenMd(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpenMd(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setOpenMd(false)}>
              Save Changes
            </Button>
          </>
        }
      >
        <p>This is a medium dialog. It provides enough space for longer content and form fields.</p>
      </Dialog>

      {/* Large Dialog */}
      <Dialog
        open={openLg}
        title="Large Dialog"
        size="lg"
        onClose={() => setOpenLg(false)}
        footer={
          <Button variant="primary" onClick={() => setOpenLg(false)}>
            Close
          </Button>
        }
      >
        <p>This is a large dialog suitable for detailed content, tables, or multi-step flows.</p>
        <p style={{ marginTop: '1rem', opacity: 0.7 }}>
          Press Escape or click the backdrop to close.
        </p>
      </Dialog>

      {/* Non-Closable Dialog */}
      <Dialog open={openNc} title="Confirm Action" size="sm" closable={false}>
        <p>This dialog cannot be dismissed by clicking outside or pressing Escape.</p>
        <div
          style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}
        >
          <Button variant="ghost" onClick={() => setOpenNc(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => setOpenNc(false)}>
            Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
