#!/usr/bin/env node
// validate-slice.mjs — gate every frontend/slices/<slug>/slice.json against
// packages/cli/lib/slice-schema.json.
//
// Run: node packages/cli/scripts/validate-slice.mjs [path...] [--check] [--json]
//
// No external deps — implements a minimal JSON-Schema 2020-12 subset covering
// what slice-schema.json uses (string/number/object/array, type, enum,
// pattern, required, additionalProperties, items, minItems, minLength,
// const, default). Keeps the publish path light (the CLI tarball already
// pulls in kleur + tiged; we don't want a full ajv).

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../../..");
const SCHEMA_PATH = path.resolve(__dirname, "../lib/slice-schema.json");

const args = process.argv.slice(2);
const check = args.includes("--check");
const asJson = args.includes("--json");
const targets = args.filter((a) => !a.startsWith("--"));

const schema = JSON.parse(readFileSync(SCHEMA_PATH, "utf8"));

const sliceFiles = collectSliceFiles(targets);
if (sliceFiles.length === 0) {
  console.log(check ? "" : `(no slice.json found under frontend/slices/)`);
  process.exit(0);
}

const results = [];
for (const file of sliceFiles) {
  const rel = path.relative(REPO, file);
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    results.push({ file: rel, errors: [`JSON parse: ${e.message}`] });
    continue;
  }
  const errors = validate(parsed, schema, "");
  results.push({ file: rel, errors });
}

const failed = results.filter((r) => r.errors.length > 0);

if (asJson) {
  console.log(JSON.stringify(results, null, 2));
} else if (failed.length === 0) {
  if (!check) {
    console.log(`✓ ${sliceFiles.length} slice.json file(s) validated`);
    for (const r of results) console.log(`  ✓ ${r.file}`);
  }
} else {
  console.error(`✖ ${failed.length} slice.json file(s) failed validation\n`);
  for (const r of failed) {
    console.error(`  ${r.file}`);
    for (const e of r.errors) console.error(`    · ${e}`);
    console.error("");
  }
}

process.exit(failed.length === 0 ? 0 : 1);

// ───────────────────────────────────────────────────────────────────

function collectSliceFiles(targets) {
  const out = [];
  if (targets.length > 0) {
    for (const t of targets) {
      const abs = path.resolve(t);
      if (!existsSync(abs)) {
        console.error(`✖ target not found: ${t}`);
        process.exit(1);
      }
      if (statSync(abs).isFile() && abs.endsWith("slice.json")) {
        out.push(abs);
      } else if (statSync(abs).isDirectory()) {
        walkSlices(abs, out);
      }
    }
  } else {
    const slicesRoot = path.join(REPO, "frontend", "slices");
    if (existsSync(slicesRoot)) walkSlices(slicesRoot, out);
  }
  return out;
}

function walkSlices(dir, out) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = statSync(full);
    if (stat.isFile() && name === "slice.json") {
      out.push(full);
    } else if (stat.isDirectory() && !name.startsWith(".")) {
      walkSlices(full, out);
    }
  }
}

// Minimal JSON Schema 2020-12 validator (subset covering slice-schema.json).
function validate(value, sch, p) {
  const errs = [];
  if (sch.type) {
    if (!matchType(value, sch.type)) {
      errs.push(`${p || "(root)"}: expected ${sch.type}, got ${jsType(value)}`);
      return errs;
    }
  }
  if (sch.enum && !sch.enum.includes(value)) {
    errs.push(`${p}: must be one of ${JSON.stringify(sch.enum)} (got ${JSON.stringify(value)})`);
  }
  if (sch.const !== undefined && value !== sch.const) {
    errs.push(`${p}: must equal ${JSON.stringify(sch.const)}`);
  }
  if (sch.pattern && typeof value === "string") {
    if (!new RegExp(sch.pattern).test(value)) {
      errs.push(`${p}: does not match /${sch.pattern}/`);
    }
  }
  if (sch.minLength != null && typeof value === "string" && value.length < sch.minLength) {
    errs.push(`${p}: minLength ${sch.minLength} (got ${value.length})`);
  }
  if (sch.type === "array" && Array.isArray(value)) {
    if (sch.minItems != null && value.length < sch.minItems) {
      errs.push(`${p}: minItems ${sch.minItems} (got ${value.length})`);
    }
    if (sch.items) {
      value.forEach((item, i) => errs.push(...validate(item, sch.items, `${p}[${i}]`)));
    }
  }
  if (sch.type === "object" && value && typeof value === "object" && !Array.isArray(value)) {
    if (sch.required) {
      for (const k of sch.required) {
        if (!(k in value)) errs.push(`${p}: missing required "${k}"`);
      }
    }
    if (sch.additionalProperties === false && sch.properties) {
      for (const k of Object.keys(value)) {
        if (!(k in sch.properties)) errs.push(`${p}: unknown property "${k}"`);
      }
    }
    if (sch.properties) {
      for (const [k, sub] of Object.entries(sch.properties)) {
        if (k in value) errs.push(...validate(value[k], sub, p ? `${p}.${k}` : k));
      }
    }
  }
  return errs;
}

function matchType(v, t) {
  if (t === "string") return typeof v === "string";
  if (t === "number") return typeof v === "number" && !Number.isNaN(v);
  if (t === "integer") return Number.isInteger(v);
  if (t === "boolean") return typeof v === "boolean";
  if (t === "array") return Array.isArray(v);
  if (t === "object") return v !== null && typeof v === "object" && !Array.isArray(v);
  if (t === "null") return v === null;
  return false;
}

function jsType(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}
