# code-editor changelog

## 1.2.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `codeEditorTools` exports 9
  function-calling tools for the shared agent kit (`@/shared/agentic`).
  The slice is NOT an agent — register the collection with a host agent
  (e.g. assistant's `registerAssistantTools(codeEditorTools, () => ctx)`);
  one agent drives many slices. Contract now declares `provides.tools`.

## 1.1.0 — 2026-06-10

- Merged upstream (os-vps) touch-target pass: tab close buttons and the
  explorer toggle get a 36px hit area on coarse pointers
  (`[@media(pointer:coarse)]:size-9`); glyph sizes unchanged.
- file-tree `loadKey` now uses the `\x00` escape sequence in source (the
  previous copy embedded a literal NUL byte, making the file binary).
- Seed data de-personalized (`name: "ada"`), matching upstream.
- Meta: added missing `textarea` to shadcn deps; manifest `files` now lists
  the exact slice tree + `imports` (shared ui paths / external npm).

## 1.0.0 — 2026-06-06

- Lifted from os-vps (Topside). Self-contained host seam (`lib/host.ts`):
  injectable `CodeFsAdapter` (list/read/write/mkdir) with a writable
  in-memory mock (`createMockFs`, seeded sample tree); inspector bus inert.
- Bundled the shared file-tree (lazy per-dir explorer) into the slice;
  slice-local AppSidebar (rail ⇄ Sheet) + FormDrawer (dialog ⇄ drawer) shims.
