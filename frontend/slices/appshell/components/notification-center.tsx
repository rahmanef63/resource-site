"use client";
/* Notification Center — the macOS right-edge slide-out (toggled by clicking the
   menu-bar clock). Promotes transient toasts to a persistent, scrollable history
   plus a month calendar. Reads the appshell notification log (lib/toast); open
   state lives in the window store so the clock + ⌘ commands can drive it. Opening
   marks everything read (clears the menu-bar unread dot). Desktop chrome — render
   once in the desktop surface. */
import { useEffect } from "react";
import { BellSlash as BellOff } from "@phosphor-icons/react";
import { useNotificationCenterOpen } from "../hooks/use-shell";
import { setNotificationCenterOpen } from "../lib/store";
import {
  useNotifications,
  clearNotifications,
  markNotificationsRead,
} from "../lib/toast";
import { useBrand } from "../registry/brand";
import { useFeaturedWidgets, useOpenApp, WidgetView } from "../registry/widgets";
import { NotifCard, MonthCalendar } from "./notif-shared";

export function NotificationCenter() {
  const open = useNotificationCenterOpen();
  const items = useNotifications();
  const widgets = useFeaturedWidgets();
  const openApp = useOpenApp();
  const brand = useBrand();
  const close = () => setNotificationCenterOpen(false);

  // Opening = "seen": clear the unread badge. Esc closes.
  useEffect(() => {
    if (!open) return;
    markNotificationsRead();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  // Tapping a widget opens its app and closes the panel (like a notification).
  const onWidget = (id: string, payload?: unknown) => {
    openApp(id, payload);
    close();
  };

  return (
    <>
      <div className="fixed inset-0 z-[889]" onClick={close} />
      <aside className="fixed right-0 top-0 bottom-0 z-[890] flex w-[330px] flex-col gap-3 p-3 pt-[calc(var(--menubar-h)+6px)] animate-in slide-in-from-right duration-200">
        {items.length > 0 && (
          <div className="flex items-center px-1">
            <button onClick={clearNotifications} className="ml-auto text-xs font-medium text-muted-foreground hover:text-foreground hover:underline">
              Clear All
            </button>
          </div>
        )}

        {/* Notifications + widgets share one scroll column (macOS Notification
            Center); the month calendar stays pinned at the bottom. */}
        <div className="flex-1 space-y-4 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
          <div className="space-y-2">
            {items.length === 0 ? (
              <div className="mt-6 flex flex-col items-center gap-2 text-muted-foreground">
                <BellOff className="size-7 opacity-50" />
                <p className="text-sm">No Notifications</p>
              </div>
            ) : (
              items.map((n) => (
                <NotifCard
                  key={n.id}
                  n={n}
                  brandPrefix={brand.name}
                  surfaceClassName="border border-white/20 bg-[var(--glass-menu)] shadow-md backdrop-blur-xl"
                />
              ))
            )}
          </div>

          {widgets.length > 0 && (
            <section className="space-y-2">
              <h3 className="px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Widgets</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {widgets.map(({ appId, option }) => (
                  <WidgetView key={appId + ":" + option.id} option={option} size="small" openApp={onWidget} />
                ))}
              </div>
            </section>
          )}
        </div>

        <MonthCalendar surfaceClassName="border border-white/20 bg-[var(--glass-menu)] shadow-md backdrop-blur-xl" />
      </aside>
    </>
  );
}

