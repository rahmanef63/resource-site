# Recipe — Command Palette (⌘K)

> **Portability tier:** M
> **Origin source:** kitab-core + notion-page-clone (private)

## Tujuan

Cmd+K modal: feature navigation, workspace switching, theme, sign-out, custom commands. Auto-builds from feature registry.

## Files

frontend/shared/foundation/utils/system/command-menu/components.tsx

## Integration example

```tsx
import { CommandMenu } from "@/frontend/shared/foundation/utils/system/command-menu/components";

<CommandMenu actions={customActions} />
```

## Agent recipe

Mount CommandMenu once at the app shell level. It listens for Cmd+K globally. Pass extra commands via the actions prop or register via the command-registry.

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
