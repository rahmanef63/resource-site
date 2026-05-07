import type { MetadataRoute } from "next";
import { DEFAULT_SITE_CONFIG } from "@/components/templates/research/shared/site-config";

const PUBLIC_BASE = "/preview/riset-kit/public";

export default function sitemap(): MetadataRoute.Sitemap {
  const root = DEFAULT_SITE_CONFIG.baseUrl;
  const lastModified = new Date();
  return ["", "/library", "/about"].map((p) => ({
    url: `${root}${PUBLIC_BASE}${p}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
}
