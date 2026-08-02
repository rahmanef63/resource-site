/**
 * Builder Domain Facade
 *
 * Core CMS/Builder functionality including:
 * - Canvas system (SharedCanvasProvider, DnD, Layout)
 * - Inspector components (Dynamic, Composite, Smart)
 * - Component library management
 * - Blocks, Elements, Sections, Templates
 * - Flow builder
 *
 * @example
 * import { SharedCanvasProvider, useSharedCanvas, DynamicInspector } from '@/frontend/shared/builder'
 */

// ============================================================
// Canvas System
// ============================================================
export * from './canvas'
export * from './canvas/core'
export * from './canvas/nodes'

// ============================================================
// Inspector Components
// ============================================================
export { DynamicInspector } from './inspector/DynamicInspector'
export { CompositeInspector, useCompositeInspector } from './inspector/CompositeInspector'
export { SmartInspector } from './inspector/SmartInspector'
export { ChildrenManager } from './inspector/ChildrenManager'
export { InspectorTabs } from './inspector/InspectorTabs'
export { UnifiedInspector } from './inspector/UnifiedInspector'
export { ChatAI } from './inspector/ChatAI'

// ============================================================
// Component Library
// ============================================================
export { UnifiedLibrary } from './library/UnifiedLibrary'
export { TemplateLibrary, addSelectionAsTemplate } from './library/TemplateLibrary'
export type { TemplateProvider } from './library/TemplateLibrary'
export { DraggableLibraryItem } from './library/DraggableLibraryItem'

// ============================================================
// Blocks (Composite Components)
// ============================================================
export * from './blocks'

// ============================================================
// Elements (Atomic Components)
// ============================================================
export * from './elements'

// ============================================================
// Sections (Page Sections)
// ============================================================
export * from './sections'

// ============================================================
// Templates (Full Pages)
// ============================================================
export * from './templates'

// ============================================================
// Flows (Visual Programming)
// ============================================================
export * from './flows'

// ============================================================
// Types
// ============================================================
export type {
  // Canvas types
  CanvasNode,
  CanvasEdge,
  CanvasState,
  CanvasConfig,
} from './canvas/core/types'
