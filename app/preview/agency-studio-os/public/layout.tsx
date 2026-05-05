import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { StoreProvider } from "@/components/templates/agency-studio/shared/store";
import { SiteNav } from "@/components/templates/agency-studio/shared/ui/site-nav";
import { SiteFooter } from "@/components/templates/agency-studio/shared/ui/site-footer";
import { DEFAULT_SITE_CONFIG } from "@/components/templates/agency-studio/shared/site-config";

const c = DEFAULT_SITE_CONFIG;

export const metadata: Metadata = {
  title: { default: `${c.brandName} — ${c.tagline}`, template: `%s — ${c.brandName}` },
  description: c.description,
  applicationName: c.brandName,
  metadataBase: new URL(c.baseUrl),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: c.brandName,
    title: `${c.brandName} — ${c.tagline}`,
    description: c.description,
    url: c.baseUrl,
    locale: c.defaultLocale,
  },
  twitter: { card: "summary_large_image", site: c.twitter, creator: c.twitter },
  themeColor: c.themeColor,
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <StoreProvider>
        <div className="min-h-screen bg-background text-foreground">
          <SiteNav />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </StoreProvider>
    </Suspense>
  );
}
