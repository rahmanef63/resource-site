"use client";

// BroadcastChannel + localStorage hybrid sync hook.
// Source-of-truth = caller's React state; this hook just rebroadcasts changes
// to other tabs/iframes of the same origin.

import { useEffect, useRef, useState } from "react";

export function useBroadcastSync<T>(channelName: string, initial: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(initial);
  const chRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const ch = new BroadcastChannel(channelName);
    chRef.current = ch;
    ch.onmessage = (e) => setValue(e.data as T);
    return () => ch.close();
  }, [channelName]);

  function set(v: T) {
    setValue(v);
    chRef.current?.postMessage(v);
  }

  return [value, set];
}
