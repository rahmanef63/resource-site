"use client";

import { useEffect, useState, type ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import { getQuicklinksStore, type Quicklink, type QuicklinksStore } from "./core";

export type AppDescriptor = {
  id: string;
  slug?: string;
  title: string;
  icon: LucideIcon;
  gradient: string;
  load: () => Promise<{ default: ComponentType }>;
  defaultSize?: { w: number; h: number };
};

/** Live React view of the configured framework-neutral quicklinks store. */
export function useQuicklinks(): {
  items: Quicklink[];
  add: QuicklinksStore["add"];
  remove: QuicklinksStore["remove"];
} {
  const [items, setItems] = useState<Quicklink[]>(() => getQuicklinksStore().get());

  useEffect(() => {
    const store = getQuicklinksStore();
    store.hydrate?.();
    setItems(store.get());
    return store.subscribe(() => setItems(store.get()));
  }, []);

  return {
    items,
    add: (url, title) => getQuicklinksStore().add(url, title),
    remove: (id) => getQuicklinksStore().remove(id),
  };
}

export * from "./core";
