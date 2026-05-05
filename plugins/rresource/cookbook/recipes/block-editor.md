# Recipe — Notion-Style Block Editor

> **Portability tier:** L
> **Origin source:** notion-page-clone (`/home/rahman/projects/notion-page-clone/src/slices/editor/`)

## Tujuan

21-block contenteditable editor with slash command menu, markdown shortcuts, drag handles. Real-time via Convex.

## Files

frontend/slices/notion/slices/editor/BlockEditor.tsx
frontend/slices/notion/slices/editor/SlashMenu.tsx
frontend/slices/notion/slices/editor/blockSpecs.ts

## Integration example

```tsx
import { BlockEditor } from "@/frontend/slices/notion/slices/editor/BlockEditor";

<BlockEditor pageId={pageId} />
```

## Agent recipe

Already copied at frontend/slices/notion/slices/editor/. See PORT-NOTION.md for Vite→Next port checklist (routing rewrite, use-client markers, Convex API surface rename).

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
