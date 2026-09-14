<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import {
    observeInView,
    staggerDelay,
    type RevealVariant,
  } from "../../motion-kit/lib/core";

  type Props = {
    step?: number;
    cap?: number;
    variant?: RevealVariant;
    itemClassName?: string;
    children: Snippet;
  };

  let {
    step = 80,
    cap = 400,
    variant = "fade-up",
    itemClassName = "",
    children,
  }: Props = $props();
  let container = $state<HTMLDivElement>();

  onMount(() => {
    if (!container) return;
    const cleanup: Array<() => void> = [];
    const itemClasses = itemClassName.split(/\s+/).filter(Boolean);
    for (const [index, child] of [...container.children].entries()) {
      if (!(child instanceof HTMLElement)) continue;
      child.dataset.reveal = variant;
      child.style.setProperty("--reveal-delay", `${staggerDelay(index, step, cap)}ms`);
      child.classList.add(...itemClasses);
      cleanup.push(observeInView(child, (visible) => child.classList.toggle("is-inview", visible)));
    }
    return () => cleanup.forEach((dispose) => dispose());
  });
</script>

<div bind:this={container} style="display: contents">
  {@render children()}
</div>
