"use client";
/* Windows 11 taskbar — centered Start + search + per-window buttons, system tray
   (→ Quick Settings) + clock. Buttons drive the shared store, mirroring Win11.
   Start/pinned/task buttons + tray + clock live in taskbar-buttons.tsx (split
   for the 200-LOC gate) — this file only owns the bar shell + layout. */
import { useState } from "react";
import { MagnifyingGlass as Search, GridFour as LayoutGrid } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useApps } from "../../../lib/registry";
import { useWindowOrder, useNotificationCenterOpen } from "../../../hooks/use-shell";
import { openWindow, setNotificationCenterOpen, setSpotlightOpen, shellStore } from "../../../lib/store";
import { ContextMenu, useContextMenu, type MenuItem } from "../context-menu";
import { StartMenu } from "./start-menu";
import { QuickSettings } from "./quick-settings";
import { StartButton, PinnedApp, TaskButton, SystemTray, Clock } from "./taskbar-buttons";

export const TASKBAR_H = 48;

export function Taskbar({ onTaskView, onRun }: { onTaskView?: () => void; onRun?: () => void }) {
  const [startOpen, setStartOpen] = useState(false);
  const [qsOpen, setQsOpen] = useState(false);
  const ncOpen = useNotificationCenterOpen();
  const order = useWindowOrder();
  const apps = useApps();
  const tbMenu = useContextMenu();
  // Empty-taskbar right-click (Win11: Task Manager + Taskbar settings). Task View
  // is the honest stand-in for Task Manager — no system-monitor app exists.
  const tbItems: MenuItem[] = [
    ...(onTaskView ? [{ label: "Task View", icon: LayoutGrid, onClick: onTaskView } as MenuItem] : []),
    { label: "Taskbar settings", onClick: () => openWindow("settings", "Settings") },
  ];
  // Action Center (clock flyout) — mutually exclusive with Start + Quick Settings.
  const toggleNotifications = () => { setStartOpen(false); setQsOpen(false); setNotificationCenterOpen(!ncOpen); };
  // Pinned apps — always shown; a running app surfaces via its underline.
  const pinned = apps.filter((a) => !a.noDock).slice(0, 7);
  const pinnedIds = new Set(pinned.map((a) => a.id));
  const openApps = new Set(order.map((id) => shellStore.getWindow(id)?.app).filter(Boolean) as string[]);
  return (
    <>
      {startOpen && <StartMenu onClose={() => setStartOpen(false)} />}
      {qsOpen && <QuickSettings onClose={() => setQsOpen(false)} />}
      <div
        // Not `.material-bar` (backdrop-filter): real Mica is a static tint,
        // not a live blur — and backdrop-filter creates a new compositing
        // context in Chromium that clips descendant flyouts (TaskbarPeek,
        // rendered per pinned/task button INSIDE this bar) to its own 48px
        // box. Plain --glass-bar background avoids the clip and matches Mica.
        style={{ background: "var(--glass-bar)" }}
        className={cn("absolute inset-x-0 bottom-0 z-[60] flex h-12 items-center border-t border-border px-2")}
        onContextMenu={(e) => { if (e.target === e.currentTarget) tbMenu.open(e); }}
      >
        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1">
          <StartButton
            open={startOpen}
            onClick={() => { setQsOpen(false); setNotificationCenterOpen(false); setStartOpen((o) => !o); }}
            onTaskView={onTaskView}
            onRun={onRun}
          />
          <button
            onClick={() => { setStartOpen(false); setNotificationCenterOpen(false); setSpotlightOpen(true); }}
            className="flex h-9 items-center gap-2 rounded-md border border-border bg-background/60 px-3 text-xs text-muted-foreground hover:bg-muted"
          >
            <Search className="size-4" /> Search
          </button>
          {onTaskView && (
            <button
              onClick={onTaskView}
              title="Task View"
              aria-label="Task View"
              className="grid size-9 place-items-center rounded-md hover:bg-muted"
            >
              <LayoutGrid className="size-5" />
            </button>
          )}
          <span className="mx-0.5 h-6 w-px bg-border/70" />
          {pinned.map((a) => <PinnedApp key={a.id} app={a} running={openApps.has(a.id)} />)}
          {/* Running windows whose app isn't pinned get a labelled button. */}
          {order.filter((id) => { const ap = shellStore.getWindow(id)?.app; return !!ap && !pinnedIds.has(ap); }).map((id) => <TaskButton key={id} id={id} />)}
        </div>
        <div className="ml-auto flex items-center gap-0.5">
          <SystemTray open={qsOpen} onClick={() => { setStartOpen(false); setNotificationCenterOpen(false); setQsOpen((o) => !o); }} />
          <Clock open={ncOpen} onClick={toggleNotifications} />
        </div>
      </div>
      <ContextMenu pos={tbMenu.pos} onClose={tbMenu.close} items={tbItems} />
    </>
  );
}
