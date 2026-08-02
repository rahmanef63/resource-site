/**
 * Block Factory (Level 3)
 */

import type {
  BlockWrapper,
  BlockStructure,
  BlockNode,
  BlockJSON,
  PropDefinitions,
  NodeMetadata,
} from "@/frontend/shared/foundation"
import { ComponentType } from "react"

export interface CreateBlockOptions<TProps = any> {
  id: string
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
  metadata?: NodeMetadata
}

export function createBlock<TProps = any>(
  options: CreateBlockOptions<TProps>
): BlockWrapper<TProps> {
  const { id, name, displayName, description, category, structure, defaults, props: propDefinitions, icon, previewImage, tags, metadata } = options

  return {
    id,
    type: "block",
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

    fromJSON: (json: any): BlockNode => ({
      id: json.id || `block-${Date.now()}`,
      type: "block",
      name: json.name || name,
      block: id,
      props: json.props || defaults,
      elements: json.elements || [],
      components: json.components || [],
      structure: json.structure || structure,
      metadata: json.metadata,
    }),

    toJSON: (data: BlockNode): BlockJSON => ({
      type: "block",
      block: data.block,
      props: data.props,
      children: structure.children,
    }),

    toTypeScript: (data: BlockNode): string => `<${name} {...props} />`,

    explode: (data: BlockNode): any[] => {
      return structure.children.map((child, index) => ({
        id: `${data.id}-child-${index}`,
        ...child,
      }))
    },

    validate: (props: any): TProps => props as TProps,
  }
}
