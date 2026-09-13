# Theme Presets — Svelte 5 / SvelteKit

Native Svelte provider + switcher over the same tweakcn registry, CSS-injection,
persistence, default-resolution, grouping, swatches, and agent tools used by the
default React/Next distribution.

```bash
npx rr add theme-presets --framework sveltekit
```

`ThemePresetProvider` owns preset + display-mode context. Preset state resolves
visitor choice → site default → host default through the shared core. Display
mode uses the Svelte distribution's browser adapter (`light | dark | system`)
instead of React-only `next-themes`.

The host may inject its own `presetStore` and/or `modeStore`. `SaveSiteDefaultButton`
remains props-driven; persistence of the owner-wide default stays host-owned.

## Tailwind 4 globals contract

Runtime presets write complete CSS color values (including OKLCH). Keep Tailwind
mappings format-agnostic, for example:

```css
@theme inline { --color-background: var(--background); }
:root { --background: hsl(0 0% 100%); }
```

Do not wrap `var(--background)` in `hsl(...)` inside `@theme inline`, otherwise
OKLCH preset values become invalid at runtime.
