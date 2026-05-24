import type { MetadataRoute } from "next";
import { SEED_PROJECTS } from "@/components/templates/agency-studio/shared/seed";
import { SEED_ARTICLES } from "@/components/templates/agency-studio/shared/journal-seed";
import { DEFAULT_SITE_CONFIG, TEMPLATE_SLUG } from "@/components/templates/agency-studio/shared/site-config";
import { buildTemplatePaths } from "@/components/templates/_shared/config/template-paths";

const PUBLIC_BASE = buildTemplatePaths(TEMPLATE_SLUG).publicBase;

export default function sitemap(): MetadataRoute.Sitemap {
  const root = DEFAULT_SITE_CONFIG.baseUrl;
  const lastModified = new Date();

  const staticRoutes = ["", "/services", "/portfolio", "/process", "/journal", "/team", "/about", "/contact"].map((p) => ({
    url: `${root}${PUBLIC_BASE}${p}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));

  const projectRoutes = SEED_PROJECTS.filter((p) => p.status !== "archived").map((p) => ({
    url: `${root}${PUBLIC_BASE}/portfolio/${p.slug}`,
    lastModified: new Date(p.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const articleRoutes = SEED_ARTICLES.map((a) => ({
    url: `${root}${PUBLIC_BASE}/journal/${a.slug}`,
    lastModified: new Date(a.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...projectRoutes, ...articleRoutes];
}
