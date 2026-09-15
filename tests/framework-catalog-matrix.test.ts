// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import manifest from "@/packages/cli/lib/manifest.json";
import { getFrameworkCoverage, getSliceFrameworkSupport } from "@/lib/content/slice-framework-support";

const REACT_ONLY_COMPAT = [
  "admin-panel",
  "contact-form-resend",
  "motion-primitives",
  "responsive-dialog",
  "three-column",
  "workspace-shell",
].sort();

describe("public framework catalog matrix", () => {
  it("keeps the public CLI catalog truthful: 66 Svelte-capable and 6 React-only compatibility entries", () => {
    const coverage = getFrameworkCoverage();
    expect(coverage).toEqual({ catalog: 72, svelte: 66, reactOnly: 6 });
    const reactOnly = manifest.slices
      .filter((slice) => !slice.frameworks?.["svelte-sveltekit"])
      .map((slice) => slice.slug)
      .sort();
    expect(reactOnly).toEqual(REACT_ONLY_COMPAT);
  });

  it("keeps all 66 canonical active slice contracts dual-framework", () => {
    const root = path.resolve(process.cwd(), "frontend/slices");
    const contracts = readdirSync(root)
      .map((name) => path.join(root, name, "slice.json"))
      .filter((file) => { try { readFileSync(file); return true; } catch { return false; } })
      .map((file) => JSON.parse(readFileSync(file, "utf8")));
    const active = contracts.filter((slice) => slice.frontend?.defaultFramework);
    expect(active).toHaveLength(66);
    expect(active.every((slice) => slice.frontend.defaultFramework === "react-next")).toBe(true);
    expect(active.every((slice) => Boolean(slice.frontend.frameworks?.["svelte-sveltekit"]))).toBe(true);
  });

  it("distinguishes native renderers from shared framework-neutral cores", () => {
    const appshell = getSliceFrameworkSupport("appshell");
    expect(appshell.map((item) => [item.id, item.mode])).toEqual([
      ["react-next", "native"],
      ["svelte-sveltekit", "native"],
    ]);
    const audit = getSliceFrameworkSupport("audit-log");
    expect(audit.map((item) => [item.id, item.mode])).toEqual([
      ["react-next", "shared"],
      ["svelte-sveltekit", "shared"],
    ]);
    expect(getSliceFrameworkSupport("admin-panel").map((item) => item.id)).toEqual(["react-next"]);
  });
});
