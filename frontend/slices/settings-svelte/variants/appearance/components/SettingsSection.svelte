<script lang="ts">
  import type { Snippet } from "svelte";
  let {
    title,
    icon = "",
    children,
  } = $props<{ title: string; icon?: string; children: Snippet }>();
</script>

<section class="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
  <header class="flex items-center gap-2 border-b px-5 py-4">
    {#if icon}<span aria-hidden="true" class="text-muted-foreground">{icon}</span>{/if}
    <h2 class="font-semibold">{title}</h2>
  </header>
  <div class="divide-y px-5">
    {@render children()}
  </div>
</section>
