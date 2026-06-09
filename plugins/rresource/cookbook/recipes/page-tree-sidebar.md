# Recipe — Page Tree Sidebar

> **Portability tier:** M
> **Origin source:** notion-page-clone (`~/projects/notion-page-clone/src/slices/workspace-sidebar/`)

## Tujuan

Hierarchical workspace sidebar with @dnd-kit drag-drop reordering, favorites, recents.

## Files

frontend/slices/notion/slices/workspace-sidebar/components/WorkspaceSidebar.tsx
frontend/slices/notion/slices/workspace-sidebar/components/SortablePageRow.tsx

## Integration example

```tsx
import { WorkspaceSidebar } from "@/frontend/slices/notion/slices/workspace-sidebar/components/WorkspaceSidebar";

<WorkspaceSidebar />
```

## Agent recipe

Mount WorkspaceSidebar inside the left slot of <ThreeColumnLayout>. State backed by Zustand store at frontend/slices/notion/shared/lib/store.tsx.

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
