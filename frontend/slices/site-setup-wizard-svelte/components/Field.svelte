<script lang="ts">
  import type { Snippet } from "svelte";

  let { label, children }: { label: string; children: Snippet } = $props();
</script>

<div class="space-y-1.5">
  <div class="text-xs text-muted-foreground">{label}</div>
  {@render children()}
</div>
