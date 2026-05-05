import { NextRequest } from "next/server";
import { layouts, getLayout } from "@/lib/content/layouts";
import { recipes, getRecipe } from "@/lib/content/recipes";
import { features, stack } from "@/lib/content/sections";
import { site } from "@/lib/content/site";

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const layout = searchParams.get("layout");
  const recipe = searchParams.get("recipe");

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

  return Response.json({
    site,
    stack,
    features: features.map((f) => ({ title: f.title, description: f.description })),
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
