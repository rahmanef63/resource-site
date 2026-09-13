import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, THEME_STORAGE_KEY, applyTheme, nextTheme, parseTheme, readTheme } from "./theme";

describe("ai-core theme core", () => {
  it("defaults dark and toggles deterministically", () => {
    expect(DEFAULT_THEME).toBe("dark");
    expect(parseTheme("light")).toBe("light");
    expect(parseTheme("other")).toBeNull();
    expect(nextTheme("dark")).toBe("light");
    expect(nextTheme("light")).toBe("dark");
  });

  it("reads, applies and persists through injected browser seams", () => {
    const attrs = new Map<string, string>();
    const values = new Map<string, string>([[THEME_STORAGE_KEY, "light"]]);
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
    const root = { setAttribute: (key: string, value: string) => attrs.set(key, value) };
    expect(readTheme(storage)).toBe("light");
    applyTheme("dark", root as Pick<HTMLElement, "setAttribute">, storage);
    expect(attrs.get("data-theme")).toBe("dark");
    expect(values.get(THEME_STORAGE_KEY)).toBe("dark");
  });
});
