/**
 * Registry Loader
 * Auto-discovers and loads components from folder structure
 */

import { glob } from "fast-glob"
import path from "path"
import type {
  IRegistryLoader,
  RegistryConfig,
  LoadResult,
  LoadError,
  RegistryModule,
  NodeLevel,
  AnyWrapper,
  RegistryEntry,
} from "../../types"
import { RegistryLoadError } from "../../types"
import type { Registry } from "./Registry"

export class RegistryLoader implements IRegistryLoader {
  constructor(private registry: Registry) {}

  /**
   * Load all registries from config paths
   */
  async load(config: RegistryConfig): Promise<LoadResult> {
    const result: LoadResult = {
      success: true,
      loaded: 0,
      skipped: 0,
      errors: [],
    }

    const levels: Array<{ type: NodeLevel; path: string }> = [
      { type: "component", path: config.paths.components },
      { type: "element", path: config.paths.elements },
      { type: "block", path: config.paths.blocks },
      { type: "section", path: config.paths.sections },
      { type: "template", path: config.paths.templates },
      { type: "flow", path: config.paths.flows },
    ]

    // Load from each path
    for (const { type, path: basePath } of levels) {
      try {
        const levelResult = await this.loadFrom(basePath, type)
        result.loaded += levelResult.loaded
        result.skipped += levelResult.skipped
        result.errors.push(...levelResult.errors)
      } catch (error) {
        result.errors.push({
          path: basePath,
          error: error instanceof Error ? error : new Error(String(error)),
          message: `Failed to load ${type} from ${basePath}`,
        })
      }
    }

    result.success = result.errors.length === 0

    return result
  }

  /**
   * Load from specific path and type
   */
  async loadFrom(basePath: string, type: NodeLevel): Promise<LoadResult> {
    const result: LoadResult = {
      success: true,
      loaded: 0,
      skipped: 0,
      errors: [],
    }

    try {
      // Find all registry files
      const pattern = path.join(basePath, "**/registry.{ts,tsx,js,jsx}").replace(/\\/g, "/")
      const files = await glob(pattern, {
        absolute: true,
        ignore: ["**/node_modules/**", "**/*.test.*", "**/*.spec.*"],
      })

      // Load each registry file
      for (const file of files) {
        try {
          const wrapper = await this.loadFile(file, type)
          if (wrapper) {
            this.registry.register({
              id: wrapper.id,
              type,
              wrapper,
              metadata: wrapper.metadata || {},
              filePath: file,
            })
            result.loaded++
          } else {
            result.skipped++
          }
        } catch (error) {
          result.errors.push({
            path: file,
            error: error instanceof Error ? error : new Error(String(error)),
            message: `Failed to load registry from ${file}`,
          })
        }
      }
    } catch (error) {
      result.errors.push({
        path: basePath,
        error: error instanceof Error ? error : new Error(String(error)),
        message: `Failed to scan directory ${basePath}`,
      })
      result.success = false
    }

    result.success = result.errors.length === 0

    return result
  }

  /**
   * Load wrapper from file
   */
  private async loadFile(
    filePath: string,
    expectedType: NodeLevel
  ): Promise<AnyWrapper | null> {
    try {
      // Dynamic import
      const module: RegistryModule = await import(filePath)

      // Try different export patterns
      const wrapper = this.extractWrapperFromModule(module, expectedType)

      if (!wrapper) {
        throw new RegistryLoadError(
          `No valid wrapper found in ${filePath}`,
          filePath
        )
      }

      // Validate type
      if (wrapper.type !== expectedType) {
        throw new RegistryLoadError(
          `Wrapper type mismatch: expected ${expectedType}, got ${wrapper.type}`,
          filePath
        )
      }

      return wrapper
    } catch (error) {
      if (error instanceof RegistryLoadError) {
        throw error
      }
      throw new RegistryLoadError(
        `Failed to import ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
        filePath,
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Extract wrapper from module exports
   */
  private extractWrapperFromModule(
    module: RegistryModule,
    expectedType: NodeLevel
  ): AnyWrapper | null {
    // Try default export
    if (module.default && this.isValidWrapper(module.default, expectedType)) {
      return module.default
    }

    // Try named export: registry
    if (module.registry && this.isValidWrapper(module.registry, expectedType)) {
      return module.registry
    }

    // Try type-specific named export
    const typeKey = expectedType as keyof RegistryModule
    if (module[typeKey] && this.isValidWrapper(module[typeKey], expectedType)) {
      return module[typeKey] as AnyWrapper
    }

    // Try to find any valid wrapper
    for (const key of Object.keys(module)) {
      const value = (module as any)[key]
      if (this.isValidWrapper(value, expectedType)) {
        return value
      }
    }

    return null
  }

  /**
   * Check if object is a valid wrapper
   */
  private isValidWrapper(obj: any, expectedType: NodeLevel): boolean {
    if (!obj || typeof obj !== "object") {
      return false
    }

    return (
      typeof obj.id === "string" &&
      obj.type === expectedType &&
      typeof obj.name === "string" &&
      typeof obj.fromJSON === "function" &&
      typeof obj.toJSON === "function" &&
      typeof obj.toTypeScript === "function"
    )
  }

  /**
   * Reload all registries
   */
  async reload(): Promise<LoadResult> {
    // Clear current registry
    this.registry.clear()

    // Re-load (implement if config is stored)
    throw new Error("Reload not implemented - config needs to be stored")
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

export async function loadRegistry(
  registry: Registry,
  config: RegistryConfig
): Promise<LoadResult> {
  const loader = new RegistryLoader(registry)
  return loader.load(config)
}

export async function loadRegistryFrom(
  registry: Registry,
  path: string,
  type: NodeLevel
): Promise<LoadResult> {
  const loader = new RegistryLoader(registry)
  return loader.loadFrom(path, type)
}
