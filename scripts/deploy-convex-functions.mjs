#!/usr/bin/env node
/**
 * Deploy convex/ functions + schema + crons to the self-hosted rr backend.
 *
 * Why a temp copy: the in-repo convex/_generated is a hand-written ambient
 * stub for site typecheck (NEVER run codegen in-repo — CLAUDE.md). The
 * convex CLI insists on writing real codegen output next to the functions,
 * so we copy convex/ to .convex-deploy/ (gitignored), let the CLI codegen
 * there, deploy, and leave the repo untouched.
 *
 * Env (from .env.local, gitignored — or the shell):
 *   CONVEX_SELF_HOSTED_URL        e.g. https://api-resource.rahmanef.com
 *   CONVEX_SELF_HOSTED_ADMIN_KEY  docker exec <backend> ./generate_admin_key.sh
 *
 * Usage:
 *   node scripts/deploy-convex-functions.mjs            # deploy
 *   node scripts/deploy-convex-functions.mjs --dry-run  # codegen + bundle only
 */

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const STAGE = path.join(ROOT, ".convex-deploy");
const dryRun = process.argv.includes("--dry-run");

// ── env: shell first, then .env.local ────────────────────────────────────
const envLocal = path.join(ROOT, ".env.local");
if (existsSync(envLocal)) {
  for (const line of readFileSync(envLocal, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"#]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
const { CONVEX_SELF_HOSTED_URL, CONVEX_SELF_HOSTED_ADMIN_KEY } = process.env;
if (!dryRun && (!CONVEX_SELF_HOSTED_URL || !CONVEX_SELF_HOSTED_ADMIN_KEY)) {
  console.error(
    "missing CONVEX_SELF_HOSTED_URL / CONVEX_SELF_HOSTED_ADMIN_KEY — set them in .env.local\n" +
      "admin key: docker exec <convex-backend-container> ./generate_admin_key.sh",
  );
  process.exit(1);
}

// ── stage ─────────────────────────────────────────────────────────────────
rmSync(STAGE, { recursive: true, force: true });
mkdirSync(STAGE, { recursive: true });
cpSync(path.join(ROOT, "convex"), path.join(STAGE, "convex"), { recursive: true });
// drop the ambient stub — the CLI writes real codegen output here
rmSync(path.join(STAGE, "convex", "_generated"), { recursive: true, force: true });
// project marker so the CLI roots itself in the stage dir. The CLI refuses
// to codegen unless `convex` is declared as a dependency; actual modules
// still resolve from the repo's node_modules by walking up.
const rootPkg = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8"));
writeFileSync(
  path.join(STAGE, "package.json"),
  JSON.stringify(
    {
      name: "rr-convex-deploy",
      private: true,
      type: "module",
      dependencies: {
        convex: rootPkg.dependencies.convex,
        "@convex-dev/auth": rootPkg.dependencies["@convex-dev/auth"],
      },
    },
    null,
    2,
  ),
);

// ── codegen sanity, then deploy ──────────────────────────────────────────
const run = (cmd) =>
  execSync(cmd, { cwd: STAGE, stdio: "inherit", env: process.env });

try {
  run("npx convex codegen");
  if (dryRun) {
    console.log("\n--dry-run: codegen OK, skipping deploy");
  } else {
    run("npx convex deploy --yes");
    console.log("\ndeployed to", CONVEX_SELF_HOSTED_URL);
  }
} finally {
  rmSync(STAGE, { recursive: true, force: true });
}
