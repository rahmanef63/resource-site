# `full-width-toggle` slice

Page-container width preference with three modes:

| Mode | Tailwind | Use |
|---|---|---|
| `contained` | `max-w-7xl mx-auto` | Default; reading-comfortable |
| `wide` | `max-w-screen-2xl mx-auto` | Dense dashboards |
| `full` | `w-full` | Data tables, edge-to-edge layouts |

Persists to per-device `localStorage` (`layout:widthMode`) + same-tab and cross-tab sync. React/Next remains the default install; pass `--framework sveltekit` (or `svelte`) for the additive Svelte 5 distribution.

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

frontend/slices/full-width-toggle-svelte/
├── index.ts
├── lib/width-mode.ts              # same storage key, mode helpers, classes
└── components/
    ├── FullWidthToggle.svelte     # native button/SVG variant controls
    └── WidthContainer.svelte      # Svelte wrapper with storage sync
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
- `lucide-react` icons

No Convex tables or env vars.

## Svelte / SvelteKit

```sh
npx rr add full-width-toggle --framework sveltekit
```

```svelte
<script lang="ts">
  import { FullWidthToggle, WidthContainer } from "$lib/slices/full-width-toggle";
</script>

<FullWidthToggle variant="segment" />
<WidthContainer as="main">
  <slot />
</WidthContainer>
```

The Svelte distribution uses the same `layout:widthMode` key and mode classes as React. It intentionally avoids React, shadcn, and lucide dependencies; only `svelte@^5` is required.
