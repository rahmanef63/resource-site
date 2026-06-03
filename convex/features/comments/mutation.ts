/**
 * comments mutations — v0.2.0 generic, props-driven via TargetRef.
 *
 * Tenant + actor are resolved by the consumer's TenantAdapter (see
 * frontend/slices/audit-log/types/index.ts for the adapter shape — same
 * pattern reused). For slice template purposes, this file uses
 * `getAuthUserId` directly; consumers should swap in their own resolver.
 */

import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "../../_generated/dataModel";

const targetValidator = v.object({
  kind: v.string(),
  id: v.string(),
  subId: v.optional(v.string()),
});

export const create = mutation({
  args: {
    target: targetValidator,
    body: v.string(),
    tenantId: v.union(v.string(), v.null()),
    parentId: v.optional(v.id("comment_threads")),
  },
  handler: async (ctx, args) => {
    const actor = await getAuthUserId(ctx);
    if (!actor) throw new Error("Not authenticated");
    const now = Date.now();
    return await ctx.db.insert("comment_threads", {
      tenantId: args.tenantId,
      actorId: actor.toString(),
      targetKind: args.target.kind,
      targetId: args.target.id,
      targetSubId: args.target.subId,
      parentId: args.parentId,
      body: args.body,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: { id: v.string(), body: v.string() },
  handler: async (ctx, args) => {
    const actor = await getAuthUserId(ctx);
    if (!actor) throw new Error("Not authenticated");
    const c = await ctx.db.get(args.id as Id<"comment_threads">);
    if (!c || c.actorId !== actor.toString()) throw new Error("Not found");
    await ctx.db.patch(args.id as Id<"comment_threads">, {
      body: args.body,
      updatedAt: Date.now(),
    });
  },
});

export const resolve = mutation({
  args: { id: v.string(), resolved: v.boolean() },
  handler: async (ctx, args) => {
    const actor = await getAuthUserId(ctx);
    if (!actor) throw new Error("Not authenticated");
    const c = await ctx.db.get(args.id as Id<"comment_threads">);
    if (!c) throw new Error("Not found");
    await ctx.db.patch(c._id, {
      resolvedAt: args.resolved ? Date.now() : undefined,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const actor = await getAuthUserId(ctx);
    if (!actor) throw new Error("Not authenticated");
    const c = await ctx.db.get(args.id as Id<"comment_threads">);
    if (!c || c.actorId !== actor.toString()) return;
    await ctx.db.patch(c._id, { deletedAt: Date.now() });
  },
});
