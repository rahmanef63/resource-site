"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createLocalStorageStore } from "../utils/storage";
import { addWidget, moveWidget, normalizeLayout, removeWidget, resetLayout, resizeWidget } from "../lib/layout-core";
import type { LayoutStore, WidgetInstance, WidgetSize } from "../types";

export interface UseLayoutApi {
  instances: WidgetInstance[];
  add: (widgetId: string, space: 0 | 1) => void;
  remove: (instanceId: string) => void;
  resize: (instanceId: string, size: WidgetSize) => void;
  move: (instanceId: string, col: number, row: number) => void;
  reset: () => void;
  ready: boolean;
}

export function useLayout(options?: { store?: LayoutStore }): UseLayoutApi {
  const storeRef = useRef<LayoutStore>(options?.store ?? createLocalStorageStore());
  const seq = useRef(0);
  const [instances, setInstances] = useState<WidgetInstance[]>(resetLayout);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = storeRef.current.load();
    if (saved?.instances.length) setInstances(normalizeLayout(saved.instances));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) storeRef.current.save({ version: 1, instances });
  }, [instances, ready]);

  const add = useCallback((widgetId: string, space: 0 | 1) => {
    const id = `${widgetId}:${(seq.current++).toString(36)}${Date.now().toString(36)}`;
    setInstances((prev) => addWidget(prev, widgetId, space, id));
  }, []);
  const remove = useCallback((id: string) => setInstances((prev) => removeWidget(prev, id)), []);
  const resize = useCallback((id: string, size: WidgetSize) => setInstances((prev) => resizeWidget(prev, id, size)), []);
  const move = useCallback((id: string, col: number, row: number) => setInstances((prev) => moveWidget(prev, id, col, row)), []);
  const reset = useCallback(() => { storeRef.current.reset(); setInstances(resetLayout()); }, []);

  return { instances, add, remove, resize, move, reset, ready };
}
