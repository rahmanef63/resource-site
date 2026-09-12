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
import {
  governanceErrorsForRootSection,
  governanceErrorsForStructuredEntry,
  ROOT_DATED_SECTION,
  ROOT_PUBLIC_ENTRY,
  ROOT_SECTION,
} from "./changelog-governance.mjs";

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

const isGovernanceDate = (date) => date >= Date.UTC(2026, 8, 12);

const errors = [];
const seen = new Map(); // id -> file

const validatePublicEntry = (entry, file) => {
  if (!entry || entry.id === null || entry.date === null) return;

  const entryText = entry.lines.join("\n");
  errors.push(
    ...governanceErrorsForStructuredEntry({
      id: entry.id,
      date: entry.date,
      text: entryText,
      file,
      line: entry.dateLine || entry.line,
    }),
  );
};

for (const file of readdirSync(DIR).filter((f) => /^part-\d+\.ts$/.test(f))) {
  const lines = readFileSync(path.join(DIR, file), "utf8").split("\n");
  let pending = null;

  const flush = () => {
    if (!pending) return;

    const candidate = pending;
    pending = null;

    if (candidate.date === null) return;
    validatePublicEntry(candidate, file);
  };

  for (let n = 0; n < lines.length; n++) {
    const line = lines[n];
    const m = line.match(TOKEN);

    if (m) {
      const [, keyName, , str, num] = m;

      if (keyName === "id") {
        if (pending !== null) {
          if (pending.date === null) {
            errors.push(
              `${file}:${pending.line} entry "${pending.id}" has no date field before the next id`,
            );
          }
          flush();
        }

        if (seen.has(str)) {
          errors.push(`${file}:${n + 1} duplicate id "${str}" (first seen in ${seen.get(str)})`);
        } else {
          seen.set(str, `${file}:${n + 1}`);
        }

        pending = {
          id: str,
          line: n + 1,
          date: null,
          dateLine: null,
          lines: [line],
        };
      }

      if (keyName === "date" && num && pending !== null) {
        const date = Number(num);
        if (date > Date.now() + FUTURE_SLACK_MS) {
          errors.push(
            `${file}:${n + 1} entry "${pending.id}" is future-dated (${new Date(date).toISOString().slice(0, 10)})`,
          );
        }
        if (date < MIN_DATE) {
          errors.push(`${file}:${n + 1} entry "${pending.id}" date is before 2020 — wrong epoch unit?`);
        }
        pending.date = date;
        pending.dateLine = n + 1;
      }
    }

    if (pending !== null) {
      pending.lines.push(line);
    }
  }

  if (pending !== null) {
    if (pending.date === null) {
      errors.push(
        `${file}:${pending.line} entry "${pending.id}" has no date field before the next id`,
      );
    }
    flush();
  }
}

if (ROOT_CHANGELOG) {
  const root = readFileSync(ROOT_CHANGELOG, "utf8");
  const rootMarkerSeen = new Map();
  let activeEntry = null;

  const validateActiveEntry = () => {
    errors.push(
      ...governanceErrorsForRootSection({
        section: activeEntry,
        file: path.basename(ROOT_CHANGELOG),
        seen,
        rootMarkerSeen,
      }),
    );
  };

  for (const [index, line] of root.split("\n").entries()) {
    const datedSection = line.match(ROOT_DATED_SECTION);
    if (datedSection || ROOT_SECTION.test(line)) {
      validateActiveEntry();
      activeEntry = datedSection
        ? { date: datedSection[1], line: index + 1, markers: [], lines: [] }
        : null;
      continue;
    }

    if (activeEntry) {
      activeEntry.lines.push(line);
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
console.log(`✓ validate-changelog: ${seen.size} entries — ids unique, no future dates, root sections resolve, governance requirements verified`);
