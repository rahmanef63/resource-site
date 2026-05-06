# Recipe: command-palette

Cmd+K modal: search + quick actions. Source: notion-page-clone command-palette OR superspace `frontend/shared/foundation/utils/system/command-menu/`.

Two implementations available:

| Impl | File | Best for |
|---|---|---|
| superspace | `template-base/frontend/shared/foundation/utils/system/command-menu/components.tsx` | apps with feature registry — auto-builds Go-to-Feature commands |
| notion | `template-base/frontend/slices/notion/slices/command-palette/` | doc-centric apps — searches pages + databases + commands |

## Pattern

- `Ctrl+K` / `Cmd+K` opens modal (CommandDialog from shadcn `cmdk`)
- Filter as user types
- Group by section: Pages / Favorites / Recents / Commands / Workspaces / Theme
- Click or Enter → run action

## Custom commands

Register via `actions` prop or via `frontend/shared/foundation/utils/registry/command-registry`.
