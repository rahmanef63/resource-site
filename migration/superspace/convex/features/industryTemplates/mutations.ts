import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requirePermission, resolveCandidateUserIds, getAccessibleUserIds } from "../../auth/helpers";
import { logAuditEvent } from "../../shared/audit";
import { PERMS } from "../../workspace/permissions";

/**
 * Industry Templates Mutations
 * Write operations for template management and installation
 */

// Industry category validator
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

// Feature module validator
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
  v.literal("integrations")
);

// Create a new template (admin or custom user template)
// @dod:skip-audit reason="global marketplace operation — entity is user-owned, not workspace-scoped (table has no workspaceId field); audit log requires workspaceId"
export const createTemplate = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    category: industryCategory,
    subcategory: v.optional(v.string()),
    features: v.array(featureModule),
    featureConfigs: v.optional(v.any()),
    defaultRoles: v.array(v.object({
      name: v.string(),
      description: v.string(),
      permissions: v.array(v.string()),
      isDefault: v.optional(v.boolean()),
    })),
    sampleData: v.optional(v.object({
      products: v.optional(v.number()),
      customers: v.optional(v.number()),
      documents: v.optional(v.number()),
      workflows: v.optional(v.number()),
    })),
    dashboardWidgets: v.optional(v.array(v.any())),
    recommendedIntegrations: v.optional(v.array(v.string())),
    branding: v.optional(v.object({
      primaryColor: v.optional(v.string()),
      logo: v.optional(v.string()),
      favicon: v.optional(v.string()),
    })),
    visibility: v.union(v.literal("public"), v.literal("private"), v.literal("organization")),
    userId: v.id("users"),
    tags: v.array(v.string()),
    isPremium: v.optional(v.boolean()),
    price: v.optional(v.number()),
    previewImages: v.optional(v.array(v.string())),
    demoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");
    if (String(authUserId) !== String(args.userId)) throw new Error("Unauthorized");

    const templateId = await ctx.db.insert("industryTemplates", {
      name: args.name,
      description: args.description,
      category: args.category,
      subcategory: args.subcategory,
      features: args.features,
      featureConfigs: args.featureConfigs,
      defaultRoles: args.defaultRoles,
      sampleData: args.sampleData,
      dashboardWidgets: args.dashboardWidgets,
      recommendedIntegrations: args.recommendedIntegrations,
      branding: args.branding,
      visibility: args.visibility,
      createdBy: args.userId,
      version: "1.0.0",
      isOfficial: false, // Only system can create official templates
      usageCount: 0,
      tags: args.tags,
      isPremium: args.isPremium ?? false,
      price: args.price,
      previewImages: args.previewImages,
      demoUrl: args.demoUrl,
    });

    return templateId;
  },
});

// Update an existing template
// @dod:skip-audit reason="global marketplace operation — entity is user-owned, not workspace-scoped (table has no workspaceId field); audit log requires workspaceId"
export const updateTemplate = mutation({
  args: {
    templateId: v.id("industryTemplates"),
    userId: v.id("users"), // Must match authenticated user
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      category: v.optional(industryCategory),
      subcategory: v.optional(v.string()),
      features: v.optional(v.array(featureModule)),
      featureConfigs: v.optional(v.any()),
      defaultRoles: v.optional(v.array(v.object({
        name: v.string(),
        description: v.string(),
        permissions: v.array(v.string()),
        isDefault: v.optional(v.boolean()),
      }))),
      sampleData: v.optional(v.any()),
      dashboardWidgets: v.optional(v.array(v.any())),
      recommendedIntegrations: v.optional(v.array(v.string())),
      branding: v.optional(v.any()),
      visibility: v.optional(v.union(v.literal("public"), v.literal("private"), v.literal("organization"))),
      tags: v.optional(v.array(v.string())),
      isPremium: v.optional(v.boolean()),
      price: v.optional(v.number()),
      previewImages: v.optional(v.array(v.string())),
      demoUrl: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");
    if (String(authUserId) !== String(args.userId)) throw new Error("Unauthorized");

    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Only creator can update; official templates are locked to this user-path
    if (template.createdBy !== args.userId) {
      throw new Error("Unauthorized to update this template");
    }

    if (template.isOfficial) {
      throw new Error("Cannot modify official templates");
    }

    // Increment version
    const versionParts = template.version.split(".");
    const newVersion = `${versionParts[0]}.${parseInt(versionParts[1]) + 1}.0`;

    await ctx.db.patch(args.templateId, {
      ...args.updates,
      version: newVersion,
    });

    return args.templateId;
  },
});

// Delete a template
// @dod:skip-audit reason="global marketplace operation — entity is user-owned, not workspace-scoped (table has no workspaceId field); audit log requires workspaceId"
export const deleteTemplate = mutation({
  args: {
    templateId: v.id("industryTemplates"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");
    if (String(authUserId) !== String(args.userId)) throw new Error("Unauthorized");

    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Only creator can delete (not official templates)
    if (template.createdBy !== args.userId) {
      throw new Error("Unauthorized to delete this template");
    }

    if (template.isOfficial) {
      throw new Error("Cannot delete official templates");
    }

    // Delete related records
    const reviews = await ctx.db
      .query("templateReviews")
      .withIndex("by_template", (q) => q.eq("templateId", args.templateId))
      .take(10000);

    for (const review of reviews) {
      await ctx.db.delete(review._id);
    }

    const guides = await ctx.db
      .query("industryGuides")
      .withIndex("by_template", (q) => q.eq("templateId", args.templateId))
      .take(500);

    for (const guide of guides) {
      await ctx.db.delete(guide._id);
    }

    const customizations = await ctx.db
      .query("templateCustomizations")
      .withIndex("by_original_template", (q) => q.eq("originalTemplateId", args.templateId))
      .take(5000);

    for (const customization of customizations) {
      await ctx.db.delete(customization._id);
    }

    await ctx.db.delete(args.templateId);
    return true;
  },
});

// Install a template to a workspace
export const installTemplate = mutation({
  args: {
    templateId: v.id("industryTemplates"),
    workspaceId: v.id("workspaces"),
    options: v.object({
      includeSampleData: v.boolean(),
      selectedFeatures: v.array(featureModule),
      customizations: v.optional(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.INDUSTRY_TEMPLATES_INSTALL);
    const candidates = await resolveCandidateUserIds(ctx);
    const userId = candidates[0];
    if (!userId) throw new Error("Unauthorized");

    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Create installation record
    const installationId = await ctx.db.insert("templateInstallations", {
      templateId: args.templateId,
      workspaceId: args.workspaceId,
      installedBy: userId as never,
      installedAt: Date.now(),
      options: args.options,
      status: "installing",
      progress: {
        currentStep: "Initializing",
        totalSteps: args.options.selectedFeatures.length + 3, // features + roles + widgets + sample data
        completedSteps: 0,
      },
    });

    // Increment usage count
    await ctx.db.patch(args.templateId, {
      usageCount: template.usageCount + 1,
    });

    // The actual installation would be done in steps/background
    // For now, mark as completed
    await ctx.db.patch(installationId, {
      status: "completed",
      completedAt: Date.now(),
      progress: {
        currentStep: "Complete",
        totalSteps: args.options.selectedFeatures.length + 3,
        completedSteps: args.options.selectedFeatures.length + 3,
      },
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      userId,
      actorUserId: membership?.userId ?? (userId as never),
      action: "industryTemplate.installed",
      resourceType: "industryTemplate",
      resourceId: String(args.templateId),
      metadata: { templateName: template.name },
    });

    return installationId;
  },
});

// Update installation progress
export const updateInstallationProgress = mutation({
  args: {
    installationId: v.id("templateInstallations"),
    currentStep: v.string(),
    completedSteps: v.number(),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");

    const installation = await ctx.db.get(args.installationId);
    if (!installation || !installation.progress) {
      throw new Error("Installation not found");
    }
    if (String(installation.installedBy) !== String(authUserId)) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.installationId, {
      progress: {
        ...installation.progress,
        currentStep: args.currentStep,
        completedSteps: args.completedSteps,
      },
    });

    await logAuditEvent(ctx, {
      workspaceId: installation.workspaceId,
      userId: authUserId,
      actorUserId: authUserId,
      action: "industryTemplate.installation_progressed",
      resourceType: "templateInstallation",
      resourceId: String(args.installationId),
      metadata: { currentStep: args.currentStep, completedSteps: args.completedSteps },
    });

    return true;
  },
});

// Complete installation
export const completeInstallation = mutation({
  args: {
    installationId: v.id("templateInstallations"),
    success: v.boolean(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");

    const installation = await ctx.db.get(args.installationId);
    if (!installation) throw new Error("Installation not found");
    if (String(installation.installedBy) !== String(authUserId)) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.installationId, {
      status: args.success ? "completed" : "failed",
      completedAt: Date.now(),
      error: args.error,
    });

    await logAuditEvent(ctx, {
      workspaceId: installation.workspaceId,
      userId: authUserId,
      actorUserId: authUserId,
      action: args.success ? "industryTemplate.installation_completed" : "industryTemplate.installation_failed",
      resourceType: "templateInstallation",
      resourceId: String(args.installationId),
      metadata: { success: args.success, error: args.error },
    });

    return true;
  },
});

// Rollback installation
export const rollbackInstallation = mutation({
  args: {
    installationId: v.id("templateInstallations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");
    if (String(authUserId) !== String(args.userId)) throw new Error("Unauthorized");

    const installation = await ctx.db.get(args.installationId);
    if (!installation) {
      throw new Error("Installation not found");
    }

    // Only the installer can rollback
    if (installation.installedBy !== args.userId) {
      throw new Error("Unauthorized to rollback this installation");
    }

    // Mark as rolled back
    await ctx.db.patch(args.installationId, {
      status: "rolled_back",
    });

    await logAuditEvent(ctx, {
      workspaceId: installation.workspaceId,
      userId: args.userId,
      actorUserId: args.userId,
      action: "industryTemplate.installation_rolled_back",
      resourceType: "templateInstallation",
      resourceId: String(args.installationId),
      metadata: { templateId: String(installation.templateId) },
    });

    return true;
  },
});

// Create a review for a template
export const createReview = mutation({
  args: {
    templateId: v.id("industryTemplates"),
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
    rating: v.number(),
    title: v.optional(v.string()),
    review: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.INDUSTRY_TEMPLATES_INSTALL);
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");
    if (String(authUserId) !== String(args.userId)) throw new Error("Unauthorized");

    // Validate rating
    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Check if user already reviewed this template
    const existingReviews = await ctx.db
      .query("templateReviews")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .take(1000);

    const existingReview = existingReviews.find((r) => r.templateId === args.templateId);
    if (existingReview) {
      throw new Error("You have already reviewed this template");
    }

    const reviewId = await ctx.db.insert("templateReviews", {
      templateId: args.templateId,
      userId: args.userId,
      workspaceId: args.workspaceId,
      rating: args.rating,
      title: args.title,
      review: args.review,
      helpfulCount: 0,
      createdAt: Date.now(),
    });

    // Update template's average rating
    const allReviews = await ctx.db
      .query("templateReviews")
      .withIndex("by_template", (q) => q.eq("templateId", args.templateId))
      .take(10000);

    const averageRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await ctx.db.patch(args.templateId, {
      rating: Math.round(averageRating * 10) / 10,
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      userId: args.userId,
      actorUserId: args.userId,
      action: "industryTemplate.review_created",
      resourceType: "templateReview",
      resourceId: String(reviewId),
      metadata: { templateId: String(args.templateId), rating: args.rating },
    });

    return reviewId;
  },
});

// Update a review
export const updateReview = mutation({
  args: {
    reviewId: v.id("templateReviews"),
    userId: v.id("users"),
    rating: v.optional(v.number()),
    title: v.optional(v.string()),
    review: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");
    if (String(authUserId) !== String(args.userId)) throw new Error("Unauthorized");

    const existingReview = await ctx.db.get(args.reviewId);
    if (!existingReview) {
      throw new Error("Review not found");
    }

    if (existingReview.userId !== args.userId) {
      throw new Error("Unauthorized to update this review");
    }

    if (args.rating !== undefined && (args.rating < 1 || args.rating > 5)) {
      throw new Error("Rating must be between 1 and 5");
    }

    await ctx.db.patch(args.reviewId, {
      ...(args.rating !== undefined && { rating: args.rating }),
      ...(args.title !== undefined && { title: args.title }),
      ...(args.review !== undefined && { review: args.review }),
      updatedAt: Date.now(),
    });

    // Update template's average rating if rating changed
    if (args.rating !== undefined) {
      const allReviews = await ctx.db
        .query("templateReviews")
        .withIndex("by_template", (q) => q.eq("templateId", existingReview.templateId))
        .take(10000);

      const averageRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await ctx.db.patch(existingReview.templateId, {
        rating: Math.round(averageRating * 10) / 10,
      });
    }

    await logAuditEvent(ctx, {
      workspaceId: existingReview.workspaceId,
      userId: args.userId,
      actorUserId: args.userId,
      action: "industryTemplate.review_updated",
      resourceType: "templateReview",
      resourceId: String(args.reviewId),
      metadata: { ratingChanged: args.rating !== undefined, newRating: args.rating },
    });

    return args.reviewId;
  },
});

// Delete a review
export const deleteReview = mutation({
  args: {
    reviewId: v.id("templateReviews"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");
    if (String(authUserId) !== String(args.userId)) throw new Error("Unauthorized");

    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    if (review.userId !== args.userId) {
      throw new Error("Unauthorized to delete this review");
    }

    const templateId = review.templateId;
    const reviewWorkspaceId = review.workspaceId;
    await ctx.db.delete(args.reviewId);

    // Update template's average rating
    const allReviews = await ctx.db
      .query("templateReviews")
      .withIndex("by_template", (q) => q.eq("templateId", templateId))
      .take(10000);

    const averageRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : undefined;

    await ctx.db.patch(templateId, {
      rating: averageRating ? Math.round(averageRating * 10) / 10 : undefined,
    });

    await logAuditEvent(ctx, {
      workspaceId: reviewWorkspaceId,
      userId: args.userId,
      actorUserId: args.userId,
      action: "industryTemplate.review_deleted",
      resourceType: "templateReview",
      resourceId: String(args.reviewId),
      metadata: { templateId: String(templateId) },
    });

    return true;
  },
});

// Mark a review as helpful
export const markReviewHelpful = mutation({
  args: {
    reviewId: v.id("templateReviews"),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");

    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    await ctx.db.patch(args.reviewId, {
      helpfulCount: review.helpfulCount + 1,
    });

    await logAuditEvent(ctx, {
      workspaceId: review.workspaceId,
      userId: authUserId,
      actorUserId: authUserId,
      action: "industryTemplate.review_marked_helpful",
      resourceType: "templateReview",
      resourceId: String(args.reviewId),
      metadata: { helpfulCount: review.helpfulCount + 1 },
    });

    return true;
  },
});

// Save a template customization
// @dod:skip-audit reason="global marketplace operation — entity is user-owned, not workspace-scoped (table has no workspaceId field); audit log requires workspaceId"
export const saveCustomization = mutation({
  args: {
    originalTemplateId: v.id("industryTemplates"),
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    featureOverrides: v.optional(v.any()),
    roleOverrides: v.optional(v.array(v.object({
      name: v.string(),
      description: v.string(),
      permissions: v.array(v.string()),
      isDefault: v.optional(v.boolean()),
    }))),
    widgetOverrides: v.optional(v.array(v.any())),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");
    if (String(authUserId) !== String(args.userId)) throw new Error("Unauthorized");

    const customizationId = await ctx.db.insert("templateCustomizations", {
      originalTemplateId: args.originalTemplateId,
      userId: args.userId,
      name: args.name,
      description: args.description,
      featureOverrides: args.featureOverrides,
      roleOverrides: args.roleOverrides,
      widgetOverrides: args.widgetOverrides,
      createdAt: Date.now(),
    });

    return customizationId;
  },
});

// Update a customization
// @dod:skip-audit reason="global marketplace operation — entity is user-owned, not workspace-scoped (table has no workspaceId field); audit log requires workspaceId"
export const updateCustomization = mutation({
  args: {
    customizationId: v.id("templateCustomizations"),
    userId: v.id("users"),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      featureOverrides: v.optional(v.any()),
      roleOverrides: v.optional(v.array(v.object({
        name: v.string(),
        description: v.string(),
        permissions: v.array(v.string()),
        isDefault: v.optional(v.boolean()),
      }))),
      widgetOverrides: v.optional(v.array(v.any())),
    }),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");
    if (String(authUserId) !== String(args.userId)) throw new Error("Unauthorized");

    const customization = await ctx.db.get(args.customizationId);
    if (!customization) {
      throw new Error("Customization not found");
    }

    if (customization.userId !== args.userId) {
      throw new Error("Unauthorized to update this customization");
    }

    await ctx.db.patch(args.customizationId, {
      ...args.updates,
      updatedAt: Date.now(),
    });

    return args.customizationId;
  },
});

// Delete a customization
// @dod:skip-audit reason="global marketplace operation — entity is user-owned, not workspace-scoped (table has no workspaceId field); audit log requires workspaceId"
export const deleteCustomization = mutation({
  args: {
    customizationId: v.id("templateCustomizations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");
    if (String(authUserId) !== String(args.userId)) throw new Error("Unauthorized");

    const customization = await ctx.db.get(args.customizationId);
    if (!customization) {
      throw new Error("Customization not found");
    }

    if (customization.userId !== args.userId) {
      throw new Error("Unauthorized to delete this customization");
    }

    await ctx.db.delete(args.customizationId);
    return true;
  },
});

// Create a guide for a template
// @dod:skip-audit reason="global marketplace operation — entity is user-owned, not workspace-scoped (table has no workspaceId field); audit log requires workspaceId"
export const createGuide = mutation({
  args: {
    templateId: v.id("industryTemplates"),
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    order: v.number(),
    type: v.union(
      v.literal("getting_started"),
      v.literal("feature_guide"),
      v.literal("best_practices"),
      v.literal("faq"),
      v.literal("video_tutorial")
    ),
    videoUrl: v.optional(v.string()),
    videoDuration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");
    if (String(authUserId) !== String(args.userId)) throw new Error("Unauthorized");

    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Only template creator can add guides; official templates are locked
    if (template.createdBy !== args.userId) {
      throw new Error("Unauthorized to add guides to this template");
    }

    if (template.isOfficial) {
      throw new Error("Cannot modify official templates");
    }

    const guideId = await ctx.db.insert("industryGuides", {
      templateId: args.templateId,
      title: args.title,
      content: args.content,
      order: args.order,
      type: args.type,
      videoUrl: args.videoUrl,
      videoDuration: args.videoDuration,
      createdAt: Date.now(),
    });

    return guideId;
  },
});

// Update a guide
// @dod:skip-audit reason="global marketplace operation — entity is user-owned, not workspace-scoped (table has no workspaceId field); audit log requires workspaceId"
export const updateGuide = mutation({
  args: {
    guideId: v.id("industryGuides"),
    userId: v.id("users"),
    updates: v.object({
      title: v.optional(v.string()),
      content: v.optional(v.string()),
      order: v.optional(v.number()),
      type: v.optional(v.union(
        v.literal("getting_started"),
        v.literal("feature_guide"),
        v.literal("best_practices"),
        v.literal("faq"),
        v.literal("video_tutorial")
      )),
      videoUrl: v.optional(v.string()),
      videoDuration: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");
    if (String(authUserId) !== String(args.userId)) throw new Error("Unauthorized");

    const guide = await ctx.db.get(args.guideId);
    if (!guide) {
      throw new Error("Guide not found");
    }

    const template = await ctx.db.get(guide.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Only template creator can update guides; official templates are locked
    if (template.createdBy !== args.userId) {
      throw new Error("Unauthorized to update this guide");
    }

    if (template.isOfficial) {
      throw new Error("Cannot modify official templates");
    }

    await ctx.db.patch(args.guideId, {
      ...args.updates,
      updatedAt: Date.now(),
    });

    return args.guideId;
  },
});

// Delete a guide
// @dod:skip-audit reason="global marketplace operation — entity is user-owned, not workspace-scoped (table has no workspaceId field); audit log requires workspaceId"
export const deleteGuide = mutation({
  args: {
    guideId: v.id("industryGuides"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");
    if (String(authUserId) !== String(args.userId)) throw new Error("Unauthorized");

    const guide = await ctx.db.get(args.guideId);
    if (!guide) {
      throw new Error("Guide not found");
    }

    const template = await ctx.db.get(guide.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Only template creator can delete guides; official templates are locked
    if (template.createdBy !== args.userId) {
      throw new Error("Unauthorized to delete this guide");
    }

    if (template.isOfficial) {
      throw new Error("Cannot modify official templates");
    }

    await ctx.db.delete(args.guideId);
    return true;
  },
});

// Clone a template to create a new one
// @dod:skip-audit reason="global marketplace operation — entity is user-owned, not workspace-scoped (table has no workspaceId field); audit log requires workspaceId"
export const cloneTemplate = mutation({
  args: {
    templateId: v.id("industryTemplates"),
    userId: v.id("users"),
    name: v.string(),
    visibility: v.union(v.literal("public"), v.literal("private"), v.literal("organization")),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");
    if (String(authUserId) !== String(args.userId)) throw new Error("Unauthorized");

    const original = await ctx.db.get(args.templateId);
    if (!original) {
      throw new Error("Template not found");
    }

    // P0-2b: only clone public templates or ones the caller owns.
    if (original.visibility !== "public") {
      const callerIds = await getAccessibleUserIds(ctx);
      const owns = callerIds.some((id) => String(id) === String(original.createdBy));
      if (!owns) throw new Error("Not authorized");
    }

    const newTemplateId = await ctx.db.insert("industryTemplates", {
      name: args.name,
      description: original.description,
      category: original.category,
      subcategory: original.subcategory,
      features: original.features,
      featureConfigs: original.featureConfigs,
      defaultRoles: original.defaultRoles,
      sampleData: original.sampleData,
      dashboardWidgets: original.dashboardWidgets,
      recommendedIntegrations: original.recommendedIntegrations,
      branding: undefined, // Don't copy branding
      visibility: args.visibility,
      createdBy: args.userId,
      version: "1.0.0",
      isOfficial: false,
      usageCount: 0,
      tags: [...original.tags, "cloned"],
      isPremium: false,
      previewImages: undefined,
      demoUrl: undefined,
    });

    return newTemplateId;
  },
});
