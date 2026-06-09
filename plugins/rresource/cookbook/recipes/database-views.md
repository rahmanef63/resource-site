# Recipe — Database Views (11 types)

> **Portability tier:** L
> **Origin source:** notion-page-clone (`~/projects/notion-page-clone/src/slices/databases/`)

## Tujuan

Properties+rows database with 11 view types: table, board, calendar, timeline, chart, gallery, map. Per-view filter/sort/group.

## Files

frontend/slices/notion/slices/databases/DatabaseBlock.tsx
frontend/slices/notion/slices/databases/views/TableView.tsx
frontend/slices/notion/slices/databases/views/BoardView.tsx

## Integration example

```tsx
import { DatabaseBlock } from "@/frontend/slices/notion/slices/databases/DatabaseBlock";

<DatabaseBlock databaseId={dbId} />
```

## Agent recipe

DatabaseBlock auto-routes to the active view component. Add custom property types by extending PropertyCell.tsx.

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
