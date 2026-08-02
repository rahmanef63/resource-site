"use client";
/* ContextMenu — a tiny right-click menu shared by the desktop shells (macOS +
   Windows desktop background, Windows taskbar buttons). Open it from an
   onContextMenu handler via useContextMenu(); it positions at the cursor, closes
   on outside-click / Esc / scroll, and clamps to the viewport. Portaled to
   document.body so its z-[200] truly sits above all chrome — when rendered inside
   a positioned/z-indexed parent (e.g. the z-[60] taskbar) a non-portaled fixed
   layer is trapped in that stacking context and can be occluded.

   Fluent scoping: the macOS treatment (translucent .os-menu, 10px radius,
   zoom-in open) is the default and stays exactly as it was. Windows reads
   data-shell="windows" off <html> (stamped by useShellTokens, stable for the
   life of an open menu) at open-time and swaps in the Fluent spec — 8px panel
   radius, 4px item radius, ~34px rows with a fixed icon gutter so icon-less
   rows still align, and a slide-down+fade open instead of the macOS zoom. A
   "Show more options" trailing row is a caller-side garnish (append one more
   disabled MenuItem) — no API change needed here. */
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type MenuItem =
  | { type?: "item"; label: string; icon?: Icon; onClick: () => void; disabled?: boolean }
  | { type: "sep" };

type Pos = { x: number; y: number } | null;

export function useContextMenu() {
  const [pos, setPos] = useState<Pos>(null);
  const open = useCallback((e: { preventDefault: () => void; clientX: number; clientY: number }) => {
    e.preventDefault();
    setPos({ x: e.clientX, y: e.clientY });
  }, []);
  const close = useCallback(() => setPos(null), []);
  return { pos, open, close };
}

export function ContextMenu({ pos, items, onClose }: { pos: Pos; items: MenuItem[]; onClose: () => void }) {
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!pos) return;
    const trigger = document.activeElement as HTMLElement | null; // restore focus here on close
    const btns = () => Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>("button:not([disabled])") ?? []);
    btns()[0]?.focus(); // focus the first item so Esc/arrows/Enter work without a click
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      const list = btns();
      if (!list.length) return;
      const i = list.indexOf(document.activeElement as HTMLButtonElement);
      const next = e.key === "ArrowDown" ? (i + 1) % list.length : (i - 1 + list.length) % list.length;
      list[next]?.focus();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onClose, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onClose, true);
      trigger?.focus?.();
    };
  }, [pos, onClose]);

  if (!pos) return null;
  // Fluent vs. macOS metrics/motion (see file header) — cheap to read fresh on
  // every open since this component renders nothing while `pos` is null.
  const isWin = document.documentElement.dataset.shell === "windows";
  const itemMetrics = isWin ? "h-[34px] rounded-[4px]" : "rounded-md py-1";
  const openMotion = isWin ? "fade-in-0 slide-in-from-top-2 duration-150" : "fade-in zoom-in-95 duration-100";
  // Clamp to the viewport on ALL four edges (Math.max lower-bounds so a click
  // near the bottom/right of a small viewport can't push the menu offscreen).
  const x = Math.max(8, Math.min(pos.x, window.innerWidth - 220));
  const y = Math.max(8, Math.min(pos.y, window.innerHeight - items.length * 34 - 12));

  return createPortal(
    <>
      <div className="fixed inset-0 z-[200]" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
      <div
        ref={menuRef}
        role="menu"
        className={cn("material-menu", "os-menu", "fixed z-[201] min-w-[200px] border border-border shadow-2xl animate-in", openMotion)}
        style={{ left: x, top: y, borderRadius: isWin ? 8 : undefined }}
      >
        {items.map((it, i) =>
          it.type === "sep" ? (
            <div key={i} role="separator" className="my-1 h-px bg-border" />
          ) : (
            <button
              key={i}
              role="menuitem"
              disabled={it.disabled}
              onClick={() => { it.onClick(); onClose(); }}
              className={cn(
                "group flex w-full items-center gap-2.5 px-2.5 text-left text-foreground/90 transition-colors hover:bg-[var(--os-accent)] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-foreground/90",
                itemMetrics,
              )}
            >
              {isWin ? (
                // Fixed icon gutter — a same-size empty slot when an item has
                // no icon keeps every label's left edge aligned (Fluent rows).
                <span className="flex size-4 shrink-0 items-center justify-center">
                  {it.icon && <it.icon className="size-4 text-[var(--os-accent)] group-hover:text-white" />}
                </span>
              ) : (
                it.icon && <it.icon className="size-4 shrink-0 text-[var(--os-accent)] group-hover:text-white" />
              )}
              <span className="truncate">{it.label}</span>
            </button>
          ),
        )}
      </div>
    </>,
    document.body,
  );
}
