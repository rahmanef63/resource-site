// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  DEFAULT_WIDTH_MODE,
  WIDTH_MODE_STORAGE_KEY,
  nextWidthMode,
  normalizeWidthMode,
  readWidthMode,
  widthClass,
  writeWidthMode,
  type WidthMode,
} from "../frontend/slices/full-width-toggle-svelte/lib/width-mode";

function memoryStorage(initial?: string) {
  let value = initial ?? null;
  return {
    getItem: (key: string) => (key === WIDTH_MODE_STORAGE_KEY ? value : null),
    setItem: (key: string, next: string) => {
      if (key === WIDTH_MODE_STORAGE_KEY) value = next;
    },
    value: () => value,
  };
}

describe("full-width-toggle Svelte contract helpers", () => {
  it("keeps the React/Svelte storage key and safe default", () => {
    expect(WIDTH_MODE_STORAGE_KEY).toBe("layout:widthMode");
    expect(DEFAULT_WIDTH_MODE).toBe("contained");
    expect(readWidthMode(null)).toBe("contained");
    expect(normalizeWidthMode("invalid")).toBe("contained");
  });

  it("preserves contained/wide/full cycling and container classes", () => {
    const order: WidthMode[] = ["contained", "wide", "full"];
    expect(order.map(nextWidthMode)).toEqual(["wide", "full", "contained"]);
    expect(widthClass("contained")).toBe("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8");
    expect(widthClass("wide")).toBe("mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8");
    expect(widthClass("full")).toBe("w-full px-4 sm:px-6 lg:px-8");
  });

  it("reads and writes the persisted per-device localStorage value", () => {
    const storage = memoryStorage("wide");
    expect(readWidthMode(storage)).toBe("wide");
    writeWidthMode("full", storage);
    expect(storage.value()).toBe("full");
    expect(readWidthMode(storage)).toBe("full");
  });
});
