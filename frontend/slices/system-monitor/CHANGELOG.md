# system-monitor changelog

## 1.2.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `systemMonitorTools` exports 2
  function-calling tools for the shared agent kit (`@/shared/agentic`).
  The slice is NOT an agent — register the collection with a host agent
  (e.g. assistant's `registerAssistantTools(systemMonitorTools, () => ctx)`);
  one agent drives many slices. Contract now declares `provides.tools`.

## 1.1.0 — 2026-06-10

- Ported from os-vps (Topside): process list now reflows by pane width — wide
  panes keep the PID/status/CPU/mem grid table, compact panes (≤440px
  container) render two-line touch cards; loading state gains a spinner.
- `host-frame.tsx` shim grows a slice-local `TouchList` (≥44px rows on coarse
  pointers via a CSS pointer media query — no shell ResponsiveProvider needed).
- `lib/format.ts` adds `fmtUptime` (parity with the upstream shared formatter
  set; uptime is milliseconds → "Nd Nh").

## 1.0.0 — 2026-06-06

- Lifted from os-vps (Topside). Self-contained host seam (`lib/host.ts`):
  injectable `SysMonAdapter` (stats/processes) with a wavy in-browser mock;
  inspector bus inert; slice-local @container AppFrame shim.
