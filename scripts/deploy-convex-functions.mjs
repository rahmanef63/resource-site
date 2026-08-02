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

// ── admin-runtime allowlist ───────────────────────────────────────────────
// rr's site runs ONLY the admin-login rate limiter on Convex; everything
// else in convex/features/ is copy-source for consumers. Deploy a CURATED
// subset so the 129 consumer-only functions + their tables never land on
// rr's backend. To add an admin-runtime feature later, add its dir + any
// _shared deps + the table to convex/schema.ts.
const ADMIN_CONVEX = [
  "schema.ts",
  "crons.ts",
  "features/rate_limit",
  "_shared/crypto.ts",
];

// ── stage ─────────────────────────────────────────────────────────────────
rmSync(STAGE, { recursive: true, force: true });
mkdirSync(path.join(STAGE, "convex"), { recursive: true });
for (const rel of ADMIN_CONVEX) {
  const src = path.join(ROOT, "convex", rel);
  if (!existsSync(src)) {
    console.error(`allowlist entry missing: convex/${rel}`);
    process.exit(1);
  }
  const dest = path.join(STAGE, "convex", rel);
  mkdirSync(path.dirname(dest), { recursive: true });
  cpSync(src, dest, { recursive: true });
}
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
