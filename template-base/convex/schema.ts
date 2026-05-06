/**
 * Root Convex schema. Composes per-feature table maps so each feature can
 * own its own schema fragment without colliding at the root.
 *
 * Add a feature: import its tables map and spread it below.
 */

import { defineSchema } from "convex/server";
import { authTables } from "@convex-dev/auth/server";

import { notionTables } from "./features/notion/schema";
import { studioTables } from "./features/studio/api/schema";
import { studioAgentTables } from "./features/studio/api/agentConfig.schema";

export default defineSchema({
  ...authTables,
  ...notionTables,
  ...studioTables,
  ...studioAgentTables,
});
