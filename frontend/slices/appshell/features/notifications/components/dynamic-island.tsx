"use client";

import { Check, X, CircleNotch as Loader2 } from "@phosphor-icons/react";
import { useActivities, useShellUI } from "@/features/appshell";

// iPhone Dynamic Island: a top-center pill that appears ONLY while something is
// happening (render, copy, …). Reads the live-activity store; tapping it focuses
// the owning app via the shell surface. Idle → renders nothing.
export function DynamicIsland() {
  const { openAppById } = useShellUI();
  const activities = useActivities();
  const a = activities[activities.length - 1];
  if (!a) return null;

  const pct = typeof a.progress === "number" ? Math.max(0, Math.min(100, a.progress)) : null;
  const tone = a.tone ?? "active";

  return (
    // top-[var(--island-top)] (appshell.css) — the SAME top edge the idle
    // pill in mobile-status-bar.tsx uses, so this live-activity pill never
    // jumps relative to the idle island it's replacing.
    <div className="pointer-events-none absolute inset-x-0 top-[var(--island-top)] z-[60] flex justify-center">
      <button
        type="button"
        disabled={!a.appId}
        onClick={() => a.appId && openAppById(a.appId)}
        className="pointer-events-auto flex min-h-[var(--island-h)] min-w-[var(--island-w)] max-w-[80%] items-center gap-2.5 rounded-full bg-black px-3.5 py-2 text-white shadow-xl disabled:cursor-default [transform-origin:top_center]"
        style={{ animation: "islandSpring 0.55s ease-out" }}
      >
        <span className="grid size-5 shrink-0 place-items-center">
          {tone === "done" ? (
            <Check className="size-4 text-emerald-400" />
          ) : tone === "error" ? (
            <X className="size-4 text-destructive" />
          ) : pct != null ? (
            <ProgressRing pct={pct} />
          ) : (
            <Loader2 className="size-4 animate-spin" />
          )}
        </span>
        <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold leading-tight">
          {a.label}
        </span>
        {a.detail && (
          <span className="shrink-0 text-[11px] font-medium tabular-nums text-white/60">
            {a.detail}
          </span>
        )}
      </button>
    </div>
  );
}

// Tiny determinate progress ring (no external dep).
function ProgressRing({ pct }: { pct: number }) {
  const r = 7;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 18 18" className="size-[18px] -rotate-90">
      <circle cx="9" cy="9" r={r} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="2.4" />
      <circle
        cx="9"
        cy="9"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct / 100)}
        className="text-primary transition-[stroke-dashoffset] duration-300"
      />
    </svg>
  );
}
