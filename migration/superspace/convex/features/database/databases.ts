import { query, mutation } from "../../_generated/server";
import { v } from "convex/values";
import { ensureUser, getExistingUserId } from "../../auth/helpers";
import { Doc, Id } from "../../_generated/dataModel";

type Database = Doc<"documents">;

const sortByLastModifiedDesc = (a: Database, b: Database) => {
  const aTime = a.lastModified ?? a._creationTime;
  const bTime = b.lastModified ?? b._creationTime;
  return bTime - aTime;
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) {
      return [];
    }

    const [privateDatabases, publicDatabases] = await Promise.all([
      ctx.db
        .query("documents")
        .withIndex("by_creator", (q) => q.eq("createdBy", userId))
        .take(1000),
      ctx.db
        .query("documents")
        .withIndex("by_isPublic", (q) => q.eq("isPublic", true))
        .take(1000),
    ]);

    const dbsById = new Map<Id<"documents">, Database>();
    for (const db of privateDatabases) {
      dbsById.set(db._id, db);
    }
    for (const db of publicDatabases) {
      if (!dbsById.has(db._id)) {
        dbsById.set(db._id, db);
      }
    }

    return Array.from(dbsById.values()).sort(sortByLastModifiedDesc);
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) {
      return [];
    }

    const trimmedQuery = args.query.trim();
    if (!trimmedQuery) {
      return [];
    }

    const [userResults, publicResults] = await Promise.all([
      ctx.db
        .query("documents")
        .withSearchIndex("search_documents", (q) =>
          q.search("title", trimmedQuery).eq("createdBy", userId)
        )
        .take(10),
      ctx.db
        .query("documents")
        .withSearchIndex("search_documents", (q) =>
          q.search("title", trimmedQuery).eq("isPublic", true)
        )
        .take(10),
    ]);

    const deduped = new Map<Id<"documents">, Database>();
    for (const db of userResults) {
      deduped.set(db._id, db);
    }
    for (const db of publicResults) {
      if (!deduped.has(db._id)) {
        deduped.set(db._id, db);
      }
    }

    return Array.from(deduped.values());
  },
});

export const get = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    const database = await ctx.db.get(args.id);

    if (!database) {
      return null;
    }

    if (!database.isPublic && database.createdBy !== userId) {
      return null;
    }

    return database;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    isPublic: v.boolean(),
    workspaceId: v.id("workspaces"),
    content: v.optional(v.string()),
    parentId: v.optional(v.union(v.id("documents"), v.null())),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    let parentId: Id<"documents"> | undefined;
    if (args.parentId !== undefined) {
      if (args.parentId === null) {
        parentId = undefined;
      } else {
        const parent = await ctx.db.get(args.parentId);
        if (!parent) {
          throw new Error("Parent document not found");
        }
        if (parent.workspaceId !== args.workspaceId) {
          throw new Error("Parent document must belong to the same workspace");
        }
        if (!parent.isPublic && parent.createdBy !== userId) {
          throw new Error("Unauthorized to reference parent document");
        }
        parentId = parent._id;
      }
    }

    return await ctx.db.insert("documents", {
      title: args.title,
      isPublic: args.isPublic,
      createdBy: userId,
      workspaceId: args.workspaceId,
      content: args.content,
      parentId,
      lastModified: Date.now(),
    });
  },
});

export const updateTitle = mutation({
  args: {
    id: v.id("documents"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const database = await ctx.db.get(args.id);
    if (!database) {
      throw new Error("Database not found");
    }

    if (database.createdBy !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, {
      title: args.title,
      lastModified: Date.now(),
    });
  },
});

export const togglePublic = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const database = await ctx.db.get(args.id);
    if (!database) {
      throw new Error("Database not found");
    }

    if (database.createdBy !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, {
      isPublic: !database.isPublic,
      lastModified: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    parentId: v.optional(v.union(v.id("documents"), v.null())),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const database = await ctx.db.get(args.id);
    if (!database) {
      throw new Error("Database not found");
    }

    if (database.createdBy !== userId) {
      throw new Error("Unauthorized");
    }

    const updates: Partial<Database> = {
      lastModified: Date.now(),
    };

    if (args.title !== undefined) {
      updates.title = args.title;
    }
    if (args.content !== undefined) {
      updates.content = args.content;
    }
    if (args.isPublic !== undefined) {
      updates.isPublic = args.isPublic;
    }
    if (args.parentId !== undefined) {
      if (args.parentId === null) {
        updates.parentId = undefined;
      } else {
        const parent = await ctx.db.get(args.parentId);
        if (!parent) {
          throw new Error("Parent document not found");
        }
        if (parent.workspaceId !== database.workspaceId) {
          throw new Error("Parent document must belong to the same workspace");
        }
        if (!parent.isPublic && parent.createdBy !== userId) {
          throw new Error("Unauthorized to reference parent document");
        }
        if (String(parent._id) === String(database._id)) {
          throw new Error("Document cannot be its own parent");
        }
        updates.parentId = parent._id;
      }
    }

    await ctx.db.patch(args.id, updates);
  },
});

export const deleteDatabase = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const database = await ctx.db.get(args.id);
    if (!database) {
      throw new Error("Database not found");
    }

    if (database.createdBy !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});

export const getDatabase = get;
export const createDatabase = create;
export const updateDatabase = update;

export const getWorkspaceDatabases = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) {
      return [];
    }

    const databases = await ctx.db
      .query("documents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .take(1000);

    const visibleDatabases = databases.filter(
      (db) => db.isPublic || db.createdBy === userId
    );

    const withAuthor = await Promise.all(
      visibleDatabases.map(async (db) => {
        const author = await ctx.db.get(db.createdBy);
        return {
          ...db,
          author: author
            ? {
                name: author.name ?? undefined,
                image: author.avatarUrl ?? undefined,
              }
            : undefined,
        };
      })
    );

    return withAuthor.sort(sortByLastModifiedDesc);
  },
});

export const searchDatabases = query({
  args: { workspaceId: v.id("workspaces"), query: v.string() },
  handler: async (ctx, { workspaceId, query: rawQuery }) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) {
      return [];
    }

    const trimmedQuery = rawQuery.trim();
    if (!trimmedQuery) {
      return [];
    }

    const results = await ctx.db
      .query("documents")
      .withSearchIndex("search_documents", (q) =>
        q.search("title", trimmedQuery).eq("workspaceId", workspaceId)
      )
      .take(20);

    const visible = results.filter(
      (db) => db.isPublic || db.createdBy === userId
    );

    const withAuthor = await Promise.all(
      visible.map(async (db) => {
        const author = await ctx.db.get(db.createdBy);
        return {
          ...db,
          author: author
            ? {
                name: author.name ?? undefined,
                image: author.avatarUrl ?? undefined,
              }
            : undefined,
        };
      })
    );

    return withAuthor.sort(sortByLastModifiedDesc);
  },
});
