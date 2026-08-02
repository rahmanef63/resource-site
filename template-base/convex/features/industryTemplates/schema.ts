import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Industry Templates Schema
 * 
 * Pre-configured workspace bundles for specific industries
 * Provides rapid setup with industry-specific features, roles, and configurations
 */

// Template categories for different industries
const industryCategory = v.union(
  v.literal("restaurant"),
  v.literal("retail"),
  v.literal("healthcare"),
  v.literal("education"),
  v.literal("professional_services"),
  v.literal("manufacturing"),
  v.literal("hospitality"),
  v.literal("real_estate"),
  v.literal("fitness"),
  v.literal("salon_spa"),
  v.literal("automotive"),
  v.literal("construction"),
  v.literal("nonprofit"),
  v.literal("technology"),
  v.literal("creative_agency"),
  v.literal("logistics"),
  v.literal("custom")
);

// Feature modules that can be included in templates
const featureModule = v.union(
  v.literal("pos"),
  v.literal("inventory"),
  v.literal("crm"),
  v.literal("marketing"),
  v.literal("hr"),
  v.literal("accounting"),
  v.literal("projects"),
  v.literal("support"),
  v.literal("bi"),
  v.literal("forms"),
  v.literal("workflows"),
  v.literal("docs"),
  v.literal("chat"),
  v.literal("calendar"),
  v.literal("bookings"),
  v.literal("cms"),
  v.literal("analytics"),
  v.literal("integrations"),
  v.literal("notifications"),
  v.literal("tasks")
);

// Template visibility
const templateVisibility = v.union(
  v.literal("public"),      // Available to all users
  v.literal("private"),     // Created by user, only visible to them
  v.literal("organization") // Visible within an organization
);

/**
 * industryTemplates - Pre-built workspace configurations
 */
export const industryTemplatesTable = defineTable({
  // Basic Info
  name: v.string(),
  description: v.string(),
  category: industryCategory,
  subcategory: v.optional(v.string()), // e.g., "fast_food", "fine_dining" for restaurant
  
  // Template Content
  features: v.array(featureModule),
  
  // Pre-configured settings for each feature
  featureConfigs: v.optional(v.record(v.string(), v.any())),
  
  // Default roles and permissions
  defaultRoles: v.array(v.object({
    name: v.string(),
    description: v.string(),
    permissions: v.array(v.string()),
    isDefault: v.optional(v.boolean()),
  })),
  
  // Sample data to seed
  sampleData: v.optional(v.object({
    products: v.optional(v.number()),
    customers: v.optional(v.number()),
    documents: v.optional(v.number()),
    workflows: v.optional(v.number()),
  })),
  
  // Dashboard widgets pre-configured
  dashboardWidgets: v.optional(v.array(v.object({
    type: v.string(),
    title: v.string(),
    config: v.any(),
    position: v.object({
      x: v.number(),
      y: v.number(),
      w: v.number(),
      h: v.number(),
    }),
  }))),
  
  // Recommended integrations
  recommendedIntegrations: v.optional(v.array(v.string())),
  
  // Visual customization
  branding: v.optional(v.object({
    primaryColor: v.optional(v.string()),
    logo: v.optional(v.string()),
    favicon: v.optional(v.string()),
  })),
  
  // Metadata
  visibility: templateVisibility,
  createdBy: v.optional(v.id("users")), // null for system templates
  version: v.string(),
  isOfficial: v.boolean(), // System-provided templates
  rating: v.optional(v.number()),
  usageCount: v.number(),
  tags: v.array(v.string()),
  
  // Pricing (for premium templates)
  isPremium: v.boolean(),
  price: v.optional(v.number()),
  
  // Preview
  previewImages: v.optional(v.array(v.string())),
  demoUrl: v.optional(v.string()),
})
  .index("by_category", ["category"])
  .index("by_visibility", ["visibility"])
  .index("by_created_by", ["createdBy"])
  .index("by_is_official", ["isOfficial"])
  .index("by_usage_count", ["usageCount"])
  .searchIndex("search_templates", {
    searchField: "name",
    filterFields: ["category", "visibility", "isOfficial"],
  });

/**
 * templateInstallations - Track template usage
 */
export const templateInstallationsTable = defineTable({
  templateId: v.id("industryTemplates"),
  workspaceId: v.id("workspaces"),
  installedBy: v.id("users"),
  installedAt: v.number(),
  
  // Installation options chosen
  options: v.object({
    includeSampleData: v.boolean(),
    selectedFeatures: v.array(featureModule),
    customizations: v.optional(v.any()),
  }),
  
  // Status
  status: v.union(
    v.literal("installing"),
    v.literal("completed"),
    v.literal("failed"),
    v.literal("rolled_back")
  ),
  
  // Progress tracking
  progress: v.optional(v.object({
    currentStep: v.string(),
    totalSteps: v.number(),
    completedSteps: v.number(),
  })),
  
  // Error information if failed
  error: v.optional(v.string()),
  
  // Completion time
  completedAt: v.optional(v.number()),
})
  .index("by_template", ["templateId"])
  .index("by_workspace", ["workspaceId"])
  .index("by_installed_by", ["installedBy"])
  .index("by_status", ["status"]);

/**
 * templateReviews - User reviews and ratings
 */
export const templateReviewsTable = defineTable({
  templateId: v.id("industryTemplates"),
  userId: v.id("users"),
  workspaceId: v.id("workspaces"),
  
  // Review content
  rating: v.number(), // 1-5
  title: v.optional(v.string()),
  review: v.optional(v.string()),
  
  // Helpful metrics
  helpfulCount: v.number(),
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
})
  .index("by_template", ["templateId"])
  .index("by_user", ["userId"])
  .index("by_template_rating", ["templateId", "rating"]);

/**
 * templateCustomizations - User customizations to templates
 */
export const templateCustomizationsTable = defineTable({
  // Reference
  originalTemplateId: v.id("industryTemplates"),
  userId: v.id("users"),
  
  // Customized content
  name: v.string(),
  description: v.optional(v.string()),
  
  // Modified configurations
  featureOverrides: v.optional(v.record(v.string(), v.any())),
  roleOverrides: v.optional(v.array(v.object({
    name: v.string(),
    description: v.string(),
    permissions: v.array(v.string()),
    isDefault: v.optional(v.boolean()),
  }))),
  widgetOverrides: v.optional(v.array(v.any())),
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
})
  .index("by_user", ["userId"])
  .index("by_original_template", ["originalTemplateId"]);

/**
 * industryGuides - Setup guides and best practices
 */
export const industryGuidesTable = defineTable({
  templateId: v.id("industryTemplates"),
  
  // Guide content
  title: v.string(),
  content: v.string(), // Markdown content
  order: v.number(),
  
  // Guide type
  type: v.union(
    v.literal("getting_started"),
    v.literal("feature_guide"),
    v.literal("best_practices"),
    v.literal("faq"),
    v.literal("video_tutorial")
  ),
  
  // Optional video
  videoUrl: v.optional(v.string()),
  videoDuration: v.optional(v.number()), // seconds
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
})
  .index("by_template", ["templateId"])
  .index("by_template_order", ["templateId", "order"])
  .index("by_type", ["type"]);

// Export all tables
const industryTemplatesTables = {
  industryTemplates: industryTemplatesTable,
  templateInstallations: templateInstallationsTable,
  templateReviews: templateReviewsTable,
  templateCustomizations: templateCustomizationsTable,
  industryGuides: industryGuidesTable,
};

export default industryTemplatesTables;
