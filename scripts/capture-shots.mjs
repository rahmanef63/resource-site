#!/usr/bin/env node
// capture-shots.mjs — static catalog thumbnails (VP wave screenshot pipeline).
//
// Drives the VPS headless Chromium (os-browser service, loopback :4002) over
// the DEPLOYED site, captures each layout's previewPath, downscales to webp
// (python3/PIL) and writes public/shots/layouts/<slug>.webp plus the
// lib/preview/shots.gen.json manifest the catalog reads server-side.
//
// Operator-run (screenshots drift slowly — not a CI gate):
//   npm run shots:capture            # all layouts with a previewPath
//   npm run shots:capture -- hero    # only slugs containing "hero"
//   SHOTS_BASE=http://localhost:3000 npm run shots:capture
//
// Requires the os-browser systemd service (see ~/.claude/skills/os-browser-list).

import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.SHOTS_BASE ?? "https://resource.rahmanef.com";
const ENVF = process.env.OS_BROWSER_ENV ?? "/home/rahman/projects/os-vps/os-browser/.env";
const OUT_DIR = path.join(REPO, "public", "shots", "layouts");
const MANIFEST = path.join(REPO, "lib", "preview", "shots.gen.json");
const SETTLE_MS = Number(process.env.SHOTS_SETTLE_MS ?? 4500);
const filter = process.argv[2];

// --- os-browser client (secret from the service env file) -------------------
const envBody = readFileSync(ENVF, "utf8");
const SECRET = envBody.match(/OS_BROWSER_SECRET=([^\n]+)/)?.[1]?.trim();
const SVC = envBody.match(/OS_BROWSER_BASE=([^\n]+)/)?.[1]?.trim() ?? "http://127.0.0.1:4002";
if (!SECRET) throw new Error(`no OS_BROWSER_SECRET in ${ENVF}`);
const HDR = { "x-os-browser-secret": SECRET, "content-type": "application/json" };

async function navigate(url) {
  const r = await fetch(`${SVC}/navigate`, { method: "POST", headers: HDR, body: JSON.stringify({ url }) });
  if (!r.ok) throw new Error(`navigate ${url}: ${r.status}`);
}
async function screenshot() {
  const r = await fetch(`${SVC}/screenshot`, { headers: HDR });
  if (!r.ok) throw new Error(`screenshot: ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

// --- targets: layouts with a previewPath (regex over the TS SSOT) -----------
const src = readFileSync(path.join(REPO, "lib", "content", "layouts.ts"), "utf8");
const targets = [];
for (const block of src.split(/\n  \{\n/).slice(1)) {
  const slug = block.match(/slug: "([a-z0-9-]+)"/)?.[1];
  const previewPath = block.match(/previewPath: "([^"]+)"/)?.[1];
  if (slug && previewPath && (!filter || slug.includes(filter))) targets.push({ slug, previewPath });
}
if (targets.length === 0) throw new Error("no targets matched");
console.log(`capturing ${targets.length} layout(s) from ${BASE} (settle ${SETTLE_MS}ms)`);

mkdirSync(OUT_DIR, { recursive: true });
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { layouts: {} };
const failures = [];

for (const { slug, previewPath } of targets) {
  const tmp = `/tmp/shot-${slug}.png`;
  const out = path.join(OUT_DIR, `${slug}.webp`);
  try {
    await navigate(`${BASE}${previewPath}`);
    await new Promise((r) => setTimeout(r, SETTLE_MS));
    writeFileSync(tmp, await screenshot());
    // 1280x800 → 800x500 webp (PIL ships on the host; sharp isn't a dep).
    execSync(
      `python3 -c "from PIL import Image; Image.open('${tmp}').resize((800,500), Image.LANCZOS).save('${out}', 'WEBP', quality=82)"`,
    );
    manifest.layouts[slug] = `/shots/layouts/${slug}.webp`;
    console.log(`  ✓ ${slug}`);
  } catch (e) {
    failures.push(slug);
    console.error(`  ✗ ${slug}: ${e.message}`);
  }
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`manifest → ${path.relative(REPO, MANIFEST)} (${Object.keys(manifest.layouts).length} shot(s))`);
if (failures.length) {
  console.error(`${failures.length} failure(s): ${failures.join(", ")} — re-run with the slug as arg`);
  process.exit(1);
}
