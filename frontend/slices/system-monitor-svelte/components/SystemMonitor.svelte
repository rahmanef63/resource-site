<script lang="ts">
  import { onMount } from "svelte";
  import GaugeGrid from "./GaugeGrid.svelte";
  import GlassPanel from "./GlassPanel.svelte";
  import ProcessTable from "./ProcessTable.svelte";
  import Sparkline from "./Sparkline.svelte";
  import { fmtMBs, fmtPct } from "../../system-monitor/lib/format";
  import { MONITOR_VARS } from "../../system-monitor/lib/palette";
  import { getSysmonApi } from "../../system-monitor/lib/core";
  import { createSvelteStatsHistoryStore, type SvelteStatsHistoryStore } from "../lib/store";

  let { store }: { store?: SvelteStatsHistoryStore } = $props();
  function initialStore() { return store ?? createSvelteStatsHistoryStore(); }
  const history = initialStore();
  const api = getSysmonApi();
  let snapshot = $state(history.getSnapshot());
  let lastNet = $derived(snapshot.netSeries[snapshot.netSeries.length - 1] ?? 0);
  const monitorStyle = Object.entries(MONITOR_VARS).map(([key, value]) => `${key}:${value}`).join(";");

  $effect(() => history.subscribe((next) => { snapshot = next; }));
  onMount(() => history.start());
</script>

<div class="monitor-frame flex h-full min-h-0 flex-col" style={monitorStyle}>
  <div class="h-full overflow-auto">
    <div class="space-y-3.5 p-4">
      <header class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-primary" aria-hidden="true">◉</span>
          <h2 class="text-sm font-semibold">System Monitor</h2>
        </div>
        <span class="rounded-full bg-[color:var(--inset)] px-2 py-0.5 font-mono text-[10px] text-[color:var(--text-dim)]">
          {snapshot.stats ? `${snapshot.stats.cpu.cores} cores · ${api.mode}` : api.mode}
        </span>
      </header>

      {#if !snapshot.stats}
        <div class="flex min-h-48 items-center justify-center gap-2 text-xs text-[color:var(--text-faint)]">
          <span class="animate-pulse" aria-hidden="true">●</span> Reading host telemetry…
        </div>
      {:else}
        <GaugeGrid stats={snapshot.stats} gpu={snapshot.gpu} />

        <div class="spark-grid grid grid-cols-2 gap-3">
          <GlassPanel title="CPU load" right={fmtPct(snapshot.stats.cpu.pct)}>
            <Sparkline data={snapshot.cpuSeries} accent="--mon-cpu" max={100} />
          </GlassPanel>
          <GlassPanel title="Network" right={fmtMBs(lastNet)}>
            <Sparkline data={snapshot.netSeries} accent="--mon-net" />
          </GlassPanel>
        </div>

        <GlassPanel title="Processes">
          <ProcessTable processes={snapshot.procs} />
        </GlassPanel>
      {/if}
    </div>
  </div>
</div>

<style>
  .monitor-frame { container-type: inline-size; }
  @container (max-width: 440px) {
    .spark-grid { grid-template-columns: 1fr; }
  }
</style>
