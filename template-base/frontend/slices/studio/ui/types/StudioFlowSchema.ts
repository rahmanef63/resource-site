/**
 * StudioFlowSchema — Formal TypeScript + Zod Contract
 *
 * Defines the structure for automation flow documents in Studio.
 *
 * n8n compatibility:
 *   This schema is NOT raw n8n JSON. It is a Studio-native format that can be
 *   TRANSFORMED to/from n8n JSON via the n8n-converter.ts module.
 *   Compatibility means: all Studio flow fields have a defined n8n mapping.
 *   It does NOT mean Studio documents are directly executable by n8n without conversion.
 *
 * SOURCE OF TRUTH for the Studio flow/workflow document format.
 *
 * @version 1.0
 */

import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// §1  Flow Node Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Studio flow node type registry.
 *
 * Format: "{category}.{action}"
 *   trigger.*   — starts an execution
 *   http.*      — HTTP operations
 *   data.*      — data manipulation
 *   logic.*     — conditional routing
 *   integration.* — third-party integrations
 *   ai.*        — AI/LLM operations
 *   error.*     — error handling
 *   util.*      — utility operations
 *
 * [N] Unknown node types are rejected by the flow validator.
 */
export const FLOW_NODE_TYPES = [
  // Triggers
  "trigger.manual",
  "trigger.webhook",
  "trigger.schedule",
  "trigger.event",
  "trigger.email",
  "trigger.form",
  // HTTP
  "http.request",
  "http.response",
  // Data
  "data.set",
  "data.get",
  "data.transform",
  "data.filter",
  "data.aggregate",
  "data.merge",
  "data.split",
  "data.sort",
  // Logic
  "logic.if",
  "logic.switch",
  "logic.loop",
  "logic.wait",
  "logic.merge",
  // Integration
  "integration.email",
  "integration.slack",
  "integration.webhook",
  "integration.database",
  "integration.storage",
  // AI
  "ai.generate",
  "ai.classify",
  "ai.extract",
  "ai.embed",
  "ai.image",
  // Error
  "error.catch",
  "error.throw",
  "error.retry",
  // Utility
  "util.log",
  "util.delay",
  "util.code",
  "util.note",
  // SuperSpace feature operations
  "feature.createRecord",
  "feature.updateRecord",
  "feature.deleteRecord",
  "feature.query",
  "feature.notify",
  "feature.sendEmail",
  "feature.createTask",
] as const;

export type FlowNodeType = (typeof FLOW_NODE_TYPES)[number];
export const FlowNodeTypeEnum = z.enum(FLOW_NODE_TYPES);
export const KNOWN_FLOW_NODE_TYPES = new Set(FLOW_NODE_TYPES);

// ─────────────────────────────────────────────────────────────────────────────
// §2  Connection / Edge Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Connection types between flow nodes.
 *   "main"    — default execution path
 *   "true"    — taken when condition is truthy (logic.if)
 *   "false"   — taken when condition is falsy (logic.if)
 *   "error"   — taken on node error (error.catch)
 *   "item"    — per-item output (logic.loop)
 *   "done"    — loop completion path (logic.loop)
 */
export const FlowConnectionTypeEnum = z.enum(["main", "true", "false", "error", "item", "done"]);
export type FlowConnectionType = z.infer<typeof FlowConnectionTypeEnum>;

// ─────────────────────────────────────────────────────────────────────────────
// §3  Flow Node
// ─────────────────────────────────────────────────────────────────────────────

const FlowNodePositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const FlowNodeRetrySchema = z.object({
  maxRetries: z.number().int().min(0).max(10).default(3),
  waitBetweenTries: z.number().int().min(0).max(300000).default(1000),
  backoffMultiplier: z.number().min(1).max(10).optional().default(2),
});

const FlowNodeSettingsSchema = z.object({
  /** Skip this node during execution (pass-through). */
  disabled: z.boolean().optional().default(false),
  /** Continue execution even if this node fails. */
  continueOnFail: z.boolean().optional().default(false),
  /** Always output data even on failure. */
  alwaysOutputData: z.boolean().optional().default(false),
  /** Retry configuration. */
  retry: FlowNodeRetrySchema.optional(),
  /** Node-level timeout in milliseconds. 0 = no timeout. */
  timeoutMs: z.number().int().min(0).optional().default(0),
  /** Inline notes for this node (visible on canvas). */
  notes: z.string().max(2000).optional(),
  /** Whether notes are shown as a badge on the canvas node. */
  notesInFlow: z.boolean().optional().default(false),
  /** Canvas accent color for this node (#hex). */
  color: z.string().regex(/^#[0-9a-fA-F]{3,6}$/).optional(),
});

const FlowCredentialRefSchema = z.object({
  /** Credential ID in the SuperSpace credential store. */
  id: z.string(),
  /** Credential type key (e.g. "httpBasicAuth", "oAuth2Api"). */
  type: z.string(),
  /** Display name. */
  name: z.string().optional(),
});

/**
 * Action/event binding: defines how a UI action maps to a flow trigger.
 *
 * This is the bridge between StudioUISchema actions and StudioFlowSchema triggers.
 */
const FlowActionBindingSchema = z.object({
  /** The UI widget node ID that triggers this. */
  sourceNodeId: z.string(),
  /** The UI event that triggers this (e.g. "onClick", "onSubmit", "onChange"). */
  event: z.enum(["onClick", "onSubmit", "onChange", "onHover", "onLoad", "onScroll"]),
  /** The flow node ID to trigger (must be a trigger.* type node). */
  targetFlowNodeId: z.string(),
  /** Optional data to pass from the UI event to the flow. */
  payload: z.record(z.string(), z.unknown()).optional(),
});

/**
 * A single node in a Studio flow document.
 *
 * [N] Flow invariants:
 *   1. Node IDs must be unique UUIDs within the document.
 *   2. All connection source/target node IDs must exist in the document.
 *   3. Exactly one trigger node must exist per independent execution path.
 *   4. No cycles are allowed except for logic.loop (which has an explicit "done" exit).
 */
export const StudioFlowNodeSchema = z.object({
  /** Stable node ID (UUID). */
  id: z.string().uuid(),
  /** Display name shown on the canvas. */
  name: z.string().max(100),
  /** Studio node type key. Must be in FLOW_NODE_TYPES. */
  type: FlowNodeTypeEnum,
  /**
   * Equivalent n8n node type for round-tripping.
   * Set by n8n-converter.ts; not required for Studio-native use.
   * Example: "n8n-nodes-base.webhook"
   */
  n8nType: z.string().optional(),
  /** Canvas position. Required for rendering. */
  position: FlowNodePositionSchema,
  /**
   * Node parameters / configuration.
   * Shape depends on `type`. Not formally typed here to allow extensibility,
   * but each node type has a defined parameter contract in the node registry.
   */
  parameters: z.record(z.string(), z.unknown()).default({}),
  /** Credentials reference (if the node requires authentication). */
  credentials: FlowCredentialRefSchema.optional(),
  /** Node execution settings. */
  settings: FlowNodeSettingsSchema.optional(),
  /** UI action bindings: which UI events trigger this node. */
  actionBindings: z.array(FlowActionBindingSchema).optional(),
});

export type StudioFlowNode = z.infer<typeof StudioFlowNodeSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// §4  Flow Connection
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A directed connection between two flow nodes.
 *
 * Connections are directional: source → target.
 * Multiple connections from one source node are allowed (fan-out).
 * Multiple connections to one target node are allowed (fan-in via merge).
 *
 * Connection output/input indices allow nodes with multiple output/input ports.
 */
export const StudioFlowConnectionSchema = z.object({
  /** Stable connection ID (UUID). */
  id: z.string().uuid(),
  /** Source node ID. Must exist in the flow document. */
  sourceNodeId: z.string().uuid(),
  /** Source output port index (0-based). Default is 0. */
  sourceOutputIndex: z.number().int().min(0).default(0),
  /** Target node ID. Must exist in the flow document. */
  targetNodeId: z.string().uuid(),
  /** Target input port index (0-based). Default is 0. */
  targetInputIndex: z.number().int().min(0).default(0),
  /** Connection type. Default is "main". */
  type: FlowConnectionTypeEnum.default("main"),
});

export type StudioFlowConnection = z.infer<typeof StudioFlowConnectionSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// §5  Flow Trigger Configuration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Top-level trigger specification for a flow document.
 * Determines how the flow is activated.
 *
 * The trigger node in `nodes` array provides the detailed configuration.
 * This top-level field is a summary for quick access.
 */
export const FlowTriggerSummarySchema = z.object({
  type: z.enum(["manual", "schedule", "webhook", "event", "email", "form"]).default("manual"),
  /** ID of the trigger node in the `nodes` array. */
  nodeId: z.string().uuid().optional(),
  /** Human-readable description of when this flow runs. */
  description: z.string().optional(),
  /** Schedule expression (cron format) for schedule triggers. */
  schedule: z.string().optional(),
  /** Webhook URL (read-only, set by runtime). */
  webhookUrl: z.string().url().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// §6  StudioFlowSchema — Top-level flow document
// ─────────────────────────────────────────────────────────────────────────────

export const FLOW_SCHEMA_VERSION = "1.0" as const;

/**
 * StudioFlowSchema — the complete flow/automation document format.
 *
 * [N] Invariants enforced by validateStudioFlowSchema:
 *   1.  `version` must be "1.0".
 *   2.  `nodes` must not be empty.
 *   3.  All node IDs must be unique UUIDs.
 *   4.  All connection source/target IDs must exist in `nodes`.
 *   5.  Connection IDs must be unique.
 *   6.  At least one trigger node must exist.
 *   7.  No non-loop cycles allowed.
 *   8.  All node types must be known FLOW_NODE_TYPES.
 *
 * [N] n8n compatibility:
 *   This format is TRANSFORMABLE to n8n JSON via n8n-converter.ts.
 *   "Compatible with n8n" means a converter produces valid n8n JSON.
 *   It does NOT mean this document is raw n8n JSON.
 */
export const StudioFlowSchemaZod = z.object({
  /** Schema format identifier. */
  $schema: z.literal("https://superspace.app/schemas/studio-flow/1.0").optional(),
  /** Flow document format version. Always "1.0". */
  version: z.literal(FLOW_SCHEMA_VERSION),
  /**
   * Document kind.
   * For flow-only documents: "workflow".
   * Unified documents use this embedded in StudioUnifiedDocument.
   */
  kind: z.literal("workflow"),

  // ── Identity ──────────────────────────────────────────────────────────────
  id: z.string().uuid(),
  name: z.string().max(200),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  version_label: z.string().optional(),

  // ── Trigger ───────────────────────────────────────────────────────────────
  trigger: FlowTriggerSummarySchema.default({ type: "manual" }),

  // ── Flow graph ────────────────────────────────────────────────────────────
  /** All flow nodes. Must not be empty. */
  nodes: z.array(StudioFlowNodeSchema).min(1),
  /** All connections between nodes. */
  connections: z.array(StudioFlowConnectionSchema).default([]),

  // ── Settings ──────────────────────────────────────────────────────────────
  settings: z.object({
    /** Maximum number of concurrent executions. */
    maxConcurrency: z.number().int().min(1).max(100).optional().default(1),
    /** Global flow timeout in milliseconds. 0 = no timeout. */
    timeoutMs: z.number().int().min(0).optional().default(0),
    /** Error handling policy. */
    onError: z.enum(["stop", "continue", "retry"]).optional().default("stop"),
    /** Maximum retry attempts for the entire flow. */
    maxRetries: z.number().int().min(0).max(10).optional().default(0),
    /** SLA deadline in milliseconds. 0 = no SLA. */
    slaDurationMs: z.number().int().min(0).optional().default(0),
    /** Whether execution logs are retained. */
    retainLogs: z.boolean().optional().default(true),
    /** Log retention period in days. */
    logRetentionDays: z.number().int().min(1).max(365).optional().default(30),
  }).optional().default(() => ({
    maxConcurrency: 1,
    timeoutMs: 0,
    onError: "stop" as const,
    maxRetries: 0,
    slaDurationMs: 0,
    retainLogs: true,
    logRetentionDays: 30,
  })),

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  status: z.enum(["draft", "active", "paused", "archived"]).default("draft"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().optional(),
  workspaceId: z.string().optional(),
  projectId: z.string().uuid().optional(),
});

export type StudioFlowDocument = z.infer<typeof StudioFlowSchemaZod>;

// ─────────────────────────────────────────────────────────────────────────────
// §7  StudioUnifiedDocument — combined UI + Flow
// ─────────────────────────────────────────────────────────────────────────────

/**
 * StudioUnifiedDocument wraps both a UI document and a flow document
 * in a single exportable/importable format.
 *
 * This is the format used for "Export as Studio Document" (the unified export).
 *
 * [N] If `kind` is "ui", the `flow` field MUST be absent.
 * [N] If `kind` is "workflow", the `ui` field MUST be absent.
 * [N] If `kind` is "unified", both `ui` and `flow` MUST be present.
 */
export const StudioUnifiedDocumentSchema = z.object({
  /** Schema format identifier. */
  $schema: z.literal("https://superspace.app/schemas/studio-unified/1.0").optional(),
  /** Document format version. */
  studioVersion: z.literal("1.0"),
  /**
   * Document kind:
   *   "ui"       — UI pages only (no flow)
   *   "workflow" — Flow only (no UI)
   *   "unified"  — Both UI and flow
   */
  kind: z.enum(["ui", "workflow", "unified"]),

  // ── Shared metadata ────────────────────────────────────────────────────────
  id: z.string().uuid(),
  name: z.string().max(200),
  description: z.string().max(1000).optional(),
  author: z.string().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  workspaceId: z.string().optional(),
  isTemplate: z.boolean().optional().default(false),

  // ── Embedded documents ────────────────────────────────────────────────────
  /**
   * The UI document. Required when kind is "ui" or "unified".
   * Inlined (not referenced by ID) for portability.
   */
  ui: z.any().optional(), // StudioUISchema — imported dynamically to avoid circular

  /**
   * The flow document. Required when kind is "workflow" or "unified".
   * Inlined for portability.
   */
  flow: StudioFlowSchemaZod.optional(),
});

export type StudioUnifiedDocument = z.infer<typeof StudioUnifiedDocumentSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// §8  n8n Compatibility Notes (Informative)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * [I] n8n compatibility is defined as:
 *
 *   1. There exists a deterministic, lossless transformation:
 *      StudioFlowDocument → n8n workflow JSON
 *
 *   2. There exists a best-effort reverse transformation:
 *      n8n workflow JSON → StudioFlowDocument
 *      (some n8n fields have no Studio equivalent and are mapped to `parameters`)
 *
 *   3. The transformation is implemented in:
 *      frontend/slices/studio/workflow/schema/n8n-converter.ts
 *
 *   4. "Compatible with n8n" does NOT mean:
 *      - Studio documents execute on n8n without conversion
 *      - n8n-specific node types work without the converter
 *      - All n8n features are supported (only a subset is mapped)
 *
 * [N] n8nType on StudioFlowNode:
 *      When a StudioFlowNode has an `n8nType` set, the converter uses it
 *      directly. When absent, the converter applies the default type mapping
 *      defined in n8n-converter.ts.
 */
export const N8N_COMPATIBILITY_NOTE = "Defined in frontend/slices/studio/workflow/schema/n8n-converter.ts";
