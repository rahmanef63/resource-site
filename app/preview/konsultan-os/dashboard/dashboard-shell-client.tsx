"use client";

import type { ReactNode } from "react";
import { DashboardShell } from "@/components/templates/_shared/ui/dashboard-shell";
import { useStore } from "@/components/templates/konsultan/shared/store";
import { DEFAULT_SITE_CONFIG } from "@/components/templates/konsultan/shared/site-config";
import {
  ADMIN_PANEL_BASE,
  ADMIN_SETTINGS_NAV,
  OWNER_USER,
  buildAdminPrimaryNav,
} from "@/components/templates/konsultan/shared/nav-config";

export function DashboardShellClient({ children }: { children: ReactNode }) {
  const { state } = useStore();
  const primaryNav = buildAdminPrimaryNav(state);
  return (
    <DashboardShell
      brand={DEFAULT_SITE_CONFIG}
      appLabel="konsultan"
      homeHref={ADMIN_PANEL_BASE}
      primaryNav={primaryNav}
      settingsNav={ADMIN_SETTINGS_NAV}
      user={OWNER_USER}
      searchPlaceholder="Cari klien, proposal, invoice…"
    >
      {children}
    </DashboardShell>
  );
}
