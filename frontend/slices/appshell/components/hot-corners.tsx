"use client";

import { useEffect, useRef } from "react";
import { toggleSpotlight, minimizeAll } from "../lib/store";

// macOS Hot Corners — shove the cursor into a screen corner and an action fires.
// Four invisible ~6px hit-areas pinned to the desktop corners. A short dwell
// (DWELL_MS) before firing kills accidental triggers when the pointer merely
// clips a corner on its way somewhere else; leaving the zone cancels the dwell.
//
// ponytail: hardcoded macOS defaults, NO per-corner settings UI (YAGNI). If a
// real "customize hot corners" need ever shows up, lift CORNERS into the store.
// ponytail: the wrapper is pointer-events-none and only the 6px squares are
// pointer-events-auto, so they never block window interaction — the cost is a
// 6px dead-zone in each active corner (the same trade macOS itself makes).
// ponytail: z-[901] must clear the ALWAYS-present menu bar (z-900, the full-width
// top 30px) — at a lower z the two TOP corners never receive pointerenter (the bar
// hit-tests first). The 6px zones land inside the bar's px-2.5 (10px) edge padding,
// so they steal no menu-bar button clicks. Spotlight (9000) still covers them; the
// pointer-events-none wrapper means only the 6px squares are ever interactive.

const DWELL_MS = 120;

export function HotCorners({ onMissionControl }: { onMissionControl: () => void }) {
  // One shared dwell timer: the pointer can only occupy one corner at a time,
  // so only one corner is ever armed.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clear = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };
  // Cancel any pending dwell if the desktop unmounts mid-hover.
  useEffect(() => clear, []);

  const arm = (run: () => void) => {
    clear();
    timer.current = setTimeout(() => {
      timer.current = null;
      run();
    }, DWELL_MS);
  };

  // Sensible macOS defaults. top-left is intentionally a no-op (omitted) so it
  // never steals a 6px corner for nothing — DRY-er than rendering a dead zone.
  const corners: { key: string; pos: string; label: string; run: () => void }[] = [
    { key: "tr", pos: "right-0 top-0", label: "Mission Control", run: onMissionControl },
    { key: "bl", pos: "bottom-0 left-0", label: "Spotlight", run: toggleSpotlight },
    { key: "br", pos: "bottom-0 right-0", label: "Show desktop", run: minimizeAll },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-[901]" aria-hidden>
      {corners.map(({ key, pos, label, run }) => (
        <div
          key={key}
          title={label}
          onPointerEnter={() => arm(run)}
          onPointerLeave={clear}
          className={`pointer-events-auto absolute ${pos} h-1.5 w-1.5`}
        />
      ))}
    </div>
  );
}
