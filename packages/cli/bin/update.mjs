// `rr update <slug>` — bidirectional sync: pull the latest kitab version of a
// slice into the consumer's local copy via 3-way semantic merge.
//
// Flow:
//   1. Locate the kitab repo root + consumer slice dir (from rr.json install
//      records).
//   2. Build a base snapshot from the lineage-pinned kitab commit (via git
//      show), falling back to the kitab tip when there's no DNA entry yet.
//   3. Build a kitab-tip snapshot from frontend/slices/<slug>/.
//   4. Build a consumer snapshot from the local slice dir.
//   5. Run merge3() — print the summary + outcomes table.
//   6. If --apply, applyMerge() to the consumer dir; refuse when conflicts
//      remain unless --force.
//   7. Append a "3-way-merge" lineage entry and upsert the consumer's
//      `drift_score = report.driftAfterMerge`.
//
// Flags:
//   --apply        write merged files to consumer dir (otherwise dry preview)
//   --force        allow apply even with conflicts (uses each side's last value)
//   --rr-path P    explicit rr.json path (overrides cwd discovery)
//   --json         emit machine-readable JSON instead of ASCII

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import kleur from "kleur";

import { merge3, applyMerge } from "../lib/merge3.mjs";
import { snapshotFromDir } from "../lib/snapshot.mjs";
import {
  readDNA,
  appendLineage,
  upsertConsumerAdoption,
} from "../lib/dna.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Entry point invoked by cli.js with the post-`update` argv tail.
 * @param {string[]} rest
 */
export async function runUpdate(rest) {
  const { positional, flags } = parseFlags(rest);
  const slug = positional[0];
  if (!slug) {
    process.stderr.write(
      kleur.red("Usage: rahman-resources update <slug> [--apply] [--force] [--rr-path P] [--json]\n"),
    );
    process.exit(1);
  }

  const asJson = !!flags.json;
  const apply = !!flags.apply;
  const force = !!flags.force;
  const rrPath = typeof flags["rr-path"] === "string" ? flags["rr-path"] : null;

  const ctx = resolveContext(slug, rrPath);

  const kitabSnap = await buildKitabSnapshot(slug, ctx);
  const baseSnap = await buildBaseSnapshot(slug, ctx, kitabSnap);
  const consumerSnap = await buildConsumerSnapshot(slug, ctx);

  const report = merge3({ base: baseSnap, kitab: kitabSnap, consumer: consumerSnap });

  if (asJson) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else {
    printReport(report, ctx);
  }

  const hasConflicts = report.summary.conflicts > 0;
  if (apply) {
    if (hasConflicts && !force) {
      if (!asJson) {
        process.stderr.write(
          kleur.red(
            `\n✖ Refusing to apply — ${report.summary.conflicts} conflict(s) remain. Resolve them or pass --force.\n`,
          ),
        );
      }
      process.exit(1);
    }
    const targetDir = ctx.consumerSliceDir;
    if (hasConflicts && force) {
      // Build a forced snapshot — prefer kitab on conflicts (matches "pull
      // kitab" semantics; consumer can revert manually after).
      const forced = buildForcedSnapshot(report, kitabSnap);
      // Write files directly, bypassing applyMerge's conflict guard.
      await writeForced(forced, targetDir);
    } else {
      await applyMerge(report, targetDir);
    }
    if (!asJson) {
      process.stdout.write(kleur.green(`\n✓ Applied merged files to ${ctx.consumerSliceDir}\n`));
    }
  }

  // Update DNA lineage — only when we actually applied OR when explicitly
  // asked via --json (machine flows record every sync attempt).
  if (apply || asJson) {
    recordLineage(slug, ctx, report);
  }

  if (hasConflicts && !force) {
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Context resolution
// ---------------------------------------------------------------------------

/**
 * @typedef {{
 *   repoRoot: string,
 *   rrPath: string,
 *   rr: any,
 *   consumerName: string,
 *   kitabRoot: string,
 *   kitabSliceDir: string,
 *   consumerSliceDir: string,
 * }} UpdateContext
 */

function resolveContext(slug, explicitRrPath) {
  // The kitab repo lives above packages/cli/bin/.
  const kitabRoot = findKitabRoot();
  const kitabSliceDir = path.join(kitabRoot, "frontend", "slices", slug);
  if (!existsSync(kitabSliceDir)) {
    throw new Error(
      `update: kitab slice not found at ${kitabSliceDir}. (Did you mean a different slug?)`,
    );
  }

  const rrPath = explicitRrPath ? path.resolve(explicitRrPath) : path.resolve(process.cwd(), "rr.json");
  if (!existsSync(rrPath)) {
    throw new Error(
      `update: rr.json not found at ${rrPath}. Pass --rr-path or run from a consumer project.`,
    );
  }
  const rr = JSON.parse(readFileSync(rrPath, "utf8"));

  const consumerName = inferConsumerName(rr, rrPath);
  const consumerSliceDir = resolveConsumerSliceDir(rr, rrPath, slug);

  return {
    repoRoot: kitabRoot,
    rrPath,
    rr,
    consumerName,
    kitabRoot,
    kitabSliceDir,
    consumerSliceDir,
  };
}

function findKitabRoot() {
  let dir = __dirname;
  for (let i = 0; i < 8; i++) {
    if (
      existsSync(path.join(dir, "packages")) &&
      existsSync(path.join(dir, "frontend", "slices"))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

function inferConsumerName(rr, rrPath) {
  if (rr?.consumer && typeof rr.consumer === "string") return rr.consumer;
  if (rr?.template?.slug && typeof rr.template.slug === "string") {
    return rr.template.slug;
  }
  return path.basename(path.dirname(rrPath));
}

function resolveConsumerSliceDir(rr, rrPath, slug) {
  const rrDir = path.dirname(rrPath);
  // Honor a slice-root override if present in rr.json, else default to
  // frontend/slices/<slug>/ — matches the kitab convention.
  const sliceRoot =
    rr?.layout?.sliceRoot && typeof rr.layout.sliceRoot === "string"
      ? rr.layout.sliceRoot
      : "frontend/slices";
  return path.resolve(rrDir, sliceRoot, slug);
}

// ---------------------------------------------------------------------------
// Snapshot builders
// ---------------------------------------------------------------------------

async function buildKitabSnapshot(slug, ctx) {
  return snapshotFromDir(slug, ctx.kitabSliceDir);
}

async function buildConsumerSnapshot(slug, ctx) {
  if (!existsSync(ctx.consumerSliceDir)) {
    // First-time sync — consumer has no copy yet; treat as empty snapshot.
    return { slug, version: "0.0.0", files: {} };
  }
  return snapshotFromDir(slug, ctx.consumerSliceDir);
}

async function buildBaseSnapshot(slug, ctx, kitabSnap) {
  // First-time sync (no DNA) → use kitab tip as base.
  const dna = readDNA(slug);
  const consumerAd = dna?.consumers?.[ctx.consumerName];
  if (!consumerAd?.version) {
    return cloneSnap(kitabSnap);
  }

  // Look up the commit by version tag, fall back to the most-recent commit
  // touching the slice path.
  const ref = findCommitForVersion(ctx.kitabRoot, slug, consumerAd.version);
  if (!ref) return cloneSnap(kitabSnap);

  const files = readSliceAtRef(ctx.kitabRoot, slug, ref);
  // Snapshot at base ref typically lacks a parsed contract — that's OK; the
  // merge algorithm treats it as no-membership, which mirrors "base had none".
  return { slug, version: consumerAd.version, files };
}

function cloneSnap(snap) {
  return {
    slug: snap.slug,
    version: snap.version,
    files: { ...snap.files },
    ...(snap.contract ? { contract: JSON.parse(JSON.stringify(snap.contract)) } : {}),
  };
}

/** Try `git rev-list -1 <tag>` then `git log -1 --format=%H -- <slicePath>`. */
function findCommitForVersion(repo, slug, version) {
  const sliceRel = `frontend/slices/${slug}`;
  for (const tag of [version, `v${version}`, `${slug}@${version}`]) {
    const r = spawnSync("git", ["rev-list", "-1", tag], {
      cwd: repo,
      encoding: "utf8",
    });
    if (r.status === 0 && r.stdout.trim()) return r.stdout.trim();
  }
  // Fallback: most-recent commit touching the slice path.
  const r = spawnSync(
    "git",
    ["log", "-1", "--format=%H", "main", "--", sliceRel],
    { cwd: repo, encoding: "utf8" },
  );
  if (r.status === 0 && r.stdout.trim()) return r.stdout.trim();
  return null;
}

/** Read every tracked file under frontend/slices/<slug>/ at `ref` into a map. */
function readSliceAtRef(repo, slug, ref) {
  const sliceRel = `frontend/slices/${slug}`;
  const ls = spawnSync(
    "git",
    ["ls-tree", "-r", "--name-only", ref, "--", sliceRel],
    { cwd: repo, encoding: "utf8" },
  );
  /** @type {Record<string,string>} */
  const out = {};
  if (ls.status !== 0) return out;
  const lines = ls.stdout.split("\n").filter(Boolean);
  for (const line of lines) {
    const rel = line.startsWith(sliceRel + "/")
      ? line.slice(sliceRel.length + 1)
      : line;
    // Skip files we don't snapshot (binary etc).
    if (!/\.(ts|tsx|mjs|js|jsx|json|md|css)$/.test(rel)) continue;
    const show = spawnSync("git", ["show", `${ref}:${line}`], {
      cwd: repo,
      encoding: "utf8",
    });
    if (show.status === 0) out[rel] = show.stdout;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Output / DNA / forced-apply helpers
// ---------------------------------------------------------------------------

function printReport(report, ctx) {
  const s = report.summary;
  process.stdout.write(
    `\n${kleur.bold("3-way merge")} — ${kleur.cyan(report.slug)} ` +
      kleur.dim(`(consumer: ${ctx.consumerName})`) +
      "\n",
  );
  process.stdout.write(
    `  ${kleur.green("auto-merged:")} ${s.autoMerged}  ` +
      `${kleur.green("kitab-clean:")} ${s.kitabWinsClean}  ` +
      `${kleur.yellow("consumer-clean:")} ${s.consumerWinsClean}  ` +
      `${kleur.red("conflicts:")} ${s.conflicts}  ` +
      `${kleur.dim("identical:")} ${s.identical}\n`,
  );
  process.stdout.write(
    `  ${kleur.bold("drift after merge:")} ${formatDrift(report.driftAfterMerge)}\n`,
  );

  const nonIdentical = report.outcomes.filter((o) => o.kind !== "identical");
  if (nonIdentical.length > 0) {
    process.stdout.write(`\n${kleur.bold("Outcomes")}\n`);
    for (const o of nonIdentical) {
      const tag = kindTag(o.kind);
      process.stdout.write(`  ${tag}  ${o.element}${o.conflictHint ? kleur.dim(`  — ${o.conflictHint}`) : ""}\n`);
    }
  }
  process.stdout.write("\n");
}

function formatDrift(d) {
  if (d >= 40) return kleur.red(`${d}%`);
  if (d >= 15) return kleur.yellow(`${d}%`);
  return kleur.green(`${d}%`);
}

function kindTag(k) {
  switch (k) {
    case "auto-merged":
      return kleur.green("[auto]    ");
    case "kitab-wins-clean":
      return kleur.green("[kitab]   ");
    case "consumer-wins-clean":
      return kleur.yellow("[consumer]");
    case "conflict":
      return kleur.red("[conflict]");
    default:
      return kleur.dim("[same]    ");
  }
}

function recordLineage(slug, ctx, report) {
  const at = new Date().toISOString();
  try {
    appendLineage(slug, {
      from: `kitab:frontend/slices/${slug}`,
      to: `consumer:${ctx.consumerName}`,
      at,
      transforms: ["3-way-merge", "consumer-sync"],
      actor: "rr update",
    });
    const dna = readDNA(slug);
    const existing = dna?.consumers?.[ctx.consumerName];
    upsertConsumerAdoption(slug, ctx.consumerName, {
      adopted_at: existing?.adopted_at ?? at,
      version: report.mergedSnapshot?.version ?? existing?.version ?? "0.0.0",
      drift_score: report.driftAfterMerge,
      last_synced_at: at,
    });
  } catch (err) {
    process.stderr.write(
      kleur.yellow(
        `  (could not update DNA lineage: ${err.message ?? err})\n`,
      ),
    );
  }
}

function buildForcedSnapshot(report, kitabSnap) {
  /** @type {Record<string,string>} */
  const files = {};
  for (const o of report.outcomes) {
    if (!o.element.startsWith("files/")) continue;
    const rel = o.element.slice("files/".length);
    if (o.kind === "conflict") {
      // On force-apply, prefer kitab value (or consumer if kitab dropped).
      const v = o.kitabValue ?? o.consumerValue;
      if (v != null) files[rel] = /** @type {string} */ (v);
    } else if (o.mergedValue != null) {
      files[rel] = /** @type {string} */ (o.mergedValue);
    }
  }
  return { slug: kitabSnap.slug, version: kitabSnap.version, files };
}

async function writeForced(snap, targetDir) {
  const { mkdir, writeFile } = await import("node:fs/promises");
  for (const [rel, content] of Object.entries(snap.files)) {
    const dest = path.join(targetDir, rel);
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, content);
  }
}

// ---------------------------------------------------------------------------

function parseFlags(rest) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = rest[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(a);
    }
  }
  return { positional, flags };
}
