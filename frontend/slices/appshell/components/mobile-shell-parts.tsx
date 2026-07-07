"use client";

import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import type { ZoomVars } from "./use-app-zoom";

// Split out of mobile-shell.tsx to keep that file under the 200-LOC gate.

// Home-indicator is a plain TAP button (not a drag) so it never fights the
// real iPhone bottom-edge gesture. Tap → app switcher; "Done" covers home.
// Hoisted to module scope (react-hooks/static-components); the switcher
// opener arrives via onTap. `pointer-events-auto` matters when a caller
// floats this inside a `pointer-events-none` overlay (the in-app indicator,
// P2 ios-fullscreen-app-chrome) — pointer-events inherits, so without it the
// button would go dead there.
export function Indicator({ light = true, onTap }: { light?: boolean; onTap: () => void }) {
  return (
    <div className="flex justify-center pb-[7px] pt-[5px]">
      <Button
        type="button"
        variant="ghost"
        aria-label="App switcher"
        onClick={onTap}
        className="pointer-events-auto h-auto hover:bg-transparent flex items-center justify-center px-12 py-1.5 [touch-action:manipulation]"
      >
        <span
          className="h-[5px] w-[134px] rounded-full"
          style={{ background: light ? "rgba(255,255,255,.75)" : "rgba(0,0,0,.3)" }}
        />
      </Button>
    </div>
  );
}

// The fullscreen app layer's inline style for the icon-zoom open/close (P2
// ios-app-open-zoom). `vars` present → play iosZoomOpen (app/globals.css),
// forward for open / `animation-direction: reverse` for close, both `both`-
// filled so the element holds its start/end frame. No `vars` (no icon rect
// captured, e.g. resuming from the switcher) → the pre-existing fade/slide
// appOpen on open, and an instant close (no animation at all).
export function appZoomStyle(vars: ZoomVars | null, closing: boolean): CSSProperties {
  return {
    background: "var(--surface)",
    ...(vars ?? {}),
    animation: vars
      ? `iosZoomOpen 0.4s cubic-bezier(0.32,0.72,0,1) ${closing ? "reverse" : "normal"} both`
      : closing
        ? undefined
        : "appOpen .28s cubic-bezier(.2,.8,.2,1)",
    transformOrigin: vars ? undefined : "center bottom",
  } as CSSProperties;
}
