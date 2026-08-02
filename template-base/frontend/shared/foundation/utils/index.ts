/**
 * Shared Library Index
 * Central export for all utility modules
 * 
 * Structure:
 * - core/      Pure utility functions (cn, dom, format, performance)
 * - data/      Data manipulation (converters, export, import, grouping)
 * - infra/     Infrastructure (errors, registry, validation)
 * - features/  Feature modules (archived, notifications, search, starred)
 * - system/    System utilities (theme, profile, help, command-menu, language, feedback)
 */

// ============================================
// Core Utilities
// ============================================
// ============================================
// Core Utilities
// ============================================
export * from "./core"
export * from "./navigation"

// ============================================
// Data Utilities
// ============================================
export * from "./data"

// ============================================
// Infrastructure Utilities
// ============================================
export * from "./infra"

// ============================================
// System Utilities
// ============================================
export * from "./system"

// ============================================
// Legacy Re-exports (for backward compatibility)
// ============================================

// Registry (client-safe only)
export { getGlobalRegistry } from "./registry"

// Error handling
export { handleError, getGlobalErrorHandler } from "./errors"

// Validation
export { validateNode, validateProps } from "./validation"

// ============================================
// Offline Shell Mode
// ============================================
export * from "./offline"
