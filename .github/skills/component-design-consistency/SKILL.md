---
name: component-design-consistency
description: 'Design system for component consistency using glassmorphism, blur effects, and responsive layouts. Use when: building React/Next.js UI components, creating modals and overlays, ensuring mobile/desktop parity, implementing frosted glass effects, or maintaining design consistency across the application.'
argument-hint: 'Specify component type (modal, card, etc.) and target devices (both, mobile, desktop)'
---

# Component Design Consistency

## Design System Overview

A comprehensive set of design patterns and CSS utilities ensuring consistency across all components with modern glassmorphism, blur effects, and responsive design.

## When to Use

- **Building new UI components** with consistent styling
- **Creating modals, overlays, and popups** with glassmorphism
- **Designing responsive layouts** for mobile and desktop
- **Adding blur and backdrop effects** to components
- **Implementing consistent spacing, colors, and typography**
- **Maintaining design coherency** across the application

## Core Design Principles

### 1. **Glassmorphism** (Frosted Glass Effect)
Modern, elegant appearance with transparent backgrounds and blur
- Semi-transparent backgrounds
- Backdrop blur effect
- Layered elevation with shadows
- Clean, minimal aesthetic

### 2. **Blur Effects**
Strategic use of blur to create hierarchy and focus
- Content blur (4-8px) when overlays appear
- Backdrop blur (2px) for atmosphere
- Smooth transitions between blur states
- Pointer-events disabled for blurred content

### 3. **Modal & Overlay Design**
Professional popup and modal patterns
- Fixed positioning centered on screen
- Scrollable with max-height constraint
- Close button and click-to-dismiss
- Smooth animations (fade-in, slide-up)
- Responsive sizing for all devices

### 4. **Responsive Design Strategy**
- **Desktop (> 650px)**: Full-width forms, generous padding
- **Tablet (480-650px)**: Medium layouts, balanced spacing
- **Mobile (< 480px)**: Full-height modals, touch-friendly buttons

### 5. **Color & Spacing Consistency**
- Consistent color variables across components
- 0.5rem baseline grid for spacing
- Predictable padding and margins
- Clear visual hierarchy

## Design Implementation Guide

### Step 1: Choose Component Type

Select the appropriate component pattern:
- **Card Component**: Contained content with light shadow
- **Modal Component**: Full-screen overlay with backdrop
- **Popup Component**: Centered fixed overlay
- **Overlay Component**: Semi-transparent background layer

### Step 2: Define Color Variables

Use consistent, theme-aware colors:

```css
:host {
  /* Brand Colors */
  --bright-blue: oklch(51.01% 0.274 263.83);
  --electric-violet: oklch(53.18% 0.28 296.97);
  --orange-red: oklch(63.32% 0.24 31.68);

  /* Neutral Colors */
  --gray-900: oklch(19.37% 0.006 300.98);
  --gray-700: oklch(36.98% 0.014 302.71);
  --gray-400: oklch(70.9% 0.015 304.04);

  /* Semantic Colors */
  --success-bg: #dcfce7;
  --success-border: #86efac;
  --error-bg: #fee2e2;
  --error-border: #fca5a5;
}
```

See [./templates/color-variables.css](./templates/color-variables.css) for full reference.

### Step 3: Apply Glassmorphism

For frosted glass effect — the key upgrade is `saturate()` alongside `blur()`, plus an inner highlight shadow:

```css
/* Level 1: Card / Container */
.glass-component {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.7); /* ← top-edge light refraction */
}

/* Level 2: Input / Panel */
.glass-input {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px) saturate(160%);
  -webkit-backdrop-filter: blur(12px) saturate(160%);
  border: 1.5px solid rgba(255, 255, 255, 0.55);
  border-radius: 8px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.65);
}

/* Level 3: Dropdown / Overlay */
.glass-panel {
  background: rgba(255, 255, 255, 0.80);
  backdrop-filter: blur(20px) saturate(200%);
  -webkit-backdrop-filter: blur(20px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 12px;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.10),
    0 2px 8px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
}
```

**Why saturate matters:** blur alone washes out colors. `saturate(160–200%)` keeps ambient color punching through the glass, making it feel like a real surface rather than a white fog.

See [./templates/glassmorphism.css](./templates/glassmorphism.css) for all variants.

### Step 4: Implement Blur Effects

For content blur when modals appear:

```tsx
'use client'
import { useState } from 'react'

export function PageWithModal() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      {/* Apply blur class to main content when modal is open */}
      <main className={showModal ? 'blur' : ''}>
        {/* Page content */}
      </main>

      {/* Backdrop */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)} />
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-popup">
          {/* Modal content */}
        </div>
      )}
    </>
  )
}
```

```css
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px) saturate(120%);
  -webkit-backdrop-filter: blur(6px) saturate(120%);
  z-index: 999;
}

.modal-popup {
  position: fixed;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(20px) saturate(200%);
  -webkit-backdrop-filter: blur(20px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 16px;
  padding: 2rem;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
}
```

See [./templates/blur-effects.css](./templates/blur-effects.css) for complete examples.

### Step 5: Ensure Responsive Design

Mobile-first approach:

```css
/* Base mobile styles */
.component {
  width: 100%;
  padding: 1rem;
}

/* Tablet and up */
@media screen and (min-width: 480px) {
  .component {
    width: 90%;
    max-width: 600px;
    padding: 1.5rem;
  }
}

/* Desktop and up */
@media screen and (min-width: 650px) {
  .component {
    width: 100%;
    max-width: 800px;
    padding: 2rem;
  }
}
```

See [./templates/responsive-layout.css](./templates/responsive-layout.css) for patterns.

### Step 6: Test Consistency

Use the [Design Consistency Checklist](#design-consistency-checklist) below to verify:
- Colors match design tokens
- Spacing follows 0.5rem grid
- Blur transitions are smooth
- Mobile/desktop parity confirmed
- Animations align with system

## Design Consistency Checklist

### Colors & Typography
- [ ] Colors use defined CSS variables (--bright-blue, --gray-900, etc.)
- [ ] Font sizes follow hierarchy (h1: 2.5rem, h2: 1.5rem, body: 1rem)
- [ ] Font weight is consistent (normal: 400, semibold: 600, bold: 700)
- [ ] Line-height is readable (1.4-1.6 for body text)

### Spacing & Layout
- [ ] Padding/margins use 0.5rem multiples (0.5rem, 1rem, 1.5rem, 2rem)
- [ ] Gap between flex items is consistent
- [ ] Max-width constraints applied for readability
- [ ] Border radius is consistent (4px for inputs, 8px for cards, 12px for modals)

### Blur & Glass Effects
- [ ] Use `backdrop-filter: blur() saturate()` — never blur alone
- [ ] Surface levels: card=blur(16px) sat(180%), input=blur(12px) sat(160%), dropdown=blur(20px) sat(200%)
- [ ] Inner highlight: `inset 0 1px 0 rgba(255,255,255,0.65+)` on every glass surface
- [ ] Main content blur: 4px when overlay appears
- [ ] Backdrop: `blur(6px) saturate(120%)` for atmosphere
- [ ] Smooth transitions (0.3s ease)
- [ ] Z-index hierarchy: backdrop 999, popup 1000
- [ ] Pointer-events disabled on blurred content

### Modals & Overlays
- [ ] Backdrop semi-transparent (rgba(0, 0, 0, 0.5))
- [ ] Modal centered with `translate(-50%, -50%)`
- [ ] Close button ✕ in top-right corner
- [ ] Click backdrop to dismiss
- [ ] Smooth animations (fadeIn, slideUp)

### Responsive Design
- [ ] **Mobile (< 480px)**:
  - [ ] Full-width or 95% width
  - [ ] Touch-friendly button size (36px+)
  - [ ] Stack layout vertically
  - [ ] Reduced padding (1rem)
- [ ] **Tablet (480-650px)**:
  - [ ] 90% width with max-width
  - [ ] Medium padding (1.5rem)
  - [ ] Balanced spacing
- [ ] **Desktop (> 650px)**:
  - [ ] Fixed max-width (600-800px)
  - [ ] Generous padding (2rem)
  - [ ] Horizontal layouts where appropriate

## Template Examples

### Glassmorphism Card
```html
<div class="glass-card">
  <h2>Card Title</h2>
  <p>Card content with frosted glass effect</p>
</div>
```

```css
.glass-card {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  padding: 2rem;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
}
```

### Modal with Blur
```tsx
{/* In a Client Component ('use client') */}
<main className={showModal ? 'blur' : ''}>{/* Page content */}</main>
{showModal && <div className="modal-backdrop" onClick={() => setShowModal(false)} />}
{showModal && (
  <div className="modal-popup">
    <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
    <h2>Modal Title</h2>
    {/* Modal content */}
  </div>
)}
```

### Form Input with Glass
```html
<input 
  type="text" 
  class="glass-input" 
  placeholder="Enter text..."
/>
```

```css
.glass-input {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px) saturate(160%);
  -webkit-backdrop-filter: blur(12px) saturate(160%);
  border: 1.5px solid rgba(255, 255, 255, 0.55);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.65);
  transition: all 0.3s ease;
}

.glass-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.92);
  border-color: rgba(59, 130, 246, 0.6);
  box-shadow:
    0 0 0 3px rgba(59, 130, 246, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.65);
}
```

## File References

All CSS lives in `src/app/globals.css`. CSS modules are not used — apply className strings directly in JSX.

## Best Practices

1. **Maintain Visual Hierarchy**: Darker backgrounds are behind, lighter in front
2. **Consistent Blur**: Use 4px for content, 2px for backdrop
3. **Test on Devices**: Always verify mobile and desktop rendering
4. **Use Variables**: Never hardcode colors or sizes
5. **Smooth Transitions**: All state changes should animate (0.3s ease)
6. **Accessibility**: Ensure sufficient contrast (4.5:1 minimum)
7. **Performance**: Minimize blur usage (expensive operation)
8. **Touch Friendly**: Minimum 36px tap targets on mobile

## Common Patterns

### Pattern 1: Form with Modal Calendar
Used in: [Calendar Selector Component](../nextjs-component-generation)
- Responsive form container
- Calendar opens in modal with blur
- Blur on main content when modal active
- Touch-friendly on mobile

### Pattern 2: Notification/Toast
- Small frosted glass card
- Auto-dismiss or manual close
- Positioned top-right or bottom
- Smooth slide-in animation

### Pattern 3: Sidebar/Drawer
- Full-height on mobile (overlay with blur)
- Side-by-side on desktop
- Smooth slide animation
- Backdrop click to close

## Troubleshooting

### Blur not smooth?
- Check transition timing (should be 0.3s)
- Verify filter property is applied
- Ensure z-index layering is correct

### Glassmorphism looks washed out?
- Adjust background opacity (0.7-0.95 typically better)
- Increase backdrop-filter blur (8-15px for glass)
- Add subtle border with rgba white

### Responsive not working?
- Use mobile-first approach (base styles for mobile)
- Check media query breakpoints (480px, 650px)
- Test actual device sizes, not just browser resize

## Related Customizations

- **Angular Component Generation**: Scaffold components with design consistency
- **Form Styling**: Advanced form validation with glass inputs
- **Animation System**: Reusable keyframe animations
- **Color System**: Full theme customization with CSS variables
