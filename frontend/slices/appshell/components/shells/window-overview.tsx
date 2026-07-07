"use client";
/* Window Overview — the shared multitasking surface behind macOS Mission Control
   (F3) and the Windows Task View button. A full-surface scrim over a responsive
   grid of every open window: click a card to focus it (and close the overview),
   the × to close that window. Esc dismisses. Drives ONLY the existing store
   actions (focus / restore / close) — it forks no window state, so both desktop
   shells share one implementation. */
import { useEffect, type ReactNode } from "react";
import { X } from "@phosphor-icons/react";
import { useWindowOrder, useWindow } from "../../hooks/use-shell";
import { useApps } from "../../lib/registry";
import { focusWindow, restoreWindow, closeWindow, shellStore } from "../../lib/store";
import { spaceOf, setActiveSpace } from "../../lib/spaces";
import { AppIcon } from "../app-icon";
import { OverviewThumb } from "./overview-thumb";

// Real window content is real DOM + real app bundles — rendering it for every
// open window at once would be a perf cliff. Only the first N cards (in
// store order, which is also stacking/recency order) get a live thumbnail;
// the rest keep the cheap gradient+icon stand-in.
const MAX_LIVE_THUMBS = 8;

export function WindowOverview({
  onClose,
  label = "Mission Control",
  footer,
}: {
  onClose: () => void;
  label?: string;
  /** Optional shell-specific footer (e.g. Windows Task View's desktops strip). */
  footer?: ReactNode;
}) {
  const order = useWindowOrder();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const reveal = (id: string) => {
    // The overview lists windows from ALL Spaces; if the picked one lives on
    // another Space, switch to it first or window.tsx's space gate keeps it hidden
    // and the click appears to do nothing.
    const win = shellStore.getWindow(id);
    if (win) setActiveSpace(spaceOf(win));
    restoreWindow(id);
    focusWindow(id);
    onClose();
  };

  return (
    <div
      className="absolute inset-0 z-[80] flex flex-col bg-black/25 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div className="shrink-0 px-6 pt-5 text-center text-xs font-medium uppercase tracking-widest text-white/70">
        {label}
      </div>
      {order.length === 0 ? (
        <div className="grid flex-1 place-items-center text-sm text-white/60">No open windows</div>
      ) : (
        <div className="grid flex-1 content-start gap-5 overflow-auto p-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {order.map((id, i) => (
            <OverviewCard key={id} id={id} live={i < MAX_LIVE_THUMBS} onReveal={() => reveal(id)} />
          ))}
        </div>
      )}
      {footer && (
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          {footer}
        </div>
      )}
    </div>
  );
}

function OverviewCard({ id, live, onReveal }: { id: string; live: boolean; onReveal: () => void }) {
  const win = useWindow(id);
  const apps = useApps();
  if (!win) return null;
  const app = apps.find((a) => a.id === win.app);
  return (
    <div className="group/card flex flex-col" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={onReveal}
        style={{ aspectRatio: win.w / win.h }}
        className="relative overflow-hidden rounded-xl border border-white/15 bg-card text-left shadow-xl ring-0 transition group-hover/card:-translate-y-0.5 group-hover/card:ring-2 group-hover/card:ring-white/70"
      >
        <OverviewThumb win={win} app={app} live={live} />
        {win.minimized && (
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white/80">
            minimized
          </span>
        )}
      </button>
      <div className="mt-2 flex items-center gap-1.5 px-1">
        {app && <span className="size-4 shrink-0"><AppIcon app={app} /></span>}
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-white/90">{win.title}</span>
        <button
          onClick={() => closeWindow(id)}
          aria-label="Close window"
          className="grid size-5 shrink-0 place-items-center rounded-full bg-white/10 text-white/70 opacity-0 transition hover:bg-white/25 group-hover/card:opacity-100"
        >
          <X className="size-3" />
        </button>
      </div>
    </div>
  );
}
