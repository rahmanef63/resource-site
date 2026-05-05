"use client";

import type { ReactNode } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";
import type { AdminNavItem, Brand, User } from "../types/common";

/**
 * Top-level admin shell. Composes <AdminSidebar> + <AdminTopbar> + <main>.
 * Pass nav config + user once at the layout level.
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
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <AdminSidebar
        brand={brand}
        appLabel={appLabel}
        homeHref={homeHref}
        primaryNav={primaryNav}
        settingsNav={settingsNav}
        user={user}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
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
      </div>
    </div>
  );
}
