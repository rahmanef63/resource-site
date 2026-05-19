"use client";

import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";
import type { AdminNavItem, Brand, User } from "../types/common";

/**
 * Top-level operator shell mounted under
 * `/preview/<template>/dashboard/{admin,workspace}/`. Wraps everything
 * in shadcn `SidebarProvider` so sidebar + topbar trigger share state.
 *
 * BA-wave will add a section switcher (Admin Panel ↔ Workspace) inside
 * this shell. For AZ-wave this is a thin rename of the old `AdminShell`.
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
