"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

type Item = { slug: string; title: string; category?: string };

export function SidebarGroupedItems({
  items,
  itemHrefPrefix,
  pathname,
  groupBy,
  categoryOrder,
  categoryLabel,
}: {
  items: Item[];
  itemHrefPrefix: string;
  pathname: string;
  groupBy: (item: Item) => string;
  categoryOrder?: readonly string[];
  categoryLabel?: Record<string, string>;
}) {
  const buckets = React.useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const it of items) {
      const k = groupBy(it);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(it);
    }
    return map;
  }, [items, groupBy]);

  const orderedKeys = React.useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const k of categoryOrder ?? []) {
      if (buckets.has(k)) {
        out.push(k);
        seen.add(k);
      }
    }
    for (const k of buckets.keys()) if (!seen.has(k)) out.push(k);
    return out;
  }, [buckets, categoryOrder]);

  const activeKey = React.useMemo(() => {
    for (const [k, list] of buckets) {
      if (list.some((it) => pathname === `${itemHrefPrefix}/${it.slug}`)) {
        return k;
      }
    }
    return null;
  }, [buckets, pathname, itemHrefPrefix]);

  return (
    <>
      {orderedKeys.map((k) => {
        const list = buckets.get(k)!;
        const label = categoryLabel?.[k] ?? k.charAt(0).toUpperCase() + k.slice(1);
        return (
          <Collapsible
            key={k}
            asChild
            defaultOpen={activeKey === k}
            className="group/category"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton size="sm">
                  <ChevronRight className="size-3 transition-transform group-data-[state=open]/category:rotate-90" />
                  <span className="text-xs font-medium">{label}</span>
                  <span className="ml-auto text-[10px] tabular-nums text-muted-foreground">
                    {list.length}
                  </span>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {list.map((it) => (
                    <SidebarMenuSubItem key={it.slug}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={pathname === `${itemHrefPrefix}/${it.slug}`}
                      >
                        <Link href={`${itemHrefPrefix}/${it.slug}`}>
                          <span className="truncate">{it.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        );
      })}
    </>
  );
}
