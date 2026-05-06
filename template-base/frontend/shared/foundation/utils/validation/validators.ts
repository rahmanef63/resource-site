/**
 * Validators
 * Validation utilities for nodes, props, and schemas
 */

import { z } from "zod"
import type {
  AnyNode,
  ComponentNode,
  ElementNode,
  BlockNode,
  PropDefinitions,
  AnyJSON,
} from "../../types"
import {
  ValidationError,
  PropValidationError,
  InvalidNodeStructureError,
  CircularReferenceError,
} from "../../types"
import {
  ComponentJSONSchema,
  ElementJSONSchema,
  BlockJSONSchema,
  SectionJSONSchema,
  TemplateJSONSchema,
  FlowJSONSchema,
  ExportSchemaV1,
} from "../../types"

// ============================================================================
// Node Validators
// ============================================================================

export function validateNode(node: AnyNode): void {
  // Basic validation
  if (!node.id) {
    throw new ValidationError("Node is missing an id")
  }

  if (!node.type) {
    throw new ValidationError("Node is missing a type")
  }

  if (!node.name) {
    throw new ValidationError("Node is missing a name")
  }

  // Type-specific validation
  switch (node.type) {
    case "component":
      validateComponentNode(node as ComponentNode)
      break
    case "element":
      validateElementNode(node as ElementNode)
      break
    case "block":
      validateBlockNode(node as BlockNode)
      break
    // Add more cases as needed
  }
}

export function validateComponentNode(node: ComponentNode): void {
  if (!node.component) {
    throw new InvalidNodeStructureError(
      `Component node "${node.id}" is missing component name`,
      node.id,
      node.type
    )
  }

  if (!node.props || typeof node.props !== "object") {
    throw new InvalidNodeStructureError(
      `Component node "${node.id}" has invalid props`,
      node.id,
      node.type
    )
  }
}

export function validateElementNode(node: ElementNode): void {
  if (!node.element) {
    throw new InvalidNodeStructureError(
      `Element node "${node.id}" is missing element name`,
      node.id,
      node.type
    )
  }

  if (!Array.isArray(node.components)) {
    throw new InvalidNodeStructureError(
      `Element node "${node.id}" is missing components array`,
      node.id,
      node.type
    )
  }

  if (!node.structure) {
    throw new InvalidNodeStructureError(
      `Element node "${node.id}" is missing structure`,
      node.id,
      node.type
    )
  }
}

export function validateBlockNode(node: BlockNode): void {
  if (!node.block) {
    throw new InvalidNodeStructureError(
      `Block node "${node.id}" is missing block name`,
      node.id,
      node.type
    )
  }

  if (!node.structure) {
    throw new InvalidNodeStructureError(
      `Block node "${node.id}" is missing structure`,
      node.id,
      node.type
    )
  }
}

// ============================================================================
// Prop Validators
// ============================================================================

export function validateProps(
  props: Record<string, any>,
  definitions: PropDefinitions,
  componentId: string
): void {
  for (const [key, definition] of Object.entries(definitions)) {
    const value = props[key]

    // Check required
    if (definition.required && (value === undefined || value === null)) {
      throw new PropValidationError(
        `Required prop "${key}" is missing`,
        componentId,
        key,
        value
      )
    }

    // Skip validation if value is undefined/null and not required
    if (value === undefined || value === null) {
      continue
    }

    // Type validation
    validatePropType(value, definition.type, componentId, key)

    // Custom validation
    if (definition.validate) {
      const result = definition.validate(value)
      if (result === false) {
        throw new PropValidationError(
          `Prop "${key}" failed custom validation`,
          componentId,
          key,
          value
        )
      }
      if (typeof result === "string") {
        throw new PropValidationError(
          result,
          componentId,
          key,
          value
        )
      }
    }

    // Range validation for numbers
    if (definition.type === "number" || definition.type === "slider") {
      if (definition.min !== undefined && value < definition.min) {
        throw new PropValidationError(
          `Prop "${key}" must be >= ${definition.min}`,
          componentId,
          key,
          value
        )
      }
      if (definition.max !== undefined && value > definition.max) {
        throw new PropValidationError(
          `Prop "${key}" must be <= ${definition.max}`,
          componentId,
          key,
          value
        )
      }
    }

    // Length validation for strings
    if (definition.type === "text" && definition.maxLength !== undefined) {
      if (typeof value === "string" && value.length > definition.maxLength) {
        throw new PropValidationError(
          `Prop "${key}" exceeds max length of ${definition.maxLength}`,
          componentId,
          key,
          value
        )
      }
    }

    // Options validation for select
    if (definition.type === "select" && definition.options) {
      const validValues = definition.options.map((opt) =>
        typeof opt === "object" ? opt.value : opt
      )
      if (!validValues.includes(value)) {
        throw new PropValidationError(
          `Prop "${key}" has invalid value. Must be one of: ${validValues.join(", ")}`,
          componentId,
          key,
          value
        )
      }
    }
  }
}

export function validatePropType(
  value: any,
  type: string,
  componentId: string,
  propName: string
): void {
  switch (type) {
    case "text":
    case "richtext":
    case "code":
      if (typeof value !== "string") {
        throw new PropValidationError(
          `Prop "${propName}" must be a string`,
          componentId,
          propName,
          value
        )
      }
      break

    case "number":
    case "slider":
      if (typeof value !== "number" || isNaN(value)) {
        throw new PropValidationError(
          `Prop "${propName}" must be a number`,
          componentId,
          propName,
          value
        )
      }
      break

    case "boolean":
      if (typeof value !== "boolean") {
        throw new PropValidationError(
          `Prop "${propName}" must be a boolean`,
          componentId,
          propName,
          value
        )
      }
      break

    case "select":
      // Any value is ok for select (validated separately)
      break

    case "multi-select":
      if (!Array.isArray(value)) {
        throw new PropValidationError(
          `Prop "${propName}" must be an array`,
          componentId,
          propName,
          value
        )
      }
      break

    case "color":
      if (typeof value !== "string" || !isValidColor(value)) {
        throw new PropValidationError(
          `Prop "${propName}" must be a valid color`,
          componentId,
          propName,
          value
        )
      }
      break

    case "image":
      if (typeof value !== "string" || !isValidImageUrl(value)) {
        throw new PropValidationError(
          `Prop "${propName}" must be a valid image URL`,
          componentId,
          propName,
          value
        )
      }
      break

    case "icon":
      if (typeof value !== "string") {
        throw new PropValidationError(
          `Prop "${propName}" must be a string`,
          componentId,
          propName,
          value
        )
      }
      break

    case "json":
      // Any value is ok for json
      break

    case "date":
      if (!(value instanceof Date) && !isValidDateString(value)) {
        throw new PropValidationError(
          `Prop "${propName}" must be a Date or valid date string`,
          componentId,
          propName,
          value
        )
      }
      break

    case "custom":
      // Custom validation handled separately
      break

    default:
      console.warn(`Unknown prop type: ${type}`)
  }
}

// ============================================================================
// JSON Schema Validators
// ============================================================================

export function validateComponentJSON(json: any): void {
  try {
    ComponentJSONSchema.parse(json)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        `Invalid component JSON: ${error.issues.map((issue) => issue.message).join(", ")}`,
        { errors: error.issues }
      )
    }
    throw error
  }
}

export function validateElementJSON(json: any): void {
  try {
    ElementJSONSchema.parse(json)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        `Invalid element JSON: ${error.issues.map((issue) => issue.message).join(", ")}`,
        { errors: error.issues }
      )
    }
    throw error
  }
}

export function validateBlockJSON(json: any): void {
  try {
    BlockJSONSchema.parse(json)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        `Invalid block JSON: ${error.issues.map((issue) => issue.message).join(", ")}`,
        { errors: error.issues }
      )
    }
    throw error
  }
}

export function validateExportSchema(json: any): void {
  try {
    ExportSchemaV1.parse(json)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        `Invalid export schema: ${error.issues.map((issue) => issue.message).join(", ")}`,
        { errors: error.issues }
      )
    }
    throw error
  }
}

// ============================================================================
// Circular Reference Detection
// ============================================================================

export function detectCircularReferences(
  nodes: Record<string, AnyNode>,
  rootIds: string[]
): void {
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  function visit(nodeId: string, path: string[]): void {
    if (recursionStack.has(nodeId)) {
      throw new CircularReferenceError(nodeId, path)
    }

    if (visited.has(nodeId)) {
      return
    }

    visited.add(nodeId)
    recursionStack.add(nodeId)

    const node = nodes[nodeId]
    if (!node) {
      return
    }

    // Get children based on node type
    let childIds: string[] = []
    if ("children" in node && Array.isArray(node.children)) {
      childIds = node.children
    } else if ("components" in node && Array.isArray(node.components)) {
      childIds = node.components
    } else if ("elements" in node && Array.isArray(node.elements)) {
      childIds = node.elements
    }

    // Visit children
    for (const childId of childIds) {
      visit(childId, [...path, nodeId])
    }

    recursionStack.delete(nodeId)
  }

  // Start from root nodes
  for (const rootId of rootIds) {
    visit(rootId, [])
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function isValidColor(value: string): boolean {
  // Check hex colors
  if (/^#[0-9A-F]{3}([0-9A-F]{3})?$/i.test(value)) {
    return true
  }

  // Check rgb/rgba
  if (/^rgba?\(/.test(value)) {
    return true
  }

  // Check hsl/hsla
  if (/^hsla?\(/.test(value)) {
    return true
  }

  // Check named colors (basic check)
  return /^[a-z]+$/i.test(value)
}

function isValidImageUrl(value: string): boolean {
  // Check if it's a data URL
  if (value.startsWith("data:image/")) {
    return true
  }

  // Check if it's a valid URL
  try {
    new URL(value)
    return true
  } catch {
    // Could be a relative path
    return /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(value)
  }
}

function isValidDateString(value: any): boolean {
  if (typeof value !== "string") {
    return false
  }
  const date = new Date(value)
  return !isNaN(date.getTime())
}

// ============================================================================
// Batch Validation
// ============================================================================

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

export function validateNodes(nodes: AnyNode[]): ValidationResult {
  const errors: ValidationError[] = []

  for (const node of nodes) {
    try {
      validateNode(node)
    } catch (error) {
      if (error instanceof ValidationError) {
        errors.push(error)
      } else {
        errors.push(
          new ValidationError(
            error instanceof Error ? error.message : String(error)
          )
        )
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
