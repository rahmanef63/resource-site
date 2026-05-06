/**
 * Studio extraction stub (single-tenant resources/).
 *
 * Original: superspace/convex/features/database/utils.ts. Single-tenant means
 * any signed-in user can access any workspace, so `hasWorkspaceAccess`
 * returns true once auth is present.
 *
 * TODO: re-add real membership check on re-merge.
 */

import type { Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";

export async function hasWorkspaceAccess(
  _ctx: QueryCtx | MutationCtx,
  _workspaceId: Id<"workspaces">,
  userId: Id<"users"> | string | null | undefined,
): Promise<boolean> {
  return Boolean(userId);
}
