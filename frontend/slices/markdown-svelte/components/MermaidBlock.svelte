<script lang="ts">
  let { text }: { text: string } = $props();
  let svg = $state<string | null>(null);
  let failed = $state(false);
  let seq = 0;

  $effect(() => {
    let alive = true;
    svg = null;
    failed = false;
    void import("mermaid")
      .then((module) => {
        module.default.initialize({ startOnLoad: false, securityLevel: "strict", theme: "neutral" });
        return module.default.render(`md-svelte-mmd-${Date.now()}-${++seq}`, text);
      })
      .then((result) => { if (alive) svg = result.svg; })
      .catch(() => { if (alive) failed = true; });
    return () => { alive = false; };
  });
</script>

{#if failed}
  <pre class="my-3 overflow-x-auto rounded-md border border-destructive/40 bg-muted/40 p-3 text-xs"><code class="font-mono">{text}</code></pre>
{:else if svg}
  <div class="my-3 flex justify-center overflow-x-auto rounded-md border border-border bg-background p-3 [&_svg]:max-w-full">{@html svg}</div>
{:else}
  <div class="my-3 h-32 animate-pulse rounded-md border border-border bg-muted/30" aria-label="Rendering diagram…"></div>
{/if}
