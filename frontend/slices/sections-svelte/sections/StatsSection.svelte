<script lang="ts">
  import { cfgArray, isStatItem, isString, parseConfigObject, type StatItem } from "../../sections/sections/config";
  import type { LandingSection } from "../../sections/types";
  type Props = { section: LandingSection; stats: StatItem[]; clients?: string[]; locale?: string; class?: string };
  let { section, stats, clients, locale = "id-ID", class: className = "" }: Props = $props();
  let cfg = $derived(parseConfigObject(section.config));
  let items = $derived(cfgArray(cfg, "stats", isStatItem) ?? stats);
  let names = $derived(cfgArray(cfg, "clients", isString) ?? clients ?? []);
  const format = (value: number) => new Intl.NumberFormat(locale).format(value);
</script>
<div class={`mx-auto max-w-6xl px-4 py-14 sm:px-6 ${className}`.trim()}>
  {#if section.title || section.subtitle}<div class="mb-8 text-center">{#if section.title}<p class="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">{section.title}</p>{/if}{#if section.subtitle}<p class="mt-2 text-sm text-muted-foreground">{section.subtitle}</p>{/if}</div>{/if}
  <div class="grid grid-cols-2 gap-6 md:grid-cols-4">{#each items as item (item.label)}<div class="text-center"><p class="text-3xl font-semibold tabular-nums tracking-tight md:text-4xl">{item.prefix ?? ""}{format(item.value)}{item.suffix ?? ""}</p><p class="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{item.label}</p></div>{/each}</div>
  {#if names.length}<div class="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3">{#each names as name (name)}<span class="text-sm font-medium uppercase tracking-widest text-muted-foreground/70">{name}</span>{/each}</div>{/if}
</div>
