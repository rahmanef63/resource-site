import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { StoreProvider } from "@/components/templates/notion-page-clone/shared/store";
import { DEFAULT_SITE_CONFIG } from "@/components/templates/notion-page-clone/shared/site-config";

const c = DEFAULT_SITE_CONFIG;

export const metadata: Metadata = {
  title: { default: `${c.productName} — ${c.tagline}`, template: `%s — ${c.productName}` },
  description: c.description,
  applicationName: c.productName,
};

/** Notion-clone public layout — BZ-wave (2026-05-21).
 *  Previously wrapped in SiteShell (marketing header + footer). User
 *  request: "tidak perlu ada header dan footer ... langsung saja
 *  workspacenya" — strip the chrome, render Dashboard full-bleed so
 *  the template behaves like the real Notion app, not a marketing
 *  site about one. */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <StoreProvider>{children}</StoreProvider>
    </Suspense>
  );
}
