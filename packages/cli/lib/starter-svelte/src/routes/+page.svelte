<script lang="ts">
  let count = $state(0);
</script>

<svelte:head>
  <title>__APP_NAME__</title>
  <meta name="description" content="SvelteKit app scaffolded with Rahman Resources" />
</svelte:head>

<main class="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-6 px-6 py-16">
  <p class="text-sm font-medium text-neutral-400">Rahman Resources · SvelteKit</p>
  <h1 class="text-4xl font-semibold tracking-tight">__APP_NAME__</h1>
  <p class="max-w-xl text-neutral-400">
    Svelte 5 base is ready. Add any active slice with the explicit SvelteKit distribution.
  </p>
  <div class="flex flex-wrap gap-3">
    <button class="rounded-lg border border-white/15 px-4 py-2" onclick={() => count++}>
      Runes check: {count}
    </button>
    <code class="rounded-lg bg-white/5 px-4 py-2 text-sm">bunx rr add appshell --framework sveltekit</code>
  </div>
</main>
