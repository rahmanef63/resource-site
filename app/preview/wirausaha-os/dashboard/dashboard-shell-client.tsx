"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/templates/_shared/ui/dashboard-shell";
import { activeSectionFromPathname } from "@/components/templates/_shared/dashboard/sections";
import { useStore } from "@/components/templates/wirausaha/shared/store";
import { DEFAULT_SITE_CONFIG } from "@/components/templates/wirausaha/shared/site-config";
import {
  ADMIN_PANEL_BASE,
  ADMIN_SETTINGS_NAV,
  DASHBOARD_SECTIONS,
  OWNER_USER,
  buildAdminPrimaryNav,
} from "@/components/templates/wirausaha/shared/nav-config";

export function DashboardShellClient({ children }: { children: ReactNode }) {
  const { state } = useStore();
  const pathname = usePathname();
  const primaryNav = buildAdminPrimaryNav(state);
  const activeSection = activeSectionFromPathname(pathname);
  return (
    <DashboardShell
      brand={DEFAULT_SITE_CONFIG}
      appLabel="wirausaha"
      homeHref={ADMIN_PANEL_BASE}
      primaryNav={primaryNav}
      settingsNav={ADMIN_SETTINGS_NAV}
      user={OWNER_USER}
      searchPlaceholder="Cari produk, order, pelanggan…"
      dashboardSections={DASHBOARD_SECTIONS}
      activeSectionId={activeSection}
    >
      {children}
    </DashboardShell>
  );
}
