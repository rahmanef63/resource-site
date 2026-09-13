# quicklinks changelog

## 1.1.0 — 2026-09-13

- Split store/URL/favicon/open behavior into framework-neutral `lib/core.ts`.
- React keeps the existing hook + appshell descriptor as the default distribution.
- Added a native Svelte 5/SvelteKit grid + subscribable adapter that reuses the same core through verified `sharedFiles`.
- Added focused core/store tests for URL normalization, favicon lookup, injected store updates, and `noopener,noreferrer` opening.

## 1.0.0 — 2026-06-10

- Lifted from os-vps (Topside). Self-contained host seam (`lib/host.ts`):
  injectable `QuicklinksStore` with a localStorage-backed default
  (seeded demo links) + `createMemoryStore`; `faviconUrl` via the Google s2
  host; raw `<button>` tiles → shadcn `Button`; slice-local @container
  AppFrame shim (grid reflows by pane width).
