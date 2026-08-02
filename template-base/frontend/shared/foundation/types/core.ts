/**
 * Core Types for Shared Component System
 * Supports 6-level hierarchy: Components → Elements → Blocks → Sections → Templates → Flows
 */

import { ReactNode, ComponentType } from "react"

// ============================================================================
// Base Node Types
// ============================================================================

export type NodeLevel = "component" | "element" | "block" | "section" | "template" | "flow"
export type NodeType = NodeLevel | "group" | "component-instance" | "component-definition"

/**
 * Base interface for all node types
 */
export interface BaseNode {
  id: string
  type: NodeType
  name: string
  metadata?: NodeMetadata
}

export interface NodeMetadata {
  description?: string
  author?: string
  version?: string
  createdAt?: number
  updatedAt?: number
  tags?: string[]
  category?: string
  deprecated?: boolean
  previewImage?: string
}

// ============================================================================
// Level 1: Components (Atomic UI elements from shadcn/ui)
// ============================================================================

export interface ComponentNode extends BaseNode {
  type: "component"
  component: string // e.g., "Button", "Input", "Card"
  props: Record<string, any>
  children?: ReactNode | string
}

/**
 * Component wrapper definition for registry
 */
export interface ComponentWrapper<TProps = any> {
  id: string
  type: "component"
  name: string
  displayName?: string
  description?: string
  category: ComponentCategory

  // React component reference
  component: ComponentType<TProps>

  // Default props
  defaults: Partial<TProps>

  // Prop definitions for inspector
  props: PropDefinitions

  // Icon for library
  icon?: string | ComponentType

  // Preview image
  previewImage?: string

  // Tags for search
  tags?: string[]

  // Conversion methods
  fromJSON: (json: any) => TProps
  toJSON: (props: TProps) => ComponentJSON
  toTypeScript: (props: TProps, children?: string) => string

  // Validation
  validate: (props: any) => TProps

  // Metadata
  metadata?: NodeMetadata
}

export interface ComponentJSON {
  type: "component"
  component: string
  props: Record<string, any>
  children?: any
}

export type ComponentCategory =
  | "layout"      // Container, Flex, Grid, etc.
  | "typography"  // Text, Heading, Paragraph
  | "forms"       // Input, Select, Checkbox, etc.
  | "buttons"     // Button, IconButton, etc.
  | "data-display" // Table, Card, Badge, etc.
  | "feedback"    // Alert, Toast, Progress, etc.
  | "overlay"     // Modal, Popover, Tooltip, etc.
  | "navigation"  // Tabs, Menu, Breadcrumb, etc.
  | "media"       // Image, Video, Icon, etc.
  | "surfaces"    // Card, Paper, Accordion, etc.
  | "other"

// ============================================================================
// Prop Definitions for Inspector
// ============================================================================

export type PropType =
  | "text"
  | "number"
  | "boolean"
  | "select"
  | "multi-select"
  | "color"
  | "image"
  | "icon"
  | "json"
  | "code"
  | "richtext"
  | "date"
  | "slider"
  | "custom"

export interface PropDefinition<T = any> {
  type: PropType
  label?: string
  description?: string
  default?: T
  required?: boolean

  // For select/multi-select
  options?: Array<{ label: string; value: any }>

  // For number/slider
  min?: number
  max?: number
  step?: number

  // For text
  placeholder?: string
  multiline?: boolean
  maxLength?: number

  // For custom types
  component?: ComponentType<any>

  // Validation
  validate?: (value: any) => boolean | string

  // Conditional rendering
  visible?: (props: Record<string, any>) => boolean
  disabled?: (props: Record<string, any>) => boolean
}

export type PropDefinitions = Record<string, PropDefinition>

// ============================================================================
// Level 2: Elements (Composite of components)
// ============================================================================

export interface ElementNode extends BaseNode {
  type: "element"
  element: string // e.g., "FormField", "CardHeader"
  props: Record<string, any>
  components: string[] // Component IDs that make up this element
  structure: ElementStructure
}

export interface ElementStructure {
  type: "element"
  element: string
  children: Array<ComponentJSON | ElementJSON>
  layout?: LayoutConfig
}

export interface ElementJSON {
  type: "element"
  element: string
  props: Record<string, any>
  children: Array<ComponentJSON | ElementJSON>
}

export interface ElementWrapper<TProps = any> {
  id: string
  type: "element"
  name: string
  displayName?: string
  description?: string
  category: string

  // Composition
  structure: ElementStructure

  // Default props
  defaults: Partial<TProps>

  // Prop definitions
  props: PropDefinitions

  // Icon & preview
  icon?: string | ComponentType
  previewImage?: string
  tags?: string[]

  // Conversion methods
  fromJSON: (json: any) => ElementNode
  toJSON: (data: ElementNode) => ElementJSON
  toTypeScript: (data: ElementNode) => string

  // Explode into components
  explode: (data: ElementNode) => ComponentNode[]

  // Validation
  validate: (props: any) => TProps

  // Metadata
  metadata?: NodeMetadata
}

// ============================================================================
// Level 3: Blocks (Complex composites)
// ============================================================================

export interface BlockNode extends BaseNode {
  type: "block"
  block: string // e.g., "LoginForm", "HeroSection"
  props: Record<string, any>
  elements: string[] // Element IDs
  components: string[] // Direct component IDs
  structure: BlockStructure
}

export interface BlockStructure {
  type: "block"
  block: string
  children: Array<ComponentJSON | ElementJSON | BlockJSON>
  layout?: LayoutConfig
}

export interface BlockJSON {
  type: "block"
  block: string
  props: Record<string, any>
  children: Array<ComponentJSON | ElementJSON>
}

export interface BlockWrapper<TProps = any> {
  id: string
  type: "block"
  name: string
  displayName?: string
  description?: string
  category: string

  structure: BlockStructure
  defaults: Partial<TProps>
  props: PropDefinitions

  icon?: string | ComponentType
  previewImage?: string
  tags?: string[]

  fromJSON: (json: any) => BlockNode
  toJSON: (data: BlockNode) => BlockJSON
  toTypeScript: (data: BlockNode) => string

  explode: (data: BlockNode) => Array<ComponentNode | ElementNode>

  validate: (props: any) => TProps
  metadata?: NodeMetadata
}

// ============================================================================
// Level 4: Sections (Multiple blocks)
// ============================================================================

export interface SectionNode extends BaseNode {
  type: "section"
  section: string
  props: Record<string, any>
  blocks: string[]
  structure: SectionStructure
}

export interface SectionStructure {
  type: "section"
  section: string
  children: Array<ComponentJSON | ElementJSON | BlockJSON | SectionJSON>
  layout?: LayoutConfig
}

export interface SectionJSON {
  type: "section"
  section: string
  props: Record<string, any>
  children: Array<ComponentJSON | ElementJSON | BlockJSON>
}

export interface SectionWrapper<TProps = any> {
  id: string
  type: "section"
  name: string
  displayName?: string
  description?: string
  category: string

  structure: SectionStructure
  defaults: Partial<TProps>
  props: PropDefinitions

  icon?: string | ComponentType
  previewImage?: string
  tags?: string[]

  fromJSON: (json: any) => SectionNode
  toJSON: (data: SectionNode) => SectionJSON
  toTypeScript: (data: SectionNode) => string

  explode: (data: SectionNode) => Array<ComponentNode | ElementNode | BlockNode>

  validate: (props: any) => TProps
  metadata?: NodeMetadata
}

// ============================================================================
// Level 5: Templates (Full page layouts)
// ============================================================================

export interface TemplateNode extends BaseNode {
  type: "template"
  template: string
  props: Record<string, any>
  sections: string[]
  structure: TemplateStructure
}

export interface TemplateStructure {
  type: "template"
  template: string
  children: Array<ComponentJSON | ElementJSON | BlockJSON | SectionJSON | TemplateJSON>
  layout?: LayoutConfig
  routes?: RouteConfig[]
}

export interface TemplateJSON {
  type: "template"
  template: string
  props: Record<string, any>
  children: Array<ComponentJSON | ElementJSON | BlockJSON | SectionJSON>
}

export interface TemplateWrapper<TProps = any> {
  id: string
  type: "template"
  name: string
  displayName?: string
  description?: string
  category: string

  structure: TemplateStructure
  defaults: Partial<TProps>
  props: PropDefinitions

  icon?: string | ComponentType
  previewImage?: string
  tags?: string[]

  fromJSON: (json: any) => TemplateNode
  toJSON: (data: TemplateNode) => TemplateJSON
  toTypeScript: (data: TemplateNode) => string

  explode: (data: TemplateNode) => Array<ComponentNode | ElementNode | BlockNode | SectionNode>

  validate: (props: any) => TProps
  metadata?: NodeMetadata
}

// ============================================================================
// Level 6: Flows (Multi-page experiences)
// ============================================================================

export interface FlowNode extends BaseNode {
  type: "flow"
  flow: string
  props: Record<string, any>
  templates: string[]
  structure: FlowStructure
}

export interface FlowStructure {
  type: "flow"
  flow: string
  children: Array<TemplateJSON | FlowJSON>
  routes: RouteConfig[]
  navigation?: NavigationConfig
}

export interface FlowJSON {
  type: "flow"
  flow: string
  props: Record<string, any>
  children: Array<TemplateJSON>
  routes: RouteConfig[]
}

export interface FlowWrapper<TProps = any> {
  id: string
  type: "flow"
  name: string
  displayName?: string
  description?: string
  category: string

  structure: FlowStructure
  defaults: Partial<TProps>
  props: PropDefinitions

  icon?: string | ComponentType
  previewImage?: string
  tags?: string[]

  fromJSON: (json: any) => FlowNode
  toJSON: (data: FlowNode) => FlowJSON
  toTypeScript: (data: FlowNode) => string

  explode: (data: FlowNode) => Array<TemplateNode>

  validate: (props: any) => TProps
  metadata?: NodeMetadata
}

// ============================================================================
// Layout & Routing
// ============================================================================

export interface LayoutConfig {
  display?: "flex" | "grid" | "block" | "inline-block"
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse"
  justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly"
  alignItems?: "start" | "center" | "end" | "stretch" | "baseline"
  gap?: string | number
  padding?: string | number
  margin?: string | number
  width?: string | number
  height?: string | number
  gridTemplateColumns?: string
  gridTemplateRows?: string
}

export interface RouteConfig {
  path: string
  templateId?: string
  title?: string
  description?: string
  meta?: Record<string, any>
}

export interface NavigationConfig {
  type: "linear" | "branching" | "free"
  transitions?: Record<string, string> // from -> to
}

// ============================================================================
// Group & Component Instance System
// ============================================================================

export interface GroupNode extends BaseNode {
  type: "group"
  children: string[] // Child node IDs
  locked?: boolean
  collapsed?: boolean
  layout?: LayoutConfig
}

export interface ComponentDefinition extends BaseNode {
  type: "component-definition"
  children: string[] // Original node IDs
  props: PropDefinitions // Props that can be overridden
}

export interface ComponentInstance extends BaseNode {
  type: "component-instance"
  definitionId: string // Points to ComponentDefinition
  overrides?: Record<string, any> // Local prop overrides
}

// ============================================================================
// Union Types
// ============================================================================

export type AnyNode =
  | ComponentNode
  | ElementNode
  | BlockNode
  | SectionNode
  | TemplateNode
  | FlowNode
  | GroupNode
  | ComponentDefinition
  | ComponentInstance

export type AnyWrapper =
  | ComponentWrapper
  | ElementWrapper
  | BlockWrapper
  | SectionWrapper
  | TemplateWrapper
  | FlowWrapper

export type AnyJSON =
  | ComponentJSON
  | ElementJSON
  | BlockJSON
  | SectionJSON
  | TemplateJSON
  | FlowJSON

// ============================================================================
// Registry Types
// ============================================================================

export interface RegistryEntry {
  id: string
  type: NodeLevel
  wrapper: AnyWrapper
  metadata: NodeMetadata
}

export interface Registry {
  components: Map<string, ComponentWrapper>
  elements: Map<string, ElementWrapper>
  blocks: Map<string, BlockWrapper>
  sections: Map<string, SectionWrapper>
  templates: Map<string, TemplateWrapper>
  flows: Map<string, FlowWrapper>
}

// ============================================================================
// Helpers
// ============================================================================

export function isComponentNode(node: AnyNode): node is ComponentNode {
  return node.type === "component"
}

export function isElementNode(node: AnyNode): node is ElementNode {
  return node.type === "element"
}

export function isBlockNode(node: AnyNode): node is BlockNode {
  return node.type === "block"
}

export function isSectionNode(node: AnyNode): node is SectionNode {
  return node.type === "section"
}

export function isTemplateNode(node: AnyNode): node is TemplateNode {
  return node.type === "template"
}

export function isFlowNode(node: AnyNode): node is FlowNode {
  return node.type === "flow"
}

export function isGroupNode(node: AnyNode): node is GroupNode {
  return node.type === "group"
}

export function isComponentInstance(node: AnyNode): node is ComponentInstance {
  return node.type === "component-instance"
}

export function isComponentDefinition(node: AnyNode): node is ComponentDefinition {
  return node.type === "component-definition"
}
