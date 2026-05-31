"use client";

import type { ReactNode } from "react";
import { DashboardShellAdvanced } from "@/components/templates/_shared/ui/dashboard-shell-advanced";
import { WorkspaceSwitcher } from "@/components/templates/_shared/ui/workspace-switcher";
import { useStore } from "@/components/templates/notion-page-clone/shared/store";
import { DEFAULT_SITE_CONFIG } from "@/components/templates/notion-page-clone/shared/site-config";
import {
  ADMIN_PANEL_BASE,
  ADMIN_SETTINGS_NAV,
  OWNER_USER,
  buildAdminNav,
} from "@/components/templates/notion-page-clone/shared/nav-config";

/**
 * notion-page-clone-os = the Advanced-archetype canary (see
 * docs/architecture/dashboard-vision.md). It mounts DashboardShellAdvanced
 * with a real multi-workspace WorkspaceSwitcher in the sidebar header,
 * proving the chassis. Per-surface SecondarySidebar adoption (database
 * views → contextual sub-nav) is the next layer.
 */
export function DashboardShellClient({ children }: { children: ReactNode }) {
  const { state, dispatch } = useStore();
  const primaryNavGroups = buildAdminNav(state);
  return (
    <DashboardShellAdvanced
      brand={DEFAULT_SITE_CONFIG}
      appLabel="Nosion OS"
      homeHref={ADMIN_PANEL_BASE}
      primaryNavGroups={primaryNavGroups}
      settingsNav={ADMIN_SETTINGS_NAV}
      user={OWNER_USER}
      searchPlaceholder="Search snippets, pages…"
      workspaceSwitcher={
        <WorkspaceSwitcher
          workspaces={state.workspaces}
          activeId={state.activeWorkspaceId}
          onSwitch={(id) => dispatch({ type: "workspace.switch", id })}
        />
      }
    >
      {children}
    </DashboardShellAdvanced>
  );
}
