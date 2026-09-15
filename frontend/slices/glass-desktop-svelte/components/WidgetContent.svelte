<script lang="ts">
  import { onMount } from "svelte";
  import { widgetDisplay } from "../../glass-desktop/lib/widget-display";
  import type { WidgetDescriptor, WidgetInstance } from "../../glass-desktop/types";
  let { instance, descriptor }: { instance: WidgetInstance; descriptor: WidgetDescriptor } = $props();
  let now = $state(new Date());
  let display = $derived(widgetDisplay(instance, descriptor, now));
  onMount(() => {
    if (descriptor.family !== "time" && descriptor.id !== "date-badge") return;
    const timer = window.setInterval(() => (now = new Date()), 1000);
    return () => window.clearInterval(timer);
  });
</script>
<div class="content" data-family={descriptor.family}>
  <span class="eyebrow">{descriptor.title}</span>
  <strong>{display.primary}</strong>
  {#if display.secondary}<span class="secondary">{display.secondary}</span>{/if}
  {#if display.detail}<span class="detail">{display.detail}</span>{/if}
  {#if display.progress !== undefined}
    <span class="meter" aria-label={`${display.progress}%`}><span style:width={`${display.progress}%`}></span></span>
  {/if}
  {#if display.chips?.length}<span class="chips">{#each display.chips as chip (chip)}<span>{chip}</span>{/each}</span>{/if}
</div>
<style>
  .content{height:100%;display:flex;flex-direction:column;justify-content:center;gap:.25rem;min-width:0}.eyebrow{font-size:.62rem;text-transform:uppercase;letter-spacing:.08em;color:var(--color-ink-low);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}strong{font-size:clamp(1rem,1.9vw,1.65rem);line-height:1.05;color:var(--color-ink-hi);font-family:var(--font-numeric);font-weight:600}.secondary,.detail{font-size:.72rem;color:var(--color-ink-mid);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.detail{color:var(--color-ink-low)}.meter{height:4px;border-radius:99px;background:var(--color-hairline);overflow:hidden;margin-top:.25rem}.meter>span{display:block;height:100%;border-radius:inherit;background:var(--color-accent-blue)}.chips{display:flex;gap:.3rem;flex-wrap:wrap;margin-top:.15rem}.chips>span{border:1px solid var(--color-hairline);border-radius:999px;padding:.12rem .4rem;font-size:.62rem;color:var(--color-ink-mid)}[data-family="weather"] strong{color:var(--color-accent-blue)}[data-family="finance"] strong{color:var(--color-accent-green)}[data-family="timers"] strong{color:var(--color-accent-amber)}[data-family="social"] strong{color:var(--color-accent-violet)}
</style>
