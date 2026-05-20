"use client";

import type { ReactNode } from "react";
import { DashboardShell } from "@/components/templates/_shared/ui/dashboard-shell";
import { useStore } from "@/components/templates/notion-page-clone/shared/store";
import { DEFAULT_SITE_CONFIG } from "@/components/templates/notion-page-clone/shared/site-config";
import {
  ADMIN_PANEL_BASE,
  ADMIN_SETTINGS_NAV,
  OWNER_USER,
  buildAdminNav,
} from "@/components/templates/notion-page-clone/shared/nav-config";

export function DashboardShellClient({ children }: { children: ReactNode }) {
  const { state } = useStore();
  const primaryNavGroups = buildAdminNav(state);
  return (
    <DashboardShell
      brand={DEFAULT_SITE_CONFIG}
      appLabel="Nosion OS"
      homeHref={ADMIN_PANEL_BASE}
      primaryNavGroups={primaryNavGroups}
      settingsNav={ADMIN_SETTINGS_NAV}
      user={OWNER_USER}
      searchPlaceholder="Search snippets, pages…"
    >
      {children}
    </DashboardShell>
  );
}
