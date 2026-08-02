"use client";
/* Android home-screen column — split out of android-shell.tsx (P4 fidelity:
   android-wallpaper-hidden, android-home-layout-pixel) to keep that file
   under the 200-LOC gate. Pixel layout: a compact At-a-Glance row (no big
   clock — that belongs on the lock screen / in the shade, both handled
   elsewhere), a 5-column icon grid, a 5-icon hotseat pinned above the
   bottom, and the Google-style search pill at the very bottom. The
   wallpaper now shows straight through (android-shell.tsx no longer paints
   an opaque scrim over it), so every label here carries the same
   white-text + shadow legibility treatment the iOS grid already uses over
   its own wallpaper (mobile-home-parts.tsx's AppsGrid labels). */
import { CloudSun, Microphone as Mic } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useFeaturedWidgets, useOpenApp, WidgetView, defaultSizeOf } from "../../../registry/widgets";
import { toggleSpotlight } from "../../../lib/store";
import { AppIcon } from "../../app-icon";
import { AppCell, Clock } from "./android-shell-parts";
import type { AppDescriptor } from "../../../lib/types";

const HOTSEAT_N = 5;
const GRID_N = 10; // 5 cols x 2 rows

export function AndroidHome({
  dockable,
  onLaunch,
  onContext,
  onSwipeUpDrawer,
  onEmptyContext,
}: {
  dockable: AppDescriptor[];
  onLaunch: (app: AppDescriptor) => void;
  onContext: (app: AppDescriptor, rect?: DOMRect) => void;
  onSwipeUpDrawer: () => void;
  onEmptyContext?: (e: React.MouseEvent) => void;
}) {
  const widgets = useFeaturedWidgets();
  const openApp = useOpenApp();
  // Hotseat = the first N dockable apps (favorites row); the grid shows the
  // REST so nothing renders twice on one page — real Android relies on
  // multiple home pages for a hotseat app to also appear in a grid, which
  // this single-page launcher doesn't have.
  const hotseat = dockable.slice(0, HOTSEAT_N);
  const grid = dockable.slice(HOTSEAT_N, HOTSEAT_N + GRID_N);

  // Swipe up anywhere on the home background → App Drawer, mirroring the
  // vertical-swipe idiom AppsGrid already uses for iOS's own search gesture
  // (mobile-home-parts.tsx): track the finger, fire once past a distance
  // threshold, ignore mostly-horizontal drags. No preventDefault — same as
  // that idiom, so it doesn't fight native scroll either. The old tap-driven
  // "All apps" button is gone (superseded by this gesture); no keyboard
  // fallback is added since AppsGrid's own equivalent search-swipe has none
  // either — a mouse-drag still opens it on desktop/screenshot harnesses.
  const onPointerDown = (e: React.PointerEvent) => {
    const sy = e.clientY, sx = e.clientX;
    let fired = false;
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", cleanup);
    };
    const move = (ev: PointerEvent) => {
      if (fired) return;
      if (ev.clientY - sy < -70 && Math.abs(ev.clientX - sx) < 50) { fired = true; cleanup(); onSwipeUpDrawer(); }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", cleanup);
  };

  return (
    <div
      onPointerDown={onPointerDown}
      onContextMenu={(e) => { if (e.target === e.currentTarget) onEmptyContext?.(e); }}
      className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-none px-5 pb-1 [scrollbar-width:none]"
    >
      {/* At-a-Glance: one compact line. The weather glyph+temp is a static
          placeholder (no weather API wired) — same "honest local state"
          spirit as the shade's cosmetic Wi-Fi/Bluetooth tiles. */}
      <div className="flex items-center gap-1.5 pt-5 text-sm font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
        <Clock mode="date" />
        <span className="text-white/70">·</span>
        <CloudSun className="size-4" />
        <span>72°</span>
      </div>

      {widgets.length > 0 && (
        <div className="-mx-1 mt-4 flex flex-nowrap gap-3 overflow-x-auto overscroll-x-contain px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {widgets.map(({ appId, option }) => (
            <WidgetView key={appId + ":" + option.id} option={option} size={defaultSizeOf(option)} openApp={openApp} />
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-5 gap-x-2 gap-y-5 text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
        {grid.map((a) => (
          <AppCell key={a.id} app={a} onClick={() => onLaunch(a)} onContext={onContext} />
        ))}
      </div>

      {hotseat.length > 0 && (
        <div className="mt-auto grid grid-cols-5 place-items-center gap-x-2 pb-2 pt-3">
          {hotseat.map((a) => (
            <button
              key={a.id}
              type="button"
              aria-label={a.title}
              onClick={() => onLaunch(a)}
              onContextMenu={(e) => { e.preventDefault(); onContext(a); }}
              className="size-12"
            >
              <AppIcon app={a} />
            </button>
          ))}
        </div>
      )}

      {/* Google-style search pill — the very bottom item, below the hotseat. */}
      <Button
        type="button"
        variant="ghost"
        onClick={toggleSpotlight}
        aria-label="Search apps"
        className="mb-1 flex h-12 w-full items-center justify-start gap-3 rounded-full border border-border bg-card/90 px-4 text-left shadow-sm backdrop-blur hover:bg-card"
      >
        {/* OS-exact brand colors (the four-color search glyph), same
            documented-hex exception as the Win11 close-button red elsewhere
            in this codebase — a one-off decorative accent, not a themeable
            surface, so it stays a literal instead of a new CSS var. */}
        <span
          aria-hidden
          className="size-4 shrink-0 rounded-full"
          style={{ background: "conic-gradient(from -45deg,#4285F4 0 25%,#EA4335 25% 50%,#FBBC05 50% 75%,#34A853 75% 100%)" }}
        />
        <span className="flex-1 truncate text-sm font-normal text-muted-foreground">Search apps</span>
        <Mic className="size-4 shrink-0 text-muted-foreground" />
      </Button>
    </div>
  );
}
