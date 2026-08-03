"use client";

import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { activeTitle, deriveDock } from "../lib/nav";
import type { Brand, NavGroup, NavItem } from "../lib/types";
import { DashboardSidebar } from "./dashboard-sidebar";
import { MobileDock } from "./mobile-dock";
import { MobileMenuDrawer } from "./mobile-menu-drawer";

export interface DashboardShellProps {
  /** Sidebar nav — the SSOT for the desktop rail AND the mobile dock. */
  nav: NavGroup[];
  brand?: Brand;
  /** Override the sidebar header (workspace switcher, search, …). */
  sidebarHeader?: ReactNode;
  sidebarFooter?: ReactNode;
  /** Dock items; omit to derive from `nav`, `false` to drop the dock. */
  dock?: NavItem[] | false;
  dockMax?: number;
  /** Topbar heading. Omit → the active nav item's label. */
  title?: ReactNode;
  /** Right-hand topbar slot (search, notifications, user menu, …). */
  actions?: ReactNode;
  /** Replaces the whole topbar. `null` renders no topbar at all. */
  topbar?: ReactNode | null;
  /** Narrow contextual column between rail and content (desktop only). */
  secondary?: ReactNode;
  /** Defaults to usePathname() — pass it to drive the shell from state. */
  activePath?: string;
  collapsible?: "icon" | "offcanvas" | "none";
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

/**
 * The one dashboard shell: persistent rail + topbar on desktop, sheet sidebar
 * + bottom dock on mobile. Both faces read the SAME `nav` prop — no second
 * mobile nav to keep in sync. Breakpoint handling is shadcn's Sidebar (sheet)
 * plus a `md:hidden` dock; nothing here measures the viewport itself.
 */
export function DashboardShell({
  nav,
  brand,
  sidebarHeader,
  sidebarFooter,
  dock,
  dockMax = 4,
  title,
  actions,
  topbar,
  secondary,
  activePath,
  collapsible = "icon",
  className,
  contentClassName,
  children,
}: DashboardShellProps) {
  const routePath = usePathname() ?? "/";
  const pathname = activePath ?? routePath;
  const dockItems = dock === false ? [] : (dock ?? deriveDock(nav, dockMax));
  const heading = title ?? activeTitle(pathname, nav);
  const [menuOpen, setMenuOpen] = useState(false);
  const openMenu = () => setMenuOpen(true);

  return (
    <SidebarProvider className={cn("group/dashboard", className)}>
      <DashboardSidebar
        brand={brand}
        header={sidebarHeader}
        nav={nav}
        footer={sidebarFooter}
        pathname={pathname}
        collapsible={collapsible}
      />

      <SidebarInset className="flex min-h-svh flex-col overflow-hidden">
        {topbar === null ? null : (
          topbar ?? (
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-3 sm:px-4">
              <ShellTrigger onMenu={openMenu} />
              <Separator orientation="vertical" className="mr-1 h-4" />
              <div className="min-w-0 flex-1 truncate text-sm font-medium">{heading}</div>
              {actions ? <div className="flex items-center gap-1">{actions}</div> : null}
            </header>
          )
        )}

        <div className="flex min-h-0 flex-1">
          {secondary ? (
            <aside className="hidden w-60 shrink-0 flex-col overflow-y-auto border-r md:flex">
              {secondary}
            </aside>
          ) : null}
          <main
            className={cn(
              "@container/main min-w-0 flex-1 overflow-y-auto",
              dockItems.length ? "pb-24 md:pb-0" : undefined,
              contentClassName,
            )}
          >
            {children}
          </main>
        </div>
      </SidebarInset>

      {dockItems.length ? (
        <MobileDock items={dockItems} pathname={pathname} onMenu={openMenu} />
      ) : null}

      {/* The mobile face of the rail: thumbnail tiles, never a sheet list. */}
      <MobileMenuDrawer
        groups={nav}
        open={menuOpen}
        onOpenChange={setMenuOpen}
        pathname={pathname}
        title={brand?.name ?? "Menu"}
        description={brand?.caption}
      />
    </SidebarProvider>
  );
}

/** Topbar trigger: collapses the rail on desktop, opens the tile drawer on
 *  mobile (where no rail exists). Lives under the provider so it can read
 *  `isMobile` from shadcn's own hook — one source for the breakpoint. */
function ShellTrigger({ onMenu }: { onMenu: () => void }) {
  const { isMobile } = useSidebar();

  if (!isMobile) return <SidebarTrigger className="-ml-1" />;

  return (
    <Button variant="ghost" size="icon" className="-ml-1 size-8" onClick={onMenu} aria-label="Open menu">
      <Menu className="size-4" />
    </Button>
  );
}
