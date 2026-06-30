# quicklinks changelog

## 1.1.0 — 2026-06-30

- Inline add + remove, so the launcher is usable standalone: an `@/components/ui/input`
  URL field plus an Add button wired to the store `add()`, and a hover/focus-reveal X
  control on each tile wired to `remove(id)`. The add row also shows in the empty state.
  Editing stays inside the existing injectable store — no admin app, permission gates, or
  convex coupling added.
- A11y: each tile button gains `title` and `aria-label` ("Open <title>"); the favicon img
  keeps `alt=""`.

## 1.0.0 — 2026-06-10

- Lifted from os-vps (Topside). Self-contained host seam (`lib/host.ts`):
  injectable `QuicklinksStore` with a localStorage-backed default
  (seeded demo links) + `createMemoryStore`; `faviconUrl` via the Google s2
  host; raw `<button>` tiles → shadcn `Button`; slice-local @container
  AppFrame shim (grid reflows by pane width).
