# `command-menu` slice — facade

Global ⌘K command palette. Mount once at the app shell level; listens for
`Cmd+K` / `Ctrl+K` globally.

The canonical implementation lives at
`frontend/shared/foundation/utils/system/command-menu/` — this slice is a
facade so the registry / builder / CLI list it alongside other features.

## Usage

```tsx
import { CommandMenu, type CommandAction } from "@/features/command-menu";

const actions: CommandAction[] = [
  { id: "new-post", label: "New post", icon: "Plus", onSelect: () => router.push("/posts/new") },
  { id: "search", label: "Search", icon: "Search", onSelect: openSearch },
];

<CommandMenu actions={actions} />
```

Auto-builds entries from your feature registry (`defineFeature`) plus
the `actions` prop. Fuzzy search via `cmdk`.

## Deps

- `cmdk` (npm)
- shadcn `command`, `dialog`
