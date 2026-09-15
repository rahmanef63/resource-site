<script lang="ts">
  import InviteDialog from "./InviteDialog.svelte"; import MembersTable from "./MembersTable.svelte"; import MembersToolbar from "./MembersToolbar.svelte"; import PendingInvites from "./PendingInvites.svelte";
  import { can } from "../../user-management/lib/can"; import { deriveMembersView, nextSort, type SortDir, type SortKey } from "../../user-management/lib/members-core";
  import { DEFAULT_MEMBERS_LABELS, type Invite, type InviteInput, type Member, type MembersLabels, type RoleOption } from "../../user-management/types";
  let { members, roles, currentPerms, onUpdateRole, onRemove, onInvite, invites, onCancelInvite, onResendInvite, allowPropagate = false, labels: overrides = {}, className = "" }: {
    members: Member[] | undefined; roles: RoleOption[]; currentPerms: readonly string[];
    onUpdateRole?: (input: { userId: string; roleSlug: string }) => void | Promise<void>; onRemove?: (input: { userId: string }) => void | Promise<void>;
    onInvite?: (input: InviteInput) => void | Promise<void>; invites?: Invite[]; onCancelInvite?: (input: { inviteId: string }) => void | Promise<void>;
    onResendInvite?: (input: { inviteId: string }) => void | Promise<void>; allowPropagate?: boolean; labels?: Partial<MembersLabels>; className?: string;
  } = $props();
  let query = $state(""); let roleFilter = $state("all"); let sortKey = $state<SortKey>("name"); let sortDir = $state<SortDir>("asc"); let inviteOpen = $state(false);
  let labels = $derived({ ...DEFAULT_MEMBERS_LABELS, ...overrides }); let canManage = $derived(can(currentPerms, "members.manage")); let canInvite = $derived(can(currentPerms, "members.invite"));
  let rows = $derived(deriveMembersView({ members, query, roleFilter, sortKey, sortDir })); let total = $derived(members?.length ?? 0); let showInvite = $derived(canInvite && !!onInvite);
  function sort(key: SortKey) { const next = nextSort(sortKey, sortDir, key); sortKey = next.sortKey; sortDir = next.sortDir; }
</script>

<div class={className}>
  <MembersToolbar {query} {roleFilter} {roles} canInvite={showInvite} onQuery={(value) => query = value} onRoleFilter={(value) => roleFilter = value} onInvite={() => inviteOpen = true} {labels} />
  {#if (canInvite || canManage) && invites?.length}<PendingInvites className="mt-3" {invites} {roles} canModify={canInvite} onCancel={onCancelInvite} onResend={onResendInvite} {labels} />{/if}
  <div class="mt-3 overflow-hidden rounded-lg border">
    {#if members === undefined}<p class="p-6 text-center text-sm text-muted-foreground">{labels.loading}</p>
    {:else if rows.length === 0}<p class="p-6 text-center text-sm text-muted-foreground">{labels.empty}</p>
    {:else}<MembersTable {rows} {roles} {canManage} {sortKey} {sortDir} onSort={sort} {onUpdateRole} {onRemove} {labels} />{/if}
  </div>
  {#if members !== undefined}<p class="mt-2 text-xs text-muted-foreground">{rows.length} of {total} member{total === 1 ? "" : "s"}</p>{/if}
  {#if onInvite}<InviteDialog open={inviteOpen} onOpenChange={(value) => inviteOpen = value} {roles} onSubmit={onInvite} {labels} {allowPropagate} />{/if}
</div>
