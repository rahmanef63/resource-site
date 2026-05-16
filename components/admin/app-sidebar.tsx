"use client";

import * as React from "react";
import Link from "next/link";
import {
  Box,
  FileCode,
  GaugeCircle,
  GitBranch,
  Layout,
  LayoutGrid,
  PackageSearch,
  Settings,
  Sparkles,
} from "lucide-react";

import { NavMain, type NavItem } from "@/components/admin/nav-main";
import { NavUser } from "@/components/admin/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const EDIT_NAV: NavItem[] = [
  { title: "Overview", url: "/admin", icon: Sparkles },
  { title: "Site", url: "/admin/site", icon: Settings },
  { title: "Layouts", url: "/admin/layouts", icon: Layout },
  { title: "Sources", url: "/admin/sources", icon: Box },
  { title: "Export", url: "/admin/export", icon: FileCode },
];

const INSPECT_NAV: NavItem[] = [
  { title: "Lineage", url: "/admin/lineage", icon: GitBranch },
  { title: "Quality", url: "/admin/quality", icon: GaugeCircle },
  { title: "Registry", url: "/admin/registry", icon: PackageSearch },
];

export function AppSidebar({
  email,
  onLogout,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  email: string;
  onLogout: () => void | Promise<void>;
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/admin">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <LayoutGrid className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Operator</span>
                  <span className="truncate text-xs text-muted-foreground">
                    rr control room
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain label="Edit" items={EDIT_NAV} />
        <NavMain label="Inspect" items={INSPECT_NAV} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser email={email} onLogout={onLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
