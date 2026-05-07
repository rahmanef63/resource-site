import type { MetadataRoute } from "next";
import { DEFAULT_SITE_CONFIG } from "@/components/templates/kreator-studio/shared/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/preview/kreator-studio-os/public", disallow: "/preview/kreator-studio-os/admin" }],
    sitemap: `${DEFAULT_SITE_CONFIG.baseUrl}/sitemap.xml`,
  };
}
