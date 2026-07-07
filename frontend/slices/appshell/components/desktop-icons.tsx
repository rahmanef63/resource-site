"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Medal as Award, FileText, UserCircle as UserRound, type Icon } from "@phosphor-icons/react";
import { useOpenApp } from "../registry/widgets";
import { useContextMenu, ContextMenu } from "./shells/context-menu";
import { setIconPosition, getIconPosition, useIconPosition } from "./use-icon-positions";
import type { ViewportRect } from "./marquee-selection";

// Desktop showcase icons — folders/files pinned top-right on the wallpaper
// (macOS/Windows convention), double-click to open. The owner's "pamer" surface:
// certificates and CV. Content is curated in the target apps (Files / Site);
// these are the launch points.
// Toggle via the desktop right-click menu ("Show/Hide desktop icons"). Shown by
// default (the whole point is to show off); preference persists.
//
// Multi-select + group drag: `selected` is a React state Set (not native DOM
// :focus — :focus can only ever apply to one element, which can't render N
// simultaneous highlights). The parent desktop (macOS/Windows) hands its live
// marquee-selection rect to `marqueeApiRef` (an imperative callback, not a
// prop) — the parent's own pointermove listener calls it directly, so the
// hit-test + setSelected happen inside a real DOM event handler rather than a
// React effect reacting to a changing prop (effects calling setState off a
// DOM-measurement read trip the react-hooks/set-state-in-effect + refs rules).
// A plain click on an already-selected icon is deliberately NOT special-cased
// to collapse the group to a singleton (real Finder/Explorer nuance) —
// ponytail: simplest model that still lets you select N icons and drag them
// as one group, which is the actual ask.
// Grid snap: final drop position rounds to a fixed cell pitch sized to the
// tile's own rendered footprint, so repeated drags settle icons into aligned
// rows/columns instead of landing at arbitrary pixels.

const KEY = "sv:desktop-icons";
let shown = typeof localStorage === "undefined" ? true : localStorage.getItem(KEY) !== "0";
const subs = new Set<() => void>();
function setShown(v: boolean) {
  shown = v;
  try { localStorage.setItem(KEY, v ? "1" : "0"); } catch { /* private mode */ }
  subs.forEach((f) => f());
}
export function toggleDesktopIcons() { setShown(!shown); }
export function useDesktopIconsShown(): boolean {
  return useSyncExternalStore(
    (cb) => { subs.add(cb); return () => { subs.delete(cb); }; },
    () => shown,
    () => true,
  );
}

// Fill: these 3 are the OS's own generic desktop shortcuts (not branded 3rd-
// party apps like the dock's Mail/Files/Settings icons, which intentionally
// keep a fixed brand color regardless of theme — same as real macOS/Windows).
// So their tint tracks var(--os-accent) (updates with a theme preset AND a
// custom brand hex — see lib/appearance-brand.ts) instead of a literal
// Tailwind color, with a per-icon hue-rotate for visual variety — the bug
// report this fixes: "theme picker doesn't affect icon style". var(--primary)
// was the first anchor tried, but shadcn's stock --primary is a near-
// achromatic black — hue-rotate can't invent variety out of zero chroma, so
// the un-presetted default looked flat. --os-accent's stock value is a real
// saturated blue (appshell.css), so hue-rotate has something to work with
// even before the user ever touches the theme picker.
type DeskItem = { id: string; label: string; icon: Icon; hue: number; appId: string };
const ITEMS: DeskItem[] = [
  // ponytail: the About app is the brand identity card (BRAND/roles/socials) but
  // it's noDock with no icon, so it was invisible on the default desktop. One pinned
  // launcher fixes that — reuses openApp("about"), no new app/data.
  { id: "about", label: "About Me", icon: UserRound, hue: 0, appId: "about" },
  { id: "certs", label: "Sertifikat", icon: Award, hue: 130, appId: "files" },
  { id: "cv", label: "CV — Rahman Fakhrul", icon: FileText, hue: -130, appId: "resume" },
];

// Approximate cell pitch matching the tile's rendered footprint (w-[92px] +
// icon/label/padding stack) — enough breathing room that snapped neighbors
// don't visually overlap. Cosmetic; tune by eye if the tile size changes.
const GRID_X = 96;
const GRID_Y = 104;
const snap = (v: number, g: number) => Math.round(v / g) * g;

export function DesktopIcons({
  marqueeApiRef,
}: {
  /** The parent's marquee gesture calls this DIRECTLY from its own pointer
   *  event listener (see marquee-selection.tsx's `onRectChange`) — not a
   *  prop, so the resulting setSelected() runs in an event handler, not an
   *  effect. Registered/cleared via a plain (setState-free) effect below. */
  marqueeApiRef?: React.MutableRefObject<((r: ViewportRect | null) => void) | null>;
}) {
  const visible = useDesktopIconsShown();
  const openApp = useOpenApp();
  const menu = useContextMenu();
  // Which icon was right-clicked — so the shared menu shows item-specific actions
  // instead of falling through to the desktop's empty-area menu (or Chrome's).
  const [ctxItem, setCtxItem] = useState<DeskItem | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const tileRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const teardown = useRef<(() => void) | null>(null);
  useEffect(() => () => teardown.current?.(), []);

  // Live rubber-band hit-test — the parent calls this on every rect tick
  // while a marquee drag is in flight; leaves the last selection alone once
  // the gesture ends (called with null).
  useEffect(() => {
    if (!marqueeApiRef) return;
    marqueeApiRef.current = (r) => {
      if (!r) return;
      const hit = new Set<string>();
      tileRefs.current.forEach((el, id) => {
        const box = el.getBoundingClientRect();
        if (box.left < r.right && box.right > r.left && box.top < r.bottom && box.bottom > r.top) hit.add(id);
      });
      setSelected(hit);
    };
    return () => { marqueeApiRef.current = null; };
  });

  const onTilePointerDown = (id: string, e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    teardown.current?.(); // finish any still-active group-drag (overlapping pointerdown) before starting a new one
    const additive = e.shiftKey || e.ctrlKey || e.metaKey;
    let group: Set<string>;
    if (additive) {
      group = new Set(selected);
      if (group.has(id)) group.delete(id); else group.add(id);
    } else {
      group = selected.has(id) ? selected : new Set([id]);
    }
    setSelected(group);
    if (!group.has(id)) return; // shift-click just removed this icon from the selection — nothing to drag

    const ids = [...group];
    const bases = new Map(ids.map((gid) => [gid, getIconPosition(gid)]));
    const sx = e.clientX;
    const sy = e.clientY;
    let moved = false;
    const move = (ev: PointerEvent) => {
      const ddx = ev.clientX - sx;
      const ddy = ev.clientY - sy;
      if (!moved && Math.hypot(ddx, ddy) < 4) return; // small click-vs-drag threshold
      moved = true;
      for (const gid of ids) {
        const base = bases.get(gid)!;
        const el = tileRefs.current.get(gid);
        if (el) el.style.transform = `translate(${base.dx + ddx}px, ${base.dy + ddy}px)`;
      }
    };
    const detach = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      teardown.current = null;
    };
    const up = (ev: PointerEvent) => {
      detach();
      if (!moved) return;
      const ddx = ev.clientX - sx;
      const ddy = ev.clientY - sy;
      for (const gid of ids) {
        const base = bases.get(gid)!;
        setIconPosition(gid, { dx: snap(base.dx + ddx, GRID_X), dy: snap(base.dy + ddy, GRID_Y) });
      }
    };
    teardown.current = detach;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  if (!visible) return null;
  return (
    <div className="pointer-events-none absolute right-3 top-[calc(var(--menubar-h)+10px)] z-[4] flex flex-col items-center gap-1">
      {ITEMS.map((it) => (
        <DesktopIconTile
          key={it.id}
          item={it}
          selected={selected.has(it.id)}
          registerRef={(el) => { if (el) tileRefs.current.set(it.id, el); else tileRefs.current.delete(it.id); }}
          onOpen={() => openApp(it.appId)}
          onContext={(e) => { e.stopPropagation(); setCtxItem(it); menu.open(e); }}
          onPointerDown={(e) => onTilePointerDown(it.id, e)}
        />
      ))}
      <ContextMenu
        pos={menu.pos}
        onClose={menu.close}
        items={ctxItem ? [{ label: `Open ${ctxItem.label}`, onClick: () => openApp(ctxItem.appId) }] : []}
      />
    </div>
  );
}

// A single desktop icon — double-click/Enter opens it, right-click routes to
// the shared context menu. Drag/selection is owned by the parent (group-drag
// needs every selected tile's element + base position in one place); this
// component just renders and forwards the raw pointerdown.
function DesktopIconTile({
  item,
  selected,
  registerRef,
  onOpen,
  onContext,
  onPointerDown,
}: {
  item: DeskItem;
  selected: boolean;
  registerRef: (el: HTMLButtonElement | null) => void;
  onOpen: () => void;
  onContext: (e: React.MouseEvent) => void;
  onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => void;
}) {
  const Icon = item.icon;
  const pos = useIconPosition(item.id);

  return (
    <button
      ref={registerRef}
      onDoubleClick={onOpen}
      onContextMenu={onContext}
      onPointerDown={onPointerDown}
      // Keyboard: Enter/Space opens the focused icon; preventDefault on Space
      // stops the page from scrolling. Independent of mouse-driven `selected`
      // (native :focus can't represent a multi-icon selection).
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      title={`Open ${item.label}`}
      aria-label={`Open ${item.label}`}
      data-selected={selected || undefined}
      style={{ transform: pos.dx || pos.dy ? `translate(${pos.dx}px, ${pos.dy}px)` : undefined }}
      className="pointer-events-auto group flex w-[92px] cursor-default flex-col items-center gap-1 rounded-lg p-2 text-center transition-colors focus:outline-none active:cursor-grabbing"
    >
      <span className={`rounded-md p-1 ${selected ? "bg-white/20" : ""}`}>
        <span
          className="icon-tile grid size-12 place-items-center text-white"
          style={{
            background: "linear-gradient(180deg, var(--os-accent), color-mix(in oklab, var(--os-accent) 55%, black))",
            filter: item.hue ? `hue-rotate(${item.hue}deg)` : undefined,
          }}
        >
          {/* text-inherit: keep the glyph white on its coloured tile (opt out
              of the global accent-icon rule — accent-on-accent would vanish). */}
          <Icon className="size-6 text-inherit" />
        </span>
      </span>
      <span
        className={`line-clamp-2 rounded-[4px] px-1 text-[12px] font-medium leading-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.75)] ${selected ? "bg-[var(--os-accent)] text-white" : ""}`}
      >
        {item.label}
      </span>
    </button>
  );
}
