<script lang="ts">
  import { isActive } from "../../dashboard-shell/lib/nav";
  import type { NavGroup, NavItem } from "../types";

  interface Props {
    groups: NavGroup[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pathname: string;
    title?: string;
    description?: string;
  }

  let { groups, open, onOpenChange, pathname, title = "Menu", description }: Props = $props();
  let drillId = $state<string | null>(null);
  let drill = $derived.by(() =>
    drillId ? groups.flatMap((group) => group.items).find((item) => item.id === drillId) : undefined,
  );

  function close() {
    drillId = null;
    onOpenChange(false);
  }

  function activate(item: NavItem) {
    if (item.items?.length && !item.href && !item.onSelect) {
      drillId = item.id;
      return;
    }
    item.onSelect?.();
    close();
  }
</script>

{#snippet tile(item: NavItem)}
  {@const active = isActive(pathname, item)}
  {#if item.href}
    <a href={item.href} onclick={close} aria-current={active ? "page" : undefined} class="relative flex flex-col items-center gap-1.5 rounded-xl p-2 text-center text-[11px]">
      <span class={`grid size-14 place-items-center rounded-2xl border ${active ? "border-primary/40 bg-primary/10 text-primary" : "bg-muted/40"}`}>
        {#if item.icon}{@render item.icon("size-6")}{:else}<span class="text-base font-semibold">{item.label.slice(0, 1)}</span>{/if}
      </span>
      <span class={`line-clamp-2 leading-tight ${active ? "font-medium text-foreground" : ""}`}>{item.label}</span>
      {#if item.badge !== undefined}<span class="absolute right-1 top-1 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{item.badge}</span>{/if}
    </a>
  {:else}
    <button type="button" onclick={() => activate(item)} class="relative flex flex-col items-center gap-1.5 rounded-xl p-2 text-center text-[11px]">
      <span class={`grid size-14 place-items-center rounded-2xl border ${active ? "border-primary/40 bg-primary/10 text-primary" : "bg-muted/40"}`}>
        {#if item.icon}{@render item.icon("size-6")}{:else}<span class="text-base font-semibold">{item.label.slice(0, 1)}</span>{/if}
      </span>
      <span class={`line-clamp-2 leading-tight ${active ? "font-medium text-foreground" : ""}`}>{item.label}</span>
      {#if item.badge !== undefined}<span class="absolute right-1 top-1 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{item.badge}</span>{/if}
    </button>
  {/if}
{/snippet}

{#if open}
  <div class="fixed inset-0 z-50 md:hidden">
    <button type="button" aria-label="Close menu" class="absolute inset-0 bg-black/40" onclick={close}></button>
    <div role="dialog" aria-modal="true" aria-label={drill?.label ?? title} class="absolute inset-x-0 bottom-0 max-h-[85svh] overflow-hidden rounded-t-2xl border bg-background shadow-2xl">
      <header class="flex items-center gap-2 border-b px-3 py-3">
        {#if drill}
          <button type="button" aria-label="Back" class="grid size-8 place-items-center rounded-md hover:bg-muted" onclick={() => (drillId = null)}>←</button>
        {/if}
        <div class="min-w-0">
          <h2 class="truncate text-base font-semibold">{drill?.label ?? title}</h2>
          {#if description && !drill}<p class="truncate text-xs text-muted-foreground">{description}</p>{/if}
        </div>
      </header>
      <div class="min-h-0 overflow-y-auto px-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-2">
        {#if drill}
          <div class="grid grid-cols-4 gap-1">
            {#each drill.items ?? [] as item (item.id)}{@render tile(item)}{/each}
          </div>
        {:else}
          {#each groups as group (group.id)}
            <section class="mb-4 last:mb-0">
              {#if group.label}<p class="px-1 pb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{group.label}</p>{/if}
              <div class="grid grid-cols-4 gap-1">
                {#each group.items as item (item.id)}{@render tile(item)}{/each}
              </div>
            </section>
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}
