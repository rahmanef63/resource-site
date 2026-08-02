import { NextRequest } from "next/server";
import { layouts, getLayout } from "@/lib/content/layouts";
import { recipes, getRecipe } from "@/lib/content/recipes";
import { slices } from "@/lib/content/slices";
import {
  resources,
  getResource,
  getResourcesBySource,
  resourceCounts,
  type ResourceSource,
} from "@/lib/content/resources";
import { features, stack } from "@/lib/content/sections";
import { site } from "@/lib/content/site";

/**
 * /api/knowledge — JSON catalog consumed by AI agents, MCP, llms.txt
 * tooling. M3-BN: additive expansion to expose slices + unified
 * resources alongside the legacy layouts + recipes shape.
 *
 * Query params:
 *   ?layout=<slug>    — detail for one layout (existing)
 *   ?recipe=<slug>    — detail for one recipe (existing, recipes deprecated)
 *   ?slice=<slug>     — NEW: detail for one slice
 *   ?resource=<slug>  — NEW: detail for any resource (slice|template|layout)
 *   ?type=<source>    — NEW: filter list by source (slice|template|layout)
 *
 * Default (no query) returns the full catalog index — paginate-yourself
 * via ?type= if the payload gets too big for your agent.
 */
export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const layout = searchParams.get("layout");
  const recipe = searchParams.get("recipe");
  const slice = searchParams.get("slice");
  const resource = searchParams.get("resource");
  const type = searchParams.get("type") as ResourceSource | null;

  if (layout) {
    const l = getLayout(layout);
    if (!l) return Response.json({ error: "layout not found" }, { status: 404 });
    return Response.json({ kind: "layout", site, layout: l });
  }
  if (recipe) {
    const r = getRecipe(recipe);
    if (!r) return Response.json({ error: "recipe not found" }, { status: 404 });
    return Response.json({ kind: "recipe", site, recipe: r });
  }
  if (slice) {
    const s = slices.find((entry) => entry.slug === slice);
    if (!s) return Response.json({ error: "slice not found" }, { status: 404 });
    return Response.json({ kind: "slice", site, slice: s });
  }
  if (resource) {
    const r = getResource(resource);
    if (!r) return Response.json({ error: "resource not found" }, { status: 404 });
    return Response.json({ kind: "resource", site, resource: r });
  }

  const filteredResources = type ? getResourcesBySource(type) : resources;

  return Response.json({
    site,
    stack,
    features: features.map((f) => ({ title: f.title, description: f.description })),
    counts: resourceCounts(),
    /** Unified view — slices + templates + layouts in one list with source discriminator. */
    resources: filteredResources.map((r) => ({
      source: r.source,
      slug: r.slug,
      title: r.title,
      description: r.description,
      category: r.category,
      tags: r.tags,
      href: r.href,
      previewPath: r.previewPath,
      install: r.install,
    })),
    /** Tier-3 slices — full registry surface for MCP / agent install. */
    slices: slices.map((s) => ({
      slug: s.slug,
      title: s.title,
      category: s.category,
      kind: s.kind ?? "full",
      version: s.version,
      description: s.description,
      slicePath: s.slicePath,
      convexPaths: s.convexPaths,
      tags: s.tags ?? [],
      install: s.install ?? `npx rahman-resources add ${s.slug}`,
      previewPath: s.previewPath,
    })),
    layouts: layouts.map((l) => ({
      slug: l.slug,
      title: l.title,
      category: l.category,
      description: l.description,
      source: l.source,
      repoPath: l.repoPath,
      primaryFile: l.primaryFile,
      tags: l.tags,
    })),
    /** @deprecated — kept for back-compat with pre-M3 consumers. */
    recipes: recipes.map((r) => ({
      slug: r.slug,
      title: r.title,
      source: r.source,
      description: r.description,
      repoPath: r.repoPath,
      files: r.files,
      tags: r.tags,
    })),
    rules: [
      "NO Clerk — use @convex-dev/auth",
      "shadcn-only UI",
      "copy-first flow",
      "stack: Next 16 + React 19 + Tailwind 4 + Convex self-hosted + TS strict",
      "workspace isolation per Convex query",
      "RBAC + audit log on every mutation",
      "commit convex/_generated before deploy",
      "audit-bp score ≥80 before deploy",
    ],
  });
}
