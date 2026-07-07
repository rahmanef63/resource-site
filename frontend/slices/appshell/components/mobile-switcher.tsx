"use client";

import { useRef } from "react";
import { useApps } from "../lib/registry";
import { useWindowOrder, useWindow } from "../hooks/use-shell";
import { closeWindow } from "../lib/store";
import { AppIcon } from "./app-icon";
import { WindowContent } from "./window-content";

// iOS-style app switcher: horizontally-scrolling SNAPSHOTS of open windows
// (most-recent first via reversed window order), wallpaper visible + blurred
// behind (not a flat black scrim). Each card carries no internal chrome — the
// app icon + name float in a label row ABOVE the card instead of inside a
// bordered header. Tap a card to focus it, hold + swipe a card UP (> ~90px)
// to close (matches the real iPhone). Tap the backdrop to dismiss. There is
// no "Close All" here — real iOS doesn't have one either (bulk-close lives in
// Control Center's Windows toggle); every window still closes individually.
export function MobileSwitcher({
  onPick,
  onHome,
}: {
  onPick: (winId: string) => void;
  /** Tap empty space (backdrop) → return to the home screen. */
  onHome: () => void;
}) {
  const apps = useApps();
  const order = useWindowOrder();
  const cards = [...order].reverse();

  return (
    <div
      onClick={onHome}
      className="absolute inset-0 z-[40] flex flex-col bg-black/25 backdrop-blur-2xl [animation:appOpen_.22s_cubic-bezier(.2,.8,.2,1)]"
    >
      <div className="h-12 shrink-0" />
      <div className="flex min-h-0 flex-1 items-center overflow-x-auto px-10 py-2 -space-x-3 [scroll-padding-inline:2.5rem] [scroll-snap-type:x_mandatory]">
        {cards.length === 0 && (
          <div className="w-full text-center text-sm text-white/70 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
            No open apps
          </div>
        )}
        {cards.map((id) => (
          <SwitcherCard key={id} winId={id} apps={apps} onPick={() => onPick(id)} />
        ))}
      </div>
      <div className="shrink-0 [height:calc(var(--sai-bottom)_+_18px)]" />
    </div>
  );
}

function SwitcherCard({
  winId,
  apps,
  onPick,
}: {
  winId: string;
  apps: ReturnType<typeof useApps>;
  onPick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Set while/just-after an upward drag so the trailing click doesn't also pick.
  const draggedRef = useRef(false);
  const win = useWindow(winId);
  const app = win ? apps.find((a) => a.id === win.app) : null;
  if (!win || !app) return null;

  // Pointer handlers drive ONLY the swipe-UP-to-close gesture (iPhone style),
  // scoped to the card surface (the label row above it is not draggable).
  // Tapping to open is handled by the wrapper's onClick — the canonical tap
  // signal, which fires reliably on touch even when a synthetic pointerup is
  // swallowed by the scroll container.
  const onPointerDown = (e: React.PointerEvent) => {
    const card = ref.current;
    const sy = e.clientY;
    const sx = e.clientX;
    const DRAG_START = 8; // px upward before it counts as a drag
    draggedRef.current = false;
    let dragging = false;
    const move = (ev: PointerEvent) => {
      const dy = ev.clientY - sy;
      const dx = ev.clientX - sx;
      if (!dragging) {
        if (Math.abs(dx) > Math.abs(dy)) return; // horizontal → let the row scroll
        if (dy > -DRAG_START) return; // not a deliberate upward drag yet
        dragging = true;
        draggedRef.current = true;
      }
      if (card) {
        const up = Math.min(dy, 0);
        card.style.transition = "none";
        card.style.transform = `translateY(${up}px)`;
        card.style.opacity = `${1 - Math.min(-up, 300) / 400}`;
      }
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      const dy = ev.clientY - sy;
      if (dragging && dy < -90) {
        if (card) {
          card.style.transition = "transform .2s, opacity .2s";
          card.style.transform = "translateY(-110%)";
          card.style.opacity = "0";
        }
        setTimeout(() => closeWindow(winId), 180);
        return;
      }
      if (card) {
        card.style.transition = "transform .22s, opacity .22s";
        card.style.transform = "";
        card.style.opacity = "";
      }
      // Released without crossing the close threshold: snap back. A clean tap
      // (draggedRef still false) falls through to onClick → onPick; a partial
      // drag leaves draggedRef set so its trailing click is ignored. The next
      // pointerdown resets the flag.
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div
      className="flex h-[72%] w-[74%] max-w-[300px] shrink-0 flex-col gap-2 [scroll-snap-align:center]"
      onClick={(e) => {
        e.stopPropagation(); // a card tap resumes; only empty space → home
        if (!draggedRef.current) onPick();
      }}
    >
      <div className="flex shrink-0 items-center gap-2 px-1">
        <span className="size-6 shrink-0">
          <AppIcon app={app} />
        </span>
        <strong className="truncate text-[13px] font-medium text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]">
          {app.title}
        </strong>
      </div>
      <div
        ref={ref}
        onPointerDown={onPointerDown}
        style={{ background: "var(--window-bg)", touchAction: "pan-x" }}
        className="min-h-0 flex-1 cursor-grab overflow-hidden rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      >
        <div className="pointer-events-none relative h-full w-full overflow-hidden">
          <div className="absolute inset-0 h-[143%] w-[143%] origin-top-left scale-[0.7]">
            <WindowContent app={win.app} payload={win.payload} />
          </div>
        </div>
      </div>
    </div>
  );
}
