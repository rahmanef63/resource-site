"use client";

// iOS status bar. The CONTAINER stays pointer-events-none end-to-end so the
// parent's pull-down gesture (NC/CC split) still receives every pointerdown.
// Left EAR: live H:MM clock · Center: the Dynamic Island · Right EAR:
// signal/wifi/battery glyphs. White on the wallpaper, iOS-bold. The ears are
// two containers flanking the island (each stops half the island width short
// of center, --island-w) so a cluster centers in ITS ear instead of hugging
// the true screen edge — real iOS never pads the clock/glyphs from the notch.
//
// The Dynamic Island is a LIVE ACTIVITY: when a window is focused it expands to
// that app's icon + truncated title and becomes a tappable button (the ONLY
// pointer-events-auto element here) that returns you to the app. Idle → the
// collapsed black pill, pointer-events-none, so the centre swipe still passes
// through to the parent. Both states share --island-top (appshell.css) so the
// pill's top edge never jumps between idle and active.
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useFocused, useWindow } from "../hooks/use-shell";
import { useApps } from "../lib/registry";
import { focusWindow, restoreWindow } from "../lib/store";
import { useActivities } from "../lib/activity";
import { AppIcon } from "./app-icon";
import { StatusGlyphs } from "./mobile-status-bar-parts";

export function MobileStatusBar({
  tone = "light",
  showReturnPill = true,
}: {
  /** Text/glyph color for reading over arbitrary content — "light" (default,
   *  today's only look) = white, "dark" = black. Added for P2
   *  ios-fullscreen-app-chrome (the status bar now overlays app content
   *  instead of the OS's own header), not yet driven per-app (no app
   *  declares a preferred tone). */
  tone?: "light" | "dark";
  /** The idle→live-activity "return to app" pill only makes sense on the
   *  HOME screen (tap it to jump back into the app you left open) — inside
   *  the fullscreen app layer this status bar now also overlays (P2
   *  ios-fullscreen-app-chrome), the focused window IS the app you're
   *  looking at, so that pill would point at itself. mobile-shell.tsx passes
   *  false there. */
  showReturnPill?: boolean;
} = {}) {
  const time = useIOSClock();
  const focused = useFocused();
  const win = useWindow(focused ?? ""); // "" → undefined; no crash when idle
  const apps = useApps();
  const app = win ? apps.find((a) => a.id === win.app) : undefined;
  // The DynamicIsland feature (topPill slot) owns the centre while a live activity
  // runs — yield the return-to-app pill so the two don't stack on top of each other.
  const activityRunning = useActivities().length > 0;

  // Return to the running app. Un-minimize if needed, otherwise just refocus.
  const onTap = () => {
    if (!win) return;
    if (win.minimized) restoreWindow(win.id);
    else focusWindow(win.id);
  };

  return (
    <div
      className={cn(
        "pointer-events-none relative h-full select-none font-semibold",
        tone === "dark" ? "text-black" : "text-white",
      )}
    >
      {/* Left ear: right edge stops at the island's left edge. */}
      <div className="absolute inset-y-0 left-0 right-[calc(50%+var(--island-w)/2)] grid place-items-center pl-6">
        <span className="text-[17px] tabular-nums">{time}</span>
      </div>

      {win && app && !activityRunning && showReturnPill ? (
        // LIVE ACTIVITY: tappable pill, top-anchored to --island-top (same edge
        // as the idle pill below — only width/height morph, never position).
        // ponytail: a swipe-down that STARTS on this pill can fire both the tap
        // and CC; rare (pill is tiny + centred), left as-is.
        <button
          type="button"
          onClick={onTap}
          aria-label={`Return to ${win.title}`}
          className="pointer-events-auto absolute left-1/2 top-[var(--island-top)] flex min-h-[var(--island-h)] max-w-[58%] -translate-x-1/2 items-center gap-1.5 rounded-full bg-black pl-1 pr-3 transition-[width,padding] active:scale-95"
        >
          <span className="size-[24px] shrink-0">
            <AppIcon app={app} className="rounded-full" />
          </span>
          <span className="truncate text-[12px] font-medium leading-none text-white">
            {win.title}
          </span>
        </button>
      ) : (
        // Idle Dynamic Island: opaque black pill (never translucent — it masks
        // the sensor cutout), never blocks the swipe.
        <span className="absolute left-1/2 top-[var(--island-top)] h-[var(--island-h)] w-[var(--island-w)] -translate-x-1/2 rounded-full bg-black" />
      )}

      {/* Right ear: mirrors the left ear's boundary. */}
      <div className="absolute inset-y-0 right-0 left-[calc(50%+var(--island-w)/2)] grid place-items-center pr-6">
        <StatusGlyphs />
      </div>
    </div>
  );
}

// Tiny self-contained clock: empty until mount (no hydration mismatch), then
// "H:MM" with no leading-zero hour, refreshed each minute-ish.
function useIOSClock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () =>
      setT(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 20000);
    return () => clearInterval(id);
  }, []);
  return t;
}
