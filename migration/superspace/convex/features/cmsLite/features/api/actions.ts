import { action } from "../../_generated";
import { v } from "convex/values";
import type { FunctionReference } from "convex/server";
import { api as rootApi } from "../../../../_generated/api";

type FeatureQueryRefs = {
  listAll: FunctionReference<"query">;
  listGroups: FunctionReference<"query">;
  getFeature: FunctionReference<"query">;
};

type FeatureMutationRefs = {
  upsertFeature: FunctionReference<"mutation">;
  upsertGroup: FunctionReference<"mutation">;
};

type FeatureExportRecord = {
  key: string;
  status: string;
  type: string;
  displayOrder: number;
  translations: Record<
    string,
    {
      title: string;
      description?: string;
      icon?: string;
    }
  >;
  settings?: Record<string, unknown>;
  requiredRoles?: string[];
  dependencies?: string[];
  metadata?: Record<string, unknown>;
};

type FeatureGroupExportRecord = {
  name: string;
  status: string;
  displayOrder: number;
  translations: Record<
    string,
    {
      title: string;
      description?: string;
      icon?: string;
    }
  >;
  features: string[];
  metadata?: Record<string, unknown>;
};

const featureQueries = (rootApi as any)[
  "features/cms_lite/features/api/queries"
] as FeatureQueryRefs;
const featureMutations = (rootApi as any)[
  "features/cms_lite/features/api/mutations"
] as FeatureMutationRefs;

/**
 * Export features configuration to JSON
 */
export const exportJson = action({
  args: {
    workspaceId: v.string(),
    includeGroups: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get all features
    const features = (await ctx.runQuery(featureQueries.listAll, {
      workspaceId: args.workspaceId,
      locale: "en", // Get English as base locale
    })) as FeatureExportRecord[];

    // Get groups if requested
    let groups = undefined;
    if (args.includeGroups) {
      groups = (await ctx.runQuery(featureQueries.listGroups, {
        workspaceId: args.workspaceId,
        locale: "en",
      })) as FeatureGroupExportRecord[];
    }

    const exported = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      features: features.map((feature: FeatureExportRecord) => ({
        key: feature.key,
        status: feature.status,
        type: feature.type,
        displayOrder: feature.displayOrder,
        translations: feature.translations,
        settings: feature.settings,
        requiredRoles: feature.requiredRoles,
        dependencies: feature.dependencies,
        metadata: feature.metadata,
      })),
      groups: groups?.map((group: FeatureGroupExportRecord) => ({
        name: group.name,
        status: group.status,
        displayOrder: group.displayOrder,
        translations: group.translations,
        features: group.features,
        metadata: group.metadata,
      })),
    };

    return exported;
  },
});

/**
 * Import features from JSON configuration
 */
export const importJson = action({
  args: {
    workspaceId: v.string(),
    content: v.string(), // Base64 encoded JSON
    options: v.optional(v.object({
      overwrite: v.optional(v.boolean()),
      importGroups: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args) => {
    const options = args.options || {};
    
    try {
      // Parse imported content
      const content = JSON.parse(Buffer.from(args.content, "base64").toString());
      
      // Validate format
      if (!content.features || !Array.isArray(content.features)) {
        throw new Error("Invalid import format - missing features array");
      }

      const results = {
        featuresCreated: 0,
        featuresUpdated: 0,
        featuresSkipped: 0,
        groupsCreated: 0,
        groupsUpdated: 0,
        groupsSkipped: 0,
      };

      // Import features
      for (const feature of content.features) {
        try {
          // Check if feature exists
          const existing = (await ctx.runQuery(featureQueries.getFeature, {
            workspaceId: args.workspaceId,
            key: feature.key,
            locale: "en",
          })) as FeatureExportRecord | null;

          if (existing && !options.overwrite) {
            results.featuresSkipped++;
            continue;
          }

          await ctx.runMutation(featureMutations.upsertFeature, {
            workspaceId: args.workspaceId,
            ...feature,
            updatedBy: "import",
          });

          existing ? results.featuresUpdated++ : results.featuresCreated++;
        } catch (err) {
          results.featuresSkipped++;
          console.error("Failed to import feature:", feature.key, err);
        }
      }

      // Import groups if present and requested
      if (content.groups && options.importGroups) {
        for (const group of content.groups) {
          try {
            // Check existing group
            const existingGroups = (await ctx.runQuery(
              featureQueries.listGroups,
              {
                workspaceId: args.workspaceId,
                locale: "en",
              },
            )) as FeatureGroupExportRecord[];
            const existing = existingGroups.find(
              (currentGroup: FeatureGroupExportRecord) =>
                currentGroup.name === group.name,
            );

            if (existing && !options.overwrite) {
              results.groupsSkipped++;
              continue;
            }

            await ctx.runMutation(featureMutations.upsertGroup, {
              workspaceId: args.workspaceId,
              ...group,
            });

            existing ? results.groupsUpdated++ : results.groupsCreated++;
          } catch (err) {
            results.groupsSkipped++;
            console.error("Failed to import group:", group.name, err);
          }
        }
      }

      return results;

    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Failed to import features: " + error.message);
      }
      throw new Error("Failed to import features: Unknown error");
    }
  },
});

