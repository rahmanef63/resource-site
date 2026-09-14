import { getContext, setContext } from "svelte";
import type { PageEntry } from "../../pages-cms/types";
import type { PagesStore } from "../../pages-cms/lib/core";

const PAGES_STORE = Symbol("pages-cms-store");

export function setPagesStore(store: PagesStore): PagesStore {
  setContext(PAGES_STORE, store);
  return store;
}

export function getPagesStore(): PagesStore {
  const store = getContext<PagesStore | undefined>(PAGES_STORE);
  if (!store) {
    throw new Error("Pages CMS components must be rendered inside PagesProvider or LocalPagesProvider.");
  }
  return store;
}

export const usePagesStore = getPagesStore;

export function usePage(id: string | null | undefined): PageEntry | null {
  if (!id) return null;
  return getPagesStore().pages.find((page) => page.id === id) ?? null;
}
