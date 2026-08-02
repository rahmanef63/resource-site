// Local permission check — a self-contained copy of rbac-roles'
// matchPermission so this slice imports no other slice's frontend (per the
// slice-boundary rule). The actor's resolved permission list is passed in
// as `currentPerms`; wire it from rbac-roles at the app level.

export function matchPermission(granted: string, wanted: string): boolean {
  if (granted === "*") return true;
  if (granted === wanted) return true;
  if (granted.endsWith(".*")) return wanted.startsWith(granted.slice(0, -1));
  return false;
}

export function can(perms: readonly string[], wanted: string): boolean {
  return perms.some((p) => matchPermission(p, wanted));
}
