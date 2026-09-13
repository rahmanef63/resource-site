<script lang="ts">
  let {
    alreadySeeded,
    busy,
    onSeed,
  }: {
    alreadySeeded: boolean;
    busy: boolean;
    onSeed: () => void | Promise<void>;
  } = $props();
</script>

<div class="space-y-4">
  <div>
    <h1 class="text-xl font-semibold tracking-tight">Konten awal</h1>
    <p class="text-sm text-muted-foreground">Mulai dengan contoh, atau mulai kosong.</p>
  </div>
  <div class="rounded-lg border border-border/60 p-4">
    {#if alreadySeeded}
      <p class="text-sm text-muted-foreground">✓ Konten contoh sudah terisi.</p>
    {:else}
      <p class="mb-3 text-sm text-muted-foreground">
        Isi blog, portfolio, layanan, dan halaman depan dengan contoh biar langsung kelihatan.
      </p>
      <button
        type="button"
        class="h-10 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
        disabled={busy}
        onclick={() => onSeed()}
      >
        {busy ? "Memproses…" : "Isi konten contoh"}
      </button>
    {/if}
  </div>
</div>
