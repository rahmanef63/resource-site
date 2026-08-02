"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { AppDescriptor } from "../lib/types";
import { AppIcon } from "./app-icon";

const MENU_W = 250;
const ROW_H = 44;
const HEADER_H = 56;
const MARGIN = 8;

// Anchors the haptic-touch menu adjacent to the pressed icon (real iOS),
// clamped to the shell's own box — read off the backdrop's OWN rect (it's
// `absolute inset-0`, so it fills that box exactly) rather than
// window.innerWidth/Height, which would be wrong inside the desktop
// phone-frame preview (phone-frame.tsx clamps mobile shells to a smaller
// centered box there). `rect` null (no icon captured, e.g. the App Library's
// right-click fallback) centers the menu instead of anchoring it.
function menuPosition(rect: DOMRect | null, container: DOMRect, rows: number) {
  const menuH = HEADER_H + ROW_H * rows;
  let left: number;
  let top: number;
  if (rect) {
    left = rect.left - container.left + rect.width / 2 - MENU_W / 2;
    top = rect.bottom - container.top + MARGIN;
    if (top + menuH > container.height - MARGIN) top = rect.top - container.top - menuH - MARGIN;
  } else {
    left = container.width / 2 - MENU_W / 2;
    top = container.height / 2 - menuH / 2;
  }
  left = Math.max(MARGIN, Math.min(left, container.width - MENU_W - MARGIN));
  top = Math.max(MARGIN, Math.min(top, container.height - menuH - MARGIN));
  return { left, top };
}

// Long-press quick-actions sheet (iPhone's haptic-touch menu): Open + whatever
// menu items the app declares for the macOS menu bar — one declaration, both
// OSes. 250px wide, 13px radius, translucent menu material, 44px/17px rows.
export function AppActionSheet({
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
  const backdropRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    const container = backdropRef.current?.getBoundingClientRect();
    if (container) setPos(menuPosition(rect, container, Math.min(items.length, 4) + 1));
    // one app per open — rect/items are stable for this sheet's lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escape closes — keyboard cancel for the right-click path (parity with desktop).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div ref={backdropRef} className="absolute inset-0 z-[45]" onClick={onClose}>
      <div className="absolute inset-0 backdrop-blur-xl" style={{ background: "rgba(0,0,0,.2)" }} />
      <div
        role="menu"
        aria-label={`${app.title} shortcuts`}
        className="absolute w-[250px] overflow-hidden rounded-[13px] text-white shadow-2xl [animation:appOpen_.2s_cubic-bezier(.2,.8,.2,1)]"
        style={{
          left: pos?.left ?? 0,
          top: pos?.top ?? 0,
          visibility: pos ? "visible" : "hidden",
          background: "rgba(60,60,67,.72)",
          backdropFilter: "blur(30px) saturate(180%)",
          WebkitBackdropFilter: "blur(30px) saturate(180%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-white/15 px-4 py-3">
          <span className="size-9"><AppIcon app={app} /></span>
          <strong className="truncate text-[15px]">{app.title}</strong>
        </div>
        <button role="menuitem" onClick={onOpen} className="flex h-11 w-full items-center px-4 text-left text-[17px] font-medium hover:bg-white/10">
          Open
        </button>
        {items.slice(0, 4).map((it, i) => (
          <button
            role="menuitem"
            key={i}
            disabled={it.disabled}
            onClick={() => { onClose(); it.onSelect?.(); }}
            className="flex h-11 w-full items-center border-t border-white/15 px-4 text-left text-[17px] hover:bg-white/10 disabled:opacity-40"
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}
