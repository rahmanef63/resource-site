"use client";
/* Transient on-screen HUD — the translucent center-screen overlay every real OS
   flashes for ~1s when brightness/volume changes (macOS: rounded-square with
   segmented ticks; Windows: a small top-left flyout; iOS: an expanding pill).
   Scope note (P5 Agent D): one shared generic bezel (macOS's look — rounded
   square, segmented ticks) is reused across desktop shells instead of forking
   per-OS visuals, to keep this a small addition; today only the Windows Quick
   Settings brightness slider triggers it (see quick-settings.tsx). Portaled to
   document.body so it always renders centered above the active shell/panel,
   regardless of the trigger's own stacking context. */
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const VISIBLE_MS = 1200;
const LEAVE_MS = 180;
const SEGMENTS = 10;

type HudState = { icon: Icon; value: number; leaving: boolean };

/** Fire a HUD flash for `value` (0-100). Returns { trigger, hud } — render
 * `hud` once anywhere in the tree (it self-portals). */
export function useHudBezel() {
  const [state, setState] = useState<HudState | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trigger = useCallback((icon: Icon, value: number) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setState({ icon, value, leaving: false });
    leaveTimer.current = setTimeout(() => setState((s) => (s ? { ...s, leaving: true } : s)), VISIBLE_MS - LEAVE_MS);
    hideTimer.current = setTimeout(() => setState(null), VISIBLE_MS);
  }, []);

  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    },
    [],
  );

  const hud =
    state && typeof document !== "undefined"
      ? createPortal(<HudBezelView icon={state.icon} value={state.value} leaving={state.leaving} />, document.body)
      : null;
  return { trigger, hud };
}

function HudBezelView({ icon: Icon, value, leaving }: { icon: Icon; value: number; leaving: boolean }) {
  const filled = Math.round((Math.max(0, Math.min(100, value)) / 100) * SEGMENTS);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9700] grid place-items-center">
      <div
        className={cn(
          "material-menu flex w-[128px] flex-col items-center gap-4 rounded-[22px] p-5 shadow-2xl",
          leaving ? "animate-out fade-out-0 zoom-out-95 [--tw-duration:180ms]" : "animate-in fade-in-0 zoom-in-95 [--tw-duration:150ms]",
        )}
      >
        <Icon className="size-7 text-foreground" weight="light" />
        <div className="flex w-full items-center gap-[3px]">
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <span
              key={i}
              className="h-[14px] flex-1 rounded-[2px]"
              style={{ background: i < filled ? "var(--os-accent)" : "color-mix(in oklab, var(--foreground) 15%, transparent)" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
