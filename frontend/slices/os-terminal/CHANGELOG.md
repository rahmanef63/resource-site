# os-terminal changelog

## 1.0.0 — 2026-06-06

- Lifted from os-vps (Topside). Self-contained host seam (`lib/host.ts`):
  injectable `TerminalOsApi` (fs surface + one-shot exec) — mock mode runs
  entirely on the slice's in-memory FsModel; inspector bus inert.
