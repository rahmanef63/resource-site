import { buildThread, type CommentNode } from "./buildThread";
import type { Comment, TargetRef } from "../types";

export type CommentsBindings = {
  list: (target: TargetRef) => Comment[] | undefined;
  create: (input: { target: TargetRef; text: string; parentId?: string }) => Promise<void> | void;
  update: (input: { id: string; text: string }) => Promise<void> | void;
  resolve: (input: { id: string; resolved: boolean }) => Promise<void> | void;
  remove: (input: { id: string }) => Promise<void> | void;
};

export type CommentsStateOptions = {
  target?: TargetRef;
  forbiddenWords?: readonly string[];
};

export type CommentsState = {
  isLoading: boolean;
  items: Comment[];
  tree: CommentNode[];
  openCount: number;
  create: CommentsBindings["create"];
  update: CommentsBindings["update"];
  resolve: CommentsBindings["resolve"];
  remove: CommentsBindings["remove"];
};

export function createCommentsState(
  bindings: CommentsBindings,
  options: CommentsStateOptions,
): CommentsState {
  const raw = options.target ? bindings.list(options.target) : undefined;
  const items = (raw ?? []).slice().sort((a, b) => a.createdAt - b.createdAt);
  const forbiddenWords = options.forbiddenWords ?? [];

  const create: CommentsBindings["create"] = (input) => {
    const lower = input.text.toLowerCase();
    for (const word of forbiddenWords) {
      if (word && lower.includes(word.toLowerCase())) {
        throw new Error(`comment contains forbidden term: "${word}"`);
      }
    }
    return bindings.create(input);
  };

  return {
    isLoading: raw === undefined,
    items,
    tree: buildThread(items),
    openCount: items.filter((comment) => !comment.resolved).length,
    create,
    update: bindings.update,
    resolve: bindings.resolve,
    remove: bindings.remove,
  };
}
