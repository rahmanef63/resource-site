"use client";

import { useEffect, useRef } from "react";
import { GridFour as LayoutGrid, GridNine as Grid3x3 } from "@phosphor-icons/react";
import { useApps } from "../lib/registry";
import { useWindowOrder, useFocused } from "../hooks/use-shell";
import { shellStore, setLauncherOpen } from "../lib/store";
import type { WindowState } from "../lib/types";
import { BASE, SEP_W, GAP, MAG_SIGMA, DOCK_EXTRA, type Slot } from "./dock-helpers";
import { DockIcon, PlainIcon } from "./dock-parts";

export function Dock({ onMissionControl }: { onMissionControl?: () => void }) {
  const allApps = useApps();
  // Trash lives at the dock's TAIL after a separator (macOS convention) — pull it
  // out of the main app run.
  const apps = allApps.filter((a) => !a.noDock && a.id !== "trash" && a.id !== "files");
  const filesApp = allApps.find((a) => a.id === "files");
  const trashApp = allApps.find((a) => a.id === "trash");
  const order = useWindowOrder();
  const focused = useFocused();
  const wins = order.map((id) => shellStore.getWindow(id)).filter(Boolean) as WindowState[];
  const rowRef = useRef<HTMLDivElement>(null);

  const slots: Slot[] = [
    ...apps.map((app): Slot => ({ kind: "app", app, windows: wins.filter((w) => w.app === app.id) })),
    { kind: "sep" },
    {
      kind: "plain", id: "launchpad", label: "Launchpad", onClick: () => setLauncherOpen(true),
      node: (
        <span className="grid size-full place-items-center rounded-[var(--radius-icon)] bg-gradient-to-b from-muted-foreground to-foreground text-white">
          <LayoutGrid className="size-[54%]" />
        </span>
      ),
    },
    ...(onMissionControl
      ? [{
          kind: "plain", id: "mission-control", label: "Mission Control", onClick: onMissionControl,
          node: (
            <span className="grid size-full place-items-center rounded-[var(--radius-icon)] bg-gradient-to-b from-foreground to-muted-foreground text-white">
              <Grid3x3 className="size-[54%]" />
            </span>
          ),
        } as Slot]
      : []),
    // Files + Trash tail — a separator then the Files folder + Trash, like the
    // real macOS dock's "Files, folders, and Trash" section.
    ...(filesApp || trashApp
      ? [
          { kind: "sep" } as Slot,
          ...(filesApp ? [{ kind: "app", app: filesApp, windows: wins.filter((w) => w.app === filesApp.id) } as Slot] : []),
          ...(trashApp ? [{ kind: "app", app: trashApp, windows: wins.filter((w) => w.app === trashApp.id) } as Slot] : []),
        ]
      : []),
  ];

  // Each slot's resting centre, as an offset from the row centre (fixed geometry).
  const restW = (s: Slot) => (s.kind === "sep" ? SEP_W : BASE);
  const totalRest = slots.reduce((a, s) => a + restW(s), 0) + GAP * (slots.length - 1);
  let acc = 0;
  const restOffset = slots.map((s) => {
    const c = acc + restW(s) / 2 - totalRest / 2;
    acc += restW(s) + GAP;
    return c;
  });
  // Constant normaliser = the gaussian weight-sum when the cursor sits at the row
  // centre (its MAX, since the layout is symmetric and every neighbour exists).
  // Dividing the shared pool by THIS — not the live sum — keeps the icon under the
  // cursor the same size everywhere: at an edge fewer neighbours exist, so the
  // live sum shrinks and would otherwise let the edge icon hog the whole pool
  // (the "edge icons balloon" bug). Bar just grows a touch less near the edges.
  const restNorm =
    restOffset.reduce(
      (a, off, i) => (slots[i].kind === "sep" ? a : a + Math.exp(-(off * off) / (2 * MAG_SIGMA * MAG_SIGMA))),
      0,
    ) || 1;

  // ── Magnification is driven OUTSIDE React (no re-render per pointermove). The
  // hover x is kept in a ref; a single rAF reads the row centre ONCE then writes
  // each slot's width + zone height directly to the DOM. CSS transitions animate
  // the change. Σ widths is constant on hover (DOCK_EXTRA shared by gaussian
  // weight), so the bar has just two widths.
  const slotEls = useRef<(HTMLDivElement | null)[]>([]);
  const zoneEls = useRef<(HTMLDivElement | null)[]>([]);
  const mouseX = useRef<number | null>(null);
  const raf = useRef(0);
  // Was the row hovering as of the LAST applied frame — lets apply() tell an
  // enter/leave transition (mouseX flips null↔value between frames) apart from
  // continued in-dock tracking (mouseX keeps changing while already hovering).
  const wasHovering = useRef(false);

  const apply = () => {
    raf.current = 0;
    const row = rowRef.current;
    if (!row) return;
    const mx = mouseX.current;
    const hovering = mx != null;
    // Real macOS magnification tracks the cursor 1:1 with no perceptible lag —
    // only the grow/shrink on enter/leave is eased. So: entering or leaving the
    // dock gets the ~200ms glide (matches SLOT_TRANS/ZONE_TRANS's class default,
    // repeated here since inline style wins once set); every other frame — the
    // cursor sweeping while already hovering — collapses to a near-instant 60ms.
    const entering = hovering && !wasHovering.current;
    const leaving = !hovering && wasHovering.current;
    const dur = entering || leaving ? "200ms" : "60ms";
    wasHovering.current = hovering;
    const rc = row.getBoundingClientRect(); // ONE read per frame (no per-slot reflow)
    const rowCenter = rc.left + rc.width / 2;
    const weights = slots.map((s, i) => {
      if (!hovering || s.kind === "sep") return 0;
      const d = mx! - (rowCenter + restOffset[i]);
      return Math.exp(-(d * d) / (2 * MAG_SIGMA * MAG_SIGMA));
    });
    slots.forEach((s, i) => {
      if (s.kind === "sep") return;
      // Normalise by the constant restNorm (not Σ weights) → consistent icon size
      // at every position; the bar's total growth eases off naturally at the edges.
      const w = BASE + (hovering ? DOCK_EXTRA * (weights[i] / restNorm) : 0);
      const slot = slotEls.current[i];
      const zone = zoneEls.current[i];
      if (slot) { slot.style.transitionDuration = dur; slot.style.width = `${w}px`; }
      if (zone) { zone.style.transitionDuration = dur; zone.style.height = `${w}px`; }
    });
  };
  const schedule = () => { if (!raf.current) raf.current = requestAnimationFrame(apply); };

  // Re-apply after any structural re-render (focus / windows) so a mid-hover
  // re-render doesn't snap icons back to rest. Also cancels the rAF on unmount.
  useEffect(() => {
    if (mouseX.current != null) schedule();
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  });

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-2 z-[880] flex justify-center">
      <div
        ref={rowRef}
        role="toolbar"
        aria-label="Dock"
        onPointerMove={(e) => { mouseX.current = e.clientX; schedule(); }}
        onPointerLeave={() => { mouseX.current = null; schedule(); }}
        className="glass pointer-events-auto flex items-end rounded-2xl border border-white/25 px-2.5 py-2 shadow-[0_0_0_0.5px_rgba(0,0,0,0.1),0_10px_30px_-8px_rgba(0,0,0,0.35)] dark:border-white/10"
        style={{ background: "var(--dock-bg)", gap: GAP }}
      >
        {slots.map((s, i) => {
          if (s.kind === "sep") {
            return <div key={`sep-${i}`} className="flex shrink-0 self-stretch items-center justify-center" style={{ width: SEP_W }}><span className="my-1 h-full w-px bg-border" /></div>;
          }
          const slotRef = (el: HTMLDivElement | null) => { slotEls.current[i] = el; };
          const zoneRef = (el: HTMLDivElement | null) => { zoneEls.current[i] = el; };
          return s.kind === "app" ? (
            <DockIcon key={s.app.id} app={s.app} windows={s.windows} focused={focused} slotRef={slotRef} zoneRef={zoneRef} />
          ) : (
            <PlainIcon key={s.id} label={s.label} onClick={s.onClick} slotRef={slotRef} zoneRef={zoneRef}>{s.node}</PlainIcon>
          );
        })}
      </div>
    </div>
  );
}
