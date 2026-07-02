import { components } from "../../_generated/api";
import { MutationCtx, QueryCtx } from "../../_generated/server";
import { Doc, Id } from "../../_generated/dataModel";
import { ProsemirrorSync } from "@convex-dev/prosemirror-sync";
import { getExistingUserId } from "../../auth/helpers";

const prosemirrorSync = new ProsemirrorSync(components.prosemirrorSync);

type AnyCtx = QueryCtx | MutationCtx;

type Document = Doc<"documents">;

type AccessResult = {
  documentId: Id<"documents">;
  document: Document;
  userId: Id<"users"> | null;
};

import { ConvexError } from "convex/values";

// ... existing code ...

const ensureDocumentAccess = async (
  ctx: AnyCtx,
  id: string,
  requireOwner: boolean,
): Promise<AccessResult> => {
  const userId = await getExistingUserId(ctx as any);

  const normalized = ctx.db.normalizeId("documents", id) as Id<"documents"> | null;
  if (!normalized) {
    throw new ConvexError({ code: "INVALID_ID", message: "Invalid document id" });
  }

  const document = await ctx.db.get(normalized);
  if (!document) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Document not found" });
  }

  const isOwner = userId ? document.createdBy === userId : false;

  if (requireOwner) {
    if (!userId) {
      throw new ConvexError({ code: "UNAUTHENTICATED", message: "Not authenticated" });
    }
    if (!isOwner) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Unauthorized" });
    }
  } else if (!document.isPublic && !isOwner) {
    throw new ConvexError({ code: "UNAUTHORIZED", message: "Unauthorized" });
  }

  return { documentId: normalized, document, userId };
};

export const {
  getSnapshot,
  submitSnapshot,
  latestVersion,
  getSteps,
  submitSteps,
} = prosemirrorSync.syncApi({
  checkRead: async (ctx, id) => {
    await ensureDocumentAccess(ctx as AnyCtx, id, false);
  },
  checkWrite: async (ctx, id) => {
    await ensureDocumentAccess(ctx as AnyCtx, id, true);
  },
  onSnapshot: async (ctx, id, snapshot) => {
    const { documentId, document, userId } = await ensureDocumentAccess(
      ctx as AnyCtx,
      id,
      true,
    );

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const metadata = {
      ...(document.metadata ?? {}),
      lastEditedBy: userId,
      version: (document.metadata?.version ?? 0) + 1,
    } as Document["metadata"];

    await ctx.db.patch(documentId, {
      content: snapshot,
      lastModified: Date.now(),
      metadata,
    });
  },
});




