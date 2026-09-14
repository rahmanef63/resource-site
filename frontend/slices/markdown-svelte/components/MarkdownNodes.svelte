<script lang="ts">
  import type { MdNode } from "../../markdown/lib/parse";
  import { groupMarkdownNodes, listItemMargin } from "../../markdown/lib/render-core";
  import Inline from "./Inline.svelte";
  import MdNodeView from "./MdNodeView.svelte";

  let { nodes }: { nodes: MdNode[] } = $props();
  const groups = $derived(groupMarkdownNodes(nodes));
</script>

{#each groups as group}
  {#if group.kind === "node"}
    <MdNodeView node={group.node} />
  {:else if group.ordered}
    <ol class="my-2 list-decimal space-y-1 pl-5">
      {#each group.items as item}
        <li class="text-sm leading-relaxed" style:margin-left={listItemMargin(item.indent)}><Inline text={item.text} /></li>
      {/each}
    </ol>
  {:else}
    <ul class="my-2 list-none space-y-1 pl-5">
      {#each group.items as item}
        {#if item.type === "todo"}
          <li class="flex items-start gap-2 text-sm leading-relaxed" style:margin-left={listItemMargin(item.indent)}>
            <span class={`mt-0.5 grid size-4 shrink-0 place-items-center rounded border ${item.checked ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"}`}>{item.checked ? "✓" : ""}</span>
            <span class={item.checked ? "text-muted-foreground line-through" : ""}><Inline text={item.text} /></span>
          </li>
        {:else}
          <li class="text-sm leading-relaxed" style:margin-left={listItemMargin(item.indent)}><Inline text={item.text} /></li>
        {/if}
      {/each}
    </ul>
  {/if}
{/each}
