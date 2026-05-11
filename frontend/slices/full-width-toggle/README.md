# `full-width-toggle` slice

Page-container width preference with three modes:

| Mode | Tailwind | Use |
|---|---|---|
| `contained` | `max-w-7xl mx-auto` | Default; reading-comfortable |
| `wide` | `max-w-screen-2xl mx-auto` | Dense dashboards |
| `full` | `w-full` | Data tables, edge-to-edge layouts |

Persists to `localStorage` (`layout:widthMode`) + cross-tab sync.

## Files

```
frontend/slices/full-width-toggle/
├── slice.json
├── README.md
├── index.ts
├── lib/use-full-width.ts          # hook + widthClass helper
└── components/
    ├── FullWidthToggle.tsx        # button (icon / button / segment variants)
    └── WidthContainer.tsx         # wrapper that applies the current width
```

## Usage

### Wrap your page

```tsx
import { WidthContainer } from "@/features/full-width-toggle";

export default function DashboardPage() {
  return (
    <WidthContainer as="main">
      <Heading />
      <Charts />
    </WidthContainer>
  );
}
```

### Put the toggle in your topbar

```tsx
import { FullWidthToggle } from "@/features/full-width-toggle";

<header>
  …
  <FullWidthToggle variant="icon" />
</header>
```

Variants:

- `variant="icon"` — single icon button, cycles modes (default)
- `variant="button"` — labeled button, cycles modes
- `variant="segment"` — 3-segment switch — recommended for Settings page

### Force a width per route

Marketing pages should stay contained even if the user toggled global to full:

```tsx
<WidthContainer force="contained">
  <MarketingHero />
</WidthContainer>
```

### Read the current mode directly

```tsx
import { useFullWidth, widthClass } from "@/features/full-width-toggle";

const [mode, setMode] = useFullWidth();
<div className={widthClass(mode)}>…</div>
```

## SSR safety

Hook returns `"contained"` during SSR / before hydration to avoid hydration mismatch. The effective layout swaps in once the client mounts. For zero-flash, add a tiny inline script in `<head>` that sets `document.documentElement.dataset.width` from localStorage and use a CSS attribute selector — but for most apps the post-hydration swap is invisible.

## Deps

- shadcn `button`
- `lucide-react` icons (already in stock kitab)

No Convex tables, no env vars, no install.
