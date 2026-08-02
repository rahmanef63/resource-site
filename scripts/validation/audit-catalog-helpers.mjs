// Helpers for audit-catalog-completeness.mjs.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "..", "..");
const PREVIEW_ROOT = path.join(ROOT, "app", "preview");

export function previewPathExists(p) {
  if (!p || !p.startsWith("/preview/")) return false;
  const rel = p.replace(/^\/preview\//, "");
  const dir = path.join(PREVIEW_ROOT, rel);
  if (!fs.existsSync(dir)) return false;
  if (fs.statSync(dir).isFile()) return true;
  if (fs.existsSync(path.join(dir, "page.tsx"))) return true;
  if (fs.existsSync(path.join(dir, "page.ts"))) return true;
  if (fs.existsSync(path.join(dir, "page.jsx"))) return true;
  return false;
}

const STALE_PATH_TOKENS = ["template-base/", " cp -r ", "`cp -r"];

export function checkAgentRecipeStale(recipe) {
  if (!recipe) return [];
  const issues = [];
  for (const tok of STALE_PATH_TOKENS) {
    if (recipe.includes(tok)) issues.push(`refs '${tok.trim()}'`);
  }
  return issues;
}

export async function loadCatalog(filePath, exportName) {
  const src = fs.readFileSync(filePath, "utf8");
  const out = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      isolatedModules: false,
    },
  }).outputText;
  const tmp = path.join(ROOT, ".tmp-audit-" + path.basename(filePath, ".ts") + ".mjs");
  const cleaned = out
    .replace(/import\s+[^;]*from\s+["'][^"']+["'];?/g, "")
    .replace(/export\s+type\s+[^=]*=\s*[^;]*;/g, "");
  fs.writeFileSync(tmp, cleaned, "utf8");
  const mod = await import(pathToFileURL(tmp).href);
  fs.unlinkSync(tmp);
  return mod[exportName];
}

export function auditEntry(entry) {
  const violations = { errors: [], warnings: [], accuracy: [] };
  if (!entry.slug || typeof entry.slug !== "string" || !entry.slug.trim()) {
    violations.errors.push("missing slug");
  }
  if (!entry.title || typeof entry.title !== "string" || !entry.title.trim()) {
    violations.errors.push("missing title");
  }
  if (!entry.category || typeof entry.category !== "string") {
    violations.errors.push("missing category");
  }
  if (!entry.description || typeof entry.description !== "string" || entry.description.length < 30) {
    violations.errors.push(`description too short (${(entry.description || "").length} chars, need ≥30)`);
  }
  if (!entry.agentRecipe || !entry.agentRecipe.trim()) violations.warnings.push("missing agentRecipe");
  if (!entry.defaultView) violations.warnings.push("missing defaultView");
  if (entry.defaultZoom === undefined || entry.defaultZoom === null) {
    violations.warnings.push("missing defaultZoom");
  }
  if (entry.previewPath === undefined) violations.warnings.push("missing previewPath (undefined)");
  if (!entry.tags || !Array.isArray(entry.tags) || entry.tags.length === 0) {
    violations.warnings.push("missing tags");
  }
  if (!entry.source || !entry.source.trim()) violations.warnings.push("missing source");
  if (entry.agentRecipe) {
    const stale = checkAgentRecipeStale(entry.agentRecipe);
    for (const s of stale) violations.accuracy.push(`agentRecipe ${s}`);
    if (!/(npx\s+rr\s+(add|init)|`rr add|rr add)/i.test(entry.agentRecipe)) {
      violations.accuracy.push("agentRecipe missing 'npx rr add' / 'npx rr init' reference");
    }
  }
  if (entry.previewPath && !previewPathExists(entry.previewPath)) {
    violations.accuracy.push(`previewPath '${entry.previewPath}' does not resolve to a page on disk`);
  }
  return violations;
}
