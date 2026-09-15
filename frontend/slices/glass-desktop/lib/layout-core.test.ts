import { describe, expect, it } from "vitest";
import { GRID, SIZE_CELLS } from "../config/constants";
import { defaultLayout } from "../config/default-layout.seed";
import { widgetCatalog, widgetDescriptors } from "./widget-catalog";
import {
  addWidget,
  moveWidget,
  normalizeLayout,
  removeWidget,
  resetLayout,
  resizeWidget,
  widgetCells,
} from "./layout-core";
import { collide, type CellRect } from "../utils/grid";
import type { WidgetInstance } from "../types";

function expectValid(items: WidgetInstance[]) {
  for (const space of [0, 1] as const) {
    const inSpace = items.filter((item) => item.space === space);
    const rects: CellRect[] = inSpace.map((item) => ({ ...item, ...widgetCells(item) }));
    for (const rect of rects) {
      expect(rect.col).toBeGreaterThanOrEqual(0);
      expect(rect.row).toBeGreaterThanOrEqual(0);
      expect(rect.col + rect.c).toBeLessThanOrEqual(GRID.cols);
    }
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) expect(collide(rects[i]!, rects[j]!)).toBe(false);
    }
  }
}

describe("glass desktop portable catalog + layout core", () => {
  it("keeps one 47-widget catalog and the 50-instance two-space seed", () => {
    expect(widgetDescriptors).toHaveLength(47);
    expect(Object.keys(widgetCatalog)).toHaveLength(47);
    expect(defaultLayout.instances).toHaveLength(50);
    for (const item of defaultLayout.instances) expect(widgetCatalog[item.widgetId as keyof typeof widgetCatalog]).toBeDefined();
  });

  it("normalizes the default seed deterministically without overlap", () => {
    const a = normalizeLayout(defaultLayout.instances);
    const b = normalizeLayout(defaultLayout.instances);
    expect(a).toEqual(b);
    expectValid(a);
  });

  it("shares deterministic add, move, resize, remove and reset semantics", () => {
    let state: WidgetInstance[] = [];
    state = addWidget(state, "clock-digital", 0, "clock:1");
    expect(state[0]).toMatchObject({ instanceId: "clock:1", col: 0, row: 0 });
    state = moveWidget(state, "clock:1", 4, 3);
    expect(state[0]).toMatchObject({ col: 4, row: 3 });
    state = resizeWidget(state, "clock:1", "L");
    expect(state[0]?.props?.size).toBe("L");
    expect(widgetCells(state[0]!)).toEqual(SIZE_CELLS.L);
    expectValid(state);
    state = removeWidget(state, "clock:1");
    expect(state).toEqual([]);
    const reset = resetLayout();
    expect(reset).toHaveLength(50);
    expectValid(reset);
  });
});
