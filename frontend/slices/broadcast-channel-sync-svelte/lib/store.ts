export type BroadcastSyncChannel = {
  post: (value: unknown) => void;
  close: () => void;
};

export type BroadcastSyncEnvironment = {
  openChannel?: (
    name: string,
    onValue: (value: unknown) => void,
  ) => BroadcastSyncChannel | null;
  publishStorage?: (key: string, value: string) => void;
  subscribeStorage?: (key: string, onValue: (value: string) => void) => () => void;
};

export type BroadcastSyncStore<T> = {
  subscribe: (run: (value: T) => void) => () => void;
  set: (value: T) => void;
  update: (updater: (value: T) => T) => void;
  get: () => T;
  destroy: () => void;
};

const STORAGE_PREFIX = "rr:broadcast-channel-sync:";

function browserEnvironment(): BroadcastSyncEnvironment {
  if (typeof window === "undefined") return {};

  return {
    openChannel: typeof BroadcastChannel === "undefined"
      ? undefined
      : (name, onValue) => {
          const channel = new BroadcastChannel(name);
          channel.onmessage = (event) => onValue(event.data);
          return {
            post: (value) => channel.postMessage(value),
            close: () => channel.close(),
          };
        },
    publishStorage: (key, value) => {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Storage may be unavailable in private/sandboxed contexts.
      }
    },
    subscribeStorage: (key, onValue) => {
      const listener = (event: StorageEvent) => {
        if (event.key === key && event.newValue !== null) onValue(event.newValue);
      };
      window.addEventListener("storage", listener);
      return () => window.removeEventListener("storage", listener);
    },
  };
}

export function createBroadcastSyncStore<T>(
  channelName: string,
  initial: T,
  environment: BroadcastSyncEnvironment = browserEnvironment(),
): BroadcastSyncStore<T> {
  let value = initial;
  let channel: BroadcastSyncChannel | null = null;
  let stopStorage: (() => void) | null = null;
  let started = false;
  let nonce = 0;
  const subscribers = new Set<(value: T) => void>();
  const storageKey = `${STORAGE_PREFIX}${channelName}`;

  const notify = () => subscribers.forEach((run) => run(value));
  const applyRemote = (next: unknown) => {
    value = next as T;
    notify();
  };

  const start = () => {
    if (started) return;
    started = true;
    channel = environment.openChannel?.(channelName, applyRemote) ?? null;
    if (channel) return;

    stopStorage = environment.subscribeStorage?.(storageKey, (raw) => {
      try {
        const envelope = JSON.parse(raw) as { value?: unknown };
        if (Object.prototype.hasOwnProperty.call(envelope, "value")) {
          applyRemote(envelope.value);
        }
      } catch {
        // Ignore unrelated/corrupt storage values.
      }
    }) ?? null;
  };

  const stop = () => {
    channel?.close();
    channel = null;
    stopStorage?.();
    stopStorage = null;
    started = false;
  };

  const set = (next: T) => {
    start();
    value = next;
    notify();
    if (channel) {
      channel.post(next);
      return;
    }
    nonce += 1;
    try {
      const serialized = JSON.stringify({ nonce, value: next });
      environment.publishStorage?.(storageKey, serialized);
    } catch {
      // The local value still updates; storage fallback needs JSON-safe data.
    }
  };

  return {
    subscribe(run) {
      subscribers.add(run);
      run(value);
      start();
      return () => {
        subscribers.delete(run);
        if (subscribers.size === 0) stop();
      };
    },
    set,
    update(updater) {
      set(updater(value));
    },
    get: () => value,
    destroy() {
      subscribers.clear();
      stop();
    },
  };
}
