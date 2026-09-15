// env-augment.mjs — append slice env requirements to consumer .env.example.
//
// Invoked from `npx rr add <slice>` after slice files land. Idempotent:
// re-running `add` does not duplicate entries. Never creates .env.example
// (consumer may not want one); warns and skips instead. Never touches
// .env.local (operator-only).
//
// Reads env requirements from the manifest entry passed in by the CLI
// (already normalised from slice.json `deps.env` + contract `requires.env`
// at sync time). Shape: `{ name, scope?, required?, description? }`.
//
// Contract: see CLAUDE.md "augmentConsumerEnv contract". Function ≤200 LOC.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import kleur from "kleur";

/**
 * @param {{ slug: string, env?: Array<{ name: string, scope?: string, required?: boolean, description?: string }> }} slice
 * @param {string} target  absolute path to consumer project root
 */
export function augmentConsumerEnv(slice, target, framework = "react-next") {
  const envList = Array.isArray(slice?.env) ? slice.env : [];
  if (envList.length === 0) {
    return;
  }

  const envFile = path.join(target, ".env.example");
  if (!existsSync(envFile)) {
    console.log(
      kleur.yellow(
        `  ⚠ .env.example not found in ${target} — skipping env augment.`,
      ),
    );
    console.log(
      kleur.dim(
        `    Required env for ${slice.slug}: ${envList
          .map((e) => prefixName(e, framework))
          .join(", ")}`,
      ),
    );
    return;
  }

  const existing = readFileSync(envFile, "utf8");
  const present = parseExistingNames(existing);

  const missing = envList.filter((e) => !present.has(prefixName(e, framework)));
  if (missing.length === 0) {
    console.log(kleur.dim(`  (no new env to add to .env.example)`));
    return;
  }

  const block = renderBlock(slice.slug, missing, framework);
  const sep = existing.length === 0 || existing.endsWith("\n") ? "" : "\n";
  writeFileSync(envFile, existing + sep + block, "utf8");

  console.log(
    kleur.green(
      `  ✓ appended ${missing.length} env var(s) to .env.example`,
    ),
  );
  for (const e of missing) {
    console.log(
      kleur.dim(
        `    + ${prefixName(e, framework)}${e.required ? "" : "  (optional)"}`,
      ),
    );
  }
}

// ─── helpers ──────────────────────────────────────────────────────────────

function prefixName(e, framework) {
  if (e.scope !== "next-public") return e.name;
  const base = e.name.replace(/^NEXT_PUBLIC_/, "").replace(/^PUBLIC_/, "");
  return framework === "svelte-sveltekit" || framework === "sveltekit" || framework === "svelte"
    ? `PUBLIC_${base}`
    : `NEXT_PUBLIC_${base}`;
}

function parseExistingNames(text) {
  const set = new Set();
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    // Strip an optional `export ` prefix.
    const lhs = line.slice(0, eq).replace(/^export\s+/, "").trim();
    if (lhs) set.add(lhs);
  }
  return set;
}

function renderBlock(slug, entries, framework) {
  const lines = [];
  lines.push("");
  lines.push(`# ─── ${slug} ───`);
  for (const e of entries) {
    const name = prefixName(e, framework);
    const tag =
      e.required === false ? "optional" : e.required ? "required" : null;
    const meta = [e.scope, tag].filter(Boolean).join(", ");
    if (e.description) {
      lines.push(`# ${e.description}${meta ? `  (${meta})` : ""}`);
    } else if (meta) {
      lines.push(`# ${meta}`);
    }
    // Secrets get an empty placeholder — never a fake value.
    lines.push(`${name}=`);
  }
  lines.push("");
  return lines.join("\n");
}
