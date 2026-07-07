"use client";

import { useCallback, useEffect, useState } from "react";

// Convex `useQuery` stays `undefined` BOTH while loading AND when the backend
// is unreachable — the two are indistinguishable. After `ms` of a still-pending
// query we flag it `stalled` so a surface can offer a retry instead of an
// infinite spinner. The Convex client auto-reconnects, so `retry()` just clears
// the flag and re-arms the timer; the pending query resolves on its own once
// the backend returns. The timer is dropped the moment `loading` flips false.
export function useStalled(loading: boolean, ms = 8000) {
  const [stalled, setStalled] = useState(false);
  const [nonce, setNonce] = useState(0); // bumped by retry() to re-arm the timer

  // Reset synchronously during render (not via setState-in-effect) whenever
  // the timer's own inputs change — same "adjust state during render"
  // pattern as desktop-parts.tsx's realSpace. The setTimeout itself is a
  // genuine side effect and stays in the effect below.
  const key = `${loading}:${ms}:${nonce}`;
  const [prevKey, setPrevKey] = useState(key);
  if (key !== prevKey) {
    setPrevKey(key);
    if (stalled) setStalled(false);
  }

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setStalled(true), ms);
    return () => clearTimeout(t);
  }, [loading, ms, nonce]);

  const retry = useCallback(() => setNonce((n) => n + 1), []);
  return { stalled, retry };
}
