<script lang="ts">
  import type { Snippet } from "svelte";
  import { getCarouselContext } from "./carousel-context";

  type Props = { className?: string; children: Snippet };
  let { className = "", children }: Props = $props();
  const carousel = getCarouselContext();
  let classes = $derived([
    "min-w-0 shrink-0 grow-0 basis-full",
    carousel.orientation() === "horizontal" ? "pl-4" : "pt-4",
    className,
  ].filter(Boolean).join(" "));
</script>

<div role="group" aria-roledescription="slide" data-slot="carousel-item" class={classes}>
  {@render children()}
</div>
