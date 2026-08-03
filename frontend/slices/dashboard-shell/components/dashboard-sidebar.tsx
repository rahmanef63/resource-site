"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { isActive } from "../lib/nav";
import type { Brand, NavGroup, NavItem } from "../lib/types";

/** Row renderer shared by top-level items and their sub-items. */
function Row({
  item,
  pathname,
  onNavigate,
  sub,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
  sub?: boolean;
}) {
  const Icon = item.icon;
  const active = isActive(pathname, item);
  const body = (
    <>
      {Icon ? <Icon className="size-4" /> : null}
      <span>{item.label}</span>
    </>
  );
  const onClick = item.href
    ? onNavigate
    : () => {
        item.onSelect?.();
        onNavigate?.();
      };
  const content = item.href ? <Link href={item.href}>{body}</Link> : body;

  if (sub) {
    return (
      <SidebarMenuSubButton asChild={!!item.href} isActive={active} onClick={onClick}>
        {content}
      </SidebarMenuSubButton>
    );
  }

  return (
    <SidebarMenuButton
      asChild={!!item.href}
      isActive={active}
      onClick={onClick}
      tooltip={item.label}
    >
      {content}
    </SidebarMenuButton>
  );
}

export interface DashboardSidebarProps {
  brand?: Brand;
  /** Replaces the brand block — drop a workspace switcher in here. */
  header?: ReactNode;
  nav: NavGroup[];
  footer?: ReactNode;
  pathname: string;
  collapsible?: "icon" | "offcanvas" | "none";
}

export function DashboardSidebar({
  brand,
  header,
  nav,
  footer,
  pathname,
  collapsible = "icon",
}: DashboardSidebarProps) {
  const { isMobile } = useSidebar();

  // Phones never get a sheet-shaped copy of the rail — the same nav ships as
  // the dock + <MobileMenuDrawer> thumbnail grid, so this returns nothing and
  // shadcn's mobile Sheet branch is never reached.
  if (isMobile) return null;

  return (
    <Sidebar collapsible={collapsible}>
      <SidebarHeader>
        {header ?? (brand ? <BrandBlock brand={brand} /> : null)}
      </SidebarHeader>

      <SidebarContent>
        {nav.map((group) => (
          <SidebarGroup key={group.id}>
            {group.label ? <SidebarGroupLabel>{group.label}</SidebarGroupLabel> : null}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <Row item={item} pathname={pathname} />
                    {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
                    {item.items?.length ? (
                      <SidebarMenuSub>
                        {item.items.map((child) => (
                          <SidebarMenuSubItem key={child.id}>
                            <Row item={child} pathname={pathname} sub />
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {footer ? <SidebarFooter>{footer}</SidebarFooter> : null}
      <SidebarRail />
    </Sidebar>
  );
}

function BrandBlock({ brand }: { brand: Brand }) {
  const body = (
    <>
      {brand.logo ?? (
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-[11px] font-semibold text-primary-foreground">
          {brand.name.slice(0, 1).toUpperCase()}
        </span>
      )}
      <span className="grid min-w-0 leading-tight">
        <span className="truncate font-semibold">{brand.name}</span>
        {brand.caption ? (
          <span className="truncate text-xs text-muted-foreground">{brand.caption}</span>
        ) : null}
      </span>
    </>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild={!!brand.href}>
          {brand.href ? <Link href={brand.href}>{body}</Link> : body}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
