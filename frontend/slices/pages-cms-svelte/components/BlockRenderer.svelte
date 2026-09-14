<script lang="ts">
  import type { PageBlock } from "../../pages-cms/types";
  let { block }: { block: PageBlock } = $props();
</script>

{#if block.kind === "hero"}
  <section class="border-b bg-gradient-to-b from-muted/40 to-background py-16 text-center">
    <div class="mx-auto max-w-3xl px-4">
      <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">{block.headline}</h1>
      {#if block.sub}<p class="mt-4 text-lg text-muted-foreground">{block.sub}</p>{/if}
      {#if block.cta}<a class="mt-6 inline-flex rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background" href={block.cta.href}>{block.cta.label}</a>{/if}
    </div>
  </section>
{:else if block.kind === "text"}
  <section class="border-b py-10"><div class="mx-auto max-w-2xl px-4">
    {#if block.heading}<h2 class="text-2xl font-semibold tracking-tight">{block.heading}</h2>{/if}
    <p class="mt-4 whitespace-pre-wrap text-base text-muted-foreground">{block.body}</p>
  </div></section>
{:else if block.kind === "feature-list"}
  <section class="border-b py-12"><div class="mx-auto max-w-5xl px-4">
    {#if block.heading}<h2 class="mb-6 text-2xl font-semibold tracking-tight">{block.heading}</h2>{/if}
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#each block.items as item}<div class="rounded-lg border bg-card p-5"><h3 class="text-sm font-semibold">{item.title}</h3><p class="mt-2 text-sm text-muted-foreground">{item.body}</p></div>{/each}
    </div>
  </div></section>
{:else if block.kind === "cta"}
  <section class="border-y bg-foreground py-12 text-background"><div class="mx-auto max-w-3xl px-4 text-center">
    <h2 class="text-3xl font-bold tracking-tight">{block.headline}</h2>
    {#if block.sub}<p class="mt-3 text-base opacity-80">{block.sub}</p>{/if}
    <a class="mt-6 inline-flex rounded-md bg-background px-4 py-2 text-sm font-medium text-foreground" href={block.cta.href}>{block.cta.label}</a>
  </div></section>
{:else if block.kind === "logo-cloud"}
  <section class="border-b py-12"><div class="mx-auto max-w-5xl px-4 text-center">
    {#if block.heading}<p class="text-xs font-medium uppercase tracking-widest text-muted-foreground">{block.heading}</p>{/if}
    <div class="mt-6 flex flex-wrap justify-center gap-x-10 gap-y-4">{#each block.logos as logo}<span class="font-mono text-sm text-muted-foreground/70">{logo.label}</span>{/each}</div>
  </div></section>
{:else if block.kind === "testimonial"}
  <section class="border-b py-12"><div class="mx-auto max-w-2xl px-4 text-center">
    <blockquote class="text-xl italic text-foreground">“{block.quote}”</blockquote>
    <p class="mt-4 text-sm font-medium">{block.author}{block.role ? `, ${block.role}` : ""}</p>
  </div></section>
{:else if block.kind === "video"}
  <section class="border-b py-12"><div class="mx-auto max-w-3xl px-4">
    {#if block.heading}<h2 class="mb-4 text-2xl font-semibold tracking-tight">{block.heading}</h2>{/if}
    <div class="aspect-video overflow-hidden rounded-lg border bg-muted"><video src={block.src} controls class="size-full"><track kind="captions" /></video></div>
    {#if block.caption}<p class="mt-2 text-xs text-muted-foreground">{block.caption}</p>{/if}
  </div></section>
{:else if block.kind === "image-gallery"}
  <section class="border-b py-12"><div class="mx-auto max-w-5xl px-4">
    {#if block.heading}<h2 class="mb-6 text-2xl font-semibold tracking-tight">{block.heading}</h2>{/if}
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {#each block.images as image}<div class="aspect-[4/3] overflow-hidden rounded-md"><img src={image.src} alt={image.alt} class="size-full object-cover" loading="lazy" /></div>{/each}
    </div>
  </div></section>
{:else if block.kind === "faq"}
  <section class="border-b py-12"><div class="mx-auto max-w-2xl px-4">
    {#if block.heading}<h2 class="mb-6 text-2xl font-semibold tracking-tight">{block.heading}</h2>{/if}
    <dl class="space-y-4">{#each block.items as item}<div class="rounded-lg border bg-card p-4"><dt class="text-sm font-semibold">{item.q}</dt><dd class="mt-2 text-sm text-muted-foreground">{item.a}</dd></div>{/each}</dl>
  </div></section>
{:else if block.kind === "stats"}
  <section class="border-b py-12"><div class="mx-auto max-w-5xl px-4">
    {#if block.heading}<h2 class="mb-6 text-center text-2xl font-semibold tracking-tight">{block.heading}</h2>{/if}
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{#each block.items as item}<div class="text-center"><p class="text-3xl font-bold tabular-nums">{item.value}</p><p class="mt-1 text-xs text-muted-foreground">{item.label}</p></div>{/each}</div>
  </div></section>
{:else if block.kind === "pricing-table"}
  <section class="border-b py-12"><div class="mx-auto max-w-5xl px-4">
    {#if block.heading}<h2 class="mb-6 text-center text-2xl font-semibold tracking-tight">{block.heading}</h2>{/if}
    <div class="grid gap-4 sm:grid-cols-3">{#each block.tiers as tier}<div class={`rounded-lg border bg-card p-5 ${tier.featured ? "border-foreground" : ""}`}>
      <p class="text-sm font-semibold">{tier.name}</p><p class="mt-2 text-3xl font-bold">{tier.price}<span class="text-sm font-normal text-muted-foreground"> {tier.period ?? ""}</span></p>
      <ul class="mt-4 space-y-1 text-sm">{#each tier.bullets as bullet}<li>· {bullet}</li>{/each}</ul>
      {#if tier.cta}<a class={`mt-4 inline-flex w-full justify-center rounded-md border px-3 py-2 text-sm font-medium ${tier.featured ? "bg-foreground text-background" : ""}`} href={tier.cta.href}>{tier.cta.label}</a>{/if}
    </div>{/each}</div>
  </div></section>
{/if}
