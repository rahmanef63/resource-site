/**
 * Reusable Import Dialog Component
 * Provides import functionality for all features
 */

import React, { useState, useCallback, useRef } from "react"
import { useConvex } from "convex/react"
import { ResponsiveDialog } from "@/frontend/shared/ui"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Loader2,
  Upload,
  FileText,
  Table as TableIcon,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Eye,
  Download,
} from "lucide-react"
import type {
  ExportFormat,
  ImportDialogProps,
  ImportResult,
  ExportProperty,
} from "@/frontend/shared/foundation/utils/data/shared"
import { previewImport } from "@/frontend/shared/foundation/utils/data/shared"
import { generateTemplate } from "@/frontend/shared/foundation/utils/data/shared"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"

export function ImportDialog({
  featureId,
  isOpen,
  onClose,
  onImportComplete,
  allowedFormats = ["json", "csv"],
  maxFileSize = 10 * 1024 * 1024, // 10MB
}: ImportDialogProps) {
  const convex = useConvex()
  const { workspaceId } = useWorkspaceContext()

  const [file, setFile] = useState<File | null>(null)
  const [format, setFormat] = useState<ExportFormat | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [options, setOptions] = useState({
    skipFirstRow: true,
    updateExisting: false,
    createMissing: true,
  })
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({})
  const [properties, setProperties] = useState<ExportProperty[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      // Check file size
      if (selectedFile.size > maxFileSize) {
        alert(`File size exceeds ${maxFileSize / (1024 * 1024)}MB limit`)
        return
      }

      // Detect format from extension
      const extension = selectedFile.name.split(".").pop()?.toLowerCase()
      const detectedFormat = extension === "json" ? "json" : extension === "csv" ? "csv" : null

      if (!detectedFormat || !allowedFormats.includes(detectedFormat)) {
        alert(`Unsupported file format. Allowed formats: ${allowedFormats.join(", ")}`)
        return
      }

      setFile(selectedFile)
      setFormat(detectedFormat)
      setPreview(null)
      setImportResult(null)
    }
  }, [allowedFormats, maxFileSize])

  const handlePreview = async () => {
    if (!file || !format) return

    setIsUploading(true)
    try {
      // Get feature properties
      const config = await getFeatureExportConfig(featureId)
      if (!config) {
        throw new Error("Feature configuration not found")
      }

      const featureProperties = await config.exportProperties()
      setProperties(featureProperties)

      // Preview import
      const result = await previewImport(file, format, featureProperties)
      setPreview(result)

      // Initialize field mapping
      const mapping: Record<string, string> = {}
      result.headers.forEach((header: string) => {
        const matchingProp = featureProperties.find(p =>
          p.label.toLowerCase() === header.toLowerCase() ||
          p.key.toLowerCase() === header.toLowerCase()
        )
        if (matchingProp) {
          mapping[header] = matchingProp.key
        }
      })
      setFieldMapping(mapping)
    } catch (error) {
      console.error("Preview failed:", error)
      alert(error instanceof Error ? error.message : "Preview failed")
    } finally {
      setIsUploading(false)
    }
  }

  const handleImport = async () => {
    if (!file || !format) return

    setIsImporting(true)
    try {
      const config = await getFeatureExportConfig(featureId)
      if (!config) {
        throw new Error("Feature configuration not found")
      }

      if (!workspaceId) {
        throw new Error("Select a workspace to import data.")
      }

      // Feature-specific import (should write to Convex)
      const result = await config.importData({
        format,
        file,
        options: {
          ...options,
          fieldMapping,
        },
        workspaceId: String(workspaceId),
        convex,
      })

      setImportResult(result)
      onImportComplete?.(result)

      if (result.success) {
        // Auto-close after successful import
        setTimeout(() => onClose(), 2000)
      }
    } catch (error) {
      console.error("Import failed:", error)
      alert(error instanceof Error ? error.message : "Import failed")
    } finally {
      setIsImporting(false)
    }
  }

  const handleDownloadTemplate = async (templateFormat: ExportFormat) => {
    const config = await getFeatureExportConfig(featureId)
    if (!config) return

    const featureProperties = await config.exportProperties()
    const { blob, filename } = await generateTemplate(
      featureProperties,
      templateFormat,
      featureId,
      config.featureName
    )

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const reset = () => {
    setFile(null)
    setFormat(null)
    setPreview(null)
    setImportResult(null)
    setFieldMapping({})
    setOptions({
      skipFirstRow: true,
      updateExisting: false,
      createMissing: true,
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={handleClose} variant="modal" size="xl">
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>Import Data</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          Import data into {featureId} from {allowedFormats.join(" or ")} files
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>

      <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
        <div className="space-y-4">
          {!preview ? (
            <>
              {/* File Upload */}
              <div className="space-y-2">
                <Label>Select File</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={allowedFormats.map(f => `.${f}`).join(",")}
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {file ? file.name : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {allowedFormats.join(", ")} up to {maxFileSize / (1024 * 1024)}MB
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Template Download */}
              <div className="flex flex-col gap-2">
                <Label>Don't have a file? Download a template:</Label>
                <div className="flex gap-2">
                  {allowedFormats.includes("json") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadTemplate("json")}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      JSON Template
                    </Button>
                  )}
                  {allowedFormats.includes("csv") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadTemplate("csv")}
                    >
                      <TableIcon className="h-4 w-4 mr-2" />
                      CSV Template
                    </Button>
                  )}
                </div>
              </div>

              {file && format && (
                <>
                  <Separator />
                  <Button
                    onClick={handlePreview}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Preview Import
                      </>
                    )}
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              {/* Import Options */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {format === "csv" && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="skipFirstRow"
                        checked={options.skipFirstRow}
                        onCheckedChange={(checked) =>
                          setOptions(prev => ({ ...prev, skipFirstRow: !!checked }))
                        }
                      />
                      <Label htmlFor="skipFirstRow">Skip first row (headers)</Label>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="updateExisting"
                      checked={options.updateExisting}
                      onCheckedChange={(checked) =>
                        setOptions(prev => ({ ...prev, updateExisting: !!checked }))
                      }
                    />
                    <Label htmlFor="updateExisting">Update existing records</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="createMissing"
                      checked={options.createMissing}
                      onCheckedChange={(checked) =>
                        setOptions(prev => ({ ...prev, createMissing: !!checked }))
                      }
                    />
                    <Label htmlFor="createMissing">Create new records</Label>
                  </div>
                </div>

                {/* Field Mapping */}
                {preview.headers.length > 0 && (
                  <div className="space-y-2">
                    <Label>Field Mapping</Label>
                    <ScrollArea className="h-48 rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>File Column</TableHead>
                            <TableHead>Map To Field</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {preview.headers.map((header: string) => (
                            <TableRow key={header}>
                              <TableCell className="font-medium">{header}</TableCell>
                              <TableCell>
                                <Select
                                  value={fieldMapping[header] || "__skip__"}
                                  onValueChange={(value) =>
                                    setFieldMapping(prev => ({ ...prev, [header]: value === "__skip__" ? "" : value }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select field..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="__skip__">-- Skip --</SelectItem>
                                    {properties.map((prop) => (
                                      <SelectItem key={prop.key} value={prop.key}>
                                        {prop.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                )}

                {/* Preview Data */}
                <div className="space-y-2">
                  <Label>Preview Data (First 10 rows)</Label>
                  <ScrollArea className="h-48 rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {preview.headers.map((header: string) => (
                            <TableHead key={header}>{header}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preview.data.map((row: any, index: number) => (
                          <TableRow key={index}>
                            {preview.headers.map((header: string) => (
                              <TableCell key={header}>
                                {String(row[header] || "")}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>

                {/* Validation Summary */}
                {(preview.errors.length > 0 || preview.warnings.length > 0) && (
                  <Alert>
                    {preview.errors.length > 0 ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      <div className="space-y-1">
                        <p>
                          Found {preview.errors.length} errors and {preview.warnings.length} warnings
                        </p>
                        {preview.errors.length > 0 && (
                          <p className="text-sm font-medium text-destructive">
                            Please fix errors before importing
                          </p>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          )}

          {/* Import Result */}
          {importResult && (
            <div className="space-y-4">
              <Alert>
                {importResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">
                      {importResult.success ? "Import completed successfully!" : "Import completed with errors"}
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Imported:</span> {importResult.imported}
                      </div>
                      <div>
                        <span className="font-medium">Updated:</span> {importResult.updated}
                      </div>
                      <div>
                        <span className="font-medium">Failed:</span> {importResult.failed}
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </ResponsiveDialog.Body>

      <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
        {!preview ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              {file && format && (
                <Button onClick={handlePreview} disabled={isUploading}>
                  {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="mr-2 h-4 w-4" />
                  )}
                  Preview
                </Button>
              )}
            </>
          ) : (
            <>
              {!importResult && (
                <Button variant="outline" onClick={reset}>
                  Back
                </Button>
              )}
              <Button
                onClick={handleImport}
                disabled={
                  isImporting ||
                  (preview.errors.length > 0) ||
                  (!importResult && false)
                }
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                    {importResult && <Progress value={100} className="ml-2 w-20" />}
                  </>
                ) : importResult ? (
                  "Close"
                ) : (
                  "Import Data"
                )}
              </Button>
            </>
          )}
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  )
}

// Helper function to get feature export config from registry
async function getFeatureExportConfig(featureId: string) {
  const { getFeatureExportConfig: getConfigFromRegistry } = await import(
    "@/frontend/shared/foundation/utils/data/shared/config/data-export-registry"
  )
  return getConfigFromRegistry(featureId)
}
