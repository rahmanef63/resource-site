import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { StoreProvider } from "@/components/templates/konsultan/shared/store";
import { DEFAULT_SITE_CONFIG } from "@/components/templates/konsultan/shared/site-config";
import { DashboardShellClient } from "./dashboard-shell-client";

export const metadata: Metadata = {
  title: { default: `${DEFAULT_SITE_CONFIG.brandName} dashboard`, template: `%s — dashboard` },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <StoreProvider>
        <DashboardShellClient>{children}</DashboardShellClient>
      </StoreProvider>
    </Suspense>
  );
}
