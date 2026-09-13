# System Monitor

Host telemetry dashboard with React/Next kept as the default distribution and a
native Svelte 5/SvelteKit distribution over one injected telemetry/history core.

```bash
npx rr add system-monitor
npx rr add system-monitor --framework sveltekit
```

With no host wiring, the bundled wavy mock renders a live dashboard. Inject real
telemetry with:

```ts
configureSysmon({ mode: "live", stats, processes });
```

The framework-neutral core owns the stable telemetry API, zero-backend mock,
1.5-second polling, ~40-point CPU/network history, GPU mock walk, process rows,
manual refresh, and stale-write cleanup. React's `useStatsHistory` is a thin
adapter; Svelte exposes an equivalent readable store.

Both UIs preserve CPU/memory/disk/GPU gauges, CPU/network sparklines, process
status/CPU/memory readouts, and pane-width reflow to compact touch rows at
≤440px. Agent tools stay read-only and consume the same injected telemetry API.

`systemMonitorApp` is intentionally React/appshell-specific. Svelte consumers
mount `SystemMonitor` directly; no fake cross-framework app descriptor is
invented.
