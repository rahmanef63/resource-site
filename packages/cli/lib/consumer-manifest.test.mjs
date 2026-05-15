// Wave N+3 — consumer-manifest test suite.
//
// Covers: schema validation, semver compare, diffSlice verdict matrix,
// allowedActions gating by syncDirection + generalization, walkConsumerSlices
// against a fixture tree.

import { describe, it, expect } from "vitest";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  validateConsumerManifest,
  compareSemver,
  diffSlice,
  walkConsumerSlices,
  readConsumerManifest,
  writeConsumerManifest,
} from "./consumer-manifest.mjs";

function baseManifest(over = {}) {
  return {
    kitabSlug: "comments",
    kitabVersion: "0.1.0",
    consumerVersion: "0.1.0",
    syncDirection: "bidirectional",
    generalization: {
      status: "portable",
      auditedAt: "2026-05-15",
      blockers: [],
    },
    lastPullAt: null,
    lastPushAt: null,
    ...over,
  };
}

describe("validateConsumerManifest", () => {
  it("accepts a minimal valid manifest", () => {
    expect(validateConsumerManifest(baseManifest())).toEqual([]);
  });

  it("rejects non-kebab slug", () => {
    const errs = validateConsumerManifest(baseManifest({ kitabSlug: "Bad_Slug" }));
    expect(errs.some((e) => e.includes("kebab-case"))).toBe(true);
  });

  it("rejects non-semver versions", () => {
    const errs = validateConsumerManifest(baseManifest({ kitabVersion: "v0.1" }));
    expect(errs.some((e) => e.includes("semver"))).toBe(true);
  });

  it("rejects unknown syncDirection", () => {
    const errs = validateConsumerManifest(baseManifest({ syncDirection: "loose" }));
    expect(errs.some((e) => e.includes("syncDirection"))).toBe(true);
  });

  it("requires blockers when status != portable", () => {
    const errs = validateConsumerManifest(
      baseManifest({
        generalization: {
          status: "needs-adapter",
          auditedAt: "2026-05-15",
          blockers: [],
        },
      }),
    );
    expect(errs.some((e) => e.includes("blockers"))).toBe(true);
  });

  it("accepts non-portable status with blockers populated", () => {
    expect(
      validateConsumerManifest(
        baseManifest({
          generalization: {
            status: "consumer-locked",
            auditedAt: "2026-05-15",
            blockers: ["hardcoded business term"],
          },
        }),
      ),
    ).toEqual([]);
  });
});

describe("compareSemver", () => {
  it("orders MAJOR.MINOR.PATCH correctly", () => {
    expect(compareSemver("0.1.0", "0.1.0")).toBe(0);
    expect(compareSemver("0.1.1", "0.1.0")).toBe(1);
    expect(compareSemver("0.1.0", "0.1.1")).toBe(-1);
    expect(compareSemver("1.0.0", "0.99.99")).toBe(1);
  });

  it("strips pre-release/build tags", () => {
    expect(compareSemver("0.1.0-beta", "0.1.0+build")).toBe(0);
  });
});

describe("diffSlice verdicts", () => {
  it("in-sync when all versions match", () => {
    const r = diffSlice({
      slug: "comments",
      manifest: baseManifest(),
      kitabVersion: "0.1.0",
    });
    expect(r.direction).toBe("in-sync");
    expect(r.allowedActions).toEqual([]);
  });

  it("up-needed when consumer ahead", () => {
    const r = diffSlice({
      slug: "comments",
      manifest: baseManifest({ consumerVersion: "0.1.3" }),
      kitabVersion: "0.1.0",
    });
    expect(r.direction).toBe("up-needed");
    expect(r.allowedActions).toContain("rr-send");
  });

  it("down-needed when kitab ahead", () => {
    const r = diffSlice({
      slug: "comments",
      manifest: baseManifest({ consumerVersion: "0.1.0", kitabVersion: "0.1.0" }),
      kitabVersion: "0.2.0",
    });
    expect(r.direction).toBe("down-needed");
    expect(r.allowedActions).toContain("rr-update");
  });

  it("diverged when both ahead", () => {
    const r = diffSlice({
      slug: "comments",
      manifest: baseManifest({ consumerVersion: "0.1.5", kitabVersion: "0.1.0" }),
      kitabVersion: "0.2.0",
    });
    expect(r.direction).toBe("diverged");
    expect(r.allowedActions).toContain("rr-send");
    expect(r.allowedActions).toContain("rr-update");
  });

  it("kitab-only when no consumer manifest", () => {
    const r = diffSlice({ slug: "comments", manifest: null, kitabVersion: "0.1.0" });
    expect(r.direction).toBe("kitab-only");
    expect(r.allowedActions).toEqual(["rr-update"]);
  });

  it("consumer-only when not in kitab", () => {
    const r = diffSlice({
      slug: "ghost",
      manifest: baseManifest({ kitabSlug: "ghost" }),
      kitabVersion: null,
    });
    expect(r.direction).toBe("consumer-only");
    expect(r.allowedActions).toEqual(["rr-send"]);
  });

  it("frozen syncDirection blocks all actions", () => {
    const r = diffSlice({
      slug: "comments",
      manifest: baseManifest({
        consumerVersion: "0.1.5",
        syncDirection: "frozen",
      }),
      kitabVersion: "0.2.0",
    });
    expect(r.direction).toBe("diverged");
    expect(r.allowedActions).toEqual([]);
  });

  it("consumer-locked status blocks rr-send", () => {
    const r = diffSlice({
      slug: "comments",
      manifest: baseManifest({
        consumerVersion: "0.1.5",
        generalization: {
          status: "consumer-locked",
          auditedAt: "2026-05-15",
          blockers: ["business-specific table"],
        },
      }),
      kitabVersion: "0.1.0",
    });
    expect(r.direction).toBe("up-needed");
    expect(r.allowedActions).not.toContain("rr-send");
  });

  it("down-only direction blocks rr-send even when up-needed", () => {
    const r = diffSlice({
      slug: "comments",
      manifest: baseManifest({
        consumerVersion: "0.1.5",
        syncDirection: "down-only",
      }),
      kitabVersion: "0.1.0",
    });
    expect(r.direction).toBe("up-needed");
    expect(r.allowedActions).not.toContain("rr-send");
  });
});

describe("walkConsumerSlices + read/write round-trip", () => {
  it("reads valid manifests and surfaces parse errors per slice", async () => {
    const root = await mkdtemp(join(tmpdir(), "rr-bsdl-"));
    try {
      const slicesDir = join(root, "frontend", "slices");
      await mkdir(join(slicesDir, "comments"), { recursive: true });
      await mkdir(join(slicesDir, "broken"), { recursive: true });
      await mkdir(join(slicesDir, "no-manifest"), { recursive: true });
      await mkdir(join(slicesDir, "_internal"), { recursive: true });

      await writeConsumerManifest(
        join(slicesDir, "comments", ".kitab.json"),
        baseManifest({ kitabSlug: "comments" }),
      );
      // _internal also has a manifest but should be skipped (underscore prefix)
      await writeFile(
        join(slicesDir, "_internal", ".kitab.json"),
        JSON.stringify(baseManifest({ kitabSlug: "internal" })),
      );
      await writeFile(
        join(slicesDir, "broken", ".kitab.json"),
        '{"not": "valid"}',
      );

      const walked = await walkConsumerSlices(root);
      const slugs = walked.map((w) => w.dir.split("/").pop()).sort();
      expect(slugs).toEqual(["broken", "comments"]);
      const broken = walked.find((w) => w.dir.endsWith("broken"));
      expect(broken.error).toBeDefined();
      const ok = walked.find((w) => w.dir.endsWith("comments"));
      expect(ok.manifest?.kitabSlug).toBe("comments");

      const round = await readConsumerManifest(
        join(slicesDir, "comments", ".kitab.json"),
      );
      expect(round.kitabSlug).toBe("comments");
      expect(round.$schema).toBe(
        "https://resource.rahmanef.com/schemas/kitab-consumer.json",
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("returns empty when no slices dir", async () => {
    const root = await mkdtemp(join(tmpdir(), "rr-bsdl-empty-"));
    try {
      const walked = await walkConsumerSlices(root);
      expect(walked).toEqual([]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
