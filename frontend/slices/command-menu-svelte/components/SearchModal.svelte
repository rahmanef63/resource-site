<script lang="ts">
  import type { Snippet } from "svelte";
  import {
    resolveSearchLabels,
    searchView,
    type SearchBindingsBase,
    type SearchHitBase,
    type SearchModalLabels,
  } from "../../command-menu/lib/core";

  let {
    open = $bindable(false),
    onOpenChange,
    labels,
    bindings,
    renderIcon,
  } = $props<{
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    labels?: SearchModalLabels;
    bindings: SearchBindingsBase;
    renderIcon?: Snippet<[SearchHitBase, "page" | "database"]>;
  }>();

  let inputElement = $state<HTMLInputElement>();
  let query = $state("");
  let text = $derived(resolveSearchLabels(labels));
  let view = $derived(searchView(query, bindings));

  function setOpen(value: boolean) {
    open = value;
    onOpenChange?.(value);
  }

  function setQuery(value: string) {
    query = value;
    bindings.onQueryChange(value);
  }

  function select(hit: SearchHitBase, kind: "page" | "database") {
    if (kind === "page") bindings.onSelectPage(hit);
    else bindings.onSelectDatabase(hit);
    setOpen(false);
  }

  $effect(() => {
    if (!open) {
      if (query) query = "";
      return;
    }
    queueMicrotask(() => inputElement?.focus());
  });
</script>

{#if open}
  <div class="fixed inset-0 z-50 flex items-start justify-center bg-background/70 p-4 pt-[14vh] backdrop-blur-sm" role="presentation" onclick={(event) => event.currentTarget === event.target && setOpen(false)}>
    <div class="w-full max-w-xl overflow-hidden rounded-xl border bg-popover shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="command-search-title" aria-describedby="command-search-description">
      <h2 id="command-search-title" class="sr-only">{text.searchTitle}</h2>
      <p id="command-search-description" class="sr-only">{text.searchDescription}</p>
      <div class="flex items-center gap-2 border-b px-4 py-3">
        <span aria-hidden="true">⌕</span>
        <input
          bind:this={inputElement}
          value={query}
          oninput={(event) => setQuery(event.currentTarget.value)}
          onkeydown={(event) => event.key === "Escape" && setOpen(false)}
          placeholder={text.searchPlaceholder}
          class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {#if bindings.isLoading}<span class="animate-pulse text-xs text-muted-foreground">…</span>{/if}
        <kbd class="rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{text.escapeHint}</kbd>
      </div>

      <div class="max-h-[420px] overflow-y-auto p-2">
        {#if view.showNoResults}
          <div class="px-3 py-8 text-center text-sm text-muted-foreground">{text.noResults(query)}</div>
        {/if}

        {#if view.recent.length > 0}
          <div class="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{text.recentHeading}</div>
          {#each view.recent as hit (hit.id)}
            <button type="button" class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-accent" onclick={() => select(hit, "page")}>
              {#if renderIcon}{@render renderIcon(hit, "page")}{/if}
              <span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{hit.title || "Untitled"}</span>{#if hit.subtitle}<span class="block truncate text-xs text-muted-foreground">{hit.subtitle}</span>{/if}</span>
            </button>
          {/each}
        {/if}

        {#if bindings.pages.length > 0}
          <div class="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{text.pagesHeading}</div>
          {#each bindings.pages as hit (hit.id)}
            <button type="button" class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-accent" onclick={() => select(hit, "page")}>
              {#if renderIcon}{@render renderIcon(hit, "page")}{/if}
              <span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{hit.title || "Untitled"}</span>{#if hit.subtitle}<span class="block truncate text-xs text-muted-foreground">{hit.subtitle}</span>{/if}</span>
            </button>
          {/each}
        {/if}

        {#if bindings.databases.length > 0}
          <div class="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{text.databasesHeading}</div>
          {#each bindings.databases as hit (hit.id)}
            <button type="button" class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-accent" onclick={() => select(hit, "database")}>
              {#if renderIcon}{@render renderIcon(hit, "database")}{/if}
              <span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{hit.title || "Untitled"}</span>{#if hit.subtitle}<span class="block truncate text-xs text-muted-foreground">{hit.subtitle}</span>{/if}</span>
            </button>
          {/each}
        {/if}

        {#if view.showEmptyHint}
          <div class="px-3 py-8 text-center text-sm text-muted-foreground">{text.emptyHint}</div>
        {/if}
      </div>
    </div>
  </div>
{/if}
