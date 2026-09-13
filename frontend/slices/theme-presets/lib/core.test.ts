import { describe, expect, it } from "vitest";
import { createThemePresetStore, type ThemePresetEngine } from "./core";
import type { TweakcnRegistry } from "./tweakcn";

function fixture(saved: string | null = null) {
  const calls: string[] = [];
  const registry: TweakcnRegistry = { name: "test", items: [] };
  const engine: ThemePresetEngine = {
    getSaved: () => saved,
    boot: async () => { calls.push("boot"); },
    loadRegistry: async () => registry,
    apply: async (name) => { calls.push(`apply:${name}`); },
    preview: async (name) => { calls.push(`preview:${name ?? "null"}`); },
    clear: () => { calls.push("clear"); },
  };
  return { calls, registry, engine };
}

describe("theme preset core", () => {
  it("resolves visitor choice above site and host defaults", async () => {
    const { calls, registry, engine } = fixture("visitor");
    const store = createThemePresetStore({ hostDefault: "host", engine });
    store.setSiteDefault("site");
    await store.init();
    expect(store.getSnapshot()).toMatchObject({
      presetName: "visitor",
      explicitPreset: "visitor",
      siteDefault: "site",
      hostDefault: "host",
      registry,
      isReady: true,
    });
    expect(calls).not.toContain("preview:site");
  });

  it("tracks site default live when the visitor has no explicit preset", async () => {
    const { calls, engine } = fixture(null);
    const store = createThemePresetStore({ hostDefault: "host", engine });
    await store.init();
    expect(store.getSnapshot().presetName).toBe("host");
    store.setSiteDefault("site");
    expect(store.getSnapshot().presetName).toBe("site");
    store.setSiteDefault(null);
    expect(store.getSnapshot().presetName).toBe("host");
    expect(calls).toContain("preview:host");
    expect(calls).toContain("preview:site");
  });

  it("commits, clears back to defaults, previews, and restores deterministically", async () => {
    const { calls, engine } = fixture(null);
    const store = createThemePresetStore({ hostDefault: "host", engine });
    await store.init();
    store.setPreset("ocean");
    store.preview("claude");
    store.restore();
    store.setPreset(null);
    expect(store.getSnapshot()).toMatchObject({ explicitPreset: null, presetName: "host" });
    expect(calls).toEqual(expect.arrayContaining([
      "apply:ocean",
      "preview:claude",
      "preview:ocean",
      "clear",
      "preview:host",
    ]));
  });
});
