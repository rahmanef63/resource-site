"use client";
/* Desktop-surface + Android lock-curtain looks, split out of lock-screen.tsx
   to keep it under the 200-LOC gate.
     - MacLockCurtain    — the ORIGINAL shared curtain, kept close to what
                           already existed (it reads as the shell's own
                           tuned default).
     - WinLockCurtain    — a resting big-clock state that crossfades into an
                           acrylic (.material-menu → --mica-win on
                           data-shell="windows") sign-in card on the FIRST
                           click; a second click fires the real unlock.
     - AndroidLockCurtain — Android is mobile-surface, but gets its OWN look
                           here rather than reusing the iOS-tuned
                           MobileLockCurtain in lock-screen.tsx (untouched):
                           a big two-line stacked clock + a decorative
                           Fingerprint affordance (no real biometric flow).
   All three call the SAME onUnlock the caller already wires to
   requestUnlock() — a visual differentiation pass, the unlock plumbing (incl.
   the global any-keypress unlock in lock-screen.tsx) is untouched. */
import { useState } from "react";
import { Fingerprint, Key as KeyRound, Lock } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { ShellId } from "../../../registry/shells";

type CurtainProps = { now: Date; onUnlock: () => void };

function dateStr(now: Date) {
  return now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });
}

export function DesktopLockCurtain({ now, onUnlock, shellId }: CurtainProps & { shellId: ShellId }) {
  return shellId === "windows" ? (
    <WinLockCurtain now={now} onUnlock={onUnlock} />
  ) : (
    <MacLockCurtain now={now} onUnlock={onUnlock} />
  );
}

function MacLockCurtain({ now, onUnlock }: CurtainProps) {
  return (
    <div
      className="absolute inset-0 z-[9500] flex cursor-pointer flex-col items-center justify-center gap-3 bg-background/35 backdrop-blur-2xl"
      onClick={onUnlock}
    >
      <div className="text-6xl font-light tracking-tight">
        {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
      <div className="text-sm text-muted-foreground">{dateStr(now)}</div>
      <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="size-3.5" /> Click to unlock
      </div>
    </div>
  );
}

// Any keypress still unlocks instantly via the global listener in
// lock-screen.tsx — this only differentiates the CLICK path (resting clock →
// acrylic prompt → unlock), a 2-stage tap matching Win11's clock-slides-up
// muscle memory without a real PIN-entry system.
function WinLockCurtain({ now, onUnlock }: CurtainProps) {
  const [prompt, setPrompt] = useState(false);
  return (
    <div
      className="absolute inset-0 z-[9500] flex cursor-pointer flex-col items-center justify-center gap-6 bg-background/45 backdrop-blur-2xl"
      onClick={() => (prompt ? onUnlock() : setPrompt(true))}
    >
      <div
        className={cn(
          "text-center transition-all duration-300",
          prompt ? "-translate-y-2 scale-90 opacity-70" : "translate-y-0 scale-100 opacity-100",
        )}
      >
        <div className="text-7xl font-light tracking-tight tabular-nums">
          {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">{dateStr(now)}</div>
      </div>

      <div
        className={cn(
          "material-menu flex w-64 flex-col items-center gap-2 rounded-[var(--radius-win,8px)] p-5 shadow-[var(--shadow-popover)] transition-all duration-300",
          prompt ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
        )}
      >
        <KeyRound className="size-6 text-[var(--os-accent)]" />
        <div className="text-xs text-muted-foreground">Click to sign in</div>
      </div>
    </div>
  );
}

export function AndroidLockCurtain({ now, onUnlock }: CurtainProps) {
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return (
    <div
      className="absolute inset-0 z-[9500] flex cursor-pointer flex-col items-center justify-center gap-1 bg-black/20 text-white backdrop-blur-xl"
      style={{ fontFamily: "var(--font-os)" }}
      onClick={onUnlock}
    >
      <div className="text-sm text-white/80 [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]">{dateStr(now)}</div>
      <div className="flex flex-col items-center leading-[0.85] [text-shadow:0_2px_14px_rgba(0,0,0,0.45)]">
        <span className="text-[104px] font-normal tabular-nums">{hh}</span>
        <span className="text-[104px] font-normal tabular-nums">{mm}</span>
      </div>
      <div className="mt-10 flex flex-col items-center gap-2">
        <div className="grid size-14 place-items-center rounded-full bg-white/15 ring-1 ring-white/25">
          <Fingerprint className="size-7" />
        </div>
        <div className="text-xs text-white/70">Touch sensor to unlock</div>
      </div>
    </div>
  );
}
