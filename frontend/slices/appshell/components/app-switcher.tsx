"use client";
/* ⌘Tab / Alt+Tab app switcher — hold ⌘/Ctrl (macOS) or Alt (Windows) and tap Tab
   to cycle running apps MRU-first; release the held modifier to focus the
   highlighted app (Shift reverses, Esc cancels). Reads the window store for the
   running set and only the focus action mutates it.
   Note: some browsers reserve ⌘/Ctrl+Tab for tab switching and won't deliver it
   to the page — best-effort preventDefault. Alt+Tab is NOT browser-reserved so it
   fires reliably. Desktop chrome; render once (one shell mounts at a time). */
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useApps } from "../lib/registry";
import { useWindowOrder } from "../hooks/use-shell";
import { shellStore, focusApp } from "../lib/store";
import { AppIcon } from "./app-icon";
import type { AppDescriptor } from "../lib/types";

export function AppSwitcher() {
  const apps = useApps();
  const order = useWindowOrder();
  const [idx, setIdx] = useState<number | null>(null); // null = closed

  // MRU app list: distinct app ids, most-recently-focused first.
  const runningIds: string[] = [];
  for (let i = order.length - 1; i >= 0; i--) {
    const a = shellStore.getWindow(order[i])?.app;
    if (a && !runningIds.includes(a)) runningIds.push(a);
  }
  const running = runningIds
    .map((id) => apps.find((a) => a.id === id))
    .filter(Boolean) as AppDescriptor[];

  const idxRef = useRef(idx);
  const runRef = useRef(running);
  // Latest-ref mirrors for the keydown handler (post-render, per react-hooks/refs).
  useEffect(() => {
    idxRef.current = idx;
    runRef.current = running;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Meta/Ctrl (macOS ⌘Tab) OR Alt (Windows Alt+Tab) both drive the same cycle.
      if ((e.metaKey || e.ctrlKey || e.altKey) && e.key === "Tab") {
        const list = runRef.current;
        if (list.length < 2) return;
        e.preventDefault();
        const n = list.length;
        setIdx((prev) => (prev == null ? (e.shiftKey ? n - 1 : 1) : (prev + (e.shiftKey ? -1 : 1) + n) % n));
      } else if (e.key === "Escape") {
        setIdx(null);
      }
    };
    const onUp = (e: KeyboardEvent) => {
      // Commit on release of whichever modifier opened the switcher.
      if (e.key !== "Meta" && e.key !== "Control" && e.key !== "Alt") return;
      const i = idxRef.current;
      if (i == null) return;
      const app = runRef.current[i];
      if (app) focusApp(app.id);
      setIdx(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  if (idx == null || running.length < 2) return null;

  return (
    <div className="fixed inset-0 z-[950] grid place-items-center bg-black/25" onClick={() => setIdx(null)}>
      <div
        className="glass flex gap-2 rounded-3xl border border-white/15 p-4 shadow-2xl"
        style={{ background: "var(--glass-menu)" }}
      >
        {running.map((app, i) => (
          <div
            key={app.id}
            className={cn(
              "flex w-[88px] flex-col items-center gap-1.5 rounded-2xl p-2.5 transition-colors",
              i === idx ? "bg-primary/20 ring-2 ring-primary" : "",
            )}
          >
            <div className="size-14">
              <AppIcon app={app} />
            </div>
            <span className="w-full truncate text-center text-[11px] font-medium">{app.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
