// Alias fall-through e2e — `rr info <old-slug>` must resolve through
// manifest.aliases with a "superseded by" warning (UX wave U3 contract).
// Spawns the real CLI against the real bundled manifest, fully offline.
import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.resolve(__dirname, "../bin/cli.js");
const manifest = JSON.parse(
  readFileSync(path.resolve(__dirname, "manifest.json"), "utf8"),
);

const run = (...args) =>
  spawnSync("node", [CLI, ...args], { encoding: "utf8" });

describe("manifest aliases", () => {
  it("manifest carries the U3 alias map", () => {
    expect(manifest.aliases).toBeTruthy();
    expect(manifest.aliases["blog-section"]).toBe("sections");
  });

  it("aliased slugs are NOT listed as their own entries", () => {
    const slugs = new Set(
      [...(manifest.slices ?? []), ...(manifest.features ?? [])].map(
        (s) => s.slug,
      ),
    );
    for (const old of Object.keys(manifest.aliases)) {
      expect(slugs.has(old)).toBe(false);
    }
  });

  it("info <old-slug> falls through with a superseded warning", () => {
    const r = run("info", "blog-section");
    expect(r.status).toBe(0);
    const all = r.stdout + r.stderr;
    expect(all).toContain("superseded by");
    expect(all).toContain("sections");
  });

  it("info <unknown> still fails", () => {
    const r = run("info", "definitely-not-a-slice");
    expect(r.status).not.toBe(0);
  });
});
