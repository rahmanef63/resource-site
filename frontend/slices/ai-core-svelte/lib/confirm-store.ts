export type ConfirmRequest = {
  title: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
  run: () => unknown;
};

export type ConfirmStore = {
  subscribe: (run: (request: ConfirmRequest | null) => void) => () => void;
  ask: (request: ConfirmRequest) => void;
  cancel: () => void;
  confirm: () => void;
};

/** Svelte-readable confirm controller with no runtime dependency on svelte/store. */
export function createConfirmStore(): ConfirmStore {
  let current: ConfirmRequest | null = null;
  const listeners = new Set<(request: ConfirmRequest | null) => void>();

  function set(next: ConfirmRequest | null) {
    current = next;
    for (const listener of listeners) listener(current);
  }

  return {
    subscribe(run) {
      run(current);
      listeners.add(run);
      return () => listeners.delete(run);
    },
    ask: (request) => set(request),
    cancel: () => set(null),
    confirm() {
      const request = current;
      if (!request) return;
      void request.run();
      set(null);
    },
  };
}
