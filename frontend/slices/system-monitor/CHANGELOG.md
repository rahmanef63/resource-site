# system-monitor changelog

## 1.0.0 — 2026-06-06

- Lifted from os-vps (Topside). Self-contained host seam (`lib/host.ts`):
  injectable `SysMonAdapter` (stats/processes) with a wavy in-browser mock;
  inspector bus inert; slice-local @container AppFrame shim.
