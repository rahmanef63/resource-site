"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AppDescriptor } from "../lib/types";
import { AppIcon } from "./app-icon";
import { Slot } from "../registry/feature-registry";
import { MobileAppLibrary } from "./mobile-app-library";

// Paged iPhone home: [Today widgets] · [App grid] · [App Library]. The dock,
// page dots, search pill and home-indicator persist across pages.
export function MobileHome({
  apps,
  dockApps,
  onLaunch,
  onSearch,
  onControlCenter,
  indicator,
}: {
  apps: AppDescriptor[];
  dockApps: AppDescriptor[];
  onLaunch: (app: AppDescriptor) => void;
  onSearch: () => void;
  onControlCenter: () => void;
  indicator: React.ReactNode;
}) {
  const pagerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1); // 0 widgets · 1 apps · 2 library

  // Open on the app grid (the middle page), like iPhone's default home.
  useLayoutEffect(() => {
    const el = pagerRef.current;
    if (el) el.scrollLeft = el.clientWidth;
  }, []);

  const onScroll = () => {
    const el = pagerRef.current;
    if (el) setPage(Math.round(el.scrollLeft / el.clientWidth));
  };

  // Swipe DOWN from the top safe-area opens Control Center (iPhone).
  const onTopPointerDown = (e: React.PointerEvent) => {
    const sy = e.clientY;
    let fired = false;
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", cleanup);
    };
    const move = (ev: PointerEvent) => {
      if (!fired && ev.clientY - sy > 40) {
        fired = true;
        cleanup();
        onControlCenter();
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", cleanup);
  };

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* top safe area: Dynamic Island lives here; swipe down → Control Center */}
      <div className="h-9 shrink-0 [touch-action:none]" onPointerDown={onTopPointerDown} />

      <div
        ref={pagerRef}
        onScroll={onScroll}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <Page>
          <Slot region="today" />
        </Page>
        <Page>
          <AppsGrid apps={apps} onLaunch={onLaunch} onSearch={onSearch} />
        </Page>
        <Page>
          <MobileAppLibrary apps={apps} onOpen={onLaunch} />
        </Page>
      </div>

      <div className="flex justify-center gap-1.5 pb-2 pt-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className={cn("size-[7px] rounded-full", i === page ? "bg-white/90" : "bg-white/40")} />
        ))}
      </div>

      {dockApps.length > 0 && (
        <div
          className="glass mx-3 mb-3.5 flex justify-around rounded-[30px] border border-white/30 px-3.5 py-3"
          style={{ background: "rgba(255,255,255,.18)" }}
        >
          {dockApps.map((app) => (
            <Button key={app.id} type="button" variant="ghost" size="icon" aria-label={app.title} onClick={() => onLaunch(app)} className="h-auto w-auto hover:bg-transparent size-[60px] p-0">
              <AppIcon app={app} />
            </Button>
          ))}
        </div>
      )}

      {indicator}
    </div>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return <section className="h-full w-full shrink-0 snap-center overflow-hidden">{children}</section>;
}

// App grid page. A clear upward swipe (not a horizontal page flick) opens search.
function AppsGrid({
  apps,
  onLaunch,
  onSearch,
}: {
  apps: AppDescriptor[];
  onLaunch: (app: AppDescriptor) => void;
  onSearch: () => void;
}) {
  const onPointerDown = (e: React.PointerEvent) => {
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
      if (!fired && dy < -70 && Math.abs(dx) < 50) {
        fired = true;
        cleanup();
        onSearch();
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", cleanup);
  };

  return (
    <div
      onPointerDown={onPointerDown}
      className="grid h-full grid-cols-4 content-start gap-x-2.5 gap-y-5 px-[18px] py-3.5 [touch-action:pan-x]"
    >
      {apps.map((app) => (
        <Button key={app.id} type="button" variant="ghost" onClick={() => onLaunch(app)} className="h-auto p-0 hover:bg-transparent flex flex-col items-center gap-1.5">
          <span className="aspect-square w-full max-w-[62px]">
            <AppIcon app={app} />
          </span>
          <span className="max-w-full truncate text-[11px] font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
            {app.title}
          </span>
        </Button>
      ))}
    </div>
  );
}
