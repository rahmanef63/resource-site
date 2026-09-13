<script lang="ts">
  import { onMount, setContext, type Snippet } from "svelte";
  import { SELECTION_CONTEXT } from "../lib/context";
  import { createSelectionApi } from "../lib/selection";

  type Props = {
    children: Snippet;
    onBulkDelete?: (ids: string[]) => void;
    onBulkDuplicate?: (ids: string[]) => void;
  };

  let { children, onBulkDelete, onBulkDuplicate }: Props = $props();
  const selection = createSelectionApi();
  setContext(SELECTION_CONTEXT, selection);
  let revision = $state(0);
  let size = $derived.by(() => {
    revision;
    return selection.size;
  });

  $effect(() => selection.subscribe((next) => (revision = next)));

  function clear() {
    selection.clear();
  }

  function removeSelected() {
    const ids = selection.snapshot();
    if (ids.length === 0) return;
    onBulkDelete?.(ids);
    clear();
  }

  function duplicateSelected() {
    const ids = selection.snapshot();
    if (ids.length === 0) return;
    onBulkDuplicate?.(ids);
  }

  onMount(() => {
    const onKey = (event: KeyboardEvent) => {
      if (selection.size === 0) return;
      if (event.key === "Escape") {
        clear();
        return;
      }
      const target = event.target as HTMLElement | null;
      const editing = target?.getAttribute?.("contenteditable") === "true";
      if (!editing && (event.key === "Backspace" || event.key === "Delete")) {
        event.preventDefault();
        removeSelected();
      }
    };
    const onDown = (event: PointerEvent) => {
      if (selection.size === 0 || event.shiftKey || event.metaKey || event.ctrlKey) return;
      const target = event.target as HTMLElement;
      if (target.closest("[data-selectable-id],[data-no-marquee],[data-selection-toolbar]")) return;
      clear();
    };
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onDown, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onDown, true);
    };
  });
</script>

{@render children()}

{#if size > 0}
  <div
    data-selection-toolbar
    class="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-md border border-border bg-popover px-3 py-1.5 text-sm shadow-md"
    role="toolbar"
    aria-label="Selection actions"
  >
    <span class="text-muted-foreground">{size} selected</span>
    {#if onBulkDuplicate}
      <button type="button" class="rounded px-2 py-0.5 font-medium hover:bg-muted" onclick={duplicateSelected}>Duplicate</button>
    {/if}
    <button type="button" class="rounded px-2 py-0.5 font-medium text-destructive hover:bg-destructive/10" onclick={removeSelected}>Delete</button>
    <button type="button" class="rounded px-2 py-0.5 text-muted-foreground hover:bg-muted" onclick={clear}>Clear</button>
  </div>
{/if}
