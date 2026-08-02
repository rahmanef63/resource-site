"use client";

import { useRef, useState } from "react";
import { MagnifyingGlass as Search } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AppDescriptor } from "../lib/types";
import { AppIcon } from "./app-icon";
import { MobileAppLibrary } from "./mobile-app-library";
import { AppActionSheet } from "./mobile-action-sheet";
import { Page, AppsGrid, useLongPress } from "./mobile-home-parts";
import { MobileStatusBar } from "./mobile-status-bar";
import { useEdgeDrag, type EdgeSide } from "./mobile-edge-drag";

// Paged iPhone home: [App grid] · [App Library]. The dock, search pill/page
// dots and home-indicator persist across pages.
export function MobileHome({
  apps,
  dockApps,
  onLaunch,
  onSearch,
  onEdgeDrag,
  onEdgeDragEnd,
  hasNotifications,
  indicator,
}: {
  apps: AppDescriptor[];
  dockApps: AppDescriptor[];
  onLaunch: (app: AppDescriptor, rect?: DOMRect) => void;
  onSearch: () => void;
  /** Top-edge pull gesture (P2 ios-nc-cc-drag-follow) — see mobile-edge-drag.ts
   *  for the full contract. `onEdgeDrag` fires continuously (0→1) while
   *  pulling; `onEdgeDragEnd` fires once on release with the open/closed
   *  decision. */
  onEdgeDrag: (side: EdgeSide, progress: number) => void;
  onEdgeDragEnd: (side: EdgeSide, open: boolean) => void;
  hasNotifications: boolean;
  indicator: React.ReactNode;
}) {
  const pagerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0); // 0 apps · 1 library — opens on apps (scrollLeft 0)
  const [paging, setPaging] = useState(false); // true while the pager is actively scrolling — cross-fades dots<->search pill
  const pagingTimer = useRef<number | null>(null);
  const [ctxApp, setCtxApp] = useState<AppDescriptor | null>(null); // long-press sheet
  const [ctxRect, setCtxRect] = useState<DOMRect | null>(null);
  const dockLP = useLongPress((app, rect) => { setCtxApp(app); setCtxRect(rect); }); // dock icons get the same haptic-touch hold as the grid
  const onTopPointerDown = useEdgeDrag(hasNotifications, onEdgeDrag, onEdgeDragEnd);

  const onScroll = () => {
    const el = pagerRef.current;
    if (el) setPage(Math.round(el.scrollLeft / el.clientWidth));
    setPaging(true);
    if (pagingTimer.current) window.clearTimeout(pagingTimer.current);
    pagingTimer.current = window.setTimeout(() => setPaging(false), 150);
  };

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* top safe area: status bar + Dynamic Island; drag down → NC (left) / CC
          (right), tracked 1:1 (mobile-edge-drag.ts). Status bar is
          pointer-events-none, so the gesture still hits this container. */}
      <div className="h-11 shrink-0 [touch-action:none]" onPointerDown={onTopPointerDown}>
        <MobileStatusBar />
      </div>

      <div
        ref={pagerRef}
        onScroll={onScroll}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <Page>
          <AppsGrid
            apps={apps}
            onLaunch={onLaunch}
            onSearch={onSearch}
            onContext={(app, rect) => { setCtxApp(app); setCtxRect(rect); }}
            onEditModeEnter={() => setCtxApp(null)}
          />
        </Page>
        <Page>
          <MobileAppLibrary apps={apps} onOpen={onLaunch} onContext={(app) => { setCtxApp(app); setCtxRect(null); }} />
        </Page>
      </div>

      {/* Persistent frosted Search pill (real iOS default); paging dots only
          while the pager is actively swiping — the two cross-fade in place. */}
      <div className="relative flex h-[26px] items-center justify-center pb-2 pt-1.5">
        <Button
          type="button"
          variant="ghost"
          onClick={onSearch}
          className={cn(
            "glass absolute h-[26px] min-w-[70px] gap-1.5 rounded-full bg-white/20 px-3 text-[12px] font-medium text-white transition-opacity hover:bg-white/25 hover:text-white",
            paging ? "pointer-events-none opacity-0" : "opacity-100",
          )}
        >
          <Search className="size-3" />
          Search
        </Button>
        <div
          className={cn(
            "absolute flex items-center gap-1.5 transition-opacity",
            paging ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          {/* ponytail: the 7px dot IS the tap target (matches iOS dot size); no enlarged hitbox. */}
          {["Apps", "App Library"].map((label, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to ${label} page`}
              aria-current={i === page ? "true" : undefined}
              onClick={() => {
                const el = pagerRef.current;
                if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
              }}
              className={cn("size-[7px] rounded-full transition-colors", i === page ? "bg-white/90" : "bg-white/40")}
            />
          ))}
        </div>
      </div>

      {dockApps.length > 0 && (
        <div
          className="mx-2 mb-3.5 grid grid-cols-4 place-items-center rounded-[36px] px-3.5 py-3"
          style={{
            background: "rgba(255,255,255,.18)",
            backdropFilter: "blur(50px) saturate(180%)",
            WebkitBackdropFilter: "blur(50px) saturate(180%)",
          }}
        >
          {dockApps.map((app) => (
            <button
              key={app.id}
              onPointerDown={dockLP.startHold(app)}
              onContextMenu={(e) => { e.preventDefault(); setCtxApp(app); setCtxRect((e.currentTarget as HTMLElement).getBoundingClientRect()); }}
              onClick={(e) => {
                if (dockLP.held.current) { dockLP.held.current = false; return; }
                onLaunch(app, (e.currentTarget as HTMLElement).getBoundingClientRect());
              }}
              className="size-[60px] p-0"
            >
              <AppIcon app={app} />
            </button>
          ))}
        </div>
      )}

      {indicator}

      {ctxApp && (
        <AppActionSheet
          app={ctxApp}
          rect={ctxRect}
          onOpen={() => { setCtxApp(null); onLaunch(ctxApp, ctxRect ?? undefined); }}
          onClose={() => { setCtxApp(null); setCtxRect(null); }}
        />
      )}
    </div>
  );
}
