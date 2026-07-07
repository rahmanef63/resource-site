// glass-desktop — pure grid geometry + dense bin-packer (Build Plan §4).
// Ported from ui_kits/desktop/v4.html packLayout + SpaceCanvas snap math.
// NO React, NO DOM — deterministic cell↔pixel math only.
import { GRID } from "@/features/glass-desktop/config/constants";

/** An item to place: id + cell span. */
export interface GridItem {
  id: string;
  c: number; // column span (cells)
  r: number; // row span (cells)
}

/** A 0-based grid coordinate. */
export interface Cell {
  col: number;
  row: number;
}

/** A placed rectangle in cell units. */
export interface CellRect extends Cell {
  c: number;
  r: number;
}

/** A rectangle in pixels (canvas-absolute). */
export interface PixelRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** id → placed cell. */
export type Placement = Record<string, Cell>;

/** Where a caller wants specific ids pinned before the pack fills the rest. */
export type Pinned = Record<string, Cell>;

/**
 * Dense top-left bin-pack. Pinned ids are marked first (kept exactly where the
 * caller put them, e.g. mid-drag), then remaining items flow into the first
 * free slot scanning row-major. Guarantees no overlap and every item ≤ cols.
 */
export function packLayout(items: GridItem[], cols: number, pinned?: Pinned): Placement {
  const occ: boolean[][] = [];
  const fits = (col: number, row: number, cw: number, ch: number): boolean => {
    if (col < 0 || col + cw > cols) return false;
    for (let y = row; y < row + ch; y++) {
      for (let x = col; x < col + cw; x++) {
        if (occ[y] && occ[y][x]) return false;
      }
    }
    return true;
  };
  const mark = (col: number, row: number, cw: number, ch: number): void => {
    for (let y = row; y < row + ch; y++) {
      occ[y] = occ[y] || [];
      for (let x = col; x < col + cw; x++) occ[y][x] = true;
    }
  };

  const pos: Placement = {};
  if (pinned) {
    for (const it of items) {
      const p = pinned[it.id];
      if (!p) continue;
      const col = Math.max(0, Math.min(cols - it.c, p.col));
      const row = Math.max(0, p.row);
      mark(col, row, it.c, it.r);
      pos[it.id] = { col, row };
    }
  }
  for (const it of items) {
    if (pos[it.id]) continue;
    let placed = false;
    for (let row = 0; !placed; row++) {
      for (let col = 0; col <= cols - it.c; col++) {
        if (fits(col, row, it.c, it.r)) {
          mark(col, row, it.c, it.r);
          pos[it.id] = { col, row };
          placed = true;
          break;
        }
      }
    }
  }
  return pos;
}

/** Cell rect → absolute pixel rect using the one canonical GRID. */
export function cellToPx(col: number, row: number, c: number, r: number): PixelRect {
  const { cellW, cellH, gap } = GRID;
  return {
    left: col * (cellW + gap),
    top: row * (cellH + gap),
    width: c * cellW + (c - 1) * gap,
    height: r * cellH + (r - 1) * gap,
  };
}

/** Snap a canvas-absolute pixel point to its nearest cell (per-axis rounding). */
export function snap(point: { x: number; y: number }): Cell {
  return {
    col: Math.round(point.x / (GRID.cellW + GRID.gap)),
    row: Math.round(point.y / (GRID.cellH + GRID.gap)),
  };
}

/** Clamp a cell position so a c×r item stays inside the column band (rows ≥ 0). */
export function clamp(col: number, row: number, c: number, r: number, cols: number = GRID.cols): Cell {
  return {
    col: Math.max(0, Math.min(cols - c, col)),
    row: Math.max(0, row),
  };
}

/** True when two cell rects overlap (touching edges do NOT collide). */
export function collide(a: CellRect, b: CellRect): boolean {
  return a.col < b.col + b.c && a.col + a.c > b.col && a.row < b.row + b.r && a.row + a.r > b.row;
}

/**
 * Nearest free landing cell for a c×r item near `target`, avoiding every
 * `occupied` rect. Scans row-major within the band and returns the fitting
 * cell closest (squared cell distance) to the target. Falls back to a clamped
 * target if the band is somehow full.
 */
export function nearestFree(
  occupied: CellRect[],
  cols: number,
  target: Cell,
  size: { c: number; r: number },
): Cell {
  const { c, r } = size;
  const fitsAt = (col: number, row: number): boolean => {
    if (col < 0 || row < 0 || col + c > cols) return false;
    const cand: CellRect = { col, row, c, r };
    return !occupied.some((o) => collide(cand, o));
  };
  let maxRow = Math.max(0, target.row) + r;
  for (const o of occupied) maxRow = Math.max(maxRow, o.row + o.r);

  let best: Cell | null = null;
  let bestD = Infinity;
  for (let row = 0; row <= maxRow; row++) {
    for (let col = 0; col + c <= cols; col++) {
      if (!fitsAt(col, row)) continue;
      const dx = col - target.col;
      const dy = row - target.row;
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = { col, row };
      }
    }
  }
  return best ?? clamp(target.col, target.row, c, r, cols);
}
