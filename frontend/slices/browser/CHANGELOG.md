# browser changelog

## 1.0.0 — 2026-06-06

- Lifted from os-vps (Topside). Self-contained host seam (`lib/host.ts`):
  injectable `BrowserAdapter` (state/screenshot/act) with an offline canvas
  demo renderer; favicons use a plain img (no remotePatterns requirement);
  inspector bus inert.
