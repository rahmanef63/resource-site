"use client";

// Mock stand-in for the remote view, shown when a host's configureBrowserMode
// reports `live: false`. The Browser drives a REAL headless browser — there is
// nothing useful to fake against a missing backend, so instead of polling
// endpoints that don't exist we park on this notice. (Unwired, the slice never
// shows this: the bundled offline demo adapter keeps the chrome live.)
import { Globe } from "lucide-react";

export function MockPane({ demo }: { demo: boolean }) {
  return (
    <div className="grid size-full place-items-center bg-background p-6">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <div className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <Globe className="size-6" />
        </div>
        <p className="text-sm font-medium">Browser needs the live host</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {demo
            ? "This demo runs on mock data — the Browser drives a real headless browser on the host, so there's nothing to show here."
            : "You're on mock data. Switch the server target to Live (or wire configureBrowser) to drive the headless browser."}
        </p>
      </div>
    </div>
  );
}
