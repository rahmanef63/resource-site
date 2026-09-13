import {
  createCommentsState,
  type CommentsBindings,
  type CommentsStateOptions,
} from "../lib/state";

export type { CommentsBindings } from "../lib/state";
export type UseCommentsOpts = CommentsStateOptions;

/**
 * React-facing compatibility adapter. The state engine itself is framework-
 * neutral in `lib/state.ts`; React re-evaluates this function on render while
 * Svelte consumes the same engine from its own reactive adapter.
 */
export function useComments(
  bindings: CommentsBindings,
  opts: UseCommentsOpts,
) {
  return createCommentsState(bindings, opts);
}
