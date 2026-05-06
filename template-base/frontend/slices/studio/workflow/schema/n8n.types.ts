/**
 * n8n Workflow JSON Schema Types
 *
 * Mirrors the n8n export format so Studio workflows can be imported/exported
 * directly with n8n without manual conversion.
 *
 * Reference: https://docs.n8n.io/workflows/export-import/
 * Compatible with n8n workflow JSON format.
 */

// ── Node ─────────────────────────────────────────────────────────────────────

export interface N8nNodePosition {
  /** [x, y] canvas position */
  0: number;
  1: number;
}

export interface N8nCredentialRef {
  /** Credential ID in n8n credential store */
  id: string;
  /** Display name */
  name: string;
}

export interface N8nNodeRetry {
  /** Max retry attempts (0 = no retry) */
  maxTries: number;
  /** Delay between retries in ms */
  waitBetweenTries: number;
}

export interface N8nNodeSettings {
  /** Skip this node during execution */
  disabled?: boolean;
  /** Don't halt execution on this node's error */
  continueOnFail?: boolean;
  /** Always pass data to the next node even on failure */
  alwaysOutputData?: boolean;
  /** Max execution time for this node in ms */
  executeOnce?: boolean;
  /** Retry configuration */
  retry?: N8nNodeRetry;
  /** Notes shown on canvas */
  notes?: string;
  /** Whether notes are displayed inline on the canvas */
  notesInFlow?: boolean;
  /** Node-level color accent (#hex) */
  color?: string;
}

export interface N8nNode {
  /** Unique node ID (UUID format in n8n) */
  id: string;
  /** Node display name on canvas */
  name: string;
  /** n8n node type key (e.g., "n8n-nodes-base.httpRequest") */
  type: string;
  /** Node type version */
  typeVersion: number;
  /** Canvas position as [x, y] tuple */
  position: [number, number];
  /** Node configuration parameters */
  parameters: Record<string, any>;
  /** Credentials referenced by this node */
  credentials?: Record<string, N8nCredentialRef>;
  /** Per-node execution settings */
  settings?: N8nNodeSettings;
  /** Whether node is disabled */
  disabled?: boolean;
  /** Notes shown in the node card (older n8n format) */
  notes?: string;
  /** Show notes inline on canvas */
  notesInFlow?: boolean;
  /** Webhook ID (for webhook trigger nodes) */
  webhookId?: string;
  /** Extra metadata */
  onError?: 'continueErrorOutput' | 'continueRegularOutput' | 'stopWorkflow';
}

// ── Connections ───────────────────────────────────────────────────────────────

export interface N8nConnectionTarget {
  /** Target node name */
  node: string;
  /** Connection type (always "main" for regular flow) */
  type: 'main';
  /** Output index on the target (for branching nodes like IF) */
  index: number;
}

/**
 * n8n connection map:
 * { "Source Node Name": { "main": [[{ node, type, index }]] } }
 * Outer array = output index (0=main, 1=else/error), inner array = targets.
 */
export type N8nConnections = Record<
  string,
  {
    main: N8nConnectionTarget[][];
  }
>;

// ── Settings ─────────────────────────────────────────────────────────────────

export type N8nSaveDataOption = 'all' | 'none' | 'error' | 'success';

export interface N8nWorkflowSettings {
  /** Order nodes are executed ("v1" = by connection order) */
  executionOrder?: 'v0' | 'v1';
  /** Save manually triggered executions */
  saveManualExecutions?: boolean;
  /** Save execution step-by-step progress */
  saveExecutionProgress?: boolean;
  /** When to save data for successful executions */
  saveDataSuccessExecution?: N8nSaveDataOption;
  /** When to save data for failed executions */
  saveDataErrorExecution?: N8nSaveDataOption;
  /** Which workflows can call this one */
  callerPolicy?: 'workflowsFromSameOwner' | 'any' | 'none';
  /** Error workflow ID to trigger on unhandled errors */
  errorWorkflow?: string;
  /** Execution timezone */
  timezone?: string;
  /** Max number of concurrent executions */
  maxConcurrency?: number;
}

// ── Full Workflow ─────────────────────────────────────────────────────────────

export interface N8nTag {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface N8nWorkflow {
  /** Workflow ID */
  id?: string;
  /** Version ID (UUID) */
  versionId?: string;
  /** Workflow display name */
  name: string;
  /** Whether the workflow is active (listening for triggers) */
  active: boolean;
  /** All nodes in the workflow */
  nodes: N8nNode[];
  /** Node-to-node connections */
  connections: N8nConnections;
  /** Global workflow settings */
  settings?: N8nWorkflowSettings;
  /** Tags for organization */
  tags?: N8nTag[];
  /** Pinned data for testing (nodeId → data array) */
  pinData?: Record<string, any[]>;
  /** Workflow metadata */
  meta?: {
    templateCredsSetupCompleted?: boolean;
    instanceId?: string;
  };
  /** Creation timestamp */
  createdAt?: string;
  /** Last update timestamp */
  updatedAt?: string;
}

// ── Import envelope ───────────────────────────────────────────────────────────

/**
 * The JSON shape when you export a workflow from n8n ("Copy to clipboard" or Download).
 * n8n wraps the workflow in an outer object when exporting multiple.
 */
export interface N8nExportEnvelope {
  /** Single workflow */
  workflow?: N8nWorkflow;
  /** Multiple workflows */
  data?: N8nWorkflow[];
}

// ── Studio → n8n node type map ────────────────────────────────────────────────

/**
 * Maps Studio node keys → canonical n8n node type strings.
 * Used by n8n-converter.ts to produce correct `type` values.
 */
export const STUDIO_TO_N8N_TYPE: Record<string, string> = {
  'trigger.manual':   'n8n-nodes-base.manualTrigger',
  'trigger.webhook':  'n8n-nodes-base.webhook',
  'trigger.schedule': 'n8n-nodes-base.scheduleTrigger',
  'trigger.event':    'n8n-nodes-base.n8nTrigger',

  'http.request':     'n8n-nodes-base.httpRequest',
  'http.respond':     'n8n-nodes-base.respondToWebhook',

  'data.set':         'n8n-nodes-base.set',
  'data.code':        'n8n-nodes-base.code',
  'data.expression':  'n8n-nodes-base.function',

  'flow.if':          'n8n-nodes-base.if',
  'flow.switch':      'n8n-nodes-base.switch',
  'flow.loop':        'n8n-nodes-base.splitInBatches',
  'flow.wait':        'n8n-nodes-base.wait',

  'ai.openai':        '@n8n/n8n-nodes-langchain.openAi',
  'ai.claude':        '@n8n/n8n-nodes-langchain.anthropic',

  'integrations.slack':    'n8n-nodes-base.slack',
  'integrations.email':    'n8n-nodes-base.emailSend',
  'integrations.database': 'n8n-nodes-base.postgres',

  'error.tryCatch':   'n8n-nodes-base.errorTrigger',
  'error.retry':      'n8n-nodes-base.executeWorkflow', // approximation
};

/** Reverse map: n8n type → Studio type */
export const N8N_TO_STUDIO_TYPE: Record<string, string> = Object.fromEntries(
  Object.entries(STUDIO_TO_N8N_TYPE).map(([k, v]) => [v, k])
);
