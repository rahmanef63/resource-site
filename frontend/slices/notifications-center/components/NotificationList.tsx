"use client";

import * as React from "react";
import { BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Notification } from "../lib/types";
import { NotificationItem } from "./NotificationItem";

export type NotificationListProps = {
  notifications: Notification[];
  unreadCount?: number;
  now?: string;
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onDismiss?: (id: string) => void;
  onClear?: () => void;
  /** ScrollArea max height. Default 22rem. */
  maxHeight?: string;
  className?: string;
};

export function NotificationList({
  notifications,
  unreadCount,
  now,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  onClear,
  maxHeight = "22rem",
  className,
}: NotificationListProps) {
  const [tab, setTab] = React.useState<"all" | "unread">("all");
  const unread = unreadCount ?? notifications.filter((n) => !n.read).length;
  const rows = tab === "unread" ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <p className="text-sm font-semibold">Notifications</p>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={unread === 0}
            onClick={onMarkAllRead}
          >
            Mark all read
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            disabled={notifications.length === 0}
            onClick={onClear}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="px-4 pb-2">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "unread")}>
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              Unread{unread > 0 ? ` (${unread})` : ""}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Separator />

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-sm text-muted-foreground">
          <BellOff className="size-6 opacity-60" aria-hidden />
          <p>{tab === "unread" ? "No unread notifications" : "You're all caught up"}</p>
        </div>
      ) : (
        <ScrollArea style={{ maxHeight }} className="flex-1">
          <ul className="divide-y divide-border">
            {rows.map((n) => (
              <li key={n.id}>
                <NotificationItem
                  notification={n}
                  now={now}
                  onMarkRead={onMarkRead}
                  onDismiss={onDismiss}
                />
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </div>
  );
}
