/** Locks the preset → CSS derivation contract: the injected style must (1)
 *  carry the preset's shadcn palette verbatim into :root/.dark, (2) derive the
 *  appshell chrome tokens from it, (3) re-derive high-contrast overrides so
 *  a11y keeps winning, and (4) expose font/radius via the --font-ui seam. */
import { describe, it, expect } from "vitest";
import { buildCss } from "./apply";
import { groupPresets, presetSwatches } from "./registry";
import { familyOf } from "./fonts";
import type { PresetItem } from "./types";

const preset: PresetItem = {
  name: "test",
  title: "Test",
  cssVars: {
    theme: { "font-sans": "Poppins, sans-serif", "font-mono": "Fira Code, monospace", radius: "1rem" },
    light: { background: "oklch(0.98 0 0)", foreground: "oklch(0.2 0 0)", card: "oklch(1 0 0)", primary: "oklch(0.6 0.2 260)", border: "oklch(0.9 0 0)", "font-sans": "Poppins, sans-serif" },
    dark: { background: "oklch(0.15 0 0)", foreground: "oklch(0.95 0 0)", primary: "oklch(0.7 0.2 260)" },
  },
};

describe("buildCss", () => {
  const css = buildCss(preset);

  it("injects the shadcn palette into :root and .dark", () => {
    expect(css).toContain(":root {");
    expect(css).toContain("--background: oklch(0.98 0 0);");
    expect(css).toContain(".dark {");
    expect(css).toContain("--background: oklch(0.15 0 0);");
  });

  it("derives appshell chrome tokens from the palette", () => {
    for (const token of ["--surface", "--glass-bar", "--glass-menu", "--window-bg", "--window-head", "--dock-bg", "--os-accent"]) {
      expect(css).toContain(token);
    }
    expect(css).toContain("--os-accent: oklch(0.6 0.2 260);");
  });

  it("does NOT inject font/tracking keys as palette vars", () => {
    expect(css).not.toContain("--font-sans: Poppins");
  });

  it("re-derives high-contrast overrides (a11y must keep winning)", () => {
    expect(css).toContain(".high-contrast {");
    expect(css).toContain(".high-contrast.dark {");
  });

  it("routes typeface through the --font-ui seam with Inter fallback", () => {
    expect(css).toContain("--font-ui: Poppins, sans-serif, var(--font-inter)");
    expect(css).toContain("--font-mono-ui: Fira Code, monospace, ui-monospace");
    expect(css).toContain("--radius: 1rem;");
  });
});

describe("fonts familyOf", () => {
  it("extracts fetchable families, skips local/system/shipped", () => {
    expect(familyOf("Poppins, sans-serif")).toBe("Poppins");
    expect(familyOf('"JetBrains Mono", monospace')).toBe("JetBrains Mono");
    expect(familyOf("Inter, sans-serif")).toBeNull();
    expect(familyOf("system-ui")).toBeNull();
    expect(familyOf(undefined)).toBeNull();
  });
});

describe("registry helpers", () => {
  it("presetSwatches returns 5 colors with fallbacks", () => {
    expect(presetSwatches(preset)).toHaveLength(5);
    expect(presetSwatches({ name: "x", title: "X" })).toHaveLength(5);
  });

  it("groupPresets hides gimmicks and buckets the rest", () => {
    const items: PresetItem[] = [
      { name: "vercel", title: "Vercel" },
      { name: "neo-brutalism", title: "NB" },
      { name: "something-new", title: "New" },
    ];
    const groups = groupPresets(items);
    const all = groups.flatMap((g) => g.items.map((i) => i.name));
    expect(all).toContain("vercel");
    expect(all).toContain("something-new"); // unknown → "More"
    expect(all).not.toContain("neo-brutalism"); // hidden
  });
});
