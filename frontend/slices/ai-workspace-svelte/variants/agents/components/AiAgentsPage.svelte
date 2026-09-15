<script lang="ts">
  import AgentTabs from "./AgentTabs.svelte";
  import { DEMO_RUNS } from "@/features/ai-workspace/variants/agents/views/demo";
  import type { AgentRun } from "@/features/ai-workspace/variants/agents/types";
  let runs = $state<AgentRun[]>(DEMO_RUNS.map((run) => ({ ...run, steps: run.steps.map((step) => ({ ...step })) })));
  let selectedId = $state(DEMO_RUNS[0]?.id ?? "");
  let activeCount = $derived(runs.filter((run) => run.status === "running").length);
  let queuedCount = $derived(runs.filter((run) => run.status === "queued").length);
  let totalCost = $derived(runs.reduce((sum, run) => sum + (run.costUsd ?? 0), 0));
  function enqueueDemoRun() {
    const id = `run_local_${runs.length + 1}`;
    runs = [{ id, workspaceId: "local", agentSlug: "audit-bp", input: "New queued task (scaffold placeholder)", status: "queued", steps: [], scheduleAt: Date.now() + 30_000 }, ...runs];
    selectedId = id;
  }
</script>

<div class="h-full p-4">
  <div class="space-y-4">
    <header class="flex flex-wrap items-center justify-between gap-3"><div class="flex items-center gap-3"><div class="grid size-10 place-items-center rounded-lg bg-primary/10 text-xl">◎</div><div><h1 class="text-xl font-semibold">AI Agents</h1><p class="text-sm text-muted-foreground">Autonomous workers — task queue and run traces.</p></div></div><button type="button" class="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground" onclick={enqueueDemoRun}>＋ Run agent</button></header>
    <div class="rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 px-3 py-2 text-xs text-amber-700">Non-functional scaffold. This dashboard is preview-only — no agent actually runs and no AI provider is called.</div>
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {#each [["Running",String(activeCount)],["Queued",String(queuedCount)],["Total runs",String(runs.length)],["Cost (USD)",`$${totalCost.toFixed(3)}`]] as stat (stat[0])}<article class="rounded-lg border bg-card p-4"><p class="text-xs text-muted-foreground">{stat[0]}</p><p class="text-lg font-semibold tabular-nums">{stat[1]}</p></article>{/each}
    </div>
  </div>
  <AgentTabs {runs} {selectedId} onSelect={(id) => selectedId = id} onRun={enqueueDemoRun} />
</div>
