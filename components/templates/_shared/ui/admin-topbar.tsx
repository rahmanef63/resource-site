"use client";

import * as React from "react";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

/**
 * Shared admin topbar — sidebar trigger + search + notifications + actions.
 *
 * Mounted as the `topbar` slot of the dashboard-shell slice, so it carries no
 * nav of its own: the trigger opens the slice's rail (desktop) or sheet
 * (mobile), and the mobile bottom dock covers quick navigation.
 */
export function AdminTopbar({
  searchPlaceholder = "Search…",
  notifCount = 0,
  actions,
}: {
  searchPlaceholder?: string;
  notifCount?: number;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background px-4">
      <SidebarTrigger />
      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input placeholder={searchPlaceholder} className="pl-8" />
      </div>
      <div className="flex items-center gap-1.5">
        {actions}
        <Button size="icon" variant="ghost" className="relative size-9" aria-label="Notifications">
          <Bell className="size-4" />
          {notifCount > 0 && (
            <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-amber-500 text-[9px] font-medium text-background">
              {notifCount}
            </span>
          )}
        </Button>
      </div>
    </header>
  );
}
