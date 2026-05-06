/**
 * Smart Inspector
 * Automatically switches between simple and composite inspector
 * based on component structure
 */

import React from 'react'
import { DynamicInspector } from './DynamicInspector'
import type { InspectorField } from './DynamicInspector'
import { CompositeInspector, useCompositeInspector } from './CompositeInspector'

interface SmartInspectorProps {
  selectedNode: any | null
  /**
   * Force inspector mode
   * @default 'auto' - automatically detect
   */
  mode?: 'auto' | 'simple' | 'composite'
  /**
   * Options for composite mode
   */
  compositeOptions?: {
    showChildrenProperties?: boolean
    maxDepth?: number
  }
  /** Injectable widget fields getter — injected by feature wrappers (e.g., Studio) */
  getWidgetFields?: (comp: string) => InspectorField[] | undefined;
}

/**
 * Smart Inspector - Automatically chooses the best inspector
 *
 * - For simple components: Shows DynamicInspector
 * - For composite/nested components: Shows CompositeInspector with hierarchy
 * - Auto-detection based on children presence
 *
 * @example
 * ```tsx
 * // Auto mode (recommended)
 * <SmartInspector selectedNode={selectedNode} />
 *
 * // Force simple mode
 * <SmartInspector selectedNode={selectedNode} mode="simple" />
 *
 * // Force composite mode with options
 * <SmartInspector
 *   selectedNode={selectedNode}
 *   mode="composite"
 *   compositeOptions={{ maxDepth: 5 }}
 * />
 * ```
 */
export function SmartInspector({
  selectedNode,
  mode = 'auto',
  compositeOptions = {},
  getWidgetFields,
}: SmartInspectorProps) {
  const { isComposite } = useCompositeInspector(selectedNode)

  // Determine which inspector to use
  const shouldUseComposite =
    mode === 'composite' || (mode === 'auto' && isComposite)

  if (shouldUseComposite) {
    return (
      <CompositeInspector
        selectedNode={selectedNode}
        showChildrenProperties={compositeOptions.showChildrenProperties}
        maxDepth={compositeOptions.maxDepth}
      />
    )
  }

  return <DynamicInspector selectedNode={selectedNode} getWidgetFields={getWidgetFields} />
}

/**
 * Example: Custom Editor Integration
 *
 * ```tsx
 * import { SmartInspector } from "@/frontend/shared/builder"
 * import { useSharedCanvas } from "@/frontend/shared/builder"
 *
 * function MyEditor() {
 *   const { selectedNode } = useSharedCanvas()
 *
 *   return (
 *     <div className="flex h-screen">
 *       { Canvas }
 *       <div className="flex-1">
 *         <ReactFlow ... />
 *       </div>
 *
 *       { Inspector Sidebar }
 *       <div className="w-80 border-l">
 *         <SmartInspector selectedNode={selectedNode} />
 *       </div>
 *     </div>
 *   )
 * }
 * ```
 */
