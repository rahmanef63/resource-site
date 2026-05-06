/**
 * Reusable Export Dialog Component
 * Provides export options for all features
 */

import React, { useState, useEffect } from "react"
import { useConvex } from "convex/react"
import { ResponsiveDialog } from "@/frontend/shared/ui"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, FileText, Table } from "lucide-react"
import type {
  ExportFormat,
  ExportDataType,
  ExportProperty,
  ExportOption,
  ExportDialogProps,
} from "../types/data-export-types"
import { exportToJSON, exportToCSV, generateTemplate } from "../lib/data-export-engine"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"

export function ExportDialog({
  featureId,
  isOpen,
  onClose,
  initialFormat = "json",
  allowFormatSelection = true,
  customOptions = {},
  selectedIds = [],
}: ExportDialogProps) {
  const convex = useConvex()
  const { workspaceId } = useWorkspaceContext()

  const [format, setFormat] = useState<ExportFormat>(initialFormat)
  const [dataType, setDataType] = useState<ExportDataType>(selectedIds.length ? "selected" : "current")
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [properties, setProperties] = useState<ExportProperty[]>([])
  const [recordCount, setRecordCount] = useState(0)
  const [selectedIdsState, setSelectedIdsState] = useState<string[]>(selectedIds)

  // Recommended fields for documents to avoid noisy exports
  const recommendedDocFields = React.useMemo(
    () => ["title", "content", "description", "tags", "isPublic", "category", "version", "lastModified", "_creationTime"],
    []
  )

  // Load export configuration for feature
  useEffect(() => {
    if (isOpen && featureId) {
      // Sync selected IDs when dialog opens
      setSelectedIdsState(selectedIds)
      setDataType(selectedIds.length ? "selected" : "current")
      loadExportConfig()
    }
  }, [isOpen, featureId, selectedIds])

  const loadExportConfig = async () => {
    try {
      // Get export configuration from registry
      const config = await getFeatureExportConfig(featureId)
      if (config) {
        const exportProps = await config.exportProperties()
        setProperties(exportProps)

        // Prefill recommended fields for documents to avoid exporting noise
        if (selectedProperties.length === 0 && featureId === "knowledge/docs") {
          const recommended = exportProps
            .filter(p => recommendedDocFields.includes(p.key))
            .map(p => p.key)
          setSelectedProperties(recommended.length ? recommended : exportProps.map(p => p.key))
        } else if (selectedProperties.length === 0) {
          setSelectedProperties(exportProps.map(p => p.key))
        }

        // Get record count
        if (dataType === "selected" && selectedIdsState.length) {
          setRecordCount(selectedIdsState.length)
        } else if (dataType === "current") {
          try {
            const data = await config.exportData({
              format,
              dataType: "current",
              workspaceId: workspaceId ? String(workspaceId) : undefined,
              convex,
            })
            setRecordCount(data.length)
          } catch {
            setRecordCount(0)
          }
        }
      }
    } catch (error) {
      console.error("Failed to load export config:", error)
    }
  }

  // Keep record count in sync when toggling scope
  useEffect(() => {
    if (!isOpen) return
    if (dataType === "selected") {
      setRecordCount(selectedIdsState.length)
    }
  }, [dataType, selectedIdsState, isOpen])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const config = await getFeatureExportConfig(featureId)
      if (!config) {
        throw new Error("Export configuration not found")
      }

      const effectiveDataType: ExportDataType =
        dataType === "selected" && selectedIdsState.length === 0
          ? "current"
          : dataType

      // Get data based on type
      let data: any[]
      if (effectiveDataType === "template") {
        data = [] // Template will be generated
      } else {
        if (!workspaceId) {
          throw new Error("Select a workspace to export data.")
        }
        data = await config.exportData({
          format,
          dataType: effectiveDataType,
          selectedIds: effectiveDataType === "selected" ? selectedIdsState : undefined,
          workspaceId: String(workspaceId),
          convex,
        })
      }

      // Filter selected properties
      const exportProperties = properties.filter(p =>
        selectedProperties.length === 0 || selectedProperties.includes(p.key)
      )

      let blob: Blob
      let filename: string

      if (effectiveDataType === "template") {
        // Generate template
        const result = await generateTemplate(
          exportProperties,
          format,
          featureId,
          config.featureName
        )
        blob = result.blob
        filename = result.filename
      } else {
        // Export actual data
        const result = format === "json"
          ? await exportToJSON(data, exportProperties, effectiveDataType, {
            featureId,
            featureName: config.featureName,
            workspaceId: workspaceId ? String(workspaceId) : undefined,
          })
          : await exportToCSV(data, exportProperties, effectiveDataType, customOptions, {
            featureId,
            featureName: config.featureName,
            workspaceId: workspaceId ? String(workspaceId) : undefined,
          })
        blob = result.blob
        filename = result.filename
      }

      // Download file
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      onClose()
    } catch (error) {
      console.error("Export failed:", error)
      // TODO: Show error toast
    } finally {
      setIsExporting(false)
    }
  }

  const toggleProperty = (propertyKey: string) => {
    setSelectedProperties(prev =>
      prev.includes(propertyKey)
        ? prev.filter(k => k !== propertyKey)
        : [...prev, propertyKey]
    )
  }

  const selectEssentials = () => {
    if (featureId === "knowledge/docs") {
      const essentials = properties
        .filter(p => recommendedDocFields.includes(p.key))
        .map(p => p.key)
      setSelectedProperties(essentials.length ? essentials : properties.map(p => p.key))
    } else {
      setSelectedProperties(properties.map(p => p.key))
    }
  }

  const getExportIcon = (format: ExportFormat) => {
    switch (format) {
      case "json":
        return <FileText className="h-4 w-4" />
      case "csv":
        return <Table className="h-4 w-4" />
      default:
        return <Download className="h-4 w-4" />
    }
  }

  const getFormatLabel = (format: ExportFormat) => {
    switch (format) {
      case "json":
        return "JSON (.json)"
      case "csv":
        return "CSV (.csv)"
      default:
        return format.toUpperCase()
    }
  }

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onClose} variant="modal" size="lg">
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>Export Data</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          Export data from {featureId} in various formats
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>

      <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
        <div className="space-y-6">
          {/* Format Selection */}
          {allowFormatSelection && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Export Format</Label>
              <Select value={format} onValueChange={(value: ExportFormat) => setFormat(value)}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {getExportIcon(format)}
                      {getFormatLabel(format)}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      JSON (.json) - Full data with schema
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <Table className="h-4 w-4" />
                      CSV (.csv) - Spreadsheet compatible
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Data Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Data to Export</Label>
            <RadioGroup value={dataType} onValueChange={(value: ExportDataType) => setDataType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="current" id="current" />
                <Label htmlFor="current" className="flex items-center justify-between w-full">
                  <span>All Current Data</span>
                  <Badge variant="secondary">{recordCount} records</Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="selected" id="selected" disabled={!selectedIdsState.length} />
                <Label htmlFor="selected" className="flex items-center justify-between w-full">
                  <span>Current Selection</span>
                  <Badge variant={selectedIdsState.length ? "outline" : "secondary"}>
                    {selectedIdsState.length ? `${selectedIdsState.length} selected` : "None"}
                  </Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="template" id="template" />
                <Label htmlFor="template">
                  Empty Template
                  <span className="text-muted-foreground ml-2">
                    - Sample data for import format
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Property Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Fields to Export</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectEssentials}
                >
                  Essentials
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProperties(
                    selectedProperties.length === properties.length
                      ? []
                      : properties.map(p => p.key)
                  )}
                >
                  {selectedProperties.length === properties.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {properties.map((property) => (
                <div key={property.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={property.key}
                    checked={selectedProperties.includes(property.key)}
                    onCheckedChange={() => toggleProperty(property.key)}
                  />
                  <Label
                    htmlFor={property.key}
                    className="text-sm cursor-pointer flex items-center gap-1"
                  >
                    {property.label}
                    {property.required && (
                      <span className="text-red-500 text-xs">*</span>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {property.type}
                    </Badge>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ResponsiveDialog.Body>

      <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
        <Button variant="outline" onClick={onClose} disabled={isExporting}>
          Cancel
        </Button>
        <Button onClick={handleExport} disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export {getFormatLabel(format)}
            </>
          )}
        </Button>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  )
}

// Helper function to get feature export config from registry
async function getFeatureExportConfig(featureId: string) {
  const { getFeatureExportConfig: getConfigFromRegistry } = await import(
    "../config/data-export-registry"
  )
  return getConfigFromRegistry(featureId)
}
