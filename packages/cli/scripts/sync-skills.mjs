#!/usr/bin/env node
/**
 * Sync skills from site → CLI.
 *
 * Source of truth: site/lib/content/claude-skills.ts (CLAUDE_SKILLS array).
 * Target:          packages/cli/lib/skills.json
 *
 * Why: the site keeps an editable TS file (good DX in IDE, tied to the
 * builder UI), the CLI ships a JSON file (no TS toolchain in the published
 * package). This script is the one-way bridge — run it after editing the
 * TS source so the CLI ships the same set.
 *
 * Run from repo root:
 *   node packages/cli/scripts/sync-skills.mjs [--check]
 *
 * --check exits non-zero if the JSON would change (useful for CI).
 */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../../..");
const SRC = resolve(REPO, "site/lib/content/claude-skills.ts");
const DST = resolve(REPO, "packages/cli/lib/skills.json");
const checkMode = process.argv.includes("--check");

const TS = await readFile(SRC, "utf8");

// Parse the CLAUDE_SKILLS array. We use a forgiving regex tokenizer rather
// than spinning up a full TS parser — the array entries are all single-line
// object literals with stable shape (per project convention).
const arrMatch = TS.match(/CLAUDE_SKILLS\s*:\s*ClaudeSkill\[\]\s*=\s*\[([\s\S]*?)\];/);
if (!arrMatch) {
  console.error(`[sync-skills] couldn't find CLAUDE_SKILLS array in ${SRC}`);
  process.exit(2);
}

const body = arrMatch[1];
const lineRe = /\{\s*slug:\s*"([^"]+)"\s*,\s*title:\s*"([^"]+)"\s*,\s*category:\s*"([^"]+)"\s*,\s*source:\s*"([^"]+)"\s*,\s*path:\s*"([^"]+)"\s*,\s*description:\s*"([^"]+)"\s*,?\s*\}/g;

const skills = [];
let m;
while ((m = lineRe.exec(body)) !== null) {
  const [, slug, title, category, source, path, description] = m;
  skills.push({ slug, title, category, source, path, description });
}

if (skills.length === 0) {
  console.error(`[sync-skills] parser matched zero entries — check shape.`);
  process.exit(2);
}

const today = new Date().toISOString().slice(0, 10);
const next = {
  _meta: {
    description: `Claude Skills inventory — ${skills.length} entries (sync'd from site/lib/content/claude-skills.ts). Used by CLI add-skill + builder UI + MCP server.`,
    anthropicsRepo: "anthropics/skills",
    branch: "main",
    lastSynced: today,
  },
  skills,
};

const current = await readFile(DST, "utf8").catch(() => "");
// Compare ignoring lastSynced — that field rolls forward every run.
const stripDate = (s) => s.replace(/"lastSynced"\s*:\s*"[^"]*"/g, '"lastSynced":"_"');

const nextStr = JSON.stringify(next, null, 2) + "\n";
const drift = stripDate(current) !== stripDate(nextStr);

if (checkMode) {
  if (drift) {
    console.error(`[sync-skills] DRIFT — site has ${skills.length} skills, CLI is out of date.`);
    process.exit(1);
  }
  console.log(`[sync-skills] OK — ${skills.length} skills in sync.`);
  process.exit(0);
}

await writeFile(DST, nextStr);
console.log(`[sync-skills] wrote ${skills.length} skills → ${DST.replace(REPO + "/", "")}`);
