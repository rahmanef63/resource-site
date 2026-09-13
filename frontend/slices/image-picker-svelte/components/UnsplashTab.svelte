<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { pickerTabLabel, toUnsplashImageValue } from "@/features/image-picker/lib/core";
  import { CURATED_UNSPLASH } from "@/features/image-picker/lib/unsplashCurated";
  import type { ImageValue, UnsplashPhoto, UnsplashSearchFn } from "@/features/image-picker/types";

  let { onSelect, searchUnsplash, defaultQuery }: {
    onSelect: (image: ImageValue) => void;
    searchUnsplash?: UnsplashSearchFn;
    defaultQuery?: string;
  } = $props();

  let query = $state("");
  let results = $state.raw<UnsplashPhoto[] | null>(null);
  let busy = $state(false);
  let error = $state<string | null>(null);
  let searchTimer: ReturnType<typeof setTimeout> | undefined;
  let searchGeneration = 0;
  let photos = $derived(results ?? CURATED_UNSPLASH);

  function scheduleSearch(nextQuery: string, delay = 400) {
    query = nextQuery;
    searchGeneration += 1;
    const generation = searchGeneration;
    if (searchTimer) clearTimeout(searchTimer);

    const trimmed = nextQuery.trim();
    if (!searchUnsplash || !trimmed) {
      results = null;
      error = null;
      busy = false;
      searchTimer = undefined;
      return;
    }

    searchTimer = setTimeout(() => {
      searchTimer = undefined;
      void runSearch(trimmed, generation);
    }, delay);
  }

  async function runSearch(trimmed: string, generation: number) {
    if (!searchUnsplash) return;
    busy = true;
    error = null;
    const response = await searchUnsplash(trimmed, 24);
    if (generation !== searchGeneration) return;
    busy = false;
    if (response.error) {
      error = response.error;
      results = null;
      return;
    }
    results = response.photos;
  }

  onMount(() => {
    if (defaultQuery) scheduleSearch(defaultQuery, 0);
  });

  onDestroy(() => {
    searchGeneration += 1;
    if (searchTimer) clearTimeout(searchTimer);
  });
</script>

<div class="space-y-3 p-4">
  <div class="relative">
    <input
      class="h-9 w-full rounded-md border border-input bg-background px-3 pr-20 text-sm"
      aria-label="Search Unsplash"
      placeholder={searchUnsplash ? "Search Unsplash…" : "Curated picks (wire searchUnsplash for live search)"}
      value={query}
      disabled={!searchUnsplash}
      oninput={(event) => scheduleSearch(event.currentTarget.value)}
    />
    <span class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
      {busy ? "Searching…" : pickerTabLabel("unsplash")}
    </span>
  </div>

  {#if error}
    <p class="text-xs text-destructive">{error}</p>
  {:else if !results}
    <p class="text-[11px] text-muted-foreground">
      Curated landscapes{searchUnsplash ? " — type above for live search" : ""}.
    </p>
  {:else if results.length === 0 && !busy}
    <p class="text-xs text-muted-foreground">No results for “{query.trim()}”.</p>
  {/if}

  <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
    {#each photos as photo (photo.id)}
      <button
        type="button"
        class="group relative h-20 w-full overflow-hidden rounded-md p-0 ring-1 ring-border transition hover:ring-2 hover:ring-primary"
        onclick={() => onSelect(toUnsplashImageValue(photo))}
      >
        <img src={photo.thumb} alt={photo.alt || "Stock photo"} loading="lazy" class="h-full w-full object-cover" />
        <span class="absolute inset-x-0 bottom-0 truncate bg-black/55 px-1 py-0.5 text-left text-[9px] text-white">
          {photo.photographer || "Unknown"}
        </span>
      </button>
    {/each}
  </div>
</div>
