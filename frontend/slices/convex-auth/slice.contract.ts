/**
 * Slice contract for `convex-auth`.
 *
 * Mirrors values from this slice's `slice.manifest.json`. Bumped 0.1.0 →
 * 0.2.0 with the lift from CareerPack (2026-05-17): adds Password + Anonymous
 * + Google providers, the production `<SignInPage>` with i18n, and a slice-
 * local `useAuthFlow` hook on top of the existing Resend magic-link wiring.
 *
 * Additive only — no breaking changes to the schema or env surface.
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "convex-auth",
  version: "0.4.0",
  requires: {
    auth: "convex",
    rbac: ["auth.sign-in", "auth.sign-out", "auth.manage-account"],
    env: [
      "JWT_PRIVATE_KEY",
      "JWKS",
      "SITE_URL",
      // The remaining env vars are conditional — see slice.manifest.json.
      // Required only when the matching provider is enabled.
      "AUTH_RESEND_KEY",
      "AUTH_GOOGLE_ID",
      "AUTH_GOOGLE_SECRET",
    ],
    convex: {
      prefix: "auth_",
      tables: ["auth_users", "auth_accounts", "auth_sessions", "auth_verifiers"],
    },
  },
  provides: {
    tools: ["convex-auth.configure"],
    routes: ["/sign-in"],
    tables: ["auth_users", "auth_accounts", "auth_sessions", "auth_verifiers"],
    components: ["SignInPage"],
    hooks: ["useAuthFlow"],
    helpers: ["extractAuthError", "validatePassword", "looksLikeAutofillBug"],
  },
  generalization: {
    level: "portable",
  },
});
