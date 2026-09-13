import { afterEach, describe, expect, it } from "vitest";
import {
  configureQuicklinks,
  createMemoryStore,
  DEFAULT_QUICKLINKS,
} from "../../quicklinks/lib/core";
import { addQuicklink, quicklinksStore, removeQuicklink } from "./store";

describe("quicklinks Svelte store adapter", () => {
  afterEach(() => configureQuicklinks(createMemoryStore(DEFAULT_QUICKLINKS)));

  it("emits immediately and tracks the injected canonical store", () => {
    configureQuicklinks(createMemoryStore([{ id: "seed", title: "Seed", url: "https://seed.test" }]));
    const snapshots: string[][] = [];
    const unsubscribe = quicklinksStore.subscribe((items) => snapshots.push(items.map((item) => item.title)));

    addQuicklink("docs.example.com", "Docs");
    removeQuicklink("seed");

    expect(snapshots).toEqual([["Seed"], ["Seed", "Docs"], ["Docs"]]);
    unsubscribe();
  });
});
