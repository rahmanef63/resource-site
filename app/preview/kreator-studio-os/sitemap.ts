import type { MetadataRoute } from "next";
import { DEFAULT_SITE_CONFIG } from "@/components/templates/kreator-studio/shared/site-config";

const PUBLIC_BASE = "/preview/kreator-studio-os/public";

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
