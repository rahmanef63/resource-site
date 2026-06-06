# code-editor changelog

## 1.0.0 — 2026-06-06

- Lifted from os-vps (Topside). Self-contained host seam (`lib/host.ts`):
  injectable `CodeFsAdapter` (list/read/write/mkdir) with a writable
  in-memory mock (`createMockFs`, seeded sample tree); inspector bus inert.
- Bundled the shared file-tree (lazy per-dir explorer) into the slice;
  slice-local AppSidebar (rail ⇄ Sheet) + FormDrawer (dialog ⇄ drawer) shims.
