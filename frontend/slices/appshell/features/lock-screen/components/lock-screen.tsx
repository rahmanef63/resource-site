"use client";

import { useEffect, useState } from "react";
import { Camera, Flashlight, type Icon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { autoLockMinutes, lock, requestUnlock, useLocked } from "../../../lib/lock";
import { useResponsive } from "../../../responsive/use-responsive";
import { useShellPrefs } from "../../../registry/shells";
import { DesktopLockCurtain, AndroidLockCurtain } from "./lock-screen-os-parts";

// Fullscreen privacy curtain: blurred backdrop, big clock, click/key unlocks
// (through the consumer guard when one is injected). Owns the idle timer.
// The curtain MOUNTS per lock, so the clock seeds in a lazy initializer
// instead of an effect-driven setState (react-hooks v6).
//
// Mobile gets the real iOS lock-screen look (date-over-time, transparent over
// the wallpaper, home-indicator + "Swipe up to unlock") via MobileLockCurtain
// below — untouched since an earlier phase. Desktop-surface shells
// (macOS/Windows/dashboard) get their own per-OS looks from
// lock-screen-os-parts.tsx's DesktopLockCurtain. Android is mobile-surface
// (isMobile is true whenever it's active) but does NOT reuse the iOS-tuned
// MobileLockCurtain — it gets its own AndroidLockCurtain, so the branch below
// checks the active shell id before falling back to isMobile. All branches
// share the same idle-timer + unlock plumbing via the shared responsive seam.
export function LockScreen() {
  const locked = useLocked();

  // idle auto-lock — any pointer/key activity resets the countdown
  useEffect(() => {
    let timer: number | undefined;
    const arm = () => {
      const min = autoLockMinutes();
      if (timer) window.clearTimeout(timer);
      if (min) timer = window.setTimeout(lock, min * 60_000);
    };
    const events: (keyof WindowEventMap)[] = ["pointerdown", "pointermove", "keydown", "wheel"];
    events.forEach((e) => window.addEventListener(e, arm, { passive: true }));
    arm();
    return () => {
      if (timer) window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, arm));
    };
  }, []);

  return locked ? <LockCurtain /> : null;
}

function LockCurtain() {
  const { isMobile } = useResponsive();
  const prefs = useShellPrefs();
  const shellId = isMobile ? prefs.mobile : prefs.desktop;
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault();
      void requestUnlock();
    };
    // Defer one frame: the palette Enter that ran "Lock screen" is still
    // bubbling and must not instantly unlock.
    let attached = false;
    const raf = requestAnimationFrame(() => {
      attached = true;
      window.addEventListener("keydown", onKey);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (attached) window.removeEventListener("keydown", onKey);
    };
  }, []);

  const onUnlock = () => void requestUnlock();
  if (!isMobile) return <DesktopLockCurtain now={now} onUnlock={onUnlock} shellId={shellId} />;
  if (shellId === "android") return <AndroidLockCurtain now={now} onUnlock={onUnlock} />;
  return <MobileLockCurtain now={now} onUnlock={onUnlock} />;
}

// Transparent over the Wallpaper layer beneath (no curtain tint), date-line
// above a MEDIUM-weight ~88px clock — iOS 16+'s default weight, not the
// pre-16 thin/light look (see the audit's critic correction) — plus
// decorative frosted flashlight/camera corner buttons and a home-indicator +
// "Swipe up to unlock" affordance instead of the desktop caption.
function MobileLockCurtain({ now, onUnlock }: { now: Date; onUnlock: () => void }) {
  return (
    <div
      className="absolute inset-0 z-[9500] flex cursor-pointer flex-col bg-transparent text-white"
      onClick={onUnlock}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-1 [text-shadow:0_1px_10px_rgba(0,0,0,0.35)]">
        <span className="text-[17px] font-semibold">
          {now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" })}
        </span>
        <span className="text-[88px] font-medium leading-none tracking-tight tabular-nums">
          {now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
        </span>
      </div>

      <div className="flex items-center justify-between px-7 pb-8">
        <CornerButton icon={Flashlight} label="Flashlight" />
        <CornerButton icon={Camera} label="Camera" />
      </div>

      <div className="flex flex-col items-center gap-2.5 pb-2">
        <span className="text-[13px] text-white/80">Swipe up to unlock</span>
        <span className="h-[5px] w-[134px] rounded-full bg-white" />
      </div>
    </div>
  );
}

// Decorative — real iOS wires these to the flashlight/camera; here they are
// safe no-ops that must not also trigger the unlock click behind them.
function CornerButton({ icon: Icon, label }: { icon: Icon; label: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      aria-label={label}
      onClick={(e) => e.stopPropagation()}
      className="flex size-[50px] items-center justify-center rounded-full bg-white/15 p-0 text-white backdrop-blur-xl hover:bg-white/25"
    >
      <Icon className="size-5" />
    </Button>
  );
}
