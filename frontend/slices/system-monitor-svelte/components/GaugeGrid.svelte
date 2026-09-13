<script lang="ts">
  import CircularGauge from "./CircularGauge.svelte";
  import { fmtGiBPair } from "../../system-monitor/lib/format";
  import type { SysStats } from "../../system-monitor/lib/core";
  let { stats, gpu }: { stats: SysStats; gpu: number } = $props();
  let memPct = $derived((stats.mem.used / stats.mem.total) * 100);
  let diskPct = $derived((stats.disk.used / stats.disk.total) * 100);
</script>

<div class="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
  <CircularGauge label="CPU" pct={stats.cpu.pct} sub={`${stats.cpu.cores} vCPU`} accent="--mon-cpu" />
  <CircularGauge label="Memory" pct={memPct} sub={fmtGiBPair(stats.mem.used, stats.mem.total)} accent="--mon-mem" />
  <CircularGauge label="Disk" pct={diskPct} sub={fmtGiBPair(stats.disk.used, stats.disk.total)} accent="--mon-disk" />
  <CircularGauge label="GPU (mock)" pct={gpu} sub="render accel" accent="--mon-gpu" />
</div>
