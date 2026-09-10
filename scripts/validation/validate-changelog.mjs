#!/usr/bin/env node
// Changelog data sanity gate. Entries in lib/content/changelog/part-*.ts
// are hand-prepended literals — the type system catches shape, but not
// facts. This catches the two failure modes that have actually shipped:
//   1. future-dated entries (a miscomputed ms epoch made badges read
//      "Updated today" for a day that hadn't happened),
//   2. duplicate entry ids (anchors + badge deep links silently collide).
//
// Run: node scripts/validation/validate-changelog.mjs [dir] [root-changelog]
// Exit 1 on any error. Wired into `validate:changelog` + pre-commit.
// Optional [dir] points at an alternate part-*.ts directory (tests).
// Every root dated entry from 2026-09-09 onward must carry exactly one
// `public-changelog:<id>` marker, which must resolve to its public counterpart.

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, "../../lib/content/changelog");
const ROOT_CHANGELOG = process.argv[3]
  ? path.resolve(process.argv[3])
  : process.argv[2]
    ? null
    : path.resolve(__dirname, "../../CHANGELOG.md");

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

const PUBLIC_CHANGELOG_CUTOFF = "2026-09-09";
const ROOT_DATED_SECTION = /^###\s+(\d{4}-\d{2}-\d{2})\s+—/;
const ROOT_SECTION = /^##(?:\s|$)/;
const ROOT_PUBLIC_ENTRY = /<!--\s*public-changelog:([A-Z0-9][A-Z0-9-]*)\s*-->/;

if (ROOT_CHANGELOG) {
  const root = readFileSync(ROOT_CHANGELOG, "utf8");
  const rootMarkerSeen = new Map();
  let activeEntry = null;

  const validateActiveEntry = () => {
    if (!activeEntry) return;

    if (activeEntry.date >= PUBLIC_CHANGELOG_CUTOFF && activeEntry.markers.length !== 1) {
      const requirement = activeEntry.markers.length === 0
        ? "is missing a public-changelog marker"
        : `must contain exactly one public-changelog marker (found ${activeEntry.markers.length})`;
      errors.push(`${path.basename(ROOT_CHANGELOG)}:${activeEntry.line} root changelog entry ${requirement}`);
    }

    for (const { id, line } of activeEntry.markers) {
      if (!seen.has(id)) {
        errors.push(`${path.basename(ROOT_CHANGELOG)}:${line} root changelog references missing public entry "${id}"`);
      }
      if (rootMarkerSeen.has(id)) {
        errors.push(`${path.basename(ROOT_CHANGELOG)}:${line} duplicate public-changelog marker "${id}" (first seen at line ${rootMarkerSeen.get(id)})`);
      } else {
        rootMarkerSeen.set(id, line);
      }
    }
  };

  for (const [index, line] of root.split("\n").entries()) {
    const datedSection = line.match(ROOT_DATED_SECTION);
    if (datedSection || ROOT_SECTION.test(line)) {
      validateActiveEntry();
      activeEntry = datedSection
        ? { date: datedSection[1], line: index + 1, markers: [] }
        : null;
      continue;
    }

    const marker = line.match(ROOT_PUBLIC_ENTRY);
    if (marker && activeEntry) {
      activeEntry.markers.push({ id: marker[1], line: index + 1 });
    }
  }

  validateActiveEntry();
}

if (errors.length > 0) {
  console.error(`✖ validate-changelog: ${errors.length} error(s)`);
  for (const e of errors) console.error(`  · ${e}`);
  process.exit(1);
}
console.log(`✓ validate-changelog: ${seen.size} entries — ids unique, no future dates, root sections resolve`);
