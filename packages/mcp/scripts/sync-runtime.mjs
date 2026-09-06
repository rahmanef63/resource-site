#!/usr/bin/env node
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const mcpRoot = path.resolve(here, "..");
const cliRoot = path.resolve(mcpRoot, "../cli");
const sourceLib = path.join(cliRoot, "lib");
const bundleRoot = path.join(mcpRoot, "runtime/rahman-resources");
const bundleLib = path.join(bundleRoot, "lib");
const files = [
  "manifest.json",
  "skills.json",
  "infrastructure-resources.json",
  "dna.mjs",
  "dna-graph.mjs",
  "workflows/templates.md",
  "workflows/features.md",
  "workflows/recipes.md",
  "workflows/skills.md",
];
const sha = (buffer) => createHash("sha256").update(buffer).digest("hex");
const snapshot = () => {
  const cliPkg = JSON.parse(readFileSync(path.join(cliRoot, "package.json"), "utf8"));
  const hashes = Object.fromEntries(files.map((file) => [file, sha(readFileSync(path.join(sourceLib, file)))]));
  return { schemaVersion: 1, cliVersion: cliPkg.version, aggregateSha256: sha(Buffer.from(JSON.stringify(hashes))), files: hashes };
};
const expected = snapshot();
const check = process.argv.includes("--check");
if (check) {
  const metaPath = path.join(bundleRoot, "snapshot.json");
  if (!existsSync(metaPath)) throw new Error("MCP runtime snapshot missing; run sync-runtime.mjs");
  const actual = JSON.parse(readFileSync(metaPath, "utf8"));
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error("MCP runtime snapshot metadata is stale");
  for (const file of files) {
    const target = path.join(bundleLib, file);
    if (!existsSync(target) || sha(readFileSync(target)) !== expected.files[file]) throw new Error(`MCP runtime snapshot stale: ${file}`);
  }
  console.log(`✓ sync-runtime: CLI ${expected.cliVersion} ${expected.aggregateSha256.slice(0, 12)}`);
} else {
  rmSync(bundleRoot, { recursive: true, force: true });
  for (const file of files) {
    const target = path.join(bundleLib, file);
    mkdirSync(path.dirname(target), { recursive: true });
    cpSync(path.join(sourceLib, file), target);
  }
  writeFileSync(path.join(bundleRoot, "snapshot.json"), `${JSON.stringify(expected, null, 2)}\n`);
  console.log(`sync-runtime: wrote CLI ${expected.cliVersion} ${expected.aggregateSha256.slice(0, 12)}`);
}
