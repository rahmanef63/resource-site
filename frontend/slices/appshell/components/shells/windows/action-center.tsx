"use client";
/* Windows 11 Action Center — the native notification flyout Win11 opens when you
   click the taskbar clock. Anchored bottom-right, floating just above the h-12
   taskbar (mirrors quick-settings.tsx). Reads the SHARED notification log
   (lib/toast — same source the macOS center uses) and pins a current-month
   calendar at the bottom, matching the real Action Center. Open state lives in
   the window store (useNotificationCenterOpen) so the clock + ⌘ commands drive
   it; the macOS shell renders its own panel for the same flag. Opening marks
   everything read; closes on Escape + outside-click (Start/Quick Settings trick). */
import { useEffect } from "react";
import { BellSlash as BellOff } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useNotificationCenterOpen } from "../../../hooks/use-shell";
import { setNotificationCenterOpen } from "../../../lib/store";
import {
  useNotifications,
  clearNotifications,
  markNotificationsRead,
} from "../../../lib/toast";
import { NotifCard, MonthCalendar } from "../../notif-shared";

export function ActionCenter() {
  const open = useNotificationCenterOpen();
  const items = useNotifications();
  const close = () => setNotificationCenterOpen(false);

  // Opening = "seen": clear the unread badges. Esc closes.
  useEffect(() => {
    if (!open) return;
    markNotificationsRead();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Outside-click catcher — same trick as Start menu / Quick Settings. */}
      <div className="absolute inset-0 z-[59]" onClick={close} />
      <aside
        className={cn(
          "material-menu",
          "animate-in fade-in-0 slide-in-from-right-2 [--tw-duration:200ms]",
          "absolute bottom-14 right-2 z-[61] flex max-h-[78vh] w-[360px] max-w-[92vw] flex-col rounded-xl border border-border shadow-2xl",
        )}
      >
        <header className="flex items-center px-4 pb-2 pt-4">
          <h2 className="text-sm font-semibold">Notifications</h2>
          {items.length > 0 && (
            <button onClick={clearNotifications} className="ml-auto text-xs font-medium text-primary hover:underline">
              Clear all
            </button>
          )}
        </header>

        <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-2 [scrollbar-width:thin]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
              <BellOff className="size-7 opacity-50" />
              <p className="text-sm">No new notifications</p>
            </div>
          ) : (
            items.map((n) => <NotifCard key={n.id} n={n} radius="rounded-lg" actionRadius="rounded-md" />)
          )}
        </div>

        <div className="p-3 pt-2">
          <MonthCalendar radius="rounded-lg" />
        </div>
      </aside>
    </>
  );
}

