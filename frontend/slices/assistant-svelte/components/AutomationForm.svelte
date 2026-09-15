<script lang="ts">
  import { untrack } from "svelte";
  import { ArrowDown, ArrowUp, Plus, X } from "@lucide/svelte";
  import { SKILL_COLORS, SKILL_ICONS } from "@/features/assistant/lib/presets";
  import {
    assistantCatalog,
    catalogGroups,
    toolById,
  } from "@/features/assistant/lib/tools";
  import {
    assistantStoreActions,
    type AssistantStoreState,
  } from "@/features/assistant/lib/store-core";
  import type { Automation, AutomationStep } from "@/features/assistant/lib/types";
  import GlyphTile from "./GlyphTile.svelte";

  let {
    state: storeState,
    item = undefined,
    onclose,
  } = $props<{
    state: AssistantStoreState;
    item?: Automation;
    onclose: () => void;
  }>();

  const initial = untrack(() => item);
  let name = $state(initial?.name ?? "New Automation");
  let glyph = $state(initial?.glyph ?? "sparkles");
  let color = $state(initial?.color ?? SKILL_COLORS[0]);
  let agentId = $state(initial?.agentId ?? untrack(() => storeState.activeAgentId));
  let steps = $state<AutomationStep[]>([...(initial?.steps ?? [])]);
  let catalog = $derived(assistantCatalog());
  let groups = $derived(catalogGroups(catalog));

  const save = () => {
    const payload = { name, glyph, color, agentId, steps };
    if (initial) assistantStoreActions.updateAutomation(initial.id, payload);
    else assistantStoreActions.addAutomation(payload);
    onclose();
  };

  const move = (index: number, delta: number) => {
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= steps.length) return;
    const next = [...steps];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    steps = next;
  };
</script>

<div class="flex h-full min-h-0 bg-background">
  <div class="min-w-0 flex-1 overflow-y-auto p-6">
    <div class="mb-4 flex items-center gap-2"><h2 class="text-lg font-bold tracking-tight">{initial ? "Edit" : "Create"} Automation</h2><button type="button" class="ml-auto rounded-md px-3 py-1.5 text-sm hover:bg-accent" onclick={onclose}>Cancel</button><button type="button" class="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground" onclick={save}>{initial ? "Save" : "Create"}</button></div>
    <label class="mb-4 block max-w-xl"><span class="text-[13px] font-semibold">Name</span><input class="mt-1.5 h-9 w-full rounded-md border bg-background px-3 text-sm" bind:value={name} /></label>
    <div class="mb-4 max-w-xl"><div class="text-[13px] font-semibold">Icon</div><div class="mt-1.5 flex flex-wrap gap-1.5">{#each SKILL_ICONS as option (option)}<button type="button" class={`rounded-md border px-2 py-1 text-xs ${glyph === option ? "border-primary bg-primary/10" : ""}`} onclick={() => { glyph = option; }}>{option}</button>{/each}</div></div>
    <div class="mb-4 max-w-xl"><div class="text-[13px] font-semibold">Color</div><div class="mt-1.5 flex flex-wrap gap-2">{#each SKILL_COLORS as option (option)}<button type="button" aria-label={`Color ${option}`} class={`size-7 rounded-lg ${option} ${color === option ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`} onclick={() => { color = option; }}></button>{/each}</div></div>
    <label class="mb-4 block max-w-xl"><span class="text-[13px] font-semibold">Run as agent</span><select class="mt-1.5 h-9 w-full rounded-md border bg-background px-3 text-sm" bind:value={agentId}>{#each storeState.agents as agent (agent.id)}<option value={agent.id}>{agent.name}</option>{/each}</select></label>

    <div class="mb-4 max-w-xl">
      <div class="text-[13px] font-semibold">Steps</div>
      <div class="mt-2 space-y-2">
        {#each steps as step, index (`${step.tool}-${index}`)}
          {@const tool = toolById(step.tool)}
          <div class="flex items-start gap-2 rounded-lg border bg-muted p-2.5">
            <span class="mt-1.5 w-4 text-right text-[11px] tabular-nums text-muted-foreground">{index + 1}</span>
            <div class="min-w-0 flex-1"><div class="flex items-center gap-2"><span class="text-[13px] font-semibold">{tool?.name ?? step.tool}</span><span class="font-mono text-[10px] text-muted-foreground">{step.tool}</span></div><input class="mt-1.5 h-7 w-full rounded-md border bg-background px-2 font-mono text-[11px]" value={step.argText} placeholder={tool?.params.length ? `e.g. ${tool.params[0]} value` : "no arguments"} oninput={(event) => { steps = steps.map((item, i) => i === index ? { ...item, argText: event.currentTarget.value } : item); }} /></div>
            <div class="flex flex-col gap-1"><button type="button" aria-label="Move step up" disabled={index === 0} onclick={() => move(index, -1)}><ArrowUp size={14} /></button><button type="button" aria-label="Move step down" disabled={index === steps.length - 1} onclick={() => move(index, 1)}><ArrowDown size={14} /></button><button type="button" aria-label="Delete step" class="text-destructive" onclick={() => { steps = steps.filter((_, i) => i !== index); }}><X size={14} /></button></div>
          </div>
        {/each}
      </div>
      <div class="mt-3 space-y-2">
        {#each groups as group (group.id)}
          <details><summary class="cursor-pointer text-xs font-semibold text-muted-foreground">{group.label}</summary><div class="mt-1 flex flex-wrap gap-1.5">{#each catalog.filter((tool) => tool.group === group.id) as tool (tool.id)}<button type="button" class="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px]" onclick={() => { steps = [...steps, { tool: tool.id, argText: "" }]; }}><Plus size={12} />{tool.name}</button>{/each}</div></details>
        {/each}
      </div>
    </div>
  </div>

  <aside class="hidden w-56 flex-none border-l border-border bg-card/40 p-5 md:flex md:flex-col"><div class="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Preview</div><div class="flex flex-col items-center gap-2"><GlyphTile {glyph} {color} size={60} /><span class="font-semibold">{name}</span><span class="text-[11px] text-muted-foreground">{steps.length} steps</span></div></aside>
</div>
