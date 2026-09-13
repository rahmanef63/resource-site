# quicklinks — Svelte 5 / SvelteKit distribution

Native Svelte grid for the canonical `quicklinks` slice. It shares the exact
framework-neutral store + URL helper core from `frontend/slices/quicklinks/lib/core.ts`.
React remains the default distribution.

```svelte
<script lang="ts">
  import { QuicklinksApp, configureQuicklinks } from "@/features/quicklinks-svelte";

  // Optional: inject your own store before the component mounts.
  // configureQuicklinks(hostStore);
</script>

<QuicklinksApp />
```

The bundled default store is SSR-safe: seed links render first and localStorage
is restored only after mount. Tiles use the same Google s2 favicon helper and
open with `noopener,noreferrer` semantics as the React distribution.
