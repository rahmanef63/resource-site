# dashboard-three-column

Superspace flagship layout. Left tree / main content / right inspector. Resizable, collapsible, mobile drawer fallback.

## Source

`template-base/frontend/shared/ui/layout/container/three-column/`

## Composition

```tsx
// app/dashboard/<feature>/page.tsx
"use client";
import { ThreeColumnLayout } from "@/frontend/shared/ui/layout/container/three-column/ThreeColumnLayout";

export default function FeaturePage() {
  return (
    <ThreeColumnLayout
      preset="database"
      left={<FeatureSidebar />}
      center={<MainContent />}
      right={<InspectorPanel />}
      leftWidth={280}
      rightWidth={400}
      spaceDistribution="right-priority"
      collapsibleLeft
      collapsibleRight
      persistCollapseState={`feature-${id}`}
    />
  );
}
```

## Responsive

- `>1024px`: 3 columns visible, resizable
- `768–1024px`: right collapses → 2-col + drawer toggle
- `<768px`: stack to 1 column, left/right as drawers (`MobileInspectorDrawer`)

## Presets

`presets.ts` defines width presets per use-case (database, contacts, knowledge, etc).

## When to use

- Apps with hierarchical nav + main + properties (database, file explorer, CMS, task manager)
- Power-user UIs

## Wrapped by

`DesktopDashboardShell` (sidebar + header) — usually mounted via `app/dashboard/layout.tsx`.
