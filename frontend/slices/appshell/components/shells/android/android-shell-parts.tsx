"use client";
/* Android (Material-You) shell sub-components — presentational pieces of
   AndroidShell. Each piece calls its own hooks unconditionally at its top.
   AppDrawer/Recents/Shade live in their own files (android-drawer.tsx,
   android-recents.tsx, android-shade.tsx) to keep every file <=200 LOC. */
import { useEffect, useRef, useState } from "react";
import { WifiHigh as Wifi, CellSignalFull as Signal, BatteryFull, BatteryMedium, BatteryLow, BatteryWarning, BatteryCharging } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AppIcon } from "../../app-icon";
import { useLongPress } from "../../mobile-home-parts";
import { useBattery } from "../../../hooks/use-battery";
import { useRipple } from "./use-ripple";
import type { AppDescriptor } from "../../../lib/types";

// Same phosphor battery family, level-appropriate member — keeps the glyph's
// existing style/size while making the reading real (P5 critic: "Battery and
// radio status are fake static glyphs"). Charging always wins (its own bolt
// icon); otherwise picked by real-world Android battery-icon thresholds.
// Returns a rendered element (not a component type) — selecting a component
// type into a PascalCase render-time variable trips react-hooks/static-components
// even when every branch is a stable, pre-existing reference.
function batteryIcon(pct: number, charging: boolean, className?: string) {
  if (charging) return <BatteryCharging className={className} />;
  if (pct < 0.2) return <BatteryWarning className={className} />;
  if (pct < 0.5) return <BatteryLow className={className} />;
  if (pct < 0.9) return <BatteryMedium className={className} />;
  return <BatteryFull className={className} />;
}

// Each cell carries the long-press → app menu (Material "app shortcuts"): a
// 450ms pointer-hold (cancelled if the finger moves >12px) or a right-click fires
// onContext; a fired hold swallows the click that follows so the app won't launch.
// Mirrors the pointer-hold pattern in mobile-home-parts' AppsGrid. Press
// feedback is a real M3 ink ripple (.ripple-host + useRipple), not iOS scale.
export function AppCell({ app, onClick, onContext }: { app: AppDescriptor; onClick: () => void; onContext: (app: AppDescriptor) => void }) {
  const { startHold, held: heldRef } = useLongPress(onContext); // shared 450ms hold (was hand-rolled — same as iOS grid/dock)
  const ripple = useRipple();
  const hold = startHold(app);
  return (
    <button
      onPointerDown={(e) => { ripple(e); hold(e); }}
      onContextMenu={(e) => { e.preventDefault(); onContext(app); }}
      onClick={() => { if (heldRef.current) { heldRef.current = false; return; } onClick(); }}
      className="ripple-host flex flex-col items-center gap-1.5"
    >
      <span className="size-14"><AppIcon app={app} /></span>
      <span className="w-full truncate text-center text-[11px]">{app.title}</span>
    </button>
  );
}

/* Translucent top status bar — overlays the wallpaper (no solid band) so the
   shell reads as Android. ~28dp tall, clock left at 14sp/medium, icon
   cluster right at 16px optical size with 4px gaps — battery is icon-only
   (Pixel default; no % text), the `battery` prop stays wired via
   data-battery for a future Settings toggle. Tap OR swipe down pulls the
   notification shade (Android's signature gesture). Only reachable on the
   home screen — app/shade overlays cover it — so no overlay-state guard is
   needed. */
export function StatusBar({ onTap, onSwipeDown, battery = 82 }: { onTap?: () => void; onSwipeDown?: () => void; battery?: number }) {
  const live = useBattery();
  const pct = live.supported ? live.level : battery / 100;
  const low = live.supported && pct < 0.2 && !live.charging;
  return (
    <button
      onClick={onTap}
      onPointerDown={(e) => {
        if (!onSwipeDown) return;
        const sy = e.clientY, ac = new AbortController(); // ponytail: per-gesture listeners, no shared drag state
        const move = (ev: PointerEvent) => { if (ev.clientY - sy > 36) { ac.abort(); onSwipeDown(); } };
        window.addEventListener("pointermove", move, { signal: ac.signal });
        window.addEventListener("pointerup", () => ac.abort(), { signal: ac.signal });
        window.addEventListener("pointercancel", () => ac.abort(), { signal: ac.signal });
      }}
      aria-label="Open notifications"
      className="flex h-7 shrink-0 items-center justify-between px-4 text-sm font-medium text-foreground/90"
    >
      <Clock mode="time" />
      <span className="flex items-center gap-1" data-battery={Math.round(pct * 100)}>
        <Signal className="size-4" />
        <Wifi className="size-4" />
        {batteryIcon(pct, live.charging, cn("size-4", low && "text-destructive"))}
      </span>
    </button>
  );
}

/* Pixel gesture nav: a single centered pill (not the legacy 3-button row) in
   a 24dp bar. Tap or a quick upward flick → Home; hold-and-swipe-up (>250ms
   before the flick) → Recents. Back stays the edge-swipe gesture already
   wired in android-shell.tsx — this bar never drew a back button for that. */
export function NavBar({ onHome, onRecents }: { onHome: () => void; onRecents: () => void; onBack?: () => void }) {
  const ripple = useRipple();
  const firedRef = useRef(false);
  return (
    <div className="flex h-6 shrink-0 items-center justify-center">
      <Button
        type="button"
        variant="ghost"
        aria-label="Home"
        onClick={() => { if (firedRef.current) { firedRef.current = false; return; } onHome(); }}
        onPointerDown={(e) => {
          ripple(e);
          const sy = e.clientY, t0 = Date.now(), ac = new AbortController(); // ponytail: per-gesture listeners, no shared drag state
          const move = (ev: PointerEvent) => {
            if (sy - ev.clientY < 40) return;
            firedRef.current = true;
            ac.abort();
            (Date.now() - t0 > 250 ? onRecents : onHome)();
          };
          window.addEventListener("pointermove", move, { signal: ac.signal });
          window.addEventListener("pointerup", () => ac.abort(), { signal: ac.signal });
          window.addEventListener("pointercancel", () => ac.abort(), { signal: ac.signal });
        }}
        className="ripple-host h-6 w-full rounded-none bg-transparent p-0 hover:bg-transparent"
      >
        <span className="h-1 w-27 rounded-full bg-foreground/70" />
      </Button>
    </div>
  );
}

export function Clock({ mode }: { mode: "time" | "big" | "date" | "datetime" }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  if (mode === "big") return <div className="text-5xl font-light tracking-tight">{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>;
  if (mode === "date") return <div className="text-sm text-muted-foreground">{now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" })}</div>;
  if (mode === "datetime") return <span>{now.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" })} · {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>;
  return <span>{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>;
}
