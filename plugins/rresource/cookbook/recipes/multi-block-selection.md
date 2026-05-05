# Recipe — Multi-Block Selection

> **Portability tier:** M
> **Origin source:** notion-page-clone (`/home/rahman/projects/notion-page-clone/src/slices/block-selection/`)

## Tujuan

Marquee + click+shift selection of editor blocks with floating toolbar. Bulk actions: delete, duplicate, convert.

## Files

frontend/slices/notion/slices/block-selection/components/BlockSelectionProvider.tsx
frontend/slices/notion/slices/block-selection/components/MarqueeOverlay.tsx

## Integration example

```tsx
import { BlockSelectionProvider } from "@/frontend/slices/notion/slices/block-selection/components/BlockSelectionProvider";

<BlockSelectionProvider>
  <BlockEditor />
</BlockSelectionProvider>
```

## Agent recipe

Wrap BlockEditor with BlockSelectionProvider. The marquee overlay attaches to document; toolbar floats above the selection bounding box.

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
