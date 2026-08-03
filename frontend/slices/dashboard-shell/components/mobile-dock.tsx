"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { isActive } from "../lib/nav";
import type { NavItem } from "../lib/types";

export interface MobileDockProps {
  items: NavItem[];
  pathname: string;
  /** Hide the trailing "Menu" button that opens the sidebar sheet. */
  hideMenu?: boolean;
  className?: string;
}

/**
 * Bottom dock — the mobile face of the same nav the sidebar renders.
 * Pure CSS breakpoint (`md:hidden`): no JS media query, so no hydration flash
 * and no second source of truth for "am I mobile".
 */
export function MobileDock({ items, pathname, hideMenu, className }: MobileDockProps) {
  const { toggleSidebar } = useSidebar();
  if (!items.length && hideMenu) return null;

  return (
    <nav
      aria-label="Dashboard"
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pt-3 md:hidden",
        "pb-[calc(env(safe-area-inset-bottom)+0.75rem)]",
        className,
      )}
    >
      <div className="pointer-events-auto mx-auto flex max-w-md items-center gap-1 rounded-xl border bg-background/95 p-2 shadow-lg backdrop-blur">
        {items.map((item) => (
          <DockButton key={item.id} item={item} active={isActive(pathname, item)} />
        ))}
        {hideMenu ? null : (
          <DockButton
            item={{ id: "__menu", label: "Menu", icon: Menu, onSelect: toggleSidebar }}
            active={false}
          />
        )}
      </div>
    </nav>
  );
}

function DockButton({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  const body = (
    <>
      {Icon ? <Icon className="size-4" /> : null}
      <span className="truncate">{item.label}</span>
    </>
  );
  const className = cn(
    "flex h-auto min-w-0 flex-1 flex-col gap-1 rounded-xl px-2 py-2 text-[11px] text-muted-foreground",
    active && "bg-muted text-foreground",
  );

  if (item.href) {
    return (
      <Button asChild variant="ghost" className={className} aria-current={active ? "page" : undefined}>
        <Link href={item.href}>{body}</Link>
      </Button>
    );
  }

  return (
    <Button variant="ghost" className={className} onClick={item.onSelect}>
      {body}
    </Button>
  );
}
