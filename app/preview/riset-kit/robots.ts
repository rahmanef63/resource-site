import type { MetadataRoute } from "next";
import { DEFAULT_SITE_CONFIG } from "@/components/templates/research/shared/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/preview/riset-kit/public", disallow: "/preview/riset-kit/admin" }],
    sitemap: `${DEFAULT_SITE_CONFIG.baseUrl}/sitemap.xml`,
  };
}
