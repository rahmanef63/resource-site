# quicklinks changelog

## 1.0.0 — 2026-06-10

- Lifted from os-vps (Topside). Self-contained host seam (`lib/host.ts`):
  injectable `QuicklinksStore` with a localStorage-backed default
  (seeded demo links) + `createMemoryStore`; `faviconUrl` via the Google s2
  host; raw `<button>` tiles → shadcn `Button`; slice-local @container
  AppFrame shim (grid reflows by pane width).
