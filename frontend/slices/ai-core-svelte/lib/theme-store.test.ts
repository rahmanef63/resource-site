import { beforeEach, describe, expect, it } from "vitest";
import { THEME_STORAGE_KEY } from "../../ai-core/lib/theme";
import { createThemeStore } from "./theme-store";

describe("ai-core Svelte theme store", () => {
  beforeEach(() => {
    window.localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.removeAttribute("data-theme");
  });

  it("is Svelte-readable and persists set/toggle through the shared core", () => {
    const store = createThemeStore();
    const seen: string[] = [];
    const unsubscribe = store.subscribe((theme) => seen.push(theme));
    store.set("light");
    store.toggle();
    unsubscribe();
    expect(seen).toEqual(["dark", "light", "dark"]);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });
});
