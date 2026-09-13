<script lang="ts">
  let { siteName }: { siteName: string } = $props();
</script>

<div class="space-y-3">
  <h1 class="text-xl font-semibold tracking-tight">Siap!</h1>
  <p class="text-sm text-muted-foreground">
    {#if siteName}<b>{siteName}</b> siap dikelola. {/if}
    Klik selesai untuk masuk dashboard. Semua ini bisa kamu ubah lagi di menu Settings.
  </p>
</div>
