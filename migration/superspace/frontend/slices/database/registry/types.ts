/**
 * Property Registry Types
 *
 * Type definitions for the property registry system.
 * Defines interfaces for property renderers, editors, and configurations.
 *
 * @module frontend/slices/database/registry/types
 */

import type { ComponentType, ReactNode } from "react";
import type { Property, PropertyType } from "@/frontend/shared/foundation/types/universal-database";
import type { PropertyOptions } from "@/frontend/shared/foundation/types/property-options";

/**
 * Property renderer component props
 *
 * Props passed to read-only property display components.
 *
 * @template T - The value type for this property
 */
export interface PropertyRendererProps<T = unknown> {
  /** The current value to display */
  value: T | null | undefined;

  /** The property configuration from Universal Database */
  property: Property;

  /** Whether the property is in read-only mode */
  readOnly?: boolean;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Property editor component props
 *
 * Props passed to editable property input components.
 *
 * @template T - The value type for this property
 */
export interface PropertyEditorProps<T = unknown> {
  /** The current value */
  value: T | null | undefined;

  /** The property configuration from Universal Database */
  property: Property;

  /** Callback when value changes */
  onChange: (value: T | null) => void;

  /** Callback when editor loses focus */
  onBlur?: () => void;

  /** Whether to auto-focus on mount */
  autoFocus?: boolean;
  
  /** Callback to update property configuration (options, choices, etc.) */
  onPropertyUpdate?: (options: Partial<PropertyOptions>) => Promise<void> | void;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Property options panel component props
 *
 * Props passed to property configuration/options panel components.
 */
export interface PropertyOptionsPanelProps {
  /** The property being configured */
  property: Property;

  /** Callback when options change */
  onChange: (options: PropertyOptions) => void;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Property validation result
 */
export type PropertyValidationResult = string | null;

/**
 * Property configuration
 *
 * Complete configuration for a property type including components,
 * metadata, and validation logic.
 */
export interface PropertyConfig {
  // ========================================================================
  // Identification
  // ========================================================================

  /** Property type identifier (matches PropertyType from Phase 1) */
  type: PropertyType;

  /** Human-readable label */
  label: string;

  /** Description of the property type */
  description?: string;

  /** Icon component for the property type */
  icon?: ComponentType<{ className?: string }>;

  // ========================================================================
  // Capabilities
  // ========================================================================

  /** Whether this property type supports custom options */
  supportsOptions: boolean;

  /** Whether this property can be marked as required */
  supportsRequired: boolean;

  /** Whether this property can be marked as unique */
  supportsUnique?: boolean;

  /** Whether this property supports default values */
  supportsDefault?: boolean;

  /** Whether this property is auto-generated (e.g., created_time) */
  isAuto?: boolean;

  /** Whether this property is editable by users */
  isEditable?: boolean;

  // ========================================================================
  // Components
  // ========================================================================

  /** Component for rendering the property value (read-only) */
  Renderer: ComponentType<PropertyRendererProps<any>>;

  /** Component for editing the property value */
  Editor: ComponentType<PropertyEditorProps<any>>;

  /** Optional component for configuring property options */
  OptionsPanel?: ComponentType<PropertyOptionsPanelProps>;

  // ========================================================================
  // Validation & Formatting
  // ========================================================================

  /**
   * Validate a property value
   *
   * @param value - The value to validate
   * @param property - The property configuration
   * @returns Error message string if invalid, null if valid
   */
  validate?: (value: unknown, property: Property) => PropertyValidationResult;

  /**
   * Format a value for display
   *
   * @param value - The value to format
   * @returns Formatted string representation
   */
  format?: (value: unknown) => string;

  /**
   * Parse a string value into the property's native type
   *
   * @param value - String value to parse
   * @returns Parsed value
   */
  parse?: (value: string) => unknown;

  // ========================================================================
  // Metadata
  // ========================================================================

  /** Property category */
  category: "core" | "extended" | "auto";

  /** Schema version this property was introduced */
  version: string;

  /** Semantic version when this property was added (e.g., "v2.0") */
  since?: string;

  /** Tags for categorization and search */
  tags?: string[];
}
