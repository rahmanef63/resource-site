// MCP request handlers (tools + resources) wired to the data-loader.

import { findEntry, getManifest, getSkills, searchAll, getWorkflow, WORKFLOW_KINDS } from "./data-loader.mjs";
import { listLineageResources, readLineageResource, LINEAGE_URI_PREFIX } from "./resources/lineage.mjs";
import { TOOLS } from "./tools-definitions.mjs";
import {
  ok, text, errorResp, resourceJson, resourceMarkdown, resourceError,
  composeInit, composeAdd, composeApp, auditSlices,
} from "./response-builders.mjs";

function listTemplates({ tag } = {}) {
  const m = getManifest();
  return (m.layouts ?? [])
    .filter((l) => l.category === "website-template")
    .filter((l) => !tag || (l.tags ?? []).includes(tag))
    .map(({ slug, title, category, description, tags, previewPath, adminPreviewPath }) => ({
      slug, title, category, description, tags, previewPath, adminPreviewPath,
    }));
}

function listFeatures({ category, usedBy } = {}) {
  const m = getManifest();
  return (m.features ?? [])
    .filter((f) => !category || f.category === category)
    .filter((f) => !usedBy || (f.usedBy ?? []).includes(usedBy))
    .map(({ slug, title, category: c, description, tags, npmPackages }) => ({
      slug, title, category: c, description, tags, npmPackages,
    }));
}

function listRecipes() {
  const m = getManifest();
  return (m.recipes ?? []).map(({ slug, title, description, source, tags }) => ({ slug, title, description, source, tags }));
}

function listSlices({ category } = {}) {
  const m = getManifest();
  return (m.slices ?? [])
    .filter((s) => !category || s.category === category)
    .map(({ slug, title, category: c, version, description, peers, providers, tags }) => ({
      slug, title, category: c, version, description, peers, providers, tags,
    }));
}

function getSlice(slug) {
  const m = getManifest();
  return (m.slices ?? []).find((s) => s.slug === slug) ?? null;
}

function listSkills({ category } = {}) {
  const skills = (getSkills().skills ?? []);
  return skills
    .filter((s) => !category || s.category === category)
    .map(({ slug, title, category: c, description, source, path }) => ({ slug, title, category: c, description, source, path }));
}

function getOne(slug) {
  const found = findEntry(slug);
  if (!found) return { error: `Not found: ${slug}` };
  return found;
}

export const handleListTools = async () => ({ tools: TOOLS });

export const handleCallTool = async (req) => {
  const { name, arguments: args = {} } = req.params;
  switch (name) {
    case "rr_list_templates": return ok(listTemplates(args));
    case "rr_list_features":  return ok(listFeatures(args));
    case "rr_list_recipes":   return ok(listRecipes());
    case "rr_list_skills":    return ok(listSkills(args));
    case "rr_search":         return ok(searchAll(args.query));
    case "rr_get":            return ok(getOne(args.slug));
    case "rr_compose_init_command": return text(composeInit(args));
    case "rr_compose_add_commands": return text(composeAdd(args));
    case "rr_list_slices":          return ok(listSlices(args));
    case "rr_get_slice":            return ok(getSlice(args.slug));
    case "rr_compose_app":          return text(composeApp({ getManifest }, args));
    case "rr_audit_slice":          return ok(auditSlices({ getManifest }, args));
    case "rr_list_workflows":       return ok(WORKFLOW_KINDS.map((k) => ({ kind: k, uri: `rr://workflow/${k}` })));
    case "rr_get_workflow":         return text(getWorkflow(args.kind));
    default:
      return errorResp(`Unknown tool: ${name}`);
  }
};

export const handleListResources = async () => {
  const m = getManifest();
  const skills = getSkills().skills ?? [];
  const resources = [
    { uri: "rr://manifest", name: "Rahman Resources manifest", description: "Full kitab manifest (templates + features + recipes).", mimeType: "application/json" },
  ];
  for (const t of m.layouts ?? []) {
    resources.push({ uri: `rr://templates/${t.slug}`, name: t.title, description: t.description, mimeType: "application/json" });
  }
  for (const f of m.features ?? []) {
    resources.push({ uri: `rr://features/${f.slug}`, name: f.title, description: f.description, mimeType: "application/json" });
  }
  for (const r of m.recipes ?? []) {
    resources.push({ uri: `rr://recipes/${r.slug}`, name: r.title, description: r.description, mimeType: "application/json" });
  }
  for (const s of skills) {
    resources.push({ uri: `rr://skills/${s.slug}`, name: s.title, description: s.description, mimeType: "application/json" });
  }
  for (const sl of m.slices ?? []) {
    resources.push({ uri: `rr://slices/${sl.slug}`, name: sl.title, description: sl.description, mimeType: "application/json" });
  }
  for (const k of WORKFLOW_KINDS) {
    resources.push({
      uri: `rr://workflow/${k}`,
      name: `Workflow — ${k}`,
      description: `CRUD workflow for kitab ${k} (Create / Read / Update / Delete + publish step).`,
      mimeType: "text/markdown",
    });
  }
  try {
    const lineage = await listLineageResources();
    for (const r of lineage) resources.push(r);
  } catch (err) {
    console.error("[mcp] failed to enumerate lineage resources:", err?.message ?? err);
  }
  return { resources };
};

export const handleReadResource = async (req) => {
  const uri = req.params.uri;
  if (uri === "rr://manifest") {
    return resourceJson(uri, getManifest());
  }
  if (typeof uri === "string" && uri.startsWith(LINEAGE_URI_PREFIX)) {
    const result = await readLineageResource(uri);
    if (result.match) {
      if (result.error) return resourceError(uri, result.error);
      return resourceJson(uri, result.payload);
    }
  }
  const wf = uri.match(/^rr:\/\/workflow\/(templates|features|recipes|skills)$/);
  if (wf) {
    try {
      return resourceMarkdown(uri, getWorkflow(wf[1]));
    } catch (e) {
      return resourceError(uri, e.message);
    }
  }
  const m = uri.match(/^rr:\/\/(templates|features|recipes|skills|slices)\/(.+)$/);
  if (!m) return resourceError(uri, `Unknown resource URI: ${uri}`);
  const [, kind, slug] = m;
  if (kind === "skills") {
    const sk = (getSkills().skills ?? []).find((s) => s.slug === slug);
    if (!sk) return resourceError(uri, `Skill not found: ${slug}`);
    return resourceJson(uri, sk);
  }
  const manifestKey = kind === "templates" ? "layouts" : kind;
  const list = getManifest()[manifestKey] ?? [];
  const e = list.find((x) => x.slug === slug);
  if (!e) return resourceError(uri, `${kind} not found: ${slug}`);
  return resourceJson(uri, e);
};
