<script lang="ts">
  import { cfgArray, cfgString, isPricingTier, parseConfigObject, type PricingTier } from "../../sections/sections/config";
  import type { LandingSection } from "../../sections/types";
  type Props = { section: LandingSection; tiers: PricingTier[]; featuredBadge?: string; eyebrow?: string; class?: string };
  let { section, tiers, featuredBadge = "Paling populer", eyebrow = "Harga", class: className = "" }: Props = $props();
  let cfg = $derived(parseConfigObject(section.config));
  let list = $derived(cfgArray(cfg, "tiers", isPricingTier) ?? tiers);
  let eyebrowText = $derived(cfgString(cfg, "eyebrow") ?? eyebrow);
</script>
{#if list.length}
<div class={`mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 ${className}`.trim()}>
  <div class="text-center"><p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{eyebrowText}</p><h2 class="mt-2 text-2xl font-semibold tracking-tight">{section.title}</h2>{#if section.subtitle}<p class="mt-2 text-sm text-muted-foreground">{section.subtitle}</p>{/if}</div>
  <div class="mx-auto mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{#each list as tier (tier.name)}<article class={`relative flex h-full flex-col gap-4 rounded-xl border bg-card/50 p-6 ${tier.featured ? "ring-1 ring-foreground/20 shadow-md" : "border-border/60"}`}>{#if tier.featured}<span class="absolute -top-3 left-5 rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">{featuredBadge}</span>{/if}<div><p class="text-sm font-medium uppercase tracking-wider text-muted-foreground">{tier.name}</p><p class="mt-2"><span class="text-3xl font-semibold">{tier.price}</span>{#if tier.period}<span class="text-sm text-muted-foreground"> {tier.period}</span>{/if}</p>{#if tier.blurb}<p class="mt-2 text-sm text-muted-foreground">{tier.blurb}</p>{/if}</div><ul class="flex-1 space-y-2 text-sm">{#each tier.features as feature (feature)}<li class="flex gap-2"><span>✓</span><span class="text-muted-foreground">{feature}</span></li>{/each}</ul>{#if tier.ctaHref}<a class={`rounded-md px-4 py-2 text-center text-sm font-medium ${tier.featured ? "bg-primary text-primary-foreground" : "border"}`} href={tier.ctaHref}>{tier.ctaLabel ?? "Pilih paket"} →</a>{/if}</article>{/each}</div>
</div>
{/if}
