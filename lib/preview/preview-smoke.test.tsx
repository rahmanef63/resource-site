// Preview smoke gate (VP wave) — mounts EVERY registered variant preview with
// its default variant in happy-dom. Catches what tsc + the generator can't:
// runtime mount crashes (hook misuse, missing providers, bad seed data) and
// declared-component-vs-module-key drift. Runs in `npm test` → pre-push.
import { describe, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { PREVIEW_REGISTRY } from "@/lib/preview/registry.gen";
import previewMeta from "@/lib/preview/preview-meta.gen.json";
import type { SlicePreviewDecl, SlicePreviewMeta, VariantSelection } from "@/shared/preview/types";

// happy-dom lacks a few browser observers the widgets touch.
(globalThis as unknown as Record<string, unknown>).ResizeObserver ??= class {
  observe() {} unobserve() {} disconnect() {}
};
(globalThis as unknown as Record<string, unknown>).IntersectionObserver ??= class {
  observe() {} unobserve() {} disconnect() {}
  root = null; rootMargin = ""; thresholds = []; takeRecords() { return []; }
};
if (!window.matchMedia) {
  (window as unknown as Record<string, unknown>).matchMedia = () => ({
    matches: false,
    addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {},
  });
}

function defaultsFor(decl: SlicePreviewDecl): VariantSelection {
  if (decl.kind === "scenarios") return { scenario: decl.scenarios?.[0]?.id ?? "" };
  const out: VariantSelection = {};
  for (const ax of decl.axes ?? []) out[ax.prop] = ax.default ?? ax.values[0];
  return out;
}

describe("preview smoke", () => {
  for (const entry of previewMeta as SlicePreviewMeta[]) {
    it(entry.slug, async () => {
      const mod = (await PREVIEW_REGISTRY[entry.slug]()).default;
      for (const decl of entry.previews) {
        const Component = mod[decl.component];
        if (!Component) {
          throw new Error(`${entry.slug}: declared component "${decl.component}" is not a key of the preview module`);
        }
        const errors: unknown[][] = [];
        const spy = vi.spyOn(console, "error").mockImplementation((...args) => errors.push(args));
        try {
          render(<Component variant={defaultsFor(decl)} />);
        } finally {
          spy.mockRestore();
          cleanup();
        }
        const real = errors.filter((args) => args[0] instanceof Error || /error/i.test(String(args[0])));
        if (real.length > 0) {
          throw new Error(`${entry.slug}/${decl.component} mount error: ${String(real[0][0]).slice(0, 300)}`);
        }
      }
    }, 30000);
  }
});
