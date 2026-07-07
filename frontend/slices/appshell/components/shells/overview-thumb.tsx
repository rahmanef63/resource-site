"use client";
/* Live thumbnail for a Mission Control card. Mounts a read-only instance of
   the window's actual content, scaled down to the card's real rendered
   width, so cards read as real window previews instead of a flat swatch.
   `live` gates this: window-overview.tsx only asks for the first ~8 cards
   in view to render real content (perf cap) — everything past that, and
   any card before its width is known, falls back to the gradient+icon
   stand-in below. */
import { useEffect, useRef, useState } from "react";
import { WindowContent } from "../window-content";
import { AppIcon } from "../app-icon";
import type { AppDescriptor, WindowState } from "../../lib/types";

export function OverviewThumb({
  win,
  app,
  live,
}: {
  win: WindowState;
  app?: AppDescriptor;
  live: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    if (!live) return;
    const host = hostRef.current;
    if (!host) return;
    const ro = new ResizeObserver((entries) => {
      const cardW = entries[0]?.contentRect.width;
      if (cardW) setScale(cardW / win.w);
    });
    ro.observe(host);
    return () => ro.disconnect();
  }, [live, win.w]);

  return (
    <div ref={hostRef} className="absolute inset-0 overflow-hidden">
      {live && scale > 0 ? (
        <div
          className="pointer-events-none origin-top-left"
          style={{ width: win.w, height: win.h, transform: `scale(${scale})` }}
        >
          <WindowContent app={win.app} payload={win.payload} />
        </div>
      ) : (
        <Fallback app={app} />
      )}
    </div>
  );
}

/** The original gradient-strip + centered icon stand-in — still used while a
 *  live thumbnail's size isn't known yet, and for cards beyond the cap. */
function Fallback({ app }: { app?: AppDescriptor }) {
  return (
    <>
      <div className="h-7 w-full" style={{ background: app?.gradient ?? "var(--muted)" }} />
      <div className="grid h-[calc(100%-1.75rem)] place-items-center">
        {app && (
          <span className="size-12 opacity-90">
            <AppIcon app={app} />
          </span>
        )}
      </div>
    </>
  );
}
