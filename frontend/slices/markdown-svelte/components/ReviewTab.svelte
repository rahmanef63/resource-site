<script lang="ts">
  import type { MdComment } from "../../markdown/lib/comments";
  import { commentsFor } from "../../markdown/lib/comments";
  import type { MdNode } from "../../markdown/lib/parse";
  import MarkdownNodes from "./MarkdownNodes.svelte";
  import CommentList from "./CommentList.svelte";
  import Composer from "./Composer.svelte";

  let { nodes, comments, onAdd, onResolve }: {
    nodes: MdNode[];
    comments: MdComment[];
    onAdd: (anchor: number | null, text: string) => void;
    onResolve?: (id: string) => void;
  } = $props();

  let composing = $state<number | null>(null);
</script>

<div class="flex flex-col gap-1">
  {#each nodes as node, index}
    {@const anchored = commentsFor(comments, index)}
    {@const open = anchored.filter((comment) => !comment.resolved).length}
    <div class={`group relative rounded-md pr-8 ${open > 0 || composing === index ? "bg-amber-500/5" : ""}`}>
      <MarkdownNodes nodes={[node]} />
      <button
        class={`absolute right-0 top-1 grid size-6 place-items-center rounded text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 ${open > 0 || composing === index ? "opacity-100 text-amber-600" : ""}`}
        type="button"
        aria-label="Add comment"
        onclick={() => (composing = composing === index ? null : index)}
      >＋</button>
      {#if anchored.length > 0 || composing === index}
        <div class="mb-2 ml-4 border-l-2 border-amber-500/40 pl-3">
          <CommentList items={anchored} {onResolve} />
          {#if composing === index}
            <Composer
              autoFocus
              placeholder="Add a comment…"
              onSubmit={(text) => {
                onAdd(index, text);
                composing = null;
              }}
            />
          {/if}
        </div>
      {/if}
    </div>
  {/each}

  <div class="mt-4 border-t border-border pt-3">
    <p class="mb-2 text-xs font-medium text-muted-foreground">Document comments</p>
    <CommentList items={commentsFor(comments, null)} {onResolve} />
    <Composer placeholder="Comment on the whole document…" onSubmit={(text) => onAdd(null, text)} />
  </div>
</div>
