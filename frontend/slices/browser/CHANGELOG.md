# browser changelog

## 1.2.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `browserTools` exports 11
  function-calling tools for the shared agent kit (`@/shared/agentic`).
  The slice is NOT an agent — register the collection with a host agent
  (e.g. assistant's `registerAssistantTools(browserTools, () => ctx)`);
  one agent drives many slices. Contract now declares `provides.tools`.

## 1.1.0 — 2026-06-10

- Ported the os-vps multitab upgrade: Chrome-style tab strip (`tab-bar.tsx`,
  each UI tab = its own remote page via a `ui-<id>` consumer id), AI
  agent-activity side panel (`ai-panel.tsx`, shadcn Sheet), mock-mode notice
  (`mock-pane.tsx`), live screencast consumer (`lib/use-screencast.ts`,
  multipart-JPEG parser with poll fallback), save-screenshot action + live/
  polling badge in `remote-view.tsx`, compact-pane omnibar (Forward/Home fold
  into the menu under 480px), and the adaptive-poll multitab
  `use-remote-browser.ts`.
- `BrowserAdapter` is now per-tab: `state/screenshot/act` take a `tab` id and
  the adapter grew `close`, `agentLog`, `saveShot`. `configureBrowser` merges
  partial adapters over the demo defaults, so the optional methods can be
  omitted. New seams: `configureScreencast(tab => url|null)` for a real MJPEG
  stream (default null = poll only) and `configureBrowserMode()` for hosts
  with a mock/live server setting (default: live, demo renderer).
- Demo adapter moved to `lib/demo-browser.ts` and extended: per-tab fake pages,
  an in-memory action log (seeded with a canned agent session, then recording
  your own actions) feeding the AI panel, and a fake save-shot path — the whole
  chrome still works with zero backend.
- Skipped on purpose: `next/image` favicons (kept plain `<img>` — no
  remotePatterns demand on consumers) and the os-vps AppFrame/`@/features/
  os-shell` wiring (replaced with an inline `@container` scaffold; raw
  `<button>`s in the ported tab strip / save-shot chip became shadcn Buttons).
- shadcn deps + contract: added `sheet`; barrel now also exports
  `configureBrowserMode`, `configureScreencast`, and the `AgentLogEntry` /
  `BrowserMode` types.

## 1.0.0 — 2026-06-06

- Lifted from os-vps (Topside). Self-contained host seam (`lib/host.ts`):
  injectable `BrowserAdapter` (state/screenshot/act) with an offline canvas
  demo renderer; favicons use a plain img (no remotePatterns requirement);
  inspector bus inert.
