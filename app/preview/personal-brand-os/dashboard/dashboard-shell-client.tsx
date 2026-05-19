"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/templates/_shared/ui/dashboard-shell";
import { activeSectionFromPathname } from "@/components/templates/_shared/dashboard/sections";
import { useStore } from "@/components/templates/personal-brand/shared/store";
import { DEFAULT_SITE_CONFIG } from "@/components/templates/personal-brand/shared/site-config";
import {
  ADMIN_PANEL_BASE,
  ADMIN_SETTINGS_NAV,
  DASHBOARD_SECTIONS,
  OWNER_USER,
  WORKSPACE_BASE,
  buildAdminPrimaryNav,
  buildWorkspaceNav,
} from "@/components/templates/personal-brand/shared/nav-config";

export function DashboardShellClient({ children }: { children: ReactNode }) {
  const { state } = useStore();
  const pathname = usePathname();
  const activeSection = activeSectionFromPathname(pathname);

  const activeWs = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
  const inWorkspace = activeSection === "workspace";
  const primaryNav = inWorkspace
    ? buildWorkspaceNav(state)
    : buildAdminPrimaryNav(state);
  const settingsNav = inWorkspace ? undefined : ADMIN_SETTINGS_NAV;
  const appLabel = inWorkspace
    ? `${activeWs?.icon ?? ""} ${activeWs?.name ?? "Workspace"}`.trim()
    : "Admin Panel";
  const homeHref = inWorkspace ? WORKSPACE_BASE : ADMIN_PANEL_BASE;
  const searchPlaceholder = inWorkspace
    ? "Search notes, tasks…"
    : "Search posts, leads, contacts…";

  return (
    <DashboardShell
      brand={DEFAULT_SITE_CONFIG}
      appLabel={appLabel}
      homeHref={homeHref}
      primaryNav={primaryNav}
      settingsNav={settingsNav}
      user={OWNER_USER}
      searchPlaceholder={searchPlaceholder}
      dashboardSections={DASHBOARD_SECTIONS}
      activeSectionId={activeSection}
    >
      {children}
    </DashboardShell>
  );
}
