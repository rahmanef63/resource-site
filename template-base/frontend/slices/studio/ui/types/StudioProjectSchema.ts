/**
 * StudioProjectSchema — Formal TypeScript + Zod Contract
 *
 * A Studio Project is the top-level container that can hold:
 *   - One or more UI documents (StudioUISchema)
 *   - Zero or more Flow documents (StudioFlowSchema)
 *   - Agent configuration
 *   - Export settings
 *   - Image validation settings
 *   - Train mode history
 *
 * SOURCE OF TRUTH for the Studio project/document persistence format.
 * Stored in Convex as the canonical project record.
 *
 * @version 1.0
 */

import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// §1  Project Identity
// ─────────────────────────────────────────────────────────────────────────────

export const PROJECT_KIND = ["ui", "workflow", "unified"] as const;
export type ProjectKind = (typeof PROJECT_KIND)[number];

/**
 * Project document kind:
 *   "ui"       — contains only UI pages (StudioUISchema documents)
 *   "workflow" — contains only automation flows (StudioFlowSchema documents)
 *   "unified"  — contains both UI pages and automation flows
 */
export const ProjectKindEnum = z.enum(PROJECT_KIND);

export const PROJECT_STATUS = ["draft", "published", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUS)[number];

// ─────────────────────────────────────────────────────────────────────────────
// §2  Agent Configuration
//
// All agent configuration is centralized here (and in Convex).
// No agent config may be hardcoded in frontend components.
// ─────────────────────────────────────────────────────────────────────────────

export const LLMProviderEnum = z.enum(["openrouter", "anthropic", "openai", "azure", "local"]);
export type LLMProvider = z.infer<typeof LLMProviderEnum>;

/**
 * Model configuration for a single agent.
 * API keys are never stored here — they are resolved from the user's credential store.
 */
export const AgentModelConfigSchema = z.object({
  provider: LLMProviderEnum.default("openrouter"),
  modelId: z.string().max(100).default("google/gemini-2.5-flash"),
  maxTokens: z.number().int().min(256).max(32768).default(4096),
  temperature: z.number().min(0).max(2).default(0.3),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  /** Maximum image inputs per request. 0 = disabled. */
  maxImageInputs: z.number().int().min(0).max(10).default(4),
  /** Whether to include base64 image data in requests. */
  supportsVision: z.boolean().default(false),
});

export type AgentModelConfig = z.infer<typeof AgentModelConfigSchema>;

/**
 * A single version of an agent's custom instruction set.
 * Versions are immutable — updates create new versions.
 */
export const AgentInstructionVersionSchema = z.object({
  /** Monotonically increasing version number, starting at 1. */
  version: z.number().int().min(1),
  /** ISO 8601 timestamp when this version was created. */
  createdAt: z.string().datetime(),
  /** User ID who created this version. */
  createdBy: z.string().optional(),
  /** Source of change: manual edit, train-mode feedback, import. */
  source: z.enum(["manual", "train-mode", "import", "reset"]).default("manual"),
  /** The system prompt override for this agent. Empty string = use platform default. */
  systemPrompt: z.string().max(32000).default(""),
  /** UI generation rules appended to the base system prompt. */
  uiRules: z.string().max(16000).optional(),
  /** Style constraints appended to the base system prompt. */
  styleRules: z.string().max(16000).optional(),
  /** Optional change description / commit message. */
  changeNote: z.string().max(500).optional(),
  /** Whether this version is currently active. Only one version is active at a time. */
  isActive: z.boolean().default(false),
});

export type AgentInstructionVersion = z.infer<typeof AgentInstructionVersionSchema>;

/**
 * Image validation configuration for an agent.
 * Enables visual comparison of generated UI against reference screenshots.
 */
export const AgentImageValidationSchema = z.object({
  /** Whether image reference upload is enabled. */
  enabled: z.boolean().default(false),
  /** Convex file IDs for reference images uploaded by the user. */
  referenceImageIds: z.array(z.string()).max(10).default([]),
  /**
   * Validation mode:
   *   "manual"      — validation runs only when user triggers it
   *   "auto-render" — validation runs on every render cycle
   *   "disabled"    — no visual validation
   */
  validationMode: z.enum(["manual", "auto-render", "disabled"]).default("manual"),
  /** Similarity threshold (0–1) above which the result is "match". */
  matchThreshold: z.number().min(0).max(1).default(0.85),
  /** Last validation result. */
  lastResult: z.object({
    status: z.enum(["match", "partialMatch", "mismatch", "pending", "error"]),
    score: z.number().min(0).max(1).optional(),
    checkedAt: z.string().datetime().optional(),
    notes: z.string().optional(),
  }).optional(),
});

export type AgentImageValidation = z.infer<typeof AgentImageValidationSchema>;

/**
 * Train Mode configuration for an agent.
 *
 * Train Mode is NOT base model fine-tuning.
 * It is a structured feedback → versioned prompt update → rollback system.
 */
export const AgentTrainModeSchema = z.object({
  /** Whether Train Mode is enabled for this agent. */
  enabled: z.boolean().default(false),
  /**
   * Feedback collection mode:
   *   "implicit"  — any correction the user makes is logged
   *   "explicit"  — user must click "Submit Feedback" to log
   *   "disabled"  — no feedback collection
   */
  feedbackMode: z.enum(["implicit", "explicit", "disabled"]).default("explicit"),
  /** Total number of feedback entries collected. */
  feedbackCount: z.number().int().min(0).default(0),
  /** Whether auto-update of instructions from feedback is enabled. */
  autoUpdate: z.boolean().default(false),
  /** Minimum feedback entries before auto-update triggers. */
  autoUpdateThreshold: z.number().int().min(1).max(100).default(5),
});

export type AgentTrainMode = z.infer<typeof AgentTrainModeSchema>;

/**
 * Export settings for an agent / project.
 */
export const AgentExportSettingsSchema = z.object({
  /** Default export file name (without extension). */
  defaultFileName: z.string().max(100).default("studio-export"),
  /**
   * Enabled export formats.
   * All formats disabled by default — user enables what they need.
   */
  formats: z.object({
    png:        z.boolean().default(true),
    jpg:        z.boolean().default(false),
    html:       z.boolean().default(true),
    json:       z.boolean().default(true),
    typescript: z.boolean().default(false),
  }).default(() => ({ png: true, jpg: false, html: true, json: true, typescript: false })),
  /** PNG/JPG export scale (1 = 1x, 2 = 2x retina). */
  imageScale: z.number().min(1).max(4).default(2),
  /** Whether to include metadata block in JSON exports. */
  includeMetadata: z.boolean().default(true),
  /** Whether to minify JSON exports. */
  minifyJson: z.boolean().default(false),
});

export type AgentExportSettings = z.infer<typeof AgentExportSettingsSchema>;

/**
 * Complete configuration for a single Studio agent.
 *
 * Every agent in the system must have a Convex record following this schema.
 * No agent config may be hardcoded in frontend files.
 *
 * CRUD operations:
 *   - create: provide identity + defaults
 *   - read:   by agentId or projectId
 *   - update: any field (creates instruction version for systemPrompt changes)
 *   - delete: soft-delete (archived)
 *
 * IMPORTANT: Instruction history is append-only. The `instructionHistory` array
 * is never mutated — new versions are prepended. Rollback = set `activeVersion`.
 */
export const StudioAgentConfigSchema = z.object({
  /** Stable agent ID (UUID). */
  agentId: z.string().uuid(),
  /** Project this agent belongs to (null = global/platform agent). */
  projectId: z.string().uuid().nullable().default(null),
  /** Feature this agent serves ("studio", "ai", or a feature slug). */
  featureId: z.string().max(50).default("studio"),
  /** Workspace this agent belongs to. */
  workspaceId: z.string().optional(),

  // ── Identity ────────────────────────────────────────────────────────────
  name: z.string().max(100).default("Studio Agent"),
  description: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  tags: z.array(z.string().max(50)).max(20).default([]),

  // ── Model config ─────────────────────────────────────────────────────────
  modelConfig: AgentModelConfigSchema.default(() => ({
    provider: "openrouter" as const,
    modelId: "google/gemini-2.5-flash",
    maxTokens: 4096,
    temperature: 0.3,
    maxImageInputs: 4,
    supportsVision: false,
  })),

  // ── Instructions (versioned) ─────────────────────────────────────────────
  /** Currently active instruction version number. */
  activeInstructionVersion: z.number().int().min(1).default(1),
  /**
   * Full version history. Index 0 = most recent version.
   * Immutable — never update existing entries.
   */
  instructionHistory: z.array(AgentInstructionVersionSchema).default([]),

  // ── UI Schema rules ───────────────────────────────────────────────────────
  /** UI schema version this agent targets. Always "0.5" for new agents. */
  targetSchemaVersion: z.enum(["0.4", "0.5"]).default("0.5"),

  // ── Image validation ─────────────────────────────────────────────────────
  imageValidation: AgentImageValidationSchema.default(() => ({
    enabled: false,
    referenceImageIds: [],
    validationMode: "manual" as const,
    matchThreshold: 0.85,
  })),

  // ── Train Mode ───────────────────────────────────────────────────────────
  trainMode: AgentTrainModeSchema.default(() => ({
    enabled: false,
    feedbackMode: "explicit" as const,
    feedbackCount: 0,
    autoUpdate: false,
    autoUpdateThreshold: 5,
  })),

  // ── Export settings ───────────────────────────────────────────────────────
  exportSettings: AgentExportSettingsSchema.default(() => ({
    defaultFileName: "studio-export",
    formats: { png: true, jpg: false, html: true, json: true, typescript: false },
    imageScale: 2,
    includeMetadata: true,
    minifyJson: false,
  })),

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  status: z.enum(["active", "inactive", "archived"]).default("active"),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  createdBy: z.string().optional(),
});

export type StudioAgentConfig = z.infer<typeof StudioAgentConfigSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// §3  Train Mode Feedback Entry
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single Train Mode feedback entry.
 * Every feedback entry is immutable once created.
 * Feedback entries inform — but do not automatically update — instruction versions.
 */
export const TrainModeFeedbackSchema = z.object({
  /** Stable feedback entry ID (UUID). */
  feedbackId: z.string().uuid(),
  agentId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  workspaceId: z.string().optional(),

  /** The original prompt sent by the user. */
  originalPrompt: z.string().max(10000),
  /** The JSON output that was generated (as string). */
  generatedOutput: z.string().max(100000),
  /** The revised output after user correction (as string). */
  revisedOutput: z.string().max(100000).optional(),
  /**
   * Type of feedback:
   *   "correction"  — user modified the output
   *   "rejection"   — user discarded the output entirely
   *   "approval"    — user approved without changes
   *   "comment"     — user left a text note
   */
  feedbackType: z.enum(["correction", "rejection", "approval", "comment"]),
  /** Free-text note from the user. */
  note: z.string().max(2000).optional(),
  /** Visual validation result at the time of feedback (if any). */
  visualScore: z.number().min(0).max(1).optional(),
  /** Instruction version active when this feedback was collected. */
  instructionVersion: z.number().int().min(1),
  /** ISO 8601 timestamp. */
  createdAt: z.string().datetime(),
  createdBy: z.string().optional(),
});

export type TrainModeFeedback = z.infer<typeof TrainModeFeedbackSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// §4  StudioProjectSchema — Top-level project document
// ─────────────────────────────────────────────────────────────────────────────

/**
 * StudioProject is the root document stored in Convex.
 * It references UI and Flow documents by ID rather than embedding them.
 * This allows large documents to be loaded lazily.
 */
export const StudioProjectSchema = z.object({
  /** Schema format identifier for external validators. */
  $schema: z.literal("https://superspace.app/schemas/studio-project/1.0").optional(),

  // ── Identity ────────────────────────────────────────────────────────────
  /** Stable project ID (UUID). Also the Convex document ID. */
  projectId: z.string().uuid(),
  /** Convex workspace ID. */
  workspaceId: z.string(),
  /** Project display name. */
  name: z.string().max(200),
  /** Optional description. */
  description: z.string().max(1000).optional(),
  /** Searchable tags. */
  tags: z.array(z.string().max(50)).max(20).default([]),
  /** Author / creator display name. */
  author: z.string().optional(),
  /** Project kind: "ui" | "workflow" | "unified". */
  kind: ProjectKindEnum.default("ui"),
  /** Project status. */
  status: z.enum(PROJECT_STATUS).default("draft"),

  // ── Document references ──────────────────────────────────────────────────
  /** IDs of UI documents (StudioUISchema) in this project. Ordered. */
  uiDocumentIds: z.array(z.string()).default([]),
  /** IDs of Flow documents (StudioFlowSchema) in this project. Ordered. */
  flowDocumentIds: z.array(z.string()).default([]),

  // ── Agent ─────────────────────────────────────────────────────────────────
  /** ID of the StudioAgentConfig record for this project's agent. */
  agentConfigId: z.string().uuid().optional(),

  // ── Settings ──────────────────────────────────────────────────────────────
  /** Default export settings for this project (can be overridden per document). */
  exportSettings: AgentExportSettingsSchema.optional(),

  // ── Versioning ────────────────────────────────────────────────────────────
  /** SemVer project version. Managed by the user. */
  version: z.string().default("1.0.0"),

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().optional(),
  publishedAt: z.string().datetime().optional(),

  // ── Template ──────────────────────────────────────────────────────────────
  isTemplate: z.boolean().default(false),
  templateCategory: z.string().optional(),
});

export type StudioProject = z.infer<typeof StudioProjectSchema>;
