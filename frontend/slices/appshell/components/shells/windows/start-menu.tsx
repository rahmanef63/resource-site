"use client";
/* Windows Start menu — search pill, Pinned/All-apps grid, Recommended (recent
   windows) and a full-width footer band. Launch goes through the shared
   store's openWindow (singleton unless the app is multi). */
import { useEffect, useMemo, useState } from "react";
import { CaretRight as ChevronRight, Power, MagnifyingGlass as Search, User } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useApps } from "../../../lib/registry";
import { openWindow } from "../../../lib/store";
import { lock } from "../../../lib/lock";
import { useBrand } from "../../../registry/brand";
import { useRecents } from "../../../lib/recents";
import { AppIcon } from "../../app-icon";
import type { AppDescriptor } from "../../../lib/types";

export function StartMenu({ onClose }: { onClose: () => void }) {
  const apps = useApps().filter((a) => !a.noDock);
  const recents = useRecents();
  const brand = useBrand();
  const [q, setQ] = useState("");
  const [allApps, setAllApps] = useState(false);
  const filtered = useMemo(
    () => apps.filter((a) => a.title.toLowerCase().includes(q.toLowerCase())),
    [apps, q],
  );
  const sorted = useMemo(() => [...filtered].sort((a, b) => a.title.localeCompare(b.title)), [filtered]);
  // Recommended = the most-recently-opened windows (existing lib/recents store,
  // fed by every openWindow call — no new tracking invented here).
  const recommended = useMemo(
    () => recents.map((r) => apps.find((a) => a.id === r.app)).filter((a): a is AppDescriptor => !!a).slice(0, 4),
    [recents, apps],
  );
  const launch = (app: AppDescriptor) => {
    openWindow(app.id, app.title, app.defaultSize, undefined, { multi: app.multi });
    onClose();
  };
  // Escape-to-close — mirrors quick-settings.tsx:24-28 so both flyouts dismiss alike.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <>
      <div className="absolute inset-0 z-[59]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Start menu"
        className={cn(
          "material-menu",
          "animate-in fade-in-0 slide-in-from-bottom-2 [--tw-duration:200ms]",
          "absolute bottom-[60px] left-1/2 z-[61] w-[640px] max-w-[92vw] -translate-x-1/2 overflow-hidden rounded-lg border border-border p-4 shadow-2xl",
        )}
      >
        <div className="mb-3 flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2.5">
          <Search className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for apps, settings, and documents"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {allApps ? "All apps" : "Pinned"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAllApps((v) => !v)}
            className="h-7 gap-0.5 rounded-full px-2.5 text-xs text-muted-foreground hover:text-foreground"
          >
            {allApps ? "Pinned" : "All apps"}
            <ChevronRight className="size-3.5" />
          </Button>
        </div>

        {allApps ? (
          <div className="grid max-h-56 grid-cols-2 gap-x-3 gap-y-0.5 overflow-y-auto pr-1 [scrollbar-width:thin]">
            {sorted.map((app) => (
              <AppRow key={app.id} app={app} subtitle={undefined} onClick={() => launch(app)} />
            ))}
            {sorted.length === 0 && <div className="col-span-2 py-6 text-center text-xs text-muted-foreground">No apps</div>}
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-1">
            {filtered.map((app) => (
              <Button
                key={app.id}
                variant="ghost"
                onClick={() => launch(app)}
                className="flex h-auto flex-col items-center gap-1.5 rounded-lg p-2"
              >
                <span className="size-10">
                  <AppIcon app={app} />
                </span>
                <span className="w-full truncate text-center text-[11px] font-normal">{app.title}</span>
              </Button>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-6 py-6 text-center text-xs text-muted-foreground">No apps</div>
            )}
          </div>
        )}

        {recommended.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Recommended</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
              {recommended.map((app) => (
                <AppRow key={app.id} app={app} subtitle={app.description ?? "Recently opened"} onClick={() => launch(app)} />
              ))}
            </div>
          </div>
        )}

        {/* Win11 bottom bar: signed-in user (branding) + power, as a full-width
            band spanning the panel edge to edge, not an inset bordered row. */}
        <div className="-mx-4 -mb-4 mt-4 flex items-center justify-between rounded-b-lg bg-muted/40 px-4 py-3">
          {/* Was a dead hardcoded "Rahman" div. Now a real button → Settings
              (Account), and the label is the brand name, not a literal. (The full
              in-chrome account control is app-layer MenuBarAccount, reachable only
              via a slot — kept out of the portable shell.) */}
          <Button
            variant="ghost"
            onClick={() => { openWindow("settings", "Settings"); onClose(); }}
            className="h-auto gap-2 rounded-lg px-2 py-1"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">
              <User className="size-4 text-muted-foreground" aria-hidden />
            </span>
            <span className="text-sm font-medium">{brand.name}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { lock(); onClose(); }}
            aria-label="Power"
            className="size-8 rounded"
          >
            <Power className="size-4" />
          </Button>
        </div>
      </div>
    </>
  );
}

// Shared 2-col row for Recommended + the All-apps list: icon, title, subtitle.
function AppRow({ app, subtitle, onClick }: { app: AppDescriptor; subtitle?: string; onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="h-auto min-w-0 justify-start gap-2.5 rounded-lg px-2 py-1.5"
    >
      <span className="size-7 shrink-0">
        <AppIcon app={app} />
      </span>
      <span className="flex min-w-0 flex-col items-start">
        <span className="w-full truncate text-left text-[12px] font-normal">{app.title}</span>
        {subtitle && <span className="w-full truncate text-left text-[11px] font-normal text-muted-foreground">{subtitle}</span>}
      </span>
    </Button>
  );
}
