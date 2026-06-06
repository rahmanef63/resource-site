"use client";

import * as React from "react";
import {
  AlertTriangle,
  Check,
  CircleAlert,
  Info,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Notification, NotificationKind } from "../lib/types";
import { relativeTime } from "../lib/relativeTime";

const KIND: Record<NotificationKind, { icon: React.ElementType; tone: string }> = {
  info: { icon: Info, tone: "text-sky-600 dark:text-sky-400" },
  success: { icon: Check, tone: "text-emerald-600 dark:text-emerald-400" },
  warning: { icon: AlertTriangle, tone: "text-amber-600 dark:text-amber-400" },
  error: { icon: CircleAlert, tone: "text-destructive" },
};

export type NotificationItemProps = {
  notification: Notification;
  /** Reference time for relative formatting (ISO). Defaults to render-time. */
  now?: string;
  onMarkRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
};

export function NotificationItem({
  notification: n,
  now,
  onMarkRead,
  onDismiss,
}: NotificationItemProps) {
  const meta = KIND[n.kind];
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "group relative flex gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/50",
        !n.read && "bg-muted/30",
      )}
    >
      {!n.read && (
        <span
          aria-hidden
          className="absolute left-1.5 top-4 h-1.5 w-1.5 rounded-full bg-primary"
        />
      )}
      {n.actor ? (
        <Avatar className="mt-0.5 size-7 shrink-0">
          {n.actor.avatarUrl && (
            <AvatarImage src={n.actor.avatarUrl} alt={n.actor.name} />
          )}
          <AvatarFallback className="text-[10px]">
            {n.actor.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        <Icon className={cn("mt-0.5 size-4 shrink-0", meta.tone)} aria-hidden />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className={cn("min-w-0 flex-1 leading-snug", !n.read && "font-medium")}>
            {n.title}
          </p>
          <time className="shrink-0 text-xs text-muted-foreground">
            {relativeTime(n.createdAt, now)}
          </time>
        </div>
        {n.body && (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
        )}
      </div>

      <div className="absolute right-2 top-2 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        {!n.read && onMarkRead && (
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            title="Mark read"
            onClick={() => onMarkRead(n.id)}
          >
            <Check className="size-3.5" />
          </Button>
        )}
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            title="Dismiss"
            onClick={() => onDismiss(n.id)}
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
