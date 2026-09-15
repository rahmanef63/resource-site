<script lang="ts">
  import type { Generation } from "@/features/ai-workspace/variants/studio/types";
  let { history, activeId, onSelect }: { history: Generation[]; activeId: string | null; onSelect: (id: string) => void } = $props();
</script>

<aside class="flex w-full shrink-0 flex-col rounded-lg border bg-card lg:w-64">
  <div class="border-b px-4 py-3 text-sm font-medium">⑂ Version tree</div>
  {#if history.length === 0}
    <p class="px-4 py-6 text-center text-xs text-muted-foreground">No generations yet. Write a prompt to start.</p>
  {:else}
    <ul class="space-y-1 p-2">
      {#each history as generation (generation.id)}
        <li><button type="button" class={`w-full rounded-md px-2 py-2 text-left text-xs ${generation.id === activeId ? "bg-accent" : "hover:bg-muted"}`} onclick={() => onSelect(generation.id)} aria-label={`Open generation: ${generation.prompt}`}>
          <span class="flex gap-1.5"><span>{generation.parentId ? "⑂" : "✦"}</span><span class="truncate">{generation.prompt}</span></span>
          <span class="mt-1 block text-[10px] uppercase tracking-wide text-muted-foreground">{generation.kind}</span>
        </button></li>
      {/each}
    </ul>
  {/if}
</aside>
