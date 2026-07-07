"use client";
/* Windows 11 desktop shell — same window store + apps + feature slots as macOS,
   only the chrome differs (centered taskbar + Start instead of menu bar + dock,
   caption-button windows instead of traffic lights). Drives the SHARED store;
   it never forks window state. Sets a bottom taskbar inset so snap/maximize tile
   above the taskbar (macOS dock inset is restored on unmount). */
import { useCallback, useEffect, useRef, useState } from "react";
import { GridFour as LayoutGrid, ArrowsIn as Minimize2, ArrowsOut as Maximize2, Eye, EyeSlash as EyeOff, CornersOut as Fullscreen, Gear, Palette } from "@phosphor-icons/react";
import { useWindowOrder, useNotificationCenterOpen } from "../../../hooks/use-shell";
import { Slot } from "../../../registry/feature-registry";
import { shellStore, minimizeAll, openWindow, restoreWindow, applyChromeInsets } from "../../../lib/store";
import { isBrowserFullscreen, toggleBrowserFullscreen } from "../../../lib/browser-fullscreen";
import { Window } from "../../window";
import { WindowOverview } from "../window-overview";
import { AppSwitcher } from "../../app-switcher";
import { ContextMenu, useContextMenu, type MenuItem } from "../context-menu";
import { Taskbar, TASKBAR_H } from "./taskbar";
import { ActionCenter } from "./action-center";
import { SnapAssist } from "./snap-assist";
import { RunDialog } from "./run-dialog";
import { TaskViewDesktops } from "./task-view-desktops";
import { DesktopIcons, toggleDesktopIcons, useDesktopIconsShown } from "../../desktop-icons";
import { useMarqueeSelection, MarqueeRect, type ViewportRect } from "../../marquee-selection";
import { useOverviewKey } from "../../desktop-hotkeys";
import { shellsForSurface, useShellPrefs, setShell } from "../../../registry/shells";

function WindowsShell() {
  const order = useWindowOrder();
  const [taskView, setTaskView] = useState(false);
  const [runOpen, setRunOpen] = useState(false);
  const menu = useContextMenu();
  const prefs = useShellPrefs();
  const iconsShown = useDesktopIconsShown();
  const notificationsOpen = useNotificationCenterOpen();
  const desktopRef = useRef<HTMLElement>(null);
  const iconsMarqueeApi = useRef<((r: ViewportRect | null) => void) | null>(null);
  const onIconsMarqueeRect = useCallback((r: ViewportRect | null) => iconsMarqueeApi.current?.(r), []);
  const marquee = useMarqueeSelection(desktopRef, onIconsMarqueeRect);
  useOverviewKey(() => setTaskView(true)); // F3 opens Task View (macOS binds the same to Mission Control)
  useEffect(() => {
    applyChromeInsets({ top: 0, bottom: TASKBAR_H });
    return () => applyChromeInsets({}); // restore macOS insets + re-tile snapped windows
  }, []);
  // Win+R (⌘/Ctrl+R) opens the Run dialog. preventDefault stops the browser
  // reload; we ignore the chord while typing so it doesn't hijack app inputs.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "r")) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      e.preventDefault();
      setRunOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const ctxItems: MenuItem[] = [
    ...shellsForSurface("desktop")
      .filter((s) => s.id !== prefs.desktop)
      .map((s): MenuItem => ({ label: `View as ${s.label}`, icon: s.icon, onClick: () => setShell("desktop", s.id) })),
    { type: "sep" },
    { label: iconsShown ? "Hide desktop icons" : "Show desktop icons", icon: iconsShown ? EyeOff : Eye, onClick: () => toggleDesktopIcons() },
    { type: "sep" },
    { label: "Task View", icon: LayoutGrid, onClick: () => setTaskView(true) },
    { type: "sep" },
    { label: "Show all windows", icon: Maximize2, disabled: order.length === 0, onClick: () => order.forEach((id) => shellStore.getWindow(id)?.minimized && restoreWindow(id)) },
    { label: "Minimize all", icon: Minimize2, disabled: order.length === 0, onClick: () => minimizeAll() },
    { type: "sep" },
    { label: isBrowserFullscreen() ? "Exit Full Screen" : "Enter Full Screen", icon: Fullscreen, onClick: () => toggleBrowserFullscreen() },
    { type: "sep" },
    { label: "Settings", icon: Gear, onClick: () => openWindow("settings", "Settings") },
    { label: "Personalize", icon: Palette, onClick: () => openWindow("settings", "Personalization", undefined, { section: "appearance" }) },
  ];
  return (
    <>
      {/* Desktop + window layer. The empty-desktop right-click lives on the
          section itself (guarded to the section's own box) so clicks inside an
          app window keep their native menu — same pattern as macOS. The old
          separate handler div sat BELOW this z-10 section and never fired. */}
      <section
        ref={desktopRef}
        className="absolute inset-0 z-[10]"
        onContextMenu={(e) => { if (e.target === e.currentTarget) menu.open(e); }}
        onPointerDown={marquee.onPointerDown}
      >
        {/* Wallpaper-layer widgets live INSIDE the window section so the cards
            are clickable while still sitting behind every window (higher z). */}
        <Slot region="desktopWidgets" />
        <DesktopIcons marqueeApiRef={iconsMarqueeApi} />
        <MarqueeRect rect={marquee.rect} />
        {order.map((id) => (
          <Window key={id} id={id} variant="windows" />
        ))}
      </section>
      <Slot region="rightPanel" />
      <SnapAssist />
      {/* Alt+Tab MRU switcher — same component macOS uses for ⌘Tab. Only one shell
          mounts at a time, so there's no double keydown listener. */}
      <AppSwitcher />
      <Taskbar onTaskView={() => setTaskView((v) => !v)} onRun={() => setRunOpen(true)} />
      {notificationsOpen && <ActionCenter />}
      {taskView && <WindowOverview onClose={() => setTaskView(false)} label="Task View" footer={<TaskViewDesktops />} />}
      {runOpen && <RunDialog onClose={() => setRunOpen(false)} />}
      <ContextMenu pos={menu.pos} onClose={menu.close} items={ctxItems} />
    </>
  );
}

// Registered lazily from desktop.tsx (React.lazy over a dynamic import of
// this module) rather than self-registering here — this module pulls in
// the taskbar/action-center/snap-assist/run-dialog/window-overview tree,
// so a static side-effect import at the desktop.tsx top level shipped all
// of it in the OS bundle even to visitors who never pick this shell.
export { WindowsShell };
