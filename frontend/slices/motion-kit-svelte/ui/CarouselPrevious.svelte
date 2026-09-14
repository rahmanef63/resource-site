<script lang="ts">
  import { getCarouselContext } from "./carousel-context";
  type Props = { className?: string; label?: string };
  let { className = "", label = "Previous slide" }: Props = $props();
  const carousel = getCarouselContext();
  const snapshotStore = carousel.snapshot;
  let disabled = $derived(!$snapshotStore.canScrollPrev);
</script>

<button
  type="button"
  class={`inline-flex size-8 items-center justify-center rounded-full border border-input bg-background ${className}`.trim()}
  disabled={disabled}
  aria-label={label}
  onclick={() => carousel.scrollPrev()}
>
  <svg viewBox="0 0 24 24" class="size-4" aria-hidden="true">
    <path d="m15 18-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</button>
