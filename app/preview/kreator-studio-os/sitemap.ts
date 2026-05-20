import type { MetadataRoute } from "next";
import { DEFAULT_SITE_CONFIG, TEMPLATE_SLUG } from "@/components/templates/kreator-studio/shared/site-config";
import { buildTemplatePaths } from "@/components/templates/_shared/config/template-paths";

const PUBLIC_BASE = buildTemplatePaths(TEMPLATE_SLUG).publicBase;

export default function sitemap(): MetadataRoute.Sitemap {
  const root = DEFAULT_SITE_CONFIG.baseUrl;
  const lastModified = new Date();
  return ["", "/posts", "/about"].map((p) => ({
    url: `${root}${PUBLIC_BASE}${p}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
}
