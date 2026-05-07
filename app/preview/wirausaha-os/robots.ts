import type { MetadataRoute } from "next";
import { DEFAULT_SITE_CONFIG } from "@/components/templates/wirausaha/shared/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/preview/wirausaha-os/public", disallow: "/preview/wirausaha-os/admin" }],
    sitemap: `${DEFAULT_SITE_CONFIG.baseUrl}/sitemap.xml`,
  };
}
