import { GlassCard } from '@/components/glass-card/GlassCard';

const cards = [
  {
    title: 'Text Field',
    description: 'Input with label, hint, validation, sizes & colors',
    route: '/ui-library/text-field',
    icon: 'Tf',
    color: 'blue' as const,
    category: 'Form Fields',
  },
  {
    title: 'Number Field',
    description: 'Masked input for integer, phone, currency & more',
    route: '/ui-library/number-field',
    icon: 'Nf',
    color: 'violet' as const,
    category: 'Form Fields',
  },
  {
    title: 'File Chooser',
    description: 'File picker with sizes, type filtering & validation',
    route: '/ui-library/file-chooser',
    icon: 'Fc',
    color: 'emerald' as const,
    category: 'Form Fields',
  },
  {
    title: 'Selector',
    description: 'Dropdown single-select with keyboard navigation',
    route: '/ui-library/selector',
    icon: 'Sf',
    color: 'emerald' as const,
    category: 'Form Fields',
  },
  {
    title: 'Calendar',
    description: 'Date picker with month navigation & typed entry',
    route: '/ui-library/calendar',
    icon: 'Ca',
    color: 'amber' as const,
    category: 'Form Fields',
  },
  {
    title: 'Autocomplete',
    description: 'Searchable single & multi-select with chip tags',
    route: '/ui-library/autocomplete',
    icon: 'Ac',
    color: 'rose' as const,
    category: 'Form Fields',
  },
  {
    title: 'Checkbox',
    description: 'Boolean toggle with sizes and validation',
    route: '/ui-library/checkbox',
    icon: 'Cb',
    color: 'blue' as const,
    category: 'Form Fields',
  },
  {
    title: 'Radio',
    description: 'Option group with horizontal & vertical layouts',
    route: '/ui-library/radio',
    icon: 'Ra',
    color: 'violet' as const,
    category: 'Form Fields',
  },
  {
    title: 'Button',
    description: 'Five variants, three sizes, loading spinner',
    route: '/ui-library/button',
    icon: 'Bt',
    color: 'emerald' as const,
    category: 'Display',
  },
  {
    title: 'Badge',
    description: 'Status labels with dot indicator, sizes and removable chips',
    route: '/ui-library/badge',
    icon: 'Bg',
    color: 'amber' as const,
    category: 'Display',
  },
  {
    title: 'Notification',
    description: 'Alert banners with four types and auto-dismiss toast',
    route: '/ui-library/notification',
    icon: 'Nt',
    color: 'rose' as const,
    category: 'Display',
  },
  {
    title: 'Dialog',
    description: 'Modal with backdrop blur, sizes & footer slot',
    route: '/ui-library/dialog',
    icon: 'Dg',
    color: 'blue' as const,
    category: 'Display',
  },
  {
    title: 'Dropdown',
    description: 'Context menu with groups, submenus & keyboard nav',
    route: '/ui-library/dropdown',
    icon: 'Dd',
    color: 'violet' as const,
    category: 'Display',
  },
  {
    title: 'Data Table',
    description: 'Sortable columns with skeleton loading state',
    route: '/ui-library/data-table',
    icon: 'Dt',
    color: 'emerald' as const,
    category: 'Display',
  },
  {
    title: 'Tooltip',
    description: 'Hover/focus tooltip with 4 placements and configurable delay',
    route: '/ui-library/tooltip',
    icon: 'Tp',
    color: 'amber' as const,
    category: 'Display',
  },
];

const categories = [...new Set(cards.map((c) => c.category))];

export default function HomePage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Component Library</h1>
        <p className="page-description">
          Glassmorphism-styled React components for building modern, polished interfaces.
        </p>
      </header>
      {categories.map((category) => (
        <section key={category} className="demo-section">
          <h2 className="demo-section-title">{category}</h2>
          <div className="home-grid">
            {cards
              .filter((c) => c.category === category)
              .map((card) => (
                <GlassCard
                  key={card.route}
                  icon={card.icon}
                  iconColor={card.color}
                  title={card.title}
                  description={card.description}
                  route={card.route}
                />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
