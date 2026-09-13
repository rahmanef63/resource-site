<script lang="ts">
  import type { Snippet } from "svelte";

  let { section, children }: { section: string; children: Snippet } = $props();
</script>

{#key section}
  <svelte:boundary>
    {@render children()}
    {#snippet failed(error)}
      <section class="card">
        <h2>Couldn’t load this section</h2>
        <p class="sub">It hit an error and couldn’t render — the rest of the app is fine. Try another section, or reload.</p>
        <p class="mono danger" style="font-size:.78rem;word-break:break-word">
          {String(error instanceof Error ? error.message : error).slice(0, 300)}
        </p>
      </section>
    {/snippet}
  </svelte:boundary>
{/key}
