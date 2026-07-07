"use client";
/* Shared notification primitives — used by BOTH the macOS Notification Center
   (notification-center.tsx) and the Windows Action Center
   (shells/windows/action-center.tsx) so the time/tone helpers + month calendar
   live once. Each shell keeps its own card component (different chrome); only
   these identical bits are shared. MonthCalendar takes a `radius` so the two
   centers keep their original corner styling (macOS rounded-2xl / Win rounded-lg). */
import { X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { dismissNotification, type NotificationItem } from "../lib/toast";

export const TONE_DOT: Record<NotificationItem["tone"], string> = {
  default: "bg-primary",
  success: "bg-emerald-500",
  error: "bg-destructive",
};

// One logged notification card — shared by the macOS Notification Center and the
// Windows Action Center. They differ ONLY by corner radius + an optional brand
// prefix in the time header (Win11 cards are flatter, no brand) + surface
// material (macOS cards float as their own glass material since the panel has
// no chrome; Windows keeps the flat card-on-panel look), so those are props;
// the dot/message/action/hover-dismiss are identical.
export function NotifCard({
  n, radius = "rounded-2xl", actionRadius = "rounded-lg", brandPrefix, surfaceClassName,
}: {
  n: NotificationItem;
  radius?: string;
  actionRadius?: string;
  brandPrefix?: string;
  surfaceClassName?: string;
}) {
  return (
    <div className={cn("group relative p-3 pr-8", surfaceClassName ?? "border border-border bg-background/70 shadow-sm", radius)}>
      <div className="flex items-center gap-2">
        <span className={cn("size-2 shrink-0 rounded-full", TONE_DOT[n.tone])} />
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {brandPrefix ? `${brandPrefix} · ` : ""}{relTime(n.ts)}
        </span>
      </div>
      <p className="mt-1 text-[13px] leading-snug text-foreground">{n.message}</p>
      {n.action && (
        <button
          onClick={() => { n.action?.onClick(); dismissNotification(n.id); }}
          className={cn("mt-2 border border-border bg-background px-2.5 py-1 text-xs font-medium hover:bg-muted", actionRadius)}
        >
          {n.action.label}
        </button>
      )}
      <button
        aria-label="Dismiss"
        onClick={() => dismissNotification(n.id)}
        className="absolute right-2 top-2 grid size-5 place-items-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

export function relTime(ts: number): string {
  if (!ts) return "now";
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

// Lightweight current-month grid (no dep) — today highlighted with the accent.
export function MonthCalendar({ radius = "rounded-2xl", surfaceClassName }: { radius?: string; surfaceClassName?: string }) {
  const now = new Date();
  const y = now.getFullYear();
  const mo = now.getMonth();
  const today = now.getDate();
  const first = new Date(y, mo, 1).getDay();
  const days = new Date(y, mo + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: first }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];

  return (
    <div className={cn("p-3", surfaceClassName ?? "border border-border bg-background/70", radius)}>
      <div className="mb-2 px-1 text-[13px] font-semibold">
        {now.toLocaleDateString([], { month: "long", year: "numeric" })}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-[11px]">
        {DOW.map((d, i) => (
          <span key={i} className="font-medium text-muted-foreground">{d}</span>
        ))}
        {cells.map((d, i) => (
          <span
            key={i}
            className={cn(
              "mx-auto grid size-6 place-items-center rounded-full tabular-nums",
              d === today ? "bg-primary font-semibold text-primary-foreground" : "text-foreground/80",
            )}
          >
            {d ?? ""}
          </span>
        ))}
      </div>
    </div>
  );
}
