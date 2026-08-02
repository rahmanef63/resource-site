"use client";
/* iOS Notification Center — the pull-down sheet (swipe down on the LEFT half of
   the status area; the right half keeps Control Center, like iPhone). Reads the
   same persistent notification log as the macOS Notification Center (lib/toast).
   Absolute (not fixed) so it stays inside the phone frame on desktop previews.
   Opening marks everything read.

   Cover-Sheet clock: date-then-time header, matching the lock screen's weight
   (critic correction — iOS 16+ default is MEDIUM, not the pre-16 thin/light
   look; see docs/OS-FIDELITY-AUDIT-2026-07-02.md). mobile-status-bar.tsx's
   useIOSClock stays local/unexported and time-only, so this owns its own
   date+time tick instead of importing it. */
import { useEffect, useState, type CSSProperties } from "react";
import { BellSlash as BellOff, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  dismissNotification,
  clearNotifications,
  markNotificationsRead,
} from "../lib/toast";
import { relTime } from "./notif-shared";

// Brighter than the desktop TONE_DOT on purpose (these sit on dark glass). The
// tone type is only default|success|error, so no warning/info keys. relTime is
// shared (was a near-identical local rel()).
const TONE_DOT: Record<string, string> = {
  success: "bg-emerald-400",
  error: "bg-red-400",
};

const SHEET_STYLE: CSSProperties = {
  background: "rgba(20,22,38,.62)",
  backdropFilter: "blur(28px) saturate(160%)",
  WebkitBackdropFilter: "blur(28px) saturate(160%)",
};

export function MobileNotifications({
  open,
  onClose,
  dragProgress,
}: {
  open: boolean;
  onClose: () => void;
  /** 0–1 pull-down progress from the parent's 1:1 drag gesture (top-edge swipe).
   *  When provided the sheet tracks the finger instead of playing the canned
   *  open animation; omit it (the default) to keep the instant tap-open/close. */
  dragProgress?: number;
}) {
  const items = useNotifications();
  const { time, date } = useCoverSheetClock(open);

  useEffect(() => {
    if (open) markNotificationsRead();
  }, [open]);

  if (!open) return null;

  const dragging = dragProgress !== undefined;
  const style: CSSProperties = dragging
    ? {
        ...SHEET_STYLE,
        transform: `translateY(${(dragProgress - 1) * 100}%)`,
        opacity: Math.max(0.35, dragProgress),
        transition: "none",
      }
    : SHEET_STYLE;

  return (
    <div
      className={cn(
        "absolute inset-0 z-[40] flex flex-col",
        !dragging && "[animation:appOpen_.22s_cubic-bezier(.2,.8,.2,1)]",
      )}
      style={style}
    >
      <header className="flex flex-col items-center pb-2 pt-9 text-center text-white">
        <span className="text-[17px] font-semibold text-white/90">{date}</span>
        <span className="text-[86px] font-medium leading-none tracking-tight tabular-nums">{time}</span>
      </header>

      <div className="flex items-center px-5 pb-2">
        {items.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            aria-label="Clear all notifications"
            onClick={clearNotifications}
            className="ml-auto flex size-8 items-center justify-center rounded-full bg-white/15 p-0 text-white backdrop-blur-xl hover:bg-white/25"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 pb-4">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-white/60">
            <BellOff className="size-7" />
            <span className="text-sm">No notifications</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((n) => (
              <div
                key={n.id}
                className="relative flex items-start gap-2.5 rounded-[18px] bg-white/12 p-3 pr-16 text-white backdrop-blur-xl"
              >
                <span className={`mt-1 size-2 shrink-0 rounded-full ${TONE_DOT[n.tone] ?? "bg-white/50"}`} />
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-[13px] font-medium">{n.message}</div>
                  {n.action && (
                    <button
                      onClick={() => {
                        n.action?.onClick();
                        dismissNotification(n.id);
                      }}
                      className="mt-1.5 rounded-lg bg-white/20 px-2.5 py-1 text-xs font-medium"
                    >
                      {n.action.label}
                    </button>
                  )}
                </div>
                <div className="absolute right-3 top-3 flex items-center gap-1.5">
                  <span className="text-[11px] text-white/60">{relTime(n.ts)}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label="Dismiss"
                    onClick={() => dismissNotification(n.id)}
                    className="h-auto w-auto rounded-full bg-white/15 p-1 text-white/80 hover:bg-white/25"
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* swipe-up affordance — tap closes (parity with the home indicator) */}
      <button aria-label="Close notifications" onClick={onClose} className="flex justify-center pb-2 pt-1">
        <span className="h-[5px] w-[134px] rounded-full bg-white/75" />
      </button>
    </div>
  );
}

// Ticks only while the sheet is open (or dragging it open, which still passes
// open=true — see mobile-shell.tsx). "H:MM" matches the status-bar clock's
// locale format; date mirrors the lock screen's weekday-day-month order.
function useCoverSheetClock(active: boolean) {
  const [parts, setParts] = useState({ time: "", date: "" });
  useEffect(() => {
    if (!active) return;
    const tick = () =>
      setParts({
        time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        date: new Date().toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" }),
      });
    tick();
    const id = setInterval(tick, 20_000);
    return () => clearInterval(id);
  }, [active]);
  return parts;
}
