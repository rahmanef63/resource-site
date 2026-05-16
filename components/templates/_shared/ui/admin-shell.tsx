"use client";

import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";
import type { AdminNavItem, Brand, User } from "../types/common";

/**
 * Top-level admin shell. Wraps everything in shadcn `SidebarProvider`
 * so the sidebar + topbar trigger share state (cmd/ctrl+B toggle,
 * cookie persistence, mobile drawer). Pass nav config once at the
 * layout level.
 */
export function AdminShell({
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
