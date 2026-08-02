/**
 * Canonical Convex auth setup using @convex-dev/auth.
 *
 * Provider list lives in `./auth/providers.ts` so consumers add/remove
 * providers without touching this file. Each OAuth provider is gated on
 * its env vars — missing creds = provider silently dropped, never breaks
 * the build.
 */

import { convexAuth } from "@convex-dev/auth/server";
import { authProviders } from "./auth/providers";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: authProviders,
});

/**
 * Current logged-in user (server-side). Returns null if not signed in.
 * Use from client via useQuery(api.auth.loggedInUser).
 */
export const loggedInUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});
