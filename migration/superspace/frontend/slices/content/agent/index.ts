import type { AgentDefinition } from "@/frontend/shared/ai";
import { subAgentRegistry } from "@/frontend/shared/ai/agent";
import type { SubAgent, SubAgentContext, ToolResult } from "@/frontend/shared/ai/agent";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";

export const agent: AgentDefinition = {
  name: "Content Agent",
  description: "Manage content library items, search assets, and organize folders.",
  icon: "Library",
  capabilities: ["create", "read", "update", "delete", "search"],
  prompts: {
    system: `You are the Content Library assistant. Help users search, create, organize, and remove assets in the workspace content library. Prefer precise folder, tag, and content-type filters when they are available.`,
  },
};

const ensureContext = (ctx: SubAgentContext) => {
  if (!ctx.workspaceId) {
    return { error: "No workspace selected" };
  }
  if (!ctx.convex) {
    return { error: "Database client not available" };
  }
  return null;
};

const listContentHandler = async (
  params: Record<string, any>,
  ctx: SubAgentContext,
): Promise<ToolResult> => {
  const contextError = ensureContext(ctx);
  if (contextError) return { success: false, error: contextError.error };

  try {
    const result = await (ctx.convex as any).action(api.features.ai.actions.callFeatureAgent, {
      workspaceId: ctx.workspaceId,
      feature: "content",
      tool: "list",
      args: {
        workspaceId: ctx.workspaceId,
        type: params.type,
        status: params.status,
        folder: params.folder,
        tags: params.tags,
        favoriteOnly: params.favoriteOnly,
        aiGeneratedOnly: params.aiGeneratedOnly,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        limit: params.limit,
      },
    });

    if (!result.success) throw new Error(result.error);

    const items = result.data?.items ?? [];
    return {
      success: true,
      data: items.map((item: any) => ({
        id: item._id,
        name: item.name,
        type: item.type,
        status: item.status,
        folder: item.folder,
        tags: item.tags ?? [],
        fileUrl: item.fileUrl,
      })),
      message: `Found ${items.length} content item(s)`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list content",
    };
  }
};

const searchContentHandler = async (
  params: Record<string, any>,
  ctx: SubAgentContext,
): Promise<ToolResult> => {
  const contextError = ensureContext(ctx);
  if (contextError) return { success: false, error: contextError.error };

  try {
    const result = await (ctx.convex as any).action(api.features.ai.actions.callFeatureAgent, {
      workspaceId: ctx.workspaceId,
      feature: "content",
      tool: "search",
      args: {
        workspaceId: ctx.workspaceId,
        query: params.query,
        type: params.type,
        status: params.status,
        limit: params.limit,
      },
    });

    if (!result.success) throw new Error(result.error);

    return {
      success: true,
      data: result.data ?? [],
      message: `Search returned ${(result.data ?? []).length} item(s)`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to search content",
    };
  }
};

const createContentHandler = async (
  params: Record<string, any>,
  ctx: SubAgentContext,
): Promise<ToolResult> => {
  const contextError = ensureContext(ctx);
  if (contextError) return { success: false, error: contextError.error };

  try {
    const result = await (ctx.convex as any).action(api.features.ai.actions.callFeatureAgent, {
      workspaceId: ctx.workspaceId,
      feature: "content",
      tool: "create",
      args: {
        workspaceId: ctx.workspaceId,
        name: params.name,
        type: params.type,
        description: params.description,
        url: params.url,
        folder: params.folder,
        tags: params.tags,
        isFavorite: params.isFavorite,
      },
    });

    if (!result.success) throw new Error(result.error);

    return {
      success: true,
      data: { contentId: result.data },
      message: `Created content item "${params.name}"`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create content",
    };
  }
};

const updateContentHandler = async (
  params: Record<string, any>,
  ctx: SubAgentContext,
): Promise<ToolResult> => {
  const contextError = ensureContext(ctx);
  if (contextError) return { success: false, error: contextError.error };

  try {
    const result = await (ctx.convex as any).action(api.features.ai.actions.callFeatureAgent, {
      workspaceId: ctx.workspaceId,
      feature: "content",
      tool: "update",
      args: {
        workspaceId: ctx.workspaceId,
        contentId: params.contentId,
        name: params.name,
        description: params.description,
        status: params.status,
        tags: params.tags,
        folder: params.folder,
        isFavorite: params.isFavorite,
      },
    });

    if (!result.success) throw new Error(result.error);

    return {
      success: true,
      data: { contentId: result.data },
      message: "Updated content item",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update content",
    };
  }
};

const deleteContentHandler = async (
  params: Record<string, any>,
  ctx: SubAgentContext,
): Promise<ToolResult> => {
  const contextError = ensureContext(ctx);
  if (contextError) return { success: false, error: contextError.error };

  try {
    const result = await (ctx.convex as any).action(api.features.ai.actions.callFeatureAgent, {
      workspaceId: ctx.workspaceId,
      feature: "content",
      tool: "delete",
      args: {
        workspaceId: ctx.workspaceId,
        contentId: params.contentId,
      },
    });

    if (!result.success) throw new Error(result.error);

    return {
      success: true,
      data: result.data,
      message: "Deleted content item",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete content",
    };
  }
};

const contentAgent: SubAgent = {
  id: "content-agent",
  name: "Content Agent",
  description: "Helps manage content library and generation workflows.",
  featureId: "content",
  icon: "Library",
  tools: [
    {
      name: "list",
      description: "List content items in the current workspace.",
      parameters: {
        type: {
          type: "string",
          description: "Optional content type filter",
          enum: ["image", "video", "audio", "document", "link"],
        },
        status: {
          type: "string",
          description: "Optional status filter",
          enum: ["draft", "processing", "ready", "failed", "archived"],
        },
        folder: {
          type: "string",
          description: "Optional folder filter",
        },
        limit: {
          type: "number",
          description: "Maximum number of items to return",
        },
      },
      handler: listContentHandler,
    },
    {
      name: "search",
      description: "Search content items by name.",
      parameters: {
        query: {
          type: "string",
          description: "Search text",
          required: true,
        },
        type: {
          type: "string",
          description: "Optional content type filter",
          enum: ["image", "video", "audio", "document", "link"],
        },
        limit: {
          type: "number",
          description: "Maximum number of results to return",
        },
      },
      handler: searchContentHandler,
    },
    {
      name: "create",
      description: "Create a new content item from metadata or an external URL.",
      parameters: {
        name: {
          type: "string",
          description: "Content name",
          required: true,
        },
        type: {
          type: "string",
          description: "Content type",
          required: true,
          enum: ["image", "video", "audio", "document", "link"],
        },
        description: {
          type: "string",
          description: "Optional description",
        },
        url: {
          type: "string",
          description: "Optional external URL",
        },
        folder: {
          type: "string",
          description: "Optional folder name",
        },
        tags: {
          type: "array",
          description: "Optional tags",
          items: {
            type: "string",
            description: "Tag value",
          },
        },
      },
      handler: createContentHandler,
    },
    {
      name: "update",
      description: "Update an existing content item.",
      parameters: {
        contentId: {
          type: "string",
          description: "Content item ID",
          required: true,
        },
        name: {
          type: "string",
          description: "Updated name",
        },
        description: {
          type: "string",
          description: "Updated description",
        },
        status: {
          type: "string",
          description: "Updated status",
          enum: ["draft", "processing", "ready", "failed", "archived"],
        },
        folder: {
          type: "string",
          description: "Updated folder",
        },
      },
      handler: updateContentHandler,
    },
    {
      name: "delete",
      description: "Delete a content item.",
      parameters: {
        contentId: {
          type: "string",
          description: "Content item ID",
          required: true,
        },
      },
      handler: deleteContentHandler,
    },
  ],
  canHandle: (query) => {
    const q = query.toLowerCase();
    if (q.includes("content") || q.includes("asset") || q.includes("media") || q.includes("library")) return 0.8;
    if (q.includes("image") || q.includes("video") || q.includes("folder") || q.includes("tag")) return 0.5;
    return 0;
  },
  suggestions: [
    {
      label: "Product photo",
      prompt: "A professional product photo with clean background",
      category: "Image",
    },
    {
      label: "Flat illustration",
      prompt: "An illustration in flat design style",
      category: "Image",
    },
    {
      label: "Intro animation",
      prompt: "A video intro animation",
      category: "Video",
    },
    {
      label: "Voiceover",
      prompt: "A voiceover for product demo",
      category: "Audio",
    },
    {
      label: "Hero image",
      prompt: "A hero image for landing page",
      category: "Image",
    },
  ],
};

export { contentAgent };

export function registerContentAgent() {
  subAgentRegistry.register(contentAgent, { priority: 10, enabled: true });
}
