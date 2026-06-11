// audit-slice-helpers.mjs — pure helpers extracted from audit-slice.mjs
// to keep both files ≤200 LOC. No I/O side-effects beyond fs reads.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

export const ALLOWED_IMPORT_PREFIXES = [
  // App-relative shared / UI
  "@/components/ui/",
  "@/components/shared/",
  // _shared template primitives (CRUD shell, landing, pages, etc.) —
  // sibling slices declared as peer deps. Allowed cross-slice import.
  "@/components/templates/_shared/",
  "@/lib/shared/",
  "@/lib/utils",
  "@/lib/utils.ts",
  "@/shared/",
  // Nested-cluster internal alias (CLAUDE.md "Notion Slice Convention").
  // @notion/* → frontend/slices/notion/* — the cluster's private shared
  // layer (vendored block/page types, uid, inlineMd). Cluster-internal, same
  // spirit as relative-within-slice but across the slice-of-slices tree.
  "@notion/",
  // Convex barrels
  "@convex/",
  // Standard libs / frameworks
  "react",
  "react-dom",
  "next",
  "next/",
  "lucide-react",
  "convex",
  "convex/",
  "@convex-dev/",
  "zod",
  "clsx",
  "tailwind-merge",
];

export function discoverSlices(slicesRoot) {
  if (!existsSync(slicesRoot)) return [];
  const out = [];
  for (const name of readdirSync(slicesRoot)) {
    if (name.startsWith("_") || name.startsWith(".")) continue;
    const dir = path.join(slicesRoot, name);
    if (!statSync(dir).isDirectory()) continue;
    const sj = path.join(dir, "slice.json");
    if (!existsSync(sj)) continue;
    const meta = JSON.parse(readFileSync(sj, "utf8"));
    out.push({
      folder: name,
      dir,
      slugFromJson: meta.slug,
      titleFromJson: meta.title,
      categoryFromJson: meta.category,
      configExport: meta.frontend?.configExport,
      previews: meta.previews,
      tablesExport: meta.convex?.tablesExport,
      convexSchemaPath: meta.convex?.schemaPath,
      convexRootPaths: meta.convex?.rootPaths ?? [],
    });
  }
  return out;
}

export function camelCase(slug) {
  return slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

export function findTsFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...findTsFiles(full));
    else if (/\.(ts|tsx)$/.test(name)) out.push(full);
  }
  return out;
}

export function isAllowedPrefix(spec) {
  return ALLOWED_IMPORT_PREFIXES.some((p) => spec === p || spec.startsWith(p));
}

export function isOwnSliceImport(spec, slice) {
  return (
    spec.startsWith(`@/features/${slice.folder}/`) ||
    spec === `@/features/${slice.folder}`
  );
}

export function isRelativeWithinSlice(spec, file, sliceDir) {
  if (!spec.startsWith(".")) return false;
  const target = path.resolve(path.dirname(file), spec);
  return target.startsWith(sliceDir);
}

export function isBareNpmImport(spec) {
  if (
    spec.startsWith(".") ||
    spec.startsWith("/") ||
    spec.startsWith("@/") ||
    spec.startsWith("@convex/")
  )
    return false;
  return true;
}

export function extractTables(slice, repoRoot) {
  const tables = [];
  for (const rp of slice.convexRootPaths) {
    const schemaFile = path.join(repoRoot, rp, "schema.ts");
    if (!existsSync(schemaFile)) continue;
    const body = readFileSync(schemaFile, "utf8");
    const matches = [
      ...body.matchAll(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*defineTable\(/gm),
    ];
    for (const m of matches) tables.push(m[1]);
  }
  return tables;
}

export function readSliceConfig(slice) {
  const file = path.join(slice.dir, "config.ts");
  if (!existsSync(file)) return null;
  const body = readFileSync(file, "utf8");
  const grab = (key) => {
    const m = body.match(new RegExp(`${key}\\s*:\\s*"([^"]+)"`));
    return m ? m[1] : null;
  };
  return {
    slug: grab("slug"),
    title: grab("title"),
    category: grab("category"),
  };
}

// ── style anti-pattern lint (P5) ────────────────────────────────────────────
//
// Two shadcn-parity guards, emitted as WARNINGS (advisory — won't fail CI):
//
//   1. raw-interp className — `className={`…${x}…`}` skips `cn()`, so a
//      consumer override leaves BOTH classes and CSS source-order decides.
//      Fix: `className={cn("…", x)}`.
//   2. hardcoded hex inside a className string — should be a theme token.
//      Escape hatch: a file containing the marker `audit-allow-hex` (in a
//      comment) opts out of rule 2 — reserved for legit brand / third-party
//      palettes (Google logo, Notion colors, GitHub code theme).
//
// Returns an array of human-readable warning strings (caller prefixes slug).
export function lintStyleAntipatterns(relPath, body) {
  const out = [];
  const allowHex = /audit-allow-hex/.test(body);
  const lines = body.split("\n");
  lines.forEach((line, i) => {
    const ln = i + 1;
    // 1. className template-literal opened directly with a backtick (no cn()
    //    wrapper) that interpolates `${…}`.
    if (/className=\{`[^`]*\$\{/.test(line)) {
      out.push(
        `${relPath}:${ln} raw template-literal className without cn() — wrap as cn("…", expr) so consumer overrides merge`,
      );
    }
    // 2. hex literal inside a className string/template, unless the file opts
    //    out via the `audit-allow-hex` marker.
    if (!allowHex && /className=("|'|`)[^"'`]*#[0-9a-fA-F]{3,8}/.test(line)) {
      out.push(
        `${relPath}:${ln} hardcoded hex in className — use a theme token, or add an "audit-allow-hex" comment for legit brand palettes`,
      );
    }
  });
  return out;
}

// Version SSOT parity. slice.json is authoritative (CLI distribution).
// contract.version feeds the snapshot/migration system (snapshot.mjs prefers
// it; migrate-load keys migrations off it), and manifest.version is the
// distribution tag — both must track slice.json or installs/snapshots mislabel.
export function versionTrio(sliceDir) {
  const read = (rel, isJson) => {
    const p = path.join(sliceDir, rel);
    if (!existsSync(p)) return null;
    try {
      const body = readFileSync(p, "utf8");
      if (isJson) return JSON.parse(body).version ?? null;
      const m = body.match(/^\s*version:\s*["']([^"']+)["']/m);
      return m ? m[1] : null;
    } catch {
      return null;
    }
  };
  return {
    json: read("slice.json", true),
    contract: read("slice.contract.ts", false),
    manifest: read("slice.manifest.json", true),
  };
}
