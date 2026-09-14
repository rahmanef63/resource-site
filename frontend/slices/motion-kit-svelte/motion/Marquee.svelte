<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    speed?: number;
    className?: string;
    children: Snippet;
  };

  let { speed = 36, className = "", children }: Props = $props();
  let classes = $derived([
    "motion-marquee relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
    className,
  ].filter(Boolean).join(" "));
</script>

<div class={classes}>
  <div
    class="motion-marquee-track flex w-max items-center gap-10"
    style={`animation-duration:${speed}s`}
  >
    <div class="flex shrink-0 items-center gap-10">{@render children()}</div>
    <div class="flex shrink-0 items-center gap-10" aria-hidden="true">{@render children()}</div>
  </div>
</div>
