"use client";
// glass-desktop — THE single clock (Build Plan §7 "One clock").
// ClockProvider owns ONE 1 Hz setInterval for the whole desktop and fans it out
// on two channels: "second" (every tick) and "minute" (only when the minute
// rolls over, so minute widgets never re-render 60x an hour). Widgets NEVER call
// setInterval — they call useClock(). The interval is torn down while the tab is
// hidden (visibilitychange) and re-synced the instant it returns.
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type Channel = "second" | "minute";

/** Stable server/first-paint value — pair with useMounted() to gate display. */
const SERVER_NOW = new Date(0);

function minuteKey(d: Date): number {
  return Math.floor(d.getTime() / 60_000);
}

interface ClockStore {
  getSnapshot(channel: Channel): Date;
  subscribe(channel: Channel, cb: () => void): () => void;
  tick(): void;
}

function createStore(): ClockStore {
  const initial = new Date();
  // Per-channel snapshot refs stay stable between updates so useSyncExternalStore
  // never sees a spurious change (minute stays identical across second ticks).
  const snap: Record<Channel, Date> = { second: initial, minute: initial };
  let lastMinute = minuteKey(initial);
  const subs: Record<Channel, Set<() => void>> = {
    second: new Set(),
    minute: new Set(),
  };
  return {
    getSnapshot: (channel) => snap[channel],
    subscribe(channel, cb) {
      subs[channel].add(cb);
      return () => {
        subs[channel].delete(cb);
      };
    },
    tick() {
      const now = new Date();
      snap.second = now;
      subs.second.forEach((cb) => cb());
      const mk = minuteKey(now);
      if (mk !== lastMinute) {
        lastMinute = mk;
        snap.minute = now;
        subs.minute.forEach((cb) => cb());
      }
    },
  };
}

const ClockContext = createContext<ClockStore | null>(null);

export function ClockProvider({ children }: { children: ReactNode }) {
  const store = useMemo(createStore, []);
  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (id == null) id = setInterval(() => store.tick(), 1000);
    };
    const stop = () => {
      if (id != null) {
        clearInterval(id);
        id = null;
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        store.tick(); // catch up immediately, then resume ticking
        start();
      } else {
        stop();
      }
    };
    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [store]);
  return <ClockContext.Provider value={store}>{children}</ClockContext.Provider>;
}

/** Subscribe to the shared clock. "second" re-renders each tick; "minute" only
 *  when the minute changes. Throws if used outside <ClockProvider>. */
export function useClock(channel: Channel = "second"): Date {
  const store = useContext(ClockContext);
  if (!store) {
    throw new Error("useClock must be used within a <ClockProvider>.");
  }
  return useSyncExternalStore(
    (cb) => store.subscribe(channel, cb),
    () => store.getSnapshot(channel),
    () => SERVER_NOW,
  );
}
