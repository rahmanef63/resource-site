<script lang="ts">
  import { countAt } from "../../motion-kit/lib/core";
  import { useInView } from "./use-in-view";

  type Props = {
    value: number;
    duration?: number;
    format?: (value: number) => string;
    locale?: string;
    className?: string;
  };

  let {
    value,
    duration = 1200,
    format,
    locale = "id-ID",
    className = "",
  }: Props = $props();
  const { action: inViewAction, inView } = useInView();
  let display = $state(0);
  let text = $derived(format ? format(display) : display.toLocaleString(locale));

  $effect(() => {
    if (!$inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || duration <= 0) {
      display = value;
      return;
    }
    display = 0;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      display = countAt(value, progress);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });
</script>

<span use:inViewAction class={className}>{text}</span>
