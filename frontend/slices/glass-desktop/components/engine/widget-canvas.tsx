"use client";

// glass-desktop — WidgetCanvas (Build Plan §T7). Renders ONE space: resolves each
// instance against the widget registry, dense-packs it onto the 8-col grid, and
// wraps it in the glass shell + a per-widget error boundary. Unknown widgetId ->
// a "missing widget" tile, never a crash. Drag is delegated to useDragWidget; in
// edit mode each widget gains remove (×) + resize affordances backed by useLayout.
import { useCallback, useRef } from "react";
import { widgetRegistry } from "@/features/glass-desktop/lib/widget-registry";
import { GRID, SIZE_CELLS, Z } from "@/features/glass-desktop/config/constants";
import { cellToPx, packLayout, type Pinned } from "@/features/glass-desktop/utils/grid";
import { WidgetShell } from "@/features/glass-desktop/components/engine/widget-shell";
import { WidgetErrorBoundary } from "@/features/glass-desktop/components/engine/widget-error-boundary";
import { useDragWidget } from "@/features/glass-desktop/hooks/use-drag-widget";
import type { WidgetInstance, WidgetSize } from "@/features/glass-desktop/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SIZE_CYCLE: WidgetSize[] = ["SP", "S", "WP", "W", "L"];

function resolveSize(inst: WidgetInstance): WidgetSize {
  const override = inst.props?.size;
  if (typeof override === "string" && override in SIZE_CELLS) return override as WidgetSize;
  return widgetRegistry[inst.widgetId]?.size ?? "S";
}

export interface WidgetCanvasProps {
  space: 0 | 1;
  instances: WidgetInstance[];
  editMode?: boolean;
  onMove: (instanceId: string, col: number, row: number) => void;
  onRemove: (instanceId: string) => void;
  onResize: (instanceId: string, size: WidgetSize) => void;
}

export function WidgetCanvas({ space, instances, editMode = false, onMove, onRemove, onResize }: WidgetCanvasProps) {
  const ghostRef = useRef<HTMLDivElement | null>(null);

  const sized = instances
    .filter((i) => i.space === space)
    .map((inst) => {
      const def = widgetRegistry[inst.widgetId];
      const size = resolveSize(inst);
      return { inst, def, size, cells: SIZE_CELLS[size] };
    });

  // Dense-pack, keeping any already-valid position pinned (utils/grid is the SSOT).
  const pinned: Pinned = {};
  for (const s of sized) {
    const { col, row } = s.inst;
    if (Number.isInteger(col) && col >= 0 && Number.isInteger(row) && row >= 0 && col + s.cells.c <= GRID.cols) {
      pinned[s.inst.instanceId] = { col, row };
    }
  }
  const items = sized.map((s) => ({ id: s.inst.instanceId, c: s.cells.c, r: s.cells.r }));
  const placements = packLayout(items, GRID.cols, pinned);

  // Stable sizeOf for the drag hook (reads latest spans without re-subscribing).
  const spanRef = useRef(new Map<string, { c: number; r: number }>());
  spanRef.current = new Map(sized.map((s) => [s.inst.instanceId, s.cells]));
  const sizeOf = useCallback((id: string) => spanRef.current.get(id) ?? { c: 1, r: 2 }, []);
  const drag = useDragWidget({ enabled: editMode, sizeOf, onDrop: onMove, ghostRef });

  let maxBottom = 1;
  for (const s of sized) maxBottom = Math.max(maxBottom, placements[s.inst.instanceId].row + s.cells.r);
  const width = GRID.cols * GRID.cellW + (GRID.cols - 1) * GRID.gap;
  const height = maxBottom * (GRID.cellH + GRID.gap) - GRID.gap;

  return (
    <div className="relative mx-auto" style={{ width, minHeight: Math.max(height, GRID.cellH) }}>
      {/* Single snap-target ghost, positioned imperatively by the drag hook. */}
      <div
        ref={ghostRef}
        aria-hidden
        style={{
          position: "absolute",
          display: "none",
          pointerEvents: "none",
          zIndex: Z.drag - 1,
          border: "1.5px dashed var(--color-hairline-hover)",
          background: "var(--color-glass-lo)",
        }}
      />
      {sized.map(({ inst, def, size, cells }) => {
        const p = placements[inst.instanceId];
        const rect = cellToPx(p.col, p.row, cells.c, cells.r);
        const pill = cells.r === 1;
        const Widget = def?.component;
        return (
          <div
            key={inst.instanceId}
            data-instance={inst.instanceId}
            onPointerDown={editMode ? (e) => drag.onPointerDown(inst.instanceId, e) : undefined}
            className={cn(
              "absolute",
              editMode && "cursor-grab",
              "motion-safe:transition-[left,top]",
              "motion-safe:[transition-duration:var(--duration-settle)]",
              "motion-safe:[transition-timing-function:var(--ease-settle)]",
            )}
            style={{
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
              zIndex: Z.widget,
              touchAction: editMode ? "none" : undefined,
            }}
          >
            <WidgetErrorBoundary instanceId={inst.instanceId}>
              <WidgetShell title={def?.title ?? "Missing widget"} pill={pill} className="h-full w-full">
                {Widget ? (
                  <Widget instanceId={inst.instanceId} {...def?.defaultProps} {...inst.props} />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
                    <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-ink-mid)" }}>
                      Missing widget
                    </span>
                    <span
                      className="max-w-full truncate text-[11px]"
                      style={{ color: "var(--color-ink-low)", fontFamily: "var(--font-numeric)" }}
                      title={inst.widgetId}
                    >
                      {inst.widgetId}
                    </span>
                  </div>
                )}
                {editMode ? (
                  <div className="absolute right-1.5 top-1.5 z-10 flex gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Resize ${def?.title ?? inst.widgetId}`}
                      className="size-6 rounded-full [background:var(--color-glass-solid)]"
                      onClick={() => onResize(inst.instanceId, SIZE_CYCLE[(SIZE_CYCLE.indexOf(size) + 1) % SIZE_CYCLE.length])}
                    >
                      <span aria-hidden style={{ color: "var(--color-ink-mid)" }}>
                        ⤢
                      </span>
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Remove ${def?.title ?? inst.widgetId}`}
                      className="size-6 rounded-full [background:var(--color-glass-solid)]"
                      onClick={() => onRemove(inst.instanceId)}
                    >
                      <span aria-hidden style={{ color: "var(--color-accent-coral)" }}>
                        ×
                      </span>
                    </Button>
                  </div>
                ) : null}
              </WidgetShell>
            </WidgetErrorBoundary>
          </div>
        );
      })}
    </div>
  );
}
