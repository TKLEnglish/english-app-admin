---
name: nextjs-component-generation
description: 'Generate Next.js components using App Router, React functional components, Server vs Client components, hooks, and SSR-safe patterns. Use when: creating new feature components, building reusable UI components, setting up container/presentational patterns, adding routable pages, or integrating React hooks for state and effects.'
argument-hint: 'Specify component type, name, and features (e.g., "client button component with useState" or "server user-profile page component")'
---

# Next.js Component Generation

## When to Use

- **New page components** under `src/app/*/page.tsx`
- **Reusable UI components** in `src/components/*/` 
- **Server Components** for static or data-fetching content
- **Client Components** for interactive, stateful UI
- **Layout components** wrapping children in shared chrome
- **SSR-aware components** that work on both server and client

## Component Types

### 1. **Server Component** (Default)
No `'use client'` directive. Runs only on the server (or statically at build time).
- Cannot use `useState`, `useEffect`, `useRef`, or browser APIs
- Can `async/await` and fetch data directly
- Ideal for layout, static content, and SEO-critical pages

### 2. **Client Component**
Add `'use client'` as the very first line.
- Required for: `useState`, `useEffect`, `useRef`, event handlers, browser APIs
- Rendered on the server first (SSR), then hydrated on the client
- Keep client components as leaf nodes when possible

### 3. **Presentational (Dumb) Component**
Pure UI — receives all data via props, emits events via callback props.
- Can be Server or Client depending on interactivity needs
- No direct data fetching or global state
- Highly reusable and easy to test

### 4. **Container (Smart) Component**
Manages data fetching, state, and passes down to presentational children.
- Often a `page.tsx` or a wrapper component
- Uses hooks (`useState`, `useEffect`, `useMemo`) for state
- Server Components can `fetch()` directly; Client ones use hooks/SWR

## Generation Procedure

### Step 1: Gather Requirements

Determine:
- **Name** (PascalCase for component files: `UserProfile.tsx`)
- **Location**: Page (`src/app/users/page.tsx`) or shared (`src/components/user-profile/UserProfile.tsx`)
- **Server or Client**: Does it need interactivity (state, events)?
- **Props**: What data does parent pass in?

### Step 2: Create the File

File naming pattern:
```
src/components/<name>/<Name>.tsx  ← shared component
src/app/<route>/page.tsx          ← routable page
src/app/<route>/layout.tsx        ← route layout
```

### Step 3: Choose Template

#### Server Component (no interactivity)
```tsx
// src/components/user-card/UserCard.tsx
import React from 'react'

interface UserCardProps {
  name: string
  email: string
  role?: string
}

export function UserCard({ name, email, role = 'Viewer' }: UserCardProps) {
  return (
    <div className="user-card">
      <h3>{name}</h3>
      <p>{email}</p>
      <span className="badge">{role}</span>
    </div>
  )
}
```

#### Client Component (with state and events)
```tsx
'use client'
import { useState } from 'react'

interface CounterProps {
  initial?: number
  onCountChange?: (count: number) => void
}

export function Counter({ initial = 0, onCountChange }: CounterProps) {
  const [count, setCount] = useState(initial)

  function increment() {
    const next = count + 1
    setCount(next)
    onCountChange?.(next)
  }

  return (
    <button className="btn-primary" onClick={increment}>
      Count: {count}
    </button>
  )
}
```

#### Page Component (App Router)
```tsx
// src/app/users/page.tsx
import { UserCard } from '@/components/user-card/UserCard'

const USERS = [
  { id: 1, name: 'Alice', email: 'alice@example.com', role: 'Admin' },
]

export default function UsersPage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Users</h1>
      </header>
      <section className="demo-section">
        {USERS.map(u => <UserCard key={u.id} {...u} />)}
      </section>
    </div>
  )
}
```

### Step 4: State Management with Hooks

Replace Angular signals with React hooks:

| Angular (signals) | React (hooks) |
|-------------------|---------------|
| `signal(x)` | `useState(x)` |
| `computed(() => ...)` | `useMemo(() => ..., [deps])` |
| `effect(() => ...)` | `useEffect(() => ..., [deps])` |
| `inject(ElementRef)` | `useRef<HTMLElement>(null)` |
| `@HostListener('document:click')` | `useEffect` + `document.addEventListener` |
| `@Input()` | prop in interface |
| `@Output()/EventEmitter` | callback prop (`onXxx?: (val) => void`) |
| `ng-content` | `children: React.ReactNode` |

```tsx
'use client'
import { useState, useEffect, useRef, useMemo } from 'react'

export function SearchBox({ items }: { items: string[] }) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close on outside click (replaces @HostListener('document:click'))
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  // Derived value (replaces computed)
  const filtered = useMemo(
    () => items.filter(i => i.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  return (
    <div ref={wrapperRef} className="search-wrapper">
      <input value={query} onChange={e => setQuery(e.target.value)} onFocus={() => setIsOpen(true)} />
      {isOpen && filtered.map((item, i) => <div key={i}>{item}</div>)}
    </div>
  )
}
```

### Step 5: Routing with App Router

Pages are file-system based — no route config needed:

```
src/app/
  layout.tsx        ← root layout (always rendered)
  page.tsx          ← / route
  home/
    page.tsx        ← /home route
  users/
    page.tsx        ← /users route
    [id]/
      page.tsx      ← /users/:id dynamic route
```

Use `next/link` for navigation:
```tsx
import Link from 'next/link'
<Link href="/users">View Users</Link>
```

Use `next/navigation` for programmatic navigation:
```tsx
'use client'
import { useRouter } from 'next/navigation'
const router = useRouter()
router.push('/home')
```

### Step 6: SSR Best Practices

- ✅ `'use client'` on interactive components using hooks or browser APIs
- ✅ Use `useEffect` for browser-only APIs (window, document)
- ✅ Use `next/dynamic` with `{ ssr: false }` for purely client-only libraries
- ❌ Never access `window`, `localStorage`, or DOM in Server Components
- ❌ Avoid putting `'use client'` unnecessarily — keep server components where possible

```tsx
// Safe browser API access in Client Component
'use client'
import { useEffect, useState } from 'react'

export function WindowSize() {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    setWidth(window.innerWidth)
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return <span>{width}px</span>
}
```

## Best Practices

1. **Default to Server Components** — add `'use client'` only when needed
2. **Props interface** — always define a TypeScript interface for props
3. **Named exports** — use named exports (`export function Foo`) not defaults for components (pages are the exception — they require default export)
4. **CSS in globals.css** — all styles in `src/app/globals.css`, no CSS Modules
5. **Path alias** — use `@/` to import from `src/`: `import { Foo } from '@/components/foo/Foo'`
6. **No magic strings** — use typed props (union types) for variants/sizes
7. **Keep client components lean** — lift server-renderable parts out

## Example Workflows

### Create a Reusable Button:
1. Create `src/components/button/Button.tsx`
2. Add `'use client'` (has onClick handler)
3. Define `ButtonProps` interface with `variant`, `size`, `onClick`, `children`
4. Apply className string with conditional variants
5. Import in pages as `import { Button } from '@/components/button/Button'`

### Create a Page:
1. Create `src/app/<route>/page.tsx`
2. Use `export default function <Name>Page()` (default export required for Next.js pages)
3. Import shared components with `@/` alias
4. Add `'use client'` only if the page itself manages state
5. Consider extracting stateful sections to a separate Client Component

### Create a Layout:
1. Create `src/app/layout.tsx` (or `src/app/<route>/layout.tsx`)
2. Accept `{ children }: { children: React.ReactNode }` prop
3. Wrap in shared chrome (navbar, sidebar, etc.)
4. Import `'./globals.css'` in root layout only
