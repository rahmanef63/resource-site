#!/usr/bin/env node
// rahman-resources — installer for the Rahman kitab.
// Usage:
//   npx rahman-resources init <app-name> [--template <slug>] [--features a,b] [--skills x,y]
//   npx rahman-resources add <slug> [target-dir]
//   npx rahman-resources add-skill <slug> [target-dir]
//   npx rahman-resources list [layouts|recipes|features|skills]
//   npx rahman-resources info <slug>
//   npx rahman-resources doctor
//   npx rahman-resources mcp                # not implemented in CLI; install rahman-resources-mcp

import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import kleur from "kleur";
import tiged from "tiged";

import {
  readRr,
  writeRr,
  rrExists,
  validateRr,
  addFeature as rrAddFeature,
  addSkill as rrAddSkill,
} from "../lib/rr.mjs";
import { runPostInit } from "../lib/post-init.mjs";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifest = require(path.join(__dirname, "../lib/manifest.json"));
const skillsInventory = require(path.join(__dirname, "../lib/skills.json"));

const REPO = manifest.repo ?? "rahmanef63/resource-site";
const BRANCH = manifest.branch ?? "main";
const SKILLS_REPO = "anthropics/skills";

const KINDS = /** @type {const} */ (["layout", "recipe", "feature"]);

const [, , cmd, ...rest] = process.argv;

queueMicrotask(() =>
  main().catch((err) => {
    console.error(kleur.red("✖"), err.message ?? err);
    process.exit(1);
  }),
);

async function main() {
  switch (cmd) {
    case "init":
    case "create":
    case "new":
      return runInit(rest);
    case "add":
      return runAdd(rest);
    case "add-skill":
      return runAddSkill(rest);
    case "list":
    case "ls":
      return runList(rest);
    case "info":
      return runInfo(rest);
    case "doctor":
      return runDoctor(rest);
    case "mcp":
      return runMcpHint();
    case undefined:
    case "-h":
    case "--help":
    case "help":
      return printHelp();
    case "-v":
    case "--version":
    case "version":
      return printVersion();
    default:
      console.error(kleur.red(`Unknown command: ${cmd}`));
      printHelp();
      process.exit(1);
  }
}

function printVersion() {
  const pkg = require(path.join(__dirname, "../package.json"));
  console.log(pkg.version);
}

function printHelp() {
  console.log(`
${kleur.bold("rahman-resources")} — scaffold + install templates, recipes, features, Claude skills

${kleur.bold("Usage:")}
  npx rahman-resources init <app-name> [--template <slug>] [--features a,b] [--skills x,y]
                                       [--no-install] [--with-shadcn-reinit]
  npx rahman-resources add <slug> [target-dir]
  npx rahman-resources add-skill <slug> [target-dir]
  npx rahman-resources list [layouts|recipes|features|skills]
  npx rahman-resources info <slug>
  npx rahman-resources doctor
  npx rahman-resources mcp

${kleur.bold("Init flags:")}
  --no-install            skip 'npm install' step (faster scaffolds; you run it manually)
  --with-shadcn-reinit    delete starter components.json + run 'npx shadcn init -y -d' (canonical shadcn flow)

${kleur.bold("Examples:")}
  npx rahman-resources init my-app
  npx rahman-resources init my-app --template personal-brand-os --skills frontend-design,mcp-builder
  npx rahman-resources init my-app --no-install
  npx rahman-resources add personal-brand-os .
  npx rahman-resources add-skill webapp-testing
  npx rahman-resources list skills
`);
}

// ─── flag parsing ─────────────────────────────────────────────────────────

function parseFlags(rest) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = rest[i + 1];
      if (next && !next.startsWith("--")) { flags[key] = next; i++; }
      else flags[key] = true;
    } else {
      positional.push(a);
    }
  }
  return { positional, flags };
}

function csv(s) {
  if (!s || s === true) return [];
  return String(s).split(",").map((x) => x.trim()).filter(Boolean);
}

// ─── catalog lookups ──────────────────────────────────────────────────────

function findEntry(slug) {
  for (const kind of KINDS) {
    const list = manifest[kind + "s"];
    const e = list.find((x) => x.slug === slug);
    if (e) return { kind, entry: e };
  }
  return null;
}

function findSkill(slug) {
  return skillsInventory.skills.find((s) => s.slug === slug) ?? null;
}

// ─── list / info ──────────────────────────────────────────────────────────

function runList([filter]) {
  const groups = filter
    ? [filter]
    : ["layouts", "recipes", "features", "skills"];
  for (const g of groups) {
    if (g === "skills") {
      console.log(`\n${kleur.bold("SKILLS")} ${kleur.dim(`(${skillsInventory.skills.length})`)}\n`);
      for (const s of skillsInventory.skills) {
        console.log(`  ${kleur.cyan(s.slug.padEnd(28))} ${kleur.dim((s.category ?? "").padEnd(12))} ${s.title}`);
      }
      continue;
    }
    const list = manifest[g];
    if (!list || list.length === 0) continue;
    console.log(`\n${kleur.bold(g.toUpperCase())} ${kleur.dim(`(${list.length})`)}\n`);
    for (const t of list) {
      const cat = (t.category ?? t.source ?? "").padEnd(20).slice(0, 20);
      console.log(`  ${kleur.cyan(t.slug.padEnd(30))} ${kleur.dim(cat)} ${t.title}`);
    }
  }
  console.log(`\nRun ${kleur.cyan("info <slug>")} for detail, ${kleur.cyan("add <slug>")} or ${kleur.cyan("add-skill <slug>")} to install.\n`);
}

function runInfo([slug]) {
  if (!slug) throw new Error("Usage: rahman-resources info <slug>");
  const skill = findSkill(slug);
  if (skill) {
    console.log(`
${kleur.bold(skill.title)}  ${kleur.dim("[skill]")}  ${kleur.dim(skill.category)}

${skill.description}

${kleur.bold("Source:")}  ${skill.source}/${skill.path}
${kleur.bold("Install:")} ${kleur.cyan(`npx rahman-resources add-skill ${skill.slug}`)}
`);
    return;
  }
  const found = findEntry(slug);
  if (!found) throw new Error(`Slug not found: ${slug}. Run 'list' to see all.`);
  const { kind, entry: t } = found;

  console.log(`
${kleur.bold(t.title)}  ${kleur.dim(`[${kind}]`)}  ${kleur.dim(t.category ?? "")}

${t.description}
`);
  if (kind === "layout") {
    console.log(`${kleur.bold("Pulls:")}`);
    console.log(t.pullPaths.map((p) => `  · ${p}`).join("\n") || "  (none)");
    if (t.dependencies?.length) {
      console.log(`\n${kleur.bold("Dependencies:")}`);
      console.log(t.dependencies.map((d) => `  · ${d}`).join("\n"));
    }
  } else if (kind === "feature") {
    console.log(`${kleur.bold("Install:")}\n  ${t.install}`);
    if (t.npmPackages?.length) {
      console.log(`\n${kleur.bold("npm packages:")}`);
      console.log(t.npmPackages.map((d) => `  · ${d}`).join("\n"));
    }
  } else if (kind === "recipe") {
    console.log(`${kleur.bold("Files:")}`);
    console.log(t.files.map((f) => `  · ${f}`).join("\n"));
  }
  if (t.docsUrl) console.log(`\n${kleur.dim(`Docs: ${t.docsUrl}`)}`);
  console.log(`${kleur.dim(`Source: ${t.source ?? "—"}`)}\n`);
}

// ─── starter copy ─────────────────────────────────────────────────────────

const STARTER_RENAME_PAIRS = [
  ["_package", "package"],
  ["_gitignore", ".gitignore"],
  ["_env", ".env"],
  ["_README", "README"],
];

function renameStarterFile(name) {
  for (const pair of STARTER_RENAME_PAIRS) {
    const f = pair[0];
    const t = pair[1];
    if (name === f || name.startsWith(f + ".")) return t + name.slice(f.length);
  }
  return name;
}

function copyStarterTree(src, dest, appName, slug) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const sFull = path.join(src, entry);
    const dEntry = renameStarterFile(entry);
    const dFull = path.join(dest, dEntry);
    const stat = statSync(sFull);
    if (stat.isDirectory()) {
      copyStarterTree(sFull, dFull, appName, slug);
    } else {
      let body = readFileSync(sFull, "utf8");
      body = body.replaceAll("__APP_NAME__", appName).replaceAll("__APP_SLUG__", slug);
      writeFileSync(dFull, body);
    }
  }
}

// ─── init ─────────────────────────────────────────────────────────────────

async function runInit(rest) {
  const { positional, flags } = parseFlags(rest);
  const [appName] = positional;
  if (!appName || appName.startsWith("-")) {
    throw new Error("Usage: rahman-resources init <app-name> [--template slug] [--features a,b] [--skills x,y]");
  }
  const slug = appName.replace(/[^a-z0-9-_]/gi, "-").toLowerCase();
  const target = path.resolve(process.cwd(), appName);
  if (existsSync(target)) {
    throw new Error(`Directory already exists: ${target}`);
  }

  const features = csv(flags.features);
  const skills = csv(flags.skills);
  const template = typeof flags.template === "string" ? flags.template : null;

  if (template && !findEntry(template)) {
    throw new Error(`Unknown template: ${template}. Run 'list layouts' to see available.`);
  }
  for (const s of skills) {
    if (!findSkill(s)) throw new Error(`Unknown skill: ${s}. Run 'list skills' to see available.`);
  }
  for (const f of features) {
    if (!findEntry(f)) throw new Error(`Unknown feature: ${f}. Run 'list features' to see available.`);
  }

  console.log(kleur.bold(`\n→ Scaffolding ${kleur.cyan(slug)} (Next 16 + Convex + shadcn)\n`));

  const starter = path.join(__dirname, "../lib/starter");
  if (!existsSync(starter)) throw new Error(`Starter not found at ${starter}`);

  process.stdout.write(`  copying starter ... `);
  copyStarterTree(starter, target, appName, slug);
  console.log(kleur.green("ok"));

  const skipInstall = !!flags["no-install"];
  const reinitShadcn = !!flags["with-shadcn-reinit"];

  if (!skipInstall) {
    console.log(kleur.bold(`\n→ Installing dependencies (npm install --legacy-peer-deps)\n`));
    try {
      await runShell("npm", ["install", "--legacy-peer-deps"], target);
    } catch (err) {
      console.log(kleur.yellow(`  ⚠ npm install failed (${err.message}). You can rerun manually.`));
    }
  } else {
    console.log(kleur.dim(`\n  (skipping npm install — --no-install)`));
  }

  if (reinitShadcn && !skipInstall) {
    console.log(kleur.bold(`\n→ Re-running shadcn init (--with-shadcn-reinit)\n`));
    try {
      // Remove pre-baked components.json so shadcn writes a fresh one — post-init re-applies our aliases.
      const cjPath = path.join(target, "components.json");
      if (existsSync(cjPath)) writeFileSync(cjPath + ".bak", readFileSync(cjPath, "utf8"));
      await runShell("npx", ["shadcn@latest", "init", "--yes", "--defaults"], target);
    } catch (err) {
      console.log(kleur.yellow(`  ⚠ shadcn init failed (${err.message}). Continuing.`));
    }
  } else if (!skipInstall) {
    console.log(kleur.dim(`\n  (skipping shadcn init — starter already pre-configured. Pass --with-shadcn-reinit to force re-init.)`));
  }

  process.stdout.write(`\n  post-init restructure ... `);
  const post = runPostInit(target, { template, features, skills });
  console.log(kleur.green("ok"));
  for (const c of post.changed) console.log(`    ${kleur.green("+")} ${c}`);
  for (const s of post.skipped) console.log(`    ${kleur.dim("-")} ${kleur.dim(s)}`);

  if (template) {
    console.log(kleur.bold(`\n→ Pulling template ${kleur.cyan(template)}\n`));
    const t = findEntry(template).entry;
    for (const p of t.pullPaths ?? []) {
      const dest = path.join(target, p);
      process.stdout.write(`  ${kleur.dim(p)} ... `);
      await pull(p, dest);
      console.log(kleur.green("ok"));
    }
  }

  if (skills.length) {
    console.log(kleur.bold(`\n→ Pulling ${skills.length} Claude skill(s)\n`));
    for (const s of skills) await installSkill(s, target);
  }

  console.log(`\n${kleur.green("✓")} Done. ${kleur.bold(slug)} scaffolded.\n`);
  console.log(`${kleur.bold("Next:")}`);
  console.log(`  cd ${appName}`);
  console.log(`  cp .env.example .env.local   ${kleur.dim("# fill NEXT_PUBLIC_CONVEX_URL")}`);
  if (skipInstall) console.log(`  npm install --legacy-peer-deps`);
  console.log(`  npx convex dev --once         ${kleur.dim("# generates convex/_generated")}`);
  console.log(`  npm run dev\n`);
}

// Spawn a child process inheriting stdio, resolves on exit 0.
function runShell(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const ps = spawn(cmd, args, { cwd, stdio: "inherit", shell: true });
    ps.on("error", reject);
    ps.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

// ─── add (template / feature / recipe) ────────────────────────────────────

async function runAdd([slug, targetArg = "."]) {
  if (!slug) {
    console.error(kleur.red("Missing slug."));
    printHelp();
    process.exit(1);
  }
  const found = findEntry(slug);
  if (!found) throw new Error(`"${slug}" not found. Run ${kleur.cyan("npx rahman-resources list")}.`);
  const { kind, entry } = found;
  const target = path.resolve(process.cwd(), targetArg);

  if (kind === "layout") return addLayout(entry, target, targetArg);
  if (kind === "feature") return addFeature(entry, target, targetArg);
  if (kind === "recipe") return addRecipe(entry);
}

async function addLayout(t, target, targetArg) {
  console.log(kleur.bold(`\n→ Installing ${kleur.cyan(t.title)} into ${kleur.dim(target)}\n`));
  if (!t.pullPaths || t.pullPaths.length === 0) {
    throw new Error(`Layout "${t.slug}" has no valid pullPaths in manifest.`);
  }
  for (const p of t.pullPaths) {
    const dest = path.join(target, p);
    process.stdout.write(`  pulling ${kleur.dim(p)} ... `);
    await pull(p, dest);
    console.log(kleur.green("ok"));
  }

  if (t.dependencies?.length) {
    const pm = detectPM(target);
    console.log(kleur.bold(`\n→ Installing dependencies via ${kleur.cyan(pm)}\n`));
    if (!hasPackageJson(target)) {
      console.log(kleur.yellow(`  ${target}/package.json not found — skipping install.`));
      console.log(kleur.dim(`  Run later: cd ${targetArg} && ${pm} ${pm === "npm" ? "install" : "add"} ${t.dependencies.join(" ")}`));
    } else {
      await runPM(pm, t.dependencies, target);
    }
  }

  if (rrExists(target)) {
    const rr = readRr(target);
    rr.template = { slug: t.slug, version: "main" };
    writeRr(rr, target);
  }

  console.log(`\n${kleur.green("✓")} Done. ${kleur.bold(t.title)} installed.`);
  if (t.agentRecipe) console.log(`\n${kleur.bold("Next:")}\n${indent(t.agentRecipe, 2)}\n`);
}

async function addFeature(t, target, targetArg) {
  console.log(kleur.bold(`\n→ Adding feature ${kleur.cyan(t.title)} to ${kleur.dim(target)}\n`));
  if (!t.npmPackages || t.npmPackages.length === 0) {
    console.log(kleur.dim(`  No npm packages to install (${t.install}).`));
  } else {
    const pm = detectPM(target);
    if (!hasPackageJson(target)) {
      console.log(kleur.yellow(`  ${target}/package.json not found — skipping install.`));
      console.log(kleur.dim(`  Run later: cd ${targetArg} && ${pm} ${pm === "npm" ? "install" : "add"} ${t.npmPackages.join(" ")}`));
    } else {
      console.log(kleur.dim(`  via ${pm}: ${t.npmPackages.join(" ")}\n`));
      await runPM(pm, t.npmPackages, target);
    }
  }

  if (rrExists(target)) {
    const rr = readRr(target);
    rrAddFeature(rr, t.slug);
    writeRr(rr, target);
    console.log(kleur.dim(`  rr.json: features += ${t.slug}`));
  }

  console.log(`\n${kleur.green("✓")} Feature added: ${kleur.bold(t.title)}`);
  if (t.exampleCode) console.log(`\n${kleur.bold("Example:")}\n${indent(t.exampleCode, 2)}`);
  if (t.agentRecipe) console.log(`\n${kleur.bold("Wire-up:")}\n${indent(t.agentRecipe, 2)}\n`);
  if (t.docsUrl) console.log(`\n${kleur.dim(`Docs: ${t.docsUrl}`)}\n`);
}

function addRecipe(t) {
  console.log(`\n${kleur.bold(t.title)} ${kleur.dim("(recipe — manual port)")}\n`);
  console.log(t.description);
  console.log(`\n${kleur.bold("Source:")} ${t.source}`);
  console.log(`\n${kleur.bold("Files to port:")}`);
  console.log(t.files.map((f) => `  · ${f}`).join("\n"));
  if (t.exampleCode) console.log(`\n${kleur.bold("Example:")}\n${indent(t.exampleCode, 2)}`);
  if (t.agentRecipe) console.log(`\n${kleur.bold("Wire-up:")}\n${indent(t.agentRecipe, 2)}\n`);
  console.log(kleur.dim(`\n(Recipes are educational patterns — copy from source repo into your project manually.)\n`));
}

// ─── add-skill ────────────────────────────────────────────────────────────

async function runAddSkill([slug, targetArg = "."]) {
  if (!slug) throw new Error("Usage: rahman-resources add-skill <slug>");
  const skill = findSkill(slug);
  if (!skill) throw new Error(`Unknown skill: ${slug}. Run 'list skills' to see available.`);
  const target = path.resolve(process.cwd(), targetArg);
  await installSkill(slug, target);

  if (rrExists(target)) {
    const rr = readRr(target);
    rrAddSkill(rr, slug, skill.source);
    writeRr(rr, target);
    console.log(kleur.dim(`  rr.json: skills += ${slug}`));
  }

  console.log(`\n${kleur.green("✓")} Skill installed: ${kleur.bold(skill.title)}`);
  console.log(kleur.dim(`  Location: .claude/skills/${slug}/`));
}

async function installSkill(slug, target) {
  const skill = findSkill(slug);
  if (!skill) throw new Error(`Unknown skill: ${slug}`);
  const dest = path.join(target, ".claude", "skills", slug);
  process.stdout.write(`  ${kleur.cyan(slug.padEnd(20))} ${kleur.dim(`→ .claude/skills/${slug}/`)} ... `);
  if (skill.source === "anthropics") {
    const emitter = tiged(`${SKILLS_REPO}/${skill.path}`, { cache: false, force: true, verbose: false });
    await emitter.clone(dest);
  } else if (skill.source === "rahman") {
    // Future: ship rahman-authored skills inside this repo. For now, scaffold a stub.
    mkdirSync(dest, { recursive: true });
    writeFileSync(
      path.join(dest, "SKILL.md"),
      `---\nname: ${skill.slug}\ndescription: ${skill.description}\n---\n\n# ${skill.title}\n\nStub — to be filled by rahman-resources kitab.\n`,
    );
  } else {
    throw new Error(`Unsupported skill source: ${skill.source}`);
  }
  console.log(kleur.green("ok"));
}

// ─── doctor ───────────────────────────────────────────────────────────────

function runDoctor() {
  const target = process.cwd();
  if (!rrExists(target)) {
    console.log(kleur.yellow("⚠ No rr.json found in cwd. Run 'rahman-resources init <app>' first."));
    process.exit(1);
  }
  const rr = readRr(target);
  const issues = validateRr(rr);
  if (issues.length === 0) {
    console.log(kleur.green("✓ rr.json is valid."));
    console.log(`  template:  ${kleur.cyan(rr.template?.slug ?? "(none)")}`);
    console.log(`  features:  ${kleur.cyan(rr.features?.length ?? 0)}`);
    console.log(`  skills:    ${kleur.cyan(rr.skills?.length ?? 0)}`);
    return;
  }
  console.log(kleur.red(`✖ rr.json has ${issues.length} issue(s):`));
  for (const i of issues) console.log(`  · ${i}`);
  process.exit(1);
}

function runMcpHint() {
  console.log(`
${kleur.bold("Rahman Resources MCP server")}

Install + wire it into your Claude Code / Cursor config:

${kleur.cyan(`{
  "mcpServers": {
    "rahman-resources": {
      "command": "npx",
      "args": ["-y", "rahman-resources-mcp"]
    }
  }
}`)}

Then in Claude Code: ${kleur.cyan("/mcp")} to see available rr_* tools.
`);
}

// ─── helpers ──────────────────────────────────────────────────────────────

async function pull(repoPath, dest) {
  const emitter = tiged(`${REPO}/${repoPath}#${BRANCH}`, { cache: false, force: true, verbose: false });
  await emitter.clone(dest);
}

function detectPM(target) {
  if (existsSync(path.join(target, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(path.join(target, "yarn.lock"))) return "yarn";
  if (existsSync(path.join(target, "bun.lockb"))) return "bun";
  return "npm";
}

function hasPackageJson(target) {
  return existsSync(path.join(target, "package.json"));
}

function runPM(pm, deps, cwd) {
  const args = pm === "npm" ? ["install", ...deps] : ["add", ...deps];
  return new Promise((resolve, reject) => {
    const ps = spawn(pm, args, { cwd, stdio: "inherit", shell: true });
    ps.on("error", reject);
    ps.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${pm} ${args[0]} exited ${code}`))));
  });
}

function indent(s, n) {
  const pad = " ".repeat(n);
  return s.split("\n").map((l) => pad + l).join("\n");
}
