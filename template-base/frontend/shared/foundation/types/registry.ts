/**
 * Registry Types
 * Defines how components, elements, blocks, etc. are registered and discovered
 */

import type {
  ComponentWrapper,
  ElementWrapper,
  BlockWrapper,
  SectionWrapper,
  TemplateWrapper,
  FlowWrapper,
  NodeLevel,
  NodeMetadata,
  AnyWrapper,
} from "./core"

// ============================================================================
// Registry Entry
// ============================================================================

export interface RegistryEntry<T = AnyWrapper> {
  id: string
  type: NodeLevel
  wrapper: T
  metadata: NodeMetadata
  filePath?: string // For debugging/hot-reload
}

// ============================================================================
// Registry Interface
// ============================================================================

export interface IRegistry {
  // Registration
  register<T extends AnyWrapper>(entry: RegistryEntry<T>): void
  unregister(id: string, type: NodeLevel): void

  // Lookup
  get(id: string, type: NodeLevel): AnyWrapper | undefined
  getComponent(id: string): ComponentWrapper | undefined
  getElement(id: string): ElementWrapper | undefined
  getBlock(id: string): BlockWrapper | undefined
  getSection(id: string): SectionWrapper | undefined
  getTemplate(id: string): TemplateWrapper | undefined
  getFlow(id: string): FlowWrapper | undefined

  // Query
  getAll(type: NodeLevel): AnyWrapper[]
  getAllComponents(): ComponentWrapper[]
  getAllElements(): ElementWrapper[]
  getAllBlocks(): BlockWrapper[]
  getAllSections(): SectionWrapper[]
  getAllTemplates(): TemplateWrapper[]
  getAllFlows(): FlowWrapper[]

  // Filter
  getByCategory(type: NodeLevel, category: string): AnyWrapper[]
  getByTag(type: NodeLevel, tag: string): AnyWrapper[]
  search(type: NodeLevel, query: string): AnyWrapper[]

  // Validation
  has(id: string, type: NodeLevel): boolean
  validate(): RegistryValidationResult

  // Metadata
  getMetadata(id: string, type: NodeLevel): NodeMetadata | undefined
  getTotalCount(): number
  getCountByType(type: NodeLevel): number
}

// ============================================================================
// Registry Validation
// ============================================================================

export interface RegistryValidationResult {
  valid: boolean
  errors: RegistryValidationError[]
  warnings: RegistryValidationWarning[]
}

export interface RegistryValidationError {
  id: string
  type: NodeLevel
  message: string
  severity: "error"
}

export interface RegistryValidationWarning {
  id: string
  type: NodeLevel
  message: string
  severity: "warning"
}

// ============================================================================
// Auto-Discovery Config
// ============================================================================

export interface RegistryConfig {
  // Auto-discovery paths
  paths: {
    components: string
    elements: string
    blocks: string
    sections: string
    templates: string
    flows: string
  }

  // Pattern matching
  pattern: string // e.g., "**/registry.ts"

  // Hot reload (dev mode)
  hotReload: boolean

  // Validation
  validateOnRegister: boolean
  throwOnDuplicates: boolean
  allowOverrides: boolean

  // Caching
  cache: boolean
  cacheDir?: string
}

export const defaultRegistryConfig: RegistryConfig = {
  paths: {
    components: "frontend/shared/components",
    elements: "frontend/shared/elements",
    blocks: "frontend/shared/blocks",
    sections: "frontend/shared/sections",
    templates: "frontend/shared/templates",
    flows: "frontend/shared/flows",
  },
  pattern: "**/registry.ts",
  hotReload: process.env.NODE_ENV === "development",
  validateOnRegister: true,
  throwOnDuplicates: true,
  allowOverrides: false,
  cache: true,
  cacheDir: ".cache/registry",
}

// ============================================================================
// Registry Events
// ============================================================================

export type RegistryEventType =
  | "register"
  | "unregister"
  | "update"
  | "clear"
  | "reload"

export interface RegistryEvent {
  type: RegistryEventType
  id?: string
  nodeType?: NodeLevel
  timestamp: number
  data?: any
}

export type RegistryEventListener = (event: RegistryEvent) => void

export interface IRegistryEventEmitter {
  on(eventType: RegistryEventType, listener: RegistryEventListener): void
  off(eventType: RegistryEventType, listener: RegistryEventListener): void
  emit(event: RegistryEvent): void
}

// ============================================================================
// Registry Loader
// ============================================================================

export interface IRegistryLoader {
  load(config: RegistryConfig): Promise<LoadResult>
  loadFrom(path: string, type: NodeLevel): Promise<LoadResult>
  reload(): Promise<LoadResult>
}

export interface LoadResult {
  success: boolean
  loaded: number
  skipped: number
  errors: LoadError[]
}

export interface LoadError {
  path: string
  error: Error
  message: string
}

// ============================================================================
// Registry Cache
// ============================================================================

export interface IRegistryCache {
  get(key: string): any | undefined
  set(key: string, value: any): void
  has(key: string): boolean
  delete(key: string): void
  clear(): void
  serialize(): string
  deserialize(data: string): void
}

// ============================================================================
// Dynamic Import Types
// ============================================================================

export interface RegistryModule {
  default?: AnyWrapper
  registry?: AnyWrapper
  component?: ComponentWrapper
  element?: ElementWrapper
  block?: BlockWrapper
  section?: SectionWrapper
  template?: TemplateWrapper
  flow?: FlowWrapper
}

// ============================================================================
// Category Types
// ============================================================================

export interface CategoryConfig {
  id: string
  name: string
  description?: string
  icon?: string
  order?: number
}

export const defaultCategories: Record<string, CategoryConfig> = {
  // Components
  layout: { id: "layout", name: "Layout", order: 1 },
  typography: { id: "typography", name: "Typography", order: 2 },
  forms: { id: "forms", name: "Forms", order: 3 },
  buttons: { id: "buttons", name: "Buttons", order: 4 },
  "data-display": { id: "data-display", name: "Data Display", order: 5 },
  feedback: { id: "feedback", name: "Feedback", order: 6 },
  overlay: { id: "overlay", name: "Overlay", order: 7 },
  navigation: { id: "navigation", name: "Navigation", order: 8 },
  media: { id: "media", name: "Media", order: 9 },
  surfaces: { id: "surfaces", name: "Surfaces", order: 10 },
  other: { id: "other", name: "Other", order: 99 },

  // Higher levels
  marketing: { id: "marketing", name: "Marketing", order: 1 },
  ecommerce: { id: "ecommerce", name: "E-commerce", order: 2 },
  dashboard: { id: "dashboard", name: "Dashboard", order: 3 },
  landing: { id: "landing", name: "Landing Page", order: 4 },
  blog: { id: "blog", name: "Blog", order: 5 },
  portfolio: { id: "portfolio", name: "Portfolio", order: 6 },
}
