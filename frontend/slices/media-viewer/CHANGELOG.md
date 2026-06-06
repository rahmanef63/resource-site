# media-viewer changelog

## 1.0.0 — 2026-06-06

- Lifted from os-vps (Topside). Self-contained host seam (`lib/host.ts`):
  injectable media source (`configureMediaSource`, identity default) +
  injectable editor-handoff opener (`configureMediaOpener`, no-op default);
  inspector bus inert outside a shell.
- Offline sample gallery (inline SVG gradients, simulated A/V playback).
