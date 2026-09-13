import { describe, expect, it, vi } from "vitest";
import { createCommentsState, type CommentsBindings } from "./state";
import type { Comment } from "../types";

const target = { kind: "page", id: "p1" };
const rows: Comment[] = [
  { id: "reply", target, text: "reply", authorName: "B", authorIcon: "", resolved: false, createdAt: 2, updatedAt: 2, parentId: "root" },
  { id: "root", target, text: "root", authorName: "A", authorIcon: "", resolved: true, createdAt: 1, updatedAt: 1 },
];

function bindings(list = rows): CommentsBindings {
  return { list: () => list, create: vi.fn(), update: vi.fn(), resolve: vi.fn(), remove: vi.fn() };
}

describe("createCommentsState", () => {
  it("sorts, nests, and counts unresolved comments", () => {
    const state = createCommentsState(bindings(), { target });
    expect(state.items.map((item) => item.id)).toEqual(["root", "reply"]);
    expect(state.tree[0]?.replies[0]?.id).toBe("reply");
    expect(state.openCount).toBe(1);
  });

  it("keeps the forbidden-word guard in the shared core", () => {
    const state = createCommentsState(bindings(), { target, forbiddenWords: ["secret"] });
    expect(() => state.create({ target, text: "a SECRET value" })).toThrow('comment contains forbidden term: "secret"');
  });
});
