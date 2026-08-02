"use client";

import * as React from "react";

/** Set-based open state for multi-open accordions, multi-select tables, etc. */
export function useToggleSet<T>(initial: Iterable<T> = []) {
  const [set, setSet] = React.useState<Set<T>>(() => new Set(initial));
  const toggle = React.useCallback((value: T) => {
    setSet((s) => {
      const next = new Set(s);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }, []);
  const has = React.useCallback((value: T) => set.has(value), [set]);
  const clear = React.useCallback(() => setSet(new Set()), []);
  const replace = React.useCallback((values: Iterable<T>) => setSet(new Set(values)), []);
  return { set, toggle, has, clear, replace, size: set.size };
}
