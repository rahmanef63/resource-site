import type { WidgetConfig } from '../types';
import { resolveWidgetIcon, categoryIcons } from './iconUtils';

/**
 * Widget validation and standardization utilities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Validates a widget configuration
 * @param key - Widget key
 * @param config - Widget configuration
 * @returns Validation result
 */
export const validateWidget = (key: string, config: WidgetConfig): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Required fields validation
  if (!config.label) {
    errors.push('Widget must have a label');
  }

  if (!config.category) {
    errors.push('Widget must have a category');
  }

  if (!config.render) {
    errors.push('Widget must have a render function');
  }

  if (!config.defaults) {
    errors.push('Widget must have default properties');
  }

  // Category validation
  if (config.category && !(config.category in categoryIcons)) {
    warnings.push(`Category "${config.category}" is not a standard category`);
    suggestions.push(`Consider using one of: ${Object.keys(categoryIcons).join(', ')}`);
  }

  // Icon validation
  if (!config.icon) {
    warnings.push('Widget should have an icon');
    suggestions.push('Add an icon property or it will use category default');
  }

  // Inspector validation
  if (!config.inspector || !config.inspector.fields || config.inspector.fields.length === 0) {
    warnings.push('Widget should have inspector fields for better user experience');
  }

  // Description validation
  if (!config.description) {
    warnings.push('Widget should have a description for better UX');
  }

  // Tags validation
  if (!config.tags || config.tags.length === 0) {
    suggestions.push('Consider adding tags for better searchability');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
};

/**
 * Standardizes a widget configuration
 * @param key - Widget key
 * @param config - Widget configuration
 * @returns Standardized widget configuration
 */
export const standardizeWidget = (key: string, config: WidgetConfig): WidgetConfig => {
  return {
    ...config,
    icon: resolveWidgetIcon(
      config.icon,
      config.category as any,
      key as any
    ),
    description: config.description || `${config.label} widget for ${config.category.toLowerCase()} layouts`,
    tags: config.tags || [config.category.toLowerCase()],
  };
};

/**
 * Validates all widgets in a registry
 * @param registry - Widget registry
 * @returns Validation results for each widget
 */
export const validateWidgetRegistry = (
  registry: Record<string, WidgetConfig>
): Record<string, ValidationResult> => {
  const results: Record<string, ValidationResult> = {};
  
  Object.entries(registry).forEach(([key, config]) => {
    results[key] = validateWidget(key, config);
  });

  return results;
};

/**
 * Gets a summary of validation results
 * @param results - Validation results
 * @returns Summary statistics
 */
export const getValidationSummary = (
  results: Record<string, ValidationResult>
) => {
  const total = Object.keys(results).length;
  const valid = Object.values(results).filter(r => r.isValid).length;
  const withErrors = Object.values(results).filter(r => r.errors.length > 0).length;
  const withWarnings = Object.values(results).filter(r => r.warnings.length > 0).length;

  return {
    total,
    valid,
    withErrors,
    withWarnings,
    errorRate: total > 0 ? (withErrors / total) * 100 : 0,
    warningRate: total > 0 ? (withWarnings / total) * 100 : 0,
  };
};

/**
 * Prints validation results to console
 * @param results - Validation results
 */


/**
 * Development helper to validate and print results
 * @param registry - Widget registry
 */
