<script lang="ts">
  import type { Snippet } from "svelte";
  import BrandMark from "./BrandMark.svelte";
  import {
    externalLinkAttrs,
    headerShowsInlineNav,
    orderedCtas,
    type BrandBase,
    type Cta,
    type HeaderLayout,
    type NavLink,
  } from "../../marketing-chrome/lib/core";

  type SvelteBrand = BrandBase & { logo?: Snippet };
  type Props = {
    brand: SvelteBrand;
    nav: NavLink[];
    cta?: Cta;
    secondaryCta?: Cta;
    layout?: HeaderLayout;
    sticky?: boolean;
    class?: string;
  };

  let {
    brand,
    nav,
    cta,
    secondaryCta,
    layout = "split",
    sticky = false,
    class: className = "",
  }: Props = $props();

  let menuOpen = $state(false);
  let menuDialog: HTMLDialogElement | undefined = $state();
  let showNav = $derived(headerShowsInlineNav(layout));
  let ctas = $derived(orderedCtas(secondaryCta, cta));

  $effect(() => {
    const dialog = menuDialog;
    if (!dialog) return;
    if (menuOpen && !dialog.open) dialog.showModal();
    if (!menuOpen && dialog.open) dialog.close();
  });

  function closeMenu() {
    menuOpen = false;
  }

  function onCancel(event: Event) {
    event.preventDefault();
    closeMenu();
  }

  function onBackdrop(event: MouseEvent) {
    if (event.target === menuDialog) closeMenu();
  }
</script>

{#snippet desktopNav(extraClass = "")}
  {#if nav.length > 0}
    <nav class={`flex items-center gap-6 ${extraClass}`}>
      {#each nav as item (`${item.href}:${item.label}`)}
        <a
          href={item.href}
          {...externalLinkAttrs(item.external)}
          class="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >{item.label}</a>
      {/each}
    </nav>
  {/if}
{/snippet}

{#snippet ctaButtons()}
  {#if secondaryCta}
    <a href={secondaryCta.href} class="inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
      {secondaryCta.label}
    </a>
  {/if}
  {#if cta}
    <a href={cta.href} class="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
      {cta.label}
    </a>
  {/if}
{/snippet}

<header class={`w-full border-b bg-background/80 backdrop-blur ${sticky ? "sticky top-0 z-40" : ""} ${className}`}>
  <div class={`mx-auto flex w-full max-w-6xl items-center gap-4 px-6 py-3 ${layout === "centered" ? "flex-col items-stretch sm:gap-2" : ""}`}>
    <div class="flex items-center justify-between gap-4">
      <BrandMark {brand} />

      {#if layout === "centered"}
        <div class="flex items-center gap-2 sm:hidden">
          <button type="button" class="inline-flex size-9 items-center justify-center rounded-md hover:bg-accent" aria-label="Open menu" aria-expanded={menuOpen} onclick={() => (menuOpen = true)}>
            <span aria-hidden="true" class="text-lg leading-none">☰</span>
          </button>
        </div>
      {:else}
        <div class="hidden items-center gap-2 md:flex">
          {#if layout === "split" && showNav}{@render desktopNav("mr-4")}{/if}
          {@render ctaButtons()}
        </div>
        <button type="button" class="inline-flex size-9 items-center justify-center rounded-md hover:bg-accent md:hidden" aria-label="Open menu" aria-expanded={menuOpen} onclick={() => (menuOpen = true)}>
          <span aria-hidden="true" class="text-lg leading-none">☰</span>
        </button>
      {/if}
    </div>

    {#if layout === "centered"}
      <div class="hidden items-center justify-center gap-6 sm:flex">
        {#if showNav}{@render desktopNav()}{/if}
        <span class="ml-auto flex items-center gap-2">{@render ctaButtons()}</span>
      </div>
    {/if}
  </div>
</header>

<dialog
  bind:this={menuDialog}
  class="ml-auto mr-0 h-full max-h-none w-72 border-l bg-background p-0 text-foreground backdrop:bg-black/40"
  aria-labelledby="marketing-menu-title"
  oncancel={onCancel}
  onclick={onBackdrop}
  onclose={() => (menuOpen = false)}
>
  <div class="flex h-full flex-col p-5" role="document">
    <div class="flex items-center justify-between gap-3">
      <strong id="marketing-menu-title" class="text-base">{brand.name}</strong>
      <button type="button" class="inline-flex size-9 items-center justify-center rounded-md hover:bg-accent" aria-label="Close menu" onclick={closeMenu}>×</button>
    </div>
    {#if nav.length > 0}
      <nav class="mt-6 flex flex-col gap-1">
        {#each nav as item (`mobile:${item.href}:${item.label}`)}
          <a
            href={item.href}
            {...externalLinkAttrs(item.external)}
            class="rounded-md px-2 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            onclick={closeMenu}
          >{item.label}</a>
        {/each}
      </nav>
    {/if}
    {#if ctas.length > 0}
      <div class="mt-6 flex flex-col gap-2">
        {#each ctas as item, index (`cta:${item.href}:${item.label}`)}
          <a
            href={item.href}
            class={`inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium ${index === ctas.length - 1 ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background"}`}
            onclick={closeMenu}
          >{item.label}</a>
        {/each}
      </div>
    {/if}
  </div>
</dialog>
