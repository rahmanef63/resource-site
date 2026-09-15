<script lang="ts">
  import type { Member, Team, TeamsLabels } from "../../user-management/types";
  let { team, allMembers, canManage, onAddMember, onRemoveMember, onRemoveTeam, labels }: {
    team: Team; allMembers: Member[]; canManage: boolean;
    onAddMember?: (input: { teamId: string; userId: string }) => void | Promise<void>;
    onRemoveMember?: (input: { teamId: string; userId: string }) => void | Promise<void>;
    onRemoveTeam?: (input: { teamId: string }) => void | Promise<void>; labels: TeamsLabels;
  } = $props();
  const memberById = (id: string) => allMembers.find((member) => member.userId === id);
  const label = (member?: Member) => member?.name ?? member?.email ?? "Unknown";
  let addable = $derived(allMembers.filter((member) => !team.memberIds.includes(member.userId) && member.status === "active"));
</script>

<div class="space-y-4">
  <header class="flex items-center justify-between gap-2"><div><p class="truncate text-sm font-medium">{team.name}</p>{#if team.description}<p class="text-xs text-muted-foreground">{team.description}</p>{/if}</div>{#if canManage && onRemoveTeam}<button type="button" class="text-xs text-destructive underline" onclick={() => onRemoveTeam?.({ teamId: team.id })}>{labels.deleteTeam}</button>{/if}</header>
  <section class="space-y-1.5"><p class="text-xs font-medium text-muted-foreground">{labels.members} ({team.memberIds.length})</p><ul class="space-y-1">
    {#each team.memberIds as userId (userId)}{@const member = memberById(userId)}<li class="flex items-center gap-2 rounded-md border px-2 py-1.5"><span class="grid h-6 w-6 place-items-center rounded-full bg-muted text-[9px]">{label(member).slice(0, 2).toUpperCase()}</span><span class="truncate text-sm">{label(member)}</span>{#if canManage && onRemoveMember}<button type="button" class="ml-auto text-xs underline" onclick={() => onRemoveMember?.({ teamId: team.id, userId })}>{labels.remove}</button>{/if}</li>{/each}
    {#if team.memberIds.length === 0}<li class="px-2 py-1 text-xs text-muted-foreground">—</li>{/if}
  </ul></section>
  {#if canManage && onAddMember && addable.length}<select class="w-full rounded-md border bg-background px-3 py-2 text-sm" value="" onchange={(event) => { const userId = event.currentTarget.value; if (userId) onAddMember?.({ teamId: team.id, userId }); event.currentTarget.value = ""; }}><option value="">{labels.addMemberPlaceholder}</option>{#each addable as member (member.userId)}<option value={member.userId}>{label(member)}</option>{/each}</select>{/if}
</div>
