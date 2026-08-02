"use client";

import { memo, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useWindow, useFocused } from "../hooks/use-shell";
import { useWindowDrag } from "../hooks/use-window-drag";
import { useWindowExit, useWindowFlip } from "../hooks/use-window-exit";
import { isFullScreen, useIsFullScreen, toggleFullScreen, exitFullScreen } from "../hooks/use-full-screen";
import { useFullScreenReveal } from "../hooks/use-full-screen-reveal";
import { closeWindow, minimizeWindow, toggleMaximize, focusWindow, snapRect } from "../lib/store";
import { deliverDrop, dragCarriesPayload, readDragData } from "../lib/dnd";
import { spaceOf, useActiveSpace } from "../lib/spaces";
import { useGroupTop } from "../lib/window-tabs";
import { togglePin } from "../lib/window-commands";
import { useApp } from "../lib/registry";
import { useContextMenu, ContextMenu, type MenuItem } from "./shells/context-menu";
import { AppIcon } from "./app-icon";
import { TrafficLights } from "./traffic-lights";
import { WinCaption } from "./window-caption";
import { TabStrip } from "./window-tabs";
import { WindowContent } from "./window-content";
import type { WinId } from "../lib/types";

// Subscribes to ONE window — a drag on another window never re-renders this.
// `variant` picks the title-bar chrome (macOS traffic-lights vs Windows caption
// buttons). Exit animations + snap/maximize glides live in use-window-exit;
// macOS Full Screen (green button, own Space + auto-hide menu bar/dock) lives
// in use-full-screen[-reveal].
export const Window = memo(function Window({ id, variant = "macos" }: { id: WinId; variant?: "macos" | "windows" }) {
  const win = useWindow(id);
  const focused = useFocused() === id;
  const activeSpace = useActiveSpace();
  const groupTopId = useGroupTop(win?.groupId);
  const app = useApp(win?.app ?? "");
  const ref = useRef<HTMLDivElement>(null);
  const { startDrag, startResize, zone } = useWindowDrag(id, ref);
  const ctx = useContextMenu();
  const isWin = variant === "windows";
  const fullScreen = useIsFullScreen(id);
  const reveal = useFullScreenReveal(!isWin && fullScreen);
  // Dock aria-label match, not the (possibly retitled) window title — see
  // use-window-exit.ts for the exact selector contract.
  useWindowExit(id, ref, app?.title ?? win?.title);
  useWindowFlip(ref, win?.x, win?.y, win?.w, win?.h);
  // Safety net: unmounting mid-Full-Screen (e.g. a shell switch) must not
  // strand the dedicated Space with no window and no way back to it.
  useEffect(() => () => { if (isFullScreen(id)) exitFullScreen(id); }, [id]);

  if (!win || win.minimized) return null;
  if (spaceOf(win) !== activeSpace) return null; // lives on another Space
  if (win.groupId && groupTopId !== id) return null; // a tab behind the group's active frame
  const preview = zone ? snapRect(zone) : null;

  // Any close/minimize path releases a Full Screen excursion first — closing
  // or hiding a fullscreen window would otherwise strand its dedicated Space
  // empty with no way back to it (use-full-screen.ts).
  const handleClose = () => { if (fullScreen) exitFullScreen(id); closeWindow(id); };
  const handleMinimize = () => { if (fullScreen) exitFullScreen(id); minimizeWindow(id); };
  // Plain click = real Full Screen; Option-click falls back to the old plain
  // maximize/zoom — matches real macOS's green-button modifier.
  const handleGreen = (e: React.MouseEvent) => (e.altKey ? toggleMaximize(id) : toggleFullScreen(id));

  const titleMenu: MenuItem[] = [
    { label: win.maximized ? "Restore" : "Maximize", onClick: () => toggleMaximize(id) },
    { label: "Minimize", onClick: handleMinimize },
    { label: win.pinned ? "Unpin from Top" : "Keep on Top", onClick: () => togglePin(id) },
    { type: "sep" },
    { label: "Close", onClick: handleClose },
  ];

  return (
    <>
      {preview && (
        // absolute (not fixed): shares the desktop surface's coordinate space.
        // Frosted pane, not an accent fill — matches Win11 Snap / macOS tiling.
        <div
          className="absolute z-[5] rounded-[var(--radius-win)] border border-white/40 bg-white/20 backdrop-blur-sm dark:border-white/20 dark:bg-white/10"
          style={{ left: preview.x, top: preview.y, width: preview.w, height: preview.h }}
        />
      )}
      <div
        ref={ref}
        className={cn(
          // pointer-events INHERITS (unlike most CSS properties) — the P1
          // space-slide wrapper this mounts inside (desktop-parts.tsx) is
          // pointer-events-none so empty desktop area click-through works;
          // re-assert auto here or the whole window (drag/resize/every
          // button) inherits none and goes dead.
          "window-open pointer-events-auto absolute flex flex-col overflow-hidden",
          // isWin: reads the same --radius-win token the other branch does —
          // the Windows chrome kit resolves it to 8px (chrome-kit-data.ts).
          isWin ? "rounded-[var(--radius-win)] border border-border" : fullScreen ? "rounded-none" : "rounded-[var(--radius-win)]",
          // key window carries the big soft shadow; inactive drops to a tight
          // one; a fullscreen macOS window is edge-to-edge — no shadow at all.
          !isWin && fullScreen
            ? "shadow-none"
            : focused
              ? "shadow-[var(--shadow-win-active,var(--shadow-win))]"
              : "shadow-[var(--shadow-win-inactive,var(--shadow-win))]",
          // pinned (always-on-top) windows beat even the focused regular window
          win.pinned ? (focused ? "z-[70]" : "z-[60]") : focused ? "z-50" : "z-10",
        )}
        // frame reads the shell's translucent material token (vibrancy seam);
        // the content wrapper below stays opaque bg-background for legibility.
        style={{ left: win.x, top: win.y, width: win.w, height: win.h, background: "var(--window-bg, var(--card))" }}
        onMouseDown={() => focusWindow(id)}
      >
        {isWin ? (
          // Win11 titlebar: 32px (real metric, was 34), shares the Mica tint
          // with the taskbar (--glass-bar, wired to the windows kit's
          // --mica-win), a 16px app icon before the title, and dims title +
          // caption glyphs together on the existing `focused`. Deliberately
          // NOT `.material-bar` (which adds backdrop-filter): real Mica is a
          // static wallpaper-tinted sample, not a live blur — and a
          // backdrop-filter ancestor creates a new compositing/stacking
          // context in Chromium that clips the Snap Layouts flyout (a
          // descendant of this titlebar) to the titlebar's own 32px box.
          <div
            style={{ background: "var(--glass-bar)" }}
            className={cn("flex h-8 shrink-0 items-center border-b border-border")}
            onPointerDown={startDrag}
            onDoubleClick={() => toggleMaximize(id)}
            onContextMenu={ctx.open}
          >
            <div className="flex min-w-0 flex-1 items-center gap-1.5 pl-3">
              {app && (
                <span className="size-4 shrink-0">
                  <AppIcon app={app} />
                </span>
              )}
              <div className={cn("pointer-events-none truncate text-[12px] font-medium", focused ? "text-foreground/90" : "text-muted-foreground/60")}>
                {win.title}
              </div>
            </div>
            <WinCaption id={id} maximized={win.maximized} focused={focused} onMinimize={handleMinimize}
              onMaximize={() => toggleMaximize(id)} onClose={handleClose} />
          </div>
        ) : (
          <>
            {/* Thin edge hit-zones, only while the reveal is pending — once a
                bar is showing it covers this strip anyway (see the hook). */}
            {fullScreen && !reveal.topRevealed && <div className="absolute inset-x-0 top-0 z-30 h-1.5" {...reveal.topZoneProps} />}
            <div
              className={cn(
                "glass flex h-7 shrink-0 items-center gap-2 border-b border-border pl-5 pr-3 transition-transform duration-200",
                // Edge-to-edge Full Screen: the titlebar leaves flex flow and
                // slides off-screen until the top edge is hovered (reveal
                // hook), together with the real menu bar.
                fullScreen && "absolute inset-x-0 top-0 z-20",
                fullScreen && !reveal.topRevealed && "-translate-y-full",
              )}
              style={{ background: "var(--window-head)" }}
              onPointerDown={startDrag}
              onDoubleClick={() => toggleMaximize(id)}
              onContextMenu={ctx.open}
            >
              <TrafficLights focused={focused} onClose={handleClose}
                onMinimize={handleMinimize} onMaximize={handleGreen} />
              <div className={cn("pointer-events-none flex-1 truncate text-center text-[13px] font-semibold", focused ? "text-foreground" : "text-muted-foreground")}>
                {win.title}
              </div>
              {/* Balances pl-5 (20) + traffic-lights (52) + gap (8) against
                  pr-3 (12) + gap (8) so the centered title truly centers. */}
              <div className="min-w-[60px]" />
            </div>
            {fullScreen && !reveal.bottomRevealed && <div className="absolute inset-x-0 bottom-0 z-30 h-1.5" {...reveal.bottomZoneProps} />}
          </>
        )}

        <ContextMenu pos={ctx.pos} onClose={ctx.close} items={titleMenu} />

        {win.groupId && <TabStrip groupId={win.groupId} activeId={id} />}

        <div
          className="relative min-h-0 flex-1 overflow-hidden bg-background [container-type:inline-size]"
          // Cross-app DnD: shell payloads route to the app's drop handler;
          // native drags (file uploads) pass through untouched.
          onDragOver={(e) => {
            if (dragCarriesPayload(e)) {
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy";
            }
          }}
          onDrop={(e) => {
            const data = readDragData(e);
            if (data && deliverDrop(win.app, data)) e.preventDefault();
          }}
        >
          <WindowContent app={win.app} payload={win.payload} />
        </div>

        {/* 8-way resize: 4 edges then 4 corners — corners are later siblings so
            they win the pointer where they overlap the full-length edges. */}
        <Handle cls="left-0 top-0 h-full w-2 cursor-ew-resize" onDown={(e) => startResize(e, "l")} />
        <Handle cls="right-0 top-0 h-full w-2 cursor-ew-resize" onDown={(e) => startResize(e, "r")} />
        <Handle cls="left-0 top-0 w-full h-2 cursor-ns-resize" onDown={(e) => startResize(e, "t")} />
        <Handle cls="bottom-0 left-0 h-2 w-full cursor-ns-resize" onDown={(e) => startResize(e, "b")} />
        <Handle cls="left-0 top-0 size-2 cursor-nwse-resize" onDown={(e) => startResize(e, "tl")} />
        <Handle cls="right-0 top-0 size-2 cursor-nesw-resize" onDown={(e) => startResize(e, "tr")} />
        <Handle cls="bottom-0 left-0 size-2 cursor-nesw-resize" onDown={(e) => startResize(e, "bl")} />
        <Handle cls="bottom-0 right-0 size-4 cursor-nwse-resize" onDown={(e) => startResize(e, "br")} />
      </div>
    </>
  );
});

function Handle({ cls, onDown }: { cls: string; onDown: (e: React.PointerEvent) => void }) {
  return <div className={cn("absolute z-[5]", cls)} onPointerDown={onDown} />;
}
