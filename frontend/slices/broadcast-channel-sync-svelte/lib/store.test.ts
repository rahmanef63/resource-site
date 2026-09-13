import { describe, expect, it } from "vitest";
import {
  createBroadcastSyncStore,
  type BroadcastSyncEnvironment,
} from "./store";

function channelHub() {
  const listeners = new Map<string, Set<(value: unknown) => void>>();
  let closeCount = 0;
  const environment: BroadcastSyncEnvironment = {
    openChannel(name, onValue) {
      const set = listeners.get(name) ?? new Set();
      set.add(onValue);
      listeners.set(name, set);
      return {
        post(value) {
          for (const listener of listeners.get(name) ?? []) {
            if (listener !== onValue) listener(value);
          }
        },
        close() {
          set.delete(onValue);
          closeCount += 1;
        },
      };
    },
  };
  return { environment, closed: () => closeCount };
}

function storageHub() {
  const listeners = new Map<string, Set<(value: string) => void>>();
  const environment: BroadcastSyncEnvironment = {
    openChannel: () => null,
    publishStorage(key, value) {
      for (const listener of listeners.get(key) ?? []) listener(value);
    },
    subscribeStorage(key, onValue) {
      const set = listeners.get(key) ?? new Set();
      set.add(onValue);
      listeners.set(key, set);
      return () => set.delete(onValue);
    },
  };
  return environment;
}

describe("createBroadcastSyncStore", () => {
  it("syncs stores through BroadcastChannel without echoing local writes", () => {
    const hub = channelHub();
    const a = createBroadcastSyncStore("demo", 0, hub.environment);
    const b = createBroadcastSyncStore("demo", 0, hub.environment);
    const seen: number[] = [];
    const stopA = a.subscribe(() => undefined);
    const stopB = b.subscribe((value) => seen.push(value));

    a.set(2);
    expect(a.get()).toBe(2);
    expect(b.get()).toBe(2);
    expect(seen).toEqual([0, 2]);

    stopA();
    stopB();
    expect(hub.closed()).toBe(2);
  });

  it("falls back to storage events when BroadcastChannel is unavailable", () => {
    const environment = storageHub();
    const a = createBroadcastSyncStore("fallback", { count: 0 }, environment);
    const b = createBroadcastSyncStore("fallback", { count: 0 }, environment);
    const stopA = a.subscribe(() => undefined);
    const stopB = b.subscribe(() => undefined);

    a.update((value) => ({ count: value.count + 1 }));
    expect(b.get()).toEqual({ count: 1 });

    stopA();
    stopB();
  });

  it("is inert until subscribed or written and can be destroyed safely", () => {
    const hub = channelHub();
    const store = createBroadcastSyncStore("idle", "initial", hub.environment);
    expect(store.get()).toBe("initial");
    expect(hub.closed()).toBe(0);
    store.destroy();
    expect(hub.closed()).toBe(0);
  });
});
