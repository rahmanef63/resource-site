/**
 * Studio Feature - Unified Visual Builder
 *
 * Combines CMS Builder and Automation into a single canvas experience.
 *
 * Public API for other features consuming studio:
 * - StudioPage: main studio page component
 * - StudioCanvasProvider: canvas context provider (inject studio config into shared builder)
 * - workflow schema types and converters
 * - studioConfig: feature config (SSOT)
 */

export { studioConfig, default as config } from './config';
export { initStudio } from './init';
export * from './registry';

// Re-export page component
export { StudioPage } from './pages/StudioPage';

// Canvas provider (studio-specific wrapper around SharedCanvasProvider)
export { StudioCanvasProvider } from './canvas/StudioCanvasProvider';
export * from './publishing';

// Workflow schema
export type { StudioDocument, StudioFlow, StudioFlowNode } from './workflow/schema/studio-unified.types';
export { toN8nWorkflow, fromN8nWorkflow } from './workflow/schema/n8n-converter';
