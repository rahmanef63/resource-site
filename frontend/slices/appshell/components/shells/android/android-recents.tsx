"use client";
/* Android Recents (overview) deck — split out of android-shell-parts.tsx to
   keep every file <=200 LOC and give P4 fidelity work
   (android-recents-card-anatomy) a clean, single-owner file.

   P4 android-recents-card-anatomy: a real Pixel Recents card reads like a
   live screenshot (near-phone aspect, no header row) with the app's round
   icon floating as its OWN badge above the card, not inside it. Tap-to-resume
   still lives on the card; a per-card swipe-UP dismiss was cheap to add on
   top of the existing AbortController pointer-swipe idiom (android-shell.tsx's
   edge-swipe / android-shell-parts.tsx's long-press), so it's included rather
   than skipped as the brief allowed. */
import { useRef } from "react";
import { shellStore, closeWindow } from "../../../lib/store";
import { AppIcon } from "../../app-icon";
import type { AppDescriptor } from "../../../lib/types";

export function Recents({ order, apps, onResume, onHome, onClearAll }: { order: string[]; apps: AppDescriptor[]; onResume: (id: string) => void; onHome: () => void; onClearAll: () => void }) {
  const wins = order.map((id) => shellStore.getWindow(id)).filter(Boolean);
  return (
    <div className="absolute inset-0 z-[30] flex flex-col bg-background/90 backdrop-blur-xl" onClick={onHome}>
      <div className="flex min-h-0 flex-1 items-end gap-5 overflow-x-auto px-6 pt-10 pb-3" onClick={(e) => e.stopPropagation()}>
        {wins.length === 0 && <div className="m-auto text-sm text-muted-foreground">No recent apps</div>}
        {wins.map((w) => (
          <RecentCard key={w!.id} id={w!.id} title={w!.title} app={apps.find((a) => a.id === w!.app)} onResume={onResume} />
        ))}
      </div>
      {/* Clear all — the Android deck-clear pill; hidden when empty (the deck already says "No recent apps") */}
      {wins.length > 0 && <button onClick={(e) => { e.stopPropagation(); onClearAll(); }} className="mx-auto mb-8 rounded-full bg-card px-5 py-2 text-xs font-medium shadow-lg active:scale-95">Clear all</button>}
    </div>
  );
}

// A card: a small circular icon badge floating centered ABOVE a tall (~9:19)
// screenshot-shaped card — the card itself is pure content/gradient, no
// header row. Swipe UP >80px on the card dismisses it (closeWindow) without
// resuming; a plain tap resumes it. `dismissedRef` swallows the click that
// follows a fired dismiss, same swallow trick AppCell uses for long-press.
function RecentCard({ id, title, app, onResume }: { id: string; title: string; app: AppDescriptor | undefined; onResume: (id: string) => void }) {
  const dismissedRef = useRef(false);
  const onPointerDown = (e: React.PointerEvent) => {
    const y0 = e.clientY, ac = new AbortController(); // ponytail: per-gesture listeners, no shared drag state
    const move = (ev: PointerEvent) => {
      if (ev.clientY - y0 < -80) { dismissedRef.current = true; closeWindow(id); ac.abort(); }
    };
    window.addEventListener("pointermove", move, { signal: ac.signal });
    window.addEventListener("pointerup", () => ac.abort(), { signal: ac.signal });
    window.addEventListener("pointercancel", () => ac.abort(), { signal: ac.signal }); // touch scroll-takeover
  };
  return (
    <div className="flex h-[70%] shrink-0 flex-col items-center gap-2">
      {app && <span className="size-9 shrink-0"><AppIcon app={app} /></span>}
      <button
        onPointerDown={onPointerDown}
        onClick={() => { if (dismissedRef.current) { dismissedRef.current = false; return; } onResume(id); }}
        aria-label={`Resume ${title}`}
        className="aspect-[9/19] w-auto min-h-0 flex-1 overflow-hidden rounded-[22px] border border-border bg-card shadow-lg"
      >
        <span className="block size-full" style={{ background: app?.gradient, opacity: 0.15 }} />
      </button>
    </div>
  );
}
