<script lang="ts">
  import type { MembersLabels, RoleOption } from "../../user-management/types";
  let { query, roleFilter, roles, canInvite, onQuery, onRoleFilter, onInvite, labels }: {
    query: string; roleFilter: string; roles: RoleOption[]; canInvite: boolean;
    onQuery: (value: string) => void; onRoleFilter: (value: string) => void; onInvite?: () => void; labels: MembersLabels;
  } = $props();
</script>

<div class="flex flex-wrap items-center gap-2">
  <input class="min-w-[200px] flex-1 rounded-md border bg-background px-3 py-2 text-sm" value={query}
    oninput={(event) => onQuery(event.currentTarget.value)} placeholder={labels.searchPlaceholder} aria-label={labels.searchPlaceholder} />
  <select class="rounded-md border bg-background px-3 py-2 text-sm" value={roleFilter}
    onchange={(event) => onRoleFilter(event.currentTarget.value)} aria-label={labels.allRoles}>
    <option value="all">{labels.allRoles}</option>
    {#each roles as role (role.slug)}<option value={role.slug}>{role.name}</option>{/each}
  </select>
  {#if canInvite && onInvite}
    <button type="button" class="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground" onclick={onInvite}>{labels.invite}</button>
  {/if}
</div>
