<script lang="ts">
  import { clampPct } from "../../system-monitor/lib/format";
  import type { MonitorVar } from "../../system-monitor/lib/palette";

  let {
    label,
    pct,
    sub,
    accent,
  }: {
    label: string;
    pct: number;
    sub: string;
    accent: MonitorVar;
  } = $props();

  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  let dashOffset = $derived(circumference * (1 - clampPct(pct) / 100));
</script>

<div class="flex items-center gap-3.5 rounded-xl border border-[color:var(--sep)] bg-[color:var(--glass-panel)] px-4 py-3.5">
  <div class="relative size-16 shrink-0">
    <svg viewBox="0 0 64 64" class="-rotate-90" aria-hidden="true">
      <circle cx="32" cy="32" r={radius} fill="none" stroke="var(--inset)" stroke-width="7" />
      <circle
        cx="32"
        cy="32"
        r={radius}
        fill="none"
        stroke={`var(${accent})`}
        stroke-width="7"
        stroke-linecap="round"
        stroke-dasharray={circumference}
        stroke-dashoffset={dashOffset}
        class="transition-[stroke-dashoffset] duration-700 ease-out"
      />
    </svg>
    <div class="absolute inset-0 grid place-items-center text-[15px] font-bold tabular-nums">
      {Math.round(pct)}%
    </div>
  </div>
  <div class="min-w-0">
    <div class="truncate text-sm font-bold text-foreground">{label}</div>
    <div class="mt-0.5 truncate text-[11px] text-[color:var(--text-faint)]">{sub}</div>
  </div>
</div>
