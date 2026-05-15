// Wave N+3 — Bidirectional Sync Detection Layer (BSDL).
//
// Consumer-side `.kitab.json` schema, reader/writer, semver compare, and the
// per-slice sync diff used by `rr scan-consumers`. See d.ts for the full type
// vocabulary and docs/consumer-manifest.md for the design rationale.

import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const KEBAB_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const SEMVER_RE =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const ISO_RE = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2}))?$/;

const SYNC_DIRECTIONS = new Set([
  "bidirectional",
  "down-only",
  "up-only",
  "frozen",
]);
const GENERALIZATION_STATUS = new Set([
  "portable",
  "needs-adapter",
  "consumer-locked",
]);

export function validateConsumerManifest(m) {
  const errors = [];
  if (!m || typeof m !== "object") {
    errors.push("manifest must be a non-null object");
    return errors;
  }
  if (typeof m.kitabSlug !== "string" || !KEBAB_RE.test(m.kitabSlug)) {
    errors.push(`kitabSlug "${String(m.kitabSlug)}" must be kebab-case`);
  }
  if (typeof m.kitabVersion !== "string" || !SEMVER_RE.test(m.kitabVersion)) {
    errors.push(`kitabVersion "${String(m.kitabVersion)}" must be semver`);
  }
  if (
    typeof m.consumerVersion !== "string" ||
    !SEMVER_RE.test(m.consumerVersion)
  ) {
    errors.push(
      `consumerVersion "${String(m.consumerVersion)}" must be semver`,
    );
  }
  if (!SYNC_DIRECTIONS.has(m.syncDirection)) {
    errors.push(
      `syncDirection "${String(m.syncDirection)}" must be one of bidirectional|down-only|up-only|frozen`,
    );
  }
  if (!m.generalization || typeof m.generalization !== "object") {
    errors.push("generalization must be an object");
  } else {
    const g = m.generalization;
    if (!GENERALIZATION_STATUS.has(g.status)) {
      errors.push(
        `generalization.status "${String(g.status)}" must be portable|needs-adapter|consumer-locked`,
      );
    }
    if (typeof g.auditedAt !== "string" || !ISO_RE.test(g.auditedAt)) {
      errors.push(
        `generalization.auditedAt "${String(g.auditedAt)}" must be ISO date`,
      );
    }
    if (!Array.isArray(g.blockers)) {
      errors.push("generalization.blockers must be an array of strings");
    } else {
      for (const b of g.blockers) {
        if (typeof b !== "string") {
          errors.push(`generalization.blockers entry must be string, got ${typeof b}`);
        }
      }
    }
    if (g.status !== "portable" && (!Array.isArray(g.blockers) || g.blockers.length === 0)) {
      errors.push(
        `generalization.status "${g.status}" requires at least one entry in blockers[]`,
      );
    }
  }
  if (m.lastPullAt !== null && (typeof m.lastPullAt !== "string" || !ISO_RE.test(m.lastPullAt))) {
    errors.push(`lastPullAt must be null or ISO timestamp`);
  }
  if (m.lastPushAt !== null && (typeof m.lastPushAt !== "string" || !ISO_RE.test(m.lastPushAt))) {
    errors.push(`lastPushAt must be null or ISO timestamp`);
  }
  return errors;
}

export async function readConsumerManifest(filepath) {
  const raw = await readFile(filepath, "utf8");
  let m;
  try {
    m = JSON.parse(raw);
  } catch (err) {
    throw new Error(`${filepath}: invalid JSON — ${err.message}`);
  }
  const errors = validateConsumerManifest(m);
  if (errors.length > 0) {
    throw new Error(`${filepath}: ${errors.join("; ")}`);
  }
  return m;
}

export async function writeConsumerManifest(filepath, m) {
  const errors = validateConsumerManifest(m);
  if (errors.length > 0) {
    throw new Error(`refusing to write invalid manifest: ${errors.join("; ")}`);
  }
  const ordered = {
    $schema: m.$schema ?? "https://resource.rahmanef.com/schemas/kitab-consumer.json",
    kitabSlug: m.kitabSlug,
    kitabVersion: m.kitabVersion,
    consumerVersion: m.consumerVersion,
    syncDirection: m.syncDirection,
    generalization: m.generalization,
    lastPullAt: m.lastPullAt,
    lastPushAt: m.lastPushAt,
  };
  await writeFile(filepath, JSON.stringify(ordered, null, 2) + "\n", "utf8");
}

/**
 * Compare two semvers. Returns -1, 0, or 1. Pre-release tags ignored
 * (compared on MAJOR.MINOR.PATCH only — sufficient for sync direction
 * decisions; consumers shouldn't be depending on pre-release ordering for
 * cross-repo sync gates).
 */
export function compareSemver(a, b) {
  const pa = String(a).split(/[.+-]/).slice(0, 3).map((n) => parseInt(n, 10));
  const pb = String(b).split(/[.+-]/).slice(0, 3).map((n) => parseInt(n, 10));
  for (let i = 0; i < 3; i++) {
    const av = Number.isFinite(pa[i]) ? pa[i] : 0;
    const bv = Number.isFinite(pb[i]) ? pb[i] : 0;
    if (av !== bv) return av < bv ? -1 : 1;
  }
  return 0;
}

function allowedActionsFor(verdict, manifest) {
  if (!manifest) return [];
  const dir = manifest.syncDirection;
  if (dir === "frozen") return [];
  const actions = [];
  if ((verdict === "up-needed" || verdict === "diverged") && (dir === "bidirectional" || dir === "up-only")) {
    if (manifest.generalization.status === "portable") actions.push("rr-send");
  }
  if ((verdict === "down-needed" || verdict === "diverged") && (dir === "bidirectional" || dir === "down-only")) {
    actions.push("rr-update");
  }
  return actions;
}

export function diffSlice({ slug, manifest, kitabVersion }) {
  if (manifest && !kitabVersion) {
    return {
      slug,
      kitabVersion: null,
      consumerVersion: manifest.consumerVersion,
      direction: "consumer-only",
      blockers: manifest.generalization.blockers,
      generalization: manifest.generalization.status,
      allowedActions: manifest.generalization.status === "portable" ? ["rr-send"] : [],
    };
  }
  if (!manifest && kitabVersion) {
    return {
      slug,
      kitabVersion,
      consumerVersion: null,
      direction: "kitab-only",
      blockers: [],
      generalization: null,
      allowedActions: ["rr-update"],
    };
  }
  if (!manifest) {
    return null;
  }
  const consumerCmpKitab = compareSemver(manifest.consumerVersion, manifest.kitabVersion);
  const kitabCmpAdopted = compareSemver(kitabVersion, manifest.kitabVersion);
  let direction;
  if (consumerCmpKitab > 0 && kitabCmpAdopted > 0) direction = "diverged";
  else if (consumerCmpKitab > 0) direction = "up-needed";
  else if (kitabCmpAdopted > 0) direction = "down-needed";
  else direction = "in-sync";
  return {
    slug,
    kitabVersion,
    consumerVersion: manifest.consumerVersion,
    direction,
    blockers: manifest.generalization.blockers,
    generalization: manifest.generalization.status,
    allowedActions: allowedActionsFor(direction, manifest),
  };
}

export async function walkConsumerSlices(consumerRoot) {
  const candidates = [
    join(consumerRoot, "frontend", "slices"),
    join(consumerRoot, "frontend", "src", "slices"),
  ];
  const out = [];
  for (const slicesDir of candidates) {
    if (!existsSync(slicesDir)) continue;
    const entries = await readdir(slicesDir, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isDirectory() || e.name.startsWith("_")) continue;
      const manifestPath = join(slicesDir, e.name, ".kitab.json");
      if (!existsSync(manifestPath)) continue;
      try {
        const m = await readConsumerManifest(manifestPath);
        out.push({ dir: join(slicesDir, e.name), manifest: m });
      } catch (err) {
        out.push({ dir: join(slicesDir, e.name), error: err.message });
      }
    }
  }
  return out;
}
