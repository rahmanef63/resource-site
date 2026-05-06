"use client"

import * as React from "react"
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  FileJson,
  FileText,
  Loader2,
  RotateCcw,
  Sparkles,
  Upload,
} from "lucide-react"

import type { Id } from "@convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWorkspaceExportImport } from "@/frontend/shared/foundation/hooks/useWorkspaceExportImport"
import { cn } from "@/lib/utils"

import {
  downloadWorkspaceImportExample,
  downloadWorkspaceImportPrompt,
} from "./workspaceImportExample"

export interface ImportWorkspacePanelProps {
  className?: string
  onImported?: (workspaceId: Id<"workspaces">) => void
  actionLabel?: string
}

export function ImportWorkspacePanel({
  className,
  onImported,
  actionLabel = "Import workspace",
}: ImportWorkspacePanelProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [importName, setImportName] = React.useState("")

  const {
    isImporting,
    validationResult,
    error: importError,
    fileName: importFileName,
    importSummary,
    readFile,
    validateImportJson,
    importWorkspace: doImport,
    reset: resetImport,
  } = useWorkspaceExportImport()

  const handleFileChange = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const json = await readFile(file)
      validateImportJson(json)
    },
    [readFile, validateImportJson],
  )

  const handleImport = React.useCallback(async () => {
    try {
      const result = await doImport({
        overrideName: importName.trim() || undefined,
        importMembers: false,
      })
      if (result?.workspaceId) {
        onImported?.(result.workspaceId as Id<"workspaces">)
      }
    } catch {
      // error shown via importError state
    }
  }, [doImport, importName, onImported])

  const handleResetForAnother = React.useCallback(() => {
    resetImport()
    setImportName("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [resetImport])

  return (
    <div className={cn("mx-auto w-full max-w-xl space-y-4", className)}>
      {importSummary ? (
        <div className="space-y-3">
          <div className="space-y-1.5 rounded-lg border bg-green-50 p-3 dark:bg-green-950/20">
            <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Workspace imported successfully
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {importSummary.rolesCreated > 0 && (
                <span className="rounded border px-1.5 py-0.5">
                  {importSummary.rolesCreated} roles created
                </span>
              )}
              {importSummary.membersImported > 0 && (
                <span className="rounded border px-1.5 py-0.5">
                  {importSummary.membersImported} members
                </span>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleResetForAnother}>
            <RotateCcw className="h-3.5 w-3.5" />
            Import another
          </Button>
        </div>
      ) : (
        <>
          {!importFileName ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors hover:border-primary/50"
              >
                <Upload className="h-7 w-7 text-muted-foreground" />
                <p className="text-sm font-medium">Click to upload workspace JSON</p>
                <p className="text-xs text-muted-foreground">
                  Exported <code>.json</code> file from another SuperSpace workspace
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </button>
              <div className="flex flex-col items-center gap-2 pt-1 text-xs text-muted-foreground sm:flex-row sm:justify-center">
                <span>Don&apos;t have one yet? Let an AI draft it for you.</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline" size="sm" className="h-7 gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      Download starter
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-72">
                    <DropdownMenuItem
                      onSelect={() => downloadWorkspaceImportPrompt()}
                      className="flex-col items-start gap-1"
                    >
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="h-4 w-4" />
                        AI prompt + schema (.md)
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Ready-to-paste instructions wrapping the schema. Best starting point.
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => downloadWorkspaceImportExample()}
                      className="flex-col items-start gap-1"
                    >
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <FileJson className="h-4 w-4" />
                        JSON schema only (.json)
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Just the example document — includes the full feature list.
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
              <FileJson className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate text-sm">{importFileName}</span>
              <button
                type="button"
                onClick={handleResetForAnother}
                className="text-lg leading-none text-muted-foreground hover:text-foreground"
                aria-label="Remove file"
              >
                ×
              </button>
            </div>
          )}

          {validationResult &&
            (validationResult.errors.length > 0 ? (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <p className="mb-1 font-medium">Validation errors:</p>
                {validationResult.errors.map((e, i) => (
                  <div key={i}>• {e}</div>
                ))}
              </div>
            ) : (
              <div className="space-y-1.5 rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  {validationResult.preview?.workspaceName} — valid
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded border px-1.5 py-0.5">
                    {validationResult.preview?.workspaceType}
                  </span>
                  <span className="rounded border px-1.5 py-0.5">
                    {validationResult.preview?.rolesCount} roles
                  </span>
                </div>
              </div>
            ))}

          {validationResult?.valid && (
            <div className="space-y-1">
              <label className="block text-sm font-medium" htmlFor="import-workspace-name">
                Workspace name (optional)
              </label>
              <input
                id="import-workspace-name"
                type="text"
                value={importName}
                onChange={(e) => setImportName(e.target.value)}
                placeholder={validationResult.preview?.workspaceName ?? "Keep original name"}
                className="w-full rounded-xl border border-input/80 bg-background px-4 py-3 text-sm focus:border-ring focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          {importError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {importError}
            </div>
          )}

          <Button
            onClick={handleImport}
            disabled={!validationResult?.valid || isImporting}
            className="w-full gap-2 sm:w-auto"
          >
            {isImporting && <Loader2 className="h-4 w-4 animate-spin" />}
            {actionLabel}
          </Button>
        </>
      )}
    </div>
  )
}
