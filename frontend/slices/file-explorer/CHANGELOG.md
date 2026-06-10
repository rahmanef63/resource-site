# Changelog — file-explorer

## 1.4.1 — 2026-06-10

- Host wiring: `ExplorerView` self-registers `fileExplorerTools` bound to the live `useFiles()` state via `useAgentTools`.

## 1.4.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `fileExplorerTools` exports 8
  function-calling tools for the shared agent kit (`@/shared/agentic`).
  The slice is NOT an agent — register the collection with a host agent
  (e.g. assistant's `registerAssistantTools(fileExplorerTools, () => ctx)`);
  one agent drives many slices. Contract now declares `provides.tools`.
