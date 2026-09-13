<script lang="ts">
  import type { Snippet } from "svelte";
  import BrandMark from "./BrandMark.svelte";
  import {
    SOCIAL_TEXT,
    type BrandBase,
    type FooterColumn,
    type FooterLayout,
    type LegalLink,
    type SocialLink,
  } from "../../marketing-chrome/lib/core";

  type SvelteBrand = BrandBase & { logo?: Snippet };
  type Props = {
    brand: SvelteBrand;
    columns?: FooterColumn[];
    social?: SocialLink[];
    legal?: LegalLink[];
    copyright?: string;
    layout?: FooterLayout;
    class?: string;
  };

  let {
    brand,
    columns = [],
    social = [],
    legal = [],
    copyright,
    layout = "columns",
    class: className = "",
  }: Props = $props();
</script>

{#snippet socialLinks()}
  {#if social.length > 0}
    <div class="flex items-center gap-3">
      {#each social as item (`${item.kind}:${item.href}`)}
        <a
          href={item.href}
          aria-label={item.kind}
          target="_blank"
          rel="noreferrer noopener"
          class="inline-flex min-w-5 items-center justify-center text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >{SOCIAL_TEXT[item.kind]}</a>
      {/each}
    </div>
  {/if}
{/snippet}

{#if layout === "slim"}
  <footer class={`w-full border-t bg-background ${className}`}>
    <div class="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row">
      <BrandMark {brand} />
      <div class="flex items-center gap-4 text-xs text-muted-foreground">
        {#each legal as item (`${item.href}:${item.label}`)}
          <a href={item.href} class="transition-colors hover:text-foreground">{item.label}</a>
        {/each}
        {#if copyright}<span>{copyright}</span>{/if}
      </div>
      {@render socialLinks()}
    </div>
  </footer>
{:else}
  <footer class={`w-full border-t bg-background ${className}`}>
    <div class="mx-auto w-full max-w-6xl px-6 py-12">
      <div class="grid gap-10 md:grid-cols-[1.5fr_repeat(auto-fit,minmax(0,1fr))]">
        <div class="flex flex-col gap-4">
          <BrandMark {brand} />
          {@render socialLinks()}
        </div>
        {#each columns as column (column.heading)}
          <div class="flex flex-col gap-3">
            <h3 class="text-sm font-semibold">{column.heading}</h3>
            <ul class="flex flex-col gap-2">
              {#each column.links as item (`${item.href}:${item.label}`)}
                <li><a href={item.href} class="text-sm text-muted-foreground transition-colors hover:text-foreground">{item.label}</a></li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
      <div class="my-8 h-px bg-border" aria-hidden="true"></div>
      <div class="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <span>{copyright}</span>
        {#if legal.length > 0}
          <div class="flex items-center gap-4">
            {#each legal as item (`legal:${item.href}:${item.label}`)}
              <a href={item.href} class="transition-colors hover:text-foreground">{item.label}</a>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </footer>
{/if}
