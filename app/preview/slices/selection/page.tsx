"use client";

import { SelectionCanvas } from "./SelectionCanvas";

/** Full-bleed canvas preview for the selection slice — shows marquee select
 *  AND full CRUD on the selected content (not just selecting). */
export default function Page() {
  return (
    <main className="flex min-h-screen w-full flex-col gap-4 bg-background p-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">Selection — marquee + CRUD on a canvas</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Empty canvas with floating nodes. <b>Create</b>: Add node / double-click
          the canvas. <b>Update</b>: drag the grip to move, type to edit.
          <b> Delete</b>: ✕ or select + Backspace. <b>Select</b>: hold-drag a
          marquee — drag <b>right</b> to enclose (blue ring), <b>left</b> to cross
          (dashed green). Selected nodes get a ring; the floating toolbar can
          Duplicate / Delete the whole selection.
        </p>
      </header>
      <SelectionCanvas />
    </main>
  );
}
