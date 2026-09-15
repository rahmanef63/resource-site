<script lang="ts">
  import MemberRowActions from "./MemberRowActions.svelte";
  import RoleChip from "./RoleChip.svelte";
  import type { SortDir, SortKey } from "../../user-management/lib/members-core";
  import type { Member, MembersLabels, RoleOption } from "../../user-management/types";
  let { rows, roles, canManage, sortKey, sortDir, onSort, onUpdateRole, onRemove, labels }: {
    rows: Member[]; roles: RoleOption[]; canManage: boolean; sortKey: SortKey; sortDir: SortDir;
    onSort: (key: SortKey) => void;
    onUpdateRole?: (input: { userId: string; roleSlug: string }) => void | Promise<void>;
    onRemove?: (input: { userId: string }) => void | Promise<void>; labels: MembersLabels;
  } = $props();
  const displayName = (member: Member) => member.name ?? member.email ?? "Unknown";
  const initials = (member: Member) => displayName(member).trim().slice(0, 2).toUpperCase();
  const roleOf = (slug: string) => roles.find((role) => role.slug === slug) ?? { slug, name: slug };
  const date = (ts?: number) => ts ? new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";
  const marker = (key: SortKey) => sortKey === key ? (sortDir === "asc" ? "↑" : "↓") : "↕";
</script>

<div class="overflow-x-auto">
  <table class="w-full text-sm">
    <thead class="border-b text-left text-xs text-muted-foreground"><tr>
      <th class="px-3 py-2"><button type="button" onclick={() => onSort("name")}>{labels.columnsMember} {marker("name")}</button></th>
      <th class="px-3 py-2"><button type="button" onclick={() => onSort("role")}>{labels.columnsRole} {marker("role")}</button></th>
      <th class="hidden px-3 py-2 sm:table-cell"><button type="button" onclick={() => onSort("joined")}>{labels.columnsJoined} {marker("joined")}</button></th>
      <th class="px-3 py-2"></th>
    </tr></thead>
    <tbody class="divide-y">
      {#each rows as member (member.userId)}
        <tr class:opacity-60={member.status !== "active"}>
          <td class="px-3 py-2"><div class="flex items-center gap-2.5">
            <span class="grid h-7 w-7 place-items-center rounded-full bg-muted text-[10px]">{initials(member)}</span>
            <div class="min-w-0"><p class="truncate font-medium">{displayName(member)}</p>{#if member.name && member.email}<p class="truncate text-xs text-muted-foreground">{member.email}</p>{/if}</div>
          </div></td>
          <td class="px-3 py-2">
            {#if member.status === "pending"}<span class="text-xs text-muted-foreground">{labels.pending}</span>
            {:else if canManage && onUpdateRole}
              <select class="rounded-md border bg-background px-2 py-1 text-xs" value={member.roleSlug}
                onchange={(event) => onUpdateRole?.({ userId: member.userId, roleSlug: event.currentTarget.value })}>
                {#each roles as role (role.slug)}<option value={role.slug}>{role.name}</option>{/each}
              </select>
            {:else}<RoleChip role={roleOf(member.roleSlug)} />{/if}
          </td>
          <td class="hidden px-3 py-2 text-xs text-muted-foreground sm:table-cell">{date(member.joinedAt)}</td>
          <td class="px-3 py-2"><MemberRowActions {canManage} onRemove={onRemove ? () => onRemove?.({ userId: member.userId }) : undefined} {labels} /></td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
