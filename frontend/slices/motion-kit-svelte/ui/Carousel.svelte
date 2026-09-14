<script lang="ts">
  import type { Snippet } from "svelte";
  import {
    createCarouselContext,
    setCarouselContext,
    type CarouselApi,
    type CarouselOptions,
    type CarouselOrientation,
    type CarouselPlugin,
  } from "./carousel-context";

  type Props = {
    orientation?: CarouselOrientation;
    opts?: CarouselOptions;
    plugins?: CarouselPlugin[];
    setApi?: (api: CarouselApi) => void;
    className?: string;
    children: Snippet;
  };

  let {
    orientation = "horizontal",
    opts,
    plugins = [],
    setApi,
    className = "",
    children,
  }: Props = $props();
  const carousel = createCarouselContext({
    orientation: () => orientation,
    opts: () => opts,
    plugins: () => plugins,
    setApi: () => setApi,
  });
  setCarouselContext(carousel);
</script>

<div
  class={`relative ${className}`.trim()}
  role="region"
  aria-roledescription="carousel"
  aria-label="Carousel"
  data-slot="carousel"
>
  {@render children()}
</div>
