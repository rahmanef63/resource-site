# Changelog — command-menu

## 0.4.0 — 2026-09-13

- Extracted framework-neutral command/search contracts and helpers for hotkey detection, group visibility/filtering, tracked command selection, label resolution, and search view state while preserving MRU persistence.
- React/Next stays the default cmdk/shadcn surface; React-only render slots now live in thin type aliases instead of the shared core.
- Added native Svelte 5/SvelteKit `CommandPalette`, `CommandGroupList`, and `SearchModal` with Cmd/Ctrl-K, Escape, arrows/Enter, MRU history, query visibility/filtering, generic search bindings, and optional icon/trailing snippets.
- Public preview now hosts canonical `preview.tsx`; default installer metadata now declares the real Lucide + shadcn Button dependencies and the stale catalog `CommandMenu` wiring was corrected.

## 0.3.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `commandMenuTools` — list_commands/search/run_command over injectable `CommandMenuCtx` (the host's command groups + runner).
