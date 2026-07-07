"use client";
/* Interactive taskbar buttons — split out of taskbar.tsx (200-LOC gate): Start,
   pinned/task launchers, system tray + clock. Fluent metrics (P3 Windows pass):
   40x40 hit targets, 24px flat icons (icon-tile already flattens gloss/plate
   for [data-shell="windows"] — see appshell-materials.css), a 3px running/
   focused indicator pill, and a scale-down press state. */
import { useEffect, useRef, useState } from "react";
import { GridFour as LayoutGrid, ArrowUpRight, ArrowsIn as Minimize2, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useApps } from "../../../lib/registry";
import { useWindowOrder, useWindow, useFocused, useFocusedApp } from "../../../hooks/use-shell";
import { openWindow, focusWindow, minimizeWindow, restoreWindow, closeWindow, shellStore } from "../../../lib/store";
import { lock } from "../../../lib/lock";
import { AppIcon } from "../../app-icon";
import type { AppDescriptor } from "../../../lib/types";
import { ContextMenu, useContextMenu, type MenuItem } from "../context-menu";
import { TaskbarPeek } from "./taskbar-peek";

// System tray + clock now live in taskbar-tray.tsx (200-LOC gate) — re-exported
// here so taskbar.tsx's existing import path (`./taskbar-buttons`) is unchanged.
export { SystemTray, Clock } from "./taskbar-tray";

// Windows hover-intent: the peek thumbnail doesn't open on first touch — only
// after ~400ms of sustained hover, cancelled immediately on mouse-leave. Matches
// real Win11 taskbar timing instead of a zero-delay hover card.
function useHoverIntent(delay = 400) {
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return {
    active,
    onMouseEnter: () => { timer.current = setTimeout(() => setActive(true), delay); },
    onMouseLeave: () => { if (timer.current) clearTimeout(timer.current); timer.current = null; setActive(false); },
  };
}

// Pinned launcher (icon-only) + running underline + right-click jump list.
export function PinnedApp({ app, running }: { app: AppDescriptor; running: boolean }) {
  const menu = useContextMenu();
  const order = useWindowOrder();
  const focusedApp = useFocusedApp();
  const peek = useHoverIntent();
  const open = () => openWindow(app.id, app.title, app.defaultSize);
  const winIds = order.filter((id) => shellStore.getWindow(id)?.app === app.id);
  const focused = running && focusedApp === app.id;
  // ponytail: flat jump list — no Win11 "Tasks"/"Recent" grouping (overkill here).
  const items: MenuItem[] = [
    { label: "Open", icon: ArrowUpRight, onClick: open },
    ...(app.menus ?? []).flatMap((m) => m.items)
      .filter((it): it is Extract<typeof it, { label: string }> => !("sep" in it))
      .map((it): MenuItem => ({ label: it.label, disabled: it.disabled, onClick: () => it.onSelect?.() })),
    ...(running ? [{ type: "sep" } as MenuItem, { label: winIds.length > 1 ? "Close all windows" : "Close window", icon: X, onClick: () => winIds.forEach((id) => closeWindow(id)) } as MenuItem] : []),
  ];
  return (
    <div className="relative" onMouseEnter={peek.onMouseEnter} onMouseLeave={peek.onMouseLeave}>
      <button
        onClick={open}
        onContextMenu={menu.open}
        title={app.title}
        aria-label={app.title}
        className="relative grid size-10 place-items-center rounded-[4px] transition-transform hover:bg-muted active:scale-[0.88]"
      >
        <span className="size-6">
          <AppIcon app={app} />
        </span>
        <span
          className={cn(
            "absolute bottom-[1px] left-1/2 h-[3px] -translate-x-1/2 rounded-full transition-all",
            focused ? "w-4 bg-[var(--os-accent)]" : running ? "w-1.5 bg-muted-foreground/70" : "w-0",
          )}
        />
      </button>
      {peek.active && <TaskbarPeek app={app} titles={winIds.map((id) => shellStore.getWindow(id)?.title).filter(Boolean) as string[]} />}
      <ContextMenu pos={menu.pos} onClose={menu.close} items={items} />
    </div>
  );
}

export function StartButton({ open, onClick, onTaskView, onRun }: { open: boolean; onClick: () => void; onTaskView?: () => void; onRun?: () => void }) {
  const menu = useContextMenu();
  // Win11 "Win+X" / right-click-Start quick links — each reuses an action wired
  // elsewhere (Settings app, Task View, Run dialog, lock screen).
  const items: MenuItem[] = [
    { label: "Settings", onClick: () => openWindow("settings", "Settings") },
    ...(onTaskView ? [{ label: "Task View", icon: LayoutGrid, onClick: onTaskView } as MenuItem] : []),
    ...(onRun ? [{ label: "Run…", onClick: onRun } as MenuItem] : []),
    { type: "sep" },
    { label: "Lock", onClick: () => lock() },
  ];
  return (
    <>
      <button
        onClick={onClick}
        onContextMenu={menu.open}
        aria-label="Start"
        className={`grid size-9 place-items-center rounded-md hover:bg-muted ${open ? "bg-muted" : ""}`}
      >
        <span className="grid grid-cols-2 gap-[2px]">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="size-1.5 rounded-[1px] bg-[var(--os-accent)]" />
          ))}
        </span>
      </button>
      <ContextMenu pos={menu.pos} onClose={menu.close} items={items} />
    </>
  );
}

export function TaskButton({ id }: { id: string }) {
  const win = useWindow(id);
  const focused = useFocused() === id;
  const apps = useApps();
  const menu = useContextMenu();
  const peek = useHoverIntent();
  if (!win) return null;
  const app = apps.find((a) => a.id === win.app);
  const active = focused && !win.minimized;
  const onClick = () => {
    if (win.minimized) restoreWindow(id);
    else if (focused) minimizeWindow(id);
    else focusWindow(id);
  };
  const items: MenuItem[] = [
    { label: win.minimized ? "Restore" : "Focus", icon: ArrowUpRight, onClick: () => (win.minimized ? restoreWindow(id) : focusWindow(id)) },
    { label: "Minimize", icon: Minimize2, disabled: win.minimized, onClick: () => minimizeWindow(id) },
    { type: "sep" },
    { label: "Close", icon: X, onClick: () => closeWindow(id) },
  ];
  return (
    <div className="relative" onMouseEnter={peek.onMouseEnter} onMouseLeave={peek.onMouseLeave}>
      <button
        onClick={onClick}
        onContextMenu={menu.open}
        title={win.title}
        className={cn("relative flex h-9 items-center gap-2 rounded-[4px] px-2 transition-transform hover:bg-muted active:scale-[0.88]", active && "bg-muted")}
      >
        {app && (
          <span className="size-6">
            <AppIcon app={app} />
          </span>
        )}
        <span className="max-w-[120px] truncate text-xs">{win.title}</span>
        <span className={cn("absolute bottom-[1px] left-1/2 h-[3px] -translate-x-1/2 rounded-full transition-all", active ? "w-4 bg-[var(--os-accent)]" : "w-1.5 bg-muted-foreground/70 opacity-90")} />
      </button>
      {peek.active && <TaskbarPeek app={app} titles={[win.title]} />}
      <ContextMenu pos={menu.pos} onClose={menu.close} items={items} />
    </div>
  );
}

