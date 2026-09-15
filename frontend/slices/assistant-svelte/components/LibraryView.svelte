<script lang="ts">
  import { Play, Plus } from "@lucide/svelte";
  import {
    assistantCatalog,
    toolById,
    toolsForAgent,
  } from "@/features/assistant/lib/tools";
  import type { Agent, Automation, Skill } from "@/features/assistant/lib/types";
  import {
    assistantStoreActions,
    type AssistantStoreState,
  } from "@/features/assistant/lib/store-core";
  import GlyphTile from "./GlyphTile.svelte";

  type Kind = "agent" | "skill" | "automation";
  let {
    kind,
    state,
    onnew,
    onedit,
    onrun = undefined,
  } = $props<{
    kind: Kind;
    state: AssistantStoreState;
    onnew: () => void;
    onedit: (item: Agent | Skill | Automation) => void;
    onrun?: (item: Automation) => void;
  }>();

  let title = $derived(kind === "agent" ? "Agents" : kind === "skill" ? "Skills" : "Automations");
  let description = $derived(
    kind === "agent"
      ? "Personas that own skills and run tools."
      : kind === "skill"
        ? "Bundles of tools + instructions you give to agents."
        : "Saved flows — ordered tool steps you can run in one click.",
  );

  const toolCount = (item: Agent | Skill) => {
    if (kind === "skill") return (item as Skill).tools.length;
    return toolsForAgent(item as Agent, state.skills).length;
  };
</script>

<div class="min-h-0 flex-1 overflow-y-auto p-5 [padding-bottom:calc(1.25rem+var(--sai-bottom,0px))]">
  <div class="mb-3.5 flex items-center gap-3">
    <div>
      <div class="text-base font-bold tracking-tight">{title}</div>
      <div class="text-xs text-muted-foreground">{description}</div>
    </div>
    <button type="button" class="ml-auto inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground" onclick={onnew}>
      <Plus size={14} /> New {kind}
    </button>
  </div>

  <div class="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
    {#if kind === "agent"}
      {#each state.agents as agent (agent.id)}
        {@const active = agent.id === state.activeAgentId}
        <article class="glass flex flex-col gap-2.5 rounded-xl border border-border bg-card/40 p-3.5">
          <div class="flex items-center gap-2.5">
            <GlyphTile glyph={agent.glyph} color={agent.color} size={42} />
            <div class="min-w-0 flex-1"><div class="font-semibold">{agent.name}</div><div class="text-[11px] text-muted-foreground">{agent.allTools ? "Generalist" : `${agent.skills.length} skills`} · {toolCount(agent)} tools</div></div>
            {#if agent.builtin}<span class="rounded border px-1.5 text-[9px] uppercase">preset</span>{/if}
          </div>
          <p class="min-h-9 text-xs leading-relaxed text-muted-foreground">{agent.persona || "No description."}</p>
          <div class="mt-auto flex gap-1.5">
            <button type="button" class={`rounded-md px-2.5 py-1.5 text-xs ${active ? "bg-primary text-primary-foreground" : "border"}`} onclick={() => assistantStoreActions.setActiveAgentId(agent.id)}>{active ? "Active" : "Use"}</button>
            <button type="button" class="rounded-md border px-2.5 py-1.5 text-xs" onclick={() => onedit(agent)}>Edit</button>
            {#if !agent.builtin}<button type="button" class="rounded-md px-2.5 py-1.5 text-xs text-destructive" onclick={() => assistantStoreActions.removeAgent(agent.id)}>Delete</button>{/if}
          </div>
        </article>
      {/each}
    {:else if kind === "skill"}
      {#each state.skills as skill (skill.id)}
        <article class="glass flex flex-col gap-2.5 rounded-xl border border-border bg-card/40 p-3.5">
          <div class="flex items-center gap-2.5">
            <GlyphTile glyph={skill.glyph} color={skill.color} size={42} />
            <div class="min-w-0 flex-1"><div class="font-semibold">{skill.name}</div><div class="text-[11px] text-muted-foreground">{toolCount(skill)} tools</div></div>
            {#if skill.builtin}<span class="rounded border px-1.5 text-[9px] uppercase">preset</span>{/if}
          </div>
          <p class="min-h-9 text-xs leading-relaxed text-muted-foreground">{skill.instructions || "No description."}</p>
          <div class="mt-auto flex gap-1.5">
            <button type="button" class="rounded-md border px-2.5 py-1.5 text-xs" onclick={() => onedit(skill)}>Edit</button>
            {#if !skill.builtin}<button type="button" class="rounded-md px-2.5 py-1.5 text-xs text-destructive" onclick={() => assistantStoreActions.removeSkill(skill.id)}>Delete</button>{/if}
          </div>
        </article>
      {/each}
    {:else}
      {#each state.automations as auto (auto.id)}
        {@const agent = state.agents.find((item: Agent) => item.id === auto.agentId)}
        <article class="glass flex flex-col gap-2.5 rounded-xl border border-border bg-card/40 p-3.5">
          <div class="flex items-center gap-2.5"><GlyphTile glyph={auto.glyph} color={auto.color} size={42} /><div class="min-w-0 flex-1"><div class="font-semibold">{auto.name}</div><div class="text-[11px] text-muted-foreground">{auto.steps.length} steps · {agent?.name ?? "—"}</div></div>{#if auto.builtin}<span class="rounded border px-1.5 text-[9px] uppercase">preset</span>{/if}</div>
          <div class="flex flex-col gap-1">
            {#each auto.steps.slice(0, 4) as step, index (`${auto.id}-${index}`)}
              <div class="flex items-center gap-2 text-[11px] text-muted-foreground"><span class="w-4 text-right tabular-nums opacity-60">{index + 1}</span><span class="truncate">{toolById(step.tool)?.name ?? step.tool}</span></div>
            {/each}
          </div>
          <div class="mt-auto flex gap-1.5">
            <button type="button" class="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs text-primary-foreground" onclick={() => onrun?.(auto)}><Play size={12} /> Run</button>
            <button type="button" class="rounded-md border px-2.5 py-1.5 text-xs" onclick={() => onedit(auto)}>Edit</button>
            {#if !auto.builtin}<button type="button" class="rounded-md px-2.5 py-1.5 text-xs text-destructive" onclick={() => assistantStoreActions.removeAutomation(auto.id)}>Delete</button>{/if}
          </div>
        </article>
      {/each}
    {/if}
  </div>
</div>
