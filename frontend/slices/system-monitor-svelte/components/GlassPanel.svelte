<script lang="ts">
  import type { Snippet } from "svelte";
  let { title, right, children }: { title: string; right?: string; children: Snippet } = $props();
</script>

<section class="rounded-xl border border-[color:var(--sep)] bg-[color:var(--glass-panel)] px-3.5 py-3">
  <div class="mb-2 flex items-center justify-between">
    <span class="text-[12.5px] font-bold text-foreground">{title}</span>
    {#if right}<span class="font-mono text-xs text-[color:var(--text-dim)]">{right}</span>{/if}
  </div>
  {@render children()}
</section>
