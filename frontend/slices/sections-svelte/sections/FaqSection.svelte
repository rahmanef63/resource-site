<script lang="ts">
  import { cfgArray, cfgString, isFaqItem, parseConfigObject, type FaqItem } from "../../sections/sections/config";
  import type { LandingSection } from "../../sections/types";
  type Props = { section: LandingSection; items: FaqItem[]; ctaLabel?: string; ctaHref?: string; ctaPrefix?: string; eyebrow?: string; class?: string };
  let { section, items, ctaLabel, ctaHref, ctaPrefix = "Masih ada pertanyaan?", eyebrow = "FAQ", class: className = "" }: Props = $props();
  let cfg = $derived(parseConfigObject(section.config));
  let list = $derived(cfgArray(cfg, "items", isFaqItem) ?? items);
  let label = $derived(cfgString(cfg, "ctaLabel") ?? ctaLabel);
  let href = $derived(cfgString(cfg, "ctaHref") ?? ctaHref);
  let prefix = $derived(cfgString(cfg, "ctaPrefix") ?? ctaPrefix);
</script>
{#if list.length}
<div class={`mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 ${className}`.trim()}>
  <div class="text-center"><p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p><h2 class="mt-2 text-2xl font-semibold tracking-tight">{section.title}</h2>{#if section.subtitle}<p class="mt-2 text-sm text-muted-foreground">{section.subtitle}</p>{/if}</div>
  <div class="mt-10 rounded-xl border border-border/60 bg-card/50 px-5">{#each list as item, i (item.q)}<details class="border-b last:border-b-0" open={i === 0}><summary class="cursor-pointer py-4 font-medium">{item.q}</summary><p class="pb-4 text-sm text-muted-foreground">{item.a}</p></details>{/each}</div>
  {#if label && href}<p class="mt-6 text-center text-sm text-muted-foreground">{prefix} <a href={href} class="font-medium text-foreground underline underline-offset-4">{label}</a></p>{/if}
</div>
{/if}
