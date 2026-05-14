// merge3.test.mjs — vitest coverage for the 3-way merge engine.
//
// We exercise the file-element and contract-element branches plus the drift
// arithmetic and the applyMerge guard.

import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { merge3, applyMerge } from "./merge3.mjs";

/** Tiny snapshot factory keeping the test setup compact. */
function snap(files = {}, contract, slug = "demo-slice", version = "0.1.0") {
  return { slug, version, files, contract };
}

describe("merge3 — file element diffs", () => {
  it("all identical → all outcomes identical, drift 0", () => {
    const s = snap({ "page.tsx": "A", "lib.ts": "B" });
    const r = merge3({ base: s, kitab: s, consumer: s });
    expect(r.summary.identical).toBe(2);
    expect(r.summary.conflicts).toBe(0);
    expect(r.driftAfterMerge).toBe(0);
    expect(r.mergedSnapshot?.files).toEqual({ "page.tsx": "A", "lib.ts": "B" });
  });

  it("kitab adds file → auto-merged", () => {
    const base = snap({ "page.tsx": "A" });
    const kitab = snap({ "page.tsx": "A", "new.tsx": "N" });
    const consumer = snap({ "page.tsx": "A" });
    const r = merge3({ base, kitab, consumer });
    const o = r.outcomes.find((x) => x.element === "files/new.tsx");
    expect(o?.kind).toBe("auto-merged");
    expect(r.summary.autoMerged).toBe(1);
    expect(r.mergedSnapshot?.files["new.tsx"]).toBe("N");
  });

  it("consumer adds file → consumer-wins-clean", () => {
    const base = snap({ "page.tsx": "A" });
    const kitab = snap({ "page.tsx": "A" });
    const consumer = snap({ "page.tsx": "A", "local.tsx": "L" });
    const r = merge3({ base, kitab, consumer });
    const o = r.outcomes.find((x) => x.element === "files/local.tsx");
    expect(o?.kind).toBe("consumer-wins-clean");
    expect(r.summary.consumerWinsClean).toBe(1);
  });

  it("same file changed in both → conflict", () => {
    const base = snap({ "page.tsx": "A" });
    const kitab = snap({ "page.tsx": "K" });
    const consumer = snap({ "page.tsx": "C" });
    const r = merge3({ base, kitab, consumer });
    const o = r.outcomes.find((x) => x.element === "files/page.tsx");
    expect(o?.kind).toBe("conflict");
    expect(o?.conflictHint).toMatch(/both kitab and consumer modified/);
    expect(r.summary.conflicts).toBe(1);
    expect(r.mergedSnapshot).toBeUndefined();
  });

  it("kitab removed, consumer modified → conflict", () => {
    const base = snap({ "old.tsx": "A" });
    const kitab = snap({});
    const consumer = snap({ "old.tsx": "patched" });
    const r = merge3({ base, kitab, consumer });
    const o = r.outcomes.find((x) => x.element === "files/old.tsx");
    expect(o?.kind).toBe("conflict");
    expect(o?.conflictHint).toMatch(/kitab removed/);
  });
});

describe("merge3 — contract surface diffs", () => {
  const baseContract = {
    id: "demo-slice",
    version: "0.1.0",
    requires: { env: ["FOO"] },
    provides: { tables: ["t_users"], routes: ["/x"] },
  };

  it("contract env added in kitab → auto-merged", () => {
    const base = snap({}, baseContract);
    const kitab = snap({}, { ...baseContract, requires: { env: ["FOO", "BAR"] } });
    const consumer = snap({}, baseContract);
    const r = merge3({ base, kitab, consumer });
    const o = r.outcomes.find((x) => x.element === "contract.requires.env:BAR");
    expect(o?.kind).toBe("auto-merged");
    expect(r.mergedSnapshot?.contract?.requires?.env).toEqual(["BAR", "FOO"]);
  });

  it("contract env added in consumer → consumer-wins-clean", () => {
    const base = snap({}, baseContract);
    const kitab = snap({}, baseContract);
    const consumer = snap({}, { ...baseContract, requires: { env: ["FOO", "LOCAL"] } });
    const r = merge3({ base, kitab, consumer });
    const o = r.outcomes.find((x) => x.element === "contract.requires.env:LOCAL");
    expect(o?.kind).toBe("consumer-wins-clean");
  });

  it("contract table removed in kitab, kept in consumer → conflict", () => {
    const base = snap({}, baseContract);
    const kitab = snap({}, { ...baseContract, provides: { tables: [], routes: ["/x"] } });
    const consumer = snap({}, baseContract);
    const r = merge3({ base, kitab, consumer });
    const o = r.outcomes.find((x) => x.element === "contract.provides.tables:t_users");
    expect(o?.kind).toBe("conflict");
    expect(o?.conflictHint).toMatch(/kitab dropped/);
  });
});

describe("merge3 — summary, drift, applyMerge", () => {
  it("mixed: 2 auto-merge + 1 conflict + 3 identical → no mergedSnapshot", () => {
    const base = snap({ a: "1", b: "2", c: "3", d: "4" });
    // kitab: changes 'a' and adds 'e' (auto), modifies 'b' (consumer also touches → conflict)
    const kitab = snap({ a: "1k", b: "2k", c: "3", d: "4", e: "E" });
    // consumer: modifies 'b' independently. c,d untouched.
    const consumer = snap({ a: "1", b: "2c", c: "3", d: "4" });
    const r = merge3({ base, kitab, consumer });
    expect(r.summary.autoMerged).toBe(2); // a and e
    expect(r.summary.conflicts).toBe(1); // b
    expect(r.summary.identical).toBe(2); // c, d
    expect(r.mergedSnapshot).toBeUndefined();
  });

  it("driftAfterMerge math: 10 elements, 2 conflicts, 1 consumer-only → 30", () => {
    // Construct 10 file elements with the exact mix.
    const baseFiles = {};
    const kitabFiles = {};
    const consumerFiles = {};
    for (let i = 0; i < 7; i++) {
      // 7 identical
      baseFiles[`i${i}`] = "x";
      kitabFiles[`i${i}`] = "x";
      consumerFiles[`i${i}`] = "x";
    }
    // 2 conflicts (both sides edit)
    for (let i = 0; i < 2; i++) {
      baseFiles[`c${i}`] = "b";
      kitabFiles[`c${i}`] = "k";
      consumerFiles[`c${i}`] = "c";
    }
    // 1 consumer-only edit
    baseFiles["uo"] = "b";
    kitabFiles["uo"] = "b";
    consumerFiles["uo"] = "consumer-edit";

    const r = merge3({
      base: snap(baseFiles),
      kitab: snap(kitabFiles),
      consumer: snap(consumerFiles),
    });
    expect(r.outcomes.length).toBe(10);
    expect(r.summary.conflicts).toBe(2);
    expect(r.summary.consumerWinsClean).toBe(1);
    expect(r.driftAfterMerge).toBe(30);
  });

  it("applyMerge throws on a report with conflicts", async () => {
    const base = snap({ "a.tsx": "A" });
    const kitab = snap({ "a.tsx": "K" });
    const consumer = snap({ "a.tsx": "C" });
    const r = merge3({ base, kitab, consumer });
    await expect(applyMerge(r, "/tmp/should-not-write")).rejects.toThrow(
      /refusing to apply/,
    );
  });

  it("applyMerge writes merged files to target directory", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "merge3-apply-"));
    try {
      const base = snap({ "page.tsx": "old" });
      const kitab = snap({ "page.tsx": "new", "added.tsx": "X" });
      const consumer = snap({ "page.tsx": "old", "local.tsx": "L" });
      const r = merge3({ base, kitab, consumer });
      expect(r.summary.conflicts).toBe(0);
      await applyMerge(r, dir);
      expect(readFileSync(path.join(dir, "page.tsx"), "utf8")).toBe("new");
      expect(readFileSync(path.join(dir, "added.tsx"), "utf8")).toBe("X");
      expect(readFileSync(path.join(dir, "local.tsx"), "utf8")).toBe("L");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("kitab-only changes with no consumer drift → drift 0 after clean auto-merge", () => {
    const base = snap({ "a": "1", "b": "2" });
    const kitab = snap({ "a": "1-new", "b": "2", "c": "3" });
    const consumer = snap({ "a": "1", "b": "2" });
    const r = merge3({ base, kitab, consumer });
    expect(r.driftAfterMerge).toBe(0);
    expect(r.summary.autoMerged).toBe(2);
    expect(r.mergedSnapshot).toBeDefined();
  });

  it("rejects mismatched slugs across snapshots", () => {
    const a = snap({}, undefined, "alpha");
    const b = snap({}, undefined, "beta");
    expect(() => merge3({ base: a, kitab: b, consumer: a })).toThrow(/slug mismatch/);
  });
});
