// Studio Unified JSON Schema v1.0
export type {
  StudioDocument,
  StudioFlow,
  StudioFlowNode,
  StudioFlowEdge,
  StudioUISchema,
  StudioUISchemaNode,
  StudioProjectMetadata,
  StudioDocumentKind,
  StudioFlowNodeSettings,
  StudioCredentialRef,
  StudioFlowSettings,
  StudioExportEnvelope,
} from './studio-unified.types';
export { createStudioDocument } from './studio-unified.types';

// n8n compatibility
export type { N8nWorkflow, N8nNode, N8nConnections } from './n8n.types';
export { STUDIO_TO_N8N_TYPE, N8N_TO_STUDIO_TYPE } from './n8n.types';

// Converter
export {
  toN8nWorkflow,
  fromN8nWorkflow,
  legacyFlowToStudioFlow,
  studioFlowToLegacy,
} from './n8n-converter';
