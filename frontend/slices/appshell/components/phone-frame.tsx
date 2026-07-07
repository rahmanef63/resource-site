"use client";

import type { ComponentType } from "react";
import { useResponsive } from "../responsive/use-responsive";
import { Wallpaper } from "./wallpaper";

// Phone canvas metrics — iPhone 15 Pro Max logical points as the max size a
// mobile shell gets on a desktop viewport; smaller viewports scale the whole
// device down so the phone ASPECT never distorts (the old frame clamped each
// axis independently, producing a squashed not-a-phone box on short windows).
const MAX_W = 430;
const MAX_H = 932;
const BEZEL = 5; // slim dark hardware ring (px, unscaled — always hairline-thin)
const DISPLAY_R = 48; // display corner radius at full scale
const PAD = 24; // letterbox breathing room around the device

/**
 * Centered phone canvas for previewing a mobile-surface shell on a DESKTOP
 * viewport: aspect-clamped screen, ~48px display corners, slim dark bezel with
 * a soft drop shadow, letterboxed over a blurred wash of the page wallpaper.
 * The shell's own wallpaper re-renders INSIDE the display so the framed
 * preview matches what a real phone shows (the Surface-level wallpaper sits
 * outside the frame, under the wash). Real phone viewports never mount this —
 * the Surface only frames when the viewport is desktop-sized (see desktop.tsx).
 */
export function PhoneFrame({ Comp, wallpaper }: { Comp: ComponentType; wallpaper?: string }) {
  const r = useResponsive();
  const scale = Math.min(
    1,
    (r.vw - PAD * 2) / (MAX_W + BEZEL * 2),
    (r.vh - PAD * 2) / (MAX_H + BEZEL * 2),
  );
  const w = Math.round(MAX_W * scale);
  const h = Math.round(MAX_H * scale);
  const radius = Math.round(DISPLAY_R * scale);
  return (
    <div className="absolute inset-0 grid place-items-center overscroll-none">
      {/* letterbox: blurred wash over the page wallpaper behind the device */}
      <div aria-hidden className="absolute inset-0 bg-background/40 backdrop-blur-2xl" />
      <div
        className="relative shadow-2xl ring-1 ring-white/10"
        style={{
          width: w + BEZEL * 2,
          height: h + BEZEL * 2,
          padding: BEZEL,
          borderRadius: radius + BEZEL,
          // Bezel is device hardware, not theme surface — near-black in both themes.
          background: "var(--phone-bezel, #101013)",
        }}
      >
        {/* The "display" — mobile shells mount `absolute inset-0` against this
            box, exactly as they do against the viewport on a real phone. */}
        <div
          className="relative h-full w-full overflow-hidden overscroll-none bg-background"
          style={{ borderRadius: radius }}
        >
          <Wallpaper shellDefault={wallpaper} />
          <Comp />
        </div>
      </div>
    </div>
  );
}
