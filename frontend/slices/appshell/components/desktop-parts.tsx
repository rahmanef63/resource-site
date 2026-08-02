"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { GridNine as Grid3x3, ArrowsIn as Minimize2, ArrowsOut as Maximize2, Eye, EyeSlash as EyeOff, CornersOut as Fullscreen, Gear, Palette } from "@phosphor-icons/react";
import { useWindowOrder } from "../hooks/use-shell";
import { useActiveSpace, useSpaceSlideDirection, SPACE_IDS } from "../lib/spaces";
import { MenuBar } from "./menu-bar";
import { Dock } from "./dock";
import { AppLauncher } from "./app-launcher";
import { Window } from "./window";
import { Slot } from "../registry/feature-registry";
import { minimizeAll, openWindow, restoreWindow, shellStore } from "../lib/store";
import { WindowOverview } from "./shells/window-overview";
import { NotificationCenter } from "./notification-center";
import { AppSwitcher } from "./app-switcher";
import { ContextMenu, useContextMenu, type MenuItem } from "./shells/context-menu";
import { useOverviewKey } from "./desktop-hotkeys";
import { DesktopIcons, toggleDesktopIcons, useDesktopIconsShown } from "./desktop-icons";
import { shellsForSurface, useShellPrefs, setShell } from "../registry/shells";
import { HotCorners } from "./hot-corners";
import { useMarqueeSelection, MarqueeRect, type ViewportRect } from "./marquee-selection";
import { isBrowserFullscreen, toggleBrowserFullscreen } from "../lib/browser-fullscreen";

export function DesktopChrome() {
  const order = useWindowOrder();
  const activeSpace = useActiveSpace();
  // The windows layer below is keyed by (and slides on changes to) the space
  // below — correct for a real user-facing Space switch (1-4), but Full
  // Screen also reuses `activeSpace` for its own synthetic per-window space
  // (use-full-screen.ts, space numbers >= 1000). Reacting to that here would
  // remount every Window mid-excursion, firing its exit-fullscreen-on-unmount
  // safety net and instantly reverting it. Freeze at the last REAL space
  // while a synthetic space is active — Full Screen has its own FLIP-glide
  // motion already, no desktop-slide is wanted for it anyway.
  const [realSpace, setRealSpace] = useState(activeSpace);
  if (SPACE_IDS.includes(activeSpace) && activeSpace !== realSpace) setRealSpace(activeSpace);
  const slideDir = useSpaceSlideDirection(realSpace);
  const [overview, setOverview] = useState(false);
  const menu = useContextMenu();
  useOverviewKey(() => setOverview(true));
  const prefs = useShellPrefs();
  const iconsShown = useDesktopIconsShown();
  const desktopRef = useRef<HTMLElement>(null);
  const iconsMarqueeApi = useRef<((r: ViewportRect | null) => void) | null>(null);
  const onIconsMarqueeRect = useCallback((r: ViewportRect | null) => iconsMarqueeApi.current?.(r), []);
  const marquee = useMarqueeSelection(desktopRef, onIconsMarqueeRect);
  const ctxItems: MenuItem[] = [
    // Change OS view — switch to another desktop shell (macOS / Windows / Dashboard).
    ...shellsForSurface("desktop")
      .filter((s) => s.id !== prefs.desktop)
      .map((s): MenuItem => ({ label: `View as ${s.label}`, icon: s.icon, onClick: () => setShell("desktop", s.id) })),
    { type: "sep" },
    { label: iconsShown ? "Hide desktop icons" : "Show desktop icons", icon: iconsShown ? EyeOff : Eye, onClick: () => toggleDesktopIcons() },
    { type: "sep" },
    { label: "Mission Control", icon: Grid3x3, onClick: () => setOverview(true) },
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
      <MenuBar />
      <section
        ref={desktopRef}
        className="absolute inset-x-0 bottom-0 top-[var(--menubar-h)] z-[10]"
        // Only the empty desktop opens the menu — clicks inside an app window
        // (which sit in child layers) keep their native right-click.
        onContextMenu={(e) => { if (e.target === e.currentTarget) menu.open(e); }}
        // Rubber-band marquee — same "empty desktop only" guard as the context
        // menu above (marquee-selection.tsx checks target === currentTarget).
        onPointerDown={marquee.onPointerDown}
      >
        {/* Wallpaper-layer widgets live INSIDE the desktop section so the cards
            are clickable (a child beats the section's empty-area click target)
            while still sitting BEHIND every window (windows carry higher z). */}
        <Slot region="desktopWidgets" />
        <DesktopIcons marqueeApiRef={iconsMarqueeApi} />
        <MarqueeRect rect={marquee.rect} />
        {/* Keyed by the active Space: a switch remounts this layer, replaying
            the directional slide (real macOS slides the whole desktop).
            `absolute inset-0` (not a plain block) — Windows inside are
            themselves `position: absolute` with x/y meant for `section`; a
            plain div here would collapse to 0 height (no in-flow content) and,
            while `transform` is mid-animation, become their containing block
            instead, shifting every window's origin. inset-0 keeps this layer's
            box pixel-identical to `section`'s, so nothing shifts. */}
        {/* pointer-events-none: without it, this layer's `inset-0` box
            silently sat in front of `section` at EVERY point (even where no
            window exists), permanently defeating the `e.target ===
            e.currentTarget` empty-desktop guard the context menu and the
            marquee selection both rely on. CAUTION: pointer-events INHERITS
            (unlike most CSS properties) — Window re-asserts pointer-events-
            auto on its own root (window.tsx) to opt itself + everything
            nested inside it back in, or the whole window subtree (drag,
            resize, every button) silently goes dead. See 0be0e85. */}
        <div
          key={realSpace}
          className={cn("pointer-events-none absolute inset-0", slideDir === "right" && "space-slide-right", slideDir === "left" && "space-slide-left")}
        >
          {order.map((id) => (
            <Window key={id} id={id} />
          ))}
        </div>
      </section>
      <Slot region="rightPanel" />
      <NotificationCenter />
      <AppSwitcher />
      <AppLauncher />
      <Dock onMissionControl={() => setOverview(true)} />
      <HotCorners onMissionControl={() => setOverview(true)} />
      {overview && <WindowOverview onClose={() => setOverview(false)} label="Mission Control" />}
      <ContextMenu pos={menu.pos} onClose={menu.close} items={ctxItems} />
    </>
  );
}
