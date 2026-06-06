# empty-states — Empty States

One configurable `EmptyState` component plus per-kind presets, composed on top
of the shadcn `Empty` primitive. Six built-in kinds ship a sensible default
icon, title, and description; every slot is overridable via props. A full-page
`ErrorPage` wrapper drops straight into `app/not-found.tsx` and `app/error.tsx`.

## Install

```bash
npx rahman-resources add empty-states
# alias: npx rr add empty-states
```

Requires the shadcn `empty` and `button` primitives:

```bash
npx shadcn@latest add empty button
```

## Usage

```tsx
import { EmptyState } from "@/features/empty-states";

// Preset kind — default icon/title/description
<EmptyState kind="no-results" primaryAction={{ label: "Clear filters", onClick: reset }} />

// Override any slot
<EmptyState
  kind="empty-list"
  title="No invoices"
  description="Invoices you create will appear here."
  primaryAction={{ label: "New invoice", href: "/invoices/new" }}
  secondaryAction={{ label: "Import", onClick: openImport }}
  compact
/>
```

### Kinds

`"404" | "500" | "403" | "no-results" | "empty-list" | "first-use"`

### Actions

`primaryAction` / `secondaryAction` accept `{ label, href?, onClick? }`. When
`href` is set the action renders as `<Button asChild><a href>` (consumer-routed —
swap the anchor for `next/link` if you prefer). Otherwise it renders a button
with `onClick`.

## Drop-in: `app/not-found.tsx`

```tsx
import { ErrorPage } from "@/slices/empty-states";

export default function NotFound() {
  return (
    <ErrorPage
      kind="404"
      primaryAction={{ label: "Back home", href: "/" }}
    />
  );
}
```

## Drop-in: `app/error.tsx`

```tsx
"use client";

import { ErrorPage } from "@/slices/empty-states";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPage
      kind="500"
      description={error.message || undefined}
      primaryAction={{ label: "Try again", onClick: reset }}
      secondaryAction={{ label: "Back home", href: "/" }}
    />
  );
}
```

## Rules of engagement

- shadcn-only UI primitives. No raw `<button>` / `<dialog>`.
- 200-line hard cap per source file.
- Slice imports resolve via `@/components/ui/*`, `@/lib/utils`, or relative
  within-slice only.
