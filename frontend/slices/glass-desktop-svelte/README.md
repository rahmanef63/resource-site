# Lucent Desktop — Svelte 5 / SvelteKit

Native Svelte distribution of `glass-desktop`. It reuses the same 47-widget catalog, grid/layout core, default seed, and `LayoutStore` persistence contract as the React/Next default. The Svelte renderer provides the full desktop engine (two spaces, add/remove/resize/drag, reset, persistence and gallery) with data-driven native widget cards.

```svelte
<script lang="ts">
  import { GlassDesktop } from "@/features/glass-desktop-svelte";
</script>
<GlassDesktop brand={{ name: "Studio" }} />
```

`brand.glyph` is a text glyph in the Svelte renderer. Pass a custom `LayoutStore` to sync through your own backend.
