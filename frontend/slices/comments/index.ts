export { commentsConfig } from "./config";
export { useComments } from "./hooks/useComments";
export type {
  CommentsBindings,
  UseCommentsOpts,
} from "./hooks/useComments";
export { CommentsThread, CommentsAnchor } from "./components";
export type {
  CommentsThreadProps,
  CommentsAnchorProps,
} from "./components";
export { buildThread } from "./lib/buildThread";
export type { CommentNode } from "./lib/buildThread";
export type { Comment, TargetRef } from "./types";
