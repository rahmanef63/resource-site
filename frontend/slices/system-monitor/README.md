# system-monitor — host telemetry dashboard

Activity-Monitor-style dashboard: circular CPU / RAM / disk / GPU gauges,
rolling CPU + network sparklines (glass panels), live process table.
Polls every 1.5s with a ~40-point history. The process list reflows by pane
width: wide panes get the grid table, compact panes (≤440px container) get
two-line touch cards with ≥44px rows on coarse pointers.

## Mount

```tsx
import { SystemMonitor } from "@/features/system-monitor";

// Zero wiring → wavy in-browser mock telemetry (the dashboard looks alive)
<SystemMonitor />
```

Or hand `systemMonitorApp` (lazy `load`) to an appshell-style launcher.

## Host seam (`lib/host.ts`)

```ts
import { configureSysmon } from "@/features/system-monitor";

configureSysmon({
  mode: "live",
  stats: () => fetch("/api/sys/stats").then((r) => r.json()),
  // → { cpu:{pct,cores}, mem:{used,total}, disk:{used,total}, net?:{rx,tx}, uptime }
  processes: () => fetch("/api/sys/processes").then((r) => r.json()),
  // → [{ pid, name, status, cpu, mem }]
});
```

Everything else in the slice imports ONLY this seam.
