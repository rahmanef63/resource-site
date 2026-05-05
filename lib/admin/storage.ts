"use client";

import * as React from "react";

const PREFIX = "kitab-admin:";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function useAdminState<T>(key: string, defaults: T): [T, (next: T | ((p: T) => T)) => void, () => void] {
  const [state, setState] = React.useState<T>(defaults);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setState(read(key, defaults));
    setHydrated(true);
  }, [key]);

  const update = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      setState((prev) => {
        const value = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        write(key, value);
        return value;
      });
    },
    [key]
  );

  const reset = React.useCallback(() => {
    if (typeof window !== "undefined") window.localStorage.removeItem(PREFIX + key);
    setState(defaults);
  }, [key, defaults]);

  return [hydrated ? state : defaults, update, reset];
}
