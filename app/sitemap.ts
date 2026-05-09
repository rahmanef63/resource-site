import type { MetadataRoute } from "next";
import { site } from "@/lib/content/site";
import { layouts } from "@/lib/content/layouts";
import { recipes } from "@/lib/content/recipes";
import { slices } from "@/lib/content/slices";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticUrls = ["", "/installation", "/architecture", "/stack", "/layouts", "/recipes", "/mcp", "/agents", "/build", "/templates", "/slices", "/directory"];
  const fromStatic = staticUrls.map((p) => ({ url: `${site.url}${p}`, lastModified: now }));
  const fromLayouts = layouts.map((l) => ({
    url: `${site.url}/layouts/${l.slug}`,
    lastModified: now,
  }));
  const fromRecipes = recipes.map((r) => ({
    url: `${site.url}/recipes/${r.slug}`,
    lastModified: now,
  }));
  const fromSlices = slices.map((s) => ({
    url: `${site.url}/slices/${s.slug}`,
    lastModified: now,
  }));
  return [...fromStatic, ...fromLayouts, ...fromRecipes, ...fromSlices];
}
