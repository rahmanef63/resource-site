/**
 * Dynamic Data Import Engine
 * Handles validation, transformation, and import of data for all features
 */

import type {
  ExportFormat,
  ExportProperty,
  ImportRequest,
  ImportResult,
  ImportError,
  ImportWarning,
  ParsedCSVData,
} from "../types/data-export-types"
import { parseImportFile } from "./data-export-engine"
import { z, ZodSchema } from "zod"

// ============================================================================
// Main Import Engine
// ============================================================================

export async function importData(
  request: ImportRequest,
  properties: ExportProperty[],
  existingData: any[] = [],
  options: {
    createValidationSchema?: (properties: ExportProperty[]) => ZodSchema
    validateDuplicates?: (data: any) => boolean
    transform?: (data: any, index: number) => any
    onSuccess?: (data: any, index: number) => void
    onError?: (error: ImportError, index: number) => void
  } = {}
): Promise<ImportResult> {
  const {
    createValidationSchema = createDefaultValidationSchema,
    validateDuplicates = () => false,
    transform = (data) => data,
    onSuccess,
    onError,
  } = options

  // Initialize result
  const result: ImportResult = {
    success: true,
    imported: 0,
    updated: 0,
    failed: 0,
    errors: [],
    warnings: [],
  }

  try {
    // Parse file
    const { data, metadata } = await parseImportFile(request.file, request.format)

    // Skip header row if requested (CSV)
    let startIndex = 0
    if (request.format === "csv" && request.options.skipFirstRow) {
      startIndex = 1
    }

    // Create validation schema
    const validationSchema = createValidationSchema(properties)

    // Process each row
    for (let i = startIndex; i < data.length; i++) {
      const row = data[i]
      const rowIndex = request.format === "csv" ? i : i + 1

      try {
        // Validate required fields
        const validationErrors = validateRow(row, properties, rowIndex)
        if (validationErrors.length > 0) {
          result.errors.push(...validationErrors)
          result.failed++
          onError?.(validationErrors[0], rowIndex)
          continue
        }

        // Transform and map fields
        let transformedData = transformRow(row, properties, request.options.fieldMapping)
        transformedData = transform(transformedData, rowIndex)

        // Validate with Zod schema
        try {
          validationSchema.parse(transformedData)
        } catch (error) {
          const zodErrors = formatZodErrors(error, rowIndex)
          result.errors.push(...zodErrors)
          result.failed++
          onError?.(zodErrors[0], rowIndex)
          continue
        }

        // Check for duplicates
        const isDuplicate = validateDuplicates(transformedData)
        if (isDuplicate) {
          if (request.options.updateExisting) {
            // Update existing record
            // TODO: Implement update logic based on feature
            result.updated++
          } else {
            result.warnings.push({
              row: rowIndex,
              message: "Duplicate record found and skipped",
              type: "format" as const,
            })
            result.failed++
            continue
          }
        } else if (request.options.createMissing) {
          // Create new record
          // TODO: Implement create logic based on feature
          result.imported++
          onSuccess?.(transformedData, rowIndex)
        }

      } catch (error) {
        result.errors.push({
          row: rowIndex,
          message: error instanceof Error ? error.message : String(error),
          type: "validation",
        })
        result.failed++
      }
    }

    // Check overall success
    result.success = result.failed === 0

    return result

  } catch (error) {
    return {
      success: false,
      imported: 0,
      updated: 0,
      failed: 0,
      errors: [{
        message: error instanceof Error ? error.message : String(error),
        type: "validation",
      }],
      warnings: [],
    }
  }
}

// ============================================================================
// Validation Functions
// ============================================================================

function validateRow(
  row: any,
  properties: ExportProperty[],
  rowIndex: number
): ImportError[] {
  const errors: ImportError[] = []

  for (const prop of properties) {
    const value = getNestedValue(row, prop.key)

    // Check required fields
    if (prop.required && (value === null || value === undefined || value === "")) {
      errors.push({
        row: rowIndex,
        field: prop.key,
        value,
        message: `Required field '${prop.label}' is missing`,
        type: "missing",
      })
      continue
    }

    // Type validation
    if (value !== null && value !== undefined && value !== "") {
      const typeError = validateType(value, prop, rowIndex)
      if (typeError) {
        errors.push(typeError)
      }
    }

    // Nested validation
    if (prop.nested && prop.children && typeof value === "object") {
      const nestedErrors = validateRow(value, prop.children, rowIndex)
      errors.push(...nestedErrors.map(e => ({
        ...e,
        field: e.field ? `${prop.key}.${e.field}` : prop.key,
      })))
    }
  }

  return errors
}

function validateType(
  value: any,
  property: ExportProperty,
  rowIndex: number
): ImportError | null {
  switch (property.type) {
    case "number":
      if (isNaN(Number(value))) {
        return {
          row: rowIndex,
          field: property.key,
          value,
          message: `Invalid number format: ${value}`,
          type: "format",
        }
      }
      break

    case "boolean":
      const boolValue = String(value).toLowerCase()
      if (!["true", "false", "1", "0", "yes", "no"].includes(boolValue)) {
        return {
          row: rowIndex,
          field: property.key,
          value,
          message: `Invalid boolean format: ${value}`,
          type: "format",
        }
      }
      break

    case "date":
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return {
          row: rowIndex,
          field: property.key,
          value,
          message: `Invalid date format: ${value}`,
          type: "format",
        }
      }
      break

    case "select":
      if (property.options && !property.options.includes(String(value))) {
        return {
          row: rowIndex,
          field: property.key,
          value,
          message: `Invalid option: ${value}. Allowed: ${property.options.join(", ")}`,
          type: "validation",
        }
      }
      break

    case "multiselect":
      if (Array.isArray(value)) {
        for (const item of value) {
          if (property.options && !property.options.includes(String(item))) {
            return {
              row: rowIndex,
              field: property.key,
              value: item,
              message: `Invalid option in array: ${item}`,
              type: "validation",
            }
          }
        }
      }
      break
  }

  return null
}

// ============================================================================
// Transformation Functions
// ============================================================================

function transformRow(
  row: any,
  properties: ExportProperty[],
  fieldMapping?: Record<string, string>
): any {
  const transformed: any = {}

  for (const prop of properties) {
    // Use field mapping if provided
    const sourceKey = fieldMapping?.[prop.key] || prop.key
    let value = getNestedValue(row, sourceKey)

    // Transform based on type
    value = transformValue(value, prop)

    // Set nested value
    setNestedValue(transformed, prop.key, value)
  }

  return transformed
}

function transformValue(value: any, property: ExportProperty): any {
  if (value === null || value === undefined || value === "") {
    return null
  }

  switch (property.type) {
    case "number":
      return Number(value)

    case "boolean":
      const boolValue = String(value).toLowerCase()
      return ["true", "1", "yes"].includes(boolValue)

    case "date":
      return new Date(value).getTime()

    case "select":
    case "string":
      return String(value)

    case "multiselect":
    case "array":
      if (typeof value === "string") {
        // Split by common delimiters
        return value.split(/[;,|]/).map(v => v.trim()).filter(Boolean)
      }
      return Array.isArray(value) ? value : [value]

    case "object":
      if (typeof value === "string") {
        try {
          return JSON.parse(value)
        } catch {
          return {}
        }
      }
      return typeof value === "object" ? value : {}

    default:
      return value
  }
}

// ============================================================================
// Zod Schema Creation
// ============================================================================

export function createDefaultValidationSchema(properties: ExportProperty[]): ZodSchema {
  const schemaShape: Record<string, ZodSchema> = {}

  for (const prop of properties) {
    let fieldSchema: ZodSchema

    switch (prop.type) {
      case "string":
        fieldSchema = z.string()
        break
      case "number":
        fieldSchema = z.number()
        break
      case "boolean":
        fieldSchema = z.boolean()
        break
      case "date":
        fieldSchema = z.date()
        break
      case "select":
        fieldSchema = z.enum([prop.options?.[0] || "default", ...(prop.options?.slice(1) || [])])
        break
      case "multiselect":
        fieldSchema = z.array(z.string())
        break
      case "array":
        fieldSchema = z.array(z.any())
        break
      case "object":
        fieldSchema = z.record(z.string(), z.any())
        break
      default:
        fieldSchema = z.any()
    }

    // Make optional if not required
    if (!prop.required) {
      fieldSchema = fieldSchema.optional().nullable()
    }

    schemaShape[prop.key] = fieldSchema
  }

  return z.object(schemaShape)
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatZodErrors(error: any, rowIndex: number): ImportError[] {
  if (error instanceof z.ZodError) {
    return error.issues.map(err => ({
      row: rowIndex,
      field: err.path.join("."),
      message: err.message,
      type: "validation" as const,
    }))
  }
  return [{
    row: rowIndex,
    message: error instanceof Error ? error.message : String(error),
    type: "validation" as const,
  }]
}

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null
  }, obj)
}

function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split(".")
  const lastKey = keys.pop()!

  let current = obj
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== "object") {
      current[key] = {}
    }
    current = current[key]
  }

  current[lastKey] = value
}

// ============================================================================
// Import Preview
// ============================================================================

export async function previewImport(
  file: File,
  format: ExportFormat,
  properties: ExportProperty[],
  maxRows: number = 10
): Promise<{
  data: any[]
  headers: string[]
  errors: ImportError[]
  warnings: ImportWarning[]
  totalRows: number
}> {
  try {
    const { data, metadata } = await parseImportFile(file, format)

    // Get headers
    const headers = format === "csv" && metadata
      ? (metadata as ParsedCSVData).headers
      : Object.keys(data[0] || {})

    // Limit preview rows
    const previewData = data.slice(0, maxRows)

    // Validate preview data
    const errors: ImportError[] = []
    const warnings: ImportWarning[] = []

    previewData.forEach((row, index) => {
      const rowIndex = index + 1
      const rowErrors = validateRow(row, properties, rowIndex)
      errors.push(...rowErrors)
    })

    return {
      data: previewData,
      headers,
      errors,
      warnings,
      totalRows: data.length,
    }
  } catch (error) {
    return {
      data: [],
      headers: [],
      errors: [{
        message: error instanceof Error ? error.message : String(error),
        type: "validation",
      }],
      warnings: [],
      totalRows: 0,
    }
  }
}

// Export functions that need to be available for external use
export { parseImportFile }
