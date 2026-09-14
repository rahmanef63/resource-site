<script lang="ts">
  import type { Snippet } from "svelte";
  import type { RevealVariant } from "../../motion-kit/lib/core";
  import { useInView } from "./use-in-view";

  type Props = {
    variant?: RevealVariant;
    delay?: number;
    scope?: boolean;
    className?: string;
    children: Snippet;
  };

  let {
    variant = "fade-up",
    delay = 0,
    scope = false,
    className = "",
    children,
  }: Props = $props();
  const { action: inViewAction, inView } = useInView();
  let classes = $derived([$inView ? "is-inview" : "", className].filter(Boolean).join(" "));
  let revealStyle = $derived(!scope && delay ? `--reveal-delay:${delay}ms` : undefined);
</script>

<div
  use:inViewAction
  data-reveal={scope ? undefined : variant}
  class={classes}
  style={revealStyle}
>
  {@render children()}
</div>
