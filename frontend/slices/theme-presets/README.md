# Theme Presets

Runtime tweakcn color presets with React/Next kept as the default distribution
and a native Svelte 5/SvelteKit distribution over one shared preset engine.

## Install

```bash
# React / Next
npx rr add theme-presets

# Svelte 5 / SvelteKit
npx rr add theme-presets --framework sveltekit
```

Both distributions share the bundled `registry-data.json`, CSS-variable
injection, persistence, grouping, swatches, preview/restore behavior, agent
tools, and preset resolution order:

1. Visitor explicit choice
2. Site-wide default
3. Host/template default

React display mode remains powered by `next-themes`. The Svelte distribution
ships a browser-native light/dark/system mode store instead, so Svelte does not
pull React, Next, `next-themes`, Lucide, or shadcn.

`SaveSiteDefaultButton` stays props-driven: the host persists the owner-wide
default through `onSave`. `ThemeColorSync` keeps browser theme-color metadata in
sync with the active palette.

## Tailwind 4 globals contract

Runtime presets may contain OKLCH values. Keep Tailwind mappings
format-agnostic:

```css
@theme inline { --color-background: var(--background); }
:root { --background: hsl(0 0% 100%); }
```

Do not use `hsl(var(--background))` inside `@theme inline`; that makes OKLCH
runtime values invalid.
