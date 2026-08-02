/**
 * n8n ↔ Studio JSON Converter
 *
 * Bidirectional conversion between:
 *   - Studio Unified JSON v1.0  (StudioDocument / StudioFlow)
 *   - n8n Workflow JSON         (N8nWorkflow)
 *
 * Usage:
 *   import { toN8nWorkflow, fromN8nWorkflow } from './n8n-converter';
 *
 *   // Export Studio → n8n
 *   const n8nJson = toN8nWorkflow(studioDocument);
 *
 *   // Import n8n → Studio
 *   const studio = fromN8nWorkflow(n8nWorkflow);
 */

import type {
  StudioDocument,
  StudioFlow,
  StudioFlowNode,
  StudioFlowEdge,
  StudioProjectMetadata,
} from './studio-unified.types';
import { createStudioDocument } from './studio-unified.types';
import type {
  N8nWorkflow,
  N8nNode,
  N8nConnections,
  N8nConnectionTarget,
} from './n8n.types';
import { STUDIO_TO_N8N_TYPE, N8N_TO_STUDIO_TYPE } from './n8n.types';

// ── Studio → n8n ──────────────────────────────────────────────────────────────

/**
 * Convert a Studio document (or just its flow section) to n8n workflow JSON.
 *
 * @param input - Either a full StudioDocument or a bare StudioFlow
 * @param meta  - Optional metadata override
 */
export function toN8nWorkflow(
  input: StudioDocument | StudioFlow,
  meta?: Partial<Pick<StudioProjectMetadata, 'name' | 'tags' | 'id' | 'createdAt' | 'updatedAt'>>
): N8nWorkflow {
  const flow: StudioFlow = 'studioVersion' in input
    ? (input as StudioDocument).flow ?? { version: '1.0', nodes: [], edges: [] }
    : (input as StudioFlow);

  const docMeta = 'studioVersion' in input
    ? (input as StudioDocument).metadata
    : undefined;

  // Build connections map (n8n uses node names, not IDs)
  const idToName: Record<string, string> = {};
  for (const node of flow.nodes) {
    idToName[node.id] = node.name;
  }

  const connections: N8nConnections = {};
  for (const edge of flow.edges) {
    const sourceName = idToName[edge.source];
    const targetName = idToName[edge.target];
    if (!sourceName || !targetName) continue;

    const outputIdx = edge.sourceHandle ?? 0;

    if (!connections[sourceName]) connections[sourceName] = { main: [] };
    while (connections[sourceName].main.length <= outputIdx) {
      connections[sourceName].main.push([]);
    }

    const conn: N8nConnectionTarget = {
      node: targetName,
      type: 'main',
      index: edge.targetHandle ?? 0,
    };
    connections[sourceName].main[outputIdx].push(conn);
  }

  // Convert nodes
  const n8nNodes: N8nNode[] = flow.nodes.map((node) => {
    const n8nType = node.n8nType ?? STUDIO_TO_N8N_TYPE[node.type] ?? `superspace.${node.type}`;
    const settings = node.settings ?? {};

    return {
      id: node.id,
      name: node.name,
      type: n8nType,
      typeVersion: 1,
      position: [node.position.x, node.position.y],
      parameters: node.parameters ?? {},
      credentials: node.credentials
        ? Object.fromEntries(
            Object.entries(node.credentials).map(([k, v]) => [k, { id: v.id, name: v.name ?? k }])
          )
        : undefined,
      disabled: settings.disabled ?? false,
      settings: {
        continueOnFail: settings.continueOnFail,
        alwaysOutputData: settings.alwaysOutputData,
        retry: settings.retry
          ? { maxTries: settings.retry.maxRetries, waitBetweenTries: settings.retry.waitBetweenTries }
          : undefined,
        notes: settings.notes,
        notesInFlow: settings.notesInFlow,
        color: settings.color,
      },
    };
  });

  const finalName = meta?.name ?? docMeta?.name ?? 'Studio Workflow';

  return {
    id: meta?.id ?? docMeta?.id,
    versionId: crypto.randomUUID?.(),
    name: finalName,
    active: false,
    nodes: n8nNodes,
    connections,
    settings: {
      executionOrder: flow.settings?.executionOrder ?? 'v1',
      timezone: flow.settings?.timezone ?? 'UTC',
      saveManualExecutions: false,
      saveExecutionProgress: false,
      saveDataSuccessExecution: 'all',
      saveDataErrorExecution: 'all',
    },
    tags: (meta?.tags ?? docMeta?.tags ?? []).map((t) => ({ id: t, name: t })),
    createdAt: meta?.createdAt ?? docMeta?.createdAt,
    updatedAt: meta?.updatedAt ?? docMeta?.updatedAt,
  };
}

// ── n8n → Studio ──────────────────────────────────────────────────────────────

/**
 * Convert an n8n workflow JSON to a Studio document.
 *
 * @param n8n   - n8n workflow JSON (from clipboard or file import)
 * @param extra - Optional extra metadata to merge in
 */
export function fromN8nWorkflow(
  n8n: N8nWorkflow,
  extra?: Partial<StudioProjectMetadata>
): StudioDocument {
  const now = new Date().toISOString();

  // Build name → ID map for edge resolution
  const nameToId: Record<string, string> = {};
  for (const node of n8n.nodes) {
    nameToId[node.name] = node.id;
  }

  // Convert nodes
  const studioNodes: StudioFlowNode[] = n8n.nodes.map((n8nNode) => {
    const studioType = N8N_TO_STUDIO_TYPE[n8nNode.type] ?? n8nNode.type;

    return {
      id: n8nNode.id,
      name: n8nNode.name,
      type: studioType,
      n8nType: n8nNode.type,
      position: { x: n8nNode.position[0], y: n8nNode.position[1] },
      parameters: n8nNode.parameters ?? {},
      credentials: n8nNode.credentials
        ? Object.fromEntries(
            Object.entries(n8nNode.credentials).map(([k, v]) => [
              k,
              { id: v.id, type: k, name: v.name },
            ])
          )
        : undefined,
      settings: {
        disabled: n8nNode.disabled ?? n8nNode.settings?.disabled,
        continueOnFail: n8nNode.settings?.continueOnFail,
        alwaysOutputData: n8nNode.settings?.alwaysOutputData,
        retry: n8nNode.settings?.retry
          ? {
              maxRetries: n8nNode.settings.retry.maxTries,
              waitBetweenTries: n8nNode.settings.retry.waitBetweenTries,
            }
          : undefined,
        notes: n8nNode.notes ?? n8nNode.settings?.notes,
        notesInFlow: n8nNode.notesInFlow ?? n8nNode.settings?.notesInFlow,
        color: n8nNode.settings?.color,
      },
    };
  });

  // Convert connections → edges
  const edges: StudioFlowEdge[] = [];
  for (const [sourceName, outputMap] of Object.entries(n8n.connections)) {
    const sourceId = nameToId[sourceName];
    if (!sourceId) continue;

    for (let outputIdx = 0; outputIdx < (outputMap.main?.length ?? 0); outputIdx++) {
      const targets = outputMap.main[outputIdx] ?? [];
      for (const target of targets) {
        const targetId = nameToId[target.node];
        if (!targetId) continue;
        edges.push({
          id: `e-${sourceId}-${targetId}-${outputIdx}`,
          source: sourceId,
          target: targetId,
          sourceHandle: outputIdx,
          targetHandle: target.index,
        });
      }
    }
  }

  const doc = createStudioDocument('workflow', {
    id: n8n.id,
    name: n8n.name,
    tags: n8n.tags?.map((t) => t.name),
    createdAt: n8n.createdAt ?? now,
    updatedAt: n8n.updatedAt ?? now,
    ...extra,
  });

  doc.flow = {
    version: '1.0',
    nodes: studioNodes,
    edges,
    settings: {
      executionOrder: n8n.settings?.executionOrder ?? 'v1',
      timezone: n8n.settings?.timezone ?? 'UTC',
    },
  };

  return doc;
}

// ── Legacy FlowDefinition adapter ────────────────────────────────────────────

/**
 * Convert legacy FlowDefinition (shared/builder/flows/types.ts) to StudioFlow.
 * Enables gradual migration from the old format.
 */
export function legacyFlowToStudioFlow(legacy: {
  id: string;
  name: string;
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: { type: string; props: Record<string, any>; label?: string; category?: string; feature?: string };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    data?: { order?: number; label?: string; condition?: string };
  }>;
  metadata?: Record<string, any>;
}): StudioFlow {
  return {
    version: '1.0',
    nodes: legacy.nodes.map((n) => ({
      id: n.id,
      name: n.data.label ?? n.data.type,
      type: n.data.type,
      position: n.position,
      parameters: n.data.props ?? {},
      category: n.data.category,
      feature: n.data.feature,
    })),
    edges: legacy.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.data?.label,
      condition: e.data?.condition,
      order: e.data?.order,
    })),
    settings: { executionOrder: 'v1', timezone: 'UTC' },
  };
}

/**
 * Convert StudioFlow back to legacy FlowDefinition for backwards-compatibility
 * with components that still consume the old format.
 */
export function studioFlowToLegacy(flow: StudioFlow): {
  id: string;
  name: string;
  nodes: any[];
  edges: any[];
} {
  return {
    id: 'current-flow',
    name: 'Automation Flow',
    nodes: flow.nodes.map((n) => ({
      id: n.id,
      type: 'automationNode',
      position: n.position,
      data: {
        type: n.type,
        props: n.parameters,
        label: n.name,
        category: n.category,
        feature: n.feature,
      },
    })),
    edges: flow.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      data: {
        order: e.order,
        label: e.label,
        condition: e.condition,
      },
    })),
  };
}
