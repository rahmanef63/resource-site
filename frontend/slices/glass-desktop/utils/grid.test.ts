import { describe, expect, it } from "vitest";
import { GRID } from "@/features/glass-desktop/config/constants";
import {
  cellToPx,
  clamp,
  collide,
  nearestFree,
  packLayout,
  snap,
  type CellRect,
  type GridItem,
} from "./grid";

const items: GridItem[] = [
  { id: "clock", c: 2, r: 1 },
  { id: "date", c: 1, r: 2 },
  { id: "weather", c: 1, r: 2 },
  { id: "toggles", c: 2, r: 1 },
  { id: "tasks", c: 2, r: 2 },
  { id: "world", c: 2, r: 2 },
  { id: "eq", c: 1, r: 1 },
];

const rect = (id: string, pos: { col: number; row: number }, it: GridItem): CellRect => ({
  col: pos.col,
  row: pos.row,
  c: it.c,
  r: it.r,
});

describe("packLayout", () => {
  it("places every item with no overlap and inside the column band", () => {
    const cols = GRID.cols;
    const placed = packLayout(items, cols);
    const rects = items.map((it) => rect(it.id, placed[it.id], it));

    // all inside band
    for (const rc of rects) {
      expect(rc.col).toBeGreaterThanOrEqual(0);
      expect(rc.row).toBeGreaterThanOrEqual(0);
      expect(rc.col + rc.c).toBeLessThanOrEqual(cols);
    }
    // pairwise no-overlap
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        expect(collide(rects[i], rects[j])).toBe(false);
      }
    }
  });

  it("honors pinned positions and packs the rest around them", () => {
    const placed = packLayout(items, GRID.cols, { tasks: { col: 3, row: 0 } });
    expect(placed.tasks).toEqual({ col: 3, row: 0 });
    const rects = items.map((it) => rect(it.id, placed[it.id], it));
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        expect(collide(rects[i], rects[j])).toBe(false);
      }
    }
  });

  it("packs dense — first item lands top-left", () => {
    const placed = packLayout(items, GRID.cols);
    expect(placed.clock).toEqual({ col: 0, row: 0 });
  });
});

describe("cellToPx", () => {
  it("maps cells to pixels using GRID", () => {
    const { cellW, cellH, gap } = GRID;
    expect(cellToPx(0, 0, 1, 1)).toEqual({ left: 0, top: 0, width: cellW, height: cellH });
    expect(cellToPx(2, 1, 2, 2)).toEqual({
      left: 2 * (cellW + gap),
      top: 1 * (cellH + gap),
      width: 2 * cellW + gap,
      height: 2 * cellH + gap,
    });
  });
});

describe("snap", () => {
  const stepX = GRID.cellW + GRID.gap;
  const stepY = GRID.cellH + GRID.gap;

  it("rounds a pixel point to the nearest cell per axis", () => {
    expect(snap({ x: 0, y: 0 })).toEqual({ col: 0, row: 0 });
    expect(snap({ x: stepX * 2, y: stepY * 3 })).toEqual({ col: 2, row: 3 });
  });

  it("rounds toward the closer cell boundary", () => {
    expect(snap({ x: stepX * 1.4, y: stepY * 1.6 })).toEqual({ col: 1, row: 2 });
    expect(snap({ x: stepX * 0.49, y: stepY * 0.51 })).toEqual({ col: 0, row: 1 });
  });
});

describe("clamp", () => {
  it("keeps a c×r item inside the column band and rows ≥ 0", () => {
    expect(clamp(-3, -2, 2, 2, 8)).toEqual({ col: 0, row: 0 });
    expect(clamp(9, 4, 2, 2, 8)).toEqual({ col: 6, row: 4 });
  });
});

describe("collide", () => {
  const a: CellRect = { col: 0, row: 0, c: 2, r: 2 };
  it("detects overlap", () => {
    expect(collide(a, { col: 1, row: 1, c: 2, r: 2 })).toBe(true);
  });
  it("treats touching edges as non-colliding", () => {
    expect(collide(a, { col: 2, row: 0, c: 2, r: 2 })).toBe(false);
    expect(collide(a, { col: 0, row: 2, c: 2, r: 2 })).toBe(false);
  });
  it("detects fully separate rects as non-colliding", () => {
    expect(collide(a, { col: 5, row: 5, c: 1, r: 1 })).toBe(false);
  });
});

describe("nearestFree", () => {
  it("returns the target when it is already free", () => {
    const occ: CellRect[] = [{ col: 0, row: 0, c: 2, r: 2 }];
    expect(nearestFree(occ, 8, { col: 4, row: 0 }, { c: 2, r: 2 })).toEqual({ col: 4, row: 0 });
  });

  it("finds the closest non-colliding cell when target is occupied", () => {
    const occ: CellRect[] = [{ col: 2, row: 0, c: 2, r: 2 }];
    const spot = nearestFree(occ, 8, { col: 2, row: 0 }, { c: 2, r: 2 });
    // must fit and not collide with the occupant
    expect(collide({ ...spot, c: 2, r: 2 }, occ[0])).toBe(false);
    expect(spot.col + 2).toBeLessThanOrEqual(8);
    expect(spot.col).toBeGreaterThanOrEqual(0);
    expect(spot.row).toBeGreaterThanOrEqual(0);
  });

  it("never returns a cell that overflows the column band", () => {
    const occ: CellRect[] = [];
    const spot = nearestFree(occ, 8, { col: 20, row: 0 }, { c: 2, r: 2 });
    expect(spot.col + 2).toBeLessThanOrEqual(8);
  });
});
