import type { Comment } from "../types";

/**
 * Props-driven Convex adapter. The portable slice cannot import `convex/react`
 * directly (R3 — kept under `npx tsc --noEmit` + validate-structure). The
 * consumer wires its own client and hands the binding in.
 *
 * Reference adapter for a Convex consumer (kept out of the portable slice):
 *
 *   import { useQuery, useMutation } from "convex/react";
 *   import { api } from "@convex/_generated/api";
 *   const bindings: CommentsBindings = {
 *     listForPage: (args) =>
 *       useQuery(api["features/comments/queries"].listForPage,
 *         args.pageId ? args : "skip")?.map(toComment),
 *     listForBlock: (args) =>
 *       useQuery(api["features/comments/queries"].listForBlock,
 *         args.pageId && args.blockId ? args : "skip")?.map(toComment),
 *     create:  useMutation(api["features/comments/mutations"].create),
 *     update:  useMutation(api["features/comments/mutations"].update),
 *     resolve: useMutation(api["features/comments/mutations"].resolve),
 *     remove:  useMutation(api["features/comments/mutations"].remove),
 *   };
 *   const c = useComments(bindings, { pageId });
 */
export type CommentsBindings = {
  listForPage: (args: { pageId: string }) => Comment[] | undefined;
  listForBlock: (args: {
    pageId: string;
    blockId: string;
  }) => Comment[] | undefined;
  create: (input: {
    pageId: string;
    blockId?: string;
    text: string;
  }) => Promise<void> | void;
  update: (input: { id: string; text: string }) => Promise<void> | void;
  resolve: (input: {
    id: string;
    resolved: boolean;
  }) => Promise<void> | void;
  remove: (input: { id: string }) => Promise<void> | void;
};

export type UseCommentsOpts = { pageId?: string; blockId?: string };

export function useComments(
  bindings: CommentsBindings,
  opts: UseCommentsOpts,
) {
  const raw =
    opts.blockId && opts.pageId
      ? bindings.listForBlock({ pageId: opts.pageId, blockId: opts.blockId })
      : opts.pageId
        ? bindings.listForPage({ pageId: opts.pageId })
        : undefined;

  const items: Comment[] = (raw ?? [])
    .slice()
    .sort((a, b) => a.createdAt - b.createdAt);

  return {
    isLoading: raw === undefined,
    items,
    openCount: items.filter((c) => !c.resolved).length,
    create: bindings.create,
    update: bindings.update,
    resolve: bindings.resolve,
    remove: bindings.remove,
  };
}
