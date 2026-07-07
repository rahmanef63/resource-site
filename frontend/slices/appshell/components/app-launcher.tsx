"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useApps } from "../lib/registry";
import { useLauncherOpen } from "../hooks/use-shell";
import { openWindow, setLauncherOpen } from "../lib/store";
import { AppIcon } from "./app-icon";

// Launchpad — full-screen blurred app grid with a search field (like real macOS).
// Derived from the registry.
export function AppLauncher() {
  const open = useLauncherOpen();
  const apps = useApps();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the search field on open. Launchpad is always mounted (opacity toggle),
  // so autoFocus won't fire — focus here. Not a setState, so effect-safe.
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  const needle = q.trim().toLowerCase();
  const filtered = needle ? apps.filter((a) => a.title.toLowerCase().includes(needle)) : apps;
  const close = () => { setQ(""); setLauncherOpen(false); };

  return (
    <div
      className={cn(
        "glass absolute inset-0 z-[8500] grid place-items-center bg-black/30 transition-opacity",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      onClick={close}
    >
      <div
        className="absolute inset-0 flex flex-col items-center p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full max-w-4xl justify-center pt-12">
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") close(); }}
            placeholder="Search"
            aria-label="Search apps"
            className="w-64 rounded-lg border border-white/20 bg-white/15 px-3 py-1.5 text-center text-sm text-white outline-none backdrop-blur placeholder:text-white/60 focus:border-white/40"
          />
        </div>

        <div className="flex w-full max-w-4xl flex-1 items-center justify-center">
          {filtered.length === 0 ? (
            <p className="text-sm text-white/70">No apps match “{q}”.</p>
          ) : (
            <div className="grid w-full grid-cols-4 gap-x-6 gap-y-8 sm:grid-cols-5 md:grid-cols-7">
              {filtered.map((app) => (
                <Link
                  key={app.id}
                  href={"/" + (app.slug ?? app.id)}
                  prefetch={false}
                  onPointerEnter={() => void app.load?.().catch(() => {})}
                  onClick={(e) => {
                    if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
                      e.preventDefault();
                      openWindow(app.id, app.title, app.defaultSize, undefined, { multi: app.multi });
                    }
                    close();
                  }}
                  className="group flex flex-col items-center gap-2"
                >
                  <span className="size-20 transition-transform group-active:scale-95">
                    <AppIcon app={app} />
                  </span>
                  <span className="text-xs font-medium text-white drop-shadow">{app.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
