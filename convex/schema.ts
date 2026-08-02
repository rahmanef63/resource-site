/**
 * rr's OWN backend schema (api-resource.rahmanef.com).
 *
 * The rr site is a feature LIBRARY: slice demos run on client-side
 * localStorage adapters, NOT Convex. The only thing rr-the-site runs on
 * Convex is the admin-login rate limiter. So this deployed schema composes
 * exactly ONE feature — `rate_limit`. Nothing else.
 *
 * Every other `convex/features/<slug>/_schema.ts` is COPY-SOURCE: shipped
 * verbatim by `npx rr add <slug>` and composed into the CONSUMER's root
 * schema, never into rr's. That's the modular contract — rr deploys what
 * rr uses; consumers deploy what they download.
 *
 * Consumer composition pattern (in their own convex/schema.ts):
 *
 *   import { defineSchema } from "convex/server";
 *   import { authTables } from "@convex-dev/auth/server";
 *   import { paymentTables } from "./features/payment/_schema";
 *   import { commentsTables } from "./features/comments/_schema";
 *   export default defineSchema({ ...authTables, ...paymentTables, ...commentsTables });
 *
 * Deploy rr's backend with `npm run deploy:convex` (admin-only allowlist).
 */

import { defineSchema } from "convex/server";
import { rateLimitTables } from "./features/rate_limit/_schema";

export default defineSchema({
  ...rateLimitTables,
});
