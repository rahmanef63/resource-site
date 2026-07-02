/**
 * Property Registry - Core Implementation
 *
 * Central singleton registry for all database property types.
 * Manages registration, retrieval, and lookup of property configurations.
 *
 * @module frontend/slices/database/registry/PropertyRegistry
 */

import type { PropertyType } from "@/frontend/shared/foundation/types/universal-database";
import type { PropertyConfig } from "./types";

/**
 * Property Registry Singleton
 *
 * Centralized registry for all property type configurations.
 * Uses singleton pattern to ensure single source of truth.
 *
 * @example
 * ```typescript
 * import { propertyRegistry } from `./PropertyRegistry`;
 *
 * // Register a property
 * propertyRegistry.register(titleConfig);
 *
 * // Get a property
 * const config = propertyRegistry.get("title");
 *
 * // Get all properties
 * const all = propertyRegistry.getAll();
 * ```
 */
class PropertyRegistry {
  private properties = new Map<PropertyType, PropertyConfig>();
  private static instance: PropertyRegistry | null = null;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    // Private to prevent direct instantiation
  }

  /**
   * Get the singleton instance
   *
   * @returns The PropertyRegistry singleton instance
   */
  static getInstance(): PropertyRegistry {
    if (!PropertyRegistry.instance) {
      PropertyRegistry.instance = new PropertyRegistry();
    }
    return PropertyRegistry.instance;
  }

  /**
   * Register a property type configuration
   *
   * Registers a new property type with the registry. If the property type
   * is already registered, logs a warning and skips registration.
   *
   * @param config - Property configuration to register
   *
   * @example
   * ```typescript
   * propertyRegistry.register({
   *   type: "title",
   *   label: "Title",
   *   Renderer: TitleRenderer,
   *   Editor: TitleEditor,
   *   category: "core",
   *   version: "2.0",
   *   supportsOptions: false,
   *   supportsRequired: true,
   * });
   * ```
   */
  register(config: PropertyConfig): boolean {
    if (this.properties.has(config.type)) {
      return false;
    }

    // Validate required fields
    if (!config.type) {
      console.error("Property config missing required field: type");
      return false;
    }

    if (!config.Renderer) {
      console.error(`Property type "${config.type}" missing required Renderer component`);
      return false;
    }

    if (!config.Editor) {
      console.error(`Property type "${config.type}" missing required Editor component`);
      return false;
    }

    this.properties.set(config.type, config);

    if (process.env.NODE_ENV === "development") {
    }

    return true;
  }

  /**
   * Get a property configuration by type
   *
   * @param type - Property type identifier
   * @returns Property configuration or undefined if not found
   *
   * @example
   * ```typescript
   * const titleConfig = propertyRegistry.get("title");
   * if (titleConfig) {
   *   const { Renderer } = titleConfig;
   *   return <Renderer value="Hello" property={property} />;
   * }
   * ```
   */
  get(type: PropertyType): PropertyConfig | undefined {
    return this.properties.get(type);
  }

  /**
   * Get all registered property configurations
   *
   * @returns Array of all property configurations
   *
   * @example
   * ```typescript
   * const allProperties = propertyRegistry.getAll();
   *
   * ```
   */
  getAll(): PropertyConfig[] {
    return Array.from(this.properties.values());
  }

  /**
   * Check if a property type is registered
   *
   * @param type - Property type identifier
   * @returns True if registered, false otherwise
   *
   * @example
   * ```typescript
   * if (propertyRegistry.has("title")) {
   *
   * }
   * ```
   */
  has(type: PropertyType): boolean {
    return this.properties.has(type);
  }

  /**
   * Get properties by category
   *
   * @param category - Category to filter by ("core", "extended", or "auto")
   * @returns Array of property configurations in the category
   *
   * @example
   * ```typescript
   * const coreProperties = propertyRegistry.getByCategory("core");
   * const extendedProperties = propertyRegistry.getByCategory("extended");
   * ```
   */
  getByCategory(category: PropertyConfig["category"]): PropertyConfig[] {
    return this.getAll().filter((config) => config.category === category);
  }

  /**
   * Get properties by tag
   *
   * @param tag - Tag to filter by
   * @returns Array of property configurations with the tag
   *
   * @example
   * ```typescript
   * const textProperties = propertyRegistry.getByTag("text");
   * const numericProperties = propertyRegistry.getByTag("numeric");
   * ```
   */
  getByTag(tag: string): PropertyConfig[] {
    return this.getAll().filter(
      (config) => config.tags && config.tags.includes(tag)
    );
  }

  /**
   * Get the number of registered properties
   *
   * @returns Count of registered property types
   */
  count(): number {
    return this.properties.size;
  }

  /**
   * Get property types as array
   *
   * @returns Array of all registered property type identifiers
   */
  getTypes(): PropertyType[] {
    return Array.from(this.properties.keys());
  }

  /**
   * Clear all registered properties
   *
   * **WARNING:** This method is intended for testing purposes only.
   * It will remove all registered property types from the registry.
   */
  clear(): void {
    if (process.env.NODE_ENV !== "test") {
      console.warn("PropertyRegistry.clear() should only be used in tests");
    }
    this.properties.clear();
  }

  /**
   * Reset registry to initial state
   *
   * For testing purposes only. Clears the singleton instance.
   */
  static resetInstance(): void {
    if (process.env.NODE_ENV !== "test") {
      console.warn("PropertyRegistry.resetInstance() should only be used in tests");
    }
    PropertyRegistry.instance = null;
  }
}

/**
 * Singleton instance of PropertyRegistry
 *
 * Use this instance to register and retrieve property configurations.
 *
 * @example
 * ```typescript
 * import { propertyRegistry } from `@/frontend/slices/database/registry`;
 *
 * const config = propertyRegistry.get("title");
 * ```
 */
export const propertyRegistry = PropertyRegistry.getInstance();

/**
 * Export class for testing
 */
export { PropertyRegistry };
