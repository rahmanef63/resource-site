<script lang="ts">
  import TeamDetail from "./TeamDetail.svelte"; import { can } from "../../user-management/lib/can";
  import { DEFAULT_TEAMS_LABELS, type Member, type Team, type TeamsLabels } from "../../user-management/types";
  let { teams, allMembers, currentPerms, onCreateTeam, onRemoveTeam, onAddMember, onRemoveMember, labels: overrides = {}, className = "" }: {
    teams: Team[]; allMembers: Member[]; currentPerms: readonly string[];
    onCreateTeam?: (input: { name: string }) => void | Promise<void>; onRemoveTeam?: (input: { teamId: string }) => void | Promise<void>;
    onAddMember?: (input: { teamId: string; userId: string }) => void | Promise<void>; onRemoveMember?: (input: { teamId: string; userId: string }) => void | Promise<void>;
    labels?: Partial<TeamsLabels>; className?: string;
  } = $props();
  let selectedOverride = $state<string | null | undefined>(); let newName = $state("");
  let labels = $derived({ ...DEFAULT_TEAMS_LABELS, ...overrides }); let canManage = $derived(can(currentPerms, "members.manage"));
  let selected = $derived(selectedOverride === undefined ? (teams[0]?.id ?? null) : selectedOverride); let current = $derived(teams.find((team) => team.id === selected) ?? null);
  async function create(event: SubmitEvent) { event.preventDefault(); const name = newName.trim(); if (!name || !onCreateTeam) return; await onCreateTeam({ name }); newName = ""; }
  async function remove(input: { teamId: string }) { await onRemoveTeam?.(input); selectedOverride = teams.find((team) => team.id !== input.teamId)?.id ?? null; }
</script>

<div class={`grid gap-6 lg:grid-cols-[260px_1fr] ${className}`}>
  <aside class="space-y-3">
    {#if canManage && onCreateTeam}<form class="flex gap-1.5" onsubmit={create}><input class="min-w-0 flex-1 rounded-md border bg-background px-2 py-1.5 text-sm" bind:value={newName} placeholder={labels.teamNamePlaceholder} /><button type="submit" class="rounded-md border px-2 text-sm" disabled={!newName.trim()}>{labels.create}</button></form>{/if}
    <ul class="space-y-1">{#each teams as team (team.id)}<li><button type="button" class={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm ${selected === team.id ? "bg-accent" : "hover:bg-muted"}`} onclick={() => selectedOverride = team.id}><span class="truncate">{team.name}</span><span class="ml-auto text-xs text-muted-foreground">{team.memberIds.length}</span></button></li>{/each}{#if teams.length === 0}<li class="px-2 py-3 text-center text-xs text-muted-foreground">{labels.empty}</li>{/if}</ul>
  </aside>
  <section class="rounded-lg border p-4">{#if current}<TeamDetail team={current} {allMembers} {canManage} {onAddMember} {onRemoveMember} onRemoveTeam={remove} {labels} />{:else}<p class="text-sm text-muted-foreground">{labels.emptyDetail}</p>{/if}</section>
</div>
