#!/usr/bin/env node
/**
 * Contract drift scanner — Track J / CI gate.
 *
 * For every `frontend/slices/<slug>/`:
 *   - if `slice.manifest.json` AND `slice.contract.ts` BOTH exist, verify that
 *     the contract's `id` field matches the manifest's `name` (the manifest
 *     schema names the field `name`; contract uses `id` — they MUST agree).
 *   - if `slice.manifest.json` exists WITHOUT `slice.contract.ts`, surface
 *     the slug as a backfill candidate (info-only, not a failure).
 *
 * Exit codes:
 *   0 — no drift (mismatches). Missing-contract inventory may be non-empty
 *       but does not fail; it's reported as a TODO.
 *   1 — at least one slice has a manifest/contract id mismatch.
 *
 * Output:
 *   - Human ASCII table on stdout when run interactively.
 *   - Machine-readable JSON block on stdout when `--json` is passed (used by
 *     the contracts-drift workflow to feed `actions/github-script@v7`).
 *
 * Usage:
 *   node scripts/validation/check-contract-drift.mjs
 *   node scripts/validation/check-contract-drift.mjs --json
 */
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const SLICES_DIR = join(ROOT, "frontend", "slices");
const JSON_MODE = process.argv.includes("--json");

const COLOR = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
};
function color(c, str) {
  return process.stdout.isTTY && !JSON_MODE ? `${COLOR[c]}${str}${COLOR.reset}` : str;
}

/**
 * Regex-extract the `id` literal from a slice.contract.ts source. We don't
 * spawn tsx here — drift detection is cheap text-shape, not full validation.
 * The `validate-contract.mjs` script (already wired into slices:check) is the
 * authoritative semantic validator.
 */
function extractContractId(src) {
  // Match: id: "kebab-case-slug"
  const m = src.match(/\bid\s*:\s*["']([a-z][a-z0-9-]*)["']/);
  return m ? m[1] : null;
}

async function main() {
  if (!existsSync(SLICES_DIR)) {
    if (JSON_MODE) {
      process.stdout.write(JSON.stringify({ error: "no slices dir", slicesDir: SLICES_DIR }));
    } else {
      console.error(color("red", `No slices directory at ${SLICES_DIR}`));
    }
    process.exit(0);
  }

  const entries = await readdir(SLICES_DIR, { withFileTypes: true });
  const rows = [];
  let drift = 0;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith("_")) continue;
    const slug = entry.name;
    const manifestPath = join(SLICES_DIR, slug, "slice.manifest.json");
    const contractPath = join(SLICES_DIR, slug, "slice.contract.ts");
    const hasManifest = existsSync(manifestPath);
    const hasContract = existsSync(contractPath);

    let manifestName = null;
    let contractId = null;
    let status = "ok";

    if (hasManifest) {
      try {
        const raw = await readFile(manifestPath, "utf8");
        const json = JSON.parse(raw);
        manifestName = json.name ?? json.id ?? null;
      } catch {
        manifestName = null;
        status = "manifest-parse-error";
      }
    }
    if (hasContract) {
      try {
        const raw = await readFile(contractPath, "utf8");
        contractId = extractContractId(raw);
      } catch {
        contractId = null;
      }
    }

    if (hasManifest && hasContract) {
      if (!contractId) {
        status = "contract-id-unparsable";
        drift++;
      } else if (manifestName && contractId !== manifestName) {
        status = "id-mismatch";
        drift++;
      } else {
        status = "ok";
      }
    } else if (hasManifest && !hasContract) {
      status = "missing-contract";
    } else if (!hasManifest && hasContract) {
      status = "orphan-contract";
      drift++;
    } else {
      // neither — skip silently
      continue;
    }

    rows.push({ slug, manifestName, contractId, hasManifest, hasContract, status });
  }

  const missingContracts = rows.filter((r) => r.status === "missing-contract");
  const mismatches = rows.filter((r) => r.status === "id-mismatch" || r.status === "orphan-contract" || r.status === "contract-id-unparsable");

  if (JSON_MODE) {
    process.stdout.write(
      JSON.stringify(
        {
          totalSlices: rows.length,
          driftCount: drift,
          missingContractCount: missingContracts.length,
          rows,
          missingContracts: missingContracts.map((r) => r.slug),
          mismatches: mismatches.map((r) => ({ slug: r.slug, status: r.status, manifestName: r.manifestName, contractId: r.contractId })),
        },
        null,
        2,
      ),
    );
    process.exit(drift > 0 ? 1 : 0);
  }

  // Human ASCII table
  console.log(color("cyan", "\n== contract drift scan =="));
  console.log("");
  const headers = ["slug", "manifest.name", "contract.id", "status"];
  const widths = [
    Math.max(headers[0].length, ...rows.map((r) => r.slug.length)),
    Math.max(headers[1].length, ...rows.map((r) => (r.manifestName ?? "—").length)),
    Math.max(headers[2].length, ...rows.map((r) => (r.contractId ?? "—").length)),
    Math.max(headers[3].length, ...rows.map((r) => r.status.length)),
  ];
  const pad = (s, w) => String(s).padEnd(w);
  console.log(
    "  " +
      headers.map((h, i) => pad(h, widths[i])).join("  "),
  );
  console.log("  " + widths.map((w) => "-".repeat(w)).join("  "));
  for (const r of rows) {
    const statusColored =
      r.status === "ok"
        ? color("green", pad(r.status, widths[3]))
        : r.status === "missing-contract"
          ? color("yellow", pad(r.status, widths[3]))
          : color("red", pad(r.status, widths[3]));
    console.log(
      "  " +
        pad(r.slug, widths[0]) +
        "  " +
        pad(r.manifestName ?? "—", widths[1]) +
        "  " +
        pad(r.contractId ?? "—", widths[2]) +
        "  " +
        statusColored,
    );
  }
  console.log("");
  console.log(
    `${color("cyan", "Summary:")} ${rows.length} slice(s) · ${color("green", `${rows.length - drift - missingContracts.length} ok`)} · ${color("yellow", `${missingContracts.length} missing-contract (info)`)} · ${color("red", `${drift} drift`)}`,
  );

  if (missingContracts.length > 0) {
    console.log("");
    console.log(color("yellow", "  backfill candidates (manifest present, contract absent):"));
    for (const r of missingContracts) console.log(`    - ${r.slug}`);
  }
  console.log("");
  process.exit(drift > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(`drift scanner crashed: ${err.stack || err}`);
  process.exit(2);
});
