import { GRID, SIZE_CELLS } from "../config/constants";
import { defaultLayout } from "../config/default-layout.seed";
import type { WidgetCatalog, WidgetInstance, WidgetSize } from "../types";
import { packLayout, type Pinned } from "../utils/grid";
import { widgetCatalog } from "./widget-catalog";

const SPACES = [0, 1] as const;

export function resolveWidgetSize(instance: WidgetInstance, catalog: WidgetCatalog = widgetCatalog): WidgetSize {
  const override = instance.props?.size;
  if (typeof override === "string" && override in SIZE_CELLS) return override as WidgetSize;
  return catalog[instance.widgetId]?.size ?? "S";
}

export function widgetCells(instance: WidgetInstance, catalog: WidgetCatalog = widgetCatalog) {
  return SIZE_CELLS[resolveWidgetSize(instance, catalog)];
}

function isValidPosition(col: number, row: number, width: number): boolean {
  return Number.isInteger(col) && col >= 0 && Number.isInteger(row) && row >= 0 && col + width <= GRID.cols;
}

function validPinned(all: WidgetInstance[], space: 0 | 1, exclude?: string): Pinned {
  const pins: Pinned = {};
  for (const item of all) {
    if (item.space !== space || item.instanceId === exclude) continue;
    if (isValidPosition(item.col, item.row, widgetCells(item).c)) pins[item.instanceId] = { col: item.col, row: item.row };
  }
  return pins;
}

export function packSpace(all: WidgetInstance[], space: 0 | 1, pins = validPinned(all, space)): WidgetInstance[] {
  const items = all.filter((item) => item.space === space).map((item) => ({ id: item.instanceId, ...widgetCells(item) }));
  const positions = packLayout(items, GRID.cols, pins);
  return all.map((item) => item.space === space ? { ...item, ...positions[item.instanceId] } : item);
}

export function normalizeLayout(instances: WidgetInstance[]): WidgetInstance[] {
  let next: WidgetInstance[] = instances.map((item) => ({ ...item, ...(item.props ? { props: { ...item.props } } : {}) }));
  for (const space of SPACES) next = packSpace(next, space, validPinned(next, space));
  return next;
}

export function addWidget(instances: WidgetInstance[], widgetId: string, space: 0 | 1, instanceId: string): WidgetInstance[] {
  const next = [...instances, { instanceId, widgetId, space, col: -1, row: -1 }];
  return packSpace(next, space, validPinned(next, space));
}

export function removeWidget(instances: WidgetInstance[], instanceId: string): WidgetInstance[] {
  const space = instances.find((item) => item.instanceId === instanceId)?.space;
  const next = instances.filter((item) => item.instanceId !== instanceId);
  return space === undefined ? next : packSpace(next, space, validPinned(next, space));
}

export function resizeWidget(instances: WidgetInstance[], instanceId: string, size: WidgetSize): WidgetInstance[] {
  const space = instances.find((item) => item.instanceId === instanceId)?.space;
  const next = instances.map((item) => item.instanceId === instanceId ? { ...item, props: { ...item.props, size } } : item);
  return space === undefined ? next : packSpace(next, space, validPinned(next, space, instanceId));
}

export function moveWidget(instances: WidgetInstance[], instanceId: string, col: number, row: number): WidgetInstance[] {
  const space = instances.find((item) => item.instanceId === instanceId)?.space;
  return space === undefined ? instances : packSpace(instances, space, { [instanceId]: { col, row } });
}

export function resetLayout(): WidgetInstance[] {
  return normalizeLayout(defaultLayout.instances);
}
