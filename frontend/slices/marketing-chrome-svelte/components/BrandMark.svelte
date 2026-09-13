<script lang="ts">
  import type { Snippet } from "svelte";
  import type { BrandBase } from "../../marketing-chrome/lib/core";

  type SvelteBrand = BrandBase & { logo?: Snippet };
  let { brand }: { brand: SvelteBrand } = $props();
</script>

{#snippet mark()}
  <span class="flex items-center gap-2 font-semibold tracking-tight">
    {#if brand.logo}{@render brand.logo()}{/if}
    <span>{brand.name}</span>
  </span>
{/snippet}

{#if brand.href}
  <a href={brand.href} class="transition-opacity hover:opacity-80">{@render mark()}</a>
{:else}
  {@render mark()}
{/if}
