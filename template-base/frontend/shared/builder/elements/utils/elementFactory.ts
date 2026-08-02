/**
 * Element Factory
 * Utilities for creating element wrappers (Level 2 - composites of components)
 */

import type {
  ElementWrapper,
  ElementStructure,
  ElementNode,
  ElementJSON,
  ComponentJSON,
  PropDefinitions,
  NodeMetadata,
} from "@/frontend/shared/foundation"
import { ComponentType } from "react"

// ============================================================================
// Factory Options
// ============================================================================

export interface CreateElementOptions<TProps = any> {
  id: string
  name: string
  displayName?: string
  description?: string
  category: string

  // Structure definition (how components are composed)
  structure: ElementStructure

  defaults: Partial<TProps>
  props: PropDefinitions

  icon?: string | ComponentType
  previewImage?: string
  tags?: string[]
  metadata?: NodeMetadata

  // Custom methods (optional)
  fromJSON?: (json: any) => ElementNode
  toJSON?: (data: ElementNode) => ElementJSON
  toTypeScript?: (data: ElementNode) => string
  explode?: (data: ElementNode) => any[]
  validate?: (props: any) => TProps
}

// ============================================================================
// Element Factory
// ============================================================================

export function createElement<TProps = any>(
  options: CreateElementOptions<TProps>
): ElementWrapper<TProps> {
  const {
    id,
    name,
    displayName,
    description,
    category,
    structure,
    defaults,
    props: propDefinitions,
    icon,
    previewImage,
    tags,
    metadata,
  } = options

  // Default fromJSON
  const fromJSON = options.fromJSON || ((json: any): ElementNode => {
    return {
      id: json.id || `element-${Date.now()}`,
      type: "element",
      name: json.name || name,
      element: id,
      props: json.props || defaults,
      components: json.components || [],
      structure: json.structure || structure,
      metadata: json.metadata,
    }
  })

  // Default toJSON
  const toJSON = options.toJSON || ((data: ElementNode): ElementJSON => {
    return {
      type: "element",
      element: data.element,
      props: data.props,
      children: structure.children,
    }
  })

  // Default toTypeScript
  const toTypeScript = options.toTypeScript || ((data: ElementNode): string => {
    // Generate JSX code for this element
    const propsStr = Object.entries(data.props)
      .map(([key, value]) => {
        if (typeof value === "string") {
          return `${key}="${value}"`
        } else if (typeof value === "boolean") {
          return value ? key : `${key}={false}`
        } else {
          return `${key}={${JSON.stringify(value)}}`
        }
      })
      .join(" ")

    return `<${name}${propsStr ? " " + propsStr : ""} />`
  })

  // Default explode
  const explode = options.explode || ((data: ElementNode): any[] => {
    // Return individual components that make up this element
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return structure.children.map(({ type: _childType, ...childRest }, index) => ({
      id: `${data.id}-child-${index}`,
      type: "component" as const,
      ...childRest,
    }))
  })

  // Default validate
  const validate = options.validate || ((props: any): TProps => {
    // Basic validation - just return props
    return props as TProps
  })

  return {
    id,
    type: "element",
    name,
    displayName: displayName || name,
    description,
    category,
    structure,
    defaults,
    props: propDefinitions,
    icon,
    previewImage,
    tags,
    metadata,
    fromJSON,
    toJSON,
    toTypeScript,
    explode,
    validate,
  }
}
