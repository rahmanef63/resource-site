import type { Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { resolveCandidateUserIds } from "../../auth/helpers";

/**
 * Narrow context to the operations we support (queries + mutations).
 */
type Ctx = QueryCtx | MutationCtx;

/**
 * Check whether the given user belongs to the workspace via membership records.
 */
export async function hasWorkspaceAccess(
  ctx: Ctx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users"> | string | null | undefined,
): Promise<boolean> {
  const candidateIds = new Set<string>();
  if (userId) {
    candidateIds.add(String(userId));
  }

  try {
    if ("auth" in ctx && typeof (ctx as any).auth?.getUserIdentity === "function") {
      const resolved = await resolveCandidateUserIds(ctx as any);
      for (const id of resolved ?? []) {
        if (id) {
          candidateIds.add(String(id));
        }
      }
    }
  } catch (error) {
    console.warn("[database/utils] resolveCandidateUserIds failed", {
      workspaceId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  if (candidateIds.size === 0) {
    return false;
  }

  for (const candidate of candidateIds) {
    const membership = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user_workspace", (q) =>
        q.eq("userId", candidate as Id<"users">).eq("workspaceId", workspaceId),
      )
      .unique();

    if (membership) {
      return true;
    }
  }

  // Fallback: treat workspace creator as having implicit access even if
  // membership records are missing or in transition.
  const workspace = await ctx.db.get(workspaceId);
  const ownerId = workspace ? String(workspace.createdBy) : null;
  if (workspace && ownerId && candidateIds.has(ownerId)) {
    // Auto-heal missing membership for workspace owners.
    try {
      const ownerRole =
        (await ctx.db
          .query("roles")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
          .filter((q) => q.eq(q.field("slug"), "owner"))
          .first()) ??
        (await ctx.db
          .query("roles")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
          .order("asc")
          .first());

      const fallbackRole =
        ownerRole?._id ??
        workspace.settings?.defaultRoleId ??
        (await ctx.db
          .query("roles")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
          .first())?._id;

      if (fallbackRole) {
        if ("insert" in ctx.db) {
          await ctx.db.insert("workspaceMemberships", {
            workspaceId,
            userId: workspace.createdBy,
            roleId: fallbackRole,
            status: "active",
            joinedAt: Date.now(),
            additionalPermissions: [],
          });
        } else {
          console.warn(
            "[database/utils] Skipping auto-heal membership insert from read-only context",
            { workspaceId, userId: workspace.createdBy },
          );
        }
      } else {
        console.warn("[database/utils] No fallback role found while auto-healing membership", {
          workspaceId,
          userId: workspace.createdBy,
        });
      }
    } catch (error) {
      console.warn("[database/utils] Failed to auto-heal owner membership", {
        workspaceId,
        userId: workspace.createdBy,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return true;
  }

  console.warn("[database/utils] hasWorkspaceAccess: unauthorized", {
    workspaceId,
    userId,
    candidateIds: Array.from(candidateIds),
    workspaceCreatedBy: workspace?.createdBy,
  });

  return false;
}

/**
 * Ensure a user has access to a workspace, throwing if not.
 */
export async function assertWorkspaceAccess(
  ctx: Ctx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users"> | string | null | undefined,
): Promise<void> {
  const allowed = await hasWorkspaceAccess(ctx, workspaceId, userId);
  if (!allowed) {
    throw new Error("Unauthorized");
  }
}

/**
 * Calculate the next order/position value when appending to an ordered collection.
 */
export function nextOrderValue<T extends { position?: number }>(items: T[]): number {
  if (items.length === 0) {
    return 0;
  }

  const positions = items.map((item) => item.position ?? 0);
  return Math.max(...positions) + 1;
}
