import { describe, expect, it } from "vitest";
import { createMockLoopSource } from "../../content-loops/lib/mock-source";
import { createLoopPaginationStore } from "./store";

describe("content-loops Svelte store adapter", () => {
  it("emits initial loading then canonical pagination updates", async () => {
    const store = createLoopPaginationStore({
      source: createMockLoopSource({ count: 5 }),
      pagination: "infinite",
      pageSize: 2,
    });
    const lengths: number[] = [];
    const unsubscribe = store.subscribe((state) => lengths.push(state.items.length));

    await store.refresh();
    await store.loadMore();

    expect(lengths.at(-1)).toBe(4);
    unsubscribe();
    store.destroy();
  });
});
