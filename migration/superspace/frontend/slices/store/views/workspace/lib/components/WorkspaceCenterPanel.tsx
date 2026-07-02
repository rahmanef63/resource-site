/**
 * Workspace Center Panel Component
 *
 * Dynamic content panel based on selected mode (inspector, features, available, settings, import)
 */

"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Check, Sliders, Upload, FileJson, AlertCircle, CheckCircle2, Loader2, Download, RotateCcw, LayoutTemplate } from "lucide-react"
import { ContainerHeader } from "@/frontend/shared/ui/layout/header"
import { PanelSection } from "@/frontend/shared/ui/layout/container/three-column"
import { FeatureListPanel } from "@/frontend/shared/preview"
import { FeatureSettingsListPanel } from "@/frontend/shared/settings/components/FeatureSettingsListPanel"
import { WorkspaceInspector, SaveAsTemplateDialog } from "../../components"
import { WorkspacePanelTabs } from "./WorkspacePanelTabs"
import { WorkspaceTemplateCard } from "./WorkspaceTemplateCard"
import { IndustryTemplatesPanel } from "./IndustryTemplatesPanel"
import { getPanelTitle, getPanelSubtitle, getPanelIcon, type PanelMode, type PanelContext } from "@/lib/utils/panel-config"
import { getAvailableTemplates, type WorkspaceTemplate } from "@/lib/utils/workspace-store"
import { useWorkspaceExportImport } from "@/frontend/shared/foundation/hooks/useWorkspaceExportImport"
import type { WorkspaceStoreItem } from "../../types"
import type { FeaturePreviewConfig } from "@/frontend/shared/preview"
import type { Id } from "@/convex/_generated/dataModel"

export interface WorkspaceCenterPanelProps {
    mode: PanelMode
    selectedWorkspace: WorkspaceStoreItem | null
    featurePreviews: FeaturePreviewConfig[]
    selectedFeatureId: string | null
    previewVisible: boolean
    selectedSettingsSlug: string | null
    settingsVisible: boolean
    workspaceMenuItems?: Array<{ slug: string; name: string; isVisible: boolean }>
    isLoadingPreviews: boolean
    onModeChange: (mode: PanelMode) => void
    onTogglePreview: (featureId: string) => void
    onToggleSettings: (featureSlug: string, featureName?: string) => void
    onInspectorUpdate: (workspaceId: string, data: Partial<WorkspaceStoreItem>) => Promise<void>
    onShowFeatures: () => void
    onUseTemplate: (template: WorkspaceTemplate) => void
}

export function WorkspaceCenterPanel({
    mode,
    selectedWorkspace,
    featurePreviews,
    selectedFeatureId,
    previewVisible,
    selectedSettingsSlug,
    settingsVisible,
    workspaceMenuItems,
    isLoadingPreviews,
    onModeChange,
    onTogglePreview,
    onToggleSettings,
    onInspectorUpdate,
    onShowFeatures,
    onUseTemplate,
}: WorkspaceCenterPanelProps) {
    const templates = getAvailableTemplates()

    const context: PanelContext = {
        selectedWorkspace,
        featureCount: featurePreviews.length,
        templateCount: templates.length
    }

    const title = getPanelTitle(mode)
    const subtitle = getPanelSubtitle(mode, context)
    const Icon = getPanelIcon(mode)

    // Export/Import hook — scoped to selected workspace for export
    const {
        isExporting,
        isImporting,
        validationResult,
        error: importError,
        fileName: importFileName,
        importSummary,
        readFile,
        validateImportJson,
        importWorkspace: doImport,
        exportWorkspace,
        reset: resetImport,
    } = useWorkspaceExportImport(selectedWorkspace?.id as Id<"workspaces"> | undefined)

    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const [importName, setImportName] = React.useState("")
    const [saveTemplateOpen, setSaveTemplateOpen] = React.useState(false)

    const handleFileChange = React.useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const json = await readFile(file)
        validateImportJson(json)
    }, [readFile, validateImportJson])

    const handleDoImport = React.useCallback(async () => {
        await doImport({
            overrideName: importName.trim() || undefined,
            importMembers: false,
        })
    }, [doImport, importName])

    const handleResetImport = React.useCallback(() => {
        resetImport()
        setImportName("")
        if (fileInputRef.current) fileInputRef.current.value = ""
    }, [resetImport])

    return (
        <PanelSection label={title}>
            <PanelSection.Header className="hidden md:block">
                <ContainerHeader
                    title={title}
                    subtitle={subtitle}
                    icon={Icon}
                />
                <WorkspacePanelTabs
                    mode={mode}
                    onModeChange={onModeChange}
                    selectedWorkspace={selectedWorkspace}
                />
            </PanelSection.Header>

            <PanelSection.Items>
                {/* Inspector Tab */}
                {mode === "inspector" && (
                    <div className="p-4">
                        {selectedWorkspace && (
                            <div className="mb-3 flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSaveTemplateOpen(true)}
                                    className="gap-1.5 text-xs"
                                >
                                    <LayoutTemplate className="h-3.5 w-3.5" />
                                    Save as Template
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => exportWorkspace()}
                                    disabled={isExporting}
                                    className="gap-1.5 text-xs"
                                >
                                    {isExporting
                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        : <Download className="h-3.5 w-3.5" />
                                    }
                                    Export JSON
                                </Button>
                            </div>
                        )}
                        <WorkspaceInspector
                            workspace={selectedWorkspace}
                            onUpdate={onInspectorUpdate}
                            onShowFeatures={onShowFeatures}
                        />
                        {selectedWorkspace && (
                            <SaveAsTemplateDialog
                                open={saveTemplateOpen}
                                onOpenChange={setSaveTemplateOpen}
                                workspaceId={selectedWorkspace.id as Id<"workspaces">}
                                workspaceName={selectedWorkspace.name}
                            />
                        )}
                    </div>
                )}

                {/* Features Tab */}
                {mode === "features" && (
                    <div className="p-3 md:p-0">
                        <FeatureListPanel
                            features={featurePreviews}
                            selectedFeatureId={selectedFeatureId}
                            onTogglePreview={onTogglePreview}
                            previewVisibleFor={previewVisible ? selectedFeatureId : null}
                            isLoading={isLoadingPreviews}
                            hideHeader
                        />
                    </div>
                )}

                {/* Available Templates Tab */}
                {mode === "available" && (
                    <div className="p-3 md:p-4">
                        {templates.length > 0 ? (
                            <div className="grid gap-3 md:gap-4 grid-cols-1">
                                {templates.map((template) => (
                                    <WorkspaceTemplateCard
                                        key={template.id}
                                        template={template}
                                        onUseTemplate={onUseTemplate}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center px-4">
                                <Check className="mx-auto mb-4 h-12 w-12 text-green-500" />
                                <h3 className="mb-2 text-lg font-semibold">All Templates Used</h3>
                                <p className="text-muted-foreground text-sm">
                                    You have used all available workspace templates.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Industry Templates Tab */}
                {mode === "industry-templates" && (
                    <IndustryTemplatesPanel selectedWorkspace={selectedWorkspace} />
                )}

                {/* Settings Tab */}
                {mode === "settings" && (
                    <div className="h-full">
                        {selectedWorkspace ? (
                            <div className="p-3 md:p-0">
                                <FeatureSettingsListPanel
                                    menuItems={workspaceMenuItems as any[] ?? []}
                                    onToggleSettings={onToggleSettings}
                                    activeSettingsSlug={settingsVisible ? selectedSettingsSlug : null}
                                    searchable
                                    showCounts
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-4 md:p-8 text-center animate-in fade-in-50 duration-500">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-muted/50 flex items-center justify-center mb-4 md:mb-6 ring-1 ring-border/50">
                                    <Sliders className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground/50" />
                                </div>
                                <h3 className="font-semibold text-lg md:text-xl tracking-tight mb-2">Select a Workspace</h3>
                                <p className="text-muted-foreground max-w-xs text-xs md:text-sm leading-relaxed">
                                    Choose a workspace from the tree to view and configure its feature settings.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Import Tab */}
                {mode === "import" && (
                    <div className="p-4 space-y-4">
                        {importSummary ? (
                            /* Success state */
                            <div className="space-y-4">
                                <div className="rounded-lg border bg-green-50 dark:bg-green-950/20 p-4 space-y-2">
                                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium">
                                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                                        Workspace imported successfully
                                    </div>
                                    <div className="flex gap-2 flex-wrap text-xs text-muted-foreground">
                                        {importSummary.rolesCreated > 0 && (
                                            <span className="rounded border px-1.5 py-0.5">{importSummary.rolesCreated} roles created</span>
                                        )}
                                        {importSummary.membersImported > 0 && (
                                            <span className="rounded border px-1.5 py-0.5">{importSummary.membersImported} members imported</span>
                                        )}
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleResetImport} className="gap-1.5">
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Import another
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <h3 className="font-semibold text-sm">Import Workspace</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Upload a workspace export JSON to restore or clone a workspace.
                                    </p>
                                </div>

                                {/* File upload */}
                                {!importFileName ? (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer hover:border-primary/50 transition-colors"
                                    >
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                        <p className="text-sm font-medium">Click to upload workspace JSON</p>
                                        <p className="text-xs text-muted-foreground">Export file from another workspace</p>
                                        {/* @dod:skip-primitive reason="workspace-store install panel reads workspace JSON manifest client-side to preview workspace before install; not a Convex storage upload" */}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".json"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
                                        <FileJson className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span className="text-sm flex-1 truncate">{importFileName}</span>
                                        <button onClick={handleResetImport} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
                                    </div>
                                )}

                                {/* Validation result */}
                                {validationResult && (
                                    validationResult.errors.length > 0 ? (
                                        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                                            <p className="font-medium mb-1">Validation errors:</p>
                                            {validationResult.errors.map((e, i) => <div key={i}>• {e}</div>)}
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
                                            <div className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                                                <CheckCircle2 className="h-4 w-4" />
                                                {validationResult.preview?.workspaceName} — valid
                                            </div>
                                            <div className="flex gap-2 flex-wrap text-xs text-muted-foreground">
                                                <span className="rounded border px-1.5 py-0.5">{validationResult.preview?.workspaceType}</span>
                                                <span className="rounded border px-1.5 py-0.5">{validationResult.preview?.rolesCount} roles</span>
                                                {(validationResult.preview?.enabledFeaturesCount ?? 0) > 0 && (
                                                    <span className="rounded border px-1.5 py-0.5">{validationResult.preview?.enabledFeaturesCount} features</span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                )}

                                {/* Optional name override */}
                                {validationResult?.valid && (
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium">Workspace name (optional)</label>
                                        <input
                                            type="text"
                                            value={importName}
                                            onChange={(e) => setImportName(e.target.value)}
                                            placeholder={validationResult.preview?.workspaceName ?? "Keep original name"}
                                            className="w-full rounded-lg border border-input px-3 py-2 text-sm focus:border-ring focus:ring-2 focus:ring-ring"
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
                                    onClick={handleDoImport}
                                    disabled={!validationResult?.valid || isImporting}
                                    className="w-full gap-2"
                                    size="sm"
                                >
                                    {isImporting && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Import Workspace
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </PanelSection.Items>
        </PanelSection>
    )
}
