import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { StoreProvider } from "@/components/templates/konsultan/shared/store";
import { DEFAULT_SITE_CONFIG } from "@/components/templates/konsultan/shared/site-config";
import { AdminShellClient } from "./admin-shell-client";

export const metadata: Metadata = {
  title: { default: `${DEFAULT_SITE_CONFIG.brandName} admin`, template: `%s — admin` },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <StoreProvider>
        <AdminShellClient>{children}</AdminShellClient>
      </StoreProvider>
    </Suspense>
  );
}
