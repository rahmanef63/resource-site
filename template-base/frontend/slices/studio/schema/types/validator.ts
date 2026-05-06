/**
 * validator.ts — Public type contract for the Studio validation system.
 *
 * These types are used across normalizer, AJV validator, graph validator,
 * business validator, and the unified validation entry point.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Validation mode
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Controls how strict the validation pipeline is.
 *
 * "strict"  — used for save/export/production. All issues are enforced.
 *             Alias props are rejected if not pre-normalised.
 *             Bare number gaps are errors.
 *
 * "lenient" — used for AI generation / raw import / draft editing.
 *             Alias props are automatically normalised before validation.
 *             T-shirt sizes are resolved rather than errored.
 *             Orphan nodes produce warnings, not errors.
 */
export type ValidationMode = "strict" | "lenient";

// ─────────────────────────────────────────────────────────────────────────────
// Issue codes
// ─────────────────────────────────────────────────────────────────────────────

export type ValidationIssueCode =
  // Structural
  | "SCHEMA_REQUIRED"
  | "SCHEMA_TYPE"
  | "INVALID_VERSION"
  | "INVALID_TOP_LEVEL_SHAPE"
  | "EMPTY_ROOT"
  | "EMPTY_NODES"
  | "DUPLICATE_ROOT_ID"
  // Node ID
  | "INVALID_NODE_ID_FORMAT"
  // Widget
  | "UNKNOWN_WIDGET_TYPE"
  | "DEPRECATED_WIDGET_TYPE"
  | "INVALID_PROP_TYPE"
  | "INVALID_PROP_VALUE"
  // Alias
  | "PROP_ALIAS_DETECTED"
  | "PROP_ALIAS_NORMALISED"
  // CSS
  | "INVALID_CSS_LENGTH"
  | "INVALID_GAP_UNIT"
  // Flex
  | "INVALID_FLEX_DIRECTION"
  // Graph
  | "UNKNOWN_ROOT_ID"
  | "UNKNOWN_CHILD_ID"
  | "DUPLICATE_CHILDREN"
  | "MULTIPLE_PARENTS"
  | "ROOT_HAS_PARENT"
  | "CIRCULAR_REFERENCE"
  | "ORPHAN_NODE"
  | "LEAF_NODE_HAS_CHILDREN"
  // Business / semantic
  | "INVALID_SECTION_USAGE"
  | "SMART_BLOCK_NESTING"
  | "DUPLICATE_ROUTE_PATH"
  | "BLOCK_LAYOUT_ON_CONTAINER"
  | "CONTAINER_MISSING_DISPLAY"
  // Normalizer
  | "MIGRATION_V04_TO_V05"
  // Generic
  | "AJV_ERROR";

// ─────────────────────────────────────────────────────────────────────────────
// Issue shape
// ─────────────────────────────────────────────────────────────────────────────

export interface ValidationIssue {
  /** Stable code for programmatic handling. */
  code: ValidationIssueCode;
  /** JSON path or node ID scope. "/" for document-level issues. */
  path: string;
  /** Human-readable description. Should be actionable. */
  message: string;
  severity: "error" | "warning";
  /** Node ID if the issue targets a specific node. */
  nodeId?: string;
  /** Extra context for UI display or automated fixes. */
  details?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation result
// ─────────────────────────────────────────────────────────────────────────────

export interface StudioValidationResult<T = unknown> {
  /** True iff there are zero "error" severity issues. */
  valid: boolean;
  /** Normalised document (available even when valid=false if normaliser ran). */
  normalizedDocument: T | null;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  /** Document stats computed during validation. */
  stats?: {
    nodeCount: number;
    rootCount: number;
    widgetTypes: string[];
    maxDepth: number;
    orphanCount: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Normaliser result
// ─────────────────────────────────────────────────────────────────────────────

export interface NormaliseResult<T = unknown> {
  document: T | null;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation options
// ─────────────────────────────────────────────────────────────────────────────

export interface ValidateOptions {
  mode?: ValidationMode;
  /** Run normaliser before validation (default true in lenient mode). */
  normalize?: boolean;
  /** Run prop-level validation (default true). */
  validateProps?: boolean;
  /** Run layout linting (default true). */
  lintLayout?: boolean;
  /** Check for orphan nodes (default true). */
  checkOrphans?: boolean;
}
