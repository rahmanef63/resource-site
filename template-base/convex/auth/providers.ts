/**
 * Auth providers — pluggable list assembled here so `convex/auth.ts` stays
 * one-line. Consumers opt in/out by editing this file (or by gating each
 * provider on the env var that owns its credentials).
 *
 * Long-term shape:
 * - **Password**: ships from `@convex-dev/auth/providers/Password`. Always
 *   on by default — single source of friction for existing users.
 * - **OAuth providers**: each one only loads when its required env vars
 *   are present in `process.env`. That way a consumer that ships email-
 *   only auth never has to import GitHub/Google. The env-gating is
 *   purely additive — a missing OAuth env doesn't break the build, the
 *   provider just isn't included in the providers array.
 *
 * To add a provider:
 * 1. Import its constructor.
 * 2. Append it (or its env-gated variant) below.
 *
 * Anything more elaborate (per-tenant providers, custom sign-in pages)
 * belongs in the consumer app, not the kitab.
 */

import { Password } from "@convex-dev/auth/providers/Password";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";

const providers: any[] = [Password];

if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(GitHub);
}
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(Google);
}

export const authProviders = providers;
