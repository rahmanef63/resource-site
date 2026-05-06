/**
 * JSON Exporter
 * Export nodes to JSON format
 */

import type {
  AnyNode,
  ExportSchemaV1Type,
  ConversionOptions,
  ConversionResult,
  GroupNode,
  ComponentDefinition,
} from "../../../../types"
import { SCHEMA_VERSION, SCHEMA_FORMAT, validateExportSchema } from "../../../../types"
import { createConversionContext } from "../../../../types"

// ============================================================================
// Export to JSON
// ============================================================================

export function exportToJSON(
  nodes: AnyNode[],
  options: ConversionOptions = {}
): ConversionResult<ExportSchemaV1Type> {
  const context = createConversionContext("nodes", "json", options)

  try {
    // Build flat node map
    const nodeMap: Record<string, any> = {}
    const rootIds: string[] = []
    const groups: Record<string, GroupNode> = {}
    const components: Record<string, ComponentDefinition> = {}

    for (const node of nodes) {
      // Convert node to JSON
      const json = nodeToJSON(node, context)

      nodeMap[node.id] = json

      // Collect special node types
      if (node.type === "group") {
        groups[node.id] = node as GroupNode
      } else if (node.type === "component-definition") {
        components[node.id] = node as ComponentDefinition
      }

      // Assume top-level nodes (can be refined with parent tracking)
      if (!hasParent(node, nodes)) {
        rootIds.push(node.id)
      }
    }

    // Build export schema
    const schema: ExportSchemaV1Type = {
      version: SCHEMA_VERSION,
      format: SCHEMA_FORMAT,
      type: determineSchemaType(nodes),
      metadata: {
        id: `export-${Date.now()}`,
        name: "Exported Schema",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      nodes: nodeMap,
      root: rootIds,
      groups: Object.keys(groups).length > 0 ? groups : undefined,
      components: Object.keys(components).length > 0 ? components : undefined,
      layout: {},
    }

    // Validate if requested
    if (options.validate !== false) {
      validateExportSchema(schema)
    }

    return {
      success: true,
      data: schema,
      errors: context.errors,
      warnings: context.warnings,
      metadata: {
        sourceFormat: "nodes",
        targetFormat: "json",
        nodeCount: nodes.length,
        timestamp: Date.now(),
      },
    }
  } catch (error) {
    context.addError({
      message: error instanceof Error ? error.message : String(error),
      details: error,
    })

    return {
      success: false,
      errors: context.errors,
      warnings: context.warnings,
    }
  }
}

// ============================================================================
// Node to JSON
// ============================================================================

function nodeToJSON(node: AnyNode, context: any): any {
  switch (node.type) {
    case "component":
      return {
        type: "component",
        component: (node as any).component,
        props: (node as any).props,
        children: (node as any).children,
      }

    case "element":
      return {
        type: "element",
        element: (node as any).element,
        props: (node as any).props,
        children: (node as any).structure?.children || [],
      }

    case "block":
      return {
        type: "block",
        block: (node as any).block,
        props: (node as any).props,
        children: (node as any).structure?.children || [],
      }

    case "section":
      return {
        type: "section",
        section: (node as any).section,
        props: (node as any).props,
        children: (node as any).structure?.children || [],
      }

    case "template":
      return {
        type: "template",
        template: (node as any).template,
        props: (node as any).props,
        children: (node as any).structure?.children || [],
      }

    case "flow":
      return {
        type: "flow",
        flow: (node as any).flow,
        props: (node as any).props,
        children: (node as any).structure?.children || [],
        routes: (node as any).structure?.routes || [],
      }

    case "group":
      return {
        type: "group",
        id: node.id,
        name: node.name,
        children: (node as GroupNode).children,
        locked: (node as GroupNode).locked,
        collapsed: (node as GroupNode).collapsed,
        layout: (node as any).layout || {},
        metadata: (node as any).metadata || {},
      }

    case "component-definition":
      return {
        type: "component-definition",
        id: node.id,
        name: node.name,
        children: (node as ComponentDefinition).children,
        props: (node as ComponentDefinition).props,
        metadata: (node as any).metadata || {},
      }

    case "component-instance":
      return {
        type: "component-instance",
        id: node.id,
        name: node.name,
        definitionId: (node as any).definitionId,
        overrides: (node as any).overrides,
        metadata: (node as any).metadata || {},
      }

    default:
      context.addWarning({
        message: `Unknown node type: ${(node as any).type}`,
        nodeId: (node as any).id,
      })
      return node as any
  }
}

// ============================================================================
// Helpers
// ============================================================================

function hasParent(node: AnyNode, allNodes: AnyNode[]): boolean {
  // Check if any node has this node as a child
  for (const otherNode of allNodes) {
    if (otherNode.id === node.id) continue

    if ((otherNode as any).children?.includes(node.id)) {
      return true
    }
  }
  return false
}

function determineSchemaType(nodes: AnyNode[]): "component" | "element" | "block" | "section" | "template" | "flow" | "mixed" {
  const types = new Set(nodes.map((n) => n.type))

  if (types.size === 1) {
    return Array.from(types)[0] as any
  }

  return "mixed"
}

// ============================================================================
// Export to JSON String
// ============================================================================

export function exportToJSONString(
  nodes: AnyNode[],
  options: ConversionOptions = {}
): ConversionResult<string> {
  const result = exportToJSON(nodes, options)

  if (!result.success || !result.data) {
    return {
      success: false,
      errors: result.errors,
      warnings: result.warnings,
    }
  }

  try {
    const jsonString = JSON.stringify(
      result.data,
      null,
      options.pretty !== false ? (options.indent || 2) : 0
    )

    return {
      success: true,
      data: jsonString,
      errors: result.errors,
      warnings: result.warnings,
      metadata: result.metadata,
    }
  } catch (error) {
    return {
      success: false,
      errors: [
        ...result.errors,
        {
          type: "conversion",
          message: `Failed to stringify JSON: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      warnings: result.warnings,
    }
  }
}
