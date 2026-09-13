# Command Menu — Svelte 5 / SvelteKit

Native Svelte distribution for the portable command-menu contract.

- `CommandPalette.svelte`: controlled/bindable open + query state, Cmd/Ctrl-K, Escape, arrows/Enter, group visibility/filtering, MRU history and tracked selections.
- `CommandGroupList.svelte`: consumer-supplied groups with optional icon/trailing snippets.
- `SearchModal.svelte`: consumer-owned pages/databases/recents/loading callbacks with generic modal chrome.
- Shared canonical files: `lib/core.ts` and `lib/cmdkHistory.ts` from the default slice.

No React, Next, cmdk, Lucide or shadcn dependency is copied into the Svelte distribution. Use Tailwind-compatible semantic classes or replace the markup with your design system while keeping the shared core contracts.
