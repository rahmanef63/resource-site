import type { MetadataRoute } from "next";
import { DEFAULT_SITE_CONFIG } from "@/components/templates/konsultan/shared/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/preview/konsultan-os/public", disallow: "/preview/konsultan-os/admin" }],
    sitemap: `${DEFAULT_SITE_CONFIG.baseUrl}/sitemap.xml`,
  };
}
