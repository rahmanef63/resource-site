<script lang="ts">
  import EmblaCarousel from "embla-carousel";
  import { onMount, type Snippet } from "svelte";
  import { getCarouselContext } from "./carousel-context";

  type Props = { className?: string; children: Snippet };
  let { className = "", children }: Props = $props();
  const carousel = getCarouselContext();
  let viewport = $state<HTMLDivElement>();
  let trackClass = $derived([
    "flex",
    carousel.orientation() === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
    className,
  ].filter(Boolean).join(" "));

  onMount(() => {
    if (!viewport) return;
    const api = EmblaCarousel(
      viewport,
      { ...carousel.opts, axis: carousel.orientation() === "horizontal" ? "x" : "y" },
      carousel.plugins,
    );
    const disconnect = carousel.connect(api);
    return () => {
      disconnect();
      api.destroy();
    };
  });
</script>

<div bind:this={viewport} class="overflow-hidden" data-slot="carousel-content">
  <div class={trackClass}>{@render children()}</div>
</div>
