# Recipe — Theme Preset Switcher

> **Portability tier:** M
> **Origin source:** rahmanef.com (`frontend/shared/lib/{theme-presets,preset-fonts,preset-groups}.ts` + `app/globals.css`)

## Tujuan

Runtime theme swap (colors + fonts + shadows + tracking). OKLch CSS vars per preset. Persists to localStorage + Convex.

## Files

frontend/shared/theme/theme-presets.ts
frontend/shared/ui/components/theme-preset-switcher.tsx

## Integration example

```tsx
import { ThemePresetSwitcher } from "@/frontend/shared/ui/components/theme-preset-switcher";

<ThemePresetSwitcher />
```

## Agent recipe

Add a new preset by appending a CSS block in app/globals.css with [data-theme="<name>"], then register in preset-groups.ts.

## Schema / npm / env

Recipe-specific. Read source files for exact requirements. Most
notion-page-clone recipes need:
- Convex schema additions (pages, blocks, comments, databaseRows)
- @dnd-kit/core + @dnd-kit/sortable for dnd recipes
- Zustand store at frontend/slices/notion/shared/lib/store.tsx

## Common breakage

- Vite→Next port issues: missing `"use client"` markers, route param
  shape (`[slug]` vs `:slug`), Convex API surface rename.
- Path aliases mismatch — fix `tsconfig.json` once.
