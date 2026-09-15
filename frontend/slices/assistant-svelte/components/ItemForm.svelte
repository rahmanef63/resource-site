<script lang="ts">
  import { untrack } from "svelte";
  import {
    AGENT_COLORS,
    SKILL_COLORS,
    SKILL_ICONS,
  } from "@/features/assistant/lib/presets";
  import {
    assistantCatalog,
    catalogGroups,
  } from "@/features/assistant/lib/tools";
  import {
    assistantStoreActions,
    type AssistantStoreState,
  } from "@/features/assistant/lib/store-core";
  import type { Agent, Skill } from "@/features/assistant/lib/types";
  import GlyphTile from "./GlyphTile.svelte";

  let {
    kind,
    state: storeState,
    item = undefined,
    onclose,
  } = $props<{
    kind: "agent" | "skill";
    state: AssistantStoreState;
    item?: Agent | Skill;
    onclose: () => void;
  }>();

  const initial = untrack(() => item);
  const isAgent = untrack(() => kind === "agent");
  let name = $state(initial?.name ?? (isAgent ? "New Agent" : "New Skill"));
  let glyph = $state(initial?.glyph ?? "sparkles");
  let color = $state(initial?.color ?? (isAgent ? AGENT_COLORS[0] : SKILL_COLORS[0]));
  let persona = $state(isAgent ? ((initial as Agent | undefined)?.persona ?? "") : "");
  let allTools = $state(isAgent ? !!(initial as Agent | undefined)?.allTools : false);
  let skills = $state<string[]>(isAgent ? [...((initial as Agent | undefined)?.skills ?? [])] : []);
  let instructions = $state(isAgent ? "" : ((initial as Skill | undefined)?.instructions ?? ""));
  let tools = $state<string[]>(isAgent ? [] : [...((initial as Skill | undefined)?.tools ?? [])]);
  let starters = $state(isAgent ? "" : ((initial as Skill | undefined)?.starters ?? []).join("\n"));
  let catalog = $derived(assistantCatalog());
  let groups = $derived(catalogGroups(catalog));

  const toggle = (list: string[], id: string) =>
    list.includes(id) ? list.filter((value) => value !== id) : [...list, id];

  const save = () => {
    if (isAgent) {
      const payload = { name, glyph, color, persona, allTools, skills };
      if (initial) assistantStoreActions.updateAgent(initial.id, payload);
      else assistantStoreActions.setActiveAgentId(assistantStoreActions.addAgent(payload).id);
    } else {
      const payload = {
        name, glyph, color, instructions, tools,
        starters: starters.split("\n").map((value) => value.trim()).filter(Boolean),
      };
      if (initial) assistantStoreActions.updateSkill(initial.id, payload);
      else assistantStoreActions.addSkill(payload);
    }
    onclose();
  };
</script>

<div class="flex h-full min-h-0 bg-background">
  <div class="min-w-0 flex-1 overflow-y-auto p-6">
    <div class="mb-4 flex items-center gap-2">
      <h2 class="text-lg font-bold tracking-tight">{initial ? "Edit" : "Create"} {isAgent ? "Agent" : "Skill"}</h2>
      <button type="button" class="ml-auto rounded-md px-3 py-1.5 text-sm hover:bg-accent" onclick={onclose}>Cancel</button>
      <button type="button" class="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground" onclick={save}>{initial ? "Save" : "Create"}</button>
    </div>

    <label class="mb-4 block max-w-xl"><span class="text-[13px] font-semibold">Name</span><input class="mt-1.5 h-9 w-full rounded-md border bg-background px-3 text-sm" bind:value={name} /></label>
    <div class="mb-4 max-w-xl"><div class="text-[13px] font-semibold">Icon</div><div class="mt-1.5 flex flex-wrap gap-1.5">{#each SKILL_ICONS as option (option)}<button type="button" class={`rounded-md border px-2 py-1 text-xs ${glyph === option ? "border-primary bg-primary/10" : ""}`} onclick={() => { glyph = option; }}>{option}</button>{/each}</div></div>
    <div class="mb-4 max-w-xl"><div class="text-[13px] font-semibold">Color</div><div class="mt-1.5 flex flex-wrap gap-2">{#each (isAgent ? AGENT_COLORS : SKILL_COLORS) as option (option)}<button type="button" aria-label={`Color ${option}`} class={`size-7 rounded-lg ${option} ${color === option ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`} onclick={() => { color = option; }}></button>{/each}</div></div>

    {#if isAgent}
      <label class="mb-4 block max-w-xl"><span class="text-[13px] font-semibold">Persona</span><textarea class="mt-1.5 min-h-20 w-full rounded-md border bg-background p-3 text-sm" bind:value={persona}></textarea></label>
      <label class="mb-4 flex max-w-xl items-center gap-2 text-sm"><input type="checkbox" bind:checked={allTools} /> Generalist — all tools</label>
      {#if !allTools}<div class="mb-4 max-w-xl"><div class="text-[13px] font-semibold">Skills</div><div class="mt-2 space-y-1">{#each storeState.skills as skill (skill.id)}<label class="flex items-center gap-2 rounded-md border p-2 text-sm"><input type="checkbox" checked={skills.includes(skill.id)} onchange={() => { skills = toggle(skills, skill.id); }} /><GlyphTile glyph={skill.glyph} color={skill.color} size={24} />{skill.name}</label>{/each}</div></div>{/if}
    {:else}
      <label class="mb-4 block max-w-xl"><span class="text-[13px] font-semibold">Instructions</span><textarea class="mt-1.5 min-h-20 w-full rounded-md border bg-background p-3 text-sm" bind:value={instructions}></textarea></label>
      <div class="mb-4 max-w-xl"><div class="text-[13px] font-semibold">Allowed tools</div>{#each groups as group (group.id)}<div class="mt-2"><div class="text-[11px] font-semibold uppercase text-muted-foreground">{group.label}</div><div class="mt-1 flex flex-wrap gap-1.5">{#each catalog.filter((tool) => tool.group === group.id) as tool (tool.id)}<button type="button" class={`rounded-full border px-2.5 py-1 text-[11px] ${tools.includes(tool.id) ? "border-transparent bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`} onclick={() => { tools = toggle(tools, tool.id); }}>{tool.name}</button>{/each}</div></div>{/each}</div>
      <label class="mb-4 block max-w-xl"><span class="text-[13px] font-semibold">Starter prompts</span><textarea class="mt-1.5 min-h-16 w-full rounded-md border bg-background p-3 text-xs" bind:value={starters}></textarea></label>
    {/if}
  </div>

  <aside class="hidden w-56 flex-none border-l border-border bg-card/40 p-5 md:flex md:flex-col">
    <div class="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Preview</div>
    <div class="flex flex-col items-center gap-2"><GlyphTile {glyph} {color} size={64} /><span class="font-semibold">{name}</span></div>
  </aside>
</div>
