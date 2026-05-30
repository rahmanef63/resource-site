import type { MetadataRoute } from "next";
import { site } from "@/lib/content/site";
import { layouts } from "@/lib/content/layouts";
import { recipes } from "@/lib/content/recipes";
import { slices } from "@/lib/content/slices";
import { isHidden } from "@/lib/content/hidden-slugs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  const now = new Date();
  const staticUrls = ["", "/docs", "/installation", "/architecture", "/stack", "/directory", "/slices", "/layouts", "/templates", "/build", "/best-practice", "/audit-chain", "/agents", "/mcp", "/control-room", "/changelog"];
  const fromStatic = staticUrls.map((p) => ({ url: `${site.url}${p}`, lastModified: now }));
  const fromLayouts = layouts
    .filter((l) => !isHidden(l.slug))
    .map((l) => ({ url: `${site.url}/layouts/${l.slug}`, lastModified: now }));
  const fromRecipes = recipes
    .filter((r) => !isHidden(r.slug))
    .map((r) => ({ url: `${site.url}/recipes/${r.slug}`, lastModified: now }));
  const fromSlices = slices
    .filter((s) => !isHidden(s.slug))
    .map((s) => ({ url: `${site.url}/slices/${s.slug}`, lastModified: now }));
  return [...fromStatic, ...fromLayouts, ...fromRecipes, ...fromSlices];
}
