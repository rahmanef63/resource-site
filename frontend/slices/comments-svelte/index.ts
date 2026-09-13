export { default as CommentsThread } from "./components/CommentsThread.svelte";
export { default as CommentsAnchor } from "./components/CommentsAnchor.svelte";
export { commentsConfig, type CommentsConfig } from "./config";
export { buildThread, type CommentNode } from "../comments/lib/buildThread";
export {
  createCommentsState,
  type CommentsBindings,
  type CommentsState,
  type CommentsStateOptions,
} from "../comments/lib/state";
export type { Comment, TargetRef } from "../comments/types";
export { commentsTools, type CommentsToolsCtx } from "../comments/lib/tools";
