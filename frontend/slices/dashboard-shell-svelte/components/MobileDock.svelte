<script lang="ts">
  import { isActive } from "../../dashboard-shell/lib/nav";
  import type { NavItem } from "../types";

  interface Props {
    items: NavItem[];
    pathname: string;
    onMenu?: () => void;
    hideMenu?: boolean;
    className?: string;
  }

  let { items, pathname, onMenu, hideMenu = false, className = "" }: Props = $props();
  let showMenu = $derived(!hideMenu && !!onMenu);
</script>

{#snippet dockBody(item: NavItem)}
  {#if item.icon}
    {@render item.icon("size-4")}
  {:else}
    <span class="text-sm font-semibold">{item.label.slice(0, 1).toUpperCase()}</span>
  {/if}
  <span class="max-w-full truncate">{item.label}</span>
{/snippet}

{#if items.length || showMenu}
  <nav aria-label="Dashboard" class={`pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:hidden ${className}`}>
    <div class="pointer-events-auto mx-auto flex max-w-md items-center gap-1 rounded-xl border bg-background/95 p-2 shadow-lg backdrop-blur">
      {#each items as item (item.id)}
        {@const active = isActive(pathname, item)}
        {#if item.href}
          <a
            href={item.href}
            aria-current={active ? "page" : undefined}
            class={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] ${active ? "bg-muted text-foreground" : "text-muted-foreground"}`}
          >
            {@render dockBody(item)}
          </a>
        {:else}
          <button
            type="button"
            onclick={() => item.onSelect?.()}
            class={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] ${active ? "bg-muted text-foreground" : "text-muted-foreground"}`}
          >
            {@render dockBody(item)}
          </button>
        {/if}
      {/each}
      {#if showMenu}
        <button type="button" onclick={onMenu} class="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] text-muted-foreground">
          <span aria-hidden="true" class="text-base">☰</span>
          <span>Menu</span>
        </button>
      {/if}
    </div>
  </nav>
{/if}
