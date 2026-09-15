<script lang="ts">
  import { isActive } from "../../dashboard-shell/lib/nav";
  import type { Brand, NavGroup, NavItem, ShellSlot } from "../types";

  interface Props {
    brand?: Brand;
    header?: ShellSlot;
    nav: NavGroup[];
    footer?: ShellSlot;
    pathname: string;
    collapsed?: boolean;
    collapsible?: "icon" | "offcanvas" | "none";
  }

  let {
    brand,
    header,
    nav,
    footer,
    pathname,
    collapsed = false,
    collapsible = "icon",
  }: Props = $props();

  let railClass = $derived(
    collapsible === "offcanvas" && collapsed
      ? "md:w-0 md:border-r-0"
      : collapsible === "icon" && collapsed
        ? "md:w-16"
        : "md:w-64",
  );

  function activate(item: NavItem) {
    item.onSelect?.();
  }

  function rowClass(item: NavItem, sub = false) {
    const active = isActive(pathname, item);
    return [
      "flex w-full items-center gap-2 rounded-md text-sm transition hover:bg-muted",
      sub ? "px-2 py-1.5" : "px-2 py-2",
      active ? "bg-muted font-medium text-foreground" : "text-muted-foreground",
      collapsed && !sub ? "justify-center" : "",
    ].join(" ");
  }
</script>

{#snippet icon(item: NavItem)}
  {#if item.icon}
    {@render item.icon("size-4")}
  {:else}
    <span class="grid size-5 shrink-0 place-items-center rounded text-[10px] font-semibold uppercase">
      {item.label.slice(0, 1)}
    </span>
  {/if}
{/snippet}

{#snippet row(item: NavItem, sub = false)}
  {#if item.href}
    <a href={item.href} class={rowClass(item, sub)} aria-current={isActive(pathname, item) ? "page" : undefined}>
      {@render icon(item)}
      {#if !collapsed || sub}<span class="min-w-0 flex-1 truncate">{item.label}</span>{/if}
      {#if item.badge !== undefined && (!collapsed || sub)}
        <span class="rounded-full bg-muted px-1.5 text-[10px]">{item.badge}</span>
      {/if}
    </a>
  {:else}
    <button type="button" class={rowClass(item, sub)} onclick={() => activate(item)}>
      {@render icon(item)}
      {#if !collapsed || sub}<span class="min-w-0 flex-1 truncate text-left">{item.label}</span>{/if}
      {#if item.badge !== undefined && (!collapsed || sub)}
        <span class="rounded-full bg-muted px-1.5 text-[10px]">{item.badge}</span>
      {/if}
    </button>
  {/if}
{/snippet}

<aside class={`hidden shrink-0 flex-col border-r bg-background transition-[width] md:flex ${railClass}`}>
  <div class="p-2">
    {#if header}
      {@render header()}
    {:else if brand}
      {#snippet brandBody()}
        {#if brand.logo}
          {@render brand.logo()}
        {:else}
          <span class="grid size-7 shrink-0 place-items-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
            {brand.name.slice(0, 1).toUpperCase()}
          </span>
        {/if}
        {#if !collapsed}
          <span class="grid min-w-0 leading-tight">
            <span class="truncate text-sm font-semibold">{brand.name}</span>
            {#if brand.caption}<span class="truncate text-xs text-muted-foreground">{brand.caption}</span>{/if}
          </span>
        {/if}
      {/snippet}
      {#if brand.href}
        <a href={brand.href} class="flex items-center gap-2 rounded-md p-2">{@render brandBody()}</a>
      {:else}
        <div class="flex items-center gap-2 rounded-md p-2">{@render brandBody()}</div>
      {/if}
    {/if}
  </div>

  <nav aria-label="Dashboard sidebar" class="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
    {#each nav as group (group.id)}
      <section class="mb-3 last:mb-0">
        {#if group.label && !collapsed}
          <p class="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{group.label}</p>
        {/if}
        <ul class="space-y-1">
          {#each group.items as item (item.id)}
            <li>
              {@render row(item)}
              {#if item.items?.length && !collapsed}
                <ul class="ml-6 mt-1 space-y-1 border-l pl-2">
                  {#each item.items as child (child.id)}
                    <li>{@render row(child, true)}</li>
                  {/each}
                </ul>
              {/if}
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  </nav>

  {#if footer}
    <div class="border-t p-2">{@render footer()}</div>
  {/if}
</aside>
