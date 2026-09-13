import type { LoopEntitySource, LoopItem } from "./types";

export interface LoopPaginationOptions {
  source: LoopEntitySource;
  filters?: Record<string, unknown>;
  orderBy?: string;
  direction?: "asc" | "desc";
  pagination?: "none" | "infinite";
  limit?: number;
  pageSize?: number;
}

export interface LoopPaginationSnapshot {
  items: LoopItem[];
  totalItems: number;
  hasMore: boolean;
  loading: boolean;
  error: Error | null;
}

export interface LoopPaginationController {
  subscribe(listener: () => void): () => void;
  getSnapshot(): LoopPaginationSnapshot;
  setOptions(options: LoopPaginationOptions): Promise<void>;
  refresh(): Promise<void>;
  loadMore(): Promise<void>;
  dispose(): void;
}

const EMPTY: LoopPaginationSnapshot = {
  items: [],
  totalItems: 0,
  hasMore: false,
  loading: true,
  error: null,
};

function normalized(options: LoopPaginationOptions): Required<
  Pick<LoopPaginationOptions, "source" | "direction" | "pagination" | "limit" | "pageSize">
> &
  Pick<LoopPaginationOptions, "filters" | "orderBy"> {
  return {
    source: options.source,
    filters: options.filters ?? {},
    orderBy: options.orderBy,
    direction: options.direction ?? "asc",
    pagination: options.pagination ?? "none",
    limit: options.limit ?? 12,
    pageSize: options.pageSize ?? 6,
  };
}

/** Framework-neutral async pagination machine shared by React and Svelte adapters. */
export function createLoopPaginationController(
  initial: LoopPaginationOptions,
): LoopPaginationController {
  let options = normalized(initial);
  let snapshot: LoopPaginationSnapshot = { ...EMPTY };
  let offset = 0;
  let revision = 0;
  let disposed = false;
  const listeners = new Set<() => void>();

  const emit = () => listeners.forEach((listener) => listener());
  const setSnapshot = (next: LoopPaginationSnapshot) => {
    snapshot = next;
    emit();
  };

  async function fetchPage(pageOffset: number, replace: boolean, token: number): Promise<void> {
    if (disposed) return;
    setSnapshot({ ...snapshot, loading: true, error: null });
    try {
      const take = options.pagination === "infinite" ? options.pageSize : options.limit;
      const result = await options.source.fetch({
        filters: options.filters ?? {},
        orderBy: options.orderBy,
        direction: options.direction,
        limit: take,
        offset: pageOffset,
      });
      if (disposed || token !== revision) return;
      const items = replace ? result.items : [...snapshot.items, ...result.items];
      offset = pageOffset + result.items.length;
      setSnapshot({
        items,
        totalItems: result.totalItems,
        hasMore: items.length < result.totalItems,
        loading: false,
        error: null,
      });
    } catch (error) {
      if (disposed || token !== revision) return;
      setSnapshot({
        ...snapshot,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  async function refresh(): Promise<void> {
    if (disposed) return;
    const token = ++revision;
    offset = 0;
    setSnapshot({ ...EMPTY });
    await fetchPage(0, true, token);
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    getSnapshot: () => snapshot,
    async setOptions(next) {
      options = normalized(next);
      await refresh();
    },
    refresh,
    async loadMore() {
      if (disposed || snapshot.loading || !snapshot.hasMore) return;
      await fetchPage(offset, false, revision);
    },
    dispose() {
      disposed = true;
      revision += 1;
      listeners.clear();
    },
  };
}
