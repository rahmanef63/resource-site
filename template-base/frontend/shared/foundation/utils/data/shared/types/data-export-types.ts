/**
 * Dynamic Data Export/Import Types
 * For all features in SuperSpace
 */

// ============================================================================
// Core Types
// ============================================================================

export type ExportFormat = "json" | "csv" | "xlsx" | "markdown" | "toon"

export type ExportDataType = "current" | "selected" | "template"

export interface ExportOption {
  id: string
  label: string
  description?: string
  icon?: string
  disabled?: boolean
  disabledReason?: string
}

export interface ExportProperty {
  key: string
  label: string
  type: "string" | "number" | "boolean" | "date" | "select" | "multiselect" | "object" | "array"
  required?: boolean
  options?: string[] // For select/multiselect types
  format?: string // For date formatting
  nested?: boolean // For object/array types
  children?: ExportProperty[] // For nested properties
}

export interface ExportSchema {
  version: string
  format: ExportFormat
  featureId: string
  featureName: string
  properties: ExportProperty[]
  metadata: {
    exportedAt: number
    exportedBy?: string
    workspaceId?: string
    recordCount: number
    dataType: ExportDataType
    featureId?: string
    featureName?: string
  }
}


export interface ExportRequest {
  format: ExportFormat
  dataType: ExportDataType
  selectedIds?: string[]
  filters?: Record<string, any>
  sortBy?: string
  sortOrder?: "asc" | "desc"
  /** Optional workspace context for Convex-backed exports */
  workspaceId?: string
  /** Optional Convex client (e.g. from useConvex) for running queries/mutations */
  convex?: any
}

export interface ImportRequest {
  format: ExportFormat
  file: File
  options: {
    skipFirstRow?: boolean // For CSV
    updateExisting?: boolean
    createMissing?: boolean
    fieldMapping?: Record<string, string> // Map columns to properties
  }
  /** Optional workspace context for Convex-backed imports */
  workspaceId?: string
  /** Optional Convex client (e.g. from useConvex) for running queries/mutations */
  convex?: any
}

// ============================================================================
// Registry Types
// ============================================================================

export interface FeatureExportConfig {
  featureId: string
  featureName: string
  exportProperties: () => Promise<ExportProperty[]> | ExportProperty[]
  exportData: (request: ExportRequest) => Promise<any[]>
  importData: (request: ImportRequest) => Promise<ImportResult>
  templates: {
    [key: string]: {
      name: string
      description: string
      sampleData: any[]
    }
  }
}

export interface ImportResult {
  success: boolean
  imported: number
  updated: number
  failed: number
  errors: ImportError[]
  warnings: ImportWarning[]
}

export interface ImportError {
  row?: number
  field?: string
  value?: any
  message: string
  type: "validation" | "permission" | "duplicate" | "missing" | "format"
}

export interface ImportWarning {
  row?: number
  field?: string
  value?: any
  message: string
  type: "format" | "empty" | "truncated"
}

// ============================================================================
// CSV Specific Types
// ============================================================================

export interface CSVOptions {
  delimiter?: string
  encoding?: string
  includeHeaders?: boolean
  dateFormat?: string
  nullValue?: string
  booleanFormat?: [true: string, false: string]
  arrayDelimiter?: string
}

export interface ParsedCSVData {
  headers: string[]
  rows: string[][]
  metadata: {
    totalRows: number
    emptyRows: number
    encoding: string
  }
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface ExportDialogProps {
  featureId: string
  isOpen: boolean
  onClose: () => void
  initialFormat?: ExportFormat
  allowFormatSelection?: boolean
  customOptions?: Record<string, any>
  /** Preselected IDs to export (used to scope to the current/open items) */
  selectedIds?: string[]
}

export interface ImportDialogProps {
  featureId: string
  isOpen: boolean
  onClose: () => void
  onImportComplete?: (result: ImportResult) => void
  allowedFormats?: ExportFormat[]
  maxFileSize?: number // In bytes
}

export interface ExportButtonProps {
  featureId: string
  variant?: "default" | "outline" | "ghost" | "destructive"
  size?: "sm" | "default" | "lg"
  showOptions?: boolean
  disabled?: boolean
  className?: string
}

// ============================================================================
// Context Types
// ============================================================================

export interface ExportImportContextValue {
  isExporting: boolean
  isImporting: boolean
  exportProgress: number
  importProgress: number
  lastExportResult?: any
  lastImportResult?: ImportResult
  errors: string[]
  warnings: string[]

  // Actions
  exportData: (featureId: string, request: ExportRequest) => Promise<void>
  importData: (featureId: string, request: ImportRequest) => Promise<void>
  clearErrors: () => void
  clearWarnings: () => void
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseExportImportReturn {
  // State
  isExporting: boolean
  isImporting: boolean
  exportProgress: number
  importProgress: number
  errors: string[]
  warnings: string[]

  // Data
  exportOptions: ExportOption[]
  importFormats: ExportFormat[]

  // Actions
  generateTemplate: (featureId: string, format: ExportFormat) => Promise<void>
  exportCurrentData: (featureId: string, format: ExportFormat, selectedIds?: string[]) => Promise<void>
  exportSelectedData: (featureId: string, format: ExportFormat, selectedIds: string[]) => Promise<void>
  importFromFile: (featureId: string, file: File, options: any) => Promise<ImportResult>

  // Utilities
  getExportProperties: (featureId: string) => Promise<ExportProperty[]>
  validateImportFile: (featureId: string, file: File) => Promise<boolean>
}
