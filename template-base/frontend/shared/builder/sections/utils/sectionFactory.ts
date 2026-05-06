/**
 * Section Factory (Level 4)
 */

import type { SectionWrapper, SectionStructure, SectionNode, SectionJSON, PropDefinitions, NodeMetadata } from "@/frontend/shared/foundation"
import { ComponentType } from "react"

export interface CreateSectionOptions<TProps = any> {
  id: string
  name: string
  displayName?: string
  description?: string
  category: string
  structure: SectionStructure
  defaults: Partial<TProps>
  props: PropDefinitions
  icon?: string | ComponentType
  previewImage?: string
  tags?: string[]
  metadata?: NodeMetadata
}

export function createSection<TProps = any>(options: CreateSectionOptions<TProps>): SectionWrapper<TProps> {
  const { id, name, displayName, description, category, structure, defaults, props: propDefinitions, icon, previewImage, tags, metadata } = options

  return {
    id,
    type: "section",
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

    fromJSON: (json: any): SectionNode => ({
      id: json.id || `section-${Date.now()}`,
      type: "section",
      name: json.name || name,
      section: id,
      props: json.props || defaults,
      blocks: json.blocks || [],
      structure: json.structure || structure,
      metadata: json.metadata,
    }),

    toJSON: (data: SectionNode): SectionJSON => ({
      type: "section",
      section: data.section,
      props: data.props,
      children: structure.children,
    }),

    toTypeScript: (data: SectionNode): string => `<${name} {...props} />`,

    explode: (data: SectionNode): any[] => {
      return structure.children.map((child, index) => ({
        id: `${data.id}-child-${index}`,
        ...child,
      }))
    },

    validate: (props: any): TProps => props as TProps,
  }
}
