import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { STORAGE } from "@/features/glass-desktop/config/constants";
import type { LayoutStateV1 } from "@/features/glass-desktop/types";
import { createLocalStorageStore } from "./storage";

const validState: LayoutStateV1 = {
  version: 1,
  instances: [{ instanceId: "ring-gauge:battery", widgetId: "battery", space: 0, col: 0, row: 0 }],
};

describe("createLocalStorageStore", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("round-trips a valid layout through save → load", () => {
    const store = createLocalStorageStore();
    store.save(validState);
    expect(store.load()).toEqual(validState);
  });

  it("returns null when nothing is stored", () => {
    expect(createLocalStorageStore().load()).toBeNull();
  });

  it("returns null on corrupt JSON", () => {
    window.localStorage.setItem(STORAGE.layout, "{not json");
    expect(createLocalStorageStore().load()).toBeNull();
  });

  it("returns null on a version mismatch", () => {
    window.localStorage.setItem(
      STORAGE.layout,
      JSON.stringify({ version: 2, instances: [] }),
    );
    expect(createLocalStorageStore().load()).toBeNull();
  });

  it("returns null when the shape is wrong (instances not an array)", () => {
    window.localStorage.setItem(STORAGE.layout, JSON.stringify({ version: 1, instances: {} }));
    expect(createLocalStorageStore().load()).toBeNull();
  });

  it("reset removes ONLY rr:glass-desktop: keys", () => {
    const store = createLocalStorageStore();
    store.save(validState);
    window.localStorage.setItem(STORAGE.tasks, "[]");
    window.localStorage.setItem("rr:other-slice:v1:foo", "keep-me");
    window.localStorage.setItem("unrelated", "keep-me-too");

    store.reset();

    expect(window.localStorage.getItem(STORAGE.layout)).toBeNull();
    expect(window.localStorage.getItem(STORAGE.tasks)).toBeNull();
    expect(window.localStorage.getItem("rr:other-slice:v1:foo")).toBe("keep-me");
    expect(window.localStorage.getItem("unrelated")).toBe("keep-me-too");
  });

  describe("SSR-safe (no window)", () => {
    beforeEach(() => {
      vi.stubGlobal("window", undefined);
    });

    it("load returns null and does not throw", () => {
      const store = createLocalStorageStore();
      expect(() => store.load()).not.toThrow();
      expect(store.load()).toBeNull();
    });

    it("save and reset do not throw", () => {
      const store = createLocalStorageStore();
      expect(() => store.save(validState)).not.toThrow();
      expect(() => store.reset()).not.toThrow();
    });
  });
});
