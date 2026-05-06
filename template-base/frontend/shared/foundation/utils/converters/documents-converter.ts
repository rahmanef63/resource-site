/**
 * Documents Converter
 * Convert between Documents blocks and shared system
 */

import type {
  AnyNode,
  ExportSchemaV1Type,
  ConversionOptions,
  ConversionResult,
} from "../../types"
import { createConversionContext } from "../../types"
import { SCHEMA_VERSION, SCHEMA_FORMAT } from "../../types"

// ============================================================================
// Documents Blocks → Shared System
// ============================================================================

export interface DocumentsBlock {
  type: string
  content?: any
  attrs?: Record<string, any>
  children?: DocumentsBlock[]
}

export function convertDocumentsToShared(
  blocks: DocumentsBlock[],
  options: ConversionOptions = {}
): ConversionResult<ExportSchemaV1Type> {
  const context = createConversionContext("documents", "v1.0", options)

  try {
    const nodes: Record<string, any> = {}
    const rootIds: string[] = []

    for (const block of blocks) {
      const { id, node } = blockToNode(block, context)
      nodes[id] = node
      rootIds.push(id)
    }

    const schema: ExportSchemaV1Type = {
      version: SCHEMA_VERSION,
      format: SCHEMA_FORMAT,
      type: "mixed",
      metadata: {
        id: `documents-${Date.now()}`,
        name: "Imported from Documents",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      nodes,
      root: rootIds,
      layout: {},
    }

    return {
      success: true,
      data: schema,
      errors: context.errors,
      warnings: context.warnings,
      metadata: {
        sourceFormat: "documents",
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
// Shared System → Documents Blocks
// ============================================================================

export function convertSharedToDocuments(
  schema: ExportSchemaV1Type,
  options: ConversionOptions = {}
): ConversionResult<DocumentsBlock[]> {
  const context = createConversionContext("v1.0", "documents", options)

  try {
    const blocks: DocumentsBlock[] = []

    for (const id of schema.root) {
      const node = schema.nodes[id]
      if (node) {
        const block = nodeToBlock(node, context)
        if (block) {
          blocks.push(block)
        }
      }
    }

    return {
      success: true,
      data: blocks,
      errors: context.errors,
      warnings: context.warnings,
      metadata: {
        sourceFormat: "v1.0",
        targetFormat: "documents",
        nodeCount: blocks.length,
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
// Block to Node
// ============================================================================

function blockToNode(
  block: DocumentsBlock,
  context: any
): { id: string; node: any } {
  const id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Map block types to component types
  const componentMap: Record<string, string> = {
    paragraph: "text",
    heading: "text",
    image: "image",
    button: "button",
    card: "card",
  }

  const componentType = componentMap[block.type] || "text"

  const node = {
    type: "component",
    component: componentType,
    props: {
      ...block.attrs,
      content: block.content,
    },
    children: block.children?.map((child) => blockToNode(child, context).id) || [],
  }

  return { id, node }
}

// ============================================================================
// Node to Block
// ============================================================================

function nodeToBlock(node: any, context: any): DocumentsBlock | null {
  if (node.type !== "component") {
    context.addWarning({
      message: `Cannot convert node type ${node.type} to Document block`,
    })
    return null
  }

  // Map component types to block types
  const blockMap: Record<string, string> = {
    text: "paragraph",
    image: "image",
    button: "button",
    card: "card",
  }

  const blockType = blockMap[node.component] || "paragraph"

  return {
    type: blockType,
    content: node.props.content || node.props.children,
    attrs: {
      ...node.props,
    },
    children: [],
  }
}
