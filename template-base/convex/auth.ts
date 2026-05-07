/**
 * Canonical Convex auth setup using @convex-dev/auth.
 * Replace auth entirely. Add OAuth providers as needed.
 */

import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, GitHub, Google],
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
