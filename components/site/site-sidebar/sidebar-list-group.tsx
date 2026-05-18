"use client";

import * as React from "react";
import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SidebarGroupedItems } from "@/components/site/site-sidebar/sidebar-grouped-items";

type Item = { slug: string; title: string; category?: string };

export function SidebarListGroup({
  label,
  icon: Icon,
  allLabel,
  allHref,
  pathname,
  items,
  itemHrefPrefix,
  groupBy,
  categoryOrder,
  categoryLabel,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  allLabel: string;
  allHref: string;
  pathname: string;
  items: Item[];
  itemHrefPrefix: string;
  /** When set, items are bucketed and each bucket renders as a collapsible. */
  groupBy?: (item: Item) => string;
  /** Optional explicit order for category keys; unknowns appended. */
  categoryOrder?: readonly string[];
  /** Human labels for category keys; defaults to titlecased key. */
  categoryLabel?: Record<string, string>;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center gap-2">
        <Icon className="size-3.5" /> {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === allHref}>
              <Link href={allHref}>
                <span className="font-semibold">{allLabel}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {groupBy ? (
            <SidebarGroupedItems
              items={items}
              itemHrefPrefix={itemHrefPrefix}
              pathname={pathname}
              groupBy={groupBy}
              categoryOrder={categoryOrder}
              categoryLabel={categoryLabel}
            />
          ) : (
            items.map((it) => (
              <SidebarMenuItem key={it.slug}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === `${itemHrefPrefix}/${it.slug}`}
                  size="sm"
                >
                  <Link href={`${itemHrefPrefix}/${it.slug}`}>
                    <span className="truncate text-xs text-muted-foreground/80 group-data-[active=true]/menu-button:text-foreground">
                      {it.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
