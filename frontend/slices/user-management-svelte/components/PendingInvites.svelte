<script lang="ts">
  import RoleChip from "./RoleChip.svelte";
  import type { Invite, MembersLabels, RoleOption } from "../../user-management/types";
  let { invites, roles, canModify, onCancel, onResend, labels, className = "" }: {
    invites: Invite[]; roles: RoleOption[]; canModify: boolean;
    onCancel?: (input: { inviteId: string }) => void | Promise<void>;
    onResend?: (input: { inviteId: string }) => void | Promise<void>;
    labels: MembersLabels; className?: string;
  } = $props();
  let pending = $derived(invites.filter((invite) => invite.status === "pending"));
  const roleOf = (slug: string) => roles.find((role) => role.slug === slug) ?? { slug, name: slug };
</script>

{#if pending.length}
  <section class={`rounded-lg border border-dashed ${className}`}>
    <p class="border-b px-3 py-2 text-xs font-medium text-muted-foreground">{labels.pendingTitle} ({pending.length})</p>
    <ul class="divide-y">
      {#each pending as invite (invite.id)}
        <li class="flex flex-wrap items-center gap-2 px-3 py-2">
          <span class="truncate text-sm">{invite.email}</span><RoleChip role={roleOf(invite.roleSlug)} />
          <span class="ml-auto text-xs text-muted-foreground">{labels.pending}</span>
          {#if canModify && onResend}<button type="button" class="text-xs underline" onclick={() => onResend?.({ inviteId: invite.id })}>{labels.resend}</button>{/if}
          {#if canModify && onCancel}<button type="button" class="text-xs text-destructive underline" onclick={() => onCancel?.({ inviteId: invite.id })}>{labels.cancelInvite}</button>{/if}
        </li>
      {/each}
    </ul>
  </section>
{/if}
