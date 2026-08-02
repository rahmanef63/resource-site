/**
 * Data Module - Single Source of Truth for Export/Import
 * 
 * All data transfer, export/import, and manipulation utilities.
 * 
 * Structure:
 * - shared/types     - Type definitions
 * - shared/lib       - Core engines and hooks
 * - shared/components - UI components
 * - shared/utils     - Utility functions
 * - shared/config    - Registry and configuration
 * - slices/          - Feature-specific slices (future)
 */

// ============================================================================
// Main Barrel - Everything from shared/
// ============================================================================

export * from "./shared";

// ============================================================================
// Legacy Re-exports for backward compatibility
// ============================================================================

// Converters - keep original location
export * from "../converters";

// Grouping utilities - keep original location
export * from "../grouping";
