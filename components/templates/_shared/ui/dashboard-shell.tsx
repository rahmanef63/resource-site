"use client";

import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";
import type { AdminNavItem, Brand, User } from "../types/common";

/**
 * Simple-archetype dashboard shell mounted under
 * `/preview/<template>/dashboard/admin/`. Single sidebar, no workspace
 * switcher, no secondary sidebar. Used by every template whose admin
 * surface is just CMS work (Pages, Posts, …).
 *
 * Templates with multi-workspace context OR many non-CMS surfaces
 * (e.g. notion-page-clone-os) should opt into `DashboardShellAdvanced`
 * once BE-wave ships it (three-column layout + workspace switcher +
 * secondary sidebar). See docs/architecture/dashboard-vision.md.
 */
export function DashboardShell({
  brand,
  appLabel,
  homeHref,
  primaryNav,
  settingsNav,
  user,
  searchPlaceholder,
  notifCount,
  topbarActions,
  children,
}: {
  brand: Brand;
  appLabel: string;
  homeHref: string;
  primaryNav: AdminNavItem[];
  settingsNav?: AdminNavItem[];
  user: User;
  searchPlaceholder?: string;
  notifCount?: number;
  topbarActions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen>
      <AdminSidebar
        brand={brand}
        appLabel={appLabel}
        homeHref={homeHref}
        primaryNav={primaryNav}
        settingsNav={settingsNav}
        user={user}
      />
      <SidebarInset className="bg-background text-foreground">
        <AdminTopbar
          brand={brand}
          appLabel={appLabel}
          homeHref={homeHref}
          primaryNav={primaryNav}
          settingsNav={settingsNav}
          user={user}
          searchPlaceholder={searchPlaceholder}
          notifCount={notifCount}
          actions={topbarActions}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

/** @deprecated use {@link DashboardShell} — kept for AZ-wave migration */
export const AdminShell = DashboardShell;
