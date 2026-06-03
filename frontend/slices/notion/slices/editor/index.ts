// notion-editor inner slice — public surface (milestone 1: pure core).
//
// Components (BlockEditor, SlashMenu, blocks/*) land in later milestones and
// will be exported here once ported behind the EditorAdapter seam.

// Block model + slash specs
export { BLOCK_SPECS, type BlockSpec } from "./blockSpecs";

// The host-integration seam
export type {
  EditorAdapter,
  SelectionAdapter,
  CommentsAdapter,
  DatabaseAdapter,
  MentionAdapter,
  MentionResult,
  PageAdapter,
} from "./lib/adapter";

// Pure block-operation utilities
export { BLOCK_COLORS, BLOCK_COLOR_KEYS, colorClass, bgColorClass, type BlockColorKey } from "./lib/colors";
export * from "./lib/blockTree";
export * from "./lib/turnInto";
export * from "./lib/markdownTriggers";
export * from "./lib/listOrdinals";
export * from "./lib/syncedBlocks";
export * from "./lib/layoutAdapter";
export * from "./lib/collisionPriority";
export * from "./lib/focusBlock";
export * from "./lib/inlineDecorator";
export * from "./lib/covers";
