# Recipe: block-editor

Notion-style contenteditable block editor. Source: notion-page-clone.

Already copied into `template-base/frontend/slices/notion/slices/editor/` — see `frontend/slices/notion/PORT-NOTION.md` for the Vite→Next.js port checklist.

## Standalone use

To use ONLY the block editor (without other notion slices):

```bash
cp -r template-base/frontend/slices/notion/slices/editor frontend/slices/block-editor
cp -r template-base/frontend/slices/notion/shared/{components,lib,types} frontend/slices/block-editor/_shared
# Adjust @notion/* imports → relative or @/frontend/slices/block-editor/*
```

## Block types (21)

paragraph, h1, h2, h3, todo, bullet, numbered, toggle, columns2, columns3, quote, callout, code, equation, image, divider, page, database, table, embed, button.

## Slash menu

`/` in empty block → filtered command palette → Enter to convert block type.

## Markdown shortcuts

`# `, `- `, `1. ` etc. trigger inline conversion via `lib/markdownTriggers.ts`.

## Persistence

Each block update calls `useMutation(api.pages.patchBlocks)`. Real-time via Convex subscription.
