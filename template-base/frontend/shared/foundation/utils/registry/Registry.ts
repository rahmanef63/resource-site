/**
 * Core Registry Implementation
 * Manages registration and lookup of all node types
 */

import {
  type IRegistry,
  type RegistryEntry,
  type RegistryValidationResult,
  type RegistryValidationError,
  type RegistryValidationWarning,
  type AnyWrapper,
  type ComponentWrapper,
  type ElementWrapper,
  type BlockWrapper,
  type SectionWrapper,
  type TemplateWrapper,
  type FlowWrapper,
  type NodeLevel,
  type NodeMetadata,
  DuplicateRegistrationError,
  ComponentNotFoundError,
  RegistryError,
} from "../../types"

export class Registry implements IRegistry {
  private components = new Map<string, ComponentWrapper>()
  private elements = new Map<string, ElementWrapper>()
  private blocks = new Map<string, BlockWrapper>()
  private sections = new Map<string, SectionWrapper>()
  private templates = new Map<string, TemplateWrapper>()
  private flows = new Map<string, FlowWrapper>()

  private metadata = new Map<string, NodeMetadata>()

  constructor(
    private options: {
      throwOnDuplicates?: boolean
      allowOverrides?: boolean
      validateOnRegister?: boolean
    } = {}
  ) {
    this.options = {
      throwOnDuplicates: true,
      allowOverrides: false,
      validateOnRegister: true,
      ...options,
    }
  }

  // ============================================================================
  // Registration
  // ============================================================================

  register<T extends AnyWrapper>(entry: RegistryEntry<T>): void {
    const { id, type, wrapper, metadata } = entry

    // Check for duplicates
    if (this.has(id, type)) {
      if (!this.options.allowOverrides) {
        const message = `${type} "${id}" is already registered`
        if (this.options.throwOnDuplicates) {
          throw new DuplicateRegistrationError(id, type)
        } else {
          console.warn(message)
          return
        }
      }
    }

    // Validate if enabled
    if (this.options.validateOnRegister) {
      this.validateWrapper(wrapper, type)
    }

    // Register based on type
    const map = this.getMapForType(type)
    map.set(id, wrapper as any)

    // Store metadata
    if (metadata) {
      this.metadata.set(`${type}:${id}`, metadata)
    }
  }

  unregister(id: string, type: NodeLevel): void {
    const map = this.getMapForType(type)
    map.delete(id)
    this.metadata.delete(`${type}:${id}`)
  }

  // ============================================================================
  // Lookup
  // ============================================================================

  get(id: string, type: NodeLevel): AnyWrapper | undefined {
    const map = this.getMapForType(type)
    return map.get(id) as AnyWrapper | undefined
  }

  getComponent(id: string): ComponentWrapper | undefined {
    return this.components.get(id)
  }

  getElement(id: string): ElementWrapper | undefined {
    return this.elements.get(id)
  }

  getBlock(id: string): BlockWrapper | undefined {
    return this.blocks.get(id)
  }

  getSection(id: string): SectionWrapper | undefined {
    return this.sections.get(id)
  }

  getTemplate(id: string): TemplateWrapper | undefined {
    return this.templates.get(id)
  }

  getFlow(id: string): FlowWrapper | undefined {
    return this.flows.get(id)
  }

  // ============================================================================
  // Query
  // ============================================================================

  getAll(type: NodeLevel): AnyWrapper[] {
    const map = this.getMapForType(type)
    return Array.from(map.values()) as AnyWrapper[]
  }

  getAllComponents(): ComponentWrapper[] {
    return Array.from(this.components.values())
  }

  getAllElements(): ElementWrapper[] {
    return Array.from(this.elements.values())
  }

  getAllBlocks(): BlockWrapper[] {
    return Array.from(this.blocks.values())
  }

  getAllSections(): SectionWrapper[] {
    return Array.from(this.sections.values())
  }

  getAllTemplates(): TemplateWrapper[] {
    return Array.from(this.templates.values())
  }

  getAllFlows(): FlowWrapper[] {
    return Array.from(this.flows.values())
  }

  // ============================================================================
  // Filter
  // ============================================================================

  getByCategory(type: NodeLevel, category: string): AnyWrapper[] {
    return this.getAll(type).filter(
      (wrapper) => wrapper.category === category
    )
  }

  getByTag(type: NodeLevel, tag: string): AnyWrapper[] {
    return this.getAll(type).filter(
      (wrapper) => wrapper.tags?.includes(tag)
    )
  }

  search(type: NodeLevel, query: string): AnyWrapper[] {
    const lowerQuery = query.toLowerCase()
    return this.getAll(type).filter((wrapper) => {
      const name = wrapper.name?.toLowerCase() || ""
      const displayName = wrapper.displayName?.toLowerCase() || ""
      const description = wrapper.description?.toLowerCase() || ""
      const tags = wrapper.tags?.join(" ").toLowerCase() || ""

      return (
        name.includes(lowerQuery) ||
        displayName.includes(lowerQuery) ||
        description.includes(lowerQuery) ||
        tags.includes(lowerQuery)
      )
    })
  }

  // ============================================================================
  // Validation
  // ============================================================================

  has(id: string, type: NodeLevel): boolean {
    const map = this.getMapForType(type)
    return map.has(id)
  }

  validate(): RegistryValidationResult {
    const errors: RegistryValidationError[] = []
    const warnings: RegistryValidationWarning[] = []

    // Validate all registered items
    const types: NodeLevel[] = ["component", "element", "block", "section", "template", "flow"]

    for (const type of types) {
      const items = this.getAll(type)

      for (const wrapper of items) {
        try {
          this.validateWrapper(wrapper, type)
        } catch (error) {
          errors.push({
            id: wrapper.id,
            type,
            message: error instanceof Error ? error.message : String(error),
            severity: "error",
          })
        }

        // Check for warnings
        if (!wrapper.description) {
          warnings.push({
            id: wrapper.id,
            type,
            message: "Missing description",
            severity: "warning",
          })
        }

        if (!wrapper.icon) {
          warnings.push({
            id: wrapper.id,
            type,
            message: "Missing icon",
            severity: "warning",
          })
        }

        if (wrapper.metadata?.deprecated) {
          warnings.push({
            id: wrapper.id,
            type,
            message: "Component is deprecated",
            severity: "warning",
          })
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  private validateWrapper(wrapper: AnyWrapper, type: NodeLevel): void {
    if (!wrapper.id) {
      throw new RegistryError(`${type} is missing an id`)
    }

    if (!wrapper.name) {
      throw new RegistryError(`${type} "${wrapper.id}" is missing a name`)
    }

    if (!wrapper.type || wrapper.type !== type) {
      throw new RegistryError(
        `${type} "${wrapper.id}" has incorrect type: ${wrapper.type}`
      )
    }

    if (typeof wrapper.fromJSON !== "function") {
      throw new RegistryError(
        `${type} "${wrapper.id}" is missing fromJSON method`
      )
    }

    if (typeof wrapper.toJSON !== "function") {
      throw new RegistryError(
        `${type} "${wrapper.id}" is missing toJSON method`
      )
    }

    if (typeof wrapper.toTypeScript !== "function") {
      throw new RegistryError(
        `${type} "${wrapper.id}" is missing toTypeScript method`
      )
    }

    if (typeof wrapper.validate !== "function") {
      throw new RegistryError(
        `${type} "${wrapper.id}" is missing validate method`
      )
    }
  }

  // ============================================================================
  // Metadata
  // ============================================================================

  getMetadata(id: string, type: NodeLevel): NodeMetadata | undefined {
    return this.metadata.get(`${type}:${id}`)
  }

  getTotalCount(): number {
    return (
      this.components.size +
      this.elements.size +
      this.blocks.size +
      this.sections.size +
      this.templates.size +
      this.flows.size
    )
  }

  getCountByType(type: NodeLevel): number {
    const map = this.getMapForType(type)
    return map.size
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  private getMapForType(type: NodeLevel): Map<string, any> {
    switch (type) {
      case "component":
        return this.components
      case "element":
        return this.elements
      case "block":
        return this.blocks
      case "section":
        return this.sections
      case "template":
        return this.templates
      case "flow":
        return this.flows
      default:
        throw new RegistryError(`Unknown node type: ${type}`)
    }
  }

  // ============================================================================
  // Debug
  // ============================================================================

  debug(): void {
    console.group("Registry Debug Info")
    console.log(`Total: ${this.getTotalCount()}`)
    console.log(`Components: ${this.components.size}`)
    console.log(`Elements: ${this.elements.size}`)
    console.log(`Blocks: ${this.blocks.size}`)
    console.log(`Sections: ${this.sections.size}`)
    console.log(`Templates: ${this.templates.size}`)
    console.log(`Flows: ${this.flows.size}`)
    console.groupEnd()
  }

  // ============================================================================
  // Clear & Reset
  // ============================================================================

  clear(): void {
    this.components.clear()
    this.elements.clear()
    this.blocks.clear()
    this.sections.clear()
    this.templates.clear()
    this.flows.clear()
    this.metadata.clear()
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let globalRegistry: Registry | null = null

export function getGlobalRegistry(): Registry {
  if (!globalRegistry) {
    globalRegistry = new Registry()
  }
  return globalRegistry
}

export function setGlobalRegistry(registry: Registry): void {
  globalRegistry = registry
}

export function resetGlobalRegistry(): void {
  globalRegistry = null
}