"use client";

import { useEffect } from "react";
import { startScreencast } from "./screencast-core";

export function useScreencast(opts: {
  consumer: string;
  consumerRef: { current: string };
  liveRef: { current: boolean };
  setLive: (live: boolean) => void;
  setFrame: (blob: Blob) => void;
}) {
  const { consumer, consumerRef, liveRef, setLive, setFrame } = opts;
  useEffect(
    () =>
      startScreencast({
        consumer,
        isCurrent: () => consumerRef.current === consumer,
        setLive: (live) => {
          liveRef.current = live;
          setLive(live);
        },
        setFrame,
      }),
    [consumer, consumerRef, liveRef, setLive, setFrame],
  );
}
