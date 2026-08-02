#!/usr/bin/env node
// Publish gate: the MCP server reads manifest.json/skills.json out of the
// installed `rahman-resources` package — if this package's dependency range
// lags the sibling CLI version, published MCP installs serve a stale
// catalog silently. Fail the publish until the range admits the current
// CLI version. (CLI 1.12.x drifted against a ^1.9.1 range for a month
// before this gate existed.)

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mcpPkg = JSON.parse(
  readFileSync(path.resolve(__dirname, "../package.json"), "utf8"),
);
const cliPkg = JSON.parse(
  readFileSync(path.resolve(__dirname, "../../cli/package.json"), "utf8"),
);

const range = mcpPkg.dependencies?.["rahman-resources"];
const cliVersion = cliPkg.version;

if (!range) {
  console.error("✖ check-peer: rahman-resources missing from dependencies");
  process.exit(1);
}

// Minimal ^x.y.z check — same major, floor ≤ CLI version. Avoids a semver
// dep for one comparison.
const m = range.match(/^\^(\d+)\.(\d+)\.(\d+)$/);
if (!m) {
  console.error(`✖ check-peer: range "${range}" must be ^x.y.z`);
  process.exit(1);
}
const [fMaj, fMin, fPat] = m.slice(1).map(Number);
const [cMaj, cMin, cPat] = cliVersion.split(".").map(Number);

const floorLeqCli =
  fMaj < cMaj ||
  (fMaj === cMaj && (fMin < cMin || (fMin === cMin && fPat <= cPat)));

if (fMaj !== cMaj || !floorLeqCli) {
  console.error(
    `✖ check-peer: dependency range ${range} does not match sibling CLI ${cliVersion} — bump it before publishing`,
  );
  process.exit(1);
}
if (fMin < cMin) {
  console.error(
    `✖ check-peer: range floor ^${fMaj}.${fMin}.${fPat} lags CLI ${cliVersion} by a minor — installs may resolve a stale catalog. Bump the floor.`,
  );
  process.exit(1);
}
console.log(`✓ check-peer: rahman-resources ${range} ⊇ CLI ${cliVersion}`);
