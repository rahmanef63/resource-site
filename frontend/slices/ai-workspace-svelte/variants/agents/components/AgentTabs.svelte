<script lang="ts">
  import RunTrace from "./RunTrace.svelte";
  import { DEMO_AGENTS } from "@/features/ai-workspace/variants/agents/views/demo";
  import type { AgentRun } from "@/features/ai-workspace/variants/agents/types";
  let { runs, selectedId, onSelect, onRun }: { runs: AgentRun[]; selectedId: string; onSelect: (id: string) => void; onRun: () => void } = $props();
  let tab = $state<"runs" | "trace" | "agents">("runs");
  let selected = $derived(runs.find((run) => run.id === selectedId) ?? runs[0]);
  const latency = (run: AgentRun) => run.latencyMs ? `${(run.latencyMs / 1000).toFixed(1)}s` : "—";
</script>

<div class="mt-4">
  <nav class="inline-flex gap-1 rounded-lg bg-muted p-1" aria-label="Agent dashboard tabs">
    {#each [["runs","Runs"],["trace","Trace"],["agents","Agents"]] as item (item[0])}
      <button type="button" class={`rounded-md px-3 py-1.5 text-sm ${tab === item[0] ? "bg-background shadow-sm" : ""}`} onclick={() => tab = item[0] as typeof tab}>{item[1]}</button>
    {/each}
  </nav>
  <div class="mt-3">
    {#if tab === "runs"}
      <div class="overflow-x-auto rounded-lg border bg-card"><table class="w-full text-sm"><thead class="border-b text-left text-xs text-muted-foreground"><tr><th class="px-3 py-2">Agent</th><th class="px-3 py-2">Task</th><th class="px-3 py-2">Status</th><th class="px-3 py-2 text-right">Steps</th><th class="px-3 py-2 text-right">Latency</th></tr></thead><tbody class="divide-y">{#each runs as run (run.id)}<tr class={`cursor-pointer ${run.id === selectedId ? "bg-muted/50" : ""}`} onclick={() => onSelect(run.id)}><td class="px-3 py-2 font-medium">{run.agentSlug}</td><td class="max-w-[22rem] truncate px-3 py-2 text-muted-foreground">{run.input}</td><td class="px-3 py-2"><span class="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">{run.status}</span></td><td class="px-3 py-2 text-right tabular-nums">{run.steps.length}</td><td class="px-3 py-2 text-right text-muted-foreground">{latency(run)}</td></tr>{/each}</tbody></table></div>
    {:else if tab === "trace"}<RunTrace {selected} />
    {:else}<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{#each DEMO_AGENTS as agent (agent.slug)}<article class="rounded-lg border bg-card p-4"><h3 class="font-medium">◉ {agent.name}</h3><p class="mt-1 text-sm text-muted-foreground">{agent.description}</p><div class="mt-3 flex items-center justify-between text-xs text-muted-foreground"><code>{agent.slug}</code><span>{agent.runs} runs</span></div><div class="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div class="h-full bg-primary" style={`width:${Math.min(100, agent.runs * 2)}%`}></div></div><button type="button" class="mt-3 w-full rounded-md border px-3 py-1.5 text-sm" onclick={onRun}>▶ Run</button></article>{/each}</div>{/if}
  </div>
</div>
