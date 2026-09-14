// @vitest-environment node
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const slice = JSON.parse(readFileSync(join(root, "frontend/slices/motion-kit/slice.json"), "utf8"));
const core = readFileSync(join(root, "frontend/slices/motion-kit/lib/core.ts"), "utf8");
const reactHook = readFileSync(join(root, "frontend/slices/motion-kit/motion/use-in-view.ts"), "utf8");
const carousel = readFileSync(join(root, "frontend/slices/motion-kit-svelte/ui/CarouselContent.svelte"), "utf8");
const trigger = readFileSync(join(root, "frontend/slices/motion-kit-svelte/ui/AccordionTrigger.svelte"), "utf8");
const countUp = readFileSync(join(root, "frontend/slices/motion-kit-svelte/motion/CountUp.svelte"), "utf8");

function collectText(dir: string): string {
  const parts: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) parts.push(collectText(path));
    else parts.push(readFileSync(path, "utf8"));
  }
  return parts.join("\n");
}

describe("motion-kit framework contract", () => {
  it("keeps React default and selects native Svelte over shared motion semantics", () => {
    expect(slice.version).toBe("0.2.0");
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"]).toEqual({
      path: "frontend/slices/motion-kit-svelte",
      aliases: ["svelte", "sveltekit"],
      deps: {
        npm: ["svelte@^5", "embla-carousel@^8.6.0", "embla-carousel-autoplay@^8.6.0"],
        shadcn: [],
        sharedFiles: [
          "frontend/slices/motion-kit/globals-motion.css",
          "frontend/slices/motion-kit/lib/core.ts",
        ],
      },
    });
    expect(core).toContain("observeInView");
    expect(reactHook).toContain('from "../lib/core"');
  });

  it("keeps the Svelte distribution free from React-specific runtime leakage", () => {
    const text = collectText(join(root, "frontend/slices/motion-kit-svelte"));
    for (const token of [
      "embla-carousel-react",
      "lucide-react",
      "radix-ui",
      '@/components/ui/',
      'from "react"',
      "from 'react'",
      "on:click",
      "on:keydown",
    ]) expect(text).not.toContain(token);
    expect(text).toContain('from "embla-carousel"');
    expect(text).toContain("$props()");
    expect(text).toContain("$derived(");
  });

  it("owns lifecycle cleanup, reduced-motion behavior, and native accordion a11y", () => {
    expect(carousel).toContain("api.destroy()");
    expect(carousel).toContain("onMount(");
    expect(countUp).toContain('prefers-reduced-motion: reduce');
    expect(trigger).toContain("aria-expanded={open}");
    expect(trigger).toContain("aria-controls=");
    expect(trigger).toContain("onclick=");
    expect(trigger).toContain('type="button"');
  });
});
