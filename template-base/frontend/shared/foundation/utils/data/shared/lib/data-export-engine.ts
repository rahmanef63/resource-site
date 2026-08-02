/**
 * Dynamic Data Export Engine
 * Supports JSON and CSV export for all features
 */

import type {
  ExportFormat,
  ExportDataType,
  ExportProperty,
  ExportSchema,
  ExportRequest,
  CSVOptions,
  ParsedCSVData,
} from "../types/data-export-types"
import { z } from "zod"

// ============================================================================
// JSON Export Engine
// ============================================================================

export async function exportToJSON(
  data: any[],
  properties: ExportProperty[],
  dataType: ExportDataType,
  metadata: Partial<ExportSchema["metadata"]> = {}
): Promise<{
  schema: ExportSchema
  blob: Blob
  filename: string
}> {
  // Create export schema
  const schema: ExportSchema = {
    version: "1.0.0",
    format: "json",
    featureId: metadata.featureId || "unknown",
    featureName: metadata.featureName || "Unknown Feature",
    properties,
    metadata: {
      exportedAt: Date.now(),
      recordCount: data.length,
      dataType,
      ...metadata,
    },
  }

  // Format data based on properties
  const formattedData = data.map((item) => formatDataForExport(item, properties))

  // Create export payload
  const exportPayload = {
    schema,
    data: formattedData,
  }

  // Create blob
  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
    type: "application/json",
  })

  // Generate filename
  const timestamp = new Date().toISOString().split("T")[0]
  const filename = `${schema.featureId}_${dataType}_${timestamp}.json`

  return { schema, blob, filename }
}

// ============================================================================
// CSV Export Engine
// ============================================================================

export async function exportToCSV(
  data: any[],
  properties: ExportProperty[],
  dataType: ExportDataType,
  options: CSVOptions = {},
  metadata: Partial<ExportSchema["metadata"]> = {}
): Promise<{
  schema: ExportSchema
  blob: Blob
  filename: string
}> {
  const {
    delimiter = ",",
    includeHeaders = true,
    dateFormat = "yyyy-MM-dd HH:mm:ss",
    nullValue = "",
    booleanFormat = ["true", "false"],
    arrayDelimiter = ";",
  } = options

  // Create export schema
  const schema: ExportSchema = {
    version: "1.0.0",
    format: "csv",
    featureId: metadata.featureId || "unknown",
    featureName: metadata.featureName || "Unknown Feature",
    properties,
    metadata: {
      exportedAt: Date.now(),
      recordCount: data.length,
      dataType,
      ...metadata,
    },
  }

  // Flatten properties for CSV (handle nested objects)
  const flatProperties = flattenProperties(properties)

  // Generate headers
  const headers: string[] = []
  if (includeHeaders) {
    headers.push(...flatProperties.map((prop) => `"${prop.label}"`))
  }

  // Generate rows
  const rows: string[] = []
  for (const item of data) {
    const row: string[] = []

    for (const prop of flatProperties) {
      const value = getNestedValue(item, prop.key)
      const formattedValue = formatValueForCSV(
        value,
        prop,
        dateFormat,
        nullValue,
        booleanFormat,
        arrayDelimiter
      )
      row.push(formattedValue)
    }

    rows.push(row.join(delimiter))
  }

  // Combine headers and rows
  const csvContent = [headers.join(delimiter), ...rows].join("\n")

  // Create blob
  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8",
  })

  // Generate filename
  const timestamp = new Date().toISOString().split("T")[0]
  const filename = `${schema.featureId}_${dataType}_${timestamp}.csv`

  return { schema, blob, filename }
}

// ============================================================================
// Template Generation
// ============================================================================

export async function generateTemplate(
  properties: ExportProperty[],
  format: ExportFormat,
  featureId: string,
  featureName: string,
  sampleData?: any[]
): Promise<{
  blob: Blob
  filename: string
}> {
  // Generate sample data if not provided
  const data = sampleData || generateSampleData(properties, 3)

  if (format === "json") {
    const result = await exportToJSON(data, properties, "template", {
      featureId,
      featureName,
    })
    return { blob: result.blob, filename: result.filename }
  } else if (format === "csv") {
    const result = await exportToCSV(data, properties, "template", {}, {
      featureId,
      featureName,
    })
    return { blob: result.blob, filename: result.filename }
  }

  throw new Error(`Unsupported format: ${format}`)
}

// ============================================================================
// Import Parsing
// ============================================================================

export async function parseImportFile(
  file: File,
  format: ExportFormat
): Promise<{
  data: any[]
  metadata: any
}> {
  if (format === "json") {
    return parseJSONFile(file)
  } else if (format === "csv") {
    return parseCSVFile(file)
  }

  throw new Error(`Unsupported import format: ${format}`)
}

async function parseJSONFile(file: File): Promise<{ data: any[]; metadata: any }> {
  const text = await file.text()
  const parsed = JSON.parse(text)

  // Handle different JSON structures
  if (parsed.data && Array.isArray(parsed.data)) {
    // Export format with schema
    return {
      data: parsed.data,
      metadata: parsed.schema,
    }
  } else if (Array.isArray(parsed)) {
    // Simple array
    return {
      data: parsed,
      metadata: null,
    }
  } else {
    throw new Error("Invalid JSON format. Expected array or object with 'data' property.")
  }
}

async function parseCSVFile(file: File): Promise<{ data: any[]; metadata: ParsedCSVData }> {
  const text = await file.text()
  const lines = text.split("\n").filter((line) => line.trim())

  if (lines.length === 0) {
    throw new Error("CSV file is empty")
  }

  // Parse headers
  const headers = parseCSVLine(lines[0])
  const rows: string[][] = []
  let emptyRows = 0

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i])

    if (row.every((cell) => !cell.trim())) {
      emptyRows++
      continue
    }

    rows.push(row)
  }

  // Convert to objects
  const data = rows.map((row) => {
    const obj: any = {}
    headers.forEach((header, index) => {
      obj[header] = row[index] || ""
    })
    return obj
  })

  const metadata: ParsedCSVData = {
    headers,
    rows,
    metadata: {
      totalRows: rows.length,
      emptyRows,
      encoding: "utf-8",
    },
  }

  return { data, metadata }
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatDataForExport(item: any, properties: ExportProperty[]): any {
  const formatted: any = {}

  for (const prop of properties) {
    const value = getNestedValue(item, prop.key)

    if (prop.nested && prop.children) {
      formatted[prop.key] = formatDataForExport(value || {}, prop.children)
    } else {
      formatted[prop.key] = formatValue(value, prop)
    }
  }

  return formatted
}

function formatValue(value: any, property: ExportProperty): any {
  if (value === null || value === undefined) {
    return null
  }

  switch (property.type) {
    case "date":
      return new Date(value).toISOString()

    case "boolean":
      return Boolean(value)

    case "number":
      return Number(value)

    case "select":
    case "string":
      return String(value)

    case "multiselect":
    case "array":
      return Array.isArray(value) ? value : []

    case "object":
      return typeof value === "object" ? value : {}

    default:
      return value
  }
}

function formatValueForCSV(
  value: any,
  property: ExportProperty,
  dateFormat: string,
  nullValue: string,
  booleanFormat: [true: string, false: string],
  arrayDelimiter: string
): string {
  if (value === null || value === undefined) {
    return nullValue
  }

  switch (property.type) {
    case "date":
      const date = new Date(value)
      return formatDateTemplate(date, dateFormat)

    case "boolean":
      return value ? booleanFormat[0] : booleanFormat[1]

    case "number":
      return String(value)

    case "select":
    case "string":
      // Escape quotes and wrap in quotes if contains delimiter
      const str = String(value)
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str

    case "multiselect":
    case "array":
      if (!Array.isArray(value)) return nullValue
      return `"${value.map(String).join(arrayDelimiter)}"`

    case "object":
      return `"${JSON.stringify(value)}"`

    default:
      return String(value)
  }
}

function flattenProperties(
  properties: ExportProperty[],
  prefix = ""
): ExportProperty[] {
  const flat: ExportProperty[] = []

  for (const prop of properties) {
    const key = prefix ? `${prefix}.${prop.key}` : prop.key

    if (prop.nested && prop.children) {
      flat.push(...flattenProperties(prop.children, key))
    } else {
      flat.push({
        ...prop,
        key,
        label: prefix ? `${prefix} - ${prop.label}` : prop.label,
      })
    }
  }

  return flat
}

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null
  }, obj)
}

function generateSampleData(properties: ExportProperty[], count: number): any[] {
  const data: any[] = []

  for (let i = 0; i < count; i++) {
    const item: any = {}

    for (const prop of properties) {
      item[prop.key] = generateSampleValue(prop)
    }

    data.push(item)
  }

  return data
}

function generateSampleValue(property: ExportProperty): any {
  switch (property.type) {
    case "string":
      return `Sample ${property.label}`

    case "number":
      return Math.floor(Math.random() * 100)

    case "boolean":
      return Math.random() > 0.5

    case "date":
      return new Date().toISOString()

    case "select":
      return property.options?.[0] || "Option 1"

    case "multiselect":
    case "array":
      return property.options?.slice(0, 2) || ["Value 1", "Value 2"]

    case "object":
      return {}

    default:
      return null
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i += 2
        continue
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes
        i++
        continue
      }
    } else if (char === "," && !inQuotes) {
      // Field separator
      result.push(current.trim())
      current = ""
      i++
      continue
    } else {
      current += char
      i++
    }
  }

  // Add last field
  result.push(current.trim())

  return result
}

/**
 * Template-style date formatter (replaces yyyy/MM/dd/HH/mm/ss tokens).
 * Distinct from the Intl-based formatDate in `shared/foundation/utils/core/format`.
 */
function formatDateTemplate(date: Date, format: string): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const seconds = String(date.getSeconds()).padStart(2, "0")

  return format
    .replace("yyyy", String(year))
    .replace("MM", month)
    .replace("dd", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds)
}
