/**
 * JSON Importer
 * Import nodes from JSON format
 */

import type {
  AnyNode,
  ExportSchemaV1Type,
  ConversionOptions,
  ConversionResult,
} from "../../../../types"
import { validateImportSchema, migrateSchema } from "../../../../types"
import { createConversionContext } from "../../../../types"

// ============================================================================
// Import from JSON
// ============================================================================

export function importFromJSON(
  schema: ExportSchemaV1Type | any,
  options: ConversionOptions = {}
): ConversionResult<AnyNode[]> {
  const context = createConversionContext("json", "nodes", options)

  try {
    // Migrate schema if needed
    let migratedSchema: ExportSchemaV1Type

    if (schema.version !== "1.0.0") {
      context.addWarning({
        message: `Schema version ${schema.version} will be migrated to 1.0.0`,
      })
      migratedSchema = migrateSchema(schema)
    } else {
      migratedSchema = schema
    }

    // Validate if requested
    if (options.validate !== false) {
      validateImportSchema(migratedSchema)
    }

    // Convert nodes
    const nodes: AnyNode[] = []

    for (const [id, nodeData] of Object.entries(migratedSchema.nodes)) {
      try {
        const node = jsonToNode(id, nodeData, context)
        if (node) {
          nodes.push(node)
        }
      } catch (error) {
        if (options.skipInvalid) {
          context.addError({
            type: "conversion",
            message: `Failed to import node ${id}: ${error instanceof Error ? error.message : String(error)}`,
            nodeId: id,
          })
        } else {
          throw error
        }
      }
    }

    return {
      success: context.errors.length === 0,
      data: nodes,
      errors: context.errors,
      warnings: context.warnings,
      metadata: {
        sourceFormat: "json",
        targetFormat: "nodes",
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
// JSON to Node
// ============================================================================

function jsonToNode(id: string, data: any, context: any): AnyNode | null {
  if (!data || !data.type) {
    context.addError({
      message: `Invalid node data for ${id}`,
      nodeId: id,
    })
    return null
  }

  const baseNode = {
    id,
    name: data.name || id,
    metadata: data.metadata,
  }

  switch (data.type) {
    case "component":
      return {
        ...baseNode,
        type: "component",
        component: data.component,
        props: data.props || {},
        children: data.children,
      } as any

    case "element":
      return {
        ...baseNode,
        type: "element",
        element: data.element,
        props: data.props || {},
        components: data.components || [],
        structure: {
          type: "element",
          element: data.element,
          children: data.children || [],
        },
      } as any

    case "block":
      return {
        ...baseNode,
        type: "block",
        block: data.block,
        props: data.props || {},
        elements: data.elements || [],
        components: data.components || [],
        structure: {
          type: "block",
          block: data.block,
          children: data.children || [],
        },
      } as any

    case "section":
      return {
        ...baseNode,
        type: "section",
        section: data.section,
        props: data.props || {},
        blocks: data.blocks || [],
        structure: {
          type: "section",
          section: data.section,
          children: data.children || [],
        },
      } as any

    case "template":
      return {
        ...baseNode,
        type: "template",
        template: data.template,
        props: data.props || {},
        sections: data.sections || [],
        structure: {
          type: "template",
          template: data.template,
          children: data.children || [],
        },
      } as any

    case "flow":
      return {
        ...baseNode,
        type: "flow",
        flow: data.flow,
        props: data.props || {},
        templates: data.templates || [],
        structure: {
          type: "flow",
          flow: data.flow,
          children: data.children || [],
          routes: data.routes || [],
        },
      } as any

    case "group":
      return {
        ...baseNode,
        type: "group",
        children: data.children || [],
        locked: data.locked || false,
        collapsed: data.collapsed || false,
      } as any

    case "component-definition":
      return {
        ...baseNode,
        type: "component-definition",
        children: data.children || [],
        props: data.props || {},
      } as any

    case "component-instance":
      return {
        ...baseNode,
        type: "component-instance",
        definitionId: data.definitionId,
        overrides: data.overrides || {},
      } as any

    default:
      context.addWarning({
        message: `Unknown node type: ${data.type}`,
        nodeId: id,
      })
      return null
  }
}

// ============================================================================
// Import from JSON String
// ============================================================================

export function importFromJSONString(
  jsonString: string,
  options: ConversionOptions = {}
): ConversionResult<AnyNode[]> {
  try {
    const schema = JSON.parse(jsonString)
    return importFromJSON(schema, options)
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          type: "parsing",
          message: `Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      warnings: [],
    }
  }
}
