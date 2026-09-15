<script lang="ts">
  import { page } from "$app/state";
  import { activeTitle, deriveDock } from "../../dashboard-shell/lib/nav";
  import DashboardSidebar from "./DashboardSidebar.svelte";
  import MobileDock from "./MobileDock.svelte";
  import MobileMenuDrawer from "./MobileMenuDrawer.svelte";
  import type { Brand, NavGroup, NavItem, ShellSlot } from "../types";
  import type { Snippet } from "svelte";

  interface Props {
    nav: NavGroup[];
    brand?: Brand;
    sidebarHeader?: ShellSlot;
    sidebarFooter?: ShellSlot;
    dock?: NavItem[] | false;
    dockMax?: number;
    title?: string | Snippet;
    actions?: ShellSlot;
    topbar?: ShellSlot | null;
    secondary?: ShellSlot;
    activePath?: string;
    collapsible?: "icon" | "offcanvas" | "none";
    className?: string;
    contentClassName?: string;
    children: Snippet;
  }

  let {
    nav,
    brand,
    sidebarHeader,
    sidebarFooter,
    dock,
    dockMax = 4,
    title,
    actions,
    topbar,
    secondary,
    activePath,
    collapsible = "icon",
    className = "",
    contentClassName = "",
    children,
  }: Props = $props();

  let collapsed = $state(false);
  let menuOpen = $state(false);
  let pathname = $derived(activePath ?? page.url.pathname);
  let dockItems = $derived(dock === false ? [] : (dock ?? deriveDock(nav, dockMax)));
  let heading = $derived(typeof title === "string" ? title : activeTitle(pathname, nav));

  function toggleSidebar() {
    if (collapsible !== "none") collapsed = !collapsed;
  }
</script>

<div class={`flex min-h-svh w-full bg-background ${className}`}>
  <DashboardSidebar
    {brand}
    header={sidebarHeader}
    {nav}
    footer={sidebarFooter}
    {pathname}
    {collapsed}
    {collapsible}
  />

  <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
    {#if topbar === null}
      <!-- intentionally no topbar -->
    {:else if topbar}
      {@render topbar()}
    {:else}
      <header class="flex h-14 shrink-0 items-center gap-2 border-b px-3 sm:px-4">
        <button type="button" class="hidden size-8 place-items-center rounded-md hover:bg-muted md:grid" aria-label="Toggle sidebar" onclick={toggleSidebar}>☰</button>
        <button type="button" class="grid size-8 place-items-center rounded-md hover:bg-muted md:hidden" aria-label="Open menu" onclick={() => (menuOpen = true)}>☰</button>
        <span aria-hidden="true" class="h-4 w-px bg-border"></span>
        <div class="min-w-0 flex-1 truncate text-sm font-medium">
          {#if title && typeof title !== "string"}{@render title()}{:else}{heading}{/if}
        </div>
        {#if actions}<div class="flex items-center gap-1">{@render actions()}</div>{/if}
      </header>
    {/if}

    <div class="flex min-h-0 flex-1">
      {#if secondary}
        <aside class="hidden w-60 shrink-0 flex-col overflow-y-auto border-r md:flex">{@render secondary()}</aside>
      {/if}
      <main class={`@container/main min-w-0 flex-1 overflow-y-auto ${dockItems.length ? "pb-24 md:pb-0" : ""} ${contentClassName}`}>
        {@render children()}
      </main>
    </div>
  </div>

  {#if dockItems.length}
    <MobileDock items={dockItems} {pathname} onMenu={() => (menuOpen = true)} />
  {/if}

  <MobileMenuDrawer
    groups={nav}
    open={menuOpen}
    onOpenChange={(next) => (menuOpen = next)}
    {pathname}
    title={brand?.name ?? "Menu"}
    description={brand?.caption}
  />
</div>
