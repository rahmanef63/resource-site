// Access-matrix types (P4c). Kept in their own file so types.ts stays
// under the 200-LOC cap. The matrix is the one surface that needs tenant
// DISPLAY names — rr doesn't own tenants, so the consumer supplies them.

export interface TenantNode {
  id: string | null;
  name: string;
  depth?: number;
}

export interface MatrixUser {
  userId: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
}

/** userId -> tenantKey(tenantId) -> roleSlug */
export type AccessCells = Record<string, Record<string, string>>;

export interface AccessMatrixLabels {
  member: string;
  noAccess: string;
  empty: string;
}

export const DEFAULT_ACCESS_LABELS: AccessMatrixLabels = {
  member: "Member",
  noAccess: "—",
  empty: "No members across these workspaces.",
};

/** Stable cell key for a tenant id (handles the null single-tenant root).
 *  Mirror this in the convex getAccessMatrix query. */
export function tenantKey(id: string | null): string {
  return id ?? "__root__";
}
