import { describe, expect, it } from "vitest";
import { createCartStore, type CartStorage } from "./core";

function memoryStorage(seed?: string): CartStorage & { value: string | null } {
  return {
    value: seed ?? null,
    getItem() { return this.value; },
    setItem(_key, value) { this.value = value; },
  };
}

const kopi = { slug: "kopi", name: "Kopi", price: 22000, priceLabel: "Rp 22.000" };

describe("cart core", () => {
  it("accumulates quantity, clamps to 99, computes totals, and removes at zero", () => {
    const store = createCartStore("test-cart");
    store.add(kopi, 2);
    store.add(kopi, 200);
    expect(store.getSnapshot().count).toBe(99);
    expect(store.getSnapshot().subtotal).toBe(22000 * 99);
    store.setQty("kopi", 0);
    expect(store.getSnapshot().items).toEqual([]);
  });

  it("hydrates valid storage and persists later mutations", () => {
    const storage = memoryStorage(JSON.stringify([{ ...kopi, qty: 3 }]));
    const store = createCartStore("test-cart");
    store.hydrate(storage);
    expect(store.getSnapshot().count).toBe(3);
    store.setQty("kopi", 4);
    expect(JSON.parse(storage.value ?? "[]")[0].qty).toBe(4);
  });

  it("falls back to empty for corrupt storage", () => {
    const store = createCartStore("test-cart");
    store.hydrate(memoryStorage("{broken"));
    expect(store.getSnapshot().items).toEqual([]);
  });
});
