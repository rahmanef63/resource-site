#!/usr/bin/env node
/**
 * Validate every frontend/slices/<name>/slice.manifest.json against
 * docs/slice.manifest.schema.json (Draft 2020-12).
 *
 * Usage:
 *   node scripts/validation/validate-manifests.mjs
 *   node scripts/validation/validate-manifests.mjs --check  (exit 1 on any violation)
 *
 * Wired into `slices:check` script.
 */
import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const SLICES_DIR = join(ROOT, "frontend", "slices");
const SCHEMA_PATH = join(ROOT, "docs", "slice.manifest.schema.json");

const isCheckMode = process.argv.includes("--check");

const COLOR = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
};

function color(c, str) {
  return process.stdout.isTTY ? `${COLOR[c]}${str}${COLOR.reset}` : str;
}

/**
 * Minimal JSON Schema validator covering the fields used by slice.manifest.v1.
 * Avoids pulling in ajv as a dep until we're sure we want it.
 */
function validate(manifest, schema, path = "$") {
  const errors = [];

  if (schema.required) {
    for (const key of schema.required) {
      if (!(key in manifest)) {
        errors.push(`${path}: missing required field "${key}"`);
      }
    }
  }

  if (schema.type === "object" && schema.properties) {
    for (const [key, val] of Object.entries(manifest)) {
      const propSchema = schema.properties[key];
      if (!propSchema) {
        if (schema.additionalProperties === false) {
          errors.push(`${path}.${key}: unknown property (additionalProperties: false)`);
        }
        continue;
      }
      errors.push(...validate(val, propSchema, `${path}.${key}`));
    }
  }

  if (schema.type === "string") {
    if (typeof manifest !== "string") {
      errors.push(`${path}: expected string, got ${typeof manifest}`);
    } else {
      if (schema.pattern) {
        const re = new RegExp(schema.pattern);
        if (!re.test(manifest)) {
          errors.push(`${path}: value "${manifest}" does not match pattern ${schema.pattern}`);
        }
      }
      if (schema.enum && !schema.enum.includes(manifest)) {
        errors.push(`${path}: value "${manifest}" not in enum ${JSON.stringify(schema.enum)}`);
      }
    }
  }

  if (schema.type === "array") {
    if (!Array.isArray(manifest)) {
      errors.push(`${path}: expected array, got ${typeof manifest}`);
    } else if (schema.items) {
      manifest.forEach((item, i) => {
        errors.push(...validate(item, schema.items, `${path}[${i}]`));
      });
    }
  }

  if (schema.type === "object" && typeof manifest !== "object") {
    errors.push(`${path}: expected object, got ${typeof manifest}`);
  }

  return errors;
}

async function findSlices() {
  if (!existsSync(SLICES_DIR)) {
    console.error(color("red", `Slices dir not found: ${SLICES_DIR}`));
    return [];
  }
  const entries = await readdir(SLICES_DIR, { withFileTypes: true });
  const slices = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith("_")) continue;
    const manifestPath = join(SLICES_DIR, entry.name, "slice.manifest.json");
    if (existsSync(manifestPath)) {
      slices.push({ name: entry.name, path: manifestPath });
    } else {
      slices.push({ name: entry.name, path: null });
    }
  }
  return slices;
}

async function main() {
  console.log(color("cyan", "\n== slice.manifest validator =="));

  if (!existsSync(SCHEMA_PATH)) {
    console.error(color("red", `Schema not found: ${SCHEMA_PATH}`));
    process.exit(1);
  }

  const schema = JSON.parse(await readFile(SCHEMA_PATH, "utf8"));
  const slices = await findSlices();

  let totalErrors = 0;
  let missing = 0;
  let valid = 0;

  for (const slice of slices) {
    if (!slice.path) {
      console.log(`  ${color("yellow", "⚠")}  ${slice.name} ${color("dim", "— no slice.manifest.json")}`);
      missing++;
      continue;
    }
    try {
      const manifest = JSON.parse(await readFile(slice.path, "utf8"));
      const errors = validate(manifest, schema);
      if (errors.length === 0) {
        console.log(`  ${color("green", "✓")}  ${slice.name}`);
        valid++;
      } else {
        console.log(`  ${color("red", "✗")}  ${slice.name}`);
        for (const e of errors) {
          console.log(`       ${color("red", e)}`);
        }
        totalErrors += errors.length;
      }
    } catch (e) {
      console.log(`  ${color("red", "✗")}  ${slice.name} — parse error: ${e.message}`);
      totalErrors++;
    }
  }

  console.log("");
  console.log(
    `${color("cyan", "Summary:")} ${color("green", `${valid} valid`)} · ${color("yellow", `${missing} no manifest`)} · ${color("red", `${totalErrors} errors`)}`,
  );

  if (isCheckMode && (totalErrors > 0 || missing > 0)) {
    console.error(color("red", "\nValidator failed in --check mode."));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(color("red", `Validator crashed: ${err.stack}`));
  process.exit(1);
});
