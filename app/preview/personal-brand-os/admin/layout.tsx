import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { StoreProvider } from "@/components/templates/personal-brand/shared/store";
import { AdminSidebar } from "@/components/templates/personal-brand/slices/admin/shell/admin-sidebar";
import { AdminTopbar } from "@/components/templates/personal-brand/slices/admin/shell/admin-topbar";
import { DEFAULT_SITE_CONFIG } from "@/components/templates/personal-brand/shared/site-config";

export const metadata: Metadata = {
  title: { default: `${DEFAULT_SITE_CONFIG.brandName} admin`, template: `%s — admin` },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <StoreProvider>
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
          <AdminSidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <AdminTopbar />
            <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
          </div>
        </div>
      </StoreProvider>
    </Suspense>
  );
}
