// notion-editor inner slice — public surface (milestone 1: pure core).
//
// Components (BlockEditor, SlashMenu, blocks/*) land in later milestones and
// will be exported here once ported behind the EditorAdapter seam.

// Block model + slash specs
export { BLOCK_SPECS, type BlockSpec } from "./blockSpecs";

// The host-integration seam — interfaces + runtime provider/hooks
export type {
  EditorAdapter,
  SelectionAdapter,
  CommentsAdapter,
  BlockCommentsState,
  AiAdapter,
  DatabaseAdapter,
  MentionAdapter,
  MentionResult,
  PageAdapter,
} from "./lib/adapter";
export type { EditorDataAdapter, UserProfile } from "./lib/dataAdapter";
export {
  EditorAdapterProvider,
  useEditorAdapter,
  useEditorData,
  useSelection,
  useComments,
  useAi,
} from "./lib/adapterContext";

// Block chrome — selection-aware wrapper + the per-block toolbar (menu,
// quick buttons, grip) wired to the data/selection/comments/ai adapters.
export { BlockShell } from "./blocks/BlockShell";
export { BlockControls } from "./blocks/BlockControls";
export { QuickButtons, GripButton } from "./blocks/block-controls/QuickButtons";
export { MenuHierarchy } from "./blocks/block-controls/MenuHierarchy";

// Block rendering — content body + special-block renderer registry
export { BlockBody } from "./blocks/BlockBody";
export { SimpleCodeBlock } from "./blocks/SimpleCodeBlock";
export {
  BLOCK_RENDERERS,
  getBlockRenderer,
  type BlockRendererProps,
} from "./blocks/registry";

// Slash command menu
export { SlashMenu } from "./SlashMenu";

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
