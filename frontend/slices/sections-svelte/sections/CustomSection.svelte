<script lang="ts">
  import { ASPECT_RATIO_CLASS, type LandingSection } from "../../sections/types";
  import { cfgArray, cfgString, isString, parseConfigObject } from "../../sections/sections/config";
  type Props = { section: LandingSection; body?: string[]; class?: string };
  let { section, body = [], class: className = "" }: Props = $props();
  let cfg = $derived(parseConfigObject(section.config));
  let paragraphs = $derived(cfgArray(cfg, "body", isString) ?? body);
  let ctaLabel = $derived(cfgString(cfg, "ctaLabel"));
  let ctaHref = $derived(cfgString(cfg, "ctaHref"));
  let hasImage = $derived(Boolean(section.imageUrl));
</script>
<div class={`mx-auto max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 ${hasImage ? "grid items-center md:grid-cols-2" : "max-w-3xl"} ${className}`.trim()}><div><h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">{section.title}</h2>{#if section.subtitle}<p class="mt-3 text-base text-muted-foreground sm:text-lg">{section.subtitle}</p>{/if}{#if paragraphs.length}<div class="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{#each paragraphs as paragraph}<p>{paragraph}</p>{/each}</div>{/if}{#if ctaLabel && ctaHref}<a href={ctaHref} class="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">{ctaLabel} →</a>{/if}</div>{#if hasImage}<div class={`overflow-hidden rounded-2xl border border-border/60 shadow-lg ${ASPECT_RATIO_CLASS[section.imageRatio ?? "4:3"]}`}><img src={section.imageUrl} alt={section.title} class="h-full w-full object-cover" onerror={(event) => { event.currentTarget.parentElement!.style.display = "none"; }} /></div>{/if}</div>
