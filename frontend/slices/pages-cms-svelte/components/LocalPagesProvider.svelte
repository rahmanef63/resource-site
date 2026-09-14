<script lang="ts">
  import type { Snippet } from "svelte";
  import { pagesReducer } from "../../pages-cms/lib/reducer";
  import type { PagesStore } from "../../pages-cms/lib/core";
  import type { PageEntry, PagesAction } from "../../pages-cms/types";
  import { setPagesStore } from "../lib/context";

  let {
    storageKey = "pages-cms:pages",
    seed = [],
    children,
  }: { storageKey?: string; seed?: PageEntry[]; children: Snippet } = $props();

  const readInitialSeed = () => structuredClone(seed);
  let pages = $state<PageEntry[]>(readInitialSeed());
  let hydrated = $state(false);

  const dispatch = (action: PagesAction) => {
    pages = pagesReducer({ pages }, action).pages;
  };

  const store: PagesStore = {
    get pages() {
      return pages;
    },
    create: (entry) => dispatch({ type: "PAGE_CREATE", payload: entry }),
    update: (id, patch) => dispatch({ type: "PAGE_UPDATE", payload: { id, patch } }),
    remove: (id) => dispatch({ type: "PAGE_DELETE", payload: { id } }),
    reorderBlock: (id, from, to) => dispatch({ type: "PAGE_REORDER_BLOCK", payload: { id, from, to } }),
  };

  setPagesStore(store);

  $effect(() => {
    if (hydrated || typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as PageEntry[];
        if (Array.isArray(parsed)) pages = parsed;
      }
    } catch {
      // malformed storage is non-fatal
    }
    hydrated = true;
  });

  $effect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(pages));
    } catch {
      // private mode / quota is non-fatal
    }
  });
</script>

{@render children()}
