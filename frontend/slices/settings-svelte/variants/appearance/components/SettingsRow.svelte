<script lang="ts">
  import type { Snippet } from "svelte";
  let { label, children } = $props<{ label: string; children: Snippet }>();
</script>

<div class="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
  <span class="text-sm font-medium">{label}</span>
  <div class="min-w-0 sm:max-w-[70%]">{@render children()}</div>
</div>
