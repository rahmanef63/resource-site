import type { Comment, TargetRef } from "../types";
import { buildThread } from "../lib/buildThread";

/**
 * Props-driven Convex adapter. The portable slice cannot import `convex/react`
 * directly (R3 — kept under `npx tsc --noEmit` + validate-structure). The
 * consumer wires its own client and hands the binding in.
 *
 * v0.2.0 (2026-05-15) — polymorphic `TargetRef` replaces v0.1.0's
 * page/block-coupled id pair. See
 * docs/contract-negotiations-2026-05-15.md §1.
 *
 * Reference adapter for a Convex consumer (kept out of the portable slice):
 *
 *   import { useQuery, useMutation } from "convex/react";
 *   import { api } from "@convex/_generated/api";
 *   const bindings: CommentsBindings = {
 *     list: ({ kind, id, subId }) =>
 *       useQuery(api["features/comments/query"].listByTarget,
 *         id ? { kind, id, subId } : "skip")?.map(toComment),
 *     create:  useMutation(api["features/comments/mutation"].create),
 *     update:  useMutation(api["features/comments/mutation"].update),
 *     resolve: useMutation(api["features/comments/mutation"].resolve),
 *     remove:  useMutation(api["features/comments/mutation"].remove),
 *   };
 *   const c = useComments(bindings, { target: { kind: "page", id: someId } });
 */
export type CommentsBindings = {
  list: (target: TargetRef) => Comment[] | undefined;
  create: (input: {
    target: TargetRef;
    text: string;
    /** Parent comment id when replying; omit for a top-level comment. */
    parentId?: string;
  }) => Promise<void> | void;
  update: (input: { id: string; text: string }) => Promise<void> | void;
  resolve: (input: {
    id: string;
    resolved: boolean;
  }) => Promise<void> | void;
  remove: (input: { id: string }) => Promise<void> | void;
};

export type UseCommentsOpts = {
  /** Target to load comments for. Omit to skip the fetch. */
  target?: TargetRef;
  /** Reserved words the consumer wants blocked at create-time. */
  forbiddenWords?: readonly string[];
};

export function useComments(
  bindings: CommentsBindings,
  opts: UseCommentsOpts,
) {
  const raw = opts.target ? bindings.list(opts.target) : undefined;

  const items: Comment[] = (raw ?? [])
    .slice()
    .sort((a, b) => a.createdAt - b.createdAt);

  const forbiddenWords = opts.forbiddenWords ?? [];

  const create: CommentsBindings["create"] = (input) => {
    if (forbiddenWords.length) {
      const lower = input.text.toLowerCase();
      for (const w of forbiddenWords) {
        if (!w) continue;
        if (lower.includes(w.toLowerCase())) {
          throw new Error(`comment contains forbidden term: "${w}"`);
        }
      }
    }
    return bindings.create(input);
  };

  return {
    isLoading: raw === undefined,
    items,
    /** Flat `items` nested into reply trees by `parentId`. */
    tree: buildThread(items),
    openCount: items.filter((c) => !c.resolved).length,
    create,
    update: bindings.update,
    resolve: bindings.resolve,
    remove: bindings.remove,
  };
}
