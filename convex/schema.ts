/**
 * Root schema composer — makes the rr Convex deployment reproducible from
 * `git clone` (before this file, the live backend was schemaless: every
 * `withIndex` call failed at runtime and callers silently fell back).
 *
 * Composition rule (CLAUDE.md hard rule 5): every feature ships its tables
 * as `convex/features/<slug>/_schema.ts` exporting `<slugCamel>Tables`;
 * this file spreads them all. `authTablesExt` extends @convex-dev/auth's
 * library-owned `authTables`, so it spreads AFTER them.
 *
 * Deploy with scripts/deploy-convex-functions.mjs — never `convex codegen`
 * in-repo (convex/_generated stays a hand-written stub for site typecheck).
 */

import { defineSchema } from "convex/server";
import { authTables } from "@convex-dev/auth/server";

import { activityTables } from "./features/activity/_schema";
import { adminTables } from "./features/admin/_schema";
import { aiTables } from "./features/ai/_schema";
import { aiChatTables } from "./features/aiChat/_schema";
import { authTablesExt } from "./features/auth/_schema";
import { bookingsTables } from "./features/bookings/_schema";
import { commentsTables } from "./features/comments/_schema";
import { createYourMcpTables } from "./features/create_your_mcp/_schema";
import { libraryTables } from "./features/library/_schema";
import { newsletterTables } from "./features/newsletter/_schema";
import { notionTables } from "./features/notion/_schema";
import { paymentTables } from "./features/payment/_schema";
import { rateLimitTables } from "./features/rate_limit/_schema";
import { rbacRolesTables } from "./features/rbac_roles/_schema";
import { seoTables } from "./features/seo/_schema";
import { servicesTables } from "./features/services/_schema";
import { subscribersTables } from "./features/subscribers/_schema";
import { telemetryTables } from "./features/telemetry/_schema";
import { testimonialsTables } from "./features/testimonials/_schema";
import { userManagementTables } from "./features/user_management/_schema";

export default defineSchema({
  ...authTables,
  ...authTablesExt,
  ...activityTables,
  ...adminTables,
  ...aiTables,
  ...aiChatTables,
  ...bookingsTables,
  ...commentsTables,
  ...createYourMcpTables,
  ...libraryTables,
  ...newsletterTables,
  ...notionTables,
  ...paymentTables,
  ...rateLimitTables,
  ...rbacRolesTables,
  ...seoTables,
  ...servicesTables,
  ...subscribersTables,
  ...telemetryTables,
  ...testimonialsTables,
  ...userManagementTables,
});
