/**
 * Studio Agent Config — Convex Schema
 *
 * Centralizes ALL agent configuration in Convex.
 * No agent config may be scattered across frontend localStorage or component state.
 *
 * Tables:
 *   studioAgentConfigs   — one record per agent, per project
 *   studioTrainFeedback  — append-only feedback entries (Train Mode)
 *   studioVisualChecks   — visual validation results (image comparison)
 *   studioInstructionVersions — versioned instruction history (normalized)
 *
 * Design principles:
 *   - All writes are auditable (createdBy, updatedAt)
 *   - Instruction history is append-only (immutable versions)
 *   - Visual validation results are immutable once created
 *   - Feedback entries are immutable once created
 *   - Soft-delete via status field (no hard deletes)
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

// ─────────────────────────────────────────────────────────────────────────────
// studioAgentConfigs
//
// One record per agent. An agent may be:
//   - project-scoped:   projectId is set
//   - feature-scoped:   featureId is set, projectId is null
//   - global:           projectId is null, featureId is "studio"
// ─────────────────────────────────────────────────────────────────────────────

export const studioAgentConfigs = defineTable({
  workspaceId: v.id("workspaces"),

  /** Scope: null = global, otherwise the project this agent serves. */
  projectId: v.optional(v.string()),

  /** Feature this agent belongs to (e.g. "studio", "ai", "crm"). */
  featureId: v.string(),

  // ── Identity ────────────────────────────────────────────────────────────
  name: v.string(),
  description: v.optional(v.string()),
  avatar: v.optional(v.string()),
  tags: v.array(v.string()),

  // ── Model config ─────────────────────────────────────────────────────────
  /** AI provider: "openrouter" | "anthropic" | "openai" | "azure" | "local" */
  provider: v.string(),
  /** Model identifier (provider-specific). */
  modelId: v.string(),
  maxTokens: v.number(),
  temperature: v.number(),
  topP: v.optional(v.number()),
  /** Whether this model supports image/vision inputs. */
  supportsVision: v.boolean(),
  /** Maximum image inputs per request. 0 = disabled. */
  maxImageInputs: v.number(),

  // ── Active instruction pointer ────────────────────────────────────────────
  /** Version number of the currently active instruction set. */
  activeInstructionVersion: v.number(),

  // ── UI schema targeting ───────────────────────────────────────────────────
  /** "0.4" (legacy) or "0.5" (current). New agents always target "0.5". */
  targetSchemaVersion: v.string(),

  // ── Image validation ─────────────────────────────────────────────────────
  imageValidationEnabled: v.boolean(),
  /** Convex storage IDs of reference images. */
  referenceImageIds: v.array(v.string()),
  /** "manual" | "auto-render" | "disabled" */
  imageValidationMode: v.string(),
  /** Similarity threshold 0–1. */
  imageMatchThreshold: v.number(),

  // ── Train Mode ───────────────────────────────────────────────────────────
  trainModeEnabled: v.boolean(),
  /** "implicit" | "explicit" | "disabled" */
  trainFeedbackMode: v.string(),
  trainFeedbackCount: v.number(),
  trainAutoUpdate: v.boolean(),
  trainAutoUpdateThreshold: v.number(),

  // ── Export settings ───────────────────────────────────────────────────────
  exportDefaultFileName: v.string(),
  exportFormats: v.object({
    png: v.boolean(),
    jpg: v.boolean(),
    html: v.boolean(),
    json: v.boolean(),
    typescript: v.boolean(),
  }),
  exportImageScale: v.number(),
  exportIncludeMetadata: v.boolean(),
  exportMinifyJson: v.boolean(),

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  /** "active" | "inactive" | "archived" */
  status: v.string(),
  createdBy: v.optional(v.id("users")),
  updatedBy: v.optional(v.id("users")),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_project", ["projectId"])
  .index("by_feature", ["featureId"])
  .index("by_workspace_feature", ["workspaceId", "featureId"]);

// ─────────────────────────────────────────────────────────────────────────────
// studioInstructionVersions
//
// Append-only version history for agent instructions.
// Versions are NEVER updated in place. Rollback = update `activeInstructionVersion`
// on the parent studioAgentConfigs record.
//
// Normalization: instruction history moved from an embedded array to a separate
// table for query efficiency and to avoid document size limits.
// ─────────────────────────────────────────────────────────────────────────────

export const studioInstructionVersions = defineTable({
  /** The agent this instruction version belongs to. */
  agentConfigId: v.id("studioAgentConfigs"),
  workspaceId: v.id("workspaces"),

  /** Monotonically increasing version number within this agent. */
  version: v.number(),

  /** The system prompt override. Empty string = use platform default. */
  systemPrompt: v.string(),

  /** Additional UI generation rules (appended to systemPrompt). */
  uiRules: v.optional(v.string()),

  /** Style constraints (appended to uiRules). */
  styleRules: v.optional(v.string()),

  /** Source of this version: "manual" | "train-mode" | "import" | "reset" */
  source: v.string(),

  /** Optional human-readable change note. */
  changeNote: v.optional(v.string()),

  /** Whether this is the currently active version (denormalized for quick reads). */
  isActive: v.boolean(),

  createdBy: v.optional(v.id("users")),
})
  .index("by_agent", ["agentConfigId"])
  .index("by_agent_version", ["agentConfigId", "version"])
  .index("by_agent_active", ["agentConfigId", "isActive"]);

// ─────────────────────────────────────────────────────────────────────────────
// studioTrainFeedback
//
// Append-only feedback entries collected in Train Mode.
// Each entry is immutable once created.
// Feedback informs — but does not automatically update — instruction versions.
// ─────────────────────────────────────────────────────────────────────────────

export const studioTrainFeedback = defineTable({
  agentConfigId: v.id("studioAgentConfigs"),
  workspaceId: v.id("workspaces"),
  projectId: v.optional(v.string()),

  /** The original user prompt that triggered generation. */
  originalPrompt: v.string(),

  /** The JSON output that was generated (stringified). */
  generatedOutput: v.string(),

  /** The revised output after user correction (stringified). Optional. */
  revisedOutput: v.optional(v.string()),

  /** "correction" | "rejection" | "approval" | "comment" */
  feedbackType: v.string(),

  /** Free-text note from the user. */
  note: v.optional(v.string()),

  /** Visual validation score at feedback time (0–1). */
  visualScore: v.optional(v.number()),

  /** The active instruction version when this feedback was collected. */
  instructionVersion: v.number(),

  createdBy: v.optional(v.id("users")),
})
  .index("by_agent", ["agentConfigId"])
  .index("by_workspace", ["workspaceId"])
  .index("by_type", ["feedbackType"])
  .index("by_agent_type", ["agentConfigId", "feedbackType"]);

// ─────────────────────────────────────────────────────────────────────────────
// studioVisualChecks
//
// Visual validation results comparing generated UI against reference images.
// Results are immutable once created.
// The UI reads the latest result for each agentConfigId.
// ─────────────────────────────────────────────────────────────────────────────

export const studioVisualChecks = defineTable({
  agentConfigId: v.id("studioAgentConfigs"),
  workspaceId: v.id("workspaces"),

  /** The UI document ID that was rendered and checked. */
  uiDocumentId: v.optional(v.string()),

  /** Convex storage ID of the rendered screenshot. */
  renderedImageId: v.optional(v.string()),

  /** Convex storage ID of the reference image. */
  referenceImageId: v.optional(v.string()),

  /** "match" | "partialMatch" | "mismatch" | "error" */
  status: v.string(),

  /** Similarity score (0–1). */
  score: v.optional(v.number()),

  /** Human-readable notes about the comparison. */
  notes: v.optional(v.string()),

  /** The instruction version active during this check. */
  instructionVersion: v.number(),

  triggeredBy: v.optional(v.id("users")),
})
  .index("by_agent", ["agentConfigId"])
  .index("by_workspace", ["workspaceId"])
  .index("by_status", ["status"])
  .index("by_agent_status", ["agentConfigId", "status"]);

// ─────────────────────────────────────────────────────────────────────────────
// studioUIDocuments
//
// Persisted UI documents (StudioUISchema v0.4 / v0.5).
// These are the actual page layouts created/edited in Studio.
// ─────────────────────────────────────────────────────────────────────────────

export const studioUIDocuments = defineTable({
  workspaceId: v.id("workspaces"),

  /** Optional project this document belongs to. */
  projectId: v.optional(v.string()),

  /** Agent that generated or last modified this document. */
  agentConfigId: v.optional(v.id("studioAgentConfigs")),

  // ── Identity ────────────────────────────────────────────────────────────
  name: v.string(),
  description: v.optional(v.string()),
  tags: v.array(v.string()),

  // ── Schema ────────────────────────────────────────────────────────────────
  /** "0.4" | "0.5" */
  schemaVersion: v.string(),

  /**
   * The actual UI document JSON (stringified).
   * Stored as a string to avoid Convex field-count limits on deeply nested objects.
   * Parse on read: JSON.parse(content) → StudioUISchema.
   */
  content: v.string(),

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  /** "draft" | "published" | "archived" */
  status: v.string(),

  isTemplate: v.boolean(),
  templateCategory: v.optional(v.string()),

  createdBy: v.optional(v.id("users")),
  updatedBy: v.optional(v.id("users")),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_project", ["projectId"])
  .index("by_agent", ["agentConfigId"])
  .index("by_template", ["isTemplate"]);

// ─────────────────────────────────────────────────────────────────────────────
// Export: merged table definitions for use in convex/schema.ts
// ─────────────────────────────────────────────────────────────────────────────

export const studioAgentTables = {
  studioAgentConfigs,
  studioInstructionVersions,
  studioTrainFeedback,
  studioVisualChecks,
  studioUIDocuments,
};
