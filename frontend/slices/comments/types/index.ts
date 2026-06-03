/**
 * Polymorphic anchor for a comment thread.
 *
 * The `comments` slice intentionally does NOT bake in consumer-specific
 * entity names. Consumer projects pick the `kind` literal (e.g. "page",
 * "blog-post", "task") and resolve `id`/`subId` to whatever primary +
 * optional sub-anchor matches their domain.
 *
 * - notion: `{ kind: "page", id: <page-uid>, subId: <block-uid> }`
 * - rahmanef.com blog: `{ kind: "blog", id: <post-slug> }`
 * - rahmanef.com portfolio: `{ kind: "portfolio", id: <work-slug> }`
 *
 * See docs/contract-negotiations-2026-05-15.md §1 for the operator decision.
 */
export type TargetRef = {
  /** Consumer-defined entity kind literal. */
  kind: string;
  /** Primary entity id. */
  id: string;
  /** Optional secondary anchor (e.g. a block within a page). */
  subId?: string;
};

export interface Comment {
  id: string;
  /** Polymorphic target — replaces v0.1.0 page/block-coupled ids. */
  target: TargetRef;
  text: string;
  authorName: string;
  authorIcon: string;
  resolved: boolean;
  createdAt: number;
  updatedAt: number;
  /** Parent comment id for replies. Absent on top-level (root) comments. */
  parentId?: string;
  /** Author user id. Absent on public-share DTOs (sanitized). */
  authorId?: string;
}
