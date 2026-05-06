// Read / write / validate rr.json — the project-local Rahman Resources manifest.
//
// Schema lives at lib/rr-schema.json (JSON Schema draft-07). Validation is
// hand-rolled (shape-only) to avoid pulling in ajv as a runtime dep — the CLI
// stays small. Full schema validation is available via `npx ajv` if desired.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const RR_FILENAME = "rr.json";
const SCHEMA_URL = "https://rahmanef63.github.io/resource-site/rr.schema.json";

export const DEFAULT_RR = {
  $schema: SCHEMA_URL,
  version: 1,
  framework: "next-16",
  style: "shadcn-new-york",
  rsc: true,
  tailwind: { config: "tailwind.config.ts", css: "app/globals.css" },
  aliases: {
    components: "@/components",
    ui: "@/components/ui",
    shared: "@/components/templates/_shared",
    templates: "@/components/templates",
    slices: "@/components/templates/{template}/slices",
    features: "@/features",
    convex: "@/convex",
    lib: "@/lib",
    hooks: "@/hooks",
  },
  layout: {
    kind: "vertical-slice",
    publicRoute: "app/(public)",
    adminRoute: "app/(admin)",
    sliceRoot: "components/templates",
  },
  template: null,
  features: [],
  skills: [],
  auth: { provider: "convex-auth" },
  convex: { self_hosted: true },
};

export function rrPath(targetDir = process.cwd()) {
  return path.join(targetDir, RR_FILENAME);
}

export function rrExists(targetDir = process.cwd()) {
  return existsSync(rrPath(targetDir));
}

export function readRr(targetDir = process.cwd()) {
  const p = rrPath(targetDir);
  if (!existsSync(p)) throw new Error(`No rr.json at ${p}. Run 'rahman-resources init' first.`);
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch (err) {
    throw new Error(`Failed to parse ${p}: ${err.message}`);
  }
}

export function writeRr(rr, targetDir = process.cwd()) {
  const p = rrPath(targetDir);
  writeFileSync(p, JSON.stringify(rr, null, 2) + "\n");
  return p;
}

export function buildRr(opts = {}) {
  const rr = JSON.parse(JSON.stringify(DEFAULT_RR));
  if (opts.template) {
    rr.template = { slug: opts.template, version: opts.templateVersion ?? "main" };
  }
  if (opts.features?.length) {
    const stamp = today();
    rr.features = opts.features.map((slug) => ({ slug, version: opts.templateVersion ?? "main", addedAt: stamp }));
  }
  if (opts.skills?.length) {
    const stamp = today();
    rr.skills = opts.skills.map((s) => {
      if (typeof s === "string") return { slug: s, source: "anthropics", version: "main", addedAt: stamp };
      return { source: "anthropics", version: "main", addedAt: stamp, ...s };
    });
  }
  return rr;
}

export function addFeature(rr, slug, version = "main") {
  rr.features = rr.features ?? [];
  if (rr.features.find((f) => f.slug === slug)) return rr;
  rr.features.push({ slug, version, addedAt: today() });
  return rr;
}

export function addSkill(rr, slug, source = "anthropics", version = "main") {
  rr.skills = rr.skills ?? [];
  if (rr.skills.find((s) => s.slug === slug && s.source === source)) return rr;
  rr.skills.push({ slug, source, version, addedAt: today() });
  return rr;
}

export function removeFeature(rr, slug) {
  rr.features = (rr.features ?? []).filter((f) => f.slug !== slug);
  return rr;
}

export function removeSkill(rr, slug) {
  rr.skills = (rr.skills ?? []).filter((s) => s.slug !== slug);
  return rr;
}

// Shape-only validation — returns string[] of issues (empty = ok).
export function validateRr(rr) {
  const issues = [];
  if (!rr || typeof rr !== "object") return ["rr.json is not an object"];
  if (typeof rr.version !== "number") issues.push("version must be a number");
  if (!rr.framework) issues.push("framework is required");
  if (!rr.aliases || typeof rr.aliases !== "object") issues.push("aliases is required");
  else {
    for (const k of ["components", "ui", "shared", "templates", "lib"]) {
      if (typeof rr.aliases[k] !== "string") issues.push(`aliases.${k} must be a string`);
    }
  }
  if (!rr.layout || typeof rr.layout !== "object") issues.push("layout is required");
  else if (!["vertical-slice", "feature-folders"].includes(rr.layout.kind)) {
    issues.push(`layout.kind must be vertical-slice|feature-folders (got ${rr.layout.kind})`);
  }
  if (rr.features && !Array.isArray(rr.features)) issues.push("features must be an array");
  if (rr.skills && !Array.isArray(rr.skills)) issues.push("skills must be an array");
  return issues;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
