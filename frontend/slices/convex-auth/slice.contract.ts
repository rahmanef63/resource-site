/**
 * Slice contract for `convex-auth` — Phase A.
 *
 * Mirrors values from this slice's `slice.manifest.json` so both specs stay
 * coherent during the back-compat window.
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "convex-auth",
  version: "0.1.0",
  requires: {
    auth: "convex",
    rbac: ["auth.sign-in", "auth.sign-out", "auth.manage-account"],
    env: ["JWT_PRIVATE_KEY", "JWKS", "SITE_URL", "AUTH_RESEND_KEY"],
    convex: {
      prefix: "auth_",
      tables: ["auth_users", "auth_accounts", "auth_sessions", "auth_verifiers"],
    },
  },
  provides: {
    routes: ["/sign-in"],
    tables: ["auth_users", "auth_accounts", "auth_sessions", "auth_verifiers"],
    components: ["SignInPage"],
  },
});
