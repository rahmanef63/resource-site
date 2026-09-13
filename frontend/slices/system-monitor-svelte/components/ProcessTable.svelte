<script lang="ts">
  import type { Process } from "../../system-monitor/lib/core";
  let { processes }: { processes: Process[] } = $props();
  const cpuTone = (cpu: number) => cpu > 50 ? "text-destructive" : "text-[color:var(--text-dim)]";
</script>

{#if processes.length === 0}
  <p class="py-2 text-center text-[11px] text-[color:var(--text-faint)]">No process data from host</p>
{:else}
  <div class="process-wide">
    <div class="grid grid-cols-[3rem_1fr_5rem_4rem_4.5rem] gap-2 px-1 pb-2 text-[10px] font-bold uppercase tracking-wide text-[color:var(--text-faint)]">
      <span>PID</span><span>Process</span><span class="text-right">Status</span><span class="text-right">CPU</span><span class="text-right">Mem</span>
    </div>
    {#each processes as process (process.pid)}
      <div class="grid grid-cols-[3rem_1fr_5rem_4rem_4.5rem] items-center gap-2 border-t border-[color:var(--sep)] px-1 py-1.5 text-[12.5px] first:border-t-0">
        <span class="font-mono tabular-nums text-[color:var(--text-dim)]">{process.pid}</span>
        <span class="truncate font-mono text-xs font-medium text-foreground">{process.name}</span>
        <span class="text-right"><span class="rounded-full bg-[color:var(--inset)] px-1.5 py-0.5 text-[11px] font-medium text-[color:var(--text-dim)]">{process.status}</span></span>
        <span class={`text-right font-mono tabular-nums ${cpuTone(process.cpu)}`}>{process.cpu.toFixed(0)}%</span>
        <span class="text-right font-mono tabular-nums text-[color:var(--text-dim)]">{process.mem.toFixed(0)}M</span>
      </div>
    {/each}
  </div>

  <div class="process-compact hidden flex-col">
    {#each processes as process (process.pid)}
      <div class="flex min-h-11 items-center justify-between gap-3 border-t border-[color:var(--sep)] px-1 py-2 first:border-t-0">
        <div class="min-w-0">
          <p class="truncate font-mono text-xs font-medium text-foreground">{process.name}</p>
          <p class="mt-0.5 font-mono text-[11px] tabular-nums text-[color:var(--text-faint)]">PID {process.pid}</p>
        </div>
        <div class="flex shrink-0 items-center gap-2.5">
          <span class="rounded-full bg-[color:var(--inset)] px-1.5 py-0.5 text-[11px] font-medium text-[color:var(--text-dim)]">{process.status}</span>
          <div class="text-right font-mono tabular-nums">
            <p class={`text-[12.5px] ${cpuTone(process.cpu)}`}>{process.cpu.toFixed(0)}%</p>
            <p class="text-[11px] text-[color:var(--text-dim)]">{process.mem.toFixed(0)}M</p>
          </div>
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  @container (max-width: 440px) {
    .process-wide { display: none; }
    .process-compact { display: flex; }
  }
</style>
