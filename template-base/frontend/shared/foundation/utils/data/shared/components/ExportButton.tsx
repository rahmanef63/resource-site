/**
 * Export Button Component
 * Triggers export dialog for a feature
 */

import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Download, MoreVertical } from "lucide-react"
import type { ExportButtonProps } from "@/frontend/shared/foundation/utils/data/shared"
import { useState } from "react"
import { ExportDialog } from "./ExportDialog"

export function ExportButton({
  featureId,
  variant = "default",
  size = "default",
  showOptions = true,
  disabled = false,
  className,
}: ExportButtonProps) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<"json" | "csv">("json")

  const handleExport = (format: "json" | "csv") => {
    setSelectedFormat(format)
    setIsExportDialogOpen(true)
  }

  if (!showOptions) {
    return (
      <>
        <Button
          variant={variant}
          size={size}
          disabled={disabled}
          onClick={() => handleExport(selectedFormat)}
          className={className}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <ExportDialog
          featureId={featureId}
          isOpen={isExportDialogOpen}
          onClose={() => setIsExportDialogOpen(false)}
          initialFormat={selectedFormat}
          allowFormatSelection={false}
        />
      </>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} disabled={disabled} className={className}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExport("json")}>
            <div className="flex items-center justify-between w-full">
              <span>Export as JSON</span>
              <Badge variant="outline" className="ml-2">
                Full Data
              </Badge>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("csv")}>
            <div className="flex items-center justify-between w-full">
              <span>Export as CSV</span>
              <Badge variant="outline" className="ml-2">
                Spreadsheet
              </Badge>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleExport("json")}>
            Download JSON Template
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("csv")}>
            Download CSV Template
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ExportDialog
        featureId={featureId}
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        initialFormat={selectedFormat}
        allowFormatSelection={true}
      />
    </>
  )
}
