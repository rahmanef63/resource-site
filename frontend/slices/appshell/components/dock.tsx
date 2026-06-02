"use client";

import Link from "next/link";
import { LayoutGrid, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApps } from "../lib/registry";
import { useWindowOrder, useFocused } from "../hooks/use-shell";
import { shellStore, openWindow, focusApp, restoreWindow, setLauncherOpen } from "../lib/store";
import { AppIcon } from "./app-icon";
import type { AppDescriptor, WindowState } from "../lib/types";

// Glass dock, derived from the registry + open windows (rr: dynamic). macOS-like:
// click a RUNNING app to focus its front window (never spawn); hover to see its
// open windows and switch between them; `multi` apps get a "New Window" entry.
export function Dock() {
  const apps = useApps().filter((a) => !a.noDock);
  const order = useWindowOrder();
  const focused = useFocused();
  const wins = order.map((id) => shellStore.getWindow(id)).filter(Boolean) as WindowState[];

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-2 z-[880] flex justify-center">
      <div
        className="glass pointer-events-auto flex items-end gap-2 rounded-[22px] border border-white/40 px-2.5 py-2 shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_18px_50px_-10px_rgba(0,0,0,0.5)] dark:border-white/10"
        style={{ background: "var(--dock-bg)" }}
      >
        {apps.map((app) => (
          <DockIcon
            key={app.id}
            app={app}
            windows={wins.filter((w) => w.app === app.id)}
            focused={focused}
          />
        ))}
        <div className="mx-0.5 my-1 w-px self-stretch bg-border" />
        <PlainIcon label="Launchpad" onClick={() => setLauncherOpen(true)}>
          <span className="grid size-full place-items-center rounded-[var(--radius-icon)] bg-gradient-to-b from-zinc-500 to-zinc-700 text-white">
            <LayoutGrid className="size-[54%]" />
          </span>
        </PlainIcon>
      </div>
    </div>
  );
}

const ICON =
  "relative block size-[52px] transition-transform duration-200 ease-out hover:-translate-y-2 hover:scale-110";

// Floating hover panel above an icon (CSS-only; pb-3 bridges the gap so the
// cursor can travel from icon to panel without it closing).
function HoverPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none invisible absolute bottom-full left-1/2 z-[60] -translate-x-1/2 pb-3 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto">
      <div className="glass min-w-[180px] rounded-xl border border-border p-1 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.55)]">
        {children}
      </div>
    </div>
  );
}

function DockIcon({
  app,
  windows,
  focused,
}: {
  app: AppDescriptor;
  windows: WindowState[];
  focused: string | null;
}) {
  const running = windows.length > 0;
  const active = windows.some((w) => w.id === focused && !w.minimized);
  const href = "/" + (app.slug ?? app.id);

  // Click a running app → focus its front window; otherwise open one.
  const activate = () => {
    if (!focusApp(app.id)) openWindow(app.id, app.title, app.defaultSize, undefined, { multi: app.multi });
  };

  return (
    <div className="group relative flex">
      <HoverPanel>
        <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground">{app.title}</div>
        {windows.map((w, i) => (
          <Button
            key={w.id}
            type="button"
            variant="ghost"
            onClick={() => restoreWindow(w.id)}
            className={cn(
              "h-auto flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[12px]",
              w.id === focused ? "bg-primary/15 text-foreground" : "text-foreground/80 hover:bg-[var(--hover-strong)]",
            )}
          >
            <span className="truncate">{w.title}</span>
            {windows.length > 1 && <span className="ml-auto text-[10px] text-muted-foreground">{i + 1}</span>}
            {w.minimized && <span className="text-[10px] text-muted-foreground">hidden</span>}
          </Button>
        ))}
        {app.multi && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => openWindow(app.id, app.title, app.defaultSize, undefined, { multi: true })}
            className="h-auto flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[12px] text-foreground/80 hover:bg-[var(--hover-strong)]"
          >
            <Plus className="size-3.5" /> New Window
          </Button>
        )}
      </HoverPanel>

      <Link
        href={href}
        prefetch={false}
        onPointerEnter={() => void app.load?.().catch(() => {})}
        onClick={(e) => {
          // Plain left-click = focus/open in place; ⌘/middle-click = open in a
          // new tab via the real <a href> (deep link).
          if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            activate();
          }
        }}
        className={cn(ICON, active && "-translate-y-0.5")}
      >
        <AppIcon app={app} />
        {running && (
          <span className="absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-muted-foreground" />
        )}
      </Link>
    </div>
  );
}

function PlainIcon({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative flex">
      <HoverPanel>
        <div className="px-2 py-1 text-[12px] font-medium text-foreground/80">{label}</div>
      </HoverPanel>
      <Button type="button" variant="ghost" size="icon" aria-label={label} onClick={onClick} className={cn("h-auto w-auto hover:bg-transparent", ICON)}>
        {children}
      </Button>
    </div>
  );
}
