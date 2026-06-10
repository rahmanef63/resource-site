// Agentic tool collection. Ctx = the slice's own CommentsBindings (the same
// injectable adapter useComments consumes), so whatever backend the host
// wired — Convex, REST, memory — the agent drives it too.

import { defineToolCollection, bool, obj, str } from "@/shared/agentic";
import type { CommentsBindings } from "../hooks/useComments";

export type CommentsToolsCtx = CommentsBindings;

export const commentsTools = defineToolCollection<CommentsToolsCtx>({
  namespace: "comments",
  tools: [
    {
      name: "list",
      description: "List comments on a target (kind + id).",
      parameters: obj({ "kind!": str("target kind, e.g. page"), "id!": str("target id") }),
      run: (ctx, a) => {
        const rows = ctx.list({ kind: a.kind as string, id: a.id as string });
        if (!rows) return "no data (adapter still loading)";
        return rows.map((c) => `${c.id} ${c.authorName}${c.resolved ? " [resolved]" : ""}: ${c.text}`).join("\n") || "no comments";
      },
    },
    {
      name: "add",
      description: "Add a comment (or a reply when parentId is given).",
      parameters: obj({
        "kind!": str("target kind"),
        "id!": str("target id"),
        "text!": str("comment text"),
        parentId: str("parent comment id (reply)"),
      }),
      run: async (ctx, a) => {
        await ctx.create({
          target: { kind: a.kind as string, id: a.id as string },
          text: a.text as string,
          parentId: a.parentId as string | undefined,
        });
        return "comment added";
      },
    },
    {
      name: "resolve",
      description: "Resolve or reopen a comment.",
      parameters: obj({ "commentId!": str("comment id"), "resolved!": bool("true = resolve, false = reopen") }),
      run: async (ctx, a) => {
        await ctx.resolve({ id: a.commentId as string, resolved: a.resolved as boolean });
        return a.resolved ? "resolved" : "reopened";
      },
    },
    {
      name: "remove",
      description: "Delete a comment.",
      parameters: obj({ "commentId!": str("comment id") }),
      run: async (ctx, a) => {
        await ctx.remove({ id: a.commentId as string });
        return "comment removed";
      },
    },
  ],
});
