// check-contract-drift-helpers.mjs — pure helpers extracted from
// check-contract-drift.mjs to keep both files ≤200 LOC.

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const COLOR = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
};

export function makeColor(jsonMode) {
  return (c, str) =>
    process.stdout.isTTY && !jsonMode ? `${COLOR[c]}${str}${COLOR.reset}` : str;
}

/**
 * Regex-extract the `id` literal from a slice.contract.ts source. We don't
 * spawn tsx here — drift detection is cheap text-shape, not full validation.
 * The `validate-contract.mjs` script (already wired into slices:check) is the
 * authoritative semantic validator.
 */
export function extractContractId(src) {
  const m = src.match(/\bid\s*:\s*["']([a-z][a-z0-9-]*)["']/);
  return m ? m[1] : null;
}

/**
 * Inspect a single slice directory. Returns null when both manifest+contract
 * are absent (silently skipped). Otherwise returns a row + drift increment.
 */
export async function scanSlice(slug, slicesDir) {
  const manifestPath = join(slicesDir, slug, "slice.manifest.json");
  const sliceJsonPath = join(slicesDir, slug, "slice.json");
  const contractPath = join(slicesDir, slug, "slice.contract.ts");
  const hasLegacyManifest = existsSync(manifestPath);
  const hasSliceJson = existsSync(sliceJsonPath);
  const hasManifest = hasLegacyManifest || hasSliceJson;
  const hasContract = existsSync(contractPath);

  let manifestName = null;
  let contractId = null;
  let status = "ok";

  if (hasLegacyManifest) {
    try {
      const raw = await readFile(manifestPath, "utf8");
      const json = JSON.parse(raw);
      manifestName = json.name ?? json.id ?? null;
    } catch {
      manifestName = null;
      status = "manifest-parse-error";
    }
  } else if (hasSliceJson) {
    try {
      const raw = await readFile(sliceJsonPath, "utf8");
      const json = JSON.parse(raw);
      // new schema uses `slug`, fallback to name/id for forward-compat
      manifestName = json.slug ?? json.name ?? json.id ?? null;
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

  let drift = 0;
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
    return { row: null, drift: 0 };
  }

  return {
    row: { slug, manifestName, contractId, hasManifest, hasContract, status },
    drift,
  };
}

/**
 * ASCII table renderer for human-mode output.
 */
export function printTable(rows, missingContracts, drift, color) {
  console.log(color("cyan", "\n== contract drift scan =="));
  console.log("");
  const headers = ["slug", "manifest.name", "contract.id", "status"];
  const widths = [
    Math.max(headers[0].length, ...rows.map((r) => r.slug.length)),
    Math.max(
      headers[1].length,
      ...rows.map((r) => (r.manifestName ?? "—").length),
    ),
    Math.max(
      headers[2].length,
      ...rows.map((r) => (r.contractId ?? "—").length),
    ),
    Math.max(headers[3].length, ...rows.map((r) => r.status.length)),
  ];
  const pad = (s, w) => String(s).padEnd(w);
  console.log("  " + headers.map((h, i) => pad(h, widths[i])).join("  "));
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
    console.log(
      color(
        "yellow",
        "  backfill candidates (manifest present, contract absent):",
      ),
    );
    for (const r of missingContracts) console.log(`    - ${r.slug}`);
  }
  console.log("");
}
