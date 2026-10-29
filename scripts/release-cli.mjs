#!/usr/bin/env node
// Reproducible release for the rahman-resources CLI.
//
// Run from the repository root:
//   node scripts/release-cli.mjs --dry-run
//   node scripts/release-cli.mjs --bump minor
//
// Does everything up to (but never including) push and npm publish.
//
// Flags:
//   --dry-run         run all gates, print planned version, no bump/commit/tag
//   --bump <kind>     patch | minor | major (default: patch)
//   --allow-dirty     continue with a dirty worktree (loud warning)
//   --allow-branch    continue off main / behind origin/main (loud warning)

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const CLI_DIR = "packages/cli";
const PKG_FILE = path.join(CLI_DIR, "package.json");

const argv = process.argv.slice(2);
const has = (flag) => argv.includes(flag);
const argOf = (flag, fallback) => {
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};

const DRY = has("--dry-run");
const ALLOW_DIRTY = has("--allow-dirty");
const ALLOW_BRANCH = has("--allow-branch");
const KIND = argOf("--bump", "patch");

const die = (msg) => {
  console.error(`\n✖ ${msg}`);
  process.exit(1);
};
const warn = (msg) => console.warn(`\n⚠ ${msg}`);
const step = (msg) => console.log(`\n▸ ${msg}`);

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: "utf8", stdio: "inherit", ...opts });
}

if (!["patch", "minor", "major"].includes(KIND)) {
  die(`--bump must be patch, minor or major (got "${KIND}")`);
}

// (a) repo root + clean tree ------------------------------------------------
step("checking location and worktree state");
const root = git("rev-parse", "--show-toplevel");
if (path.resolve(root) !== path.resolve(process.cwd())) {
  die(`must run from the repository root (${root}), cwd is ${process.cwd()}`);
}

const dirty = git("status", "--porcelain");
if (dirty) {
  if (!ALLOW_DIRTY) {
    die(`worktree is dirty — commit or stash first:\n${dirty}`);
  }
  warn("--allow-dirty: releasing from a dirty worktree. The tarball will include uncommitted files.");
}

// (b) branch + up to date ---------------------------------------------------
step("checking branch");
const branch = git("rev-parse", "--abbrev-ref", "HEAD");
if (branch !== "main") {
  if (!ALLOW_BRANCH) die(`must release from main (on "${branch}"); pass --allow-branch to override`);
  warn(`--allow-branch: releasing from "${branch}" instead of main.`);
}

let behind = "";
try {
  const head = git("rev-parse", "HEAD");
  const upstream = git("rev-parse", "origin/main");
  if (head !== upstream) behind = `HEAD ${head.slice(0, 8)} != origin/main ${upstream.slice(0, 8)}`;
} catch {
  behind = "origin/main is not available locally";
}
if (behind) {
  if (!ALLOW_BRANCH) die(`${behind}; run "git fetch origin" and rebase/merge before releasing`);
  warn(`--allow-branch: ${behind}.`);
}

// (c) gates ----------------------------------------------------------------
step("gate: manifest sync");
run("npm", ["run", "manifest:sync"]);
try {
  execFileSync("git", ["diff", "--exit-code", "--", path.join(CLI_DIR, "lib/manifest.json")], {
    stdio: "inherit",
  });
} catch {
  git("checkout", "--", path.join(CLI_DIR, "lib/manifest.json"));
  die(`${CLI_DIR}/lib/manifest.json was stale. It has been regenerated on disk — review, commit it, and re-run.`);
}

step("gate: catalog check");
run("npm", ["run", "gen:catalog:check"]);

// (d) tarball contents -----------------------------------------------------
step("gate: package contents");
const packRaw = execFileSync("npm", ["pack", "--dry-run", "--json"], {
  cwd: path.resolve(CLI_DIR),
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"],
});
const pack = JSON.parse(packRaw)[0];
const FORBIDDEN = /\.test\.|node_modules|\.env/;
const offenders = pack.files.map((f) => f.path).filter((p) => FORBIDDEN.test(p));
if (offenders.length) {
  die(`tarball contains forbidden paths:\n${offenders.map((p) => `  - ${p}`).join("\n")}`);
}
console.log(
  `  ${pack.entryCount} files, ${(pack.unpackedSize / 1024).toFixed(1)} KiB unpacked, no test/env/node_modules entries`,
);

// (e) version bump ---------------------------------------------------------
const pkg = JSON.parse(readFileSync(PKG_FILE, "utf8"));
const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(pkg.version);
if (!m) die(`cannot parse version "${pkg.version}" in ${PKG_FILE}`);
let [, major, minor, patch] = m.map(Number);
if (KIND === "major") {
  major += 1;
  minor = 0;
  patch = 0;
} else if (KIND === "minor") {
  minor += 1;
  patch = 0;
} else {
  patch += 1;
}
const next = `${major}.${minor}.${patch}`;

if (DRY) {
  console.log(`\n✔ dry run: all gates passed.`);
  console.log(`  ${pkg.version} → ${next} (${KIND}) would be committed and tagged cli-v${next}.`);
  console.log(`  next commands (not run):`);
  console.log(`    git push origin main --follow-tags`);
  console.log(`    npm publish --workspace ${CLI_DIR}`);
  console.log(`    npm view rahman-resources version`);
  process.exit(0);
}

step(`bumping ${pkg.version} → ${next}`);
pkg.version = next;
writeFileSync(PKG_FILE, `${JSON.stringify(pkg, null, 2)}\n`);

if (git("status", "--porcelain")) {
  warn("tree changed during bumps; committing only the package.json change.");
  git("add", PKG_FILE);
  git("commit", "-m", `chore(cli): release v${next}`);
} else {
  console.log("  version unchanged, nothing to commit");
}
git("tag", "-a", `cli-v${next}`, "-m", `rahman-resources v${next}`);

console.log(`\n✔ released rahman-resources v${next} locally (commit + tag).`);
console.log(`  next commands (not run):`);
console.log(`    git push origin main --follow-tags`);
console.log(`    npm publish --workspace ${CLI_DIR}`);
console.log(`    npm view rahman-resources version`);
