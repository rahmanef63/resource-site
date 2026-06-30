export { contentLoopsFeature } from "./config";
export { ContentLoop } from "./components/ContentLoop";
export type {
  ContentLoopProps,
  LoopVariant,
  LoopVariantProps,
} from "./components/ContentLoop";
export { loopSourceRegistry } from "./lib/registry";
export { createMockLoopSource, type MockLoopSourceOptions } from "./lib/mock-source";
export {
  useLoopPagination,
  type UseLoopPaginationOptions,
  type LoopPaginationState,
} from "./hooks/use-loop-pagination";
export { useLoopItems, type UseLoopItemsOptions } from "./hooks/use-loop-items";
export type {
  LoopItem,
  LoopFetchResult,
  LoopQuery,
  LoopSourceField,
  LoopEntitySource,
  ILoopSourceRegistry,
} from "./lib/types";
