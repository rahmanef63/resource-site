#!/usr/bin/env node
// Changelog data sanity gate. Entries in lib/content/changelog/part-*.ts
// are hand-prepended literals — the type system catches shape, but not
// facts. This catches the two failure modes that have actually shipped:
//   1. future-dated entries (a miscomputed ms epoch made badges read
//      "Updated today" for a day that hadn't happened),
//   2. duplicate entry ids (anchors + badge deep links silently collide).
//
// Run: node scripts/validation/validate-changelog.mjs
// Exit 1 on any error. Wired into `validate:changelog` + pre-commit.

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(__dirname, "../../lib/content/changelog");

// Entries are JSON-ish ("id": …) or plain TS (id: …) literals — match both.
const TOKEN = /^\s*"?(id|date)"?\s*:\s*("([^"]+)"|(\d{10,}))\s*,?\s*$/;

// Tolerate timezone skew (entries are dated at UTC midnight while the
// author may sit ahead of UTC) but reject anything further out.
const FUTURE_SLACK_MS = 36 * 60 * 60 * 1000;
const MIN_DATE = Date.UTC(2020, 0, 1);

const errors = [];
const seen = new Map(); // id -> file

for (const file of readdirSync(DIR).filter((f) => /^part-\d+\.ts$/.test(f))) {
  const lines = readFileSync(path.join(DIR, file), "utf8").split("\n");
  let pendingId = null;
  let pendingLine = 0;

  for (let n = 0; n < lines.length; n++) {
    const m = lines[n].match(TOKEN);
    if (!m) continue;
    const [, keyName, , str, num] = m;

    if (keyName === "id" && str) {
      if (pendingId !== null) {
        errors.push(`${file}:${pendingLine} entry "${pendingId}" has no date field before the next id`);
      }
      if (seen.has(str)) {
        errors.push(`${file}:${n + 1} duplicate id "${str}" (first seen in ${seen.get(str)})`);
      } else {
        seen.set(str, `${file}:${n + 1}`);
      }
      pendingId = str;
      pendingLine = n + 1;
    }

    if (keyName === "date" && num && pendingId !== null) {
      const date = Number(num);
      if (date > Date.now() + FUTURE_SLACK_MS) {
        errors.push(
          `${file}:${n + 1} entry "${pendingId}" is future-dated (${new Date(date).toISOString().slice(0, 10)})`,
        );
      }
      if (date < MIN_DATE) {
        errors.push(`${file}:${n + 1} entry "${pendingId}" date is before 2020 — wrong epoch unit?`);
      }
      pendingId = null;
    }
  }
}

if (errors.length > 0) {
  console.error(`✖ validate-changelog: ${errors.length} error(s)`);
  for (const e of errors) console.error(`  · ${e}`);
  process.exit(1);
}
console.log(`✓ validate-changelog: ${seen.size} entries — ids unique, no future dates`);
