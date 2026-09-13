<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import { SELECTION_CONTEXT, type SelectionContext } from "../lib/context";

  type Props = {
    id: string;
    orderedIds: string[];
    children: Snippet;
    class?: string;
    style?: string;
    edges?: boolean;
  };

  let {
    id,
    orderedIds,
    children,
    class: className = "",
    style = "",
    edges = true,
  }: Props = $props();
  const selection = getContext<SelectionContext | undefined>(SELECTION_CONTEXT);
  let revision = $state(0);
  let selected = $derived.by(() => {
    revision;
    return selection?.isSelected(id) ?? false;
  });

  $effect(() => selection?.subscribe((next) => (revision = next)));

  function select(event: MouseEvent) {
    event.preventDefault();
    if (!selection) return;
    if (event.shiftKey) selection.selectRange(id, orderedIds);
    else if (event.metaKey || event.ctrlKey) selection.toggle(id);
    else selection.selectOnly(id);
  }
</script>

{#if selection}
  <div
    data-selectable-id={id}
    data-block-selected={selected || undefined}
    class={`relative rounded-sm transition-colors ${selected ? "bg-primary/10 ring-2 ring-primary/50" : ""} ${className}`}
    {style}
  >
    {#if edges}
      <div data-selectable-edge data-no-marquee aria-hidden="true" class="absolute inset-x-0 top-0 z-10 h-1.5 cursor-pointer" onmousedown={select}></div>
    {/if}
    {@render children()}
    {#if edges}
      <div data-selectable-edge data-no-marquee aria-hidden="true" class="absolute inset-x-0 bottom-0 z-10 h-1.5 cursor-pointer" onmousedown={select}></div>
    {/if}
  </div>
{:else}
  {@render children()}
{/if}
