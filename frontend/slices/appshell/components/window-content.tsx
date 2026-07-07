"use client";

import { useEffect, useState, type ComponentType } from "react";
import { useApp } from "../lib/registry";
import { AppErrorBoundary } from "./app-error-boundary";
import { OsSpinner } from "./os-spinner";
import type { AppProps } from "../lib/types";

// Loads an app's lazy bundle into a window. We use a plain useState/useEffect
// loader instead of React.lazy + Suspense on purpose: window opens are driven by
// the synchronous external store (useSyncExternalStore), and a Suspense boundary
// that suspends in that path can miss its retry "ping" — the chunk resolves but
// the fallback only clears on the NEXT render (e.g. when the user clicks the
// window). A setState on import-resolve always re-renders, so the spinner clears
// the instant the module is ready. The import is bundler-cached (and warmed on
// dock hover), so this stays cheap.
export function WindowContent({ app, payload }: { app: string; payload?: unknown }) {
  const descriptor = useApp(app);
  // Keyed by app id: when the window switches app the stale module no longer
  // matches, so `Comp` derives back to null (spinner) without a synchronous
  // setState reset in the effect (react-hooks/set-state-in-effect).
  const [loaded, setLoaded] = useState<{ key: string; Comp: ComponentType<AppProps> } | null>(null);
  const Comp = loaded?.key === app ? loaded.Comp : null;

  useEffect(() => {
    if (!descriptor) return;
    let alive = true;
    descriptor
      .load()
      .then((m) => alive && setLoaded({ key: app, Comp: m.default }))
      .catch(() => {
        /* leave the spinner; a failed chunk import is caught by the SW recovery */
      });
    return () => {
      alive = false;
    };
  }, [descriptor, app]);

  if (!descriptor) {
    return (
      <div className="grid h-full place-items-center text-sm text-muted-foreground">
        Unknown app: {app}
      </div>
    );
  }

  if (!Comp) {
    return (
      <div className="grid h-full place-items-center text-muted-foreground">
        <OsSpinner />
      </div>
    );
  }

  // A crashing app is contained to its own window (recoverable) instead of
  // taking down the whole shell.
  return (
    <AppErrorBoundary resetKey={app}>
      <Comp payload={payload} />
    </AppErrorBoundary>
  );
}
