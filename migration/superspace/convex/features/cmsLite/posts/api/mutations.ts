import { mutation } from "../../_generated";
import { v } from "convex/values";
import type { Doc, Id, MutationCtx } from "../../_generated";
import {
  assertDocWorkspace,
  ensureWorkspaceMembership,
  requireAdminForWorkspace,
  requireEditor,
} from "../../../lib/rbac";
import { logAuditEvent } from "../../../lib/audit";
import { postObject } from "./queries";

type PostSnapshot = Doc<"posts">;
type PostInsert = Omit<PostSnapshot, "_id" | "_creationTime">;

function definedFields<T extends Record<string, unknown>>(input: T): Partial<T> {
  const output: Partial<T> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      (output as Record<string, unknown>)[key] = value;
    }
  }
  return output;
}

function snapshotPost(post: PostSnapshot, overrides: Record<string, unknown> = {}) {
  return {
    workspaceId: post.workspaceId,
    postId: post._id,
    slug: post.slug,
    locale: post.locale,
    title: post.title,
    excerpt: post.excerpt ?? null,
    body: post.body,
    coverImage: post.coverImage ?? null,
    status: post.status,
    publishedAt: post.publishedAt ?? null,
    metaTitle: post.metaTitle ?? null,
    metaDescription: post.metaDescription ?? null,
    metaKeywords: post.metaKeywords ?? null,
    createdBy: post.updatedBy ?? post.createdBy ?? null,
    ...overrides,
  };
}

function mapPostToResponse(post: PostSnapshot) {
  return {
    id: post._id,
    slug: post.slug,
    locale: post.locale,
    title: post.title,
    excerpt: post.excerpt ?? null,
    body: post.body,
    coverImage: post.coverImage ?? null,
    status: post.status,
    publishedAt: post.publishedAt ?? null,
    metaTitle: post.metaTitle ?? null,
    metaDescription: post.metaDescription ?? null,
    metaKeywords: post.metaKeywords ?? null,
    scheduledPublishAt: post.scheduledPublishAt ?? null,
    autoPublished: post.autoPublished ?? false,
  };
}

// H2 + L2 fix (security review 2026-05-14): workspace is now an explicit
// arg on every mutation; the `adminUser.workspaceIds[0]` helper was removed
// because it silently picked the wrong tenant for users in multiple
// workspaces. Admin gates use `requireAdminForWorkspace`; editor gates pair
// `requireEditor` with `ensureWorkspaceMembership`.

const basePostArgs = {
  slug: v.string(),
  locale: v.string(),
  title: v.string(),
  excerpt: v.optional(v.union(v.string(), v.null())),
  body: v.string(),
  coverImage: v.optional(v.union(v.string(), v.null())),
  publishedAt: v.optional(v.union(v.number(), v.null())),
  status: v.string(),
  metaTitle: v.optional(v.union(v.string(), v.null())),
  metaDescription: v.optional(v.union(v.string(), v.null())),
  metaKeywords: v.optional(v.union(v.array(v.string()), v.null())),
  revisionNote: v.optional(v.union(v.string(), v.null())),
  scheduledPublishAt: v.optional(v.union(v.number(), v.null())),
  autoPublished: v.optional(v.boolean()),
};

type PostWriteArgs = {
  slug: string;
  locale: string;
  title: string;
  excerpt?: string | null;
  body: string;
  coverImage?: string | null;
  publishedAt?: number | null;
  status: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[] | null;
  revisionNote?: string | null;
  scheduledPublishAt?: number | null;
  autoPublished?: boolean;
};

export const createPost = mutation({
  args: { workspaceId: v.string(), ...basePostArgs },
  returns: postObject,
  handler: async (ctx: MutationCtx, args: PostWriteArgs & { workspaceId: string }) => {
    const actor = await requireEditor(ctx);
    await ensureWorkspaceMembership(ctx, args.workspaceId);
    const workspaceId = args.workspaceId;

    const conflict = await ctx.db
      .query("posts")
      .withIndex("by_slug_locale", (q: any) => q.eq("slug", args.slug).eq("locale", args.locale))
      .first();

    if (conflict) {
      throw new Error("Post with this slug and locale already exists");
    }

    const postPayload: PostInsert = {
      workspaceId,
      slug: args.slug,
      locale: args.locale,
      title: args.title,
      excerpt: args.excerpt ?? null,
      body: args.body,
      coverImage: args.coverImage ?? null,
      publishedAt: args.publishedAt ?? null,
      status: args.status,
      metaTitle: args.metaTitle ?? null,
      metaDescription: args.metaDescription ?? null,
      metaKeywords: args.metaKeywords ?? null,
      scheduledPublishAt: args.scheduledPublishAt ?? null,
      autoPublished: args.autoPublished ?? false,
      createdBy: actor.clerkUserId ?? null,
      updatedBy: actor.clerkUserId ?? null,
    };

    const postId = await ctx.db.insert("posts", postPayload);

    const post = await ctx.db.get(postId);
    if (!post) {
      throw new Error("Failed to load post after creation");
    }

    await ctx.db.insert(
      "postRevisions",
      snapshotPost(post, {
        createdBy: actor.clerkUserId,
        revisionNote: args.revisionNote ?? "Initial version",
      }),
    );

    await logAuditEvent(ctx, {
      workspaceId,
      actor: actor.clerkUserId,
      resourceType: "post",
      resourceId: postId,
      action: "post.create",
      changes: {
        slug: args.slug,
        locale: args.locale,
        status: args.status,
      },
    });

    return mapPostToResponse(post);
  },
});

export const updatePost = mutation({
  args: {
    workspaceId: v.string(),
    id: v.id("posts"),
    ...basePostArgs,
  },
  returns: postObject,
  handler: async (
    ctx: MutationCtx,
    args: PostWriteArgs & {
      workspaceId: string;
      id: Id<"posts">;
    },
  ) => {
    const actor = await requireEditor(ctx);
    await ensureWorkspaceMembership(ctx, args.workspaceId);
    const workspaceId = args.workspaceId;

    const post = await ctx.db.get(args.id);
    assertDocWorkspace(post as unknown as { workspaceId?: string } | null, workspaceId, "post");

    const conflict = await ctx.db
      .query("posts")
      .withIndex("by_slug_locale", (q: any) => q.eq("slug", args.slug).eq("locale", args.locale))
      .first();

    if (conflict && conflict._id !== args.id) {
      throw new Error("Another post with this slug and locale already exists");
    }

    await ctx.db.insert(
      "postRevisions",
      snapshotPost(post!, {
        createdBy: actor.clerkUserId,
        revisionNote: args.revisionNote ?? "Update",
      }),
    );

    const patch = definedFields<Partial<PostInsert>>({
      slug: args.slug,
      locale: args.locale,
      title: args.title,
      excerpt: args.excerpt ?? null,
      body: args.body,
      coverImage: args.coverImage ?? null,
      publishedAt: args.publishedAt ?? null,
      status: args.status,
      metaTitle: args.metaTitle ?? null,
      metaDescription: args.metaDescription ?? null,
      metaKeywords: args.metaKeywords ?? null,
      scheduledPublishAt: args.scheduledPublishAt ?? null,
      autoPublished: args.autoPublished,
      updatedBy: actor.clerkUserId ?? null,
    }) as Partial<PostInsert>;

    await ctx.db.patch(args.id, patch as any);

    const updated = await ctx.db.get(args.id);
    if (!updated) {
      throw new Error("Failed to load post after update");
    }

    await logAuditEvent(ctx, {
      workspaceId,
      actor: actor.clerkUserId,
      resourceType: "post",
      resourceId: args.id,
      action: "post.update",
      changes: {
        title: updated.title,
        status: updated.status,
        revisionNote: args.revisionNote ?? "Update",
      },
    });

    return mapPostToResponse(updated);
  },
});

export const deletePost = mutation({
  args: {
    workspaceId: v.string(),
    id: v.id("posts"),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (
    ctx: MutationCtx,
    { workspaceId, id }: { workspaceId: string; id: Id<"posts"> },
  ) => {
    const actor = await requireEditor(ctx);
    await ensureWorkspaceMembership(ctx, workspaceId);

    const post = await ctx.db.get(id);
    assertDocWorkspace(post as unknown as { workspaceId?: string } | null, workspaceId, "post");

    const revisions = await ctx.db
      .query("postRevisions")
      .withIndex("by_post", (q: any) => q.eq("postId", id))
      .take(1000);

    await Promise.all(revisions.map((revision: any) => ctx.db.delete(revision._id)));
    await ctx.db.delete(id);

    await logAuditEvent(ctx, {
      workspaceId,
      actor: actor.clerkUserId,
      resourceType: "post",
      resourceId: id,
      action: "post.delete",
    });

    return { success: true };
  },
});

export const restorePostRevision = mutation({
  args: {
    workspaceId: v.string(),
    postId: v.id("posts"),
    revisionId: v.id("postRevisions"),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (
    ctx: MutationCtx,
    {
      workspaceId,
      postId,
      revisionId,
    }: {
      workspaceId: string;
      postId: Id<"posts">;
      revisionId: Id<"postRevisions">;
    },
  ) => {
    const actor = await requireAdminForWorkspace(ctx, workspaceId);

    const post = await ctx.db.get(postId);
    assertDocWorkspace(post as unknown as { workspaceId?: string } | null, workspaceId, "post");

    const revision = await ctx.db.get(revisionId);
    if (!revision || revision.postId !== postId) {
      throw new Error("Revision not found");
    }
    // Revision is tied to post via postId — and post workspace was just
    // asserted above — so the revision is transitively workspace-scoped.
    assertDocWorkspace(revision as unknown as { workspaceId?: string }, workspaceId, "post revision");

    await ctx.db.insert(
      "postRevisions",
      snapshotPost(post!, {
        createdBy: actor.clerkUserId,
        revisionNote: "Auto-saved before restore",
      }),
    );

    const restoredPatch = definedFields<Partial<PostInsert>>({
      slug: revision.slug,
      locale: revision.locale,
      title: revision.title,
      excerpt: revision.excerpt ?? null,
      body: revision.body,
      coverImage: revision.coverImage ?? null,
      status: revision.status,
      publishedAt: revision.publishedAt ?? null,
      metaTitle: revision.metaTitle ?? null,
      metaDescription: revision.metaDescription ?? null,
      metaKeywords: revision.metaKeywords ?? null,
      updatedBy: actor.clerkUserId ?? null,
    }) as Partial<PostInsert>;

    await ctx.db.patch(postId, restoredPatch as any);

    await logAuditEvent(ctx, {
      workspaceId,
      actor: actor.clerkUserId,
      resourceType: "post",
      resourceId: postId,
      action: "post.restore_revision",
      changes: {
        revisionId,
      },
    });

    return { success: true };
  },
});

export const bulkUpdatePosts = mutation({
  args: {
    workspaceId: v.string(),
    ids: v.array(v.id("posts")),
    action: v.union(v.literal("publish"), v.literal("unpublish"), v.literal("delete")),
  },
  returns: v.object({
    success: v.boolean(),
    affected: v.number(),
  }),
  handler: async (
    ctx: MutationCtx,
    {
      workspaceId,
      ids,
      action,
    }: {
      workspaceId: string;
      ids: Id<"posts">[];
      action: "publish" | "unpublish" | "delete";
    },
  ) => {
    const actor = await requireAdminForWorkspace(ctx, workspaceId);

    if (ids.length === 0) {
      return { success: true, affected: 0 };
    }

    let affected = 0;

    for (const id of ids) {
      const post = await ctx.db.get(id);
      if (!post) {
        continue;
      }
      assertDocWorkspace(post as unknown as { workspaceId?: string }, workspaceId, "post");

      switch (action) {
        case "publish": {
          if (post.status !== "published") {
            const publishPatch = definedFields<Partial<PostInsert>>({
              status: "published",
              publishedAt: Date.now(),
              autoPublished: post.autoPublished ?? false,
              updatedBy: actor.clerkUserId ?? null,
            }) as Partial<PostInsert>;
            await ctx.db.patch(id, publishPatch as any);
            affected += 1;
            await logAuditEvent(ctx, {
              workspaceId,
              actor: actor.clerkUserId,
              resourceType: "post",
              resourceId: id,
              action: "post.publish",
            });
          }
          break;
        }
        case "unpublish": {
          if (post.status !== "draft") {
            const unpublishPatch = definedFields<Partial<PostInsert>>({
              status: "draft",
              publishedAt: null,
              updatedBy: actor.clerkUserId ?? null,
            }) as Partial<PostInsert>;
            await ctx.db.patch(id, unpublishPatch as any);
            affected += 1;
            await logAuditEvent(ctx, {
              workspaceId,
              actor: actor.clerkUserId,
              resourceType: "post",
              resourceId: id,
              action: "post.unpublish",
            });
          }
          break;
        }
        case "delete": {
          const revisions = await ctx.db
            .query("postRevisions")
            .withIndex("by_post", (q: any) => q.eq("postId", id))
            .take(1000);
          await Promise.all(revisions.map((revision: any) => ctx.db.delete(revision._id)));
          await ctx.db.delete(id);
          affected += 1;
          await logAuditEvent(ctx, {
            workspaceId,
            actor: actor.clerkUserId,
            resourceType: "post",
            resourceId: id,
            action: "post.delete",
          });
          break;
        }
      }
    }

    return { success: true, affected };
  },
});


