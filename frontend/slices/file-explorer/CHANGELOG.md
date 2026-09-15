# Changelog — file-explorer

## 1.7.0 — 2026-09-15

- Added native Svelte 5/SvelteKit File Explorer with CRUD/clipboard/trash, upload/drop, preview, properties, history/breadcrumbs, grid/list sorting, multi-select, and optional tool registration.
- Extracted framework-neutral `history-core`, `ops-core`, and `file-kinds`; React history now delegates to the shared observable core.
- `fileExplorerTools` is now a self-contained structural tool collection; React uses the narrow shared agent hook while Svelte carries no agent runtime.
- Declared React-only shared FilePicker/agent-hook closure explicitly; Svelte installs only the adapter/core files it uses.

## 1.4.1 — 2026-06-10

- Host wiring: `ExplorerView` self-registers `fileExplorerTools` bound to the live `useFiles()` state via `useAgentTools`.

## 1.4.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `fileExplorerTools` exports 8
  function-calling tools for the shared agent kit (`@/shared/agentic`).
  The slice is NOT an agent — register the collection with a host agent
  (e.g. assistant's `registerAssistantTools(fileExplorerTools, () => ctx)`);
  one agent drives many slices. Contract now declares `provides.tools`.
