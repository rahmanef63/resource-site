# Recipe — Threaded Comments

> **Portability tier:** L
> **Origin source:** notion-page-clone (`~/projects/notion-page-clone/src/slices/comments/`)

## Tujuan

Page + block-level threaded comments with resolved state. Real-time via Convex.

## Files

frontend/slices/notion/slices/comments/components/BlockCommentsPopover.tsx
frontend/slices/notion/slices/comments/hooks/useComments.ts

## Integration example

```tsx
import { BlockCommentsPopover } from "@/frontend/slices/notion/slices/comments/components/BlockCommentsPopover";

<BlockCommentsPopover blockId={blockId} pageId={pageId} />
```

## Agent recipe

Anchor comments by passing pageId (always) and optional blockId. Use useComments(blockId) hook for the reactive list.

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
