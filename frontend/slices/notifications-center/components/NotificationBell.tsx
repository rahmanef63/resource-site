"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Notification } from "../lib/types";
import { NotificationList } from "./NotificationList";

export type NotificationBellProps = {
  notifications: Notification[];
  unreadCount?: number;
  now?: string;
  /** Render the panel as a floating popover (desktop) or a side sheet (mobile). */
  surface?: "popover" | "sheet";
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onDismiss?: (id: string) => void;
  onClear?: () => void;
  className?: string;
};

export function NotificationBell({
  notifications,
  unreadCount,
  now,
  surface = "popover",
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  onClear,
  className,
}: NotificationBellProps) {
  const unread =
    unreadCount ?? notifications.reduce((n, x) => (x.read ? n : n + 1), 0);

  const trigger = (
    <Button
      variant="ghost"
      size="icon"
      className={cn("relative", className)}
      aria-label={unread > 0 ? `Notifications (${unread} unread)` : "Notifications"}
    >
      <Bell className="size-5" />
      {unread > 0 && (
        <Badge
          variant="destructive"
          className="absolute -right-0.5 -top-0.5 size-4 min-w-4 justify-center rounded-full px-1 py-0 text-[10px] leading-none tabular-nums"
        >
          {unread > 9 ? "9+" : unread}
        </Badge>
      )}
    </Button>
  );

  const list = (
    <NotificationList
      notifications={notifications}
      unreadCount={unread}
      now={now}
      onMarkRead={onMarkRead}
      onMarkAllRead={onMarkAllRead}
      onDismiss={onDismiss}
      onClear={onClear}
    />
  );

  if (surface === "sheet") {
    return (
      <Sheet>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-sm">
          <SheetTitle className="sr-only">Notifications</SheetTitle>
          {list}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 sm:w-96">
        {list}
      </PopoverContent>
    </Popover>
  );
}
