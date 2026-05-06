#!/usr/bin/env tsx
/**
 * Generate per-slice docs/ folder.
 *
 * For each frontend/slices/<slug>/ writes:
 *   docs/DEPS.md      — cross-slice import map (grouped by shared/, convex, sibling slices)
 *   docs/CONTRACT.md  — Convex schema tables, RBAC perms, audit events (if convex/features/<slug>/ exists)
 *   docs/STATUS.md    — mirror of defineFeature({ status, name, description })
 *   docs/USAGE.md     — copy-paste mount example (templated)
 *
 * Run: pnpm run generate:slice-docs
 * Wired into pnpm sync:all.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../..");
const SLICES_DIR = path.join(ROOT, "frontend/slices");
const CONVEX_FEATURES = path.join(ROOT, "convex/features");

type SliceMeta = {
  slug: string;
  hasConfig: boolean;
  hasInit: boolean;
  hasPage: boolean;
  hasViews: boolean;
  hasAgent: boolean;
  hasSettings: boolean;
  configRaw?: string;
};

async function exists(p: string) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function listSlices(): Promise<string[]> {
  const entries = await fs.readdir(SLICES_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && !e.name.startsWith("_") && e.name !== "example")
    .map((e) => e.name);
}

async function readSlice(slug: string): Promise<SliceMeta> {
  const dir = path.join(SLICES_DIR, slug);
  const meta: SliceMeta = {
    slug,
    hasConfig: await exists(path.join(dir, "config.ts")),
    hasInit: await exists(path.join(dir, "init.ts")),
    hasPage: await exists(path.join(dir, "page.tsx")),
    hasViews: await exists(path.join(dir, "views")),
    hasAgent: await exists(path.join(dir, "agent/index.ts")),
    hasSettings: await exists(path.join(dir, "settings/index.ts")),
  };
  if (meta.hasConfig) {
    meta.configRaw = await fs.readFile(path.join(dir, "config.ts"), "utf8");
  }
  return meta;
}

async function walkFiles(root: string, exts = [".ts", ".tsx"]): Promise<string[]> {
  const out: string[] = [];
  async function rec(dir: string) {
    let entries;
    try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === "node_modules" || e.name === ".next" || e.name === "docs") continue;
        await rec(p);
      } else if (exts.includes(path.extname(e.name))) {
        out.push(p);
      }
    }
  }
  await rec(root);
  return out;
}

async function buildDeps(slug: string): Promise<string> {
  const dir = path.join(SLICES_DIR, slug);
  const files = await walkFiles(dir);
  const importRe = /from\s+["']([^"']+)["']/g;
  const buckets = new Map<string, Set<string>>();
  for (const f of files) {
    const src = await fs.readFile(f, "utf8");
    const rel = path.relative(dir, f);
    let m: RegExpExecArray | null;
    while ((m = importRe.exec(src))) {
      const imp = m[1];
      if (imp.startsWith(".")) continue;
      let bucket = "external";
      if (imp.startsWith("@/frontend/shared")) bucket = "shared";
      else if (imp.startsWith("@/convex")) bucket = "convex";
      else if (imp.startsWith("@notion/")) bucket = "notion-internal";
      else if (imp.startsWith("@/frontend/slices/")) bucket = "sibling-slices";
      else if (imp.startsWith("@/")) bucket = "project-root";
      if (!buckets.has(bucket)) buckets.set(bucket, new Set());
      buckets.get(bucket)!.add(`${imp}  (${rel})`);
    }
  }
  let md = `# ${slug} — Dependencies\n\nAuto-generated. Do not edit. Re-run via \`pnpm generate:slice-docs\`.\n\n`;
  for (const order of ["shared", "convex", "sibling-slices", "project-root", "notion-internal", "external"]) {
    const set = buckets.get(order);
    if (!set || set.size === 0) continue;
    md += `## ${order}\n\n`;
    for (const line of [...set].sort()) md += `- \`${line}\`\n`;
    md += "\n";
  }
  return md;
}

async function buildContract(slug: string): Promise<string> {
  const conv = path.join(CONVEX_FEATURES, slug);
  if (!(await exists(conv))) {
    return `# ${slug} — Contract\n\nNo \`convex/features/${slug}/\` directory. Frontend-only slice.\n`;
  }
  const files = await walkFiles(conv);
  const tables = new Set<string>();
  const perms = new Set<string>();
  const audits = new Set<string>();
  for (const f of files) {
    const src = await fs.readFile(f, "utf8");
    for (const m of src.matchAll(/defineTable\([\s\S]*?\)/g)) {
      const tableName = path.basename(f, path.extname(f));
      tables.add(`${tableName} — \`${path.relative(conv, f)}\``);
    }
    for (const m of src.matchAll(/requirePermission\(\s*ctx\s*,\s*[^,]+,\s*["']([^"']+)["']/g)) {
      perms.add(m[1]);
    }
    for (const m of src.matchAll(/logAuditEvent\([\s\S]*?action\s*:\s*["']([^"']+)["']/g)) {
      audits.add(m[1]);
    }
  }
  let md = `# ${slug} — Contract\n\nAuto-generated. Convex schema, RBAC permissions, audit events.\n\n`;
  md += `## Tables\n\n${[...tables].sort().map((t) => `- ${t}`).join("\n") || "_none detected_"}\n\n`;
  md += `## Permissions Required\n\n${[...perms].sort().map((p) => `- \`${p}\``).join("\n") || "_none detected_"}\n\n`;
  md += `## Audit Events\n\n${[...audits].sort().map((a) => `- \`${a}\``).join("\n") || "_none detected_"}\n`;
  return md;
}

function buildStatus(meta: SliceMeta): string {
  let md = `# ${meta.slug} — Status\n\nAuto-generated mirror of \`config.ts\` defineFeature.\n\n`;
  if (!meta.configRaw) {
    md += `_No config.ts found._\n`;
    return md;
  }
  const grab = (re: RegExp) => meta.configRaw!.match(re)?.[1]?.trim();
  const name = grab(/name\s*:\s*["']([^"']+)["']/);
  const description = grab(/description\s*:\s*["']([^"']+)["']/);
  const state = grab(/state\s*:\s*["']([^"']+)["']/);
  md += `- **name**: ${name ?? "_unknown_"}\n`;
  md += `- **description**: ${description ?? "_unknown_"}\n`;
  md += `- **status.state**: ${state ?? "_unknown_"}\n`;
  md += `- has config.ts: ${meta.hasConfig}\n`;
  md += `- has init.ts: ${meta.hasInit}\n`;
  md += `- has page.tsx: ${meta.hasPage}\n`;
  md += `- has views/: ${meta.hasViews}\n`;
  md += `- has agent/: ${meta.hasAgent}\n`;
  md += `- has settings/: ${meta.hasSettings}\n`;
  return md;
}

function buildUsage(slug: string): string {
  return `# ${slug} — Usage\n\nMount this slice in a route:

\`\`\`tsx
// app/dashboard/${slug}/page.tsx
import { ${capitalize(slug)}Page } from "@/frontend/slices/${slug}/page";
export default ${capitalize(slug)}Page;
\`\`\`

Wrap in \`<ThreeColumnLayout>\` if it benefits from sidebar/inspector. Register settings in \`init.ts\` (called from \`InitFeatureSettingsClient\`).
`;
}

function capitalize(s: string) {
  return s.split(/[-_]/).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
}

async function main() {
  const slugs = await listSlices();
  console.log(`generate-slice-docs: ${slugs.length} slices`);
  for (const slug of slugs) {
    const meta = await readSlice(slug);
    const docsDir = path.join(SLICES_DIR, slug, "docs");
    await fs.mkdir(docsDir, { recursive: true });
    await fs.writeFile(path.join(docsDir, "DEPS.md"), await buildDeps(slug));
    await fs.writeFile(path.join(docsDir, "CONTRACT.md"), await buildContract(slug));
    await fs.writeFile(path.join(docsDir, "STATUS.md"), buildStatus(meta));
    await fs.writeFile(path.join(docsDir, "USAGE.md"), buildUsage(slug));
    console.log(`  ✓ ${slug}/docs/`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
