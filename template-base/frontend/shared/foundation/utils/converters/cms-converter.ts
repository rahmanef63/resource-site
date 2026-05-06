/**
 * CMS Schema Converter
 * Convert between CMS v0.4 schema and new shared system
 */

import type {
  AnyNode,
  ExportSchemaV1Type,
  ConversionOptions,
  ConversionResult,
  CMSLegacySchemaV04Type,
} from "../../types"
import { createConversionContext } from "../../types"
import { SCHEMA_VERSION, SCHEMA_FORMAT } from "../../types"

// ============================================================================
// CMS v0.4 → Shared System v1.0
// ============================================================================

export function convertCMSSchemaToV1(
  cmsSchema: CMSLegacySchemaV04Type,
  options: ConversionOptions = {}
): ConversionResult<ExportSchemaV1Type> {
  const context = createConversionContext("cms-v0.4", "v1.0", options)

  try {
    // Convert nodes
    const nodes: Record<string, any> = {}

    for (const [id, node] of Object.entries(cmsSchema.nodes)) {
      nodes[id] = {
        type: "component",
        component: node.type,
        props: node.props,
        children: node.children,
      }
    }

    // Build new schema
    const newSchema: ExportSchemaV1Type = {
      version: SCHEMA_VERSION,
      format: SCHEMA_FORMAT,
      type: "mixed",
      metadata: {
        id: `migrated-cms-${Date.now()}`,
        name: "Migrated from CMS v0.4",
        description: `Original version: ${cmsSchema.version}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      nodes,
      root: cmsSchema.root,
      layout: {},
    }

    return {
      success: true,
      data: newSchema,
      errors: context.errors,
      warnings: context.warnings,
      metadata: {
        sourceFormat: "cms-v0.4",
        targetFormat: "v1.0",
        nodeCount: Object.keys(nodes).length,
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
// Shared System v1.0 → CMS v0.4
// ============================================================================

export function convertV1ToCMSSchema(
  schema: ExportSchemaV1Type,
  options: ConversionOptions = {}
): ConversionResult<CMSLegacySchemaV04Type> {
  const context = createConversionContext("v1.0", "cms-v0.4", options)

  try {
    // Convert nodes back to CMS format
    const nodes: Record<string, any> = {}

    for (const [id, node] of Object.entries(schema.nodes)) {
      // Only convert component nodes
      if (node.type === "component") {
        nodes[id] = {
          type: node.component,
          props: node.props,
          children: node.children || [],
        }
      } else {
        context.addWarning({
          message: `Skipping non-component node: ${node.type}`,
          nodeId: id,
        })
      }
    }

    const cmsSchema: CMSLegacySchemaV04Type = {
      version: "0.4",
      root: schema.root,
      nodes,
    }

    return {
      success: true,
      data: cmsSchema,
      errors: context.errors,
      warnings: context.warnings,
      metadata: {
        sourceFormat: "v1.0",
        targetFormat: "cms-v0.4",
        nodeCount: Object.keys(nodes).length,
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
// CMS Widget Mapping
// ============================================================================

export const CMS_WIDGET_MAPPING: Record<string, string> = {
  // Old widget name → New component ID
  text: "text",
  button: "button",
  container: "container",
  image: "image",
  card: "card",
  section: "container",
  row: "container",
  column: "container",
  // Add more mappings as needed
}

// ============================================================================
// Apply Widget Mapping
// ============================================================================

export function applyCMSWidgetMapping(
  cmsSchema: CMSLegacySchemaV04Type
): CMSLegacySchemaV04Type {
  const mappedNodes: Record<string, any> = {}

  for (const [id, node] of Object.entries(cmsSchema.nodes)) {
    const newType = CMS_WIDGET_MAPPING[node.type] || node.type

    mappedNodes[id] = {
      ...node,
      type: newType,
    }
  }

  return {
    ...cmsSchema,
    nodes: mappedNodes,
  }
}
