# System Monitor — Svelte 5 / SvelteKit

Native Svelte telemetry dashboard over the same adapter, zero-backend mock,
rolling history, formatting, palette, and agent-tool core used by React/Next.

```bash
npx rr add system-monitor --framework sveltekit
```

Use `configureSysmon({ mode: "live", stats, processes })` to inject real host
telemetry. Without wiring, the bundled mock keeps the dashboard alive. Polling
stays at 1.5 seconds with roughly 40 CPU/network history points and manual
`refresh()` available from the exported history store.

The Svelte dashboard preserves circular CPU/memory/disk/GPU gauges, CPU/network
sparklines, wide process grid, compact ≤440px process cards, and mock/live mode.
Agent tools are exported for the host's shared agent registry; this slice does
not create its own agent or backend.
