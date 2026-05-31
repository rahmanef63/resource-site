"use client";

import { memo, useRef } from "react";
import { cn } from "@/lib/utils";
import { useWindow, useFocused } from "../hooks/use-shell";
import { useWindowDrag } from "../hooks/use-window-drag";
import {
  closeWindow,
  minimizeWindow,
  toggleMaximize,
  focusWindow,
  snapRect,
} from "../lib/store";
import { TrafficLights } from "./traffic-lights";
import { WindowContent } from "./window-content";
import type { WinId } from "../lib/types";

// Subscribes to ONE window — a drag on another window never re-renders this.
export const Window = memo(function Window({ id }: { id: WinId }) {
  const win = useWindow(id);
  const focused = useFocused() === id;
  const ref = useRef<HTMLDivElement>(null);
  const { startDrag, startResize, zone } = useWindowDrag(id, ref);

  if (!win || win.minimized) return null;
  const preview = zone ? snapRect(zone) : null;

  return (
    <>
      {preview && (
        // absolute (not fixed): the preview is a child of the desktop surface, so
        // it shares the same coordinate space as the snapped window — they align.
        <div
          className="absolute z-[5] rounded-xl border-2 border-primary bg-primary/20"
          style={{ left: preview.x, top: preview.y, width: preview.w, height: preview.h }}
        />
      )}
      <div
        ref={ref}
        className={cn(
          "absolute flex flex-col overflow-hidden rounded-[var(--radius-win)] border border-border bg-card shadow-[var(--shadow-win)]",
          focused ? "z-50" : "z-10",
        )}
        style={{ left: win.x, top: win.y, width: win.w, height: win.h }}
        onMouseDown={() => focusWindow(id)}
      >
        <div
          className="glass flex h-[38px] shrink-0 cursor-grab items-center gap-2 border-b border-border px-3 active:cursor-grabbing"
          style={{ background: "var(--window-head)" }}
          onPointerDown={startDrag}
          onDoubleClick={() => toggleMaximize(id)}
        >
          <TrafficLights
            onClose={() => closeWindow(id)}
            onMinimize={() => minimizeWindow(id)}
            onMaximize={() => toggleMaximize(id)}
          />
          <div className="pointer-events-none flex-1 truncate text-center text-[13px] font-semibold text-muted-foreground">
            {win.title}
          </div>
          <div className="min-w-[54px]" />
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-background [container-type:inline-size]">
          <WindowContent app={win.app} payload={win.payload} />
        </div>

        <Handle cls="left-0 top-0 h-full w-2 cursor-ew-resize" onDown={(e) => startResize(e, "l")} />
        <Handle cls="right-0 top-0 h-full w-2 cursor-ew-resize" onDown={(e) => startResize(e, "r")} />
        <Handle cls="bottom-0 left-0 h-2 w-full cursor-ns-resize" onDown={(e) => startResize(e, "b")} />
        <Handle cls="bottom-0 right-0 size-4 cursor-nwse-resize" onDown={(e) => startResize(e, "br")} />
      </div>
    </>
  );
});

function Handle({
  cls,
  onDown,
}: {
  cls: string;
  onDown: (e: React.PointerEvent) => void;
}) {
  return <div className={cn("absolute z-[5]", cls)} onPointerDown={onDown} />;
}
