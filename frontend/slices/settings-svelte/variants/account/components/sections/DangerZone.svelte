<script lang="ts">
  let {
    onDeleteAccount = undefined,
  } = $props<{ onDeleteAccount?: () => void | Promise<void> }>();

  let confirming = $state(false);
  let busy = $state(false);

  async function confirmDelete() {
    if (!onDeleteAccount) return;
    busy = true;
    try {
      await onDeleteAccount();
      confirming = false;
    } finally {
      busy = false;
    }
  }
</script>

<section class="rounded-xl border border-destructive/40 bg-card text-card-foreground shadow-sm">
  <header class="space-y-1.5 border-b border-destructive/20 px-5 py-4">
    <h2 class="font-semibold text-destructive">Danger zone</h2>
    <p class="text-sm text-muted-foreground">Irreversible actions. Proceed with caution.</p>
  </header>
  <div class="p-5">
    <div class="flex flex-col gap-3 rounded-lg border border-destructive/40 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="space-y-0.5">
        <p class="text-sm font-medium">Delete account</p>
        <p class="text-sm text-muted-foreground">Permanently remove your account and all associated data.</p>
      </div>
      <button
        type="button"
        disabled={busy}
        onclick={() => (confirming = true)}
        class="rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
      >
        {busy ? "Deleting…" : "Delete account"}
      </button>
    </div>

    {#if confirming}
      <div class="mt-4 rounded-lg border bg-background p-4" role="alertdialog" aria-labelledby="delete-account-title" aria-describedby="delete-account-description">
        <h3 id="delete-account-title" class="font-semibold">Delete your account?</h3>
        <p id="delete-account-description" class="mt-1 text-sm text-muted-foreground">This action cannot be undone. All your data will be permanently erased.</p>
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" disabled={busy} onclick={() => (confirming = false)} class="rounded-md border px-3 py-2 text-sm hover:bg-accent">Cancel</button>
          <button type="button" disabled={busy} onclick={confirmDelete} class="rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50">Confirm delete</button>
        </div>
      </div>
    {/if}
  </div>
</section>
