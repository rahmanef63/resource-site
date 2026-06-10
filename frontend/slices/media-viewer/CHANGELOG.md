# media-viewer changelog

## 1.2.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `mediaViewerTools` exports 4
  function-calling tools for the shared agent kit (`@/shared/agentic`).
  The slice is NOT an agent — register the collection with a host agent
  (e.g. assistant's `registerAssistantTools(mediaViewerTools, () => ctx)`);
  one agent drives many slices. Contract now declares `provides.tools`.

## 1.1.0 — 2026-06-10

- Merged upstream (os-vps Phase E responsive sweep): slice-local `AppFrame`
  scaffold (`components/app-frame.tsx`, CSS `@container` + safe-area body,
  header owns the bottom border) now wraps both the sample gallery and the
  remote view.
- Container-query responsive toolbar: in compact panes (`@max-[480px]`) the
  title takes its own row, controls wrap underneath with larger touch targets
  (size-8) and the vertical separators hide.
- Media stage padding scales with pane width (`p-3 @md:p-6`).

## 1.0.0 — 2026-06-06

- Lifted from os-vps (Topside). Self-contained host seam (`lib/host.ts`):
  injectable media source (`configureMediaSource`, identity default) +
  injectable editor-handoff opener (`configureMediaOpener`, no-op default);
  inspector bus inert outside a shell.
- Offline sample gallery (inline SVG gradients, simulated A/V playback).
