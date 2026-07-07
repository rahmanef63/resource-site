"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { openWindow, focusApp, restoreWindow, closeWindow, minimizeWindow } from "../lib/store";
import { AppIcon } from "./app-icon";
import { useContextMenu, ContextMenu, type MenuItem } from "./shells/context-menu";
import type { AppDescriptor, WindowState } from "../lib/types";
import { BASE, SLOT_TRANS, ZONE_TRANS } from "./dock-helpers";

// Floating panel above an icon (CSS-only; pb-4 bridges the gap so the cursor can
// travel from icon to panel without it closing). `wide` = the running-app menu
// (window list); otherwise a compact macOS name caption centred over the icon.
export function HoverPanel({ wide, children }: { wide?: boolean; children: React.ReactNode }) {
  return (
    <div className="pointer-events-none invisible absolute bottom-full left-1/2 z-[60] -translate-x-1/2 pb-4 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto">
      <div
        className={
          "glass rounded-xl border border-border shadow-[0_12px_40px_-8px_rgba(0,0,0,0.55)] " +
          (wide ? "min-w-[180px] p-1" : "whitespace-nowrap px-3 py-1 text-center")
        }
      >
        {children}
      </div>
    </div>
  );
}

export function DockIcon({
  app, windows, focused, slotRef, zoneRef,
}: {
  app: AppDescriptor;
  windows: WindowState[];
  focused: string | null;
  slotRef: (el: HTMLDivElement | null) => void;
  zoneRef: (el: HTMLDivElement | null) => void;
}) {
  const running = windows.length > 0;
  const href = "/" + (app.slug ?? app.id);
  const hasMenu = windows.length > 0 || !!app.multi;
  const ctx = useContextMenu();
  // Launch bounce — only plays when activate() actually OPENS a new window
  // (not when it merely focuses an already-running one); cleared on
  // animationend so it can replay on the next launch.
  const [bouncing, setBouncing] = useState(false);

  const activate = () => {
    if (!focusApp(app.id)) {
      openWindow(app.id, app.title, app.defaultSize, undefined, { multi: app.multi });
      setBouncing(true);
    }
  };

  // macOS dock right-click menu — running-state aware.
  const ctxItems: MenuItem[] = running
    ? [
        { label: "Show All Windows", onClick: () => windows.forEach((w) => restoreWindow(w.id)) },
        { label: "Hide", onClick: () => windows.forEach((w) => minimizeWindow(w.id)) },
        ...(app.multi ? [{ label: "New Window", onClick: () => openWindow(app.id, app.title, app.defaultSize, undefined, { multi: true }) } as MenuItem] : []),
        { type: "sep" as const },
        { label: `Quit ${app.title}`, onClick: () => windows.forEach((w) => closeWindow(w.id)) },
      ]
    : [
        { label: `Open ${app.title}`, onClick: activate },
        ...(app.multi ? [{ label: "New Window", onClick: () => openWindow(app.id, app.title, app.defaultSize, undefined, { multi: true }) } as MenuItem] : []),
      ];

  return (
    <div ref={slotRef} className={`relative shrink-0 ${SLOT_TRANS}`} style={{ width: BASE, height: BASE }}>
      <div ref={zoneRef} className={`group absolute inset-x-0 bottom-0 ${ZONE_TRANS}`} style={{ height: BASE }}>
        {hasMenu ? (
          <HoverPanel wide>
            <div className="px-2 py-1 text-center text-[11px] font-semibold text-muted-foreground">{app.title}</div>
            {windows.map((wd, i) => (
              <button
                key={wd.id}
                onClick={() => restoreWindow(wd.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[12px]",
                  wd.id === focused ? "bg-primary/15 text-foreground" : "text-foreground/80 hover:bg-[var(--hover-strong)]",
                )}
              >
                <span className="truncate">{wd.title}</span>
                {windows.length > 1 && <span className="ml-auto text-[10px] text-muted-foreground">{i + 1}</span>}
                {wd.minimized && <span className="text-[10px] text-muted-foreground">hidden</span>}
              </button>
            ))}
            {app.multi && (
              <button
                onClick={() => openWindow(app.id, app.title, app.defaultSize, undefined, { multi: true })}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[12px] text-foreground/80 hover:bg-[var(--hover-strong)]"
              >
                <Plus className="size-3.5" /> New Window
              </button>
            )}
          </HoverPanel>
        ) : (
          <HoverPanel><span className="text-[12.5px] font-medium">{app.title}</span></HoverPanel>
        )}

        <Link
          href={href}
          prefetch={false}
          aria-label={app.title}
          onPointerEnter={() => void app.load?.().catch(() => {})}
          onContextMenu={ctx.open}
          onClick={(e) => {
            if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
              e.preventDefault();
              activate();
            }
          }}
          onAnimationEnd={() => setBouncing(false)}
          className={cn("relative block size-full drop-shadow-[0_6px_10px_rgba(0,0,0,0.3)]", bouncing && "dock-bounce")}
        >
          <AppIcon app={app} />
          {running && (
            <span className="absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-muted-foreground" />
          )}
        </Link>
      </div>
      <ContextMenu pos={ctx.pos} items={ctxItems} onClose={ctx.close} />
    </div>
  );
}

export function PlainIcon({
  label, onClick, slotRef, zoneRef, children,
}: {
  label: string;
  onClick: () => void;
  slotRef: (el: HTMLDivElement | null) => void;
  zoneRef: (el: HTMLDivElement | null) => void;
  children: React.ReactNode;
}) {
  return (
    <div ref={slotRef} className={`relative shrink-0 ${SLOT_TRANS}`} style={{ width: BASE, height: BASE }}>
      <div ref={zoneRef} className={`group absolute inset-x-0 bottom-0 ${ZONE_TRANS}`} style={{ height: BASE }}>
        <HoverPanel><span className="text-[12.5px] font-medium">{label}</span></HoverPanel>
        <button aria-label={label} onClick={onClick} className="relative block size-full drop-shadow-[0_6px_10px_rgba(0,0,0,0.3)]">
          {children}
        </button>
      </div>
    </div>
  );
}
