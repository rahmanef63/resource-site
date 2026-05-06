/**
 * Composite Inspector
 *
 * Enhanced inspector that shows properties of nested/composite components
 * When a block contains multiple components, this inspector displays ALL properties
 * in an organized, hierarchical manner
 */

import React, { useEffect, useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, Box, Layers } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useCrossFeatureRegistry } from '@/frontend/shared/foundation'
import { useSharedCanvas } from '../canvas/core'
import { DynamicInspectorControl } from './controls/DynamicInspectorControl'
import { useInspectorControls, setNestedValue, getNestedValue } from './hooks/useInspectorControls'

interface CompositeInspectorProps {
  selectedNode: any | null
  /**
   * Show nested children properties
   * @default true
   */
  showChildrenProperties?: boolean
  /**
   * Maximum depth to traverse
   * @default 3
   */
  maxDepth?: number
}

interface ComponentTreeNode {
  id: string
  nodeId: string
  componentType: string
  label: string
  depth: number
  props: Record<string, any>
  children: ComponentTreeNode[]
  parentPath: string[]
}

/**
 * Composite Inspector - Shows all properties in nested component structures
 *
 * @example
 * ```tsx
 * // In your editor/canvas
 * import { CompositeInspector } from "@/frontend/shared/builder"
 *
 * <CompositeInspector
 *   selectedNode={selectedNode}
 *   showChildrenProperties={true}
 *   maxDepth={3}
 * />
 * ```
 */
export function CompositeInspector({
  selectedNode,
  showChildrenProperties = true,
  maxDepth = 3
}: CompositeInspectorProps) {
  const registry = useCrossFeatureRegistry()
  const canvas = useSharedCanvas()
  const canvasNodes = canvas.nodes
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  // Build component tree from selected node
  const componentTree = useMemo(() => {
    if (!selectedNode) return null

    const buildTree = (
      node: any,
      depth: number = 0,
      parentPath: string[] = []
    ): ComponentTreeNode | null => {
      if (depth >= maxDepth) return null

      const componentType = node.data.comp || node.data.type
      const widget = registry.getWidget(componentType) || registry.getComponent(componentType)

      const treeNode: ComponentTreeNode = {
        id: node.id,
        nodeId: node.id,
        componentType,
        label: widget?.label || componentType,
        depth,
        props: node.data.props || {},
        children: [],
        parentPath,
      }

      // Get children if this is a composite
      const children = node.data.children || []
      if (showChildrenProperties && children.length > 0) {
        const nodes = canvasNodes
        children.forEach((childId: string) => {
          const childNode = nodes.find((n: any) => n.id === childId)
          if (childNode) {
            const childTreeNode = buildTree(childNode, depth + 1, [...parentPath, node.id])
            if (childTreeNode) {
              treeNode.children.push(childTreeNode)
            }
          }
        })
      }

      return treeNode
    }

    return buildTree(selectedNode)
  }, [selectedNode, maxDepth, showChildrenProperties, registry, canvasNodes])

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }

  const flattenedNodes = useMemo(() => {
    if (!componentTree) return [] as ComponentTreeNode[]
    const acc: ComponentTreeNode[] = []
    const walk = (node: ComponentTreeNode) => {
      acc.push(node)
      node.children.forEach(walk)
    }
    walk(componentTree)
    return acc
  }, [componentTree])

  useEffect(() => {
    if (!componentTree) return
    setExpandedNodes((prev) => {
      if (prev.has(componentTree.nodeId)) return prev
      const next = new Set(prev)
      next.add(componentTree.nodeId)
      return next
    })
  }, [componentTree])

  if (!selectedNode) {
    return (
      <div className="p-4 text-sm text-muted-foreground text-center">
        <Box className="w-8 h-8 mx-auto mb-2 text-muted-foreground/60" />
        <p>Select a component to view its properties</p>
      </div>
    )
  }

  if (!componentTree) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Could not load component structure
      </div>
    )
  }

  const hasChildren = componentTree.children.length > 0
  const rootExpanded = expandedNodes.has(componentTree.nodeId)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Component Inspector</h3>
        </div>
        {hasChildren && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-xs">
              Composite
            </Badge>
            <span>{componentTree.children.length} nested component{componentTree.children.length !== 1 && 's'}</span>
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <ComponentPropertiesSection
          node={componentTree}
          isRoot={true}
          expanded={rootExpanded}
          onToggle={() => toggleNode(componentTree.nodeId)}
          canvas={canvas}
        />

        {hasChildren && rootExpanded && (
          <>
            <Separator className="my-4" />
            <div className="px-4 pb-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Nested Components
              </h4>
            </div>
            {flattenedNodes.slice(1).map((child, index) => (
              <ComponentPropertiesSection
                key={child.nodeId}
                node={child}
                isRoot={false}
                expanded={expandedNodes.has(child.nodeId)}
                onToggle={() => toggleNode(child.nodeId)}
                canvas={canvas}
                index={index + 1}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

interface ComponentPropertiesSectionProps {
  node: ComponentTreeNode
  isRoot: boolean
  expanded: boolean
  onToggle: () => void
  canvas: any
  index?: number
}

function ComponentPropertiesSection({
  node,
  isRoot,
  expanded,
  onToggle,
  canvas,
  index
}: ComponentPropertiesSectionProps) {
  const controls = useInspectorControls(node.componentType)

  const setProp = (path: string, value: any) => {
    const latestNode = canvas.nodes?.find((n: any) => n.id === node.nodeId)
    const latestProps = latestNode?.data?.props ?? {}
    const newProps = { ...latestProps }
    setNestedValue(newProps, path, value)
    canvas.setNodeProps(node.nodeId, newProps)
  }

  const depthIndent = node.depth * 12

  return (
    <div className="border-b last:border-b-0">
      {/* Component Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted transition-colors"
        style={{ paddingLeft: `${16 + depthIndent}px` }}
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          <div className="flex items-center gap-2">
            {!isRoot && index && (
              <Badge variant="outline" className="text-xs">
                {index}
              </Badge>
            )}
            <span className="text-sm font-medium">{node.label}</span>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          {controls.length} props
        </Badge>
      </button>

      {/* Properties */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3" style={{ paddingLeft: `${28 + depthIndent}px` }}>
          {controls.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No configurable properties
            </p>
          ) : (
            controls.map((control) => {
              const currentValue = getNestedValue(node.props, control.path)
              return (
                <div key={control.path} className="space-y-1.5">
                  <DynamicInspectorControl
                    control={control}
                    value={currentValue !== undefined ? currentValue : control.default}
                    onChange={(value) => setProp(control.path, value)}
                  />
                </div>
              )
            })
          )}

          {/* Nested children indicator */}
          {node.children.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Contains {node.children.length} nested component{node.children.length !== 1 && 's'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Hook to use CompositeInspector with auto-detection
 * Automatically switches between simple and composite inspector based on structure
 */
export function useCompositeInspector(selectedNode: any | null) {
  const hasChildren = useMemo(() => {
    if (!selectedNode) return false
    const children = selectedNode.data.children || []
    return children.length > 0
  }, [selectedNode])

  return {
    isComposite: hasChildren,
    childCount: selectedNode?.data.children?.length || 0,
    Inspector: hasChildren ? CompositeInspector : null
  }
}
