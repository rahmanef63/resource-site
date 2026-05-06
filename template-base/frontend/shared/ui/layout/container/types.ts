/**
 * Layout Container Type Definitions
 * 
 * Provides the type system for declarative, JSON-configurable layouts.
 * Supports single panels, split layouts, recursive nesting, and responsive breakpoints.
 */

import type { ReactNode } from "react"

// ============================================================================
// Layout Type
// ============================================================================

/**
 * Available layout types
 * 
 * - `single`: A single panel that renders content
 * - `split_vertical`: Splits into columns (left to right)
 * - `split_horizontal`: Splits into rows (top to bottom)
 */
export type LayoutType = 
  | "single"
  | "split_vertical" 
  | "split_horizontal"

/**
 * Split mode for distributing child sizes
 * 
 * - `equal`: All children get equal space (flex: 1 each)
 * - `custom`: Read `size` from each child node
 */
export type SplitMode = "equal" | "custom"

/**
 * Responsive breakpoint names
 */
export type Breakpoint = "mobile" | "tablet" | "desktop"

// ============================================================================
// Layout Node
// ============================================================================

/**
 * Recursive layout node structure
 * 
 * This is the core building block of the layout system.
 * Layouts are defined as a tree of nodes, where each node
 * is either a single panel or a container that splits into children.
 * 
 * @example
 * // Single panel
 * const single: LayoutNode = { type: "single", id: "main" }
 * 
 * @example
 * // Two-column split
 * const split: LayoutNode = {
 *   type: "split_vertical",
 *   mode: "equal",
 *   children: [
 *     { type: "single", id: "left" },
 *     { type: "single", id: "right" }
 *   ]
 * }
 * 
 * @example
 * // Responsive layout
 * const responsive: LayoutNode = {
 *   type: "split_vertical",
 *   children: [...],
 *   responsive: {
 *     mobile: { type: "single", id: "main" },
 *     tablet: { type: "split_vertical", children: [...] }
 *   }
 * }
 */
export interface LayoutNode {
  /**
   * The type of layout for this node
   */
  type: LayoutType
  
  /**
   * Split mode (only relevant for split types)
   * @default "equal"
   */
  mode?: SplitMode
  
  /**
   * Child nodes (only relevant for split types)
   */
  children?: LayoutNode[]
  
  /**
   * Size specification for this node when parent uses `mode: "custom"`
   * 
   * Can be:
   * - A number representing flex ratio (e.g., 1, 2, 3)
   * - A string like "1fr", "2fr", "300px", "auto", "30%"
   */
  size?: string | number
  
  /**
   * Unique identifier for this panel
   * Used to map content to panels via `renderPanel` callback
   */
  id?: string
  
  /**
   * Minimum size constraint (e.g., "200px", "20%")
   */
  minSize?: string | number
  
  /**
   * Maximum size constraint (e.g., "500px", "80%")
   */
  maxSize?: string | number
  
  /**
   * Gap between children (Tailwind spacing or CSS value)
   * Only relevant for split types
   * @default 0
   */
  gap?: number | string
  
  /**
   * Enable drag-to-resize for this split container
   * Only relevant for split types
   * @default false
   */
  resizable?: boolean
  
  /**
   * Responsive overrides for different breakpoints
   * If provided, the layout will switch based on screen size
   */
  responsive?: Partial<Record<Breakpoint, LayoutNode>>
  
  /**
   * Additional metadata for extensibility
   * Can store feature-specific configuration
   */
  meta?: Record<string, unknown>
}

// ============================================================================
// Render Props
// ============================================================================

/**
 * Context passed to the renderPanel callback
 */
export interface PanelRenderContext {
  /**
   * The panel's unique identifier
   */
  id: string | undefined
  
  /**
   * The layout node for this panel
   */
  node: LayoutNode
  
  /**
   * Depth level in the layout tree (0 = root)
   */
  depth: number
  
  /**
   * Path of parent IDs from root to this node
   */
  path: string[]
}

/**
 * Function type for rendering panel content
 */
export type PanelRenderer = (context: PanelRenderContext) => ReactNode

// ============================================================================
// Container Props
// ============================================================================

/**
 * Props for the LayoutContainer component
 */
export interface LayoutContainerProps {
  /**
   * The layout configuration tree
   */
  layout: LayoutNode
  
  /**
   * Callback to render content for each panel
   * Called for every `type: "single"` node
   */
  renderPanel: PanelRenderer
  
  /**
   * Additional class name for the root container
   */
  className?: string
  
  /**
   * Default gap between split children (Tailwind spacing)
   * Can be overridden per-node via `node.gap`
   * @default 0
   */
  defaultGap?: number | string
  
  /**
   * Whether to show panel borders (for debugging)
   * @default false
   */
  debug?: boolean
  
  /**
   * Panel content can also be passed as slots object
   * Maps panel ID to React content
   */
  slots?: Record<string, ReactNode>
}

// ============================================================================
// Internal Props
// ============================================================================

/**
 * Internal props for rendering a layout node
 */
export interface LayoutNodeRendererProps {
  node: LayoutNode
  renderPanel: PanelRenderer
  slots?: Record<string, ReactNode>
  depth: number
  path: string[]
  debug?: boolean
  defaultGap?: number | string
}

/**
 * Props for the resizable handle
 */
export interface ResizeHandleProps {
  direction: "vertical" | "horizontal"
  onResize: (delta: number) => void
  className?: string
}

// ============================================================================
// Resize State
// ============================================================================

/**
 * State for tracking panel sizes during resize
 */
export interface ResizeState {
  sizes: number[]
  isResizing: boolean
  activeHandle: number | null
}
