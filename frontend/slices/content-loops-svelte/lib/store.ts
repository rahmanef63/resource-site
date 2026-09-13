import {
  createLoopPaginationController,
  type LoopPaginationOptions,
  type LoopPaginationSnapshot,
} from "../../content-loops/lib/pagination";

export interface LoopPaginationStore {
  subscribe(run: (snapshot: LoopPaginationSnapshot) => void): () => void;
  update(options: LoopPaginationOptions): Promise<void>;
  refresh(): Promise<void>;
  loadMore(): Promise<void>;
  destroy(): void;
}

/** Svelte-readable adapter over the canonical framework-neutral pagination controller. */
export function createLoopPaginationStore(options: LoopPaginationOptions): LoopPaginationStore {
  const controller = createLoopPaginationController(options);
  void controller.refresh();

  return {
    subscribe(run) {
      run(controller.getSnapshot());
      return controller.subscribe(() => run(controller.getSnapshot()));
    },
    update: (next) => controller.setOptions(next),
    refresh: () => controller.refresh(),
    loadMore: () => controller.loadMore(),
    destroy: () => controller.dispose(),
  };
}
