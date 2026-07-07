"use client";
/* Android app drawer — split out of android-shell-parts.tsx to keep every
   file <=200 LOC and give P4 fidelity work (android-drawer-swipe-slide) a
   clean, single-owner file.

   P4 android-drawer-swipe-slide (entrance half): Pixel's drawer slides up
   from the bottom edge and settles with the M3 emphasized-decelerate curve
   (drawerUp keyframe, app/globals.css) instead of a flat fade, and its grid
   is a continuous 5-column layout with NO per-letter section headers — kept
   that way here (dropped groupAppsByLetter) since the real Pixel drawer has
   no A-Z headers at all; search still filters the flat grid. The swipe-UP
   gesture that opens this component lives in android-shell.tsx (a different
   agent's file) — this file only owns how the drawer itself animates in. */
import { useState } from "react";
import { MagnifyingGlass as Search } from "@phosphor-icons/react";
import { AppCell } from "./android-shell-parts";
import type { AppDescriptor } from "../../../lib/types";

export function AppDrawer({ apps, onLaunch, onClose, onContext }: { apps: AppDescriptor[]; onLaunch: (a: AppDescriptor) => void; onClose: () => void; onContext: (a: AppDescriptor) => void }) {
  const [q, setQ] = useState("");
  const shown = q ? apps.filter((a) => a.title.toLowerCase().includes(q.toLowerCase())) : apps;
  return (
    <div className="absolute inset-0 z-[30] flex flex-col bg-background/95 backdrop-blur-xl [animation:drawerUp_.4s_cubic-bezier(.05,.7,.1,1)] [transform-origin:bottom]">
      <button onClick={onClose} className="mx-auto mt-2 h-1 w-10 rounded-full bg-foreground/30" aria-label="Close" />
      <div className="mx-4 mt-3 flex h-11 items-center gap-3 rounded-full border border-border bg-card px-4">
        <Search className="size-4 text-muted-foreground" />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search apps" className="w-full bg-transparent text-sm outline-none" />
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-5 content-start gap-x-2 gap-y-5 overflow-auto p-5">
        {shown.map((a) => (
          <AppCell key={a.id} app={a} onClick={() => onLaunch(a)} onContext={onContext} />
        ))}
      </div>
    </div>
  );
}
