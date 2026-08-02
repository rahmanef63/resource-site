"use client";

import type { ReactNode } from "react";
import type { Comment, TargetRef } from "../types";
import type { CommentNode } from "../lib/buildThread";
import type { CommentsBindings } from "../hooks/useComments";
import { useComments } from "../hooks/useComments";

/**
 * Renderless thread wrapper — the slice owns load state, list ordering,
 * and forbidden-word guards. The consumer supplies the visual host via
 * `children` (render-prop). Domain-neutral by design: no built-in skin.
 *
 * Usage:
 *
 *   <CommentsThread target={{ kind: "page", id: someId }} bindings={bindings}>
 *     {({ tree, openCount, create, isLoading }) => (
 *       <YourThreadSkin
 *         tree={tree}               // nested replies, oldest-first per level
 *         openCount={openCount}
 *         onReply={(parentId, text) =>
 *           create({ target: { kind: "page", id: someId }, text, parentId })}
 *         loading={isLoading}
 *       />
 *     )}
 *   </CommentsThread>
 */
export type CommentsThreadProps = {
  target: TargetRef;
  bindings: CommentsBindings;
  forbiddenWords?: readonly string[];
  children: (state: {
    isLoading: boolean;
    items: Comment[];
    /** `items` nested into reply trees by `parentId` — render this for threads. */
    tree: CommentNode[];
    openCount: number;
    create: CommentsBindings["create"];
    update: CommentsBindings["update"];
    resolve: CommentsBindings["resolve"];
    remove: CommentsBindings["remove"];
  }) => ReactNode;
};

export function CommentsThread({
  target,
  bindings,
  forbiddenWords,
  children,
}: CommentsThreadProps) {
  const state = useComments(bindings, { target, forbiddenWords });
  return <>{children(state)}</>;
}
