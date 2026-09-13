import { beforeEach, describe, expect, it, vi } from "vitest";
import { createBrowserThemeModeStore } from "./mode";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
  delete document.documentElement.dataset.theme;
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});

describe("Svelte browser theme mode store", () => {
  it("boots system mode and persists explicit light/dark choices", () => {
    const store = createBrowserThemeModeStore("system", "rr:test-theme");
    const cleanup = store.init();
    expect(store.getSnapshot()).toEqual({ mode: "system", resolved: "light", ready: true });

    store.setMode("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("rr:test-theme")).toBe("dark");

    store.setMode("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("rr:test-theme")).toBe("light");
    cleanup();
  });
});
