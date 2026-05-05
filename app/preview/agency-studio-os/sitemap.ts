import type { MetadataRoute } from "next";
import { SEED_PROJECTS } from "@/components/templates/agency-studio/shared/seed";
import { DEFAULT_SITE_CONFIG } from "@/components/templates/agency-studio/shared/site-config";

const PUBLIC_BASE = "/preview/agency-studio-os/public";

export default function sitemap(): MetadataRoute.Sitemap {
  const root = DEFAULT_SITE_CONFIG.baseUrl;
  const lastModified = new Date();

  const staticRoutes = ["", "/services", "/portfolio", "/about", "/contact"].map((p) => ({
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

  return [...staticRoutes, ...projectRoutes];
}
