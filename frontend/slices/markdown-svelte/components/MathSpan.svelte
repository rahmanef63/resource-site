<script lang="ts">
  let { tex, display = false }: { tex: string; display?: boolean } = $props();
  let html = $state<string | null>(null);

  $effect(() => {
    let alive = true;
    html = null;
    void import("katex").then((module) => {
      if (!alive) return;
      html = module.default.renderToString(tex, { throwOnError: false, displayMode: display });
    });
    return () => { alive = false; };
  });
</script>

{#if html}
  {#if display}<div class="my-3 overflow-x-auto">{@html html}</div>{:else}<span>{@html html}</span>{/if}
{:else if display}
  <div class="my-3 overflow-x-auto"><code class="font-mono text-sm text-muted-foreground">{tex}</code></div>
{:else}
  <code class="font-mono text-[0.9em] text-muted-foreground">{tex}</code>
{/if}
