/**
 * Root Convex schema. Composes per-feature table maps so each feature can
 * own its own schema fragment without colliding at the root.
 *
 * Add a feature: import its tables map and spread it below.
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// Extend the @convex-dev/auth users table with the indexes + fields RBAC
// helpers expect. authTables.users ships only by_email / by_phone; the
// kitab's RBAC layer (convex/lib/rbac/permissions.ts) looks users up by
// auth subject, so we add `subject` + `clerkId` (legacy) + an index. All
// fields optional so existing inserts via @convex-dev/auth don't break.
const extendedAuthTables = {
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Custom extensions
    subject: v.optional(v.string()),
    clerkId: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
    avatarUrl: v.optional(v.string()),
    status: v.optional(v.string()),
    workspaceId: v.optional(v.id("workspaces")),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_auth_subject", ["subject"])
    .index("by_clerk_id", ["clerkId"]),
};

import { authRbacTables } from "./auth/schema";
import { auditTables } from "./lib/audit/schema";
import { chatTables } from "./features/chat/schema";
import { aiTables } from "./features/ai/schema";
import { menuTables } from "./features/menus/schema";
import { socialTables } from "./features/social/schema";
import { notionTables } from "./features/notion/schema";
import { studioTables } from "./features/studio/api/schema";
import { studioAgentTables } from "./features/studio/api/agentConfig.schema";
import { databaseTables } from "./features/database/schema";
import { documentsTables } from "./features/documents/schema";
import { analyticsTables } from "./features/analytics/schema";

// Selective imports — each feature exports many tables but we cherry-pick
// only the ones that don't collide with other feature schemas.
import { invitations, workspaceLinks } from "./features/core/schema";
import { systemNotifications } from "./features/notifications/schema";
import { exampleTables } from "./features/example.schema";
import industryTemplatesTables from "./features/industryTemplates/schema";

// Cross-feature shared utilities. Each ships its own defineSchema default
// export from superspace; we reach into `.tables` to spread into the root.
import activitySchema from "./shared/activity/schema";
import attachmentsSchema from "./shared/attachments/schema";
import commentsSchema from "./shared/comments/schema";
import customFieldsSchema from "./shared/customFields/schema";
import favoritesSchema from "./shared/favorites/schema";
import searchSchema from "./shared/search/schema";

export default defineSchema({
  ...extendedAuthTables,
  ...authRbacTables,
  ...auditTables,
  ...chatTables,
  ...aiTables,
  ...menuTables,
  ...socialTables,
  ...notionTables,
  ...studioTables,
  ...studioAgentTables,
  ...databaseTables,
  ...documentsTables,
  ...analyticsTables,
  invitations,
  workspaceLinks,
  systemNotifications,
  ...exampleTables,
  ...industryTemplatesTables,
  ...activitySchema.tables,
  ...attachmentsSchema.tables,
  ...commentsSchema.tables,
  ...customFieldsSchema.tables,
  ...favoritesSchema.tables,
  ...searchSchema.tables,
});
