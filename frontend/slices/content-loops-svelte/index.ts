export { default as ContentLoop } from "./components/ContentLoop.svelte";
export { contentLoopsFeature } from "./config";
export { createLoopPaginationStore, type LoopPaginationStore } from "./lib/store";
export { loopSourceRegistry } from "../content-loops/lib/registry";
export { createMockLoopSource, type MockLoopSourceOptions } from "../content-loops/lib/mock-source";
export {
  createLoopPaginationController,
  type LoopPaginationController,
  type LoopPaginationOptions,
  type LoopPaginationSnapshot,
} from "../content-loops/lib/pagination";
export { loopVariantIndex } from "../content-loops/lib/variants";
export type {
  LoopItem,
  LoopFetchResult,
  LoopQuery,
  LoopSourceField,
  LoopEntitySource,
  ILoopSourceRegistry,
} from "../content-loops/lib/types";
