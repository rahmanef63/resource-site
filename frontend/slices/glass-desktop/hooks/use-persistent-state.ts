"use client";
// glass-desktop — useState mirrored into a localStorage key. SSR-safe: first
// render always returns `seed` (matches server HTML), then hydrates from
// storage on mount. Every read safe-parses and falls back to seed.
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

function safeRead<T>(key: string, seed: T): T {
  if (typeof window === "undefined") return seed;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return seed;
    return JSON.parse(raw) as T;
  } catch {
    return seed; // corrupt / blocked → seed.
  }
}

/**
 * SSR-safe persistent state. Returns the standard [value, setValue] tuple.
 * Reads storage once after mount (avoids hydration mismatch), writes on change.
 */
export function usePersistentState<T>(key: string, seed: T): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(seed);
  const hydrated = useRef(false);

  // Hydrate from storage after mount, keyed only on `key` so a changing seed
  // reference doesn't re-trigger a read.
  useEffect(() => {
    setState(safeRead(key, seed));
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Persist on every change, but not before the initial hydrate has run (else
  // we'd clobber stored data with the seed).
  useEffect(() => {
    if (!hydrated.current || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // quota / private-mode — non-critical, skip.
    }
  }, [key, state]);

  return [state, setState];
}
