<script lang="ts">
  import type { InviteInput, InviteStrategy, MembersLabels, RoleOption } from "../../user-management/types";
  let { open, roles, defaultRoleSlug, onOpenChange, onSubmit, labels, allowPropagate = false, defaultMaxDepth = 3 }: {
    open: boolean; roles: RoleOption[]; defaultRoleSlug?: string; onOpenChange: (open: boolean) => void;
    onSubmit: (input: InviteInput) => void | Promise<void>; labels: MembersLabels; allowPropagate?: boolean; defaultMaxDepth?: number;
  } = $props();
  let email = $state(""); let roleOverride = $state(""); let message = $state("");
  let propagate = $state(false); let strategy = $state<InviteStrategy>("same"); let maxDepthOverride = $state<number | undefined>(); let pending = $state(false);
  let roleSlug = $derived(roleOverride || defaultRoleSlug || roles.at(-1)?.slug || ""); let maxDepth = $derived(maxDepthOverride ?? defaultMaxDepth);
  async function submit(event: SubmitEvent) {
    event.preventDefault(); if (!email.trim()) return; pending = true;
    try {
      await onSubmit({ email: email.trim(), roleSlug, message: message.trim() || undefined,
        ...(allowPropagate && propagate ? { propagate: true, strategy, maxDepth } : {}) });
      email = ""; roleOverride = ""; message = ""; propagate = false; maxDepthOverride = undefined; onOpenChange(false);
    } finally { pending = false; }
  }
</script>

{#if open}
  <dialog open class="fixed inset-0 z-50 m-auto w-[min(92vw,30rem)] rounded-xl border bg-background p-0 shadow-xl">
    <form class="space-y-4 p-5" onsubmit={submit}>
      <header><h2 class="text-lg font-semibold">{labels.inviteTitle}</h2><p class="text-sm text-muted-foreground">{labels.inviteDescription}</p></header>
      <label class="grid gap-1.5 text-sm">{labels.inviteEmail}<input class="rounded-md border bg-background px-3 py-2" type="email" required bind:value={email} autocomplete="email" placeholder="name@company.com" /></label>
      <label class="grid gap-1.5 text-sm">{labels.inviteRole}<select class="rounded-md border bg-background px-3 py-2" value={roleSlug} onchange={(e) => roleOverride = e.currentTarget.value}>{#each roles as role (role.slug)}<option value={role.slug}>{role.name}</option>{/each}</select></label>
      <label class="grid gap-1.5 text-sm">{labels.inviteMessage}<textarea class="rounded-md border bg-background px-3 py-2" rows="2" bind:value={message} placeholder={labels.inviteMessagePlaceholder}></textarea></label>
      {#if allowPropagate}
        <section class="space-y-2 rounded-md border p-3">
          <label class="flex items-center justify-between gap-3 text-sm"><span>{labels.propagate}</span><input type="checkbox" bind:checked={propagate} /></label>
          <p class="text-xs text-muted-foreground">{labels.propagateHint}</p>
          {#if propagate}<div class="grid gap-2 sm:grid-cols-2">
            <label class="grid gap-1 text-xs">Strategy<select class="rounded-md border bg-background px-2 py-1.5" bind:value={strategy}><option value="same">{labels.strategySame}</option><option value="decreasing">{labels.strategyStep}</option></select></label>
            <label class="grid gap-1 text-xs">{labels.maxDepth}<input class="rounded-md border bg-background px-2 py-1.5" type="number" min="1" max="10" value={maxDepth} oninput={(event) => maxDepthOverride = Number(event.currentTarget.value) || 1} /></label>
          </div>{/if}
        </section>
      {/if}
      <footer class="flex justify-end gap-2"><button type="button" class="rounded-md px-3 py-2 text-sm" onclick={() => onOpenChange(false)}>{labels.cancel}</button><button type="submit" class="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground" disabled={pending || !email.trim()}>{pending ? labels.inviteSending : labels.inviteSubmit}</button></footer>
    </form>
  </dialog>
{/if}
