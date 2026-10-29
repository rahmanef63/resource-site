import type { Metadata } from "next";
import { site } from "@/lib/content/site";

/** Shared social-card defaults. Root `app/layout.tsx` keeps these as the
 *  site-wide fallback; per-page metadata must override title/description/url
 *  or every share card keeps saying "Manef Resource" (routing/SEO wave,
 *  Task D). Images stay relative — `metadataBase` in the root layout
 *  resolves them to absolute URLs. */
const OG_IMAGE = {
  url: "/brand-assets/banner-dark.png",
  width: 1920,
  height: 640,
  alt: site.name,
};

export function buildPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = `${site.url}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
