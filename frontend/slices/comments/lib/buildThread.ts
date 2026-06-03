import type { Comment } from "../types";

/**
 * A comment plus its nested replies. The tree the `comments` slice promises
 * by its "Threaded" name — built client-side from the flat `Comment[]` the
 * adapter returns, keyed on `parentId`.
 */
export type CommentNode = Comment & { replies: CommentNode[] };

/**
 * Nest a flat comment list into reply trees.
 *
 * - Roots = comments with no `parentId` (or whose parent is absent from the
 *   slice, e.g. filtered/deleted — orphans surface as roots, never dropped).
 * - Each level is ordered oldest-first by `createdAt`.
 *
 * Pure + side-effect free; safe to call on every render (cheap map + sort).
 */
export function buildThread(items: readonly Comment[]): CommentNode[] {
  const byId = new Map<string, CommentNode>();
  for (const c of items) byId.set(c.id, { ...c, replies: [] });

  const roots: CommentNode[] = [];
  for (const node of byId.values()) {
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    if (parent) parent.replies.push(node);
    else roots.push(node);
  }

  const sortRec = (nodes: CommentNode[]) => {
    nodes.sort((a, b) => a.createdAt - b.createdAt);
    for (const n of nodes) sortRec(n.replies);
  };
  sortRec(roots);
  return roots;
}
