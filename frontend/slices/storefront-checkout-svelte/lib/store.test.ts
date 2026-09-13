import { describe, expect, it } from "vitest";
import { createSvelteCartStore } from "./store";

const item = { slug: "kopi", name: "Kopi", price: 20000, priceLabel: "Rp 20.000" };

describe("createSvelteCartStore", () => {
  it("publishes shared cart snapshots after mutations", () => {
    const store = createSvelteCartStore("svelte-cart-test");
    const counts: number[] = [];
    const stop = store.subscribe((snapshot) => counts.push(snapshot.count));
    store.add(item, 2);
    store.setQty("kopi", 3);
    store.remove("kopi");
    stop();
    expect(counts).toEqual([0, 2, 3, 0]);
  });
});
