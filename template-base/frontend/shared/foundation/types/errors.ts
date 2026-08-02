/**
 * Error Types
 * Comprehensive error handling for the shared component system
 */

// ============================================================================
// Base Error Class
// ============================================================================

export class SharedSystemError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

// ============================================================================
// Validation Errors
// ============================================================================

export class ValidationError extends SharedSystemError {
  constructor(message: string, details?: any) {
    super(message, "VALIDATION_ERROR", details)
  }
}

export class SchemaValidationError extends ValidationError {
  constructor(
    message: string,
    public schema: string,
    public errors: any[]
  ) {
    super(message, { schema, errors })
  }
}

export class PropValidationError extends ValidationError {
  constructor(
    message: string,
    public componentId: string,
    public propName: string,
    public propValue: any
  ) {
    super(message, { componentId, propName, propValue })
  }
}

// ============================================================================
// Registry Errors
// ============================================================================

export class RegistryError extends SharedSystemError {
  constructor(message: string, details?: any) {
    super(message, "REGISTRY_ERROR", details)
  }
}

export class ComponentNotFoundError extends RegistryError {
  constructor(
    public componentId: string,
    public componentType: string
  ) {
    super(
      `Component "${componentId}" of type "${componentType}" not found in registry`,
      { componentId, componentType }
    )
  }
}

export class DuplicateRegistrationError extends RegistryError {
  constructor(
    public componentId: string,
    public componentType: string
  ) {
    super(
      `Component "${componentId}" of type "${componentType}" is already registered`,
      { componentId, componentType }
    )
  }
}

export class RegistryLoadError extends RegistryError {
  constructor(
    message: string,
    public path: string,
    public originalError?: Error
  ) {
    super(message, { path, originalError: originalError?.message })
  }
}

// ============================================================================
// Conversion Errors
// ============================================================================

export class ConversionError extends SharedSystemError {
  constructor(message: string, details?: any) {
    super(message, "CONVERSION_ERROR", details)
  }
}

export class JSONConversionError extends ConversionError {
  constructor(
    message: string,
    public nodeId?: string,
    public path?: string
  ) {
    super(message, { nodeId, path })
  }
}

export class TypeScriptConversionError extends ConversionError {
  constructor(
    message: string,
    public line?: number,
    public column?: number,
    public sourceCode?: string
  ) {
    super(message, { line, column, sourceCode })
  }
}

export class SchemaConversionError extends ConversionError {
  constructor(
    message: string,
    public fromVersion: string,
    public toVersion: string
  ) {
    super(message, { fromVersion, toVersion })
  }
}

// ============================================================================
// Import/Export Errors
// ============================================================================

export class ImportError extends SharedSystemError {
  constructor(message: string, details?: any) {
    super(message, "IMPORT_ERROR", details)
  }
}

export class ExportError extends SharedSystemError {
  constructor(message: string, details?: any) {
    super(message, "EXPORT_ERROR", details)
  }
}

export class UnsupportedFormatError extends ImportError {
  constructor(
    public format: string,
    public supportedFormats: string[]
  ) {
    super(
      `Unsupported format "${format}". Supported formats: ${supportedFormats.join(", ")}`,
      { format, supportedFormats }
    )
  }
}

export class VersionMismatchError extends ImportError {
  constructor(
    public schemaVersion: string,
    public systemVersion: string
  ) {
    super(
      `Schema version "${schemaVersion}" is not compatible with system version "${systemVersion}"`,
      { schemaVersion, systemVersion }
    )
  }
}

// ============================================================================
// Node Operation Errors
// ============================================================================

export class NodeError extends SharedSystemError {
  constructor(message: string, details?: any) {
    super(message, "NODE_ERROR", details)
  }
}

export class NodeNotFoundError extends NodeError {
  constructor(public nodeId: string) {
    super(`Node "${nodeId}" not found`, { nodeId })
  }
}

export class CircularReferenceError extends NodeError {
  constructor(
    public nodeId: string,
    public path: string[]
  ) {
    super(
      `Circular reference detected: ${path.join(" -> ")} -> ${nodeId}`,
      { nodeId, path }
    )
  }
}

export class InvalidNodeStructureError extends NodeError {
  constructor(
    message: string,
    public nodeId: string,
    public nodeType: string
  ) {
    super(message, { nodeId, nodeType })
  }
}

// ============================================================================
// Grouping Errors
// ============================================================================

export class GroupingError extends SharedSystemError {
  constructor(message: string, details?: any) {
    super(message, "GROUPING_ERROR", details)
  }
}

export class EmptyGroupError extends GroupingError {
  constructor() {
    super("Cannot create an empty group", {})
  }
}

export class InvalidGroupOperationError extends GroupingError {
  constructor(
    message: string,
    public groupId: string,
    public operation: string
  ) {
    super(message, { groupId, operation })
  }
}

export class ComponentInstanceError extends GroupingError {
  constructor(
    message: string,
    public instanceId: string,
    public definitionId?: string
  ) {
    super(message, { instanceId, definitionId })
  }
}

// ============================================================================
// Migration Errors
// ============================================================================

export class MigrationError extends SharedSystemError {
  constructor(message: string, details?: any) {
    super(message, "MIGRATION_ERROR", details)
  }
}

export class MigrationNotFoundError extends MigrationError {
  constructor(
    public fromVersion: string,
    public toVersion: string
  ) {
    super(
      `No migration path found from version "${fromVersion}" to "${toVersion}"`,
      { fromVersion, toVersion }
    )
  }
}

export class MigrationFailedError extends MigrationError {
  constructor(
    message: string,
    public fromVersion: string,
    public toVersion: string,
    public originalError?: Error
  ) {
    super(message, { fromVersion, toVersion, originalError: originalError?.message })
  }
}

// ============================================================================
// CMS/Documents Integration Errors
// ============================================================================

export class IntegrationError extends SharedSystemError {
  constructor(message: string, details?: any) {
    super(message, "INTEGRATION_ERROR", details)
  }
}

export class CMSIntegrationError extends IntegrationError {
  constructor(message: string, details?: any) {
    super(message, { source: "cms", ...details })
  }
}

export class DocumentsIntegrationError extends IntegrationError {
  constructor(message: string, details?: any) {
    super(message, { source: "documents", ...details })
  }
}

// ============================================================================
// Error Result Type
// ============================================================================

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

export function success<T>(data: T): Result<T, never> {
  return { success: true, data }
}

export function failure<E extends Error>(error: E): Result<never, E> {
  return { success: false, error }
}

// ============================================================================
// Error Handler
// ============================================================================

export interface ErrorHandler {
  handle(error: Error): void
  canHandle(error: Error): boolean
}

export class DefaultErrorHandler implements ErrorHandler {
  canHandle(error: Error): boolean {
    return error instanceof SharedSystemError
  }

  handle(error: Error): void {
    if (error instanceof SharedSystemError) {
      console.error(`[${error.code}] ${error.message}`, error.details)
    } else {
      console.error(error)
    }
  }
}

// ============================================================================
// Error Collector
// ============================================================================

export class ErrorCollector {
  private errors: Error[] = []
  private warnings: { message: string; details?: any }[] = []

  addError(error: Error): void {
    this.errors.push(error)
  }

  addWarning(message: string, details?: any): void {
    this.warnings.push({ message, details })
  }

  hasErrors(): boolean {
    return this.errors.length > 0
  }

  hasWarnings(): boolean {
    return this.warnings.length > 0
  }

  getErrors(): Error[] {
    return [...this.errors]
  }

  getWarnings(): Array<{ message: string; details?: any }> {
    return [...this.warnings]
  }

  clear(): void {
    this.errors = []
    this.warnings = []
  }

  throw(): never {
    if (this.errors.length === 1) {
      throw this.errors[0]
    }
    throw new AggregateError(this.errors, "Multiple errors occurred")
  }
}

// ============================================================================
// AggregateError polyfill (if needed)
// ============================================================================

if (typeof AggregateError === "undefined") {
  (global as any).AggregateError = class AggregateError extends Error {
    constructor(
      public errors: Error[],
      message?: string
    ) {
      super(message || `${errors.length} errors occurred`)
      this.name = "AggregateError"
    }
  }
}
