<script lang="ts">
  import { onMount } from "svelte";
  import { cfgArray, cfgNumber, isTestimonialItem, parseConfigObject, type TestimonialItem } from "../../sections/sections/config";
  import type { LandingSection } from "../../sections/types";
  type Props = { section: LandingSection; items: TestimonialItem[]; eyebrow?: string; class?: string };
  let { section, items, eyebrow = "Testimoni", class: className = "" }: Props = $props();
  let cfg = $derived(parseConfigObject(section.config));
  let list = $derived((cfgArray(cfg, "items", isTestimonialItem) ?? items).slice(0, cfgNumber(cfg, "limit") ?? 9));
  let index = $state(0);
  let current = $derived(list.length ? list[index % list.length] : undefined);
  function move(delta: number) { if (list.length) index = (index + delta + list.length) % list.length; }
  onMount(() => { const timer = setInterval(() => move(1), 4500); return () => clearInterval(timer); });
</script>
{#if current}
<div class={`mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 ${className}`.trim()}>
  <div class="mb-6 flex items-end justify-between gap-4"><div><p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p><h2 class="mt-2 text-2xl font-semibold tracking-tight">{section.title}</h2>{#if section.subtitle}<p class="mt-2 text-sm text-muted-foreground">{section.subtitle}</p>{/if}</div><div class="flex gap-2"><button type="button" aria-label="Previous testimonial" class="rounded-full border px-3 py-2" onclick={() => move(-1)}>←</button><button type="button" aria-label="Next testimonial" class="rounded-full border px-3 py-2" onclick={() => move(1)}>→</button></div></div>
  <article class="rounded-xl border border-border/60 bg-card/50 p-6">
    {#if typeof current.rating === "number"}<p aria-label={`${current.rating} dari 5`} class="text-amber-500">{"★".repeat(Math.max(0, Math.min(5, current.rating)))}<span class="text-muted-foreground/30">{"★".repeat(Math.max(0, 5 - current.rating))}</span></p>{/if}
    <blockquote class="mt-3 text-base leading-relaxed text-muted-foreground">“{current.quote}”</blockquote><p class="mt-5 text-sm font-medium">{current.author}</p>{#if current.role}<p class="text-xs text-muted-foreground">{current.role}</p>{/if}
  </article><p class="mt-3 text-center text-xs text-muted-foreground">{index % list.length + 1} / {list.length}</p>
</div>
{/if}
