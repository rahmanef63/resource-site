"use client";

// glass-desktop — layout state hook (Build Plan §T7). Single source of truth for
// WidgetInstance[] across both spaces. Every mutation re-packs the affected space
// with utils/grid packLayout (dense, no-overlap) and persists the whole state via
// the LayoutStore. Positions are always valid after a mutation; instances that
// arrive without a valid position simply flow into the first free slot.
import { useCallback, useEffect, useRef, useState } from "react";
import { widgetRegistry } from "@/features/glass-desktop/lib/widget-registry";
import { createLocalStorageStore } from "@/features/glass-desktop/utils/storage";
import { defaultLayout } from "@/features/glass-desktop/config/default-layout.seed";
import { GRID, SIZE_CELLS } from "@/features/glass-desktop/config/constants";
import { packLayout, type Pinned } from "@/features/glass-desktop/utils/grid";
import type { LayoutStore, WidgetInstance, WidgetSize } from "@/features/glass-desktop/types";

const SPACES = [0, 1] as const;

/** Effective cell span: per-instance size override → registry default → S. */
function cellsOf(inst: WidgetInstance): { c: number; r: number } {
  const override = inst.props?.size;
  const size: WidgetSize =
    typeof override === "string" && override in SIZE_CELLS
      ? (override as WidgetSize)
      : (widgetRegistry[inst.widgetId]?.size ?? "S");
  return SIZE_CELLS[size];
}

function isValidPos(col: number, row: number, c: number): boolean {
  return Number.isInteger(col) && col >= 0 && Number.isInteger(row) && row >= 0 && col + c <= GRID.cols;
}

/** Pinned map of every in-space instance that already holds a valid cell. */
function validPinned(all: WidgetInstance[], space: 0 | 1, exclude?: string): Pinned {
  const out: Pinned = {};
  for (const i of all) {
    if (i.space !== space || i.instanceId === exclude) continue;
    if (isValidPos(i.col, i.row, cellsOf(i).c)) out[i.instanceId] = { col: i.col, row: i.row };
  }
  return out;
}

/** Re-pack one space with the given pins; unpinned instances flow densely. */
function packSpace(all: WidgetInstance[], space: 0 | 1, pinned: Pinned): WidgetInstance[] {
  const items = all
    .filter((i) => i.space === space)
    .map((i) => ({ id: i.instanceId, ...cellsOf(i) }));
  const pos = packLayout(items, GRID.cols, pinned);
  return all.map((i) => (i.space === space ? { ...i, col: pos[i.instanceId].col, row: pos[i.instanceId].row } : i));
}

/** Normalize both spaces (used on load / reset). */
function packAll(instances: WidgetInstance[]): WidgetInstance[] {
  let out = instances;
  for (const s of SPACES) out = packSpace(out, s, validPinned(out, s));
  return out;
}

export interface UseLayoutApi {
  instances: WidgetInstance[];
  add: (widgetId: string, space: 0 | 1) => void;
  remove: (instanceId: string) => void;
  resize: (instanceId: string, size: WidgetSize) => void;
  move: (instanceId: string, col: number, row: number) => void;
  reset: () => void;
  /** False until storage has been read on the client (avoids hydration drift). */
  ready: boolean;
}

export function useLayout(options?: { store?: LayoutStore }): UseLayoutApi {
  const storeRef = useRef<LayoutStore>(options?.store ?? createLocalStorageStore());
  const seq = useRef(0);
  // Deterministic first paint (server + hydration) = packed default seed.
  const [instances, setInstances] = useState<WidgetInstance[]>(() => packAll(defaultLayout.instances));
  const [ready, setReady] = useState(false);

  // Read persisted layout after mount; fall back to the seed when empty/corrupt.
  useEffect(() => {
    const saved = storeRef.current.load();
    if (saved && saved.instances.length > 0) setInstances(packAll(saved.instances));
    setReady(true);
  }, []);

  // Persist every committed change (skip the pre-hydration seed).
  useEffect(() => {
    if (ready) storeRef.current.save({ version: 1, instances });
  }, [instances, ready]);

  const spaceOf = useCallback(
    (id: string, list: WidgetInstance[]): 0 | 1 | undefined => list.find((i) => i.instanceId === id)?.space,
    [],
  );

  const add = useCallback((widgetId: string, space: 0 | 1) => {
    setInstances((prev) => {
      const inst: WidgetInstance = {
        instanceId: `${widgetId}:${(seq.current++).toString(36)}${Date.now().toString(36)}`,
        widgetId,
        space,
        col: -1,
        row: -1,
      };
      const next = [...prev, inst];
      return packSpace(next, space, validPinned(next, space)); // new one flows in
    });
  }, []);

  const remove = useCallback(
    (instanceId: string) => {
      setInstances((prev) => {
        const space = spaceOf(instanceId, prev);
        const next = prev.filter((i) => i.instanceId !== instanceId);
        return space === undefined ? next : packSpace(next, space, validPinned(next, space));
      });
    },
    [spaceOf],
  );

  const resize = useCallback(
    (instanceId: string, size: WidgetSize) => {
      setInstances((prev) => {
        const space = spaceOf(instanceId, prev);
        const next = prev.map((i) =>
          i.instanceId === instanceId ? { ...i, props: { ...i.props, size } } : i,
        );
        // Pin everyone but the resized one so it reflows to a slot that fits.
        return space === undefined ? next : packSpace(next, space, validPinned(next, space, instanceId));
      });
    },
    [spaceOf],
  );

  const move = useCallback(
    (instanceId: string, col: number, row: number) => {
      setInstances((prev) => {
        const space = spaceOf(instanceId, prev);
        if (space === undefined) return prev;
        // Pin the dropped widget; the rest of the space reflows around it.
        return packSpace(prev, space, { [instanceId]: { col, row } });
      });
    },
    [spaceOf],
  );

  const reset = useCallback(() => {
    storeRef.current.reset();
    setInstances(packAll(defaultLayout.instances));
  }, []);

  return { instances, add, remove, resize, move, reset, ready };
}
