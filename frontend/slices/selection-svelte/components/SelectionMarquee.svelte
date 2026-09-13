<script lang="ts">
  import { getContext } from "svelte";
  import { SELECTION_CONTEXT, type SelectionContext } from "../lib/context";
  import { attachMarquee, type MarqueeRect } from "../lib/marquee";

  type Props = {
    container: HTMLElement | null;
    skipSelector?: string;
    autocad?: boolean;
  };

  let { container, skipSelector, autocad = true }: Props = $props();
  const selection = getContext<SelectionContext | undefined>(SELECTION_CONTEXT);
  let rect = $state<MarqueeRect | null>(null);

  $effect(() => {
    if (!selection || !container) return;
    return attachMarquee({
      container,
      skipSelector,
      autocad,
      getBaseline: () => selection.snapshot(),
      onDragStart: (additive) => {
        if (!additive) selection.clear();
      },
      onSelect: (ids) => selection.setIds(ids),
      onRect: (next) => (rect = next),
    });
  });
</script>

{#if selection && rect}
  <div
    aria-hidden="true"
    class={`pointer-events-none absolute z-40 rounded-sm ${rect.mode === "window" ? "bg-primary/10 ring-1 ring-primary/60" : "bg-emerald-500/10 outline-dashed outline-1 outline-emerald-500/70"}`}
    style={`left:${rect.x}px;top:${rect.y}px;width:${rect.w}px;height:${rect.h}px`}
  ></div>
{/if}
