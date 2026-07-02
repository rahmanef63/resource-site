import { query } from "../../_generated";
import { v } from "convex/values";
import type { Doc, Id, QueryCtx } from "../../_generated";
import { requireAdmin, requireEditor } from "../../../lib/rbac";

export const postObject = v.object({
  id: v.id("posts"),
  slug: v.string(),
  locale: v.string(),
  title: v.string(),
  excerpt: v.optional(v.union(v.string(), v.null())),
  body: v.string(),
  coverImage: v.optional(v.union(v.string(), v.null())),
  status: v.string(),
  publishedAt: v.optional(v.union(v.number(), v.null())),
  metaTitle: v.optional(v.union(v.string(), v.null())),
  metaDescription: v.optional(v.union(v.string(), v.null())),
  metaKeywords: v.optional(v.union(v.array(v.string()), v.null())),
  scheduledPublishAt: v.optional(v.union(v.number(), v.null())),
  autoPublished: v.optional(v.boolean()),
});

export const revisionObject = v.object({
  id: v.id("postRevisions"),
  postId: v.id("posts"),
  slug: v.string(),
  locale: v.string(),
  title: v.string(),
  excerpt: v.optional(v.union(v.string(), v.null())),
  body: v.string(),
  coverImage: v.optional(v.union(v.string(), v.null())),
  status: v.string(),
  publishedAt: v.optional(v.union(v.number(), v.null())),
  metaTitle: v.optional(v.union(v.string(), v.null())),
  metaDescription: v.optional(v.union(v.string(), v.null())),
  metaKeywords: v.optional(v.union(v.array(v.string()), v.null())),
  createdBy: v.optional(v.union(v.string(), v.null())),
  revisionNote: v.optional(v.union(v.string(), v.null())),
  createdAt: v.number(),
});

function serializePost(post: Doc<"posts">) {
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
    autoPublished: post.autoPublished ?? undefined,
  };
}

function serializeRevision(revision: Doc<"postRevisions">) {
  return {
    id: revision._id,
    postId: revision.postId,
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
    createdBy: revision.createdBy ?? null,
    revisionNote: revision.revisionNote ?? null,
    createdAt: revision._creationTime,
  };
}

export const listPosts = query({
  args: {
    locale: v.string(),
  },
  returns: v.object({
    posts: v.array(postObject),
  }),
  handler: async (ctx: QueryCtx, { locale }: { locale: string }) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_status_locale_publishedAt", (q: any) =>
        q.eq("status", "published").eq("locale", locale),
      )
      .order("desc")
      .take(2000);

    return {
      posts: posts.map(serializePost),
    };
  },
});

export const listAllPosts = query({
  args: {
    status: v.optional(v.string()),
    locale: v.optional(v.string()),
  },
  returns: v.object({
    posts: v.array(postObject),
  }),
  handler: async (
    ctx: QueryCtx,
    args: {
      status?: string;
      locale?: string;
    },
  ) => {
    await requireAdmin(ctx);

    let posts: Doc<"posts">[];

    if (args.status && args.locale) {
      posts = await ctx.db
        .query("posts")
        .withIndex("by_status_locale_publishedAt", (q: any) =>
          q.eq("status", args.status!).eq("locale", args.locale!),
        )
        .order("desc")
        .take(2000);
    } else if (args.status) {
      posts = await ctx.db
        .query("posts")
        .withIndex("by_status", (q: any) => q.eq("status", args.status!))
        .order("desc")
        .take(2000);
      if (args.locale) {
        posts = posts.filter((post) => post.locale === args.locale);
      }
    } else {
      // @dod:skip-isolation reason="cms-lite host-resolved storefront pre-rewrite — single-tenant deploy assumption; multi-tenant fix tracked under Step 63 (cms-lite quality upgrade)"
      posts = await ctx.db.query("posts").take(500);
      if (args.locale) {
        posts = posts.filter((post) => post.locale === args.locale);
      }
      posts.sort((a, b) => b._creationTime - a._creationTime);
    }

    return {
      posts: posts.map(serializePost),
    };
  },
});

export const getPostBySlug = query({
  args: {
    slug: v.string(),
    locale: v.string(),
  },
  returns: v.object({
    post: postObject,
  }),
  handler: async (
    ctx: QueryCtx,
    { slug, locale }: { slug: string; locale: string },
  ) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug_locale", (q: any) => q.eq("slug", slug).eq("locale", locale))
      .first();

    if (!post) {
      throw new Error("Post not found");
    }

    return {
      post: serializePost(post),
    };
  },
});

export const getPostById = query({
  args: {
    id: v.id("posts"),
  },
  returns: v.object({
    post: postObject,
  }),
  handler: async (ctx: QueryCtx, { id }: { id: Id<"posts"> }) => {
    const post = await ctx.db.get(id);
    if (!post) {
      throw new Error("Post not found");
    }

    return {
      post: serializePost(post),
    };
  },
});

export const getPostRevisions = query({
  args: {
    postId: v.id("posts"),
  },
  returns: v.object({
    revisions: v.array(revisionObject),
  }),
  handler: async (ctx: QueryCtx, { postId }: { postId: Id<"posts"> }) => {
    await requireAdmin(ctx);

    const revisions = await ctx.db
      .query("postRevisions")
      .withIndex("by_post", (q: any) => q.eq("postId", postId))
      .order("desc")
      .take(2000);

    return {
      revisions: revisions.map(serializeRevision),
    };
  },
});

export const searchPosts = query({
  args: {
    query: v.optional(v.string()),
    status: v.optional(v.string()),
    locale: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  returns: v.object({
    posts: v.array(postObject),
    total: v.number(),
  }),
  handler: async (
    ctx: QueryCtx,
    args: {
      query?: string;
      status?: string;
      locale?: string;
      limit?: number;
      offset?: number;
    },
  ) => {
    await requireEditor(ctx);

    const limit = args.limit ?? 20;
    const offset = args.offset ?? 0;

    let posts: Doc<"posts">[];

    if (args.status && args.locale) {
      posts = await ctx.db
        .query("posts")
        .withIndex("by_status_locale_publishedAt", (q: any) =>
          q.eq("status", args.status!).eq("locale", args.locale!),
        )
        .order("desc")
        .take(2000);
    } else if (args.status) {
      posts = await ctx.db
        .query("posts")
        .withIndex("by_status", (q: any) => q.eq("status", args.status!))
        .order("desc")
        .take(2000);
    } else {
      // @dod:skip-isolation reason="cms-lite host-resolved storefront pre-rewrite — single-tenant deploy assumption; multi-tenant fix tracked under Step 63 (cms-lite quality upgrade)"
      posts = await ctx.db.query("posts").take(500);
    }

    if (args.locale && !(args.status && args.locale)) {
      posts = posts.filter((post) => post.locale === args.locale);
    }

    if (args.query) {
      const qLower = args.query.toLowerCase();
      posts = posts.filter((post) => {
        return (
          post.title.toLowerCase().includes(qLower) ||
          (post.excerpt ?? "").toLowerCase().includes(qLower) ||
          post.body.toLowerCase().includes(qLower)
        );
      });
    }

    const total = posts.length;
    const paged = posts.slice(offset, offset + limit);

    return {
      posts: paged.map(serializePost),
      total,
    };
  },
});


