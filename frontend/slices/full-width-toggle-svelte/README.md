# full-width-toggle — Svelte 5 / SvelteKit

Install this distribution with:

```sh
npx rr add full-width-toggle --framework sveltekit
```

The default `npx rr add full-width-toggle` remains the canonical React/Next distribution. This Svelte variant preserves the same width modes, storage key, hydration-safe default, same-tab notification, and cross-tab `storage` synchronization.

```svelte
<script lang="ts">
  import { FullWidthToggle, WidthContainer } from "$lib/slices/full-width-toggle";
</script>

<header class="flex justify-end">
  <FullWidthToggle variant="segment" />
</header>

<WidthContainer as="main">
  <slot />
</WidthContainer>
```

## Modes

| Mode | Tailwind | Use |
|---|---|---|
| `contained` | `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8` | Default; reading-comfortable |
| `wide` | `mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8` | Dense dashboards |
| `full` | `w-full px-4 sm:px-6 lg:px-8` | Data tables, edge-to-edge layouts |

## Persistence contract

- Storage key: `layout:widthMode`
- Invalid or missing values fall back to `contained`
- `FullWidthToggle` writes localStorage and dispatches a same-tab `storage` event
- `FullWidthToggle` and `WidthContainer` both listen for `storage` events, so another tab or another component instance updates immediately
