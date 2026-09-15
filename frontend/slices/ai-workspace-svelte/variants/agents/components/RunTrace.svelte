<script lang="ts">
  import type { AgentRun, StepStatus } from "@/features/ai-workspace/variants/agents/types";
  let { selected }: { selected?: AgentRun } = $props();
  const icon = (status: StepStatus) => status === "done" ? "✓" : status === "error" ? "×" : status === "running" ? "●" : "○";
</script>

<section class="rounded-lg border bg-card">
  <header class="flex flex-wrap items-start justify-between gap-2 border-b p-4">
    <div><h2 class="font-medium">▶ {selected?.agentSlug ?? "—"}</h2><p class="mt-1 text-sm text-muted-foreground">{selected?.input ?? "Select a run to inspect its trace."}</p></div>
    {#if selected}<span class={`rounded-full px-2 py-0.5 text-xs capitalize ${selected.status === "success" ? "bg-emerald-500/15 text-emerald-600" : selected.status === "failed" ? "bg-red-500/15 text-red-600" : selected.status === "running" ? "bg-blue-500/15 text-blue-600" : "bg-muted text-muted-foreground"}`}>{selected.status}</span>{/if}
  </header>
  <div class="p-4">
    {#if selected?.steps.length}
      <ol class="max-h-[22rem] space-y-2 overflow-y-auto pr-2">{#each selected.steps as step (step.index)}<li class="flex items-start gap-3 rounded-md border p-3"><span aria-hidden="true">{icon(step.status)}</span><div class="min-w-0 flex-1"><div class="flex gap-2"><strong class="text-sm">{step.name}</strong><span class="text-xs text-muted-foreground">#{step.index}</span></div>{#if step.args}<pre class="mt-1 overflow-x-auto rounded bg-muted px-2 py-1 text-xs">{step.args}</pre>{/if}{#if step.result}<p class="mt-1 text-sm text-muted-foreground">{step.result}</p>{/if}</div></li>{/each}</ol>
    {:else}<div class="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">◷ No steps yet — this run is queued.</div>{/if}
  </div>
</section>
