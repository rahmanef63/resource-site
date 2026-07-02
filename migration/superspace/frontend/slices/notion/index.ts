// `notion` cluster public barrel.
export { notionConfig } from "./config";

// Cluster-private shared model (also reachable via @notion/shared/*).
export type {
  BlockType, Block, Page, PageFont,
  CoverType, CoverData, CoverField, ColumnLayout,
} from "./shared/types";

// Inner slices.
export * as editor from "./slices/editor";
