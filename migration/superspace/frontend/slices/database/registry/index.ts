/**
 * Property Registry - Public API
 *
 * Central export point for the property registry system.
 * Import from this file to access the registry and related utilities.
 *
 * @module frontend/slices/database/registry
 */

// Core registry
export { propertyRegistry, PropertyRegistry } from "./PropertyRegistry";

// Auto-discovery
export { registerAllProperties } from "./auto-discovery";

// Types
export type {
  PropertyRendererProps,
  PropertyEditorProps,
  PropertyOptionsPanelProps,
  PropertyValidationResult,
  PropertyConfig,
} from "./types";
