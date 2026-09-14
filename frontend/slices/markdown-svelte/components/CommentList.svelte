<script lang="ts">
  import type { MdComment } from "../../markdown/lib/comments";
  let { items, onResolve }: { items: MdComment[]; onResolve?: (id: string) => void } = $props();
</script>

{#if items.length}
  <ul class="mb-2 space-y-1.5">
    {#each items as comment (comment.id)}
      <li class={`flex items-start justify-between gap-2 rounded-md bg-muted/40 px-2.5 py-1.5 text-xs ${comment.resolved ? "opacity-50" : ""}`}>
        <div>
          {#if comment.author}<span class="mr-1.5 font-semibold">{comment.author}</span>{/if}
          <span class={comment.resolved ? "line-through" : ""}>{comment.text}</span>
        </div>
        {#if onResolve && !comment.resolved}
          <button class="grid size-5 shrink-0 place-items-center rounded text-muted-foreground hover:bg-muted" type="button" onclick={() => onResolve?.(comment.id)} aria-label="Resolve">✓</button>
        {/if}
      </li>
    {/each}
  </ul>
{/if}
