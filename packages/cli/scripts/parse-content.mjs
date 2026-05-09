// Bracket-balanced extractor for `export const NAME: T[] = [ ... ];`
// Skips over strings + template literals + comments, so example code
// containing literal `export function ...` doesn't fool us.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../../..");
// Pre-restructure the kitab site lived at REPO/site/. Post-restructure (commit
// b481f11..aebb99a) it was hoisted to REPO root. Resolve to whichever exists
// so the script works in old + new checkouts.
const ROOT_SRC = path.resolve(REPO, "lib/content/layouts.ts");
export const SITE = existsSync(ROOT_SRC) ? REPO : path.resolve(REPO, "site");

function extractArrayLiteral(src, exportName) {
  const re = new RegExp(`export\\s+const\\s+${exportName}\\b[^=]*=\\s*\\[`, "m");
  const m = src.match(re);
  if (!m) throw new Error(`extractArrayLiteral: ${exportName} not found`);
  const startBracket = m.index + m[0].length - 1; // position of opening `[`
  let depth = 0;
  let i = startBracket;
  let inStr = null;            // ", ', `
  let inLineComment = false;
  let inBlockComment = false;
  let templateExprDepth = 0;   // ${...} inside backticks

  for (; i < src.length; i++) {
    const c = src[i];
    const next = src[i + 1];

    if (inLineComment) {
      if (c === "\n") inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (c === "*" && next === "/") { inBlockComment = false; i++; }
      continue;
    }
    if (inStr) {
      if (inStr === "`") {
        // Handle ${...} expression interpolation
        if (templateExprDepth === 0 && c === "\\") { i++; continue; }
        if (templateExprDepth === 0 && c === "$" && next === "{") {
          templateExprDepth = 1; i++; continue;
        }
        if (templateExprDepth > 0) {
          if (c === "{") templateExprDepth++;
          else if (c === "}") templateExprDepth--;
          continue;
        }
        if (c === "`") inStr = null;
      } else {
        if (c === "\\") { i++; continue; }
        if (c === inStr) inStr = null;
      }
      continue;
    }

    if (c === "/" && next === "/") { inLineComment = true; i++; continue; }
    if (c === "/" && next === "*") { inBlockComment = true; i++; continue; }
    if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }

    if (c === "[") depth++;
    else if (c === "]") {
      depth--;
      if (depth === 0) {
        return src.slice(startBracket, i + 1);
      }
    }
  }
  throw new Error(`extractArrayLiteral: unbalanced [ for ${exportName}`);
}

function evalArrayLiteral(literal) {
  // The literal is a JS-compatible array (object literals, strings,
  // template literals, numbers). We just wrap it and return.
  // No TS types appear inside an array literal value.
  const fn = new Function(`return (${literal});`);
  return fn();
}

function load(file, exportName) {
  const src = readFileSync(path.join(SITE, file), "utf8");
  const literal = extractArrayLiteral(src, exportName);
  return evalArrayLiteral(literal);
}

export const loadLayouts = () => load("lib/content/layouts.ts", "layouts");
export const loadRecipes = () => load("lib/content/recipes.ts", "recipes");
export const loadFeatures = () => load("lib/content/features.ts", "features");
export const loadSlices = () => {
  // slices.ts is optional (initially empty array); allow missing file.
  try {
    return load("lib/content/slices.ts", "slices");
  } catch {
    return [];
  }
};

export function parseNpmPackages(install) {
  if (!install || install.trim().startsWith("//")) return [];
  const m = install.match(/(?:npm\s+i(?:nstall)?|pnpm\s+add|yarn\s+add)\s+(.+?)(?:$|;|&&)/);
  if (!m) return [];
  return m[1]
    .split(/\s+/)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("-"));
}
