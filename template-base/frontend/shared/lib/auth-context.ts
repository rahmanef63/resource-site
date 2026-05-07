/**
 * Auth-context stub. Re-exports @convex-dev/auth helpers + shapes that
 * the kitab UI expects. Original superspace had a richer context with
 * clerk identities; the kitab stubs to the @convex-dev/auth pattern.
 */

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export type AuthUser = {
  _id: Id<"users">;
  email?: string;
  name?: string;
};

export function useAuthUser(): AuthUser | null {
  const user = useQuery((api as any).auth?.getCurrentUser ?? (api as any).users?.getCurrentUser);
  return (user as AuthUser | null | undefined) ?? null;
}

export function useIsAuthenticated(): boolean {
  return Boolean(useAuthUser());
}

export function useAuth(): { user: AuthUser | null; isAuthenticated: boolean } {
  const user = useAuthUser();
  return { user, isAuthenticated: Boolean(user) };
}
