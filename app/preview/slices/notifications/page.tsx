"use client";

import * as React from "react";
import { NotifyMePopover } from "@/features/notifications";

/** Minimal interactive preview: bell button → frequency popover.
 *  Per-page subscription state persisted to localStorage. */
export default function Page() {
  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center gap-4 bg-background p-6">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Per-page subscription
        </p>
        <h1 className="text-2xl font-semibold">Notify me primitive</h1>
        <p className="text-sm text-muted-foreground">
          Click the bell. Pick a cadence. State persists in localStorage.
        </p>
      </div>
      <NotifyMePopover pageId="preview-notifications" />
    </main>
  );
}
