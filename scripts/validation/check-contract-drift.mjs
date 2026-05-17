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
 *
 * Pure helpers (scanSlice, printTable, extractContractId, color) live in
 * check-contract-drift-helpers.mjs to keep this file ≤200 LOC.
 */
import { readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  makeColor,
  printTable,
  scanSlice,
} from "./check-contract-drift-helpers.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const SLICES_DIR = join(ROOT, "frontend", "slices");
const JSON_MODE = process.argv.includes("--json");
const color = makeColor(JSON_MODE);

async function main() {
  if (!existsSync(SLICES_DIR)) {
    if (JSON_MODE) {
      process.stdout.write(
        JSON.stringify({ error: "no slices dir", slicesDir: SLICES_DIR }),
      );
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
    const { row, drift: d } = await scanSlice(entry.name, SLICES_DIR);
    if (!row) continue;
    rows.push(row);
    drift += d;
  }

  const missingContracts = rows.filter((r) => r.status === "missing-contract");
  const mismatches = rows.filter(
    (r) =>
      r.status === "id-mismatch" ||
      r.status === "orphan-contract" ||
      r.status === "contract-id-unparsable",
  );

  if (JSON_MODE) {
    process.stdout.write(
      JSON.stringify(
        {
          totalSlices: rows.length,
          driftCount: drift,
          missingContractCount: missingContracts.length,
          rows,
          missingContracts: missingContracts.map((r) => r.slug),
          mismatches: mismatches.map((r) => ({
            slug: r.slug,
            status: r.status,
            manifestName: r.manifestName,
            contractId: r.contractId,
          })),
        },
        null,
        2,
      ),
    );
    process.exit(drift > 0 ? 1 : 0);
  }

  printTable(rows, missingContracts, drift, color);
  process.exit(drift > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(`drift scanner crashed: ${err.stack || err}`);
  process.exit(2);
});
