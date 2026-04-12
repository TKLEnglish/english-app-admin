'use client';
import { useState } from 'react';
import { CalendarSelector } from '@/components/calendar-selector/CalendarSelector';

export default function CalendarPage() {
  const [date1, setDate1] = useState<Date | undefined>();
  const [date2, setDate2] = useState<Date | undefined>();

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Calendar</h1>
        <p className="page-description">
          Date picker with month navigation, typed entry, and keyboard support.
        </p>
      </header>

      <section className="demo-section">
        <h2 className="demo-section-title">Basic</h2>
        <div className="demo-card">
          <CalendarSelector
            label="Appointment Date"
            onChange={setDate1}
            hint="Choose a future date"
          />
          {date1 && <p className="demo-value">Selected: {date1.toDateString()}</p>}
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Sizes</h2>
        <div className="demo-card">
          <div className="demo-grid">
            <CalendarSelector label="Small" size="sm" />
            <CalendarSelector label="Medium" size="md" />
            <CalendarSelector label="Large" size="lg" />
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">States</h2>
        <div className="demo-card">
          <CalendarSelector label="With Error" validateMessage="Date is required" />
          <CalendarSelector label="Disabled" disabled />
          <CalendarSelector label="Required" required onChange={setDate2} />
        </div>
      </section>
    </div>
  );
}
