/**
 * Studio Unified JSON Schema v1.0
 *
 * A single JSON format that covers:
 *   - Automation flows   (kind: "workflow")
 *   - UI layouts         (kind: "ui-layout")
 *   - Combined projects  (kind: "unified")
 *
 * Design goals:
 *   1. n8n-compatible flow section  →  can round-trip through n8n-converter.ts
 *   2. Consistent metadata across UI and flow
 *   3. Strict typing — all fields documented
 *   4. Backwards-compatible with the v0.4 UI schema (embedded in `ui` section)
 *
 * @see docs/flow-json-schema.md     Full reference with examples
 * @see docs/n8n-compatibility.md   n8n field mapping table
 * @see workflow/schema/n8n.types.ts n8n JSON types
 */

// ── Metadata (shared between all kinds) ───────────────────────────────────────

export interface StudioProjectMetadata {
  /** Unique project ID (UUID) */
  id: string;
  /** Human-readable name */
  name: string;
  /** Optional description */
  description?: string;
  /** Author / creator */
  author?: string;
  /** Searchable tags */
  tags?: string[];
  /** SemVer project version (e.g. "1.0.0") */
  version?: string;
  /** ISO 8601 creation timestamp */
  createdAt: string;
  /** ISO 8601 last-updated timestamp */
  updatedAt: string;
  /** Workspace this project belongs to */
  workspaceId?: string;
  /** Whether this is a reusable template */
  isTemplate?: boolean;
  /** Schema spec URL */
  $schema?: string;
}

// ── Flow section (n8n-compatible) ─────────────────────────────────────────────

export interface StudioFlowNodeSettings {
  /** Skip node during execution */
  disabled?: boolean;
  /** Continue execution even if this node fails */
  continueOnFail?: boolean;
  /** Always emit output even on failure */
  alwaysOutputData?: boolean;
  /** Retry configuration */
  retry?: {
    maxRetries: number;
    /** Delay between retries in ms */
    waitBetweenTries: number;
    /** Backoff multiplier (1 = fixed delay) */
    backoffMultiplier?: number;
  };
  /** Node-level timeout in ms (0 = no timeout) */
  timeout?: number;
  /** Inline canvas notes */
  notes?: string;
  /** Show notes as badge on canvas node */
  notesInFlow?: boolean;
  /** Accent color for this node on canvas (#hex) */
  color?: string;
}

export interface StudioCredentialRef {
  /** Credential ID in SuperSpace credential store */
  id: string;
  /** Credential type key (e.g., "httpBasicAuth", "oAuth2Api") */
  type: string;
  /** Display name */
  name?: string;
}

export interface StudioFlowNode {
  /** Unique node ID (stable UUID) */
  id: string;
  /** Display name shown on canvas */
  name: string;
  /** Studio node type key (e.g., "trigger.webhook", "http.request") */
  type: string;
  /**
   * Equivalent n8n node type (e.g., "n8n-nodes-base.webhook").
   * Set automatically by n8n-converter; used for round-tripping.
   */
  n8nType?: string;
  /** Canvas position */
  position: { x: number; y: number };
  /**
   * Node parameters / configuration.
   * Matches the `props` in the node's PropsConfig.
   * Renamed from "props" → "parameters" for n8n alignment.
   */
  parameters: Record<string, any>;
  /** Credentials required by this node */
  credentials?: Record<string, StudioCredentialRef>;
  /** Per-node execution settings */
  settings?: StudioFlowNodeSettings;
  /** Node category (visual only — derived from manifest.category) */
  category?: string;
  /** Feature slug this node belongs to (e.g., "calendar", "crm") */
  feature?: string;
}

export interface StudioFlowEdge {
  /** Unique edge ID */
  id: string;
  /** Source node ID */
  source: string;
  /** Target node ID */
  target: string;
  /**
   * Source handle index (0 = main/true, 1 = else/false for IF nodes).
   * Matches n8n's output index concept.
   */
  sourceHandle?: number;
  /** Target handle index */
  targetHandle?: number;
  /** Optional display label */
  label?: string;
  /** Condition expression (for conditional edges) */
  condition?: string;
  /** Edge ordering within parallel branches */
  order?: number;
}

export interface StudioFlowSettings {
  /** Execution order algorithm ("v1" recommended) */
  executionOrder?: 'v0' | 'v1';
  /** Execution timezone */
  timezone?: string;
  /** Max concurrent executions (0 = unlimited) */
  maxConcurrency?: number;
  /** Save execution history */
  saveHistory?: boolean;
  /** Error workflow ID to trigger on unhandled errors */
  errorWorkflowId?: string;
}

export interface StudioFlow {
  /** Flow schema version */
  version: '1.0';
  /** Flow nodes */
  nodes: StudioFlowNode[];
  /** Node connections */
  edges: StudioFlowEdge[];
  /** Global flow execution settings */
  settings?: StudioFlowSettings;
}

// ── UI section (v0.5, backwards-compatible with v0.4) ─────────────────────────

export interface StudioUISchemaNode {
  /** Widget type key (e.g., "div", "text", "button", "tableBlock") */
  type: string;
  /**
   * Widget props — non-default values only.
   * All style-related props (color, fontSize, padding) are included here
   * and applied via propsToStyle() in Renderer.
   */
  props: Record<string, any>;
  /** Ordered list of child node IDs */
  children: string[];
}

export interface StudioUISchema {
  /** UI schema version */
  version: '0.5';
  /** Top-level node IDs (page roots) */
  root: string[];
  /** All nodes keyed by ID */
  nodes: Record<string, StudioUISchemaNode>;
}

// ── Unified document ──────────────────────────────────────────────────────────

export type StudioDocumentKind = 'workflow' | 'ui-layout' | 'unified';

export interface StudioDocument {
  /** JSON schema URL (for tooling / IDE support) */
  $schema: 'https://superspace.app/schemas/studio/v1.0';
  /** Studio document format version */
  studioVersion: '1.0';
  /**
   * Document kind:
   * - "workflow"   → only `flow` section present
   * - "ui-layout"  → only `ui` section present
   * - "unified"    → both `flow` and `ui` present (full Studio project)
   */
  kind: StudioDocumentKind;
  /** Shared project metadata */
  metadata: StudioProjectMetadata;
  /** Automation workflow (required for kind="workflow" or "unified") */
  flow?: StudioFlow;
  /** UI layout (required for kind="ui-layout" or "unified") */
  ui?: StudioUISchema;
}

// ── Export envelope ───────────────────────────────────────────────────────────

export interface StudioExportEnvelope {
  /** The Studio document */
  document: StudioDocument;
  /** Export timestamp */
  exportedAt: string;
  /** Exporter version info */
  exporter: {
    name: 'SuperSpace Studio';
    version: string;
  };
}

// ── Helper: create empty document ────────────────────────────────────────────

export function createStudioDocument(
  kind: StudioDocumentKind,
  metadata: Partial<StudioProjectMetadata> = {}
): StudioDocument {
  const now = new Date().toISOString();
  const base: StudioDocument = {
    $schema: 'https://superspace.app/schemas/studio/v1.0',
    studioVersion: '1.0',
    kind,
    metadata: {
      id: crypto.randomUUID?.() ?? `doc-${Date.now()}`,
      name: metadata.name ?? 'Untitled',
      description: metadata.description,
      author: metadata.author,
      tags: metadata.tags ?? [],
      version: metadata.version ?? '1.0.0',
      createdAt: metadata.createdAt ?? now,
      updatedAt: now,
      workspaceId: metadata.workspaceId,
      isTemplate: metadata.isTemplate ?? false,
    },
  };

  if (kind === 'workflow' || kind === 'unified') {
    base.flow = { version: '1.0', nodes: [], edges: [], settings: { executionOrder: 'v1', timezone: 'UTC' } };
  }

  if (kind === 'ui-layout' || kind === 'unified') {
    base.ui = { version: '0.5', root: [], nodes: {} };
  }

  return base;
}
