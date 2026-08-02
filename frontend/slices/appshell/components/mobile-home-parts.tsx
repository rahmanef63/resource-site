"use client";

import { useRef, useState } from "react";
import { CornersOut as Fullscreen, Gear, Palette } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { isBrowserFullscreen, toggleBrowserFullscreen } from "../lib/browser-fullscreen";
import { openWindow } from "../lib/store";
import type { AppDescriptor } from "../lib/types";
import { AppIcon } from "./app-icon";
import { ContextMenu, useContextMenu, type MenuItem } from "./shells/context-menu";

export function Page({ children }: { children: React.ReactNode }) {
  return <section className="h-full w-full shrink-0 snap-center overflow-hidden">{children}</section>;
}

// 450ms haptic-touch long-press → quick-actions sheet, anchored to the pressed
// icon's rect (mobile-action-sheet.tsx). Shared by the app grid AND the dock.
// `held` is exposed so each consumer's onClick can swallow the click that
// fires right after a hold. Movement >12px before the sheet opens cancels (it
// was a scroll, not a hold). `onJiggle` (optional) fires if the press is
// STILL held ~450ms after the sheet itself opened — real iOS's "keep holding
// past the menu" → icon-reorder/jiggle mode.
export function useLongPress(
  onContext: (app: AppDescriptor, rect: DOMRect) => void,
  onJiggle?: () => void,
) {
  const holdTimer = useRef<number | null>(null);
  const jiggleTimer = useRef<number | null>(null);
  const held = useRef(false);
  const startHold = (app: AppDescriptor) => (e: React.PointerEvent) => {
    held.current = false;
    const sx = e.clientX, sy = e.clientY;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cancel = () => {
      if (holdTimer.current) { window.clearTimeout(holdTimer.current); holdTimer.current = null; }
      if (jiggleTimer.current) { window.clearTimeout(jiggleTimer.current); jiggleTimer.current = null; }
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    const move = (ev: PointerEvent) => {
      if (Math.abs(ev.clientX - sx) > 12 || Math.abs(ev.clientY - sy) > 12) cancel();
    };
    const up = () => cancel();
    holdTimer.current = window.setTimeout(() => {
      held.current = true;
      holdTimer.current = null;
      window.removeEventListener("pointermove", move); // sheet is up — small post-open drift shouldn't cancel it
      onContext(app, rect);
      if (onJiggle) jiggleTimer.current = window.setTimeout(onJiggle, 450);
    }, 450);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  return { startHold, held };
}

// App grid page. A clear vertical swipe (up or down, not a horizontal page
// flick) opens search; holding an icon ~450ms lifts it and opens its
// quick-actions sheet; continuing to hold past that enters a lightweight
// jiggle/edit mode (every icon wobbles) — tap any icon or empty space to
// exit. No minus-badges/reorder: apps aren't removable or reorderable in this
// OS, so a badge would have nothing to do — skipped rather than half-built.
export function AppsGrid({
  apps,
  onLaunch,
  onSearch,
  onContext,
  onEditModeEnter,
}: {
  apps: AppDescriptor[];
  onLaunch: (app: AppDescriptor, rect?: DOMRect) => void;
  onSearch: () => void;
  onContext: (app: AppDescriptor, rect: DOMRect) => void;
  /** Notifies a parent-owned quick-actions sheet to close when jiggle mode
   *  takes over (optional — the grid still enters/exits jiggle fine without it). */
  onEditModeEnter?: () => void;
}) {
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [homeEdit, setHomeEdit] = useState(false);
  const { startHold, held } = useLongPress(
    (app, rect) => { setPressedId(null); onContext(app, rect); },
    () => { setHomeEdit(true); onEditModeEnter?.(); },
  );
  const emptyMenu = useContextMenu();
  const emptyCtxItems: MenuItem[] = [
    {
      label: isBrowserFullscreen() ? "Exit Full Screen" : "Enter Full Screen",
      icon: Fullscreen,
      onClick: () => toggleBrowserFullscreen(),
    },
    { type: "sep" },
    { label: "Settings", icon: Gear, onClick: () => openWindow("settings", "Settings") },
    { label: "Personalize", icon: Palette, onClick: () => openWindow("settings", "Personalization", undefined, { section: "appearance" }) },
  ];

  const onPointerDown = (e: React.PointerEvent) => {
    if (homeEdit) return;
    const sy = e.clientY;
    const sx = e.clientX;
    let fired = false;
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", cleanup);
    };
    const move = (ev: PointerEvent) => {
      const dy = ev.clientY - sy;
      const dx = ev.clientX - sx;
      // Real iPhone: swipe UP or DOWN on the home grid opens Spotlight search.
      if (!fired && Math.abs(dy) > 70 && Math.abs(dx) < 50) {
        fired = true;
        cleanup();
        onSearch();
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", cleanup);
  };

  return (
    <>
      <div
        onPointerDown={onPointerDown}
        onClick={() => { if (homeEdit) setHomeEdit(false); }}
        onContextMenu={(e) => { if (e.target === e.currentTarget) emptyMenu.open(e); }}
        className="grid h-full grid-cols-4 content-start gap-x-2.5 gap-y-5 px-[18px] py-3.5 [touch-action:pan-x]"
      >
        {apps.map((app, i) => (
          <button
            key={app.id}
            onPointerDown={(e) => { setPressedId(app.id); startHold(app)(e); }}
            onPointerUp={() => setPressedId(null)}
            onPointerCancel={() => setPressedId(null)}
            // Desktop right-click has no "hold" duration to simulate the real
            // haptic-touch → jiggle escalation, so it jumps straight to edit
            // mode — the closest desktop-mouse equivalent of a sustained hold.
            onContextMenu={(e) => { e.preventDefault(); setPressedId(null); setHomeEdit(true); onEditModeEnter?.(); }}
            onClick={(e) => {
              e.stopPropagation(); // don't also fire the grid's exit-edit-mode handler
              if (held.current) { held.current = false; return; }
              if (homeEdit) { setHomeEdit(false); return; }
              onLaunch(app, (e.currentTarget as HTMLElement).getBoundingClientRect());
            }}
            style={{ "--i": i } as React.CSSProperties}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-transform duration-150",
              pressedId === app.id && "scale-110",
              homeEdit && "jiggle",
            )}
          >
            <span className="aspect-square w-full max-w-[62px]">
              <AppIcon app={app} />
            </span>
            <span className="max-w-full truncate text-[11px] font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
              {app.title}
            </span>
          </button>
        ))}
      </div>
      <ContextMenu pos={emptyMenu.pos} onClose={emptyMenu.close} items={emptyCtxItems} />
    </>
  );
}
