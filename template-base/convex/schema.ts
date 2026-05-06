/**
 * Root Convex schema. Composes per-feature table maps so each feature can
 * own its own schema fragment without colliding at the root.
 *
 * Add a feature: import its tables map and spread it below.
 */

import { defineSchema } from "convex/server";
import { authTables } from "@convex-dev/auth/server";

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
  ...authTables,
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
