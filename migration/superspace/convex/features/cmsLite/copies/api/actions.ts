import { action } from "../../_generated";
import { v } from "convex/values";
import { Doc, Id } from "../../_generated";
import { api } from "../../_generated";

/**
 * Export copies to a translation service
 */
export const exportToTranslationService = action({
  args: {
    workspaceId: v.string(),
    group: v.string(),
    targetLocales: v.array(v.string()),
    serviceConfig: v.object({
      provider: v.string(),
      apiKey: v.string(),
      projectId: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    // Get all copies in the group
    const copies = await ctx.runQuery(api.copies.queries.listCopiesByGroup, {
      workspaceId: args.workspaceId,
      group: args.group,
    });

    // Format data for translation service
    const translationBatch = copies.map((copy: Doc<"copies">) => ({
      key: copy.key,
      source: copy.translations["en"]?.content || "", // Assuming English is source
      context: copy.translations["en"]?.description || "",
    }));

    // TODO: Implement translation service API call
    // This would typically:
    // 1. Upload content to translation service
    // 2. Get back job ID or immediate results
    // 3. Update copies with new translations
    
    return {
      status: "queued",
      itemCount: copies.length,
      targetLocales: args.targetLocales,
    };
  },
});

/**
 * Import translations from a file
 */
export const importFromFile = action({
  args: {
    workspaceId: v.string(),
    group: v.string(),
    locale: v.string(),
    fileContent: v.string(), // Base64 encoded JSON
  },
  handler: async (ctx, args) => {
    try {
      // Parse imported content
      const content = JSON.parse(Buffer.from(args.fileContent, "base64").toString());
      
      // Validate format
      if (!Array.isArray(content)) {
        throw new Error("Invalid import format - expected array");
      }

      // Process each translation
      for (const item of content) {
        if (!item.key || !item.content) {
          console.warn("Skipping invalid import item:", item);
          continue;
        }

        // Update copy with new translation
        await ctx.runMutation(api.copies.mutations.upsertCopy, {
          workspaceId: args.workspaceId,
          key: item.key,
          group: args.group,
          status: "active",
          translations: {
            [args.locale]: {
              content: item.content,
              description: item.description || "",
              updatedAt: Date.now(),
              updatedBy: "import",
            },
          },
        });
      }

      return {
        status: "success",
        importedCount: content.length,
      };
    } catch (error) {
      console.error("Import failed:", error);
      if (error instanceof Error) {
        throw new Error("Failed to import translations: " + error.message);
      }
      throw new Error("Failed to import translations: Unknown error");
    }
  },
});

