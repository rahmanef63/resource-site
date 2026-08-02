"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { openWindow } from "../../../lib/store";
import { AppIcon } from "../../app-icon";
import type { AppDescriptor } from "../../../lib/types";

// P4 android-longpress-popup-anchor: anchor adjacent to the pressed icon
// instead of centering over a dimmed backdrop (real Pixel app-shortcuts stay
// bright — no scrim, no blur). Geometry mirrors mobile-action-sheet.tsx's
// menuPosition (clamped to the shell's OWN box via a ref, not
// window.innerWidth/Height — the desktop phone-frame preview shrinks mobile
// shells into a smaller centered box) but duplicated locally: that file
// belongs to a different P4 agent and this card's M3 sizing differs (52px
// header row instead of 56px, no divider on the header).
const MENU_W = 240;
const ROW_H = 40;
const HEADER_H = 52;
const MARGIN = 8;

function menuPosition(rect: DOMRect | null, container: DOMRect, rows: number) {
  const menuH = HEADER_H + ROW_H * rows;
  let left: number;
  let top: number;
  let originY: "top" | "bottom" = "top"; // which corner the scale-in grows from
  if (rect) {
    left = rect.left - container.left + rect.width / 2 - MENU_W / 2;
    top = rect.bottom - container.top + MARGIN;
    if (top + menuH > container.height - MARGIN) {
      top = rect.top - container.top - menuH - MARGIN;
      originY = "bottom";
    }
  } else {
    left = container.width / 2 - MENU_W / 2;
    top = container.height / 2 - menuH / 2;
  }
  left = Math.max(MARGIN, Math.min(left, container.width - MENU_W - MARGIN));
  top = Math.max(MARGIN, Math.min(top, container.height - menuH - MARGIN));
  return { left, top, origin: `${originY} center` };
}

// Android long-press app menu — Material "app shortcuts": a small rounded
// card (NOT an iOS bottom sheet, NOT a modal dialog) anchored to the pressed
// icon. Header + Open + the app's own declared menu items (the same
// one-declaration menus the macOS bar shows) + App info → About.
export function AndroidAppMenu({
  app, rect, onOpen, onClose,
}: {
  app: AppDescriptor;
  rect: DOMRect | null;
  onOpen: () => void;
  onClose: () => void;
}) {
  const items = (app.menus ?? []).flatMap((m) => m.items).filter(
    (it): it is Extract<typeof it, { label: string }> => !("sep" in it),
  );
  const row = "block w-full px-4 py-2.5 text-left text-sm hover:bg-muted disabled:opacity-40";
  const catcherRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; origin: string } | null>(null);
  const [shown, setShown] = useState(false); // flips true one frame after `pos` lands → drives the scale-in transition

  useLayoutEffect(() => {
    const container = catcherRef.current?.getBoundingClientRect();
    if (container) setPos(menuPosition(rect, container, Math.min(items.length, 4) + 1));
    // one app per open — rect/items are stable for this menu's lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!pos) return;
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, [pos]);

  // Escape closes — keyboard cancel for the right-click path (parity with the
  // desktop overlays); otherwise only the transparent click-catcher / activation dismiss it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    // No dim, no blur: the click-catcher is fully transparent so the launcher
    // stays bright, and (per the backdrop-filter stacking-context gotcha)
    // this card never sits inside a filtered ancestor either.
    <div ref={catcherRef} className="absolute inset-0 z-[45]" onClick={onClose}>
      <div
        role="menu"
        aria-label={`${app.title} shortcuts`}
        className="absolute w-60 overflow-hidden rounded-2xl bg-card/95 text-card-foreground shadow-2xl"
        style={{
          left: pos?.left ?? 0,
          top: pos?.top ?? 0,
          visibility: pos ? "visible" : "hidden",
          transformOrigin: pos?.origin,
          opacity: shown ? 1 : 0,
          transform: shown ? "scale(1)" : "scale(0.5)",
          transition: "transform 220ms var(--ease-spring, cubic-bezier(.34,1.3,.64,1)), opacity 150ms ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 px-4 py-3">
          <span className="size-9"><AppIcon app={app} /></span>
          <strong className="truncate text-[15px]">{app.title}</strong>
        </div>
        <button role="menuitem" onClick={onOpen} className={`${row} font-medium`}>Open</button>
        {items.slice(0, 4).map((it, i) => (
          <button role="menuitem" key={i} disabled={it.disabled} onClick={() => { onClose(); it.onSelect?.(); }} className={row}>
            {it.label}
          </button>
        ))}
        <button role="menuitem" onClick={() => { onClose(); openWindow("about", "About", app.defaultSize); }} className={`${row} border-t border-border`}>
          App info
        </button>
      </div>
    </div>
  );
}
