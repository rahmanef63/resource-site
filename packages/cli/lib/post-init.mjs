// Post-init restructure — runs after `rahman-resources init` finishes copying
// the bundled starter into the target dir. Steps:
//
//   1. Patch components.json with vertical-slice aliases (shared, templates,
//      slices, features) so future shadcn add commands respect our layout.
//   2. Write rr.json (project manifest).
//   3. Patch tsconfig.json paths to mirror the rr.json aliases.
//
// Idempotent — safe to re-run. Each step compares before mutating.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { DEFAULT_RR, writeRr, buildRr } from "./rr.mjs";

const RR_ALIASES_TO_TSCONFIG = {
  // alias -> tsconfig key target relative-path
  "@/components/templates/_shared": "components/templates/_shared",
  "@/components/templates": "components/templates",
  "@/features": "features",
};

export function runPostInit(targetDir, opts = {}) {
  const out = { changed: [], skipped: [] };

  patchComponentsJson(targetDir, out);
  writeRrJson(targetDir, opts, out);
  patchTsconfig(targetDir, out);

  return out;
}

function patchComponentsJson(targetDir, out) {
  const p = path.join(targetDir, "components.json");
  if (!existsSync(p)) {
    out.skipped.push("components.json (not found — run shadcn init first)");
    return;
  }
  const cj = JSON.parse(readFileSync(p, "utf8"));
  cj.aliases = cj.aliases ?? {};
  const before = JSON.stringify(cj.aliases);
  cj.aliases.shared = cj.aliases.shared ?? "@/components/templates/_shared";
  cj.aliases.templates = cj.aliases.templates ?? "@/components/templates";
  cj.aliases.slices = cj.aliases.slices ?? "@/components/templates/{template}/slices";
  cj.aliases.features = cj.aliases.features ?? "@/features";
  if (JSON.stringify(cj.aliases) !== before) {
    writeFileSync(p, JSON.stringify(cj, null, 2) + "\n");
    out.changed.push("components.json (aliases)");
  } else {
    out.skipped.push("components.json (already patched)");
  }
}

function writeRrJson(targetDir, opts, out) {
  const p = path.join(targetDir, "rr.json");
  if (existsSync(p)) {
    out.skipped.push("rr.json (already exists)");
    return;
  }
  const rr = buildRr({
    template: opts.template,
    features: opts.features,
    skills: opts.skills,
    templateVersion: opts.templateVersion,
  });
  writeRr(rr, targetDir);
  out.changed.push("rr.json (created)");
}

function patchTsconfig(targetDir, out) {
  const p = path.join(targetDir, "tsconfig.json");
  if (!existsSync(p)) {
    out.skipped.push("tsconfig.json (not found)");
    return;
  }
  const raw = readFileSync(p, "utf8");
  let cfg;
  try { cfg = JSON.parse(raw); } catch {
    out.skipped.push("tsconfig.json (parse failed — likely has comments; skipped)");
    return;
  }
  cfg.compilerOptions = cfg.compilerOptions ?? {};
  cfg.compilerOptions.paths = cfg.compilerOptions.paths ?? {};
  const paths = cfg.compilerOptions.paths;
  const before = JSON.stringify(paths);
  paths["@/*"] = paths["@/*"] ?? ["./*"];
  // Keep tsconfig minimal — @/* covers all aliases. Don't bloat with redundant entries.
  if (JSON.stringify(paths) !== before) {
    writeFileSync(p, JSON.stringify(cfg, null, 2) + "\n");
    out.changed.push("tsconfig.json (paths)");
  } else {
    out.skipped.push("tsconfig.json (already configured)");
  }
}

// Allow running as a CLI script for re-restructure on existing projects.
if (import.meta.url === `file://${process.argv[1]}`) {
  const target = process.argv[2] ?? process.cwd();
  const result = runPostInit(target);
  for (const c of result.changed) console.log("  +", c);
  for (const s of result.skipped) console.log("  -", s);
}
