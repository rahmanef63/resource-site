import { api } from "../../_generated/api";
import { FeatureAgent } from "../ai/lib/types";
import { z } from "zod";

const contentTypeSchema = z.enum(["image", "video", "audio", "document", "link"]);
const contentStatusSchema = z.enum(["draft", "processing", "ready", "failed", "archived"]);

export const agent: FeatureAgent = {
  tools: {
    create: {
      description: "Create a new content library item from an uploaded file or external URL.",
      type: "mutation",
      handler: api.shared.content.mutations.create,
      args: z.object({
        workspaceId: z.string().describe("Workspace ID"),
        name: z.string().describe("Display name for the content item"),
        type: contentTypeSchema.describe("Type of content"),
        description: z.string().optional().describe("Optional description"),
        url: z.string().optional().describe("External URL for link content or remote assets"),
        folder: z.string().optional().describe("Virtual folder name"),
        tags: z.array(z.string()).optional().describe("Tags to attach"),
        isFavorite: z.boolean().optional().describe("Whether to mark as favorite"),
      }),
    },
    list: {
      description: "List content items in the workspace with optional filters.",
      type: "query",
      handler: api.shared.content.queries.list,
      args: z.object({
        workspaceId: z.string().describe("Workspace ID"),
        type: contentTypeSchema.optional(),
        status: contentStatusSchema.optional(),
        folder: z.string().optional(),
        tags: z.array(z.string()).optional(),
        favoriteOnly: z.boolean().optional(),
        aiGeneratedOnly: z.boolean().optional(),
        unusedOnly: z.boolean().optional(),
        recentOnly: z.boolean().optional(),
        sortBy: z.enum(["name", "createdAt", "updatedAt", "fileSize", "usageCount"]).optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
        limit: z.number().int().positive().max(100).optional(),
        cursor: z.string().optional(),
      }),
    },
    search: {
      description: "Search content items by name.",
      type: "query",
      handler: api.shared.content.queries.search,
      args: z.object({
        workspaceId: z.string().describe("Workspace ID"),
        query: z.string().describe("Search text"),
        type: contentTypeSchema.optional(),
        status: contentStatusSchema.optional(),
        limit: z.number().int().positive().max(50).optional(),
      }),
    },
    get: {
      description: "Get details for a specific content item.",
      type: "query",
      handler: api.shared.content.queries.get,
      args: z.object({
        workspaceId: z.string().describe("Workspace ID"),
        contentId: z.string().describe("Content item ID"),
      }),
    },
    update: {
      description: "Update content metadata such as title, folder, tags, favorite state, or status.",
      type: "mutation",
      handler: api.shared.content.mutations.update,
      args: z.object({
        workspaceId: z.string().describe("Workspace ID"),
        contentId: z.string().describe("Content item ID"),
        name: z.string().optional(),
        description: z.string().optional(),
        status: contentStatusSchema.optional(),
        tags: z.array(z.string()).optional(),
        folder: z.string().optional(),
        isFavorite: z.boolean().optional(),
      }),
    },
    delete: {
      description: "Delete a content item from the library.",
      type: "mutation",
      handler: api.shared.content.mutations.remove,
      args: z.object({
        workspaceId: z.string().describe("Workspace ID"),
        contentId: z.string().describe("Content item ID"),
      }),
    },
  },
};
