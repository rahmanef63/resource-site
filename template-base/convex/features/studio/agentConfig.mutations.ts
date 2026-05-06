/**
 * Studio Agent Config — Convex Mutations
 *
 * CRUD for agent configuration, instruction versioning, and Train Mode.
 *
 * All mutations:
 *   - Require permission checks (RBAC enforced via requirePermission)
 *   - Resolve userId via ensureUser (context-based, not args)
 *   - Create audit events for significant changes
 *   - Are idempotent where possible
 *
 * Write operations:
 *   createAgentConfig      — create a new agent config record
 *   updateAgentConfig      — update non-instruction fields
 *   updateAgentInstructions — create a new instruction version (append-only)
 *   rollbackInstructions   — switch active version to a previous one
 *   submitTrainFeedback    — append a feedback entry
 *   saveVisualCheck        — append a visual validation result
 *   saveUIDocument         — upsert a UI document
 *   deleteAgentConfig      — soft-delete (archive)
 */

import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { ensureUser, requirePermission } from "../../auth/helpers";
import { logAuditEvent } from "../../shared/audit";

// ─────────────────────────────────────────────────────────────────────────────
// createAgentConfig
// ─────────────────────────────────────────────────────────────────────────────

export const createAgentConfig = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.string()),
    featureId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    // Model config
    provider: v.optional(v.string()),
    modelId: v.optional(v.string()),
    maxTokens: v.optional(v.number()),
    temperature: v.optional(v.number()),
    supportsVision: v.optional(v.boolean()),
    maxImageInputs: v.optional(v.number()),
    // Initial instructions
    systemPrompt: v.optional(v.string()),
    uiRules: v.optional(v.string()),
    styleRules: v.optional(v.string()),
    targetSchemaVersion: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, "studio.create" as any);
    const userId = await ensureUser(ctx);

    // Create the agent config record
    const agentConfigId = await ctx.db.insert("studioAgentConfigs", {
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      featureId: args.featureId,
      name: args.name,
      description: args.description,
      avatar: undefined,
      tags: args.tags ?? [],

      // Model defaults
      provider: args.provider ?? "openrouter",
      modelId: args.modelId ?? "google/gemini-2.5-flash",
      maxTokens: args.maxTokens ?? 4096,
      temperature: args.temperature ?? 0.3,
      topP: undefined,
      supportsVision: args.supportsVision ?? false,
      maxImageInputs: args.maxImageInputs ?? 4,

      // Instruction pointer
      activeInstructionVersion: 1,

      // Schema
      targetSchemaVersion: args.targetSchemaVersion ?? "0.5",

      // Image validation defaults
      imageValidationEnabled: false,
      referenceImageIds: [],
      imageValidationMode: "manual",
      imageMatchThreshold: 0.85,

      // Train Mode defaults
      trainModeEnabled: false,
      trainFeedbackMode: "explicit",
      trainFeedbackCount: 0,
      trainAutoUpdate: false,
      trainAutoUpdateThreshold: 5,

      // Export defaults
      exportDefaultFileName: "studio-export",
      exportFormats: {
        png: true,
        jpg: false,
        html: true,
        json: true,
        typescript: false,
      },
      exportImageScale: 2,
      exportIncludeMetadata: true,
      exportMinifyJson: false,

      status: "active",
      createdBy: userId,
      updatedBy: userId,
    });

    // Create the initial instruction version (v1)
    await ctx.db.insert("studioInstructionVersions", {
      agentConfigId,
      workspaceId: args.workspaceId,
      version: 1,
      systemPrompt: args.systemPrompt ?? "",
      uiRules: args.uiRules,
      styleRules: args.styleRules,
      source: "manual",
      changeNote: "Initial configuration",
      isActive: true,
      createdBy: userId,
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      action: "create",
      resourceType: "studioAgentConfig",
      resourceId: agentConfigId,
      actorUserId: userId,
      metadata: { name: args.name, featureId: args.featureId },
    });

    return { agentConfigId };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// updateAgentConfig
//
// Updates non-instruction fields only.
// To update instructions, use updateAgentInstructions.
// ─────────────────────────────────────────────────────────────────────────────

export const updateAgentConfig = mutation({
  args: {
    agentConfigId: v.id("studioAgentConfigs"),
    workspaceId: v.id("workspaces"),

    // Identity (optional partial update)
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),

    // Model config (optional partial update)
    provider: v.optional(v.string()),
    modelId: v.optional(v.string()),
    maxTokens: v.optional(v.number()),
    temperature: v.optional(v.number()),
    topP: v.optional(v.number()),
    supportsVision: v.optional(v.boolean()),
    maxImageInputs: v.optional(v.number()),
    targetSchemaVersion: v.optional(v.string()),

    // Image validation
    imageValidationEnabled: v.optional(v.boolean()),
    referenceImageIds: v.optional(v.array(v.string())),
    imageValidationMode: v.optional(v.string()),
    imageMatchThreshold: v.optional(v.number()),

    // Train Mode
    trainModeEnabled: v.optional(v.boolean()),
    trainFeedbackMode: v.optional(v.string()),
    trainAutoUpdate: v.optional(v.boolean()),
    trainAutoUpdateThreshold: v.optional(v.number()),

    // Export settings
    exportDefaultFileName: v.optional(v.string()),
    exportFormats: v.optional(v.object({
      png: v.boolean(),
      jpg: v.boolean(),
      html: v.boolean(),
      json: v.boolean(),
      typescript: v.boolean(),
    })),
    exportImageScale: v.optional(v.number()),
    exportIncludeMetadata: v.optional(v.boolean()),
    exportMinifyJson: v.optional(v.boolean()),

    // Status
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { agentConfigId, workspaceId, ...updates } = args;

    await requirePermission(ctx, workspaceId, "studio.edit" as any);
    const userId = await ensureUser(ctx);

    // Verify ownership
    const config = await ctx.db.get(agentConfigId);
    if (!config || config.workspaceId !== workspaceId) {
      throw new Error("Agent config not found or access denied");
    }

    // Build patch with only defined fields
    if (updates.name !== undefined) await ctx.db.patch(agentConfigId, { name: updates.name });
    if (updates.description !== undefined) await ctx.db.patch(agentConfigId, { description: updates.description });
    if (updates.tags !== undefined) await ctx.db.patch(agentConfigId, { tags: updates.tags });
    if (updates.provider !== undefined) await ctx.db.patch(agentConfigId, { provider: updates.provider });
    if (updates.modelId !== undefined) await ctx.db.patch(agentConfigId, { modelId: updates.modelId });
    if (updates.maxTokens !== undefined) await ctx.db.patch(agentConfigId, { maxTokens: updates.maxTokens });
    if (updates.temperature !== undefined) await ctx.db.patch(agentConfigId, { temperature: updates.temperature });
    if (updates.topP !== undefined) await ctx.db.patch(agentConfigId, { topP: updates.topP });
    if (updates.supportsVision !== undefined) await ctx.db.patch(agentConfigId, { supportsVision: updates.supportsVision });
    if (updates.maxImageInputs !== undefined) await ctx.db.patch(agentConfigId, { maxImageInputs: updates.maxImageInputs });
    if (updates.targetSchemaVersion !== undefined) await ctx.db.patch(agentConfigId, { targetSchemaVersion: updates.targetSchemaVersion });
    if (updates.imageValidationEnabled !== undefined) await ctx.db.patch(agentConfigId, { imageValidationEnabled: updates.imageValidationEnabled });
    if (updates.referenceImageIds !== undefined) await ctx.db.patch(agentConfigId, { referenceImageIds: updates.referenceImageIds });
    if (updates.imageValidationMode !== undefined) await ctx.db.patch(agentConfigId, { imageValidationMode: updates.imageValidationMode });
    if (updates.imageMatchThreshold !== undefined) await ctx.db.patch(agentConfigId, { imageMatchThreshold: updates.imageMatchThreshold });
    if (updates.trainModeEnabled !== undefined) await ctx.db.patch(agentConfigId, { trainModeEnabled: updates.trainModeEnabled });
    if (updates.trainFeedbackMode !== undefined) await ctx.db.patch(agentConfigId, { trainFeedbackMode: updates.trainFeedbackMode });
    if (updates.trainAutoUpdate !== undefined) await ctx.db.patch(agentConfigId, { trainAutoUpdate: updates.trainAutoUpdate });
    if (updates.trainAutoUpdateThreshold !== undefined) await ctx.db.patch(agentConfigId, { trainAutoUpdateThreshold: updates.trainAutoUpdateThreshold });
    if (updates.exportDefaultFileName !== undefined) await ctx.db.patch(agentConfigId, { exportDefaultFileName: updates.exportDefaultFileName });
    if (updates.exportFormats !== undefined) await ctx.db.patch(agentConfigId, { exportFormats: updates.exportFormats });
    if (updates.exportImageScale !== undefined) await ctx.db.patch(agentConfigId, { exportImageScale: updates.exportImageScale });
    if (updates.exportIncludeMetadata !== undefined) await ctx.db.patch(agentConfigId, { exportIncludeMetadata: updates.exportIncludeMetadata });
    if (updates.exportMinifyJson !== undefined) await ctx.db.patch(agentConfigId, { exportMinifyJson: updates.exportMinifyJson });
    if (updates.status !== undefined) await ctx.db.patch(agentConfigId, { status: updates.status });
    await ctx.db.patch(agentConfigId, { updatedBy: userId });

    await logAuditEvent(ctx, {
      workspaceId,
      action: "update",
      resourceType: "studioAgentConfig",
      resourceId: agentConfigId,
      actorUserId: userId,
      metadata: updates,
    });

    return { success: true };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// updateAgentInstructions
//
// Creates a new instruction version. Never modifies existing versions.
// Updates the `activeInstructionVersion` pointer on the agent config.
// ─────────────────────────────────────────────────────────────────────────────

export const updateAgentInstructions = mutation({
  args: {
    agentConfigId: v.id("studioAgentConfigs"),
    workspaceId: v.id("workspaces"),
    systemPrompt: v.string(),
    uiRules: v.optional(v.string()),
    styleRules: v.optional(v.string()),
    /** "manual" | "train-mode" | "import" | "reset" */
    source: v.string(),
    changeNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, "studio.edit" as any);
    const userId = await ensureUser(ctx);

    // Verify ownership
    const config = await ctx.db.get(args.agentConfigId);
    if (!config || config.workspaceId !== args.workspaceId) {
      throw new Error("Agent config not found or access denied");
    }

    const newVersion = config.activeInstructionVersion + 1;

    // Deactivate the current active version
    const activeVersions = await ctx.db
      .query("studioInstructionVersions")
      .withIndex("by_agent_active", (q) =>
        q.eq("agentConfigId", args.agentConfigId).eq("isActive", true)
      )
      .collect();
    for (const ver of activeVersions) {
      await ctx.db.patch(ver._id, { isActive: false });
    }

    // Create the new version
    const versionId = await ctx.db.insert("studioInstructionVersions", {
      agentConfigId: args.agentConfigId,
      workspaceId: args.workspaceId,
      version: newVersion,
      systemPrompt: args.systemPrompt,
      uiRules: args.uiRules,
      styleRules: args.styleRules,
      source: args.source,
      changeNote: args.changeNote,
      isActive: true,
      createdBy: userId,
    });

    // Update the pointer
    await ctx.db.patch(args.agentConfigId, {
      activeInstructionVersion: newVersion,
      updatedBy: userId,
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      action: "update",
      resourceType: "studioAgentInstructions",
      resourceId: args.agentConfigId,
      actorUserId: userId,
      metadata: { version: newVersion, source: args.source },
    });

    return { versionId, newVersion };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// rollbackInstructions
//
// Rolls back to a previous instruction version.
// Does not delete any versions — rollback is a pointer update only.
// ─────────────────────────────────────────────────────────────────────────────

export const rollbackInstructions = mutation({
  args: {
    agentConfigId: v.id("studioAgentConfigs"),
    workspaceId: v.id("workspaces"),
    targetVersion: v.number(),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, "studio.edit" as any);
    const userId = await ensureUser(ctx);

    // Verify ownership
    const config = await ctx.db.get(args.agentConfigId);
    if (!config || config.workspaceId !== args.workspaceId) {
      throw new Error("Agent config not found or access denied");
    }

    // Find the target version
    const targetVersionDoc = await ctx.db
      .query("studioInstructionVersions")
      .withIndex("by_agent_version", (q) =>
        q.eq("agentConfigId", args.agentConfigId).eq("version", args.targetVersion)
      )
      .first();

    if (!targetVersionDoc) {
      throw new Error(`Version ${args.targetVersion} not found for this agent`);
    }

    // Deactivate current active version
    const activeVersions = await ctx.db
      .query("studioInstructionVersions")
      .withIndex("by_agent_active", (q) =>
        q.eq("agentConfigId", args.agentConfigId).eq("isActive", true)
      )
      .collect();
    for (const ver of activeVersions) {
      await ctx.db.patch(ver._id, { isActive: false });
    }

    // Activate the target version
    await ctx.db.patch(targetVersionDoc._id, { isActive: true });

    // Update the pointer
    await ctx.db.patch(args.agentConfigId, {
      activeInstructionVersion: args.targetVersion,
      updatedBy: userId,
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      action: "update",
      resourceType: "studioAgentInstructions",
      resourceId: args.agentConfigId,
      actorUserId: userId,
      metadata: { rollbackTo: args.targetVersion },
    });

    return { success: true, activeVersion: args.targetVersion };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// submitTrainFeedback
//
// Appends a Train Mode feedback entry. Immutable once created.
// Also increments the feedbackCount on the agent config.
// ─────────────────────────────────────────────────────────────────────────────

export const submitTrainFeedback = mutation({
  args: {
    agentConfigId: v.id("studioAgentConfigs"),
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.string()),
    originalPrompt: v.string(),
    generatedOutput: v.string(),
    revisedOutput: v.optional(v.string()),
    /** "correction" | "rejection" | "approval" | "comment" */
    feedbackType: v.string(),
    note: v.optional(v.string()),
    visualScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, "studio.edit" as any);
    const userId = await ensureUser(ctx);

    // Verify agent exists and train mode is enabled
    const config = await ctx.db.get(args.agentConfigId);
    if (!config || config.workspaceId !== args.workspaceId) {
      throw new Error("Agent config not found or access denied");
    }
    if (!config.trainModeEnabled) {
      throw new Error("Train Mode is not enabled for this agent");
    }

    const feedbackId = await ctx.db.insert("studioTrainFeedback", {
      agentConfigId: args.agentConfigId,
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      originalPrompt: args.originalPrompt,
      generatedOutput: args.generatedOutput,
      revisedOutput: args.revisedOutput,
      feedbackType: args.feedbackType,
      note: args.note,
      visualScore: args.visualScore,
      instructionVersion: config.activeInstructionVersion,
      createdBy: userId,
    });

    // Increment feedback count
    await ctx.db.patch(args.agentConfigId, {
      trainFeedbackCount: config.trainFeedbackCount + 1,
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      action: "create",
      resourceType: "studioTrainFeedback",
      resourceId: feedbackId,
      actorUserId: userId,
      metadata: { feedbackType: args.feedbackType },
    });

    return { feedbackId };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// saveVisualCheck
//
// Saves a visual validation result. Immutable once created.
// ─────────────────────────────────────────────────────────────────────────────

export const saveVisualCheck = mutation({
  args: {
    agentConfigId: v.id("studioAgentConfigs"),
    workspaceId: v.id("workspaces"),
    uiDocumentId: v.optional(v.string()),
    renderedImageId: v.optional(v.string()),
    referenceImageId: v.optional(v.string()),
    /** "match" | "partialMatch" | "mismatch" | "error" */
    status: v.string(),
    score: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, "studio.edit" as any);
    const userId = await ensureUser(ctx);

    const config = await ctx.db.get(args.agentConfigId);
    if (!config || config.workspaceId !== args.workspaceId) {
      throw new Error("Agent config not found or access denied");
    }

    const checkId = await ctx.db.insert("studioVisualChecks", {
      agentConfigId: args.agentConfigId,
      workspaceId: args.workspaceId,
      uiDocumentId: args.uiDocumentId,
      renderedImageId: args.renderedImageId,
      referenceImageId: args.referenceImageId,
      status: args.status,
      score: args.score,
      notes: args.notes,
      instructionVersion: config.activeInstructionVersion,
      triggeredBy: userId,
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      action: "create",
      resourceType: "studioVisualCheck",
      resourceId: checkId,
      actorUserId: userId,
      metadata: { status: args.status, score: args.score },
    });

    return { checkId };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// saveUIDocument
//
// Upsert a UI document. Creates or updates based on documentId.
// ─────────────────────────────────────────────────────────────────────────────

export const saveUIDocument = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    documentId: v.optional(v.id("studioUIDocuments")),
    projectId: v.optional(v.string()),
    agentConfigId: v.optional(v.id("studioAgentConfigs")),
    name: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    schemaVersion: v.string(),
    /** Stringified StudioUISchema JSON. */
    content: v.string(),
    status: v.optional(v.string()),
    isTemplate: v.optional(v.boolean()),
    templateCategory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, "studio.edit" as any);
    const userId = await ensureUser(ctx);

    const { documentId, ...data } = args;

    if (documentId) {
      // Update existing
      const existing = await ctx.db.get(documentId);
      if (!existing || existing.workspaceId !== args.workspaceId) {
        throw new Error("Document not found or access denied");
      }
      await ctx.db.patch(documentId, {
        name: data.name,
        description: data.description,
        tags: data.tags ?? existing.tags,
        schemaVersion: data.schemaVersion,
        content: data.content,
        status: data.status ?? existing.status,
        isTemplate: data.isTemplate ?? existing.isTemplate,
        templateCategory: data.templateCategory ?? existing.templateCategory,
        updatedBy: userId,
        agentConfigId: data.agentConfigId ?? existing.agentConfigId,
      });
      await logAuditEvent(ctx, {
        workspaceId: args.workspaceId,
        action: "update",
        resourceType: "studioUIDocument",
        resourceId: documentId,
        actorUserId: userId,
        metadata: { name: data.name, schemaVersion: data.schemaVersion },
      });
      return { documentId };
    } else {
      // Create new
      const newId = await ctx.db.insert("studioUIDocuments", {
        workspaceId: args.workspaceId,
        projectId: args.projectId,
        agentConfigId: args.agentConfigId,
        name: args.name,
        description: args.description,
        tags: args.tags ?? [],
        schemaVersion: args.schemaVersion,
        content: args.content,
        status: args.status ?? "draft",
        isTemplate: args.isTemplate ?? false,
        templateCategory: args.templateCategory,
        createdBy: userId,
        updatedBy: userId,
      });
      await logAuditEvent(ctx, {
        workspaceId: args.workspaceId,
        action: "create",
        resourceType: "studioUIDocument",
        resourceId: newId,
        actorUserId: userId,
        metadata: { name: args.name, schemaVersion: args.schemaVersion },
      });
      return { documentId: newId };
    }
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// deleteAgentConfig (soft delete)
// ─────────────────────────────────────────────────────────────────────────────

export const deleteAgentConfig = mutation({
  args: {
    agentConfigId: v.id("studioAgentConfigs"),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, "studio.delete" as any);
    const userId = await ensureUser(ctx);

    const config = await ctx.db.get(args.agentConfigId);
    if (!config || config.workspaceId !== args.workspaceId) {
      throw new Error("Agent config not found or access denied");
    }
    await ctx.db.patch(args.agentConfigId, {
      status: "archived",
      updatedBy: userId,
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      action: "delete",
      resourceType: "studioAgentConfig",
      resourceId: args.agentConfigId,
      actorUserId: userId,
      metadata: { status: "archived" },
    });

    return { success: true };
  },
});
