"use client";
/* Android 12+ app-open splash (P4 android-app-open-splash) — a brief
   full-screen surface in the launching app's own brand color/gradient with a
   centered icon, held ~450ms then faded before the real window content
   takes over. One call site (android-shell.tsx's launch()), so plain local
   state + two timeouts is enough — no reusable splash system needed. */
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { AppIcon } from "../../app-icon";
import type { AppDescriptor } from "../../../lib/types";

const HOLD_MS = 450;
const FADE_MS = 166;

export function useAppOpenSplash() {
  const [splash, setSplash] = useState<{ app: AppDescriptor; leaving: boolean } | null>(null);
  const timers = useRef<number[]>([]);
  const show = (app: AppDescriptor) => {
    timers.current.forEach((t) => window.clearTimeout(t));
    setSplash({ app, leaving: false });
    timers.current = [
      window.setTimeout(() => setSplash((s) => (s ? { ...s, leaving: true } : s)), HOLD_MS),
      window.setTimeout(() => setSplash(null), HOLD_MS + FADE_MS),
    ];
  };
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  return { splash, show };
}

// Held state rides the android kit's own M3 emphasized-decelerate appOpen
// keyframe; the release just cross-fades out via the shared animate-out/
// fade-out-0 utilities (globals.css) so the icon doesn't snap away.
export function AppOpenSplash({ app, leaving }: { app: AppDescriptor; leaving: boolean }) {
  return (
    <div
      aria-hidden
      style={{ background: app.gradient, "--tw-duration": `${FADE_MS}ms` } as React.CSSProperties}
      className={cn(
        "absolute inset-0 z-[26] grid place-items-center",
        leaving ? "animate-out fade-out-0" : "[animation:appOpen_.45s_cubic-bezier(.05,.7,.1,1)]",
      )}
    >
      <span className="size-24 drop-shadow-lg"><AppIcon app={app} /></span>
    </div>
  );
}
