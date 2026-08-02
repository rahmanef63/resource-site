// Helpers for scaffold-slice.mjs — file-tree identifier rewriting,
// SliceEntry stub injection, and CLI arg parsing.

import {
  readFileSync, readdirSync, statSync, writeFileSync, existsSync,
} from "node:fs";
import path from "node:path";

export function rewriteTree(dir, slug) {
  const fromCamel = "exampleFeature";
  const fromPascal = "ExampleFeature";
  const fromSlug = "example-feature";
  const toCamel = camelCase(slug);
  const toPascal = pascalCase(slug);

  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      rewriteTree(full, slug);
      continue;
    }
    let body = readFileSync(full, "utf8");
    const before = body;
    body = body
      .replaceAll(fromSlug, slug)
      .replaceAll(fromPascal, toPascal)
      .replaceAll(fromCamel, toCamel);
    if (body !== before) writeFileSync(full, body);
  }
}

export function appendSliceEntry({ slug, title, category, description }, slicesTsPath, failFn) {
  const src = readFileSync(slicesTsPath, "utf8");
  if (src.includes(`slug: "${slug}"`)) {
    console.log(`  · slices.ts already has "${slug}" — skipping append`);
    return;
  }

  const stub = `  {
    slug: "${slug}",
    title: ${JSON.stringify(title)},
    category: "${category}",
    version: "0.1.0",
    description: ${JSON.stringify(description)},
    source: "rahmanef63/resource-site",
    slicePath: "frontend/slices/${slug}",
    convexPaths: ["convex/features/${slug}"],
    npm: [],
    shadcn: ["button", "card"],
    env: [],
    peers: [],
    tags: ["new"],
    agentRecipe: "Run \`rr add ${slug}\`. Replace this stub recipe with concrete steps.",
  },
`;

  const closingIdx = src.lastIndexOf("];");
  if (closingIdx === -1) failFn("Could not find closing `];` in lib/content/slices.ts — append manually.");

  const next = src.slice(0, closingIdx) + stub + src.slice(closingIdx);
  writeFileSync(slicesTsPath, next);
}

export function patchSliceConfig(frontendDest, { title, category }) {
  const sliceJsonPath = path.join(frontendDest, "slice.json");
  const sliceJson = JSON.parse(readFileSync(sliceJsonPath, "utf8"));
  sliceJson.category = category;
  sliceJson.title = title;
  sliceJson.tags = ["new"];
  return { sliceJson, sliceJsonPath };
}

export function patchConfigTs(frontendDest, { title, category }) {
  const configTsPath = path.join(frontendDest, "config.ts");
  if (!existsSync(configTsPath)) return false;
  let cfg = readFileSync(configTsPath, "utf8");
  cfg = cfg
    .replace(/title:\s*"Example Feature"/, `title: ${JSON.stringify(title)}`)
    .replace(/category:\s*"[^"]*"/, `category: "${category}"`);
  writeFileSync(configTsPath, cfg);
  return true;
}

export function camelCase(s) {
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
export function pascalCase(s) {
  const c = camelCase(s);
  return c.charAt(0).toUpperCase() + c.slice(1);
}
export function toTitleCase(s) {
  return s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) { out[key] = next; i++; }
    else out[key] = true;
  }
  return out;
}
