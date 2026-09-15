export type FsHistorySnapshot = {
  path: string;
  canBack: boolean;
  canForward: boolean;
};

export type FsHistory = {
  getSnapshot: () => FsHistorySnapshot;
  subscribe: (listener: () => void) => () => void;
  navigate: (path: string) => void;
  goBack: () => void;
  goForward: () => void;
};

export function createFsHistory(start: string): FsHistory {
  let history = [start];
  let cursor = 0;
  const listeners = new Set<() => void>();
  let snapshot: FsHistorySnapshot = {
    path: start,
    canBack: false,
    canForward: false,
  };

  const refreshSnapshot = () => {
    snapshot = {
      path: history[cursor] ?? start,
      canBack: cursor > 0,
      canForward: cursor < history.length - 1,
    };
  };
  const emit = () => {
    refreshSnapshot();
    listeners.forEach((listener) => listener());
  };

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    navigate(path) {
      if (!path || path === snapshot.path) return;
      history = [...history.slice(0, cursor + 1), path];
      cursor = history.length - 1;
      emit();
    },
    goBack() {
      if (cursor === 0) return;
      cursor -= 1;
      emit();
    },
    goForward() {
      if (cursor >= history.length - 1) return;
      cursor += 1;
      emit();
    },
  };
}
