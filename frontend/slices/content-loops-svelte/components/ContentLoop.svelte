<script lang="ts">
  import { onDestroy, type Snippet } from "svelte";
  import { loopSourceRegistry } from "../../content-loops/lib/registry";
  import { loopVariantIndex } from "../../content-loops/lib/variants";
  import type { LoopEntitySource, LoopItem } from "../../content-loops/lib/types";
  import { createLoopPaginationStore } from "../lib/store";

  type Props = {
    source?: LoopEntitySource;
    sourceId?: string;
    filters?: Record<string, unknown>;
    orderBy?: string;
    direction?: "asc" | "desc";
    pagination?: "none" | "infinite";
    limit?: number;
    pageSize?: number;
    variants: Snippet<[LoopItem, number]>[];
    as?: keyof HTMLElementTagNameMap;
    class?: string;
    loadMoreLabel?: string;
    loadingContent?: Snippet;
    emptyContent?: Snippet;
  };

  let {
    source,
    sourceId,
    filters,
    orderBy,
    direction = "asc",
    pagination = "none",
    limit = 12,
    pageSize = 6,
    variants,
    as = "div",
    class: className,
    loadMoreLabel = "Load more",
    loadingContent,
    emptyContent,
  }: Props = $props();

  function resolveSource(): LoopEntitySource {
    const resolved = source ?? (sourceId ? loopSourceRegistry.getOrThrow(sourceId) : undefined);
    if (!resolved) {
      throw new Error("[content-loops] <ContentLoop> needs a `source` or a registered `sourceId`.");
    }
    return resolved;
  }

  function currentOptions() {
    return {
      source: resolveSource(),
      filters,
      orderBy,
      direction,
      pagination,
      limit,
      pageSize,
    };
  }

  const loop = createLoopPaginationStore(currentOptions());
  let state = $derived($loop);
  let initialized = false;

  $effect(() => {
    if (variants.length === 0) {
      throw new Error("[content-loops] <ContentLoop> needs at least one variant.");
    }
    const next = currentOptions();
    if (!initialized) {
      initialized = true;
      return;
    }
    void loop.update(next);
  });

  onDestroy(() => loop.destroy());
</script>

{#if state.error}
  <div role="alert" class="text-sm text-destructive">{state.error.message}</div>
{:else if state.loading && state.items.length === 0}
  {#if loadingContent}
    {@render loadingContent()}
  {:else}
    <div role="status" class="text-sm text-muted-foreground">Loading…</div>
  {/if}
{:else if state.items.length === 0}
  {#if emptyContent}
    {@render emptyContent()}
  {:else}
    <div class="text-sm text-muted-foreground">No items.</div>
  {/if}
{:else}
  <svelte:element this={as} class={className}>
    {#each state.items as item, index (item.id)}
      {@const Variant = variants[loopVariantIndex(index, variants.length)]}
      {@render Variant(item, index)}
    {/each}
  </svelte:element>

  {#if pagination === "infinite" && state.hasMore}
    <div class="mt-6 flex justify-center">
      <button
        type="button"
        class="inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium shadow-xs hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
        disabled={state.loading}
        onclick={() => void loop.loadMore()}
      >
        {state.loading ? "Loading…" : loadMoreLabel}
      </button>
    </div>
  {/if}
{/if}
