// Helpers for gen-slice-agent-md.mjs — read the agentic surface (tool names +
// the collection's custom instruction) straight from slice source. Split into
// this neighbour module so the generator stays under the 200-line cap.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

// The agentic surface (`provides.tools`) from the slice contract — the single
// source of truth (validateTools gates the names). A light regex suffices
// because the DSL keeps tools as a flat array of string literals.
export function contractTools(sliceDir) {
  const p = path.join(sliceDir, "slice.contract.ts");
  if (!existsSync(p)) return [];
  const m = readFileSync(p, "utf8").match(/\btools:\s*\[([^\]]*)\]/s);
  if (!m) return [];
  return [...m[1].matchAll(/["']([^"']+)["']/g)].map((x) => x[1]);
}

// The file that calls defineToolCollection AND declares instructions.
function findCollectionSrc(dir, depth = 0) {
  if (depth > 3) return null;
  let ents;
  try {
    ents = readdirSync(dir, { withFileTypes: true });
  } catch {
    return null;
  }
  for (const e of ents) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const fp = path.join(dir, e.name);
    if (e.isDirectory()) {
      const found = findCollectionSrc(fp, depth + 1);
      if (found) return found;
    } else if (e.name.endsWith(".ts") && !e.name.endsWith(".test.ts")) {
      const src = readFileSync(fp, "utf8");
      if (src.includes("defineToolCollection") && /\binstructions:/.test(src)) return src;
    }
  }
  return null;
}

// The collection-level `instructions` (the slice's slice of the agent's custom
// instruction — see lib/shared/agentic/prompt.ts). Handles one or more "..."
// literals joined by `+`.
export function collectionInstructions(sliceDir) {
  const src = findCollectionSrc(sliceDir);
  if (!src) return "";
  const m = src.match(/\binstructions:\s*((?:"(?:[^"\\]|\\.)*"\s*\+?\s*)+)/);
  if (!m) return "";
  return [...m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)]
    .map((x) => x[1].replace(/\\"/g, '"'))
    .join("");
}

// Unprefixed names of tools flagged `dangerous: true`. The flag is always
// written directly under the `name:` line (wave-3e convention), so the
// adjacency regex is reliable. Scans every non-test .ts file in the slice.
export function dangerousToolNames(sliceDir, depth = 0) {
  const out = new Set();
  if (depth > 3) return out;
  let ents;
  try {
    ents = readdirSync(sliceDir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of ents) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const fp = path.join(sliceDir, e.name);
    if (e.isDirectory()) {
      for (const n of dangerousToolNames(fp, depth + 1)) out.add(n);
    } else if (e.name.endsWith(".ts") && !e.name.endsWith(".test.ts")) {
      const src = readFileSync(fp, "utf8");
      for (const m of src.matchAll(/name:\s*"([^"]+)",\s*\n\s*dangerous:\s*true/g)) {
        out.add(m[1]);
      }
    }
  }
  return out;
}
