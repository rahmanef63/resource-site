/**
 * Error Handler
 * Centralized error handling with custom handlers
 */

import {
  SharedSystemError,
  ValidationError,
  RegistryError,
  ImportError,
  ExportError,
  NodeError,
  GroupingError,
  MigrationError,
  IntegrationError,
  type ErrorHandler,
  DefaultErrorHandler,
} from "../../types"
import { ConversionError } from "../../types/errors"

export class ErrorHandlerManager {
  private handlers: ErrorHandler[] = []
  private defaultHandler: ErrorHandler

  constructor() {
    this.defaultHandler = new DefaultErrorHandler()
  }

  /**
   * Register custom error handler
   */
  register(handler: ErrorHandler): void {
    this.handlers.push(handler)
  }

  /**
   * Unregister error handler
   */
  unregister(handler: ErrorHandler): void {
    const index = this.handlers.indexOf(handler)
    if (index > -1) {
      this.handlers.splice(index, 1)
    }
  }

  /**
   * Handle error with registered handlers
   */
  handle(error: Error): void {
    // Try custom handlers first
    for (const handler of this.handlers) {
      if (handler.canHandle(error)) {
        handler.handle(error)
        return
      }
    }

    // Fall back to default handler
    this.defaultHandler.handle(error)
  }

  /**
   * Wrap function with error handling
   */
  wrap<T extends (...args: any[]) => any>(fn: T): T {
    return ((...args: any[]) => {
      try {
        const result = fn(...args)
        // Handle async functions
        if (result instanceof Promise) {
          return result.catch((error) => {
            this.handle(error)
            throw error
          })
        }
        return result
      } catch (error) {
        this.handle(error instanceof Error ? error : new Error(String(error)))
        throw error
      }
    }) as T
  }

  /**
   * Clear all handlers
   */
  clear(): void {
    this.handlers = []
  }
}

// ============================================================================
// Specialized Error Handlers
// ============================================================================

export class ValidationErrorHandler implements ErrorHandler {
  canHandle(error: Error): boolean {
    return error instanceof ValidationError
  }

  handle(error: Error): void {
    if (error instanceof ValidationError) {
      console.error(`❌ Validation Error: ${error.message}`)
      if (error.details) {
        console.error("Details:", error.details)
      }
    }
  }
}

export class RegistryErrorHandler implements ErrorHandler {
  canHandle(error: Error): boolean {
    return error instanceof RegistryError
  }

  handle(error: Error): void {
    if (error instanceof RegistryError) {
      console.error(`📦 Registry Error: ${error.message}`)
      if (error.details) {
        console.error("Details:", error.details)
      }
    }
  }
}

export class ConversionErrorHandler implements ErrorHandler {
  canHandle(error: Error): boolean {
    return error instanceof ConversionError
  }

  handle(error: Error): void {
    if (error instanceof ConversionError) {
      console.error(`🔄 Conversion Error: ${error.message}`)
      if (error.details) {
        console.error("Details:", error.details)
      }
    }
  }
}

export class ImportExportErrorHandler implements ErrorHandler {
  canHandle(error: Error): boolean {
    return error instanceof ImportError || error instanceof ExportError
  }

  handle(error: Error): void {
    if (error instanceof ImportError) {
      console.error(`📥 Import Error: ${error.message}`)
      if (error.details) {
        console.error("Details:", error.details)
      }
    } else if (error instanceof ExportError) {
      console.error(`📤 Export Error: ${error.message}`)
      if (error.details) {
        console.error("Details:", error.details)
      }
    }
  }
}

// ============================================================================
// Global Error Handler
// ============================================================================

let globalErrorHandler: ErrorHandlerManager | null = null

export function getGlobalErrorHandler(): ErrorHandlerManager {
  if (!globalErrorHandler) {
    globalErrorHandler = new ErrorHandlerManager()

    // Register default specialized handlers
    globalErrorHandler.register(new ValidationErrorHandler())
    globalErrorHandler.register(new RegistryErrorHandler())
    globalErrorHandler.register(new ConversionErrorHandler())
    globalErrorHandler.register(new ImportExportErrorHandler())
  }
  return globalErrorHandler
}

export function setGlobalErrorHandler(handler: ErrorHandlerManager): void {
  globalErrorHandler = handler
}

export function handleError(error: Error): void {
  getGlobalErrorHandler().handle(error)
}

// ============================================================================
// Error Boundary Helper (for React)
// ============================================================================

export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export function createErrorBoundaryState(): ErrorBoundaryState {
  return {
    hasError: false,
    error: undefined,
  }
}

export function handleErrorBoundary(
  error: Error,
  errorInfo: any
): ErrorBoundaryState {
  handleError(error)
  console.error("Error boundary caught:", error, errorInfo)

  return {
    hasError: true,
    error,
  }
}
