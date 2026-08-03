"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DashboardShell as Shell,
  type NavGroup,
  type NavItem,
} from "@/features/dashboard-shell";
import { AdminTopbar } from "./admin-topbar";
import type {
  AdminNavGroup,
  AdminNavItem,
  Brand,
  User,
  WorkspaceContext,
} from "../types/common";

/**
 * Template admin chrome — a thin adapter over the `dashboard-shell` slice
 * (the one dashboard: desktop rail + topbar, mobile sheet + bottom dock).
 * It only maps template types (Brand / User / AdminNav*) onto the slice's
 * `nav` prop; every pixel of chrome lives in the slice.
 *
 * `workspaceSwitcher` + `secondary` cover what the old DashboardShellAdvanced
 * did — pass them for multi-workspace templates, omit for CMS ones.
 */
export function DashboardShell({
  brand,
  appLabel,
  homeHref,
  primaryNav,
  primaryNavGroups,
  settingsNav,
  user,
  searchPlaceholder,
  notifCount,
  topbarActions,
  workspaceSwitcher,
  secondary,
  children,
}: {
  brand: Brand;
  appLabel: string;
  homeHref: string;
  /** Flat legacy nav (renders as one "Workspace" group). */
  primaryNav?: AdminNavItem[];
  /** Grouped nav (Pages / Features / etc). Takes precedence when set. */
  primaryNavGroups?: AdminNavGroup[];
  settingsNav?: AdminNavItem[];
  user: User;
  searchPlaceholder?: string;
  notifCount?: number;
  topbarActions?: ReactNode;
  /** Pre-built WorkspaceSwitcher node — replaces the sidebar brand block. */
  workspaceSwitcher?: ReactNode;
  /** Narrow contextual column between rail and content (desktop only). */
  secondary?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Shell
      brand={{
        name: brand.brandName,
        caption: appLabel,
        href: homeHref,
        logo: (
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-[11px] font-semibold text-primary-foreground">
            {brand.brandLetter}
          </span>
        ),
      }}
      nav={toNav(primaryNav, primaryNavGroups, settingsNav)}
      sidebarHeader={workspaceSwitcher}
      sidebarFooter={<UserFooter user={user} />}
      secondary={secondary}
      topbar={
        <AdminTopbar
          searchPlaceholder={searchPlaceholder}
          notifCount={notifCount}
          actions={topbarActions}
        />
      }
      contentClassName="p-4 md:p-6"
    >
      {children}
    </Shell>
  );
}

/** Advanced archetype = the same shell with the switcher + secondary slots. */
export const DashboardShellAdvanced = DashboardShell;
/** @deprecated use {@link DashboardShell} — kept for AZ-wave migration */
export const AdminShell = DashboardShell;
export type { WorkspaceContext };

function toItem(item: AdminNavItem, opts?: { exact?: boolean }): NavItem {
  return {
    id: item.id,
    label: item.label,
    href: item.href,
    icon: item.icon,
    exact: opts?.exact,
    badge: item.count ? String(item.count) : undefined,
    items: item.children?.map((c) => toItem(c)),
  };
}

function toNav(
  flat?: AdminNavItem[],
  grouped?: AdminNavGroup[],
  settings?: AdminNavItem[],
): NavGroup[] {
  // homeAware: the group's first entry is a root link — exact-match it so
  // deeper routes don't light up "Overview" as well.
  const primary: NavGroup[] =
    grouped && grouped.length > 0
      ? grouped.map((g) => ({
          id: g.id,
          label: g.label,
          items: g.items.map((i, idx) => toItem(i, { exact: g.homeAware && idx === 0 })),
        }))
      : [
          {
            id: "workspace",
            label: "Workspace",
            items: (flat ?? []).map((i, idx) => toItem(i, { exact: idx === 0 })),
          },
        ];

  return settings?.length
    ? [...primary, { id: "settings", label: "Settings", items: settings.map((i) => toItem(i)) }]
    : primary;
}

function UserFooter({ user }: { user: User }) {
  return (
    <Button variant="ghost" className="h-auto w-full justify-start gap-2 px-2 py-1.5">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-semibold">
        {user.initials}
      </div>
      <div className="min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
        <p className="truncate text-xs font-medium">{user.name}</p>
        <p className="truncate text-[10px] text-muted-foreground">{user.role}</p>
      </div>
      <ChevronDown className="size-3.5 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
    </Button>
  );
}
