"use client";

/* OsSpinner — replaces the single lucide `<Loader2 animate-spin/>` that used
 * to be the ONLY app-launch loading state across all six shells (critic:
 * "one lucide spinner is every OS's loading state" — the highest-frequency
 * moment in the whole OS, since it shows on every single app open).
 *
 * Reads document.documentElement.dataset.shell at mount (same pattern as
 * context-menu.tsx) and renders the OS-authentic progress signature:
 *   - macOS / iOS / mobile / dashboard fallback: an 8-spoke fading
 *     UIActivityIndicator. macOS's own spinner is visually the same look, so
 *     it is not artificially differentiated (per plan guidance).
 *   - Windows: a ring of 8 chasing dots (Fluent ProgressRing), accent-tinted.
 *   - Android: an M3 indeterminate arc — a partial stroke that rotates and
 *     grows/shrinks.
 *
 * The spoke/dot ring shares ONE fade+pulse keyframe (appshell-spinner.css),
 * driven by a `--i` custom property per tick instead of one keyframe per
 * shell; only the tick's shape/color differ in markup. Reduce-motion is
 * automatic (app/globals.css's kill-switch zeroes all animation-duration).
 */
import { useSyncExternalStore, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Variant = "spokes" | "dots" | "arc";
const TICKS = 8;

function variantForShell(shell: string | undefined): Variant {
  if (shell === "windows") return "dots";
  if (shell === "android") return "arc";
  return "spokes"; // macos, ios, mobile, dashboard fallback
}

// A loading spinner is a fresh instance every time an app opens, so a
// one-shot read of the DOM-set shell id is enough (no live shell-switch
// tracking needed) — no-op subscribe, synchronous getSnapshot avoids the
// effect-then-setState flash a useEffect read would cause on first paint.
const noSubscribe = () => () => {};
function useShellId(): string | undefined {
  return useSyncExternalStore(
    noSubscribe,
    () => document.documentElement.dataset.shell,
    () => undefined, // SSR: falls back to the spokes variant
  );
}

export function OsSpinner({ className }: { className?: string }) {
  const variant = variantForShell(useShellId());

  if (variant === "arc") return <ArcSpinner className={className} />;
  return <RingSpinner className={className} shape={variant === "dots" ? "dot" : "spoke"} />;
}

function RingSpinner({ className, shape }: { className?: string; shape: "spoke" | "dot" }) {
  return (
    <span className={cn("relative inline-block size-7", className)} role="status" aria-label="Loading">
      {Array.from({ length: TICKS }, (_, i) => (
        <span key={i} className="absolute inset-0" style={{ transform: `rotate(${(360 / TICKS) * i}deg)` }}>
          <span
            className={cn(
              "os-spinner-tick absolute left-1/2 top-0 -translate-x-1/2 rounded-full",
              shape === "spoke" ? "h-[30%] w-[10%] bg-current" : "size-[16%] bg-[var(--os-accent)]",
            )}
            style={{ "--i": i } as CSSProperties}
          />
        </span>
      ))}
    </span>
  );
}

function ArcSpinner({ className }: { className?: string }) {
  return (
    <span className={cn("os-spinner-arc-rotate inline-block size-7", className)} role="status" aria-label="Loading">
      <svg viewBox="0 0 24 24" className="size-full -rotate-90">
        <circle
          className="os-spinner-arc-dash"
          cx="12"
          cy="12"
          r="9.5"
          pathLength={100}
          fill="none"
          stroke="var(--os-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
