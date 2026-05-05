import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { SiteShell } from "@/components/templates/_shared/ui/site-shell";
import { StoreProvider } from "@/components/templates/saas-marketing/shared/store";
import { DEFAULT_SITE_CONFIG } from "@/components/templates/saas-marketing/shared/site-config";
import {
  FOOTER_COLUMNS,
  FOOTER_TAGLINE,
  PUBLIC_BASE,
  PUBLIC_CTA,
  PUBLIC_NAV,
} from "@/components/templates/saas-marketing/shared/nav-config";

const c = DEFAULT_SITE_CONFIG;

export const metadata: Metadata = {
  title: { default: `${c.productName} — ${c.tagline}`, template: `%s — ${c.productName}` },
  description: c.description,
  applicationName: c.productName,
  metadataBase: new URL(c.baseUrl),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: c.productName,
    title: `${c.productName} — ${c.tagline}`,
    description: c.description,
    url: c.baseUrl,
    locale: c.defaultLocale,
  },
  twitter: { card: "summary_large_image", site: c.twitter, creator: c.twitter },
  themeColor: c.themeColor,
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  const brand = {
    brandLetter: c.brandLetter,
    brandName: c.brandName,
    tagline: c.tagline,
    description: c.description,
    baseUrl: c.baseUrl,
    twitter: c.twitter,
    email: c.email,
    defaultLocale: c.defaultLocale,
    themeColor: c.themeColor,
  };
  return (
    <Suspense fallback={null}>
      <StoreProvider>
        <SiteShell
          brand={brand}
          homeHref={PUBLIC_BASE}
          navItems={PUBLIC_NAV}
          cta={PUBLIC_CTA}
          footerColumns={FOOTER_COLUMNS}
          footerTagline={FOOTER_TAGLINE}
          copyrightHolder={c.productName}
        >
          {children}
        </SiteShell>
      </StoreProvider>
    </Suspense>
  );
}
