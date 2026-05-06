"use client"

import * as React from "react"
import type { Id } from "@/convex/_generated/dataModel"
import { ResponsiveDialog } from "@/frontend/shared/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, LayoutTemplate, Settings2, Sparkles } from "lucide-react"
import { AiOnboardingFlow, type WorkspaceAIDraft } from "./ai/AiOnboardingFlow"
import { cn } from "@/lib/utils"
import { FeatureCustomizer } from "./FeatureCustomizer"
import type { AvailableFeatureId } from "../constants"
import type { WorkspaceType } from "../types"
import { WORKSPACE_TYPE_OPTIONS } from "@/frontend/shared/workspace/constants"
import { IndustryTemplateCreatePanel } from "./IndustryTemplateCreatePanel"
import {
  ImportAndJoinTabTriggers,
  ImportAndJoinTabContents,
  IMPORT_TAB_VALUE,
  JOIN_TAB_VALUE,
} from "./ImportAndJoinTabs"
import type { WorkspaceTemplate } from "@/lib/workspaces/templates"

export interface CreateWorkspaceAdvancedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    name: string
    description?: string
    type: WorkspaceType
    icon?: string
    color?: string
    bundleId?: string
    parentId?: string
    templateId?: Id<"industryTemplates">
    enabledFeatures?: string[]
  }) => Promise<void>
  parentWorkspaceId?: string
  /** When set, dialog title becomes "Create Child Workspace in {parentWorkspaceName}". */
  parentWorkspaceName?: string
  initialTemplate?: WorkspaceTemplate | null
}

export function CreateWorkspaceAdvancedDialog({
  open,
  onOpenChange,
  onSubmit,
  parentWorkspaceId,
  parentWorkspaceName,
  initialTemplate,
}: CreateWorkspaceAdvancedDialogProps) {
  const [activeTab, setActiveTab] = React.useState<
    "custom" | "template" | "ai" | typeof IMPORT_TAB_VALUE | typeof JOIN_TAB_VALUE
  >("template")
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [type, setType] = React.useState<WorkspaceType>("organization")
  const [customFeatures, setCustomFeatures] = React.useState<AvailableFeatureId[]>([])
  const [selectedBundleId, setSelectedBundleId] = React.useState<string | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!open) return

    if (initialTemplate) {
      setActiveTab("custom")
      setName(`${initialTemplate.name} Workspace`)
      setDescription(initialTemplate.description)
      setType((initialTemplate.recommendedFor[0] as WorkspaceType | undefined) ?? "organization")
      setCustomFeatures(initialTemplate.features as AvailableFeatureId[])
      setSelectedBundleId(initialTemplate.bundleId)
      return
    }

    setSelectedBundleId(undefined)
    setCustomFeatures([])
  }, [initialTemplate, open])

  const handleSubmit = async () => {
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        name,
        description,
        type,
        parentId: parentWorkspaceId,
        bundleId: activeTab === "custom" ? selectedBundleId : undefined,
        enabledFeatures: activeTab === "custom" ? customFeatures : undefined
      })
      onOpenChange(false)
      // Reset form
      setName("")
      setDescription("")
      setType("organization")
      setCustomFeatures([])
      setSelectedBundleId(undefined)
      setActiveTab("template")
    } catch (error) {
      console.error("Failed to create workspace", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleFeature = (featureId: AvailableFeatureId) => {
    setCustomFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(f => f !== featureId)
        : [...prev, featureId]
    )
  }

  const resetForm = React.useCallback(() => {
    setName("")
    setDescription("")
    setType("organization")
    setCustomFeatures([])
    setSelectedBundleId(undefined)
    setActiveTab("template")
  }, [])

  const handleAiCreate = React.useCallback(async (draft: WorkspaceAIDraft) => {
    setIsSubmitting(true)
    try {
      await onSubmit({
        name: draft.name,
        description: draft.description,
        type: draft.type,
        icon: draft.icon,
        color: draft.color,
        bundleId: draft.bundleId ?? undefined,
        parentId: parentWorkspaceId,
        enabledFeatures: draft.enabledFeatures,
      })
      resetForm()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create AI workspace", error)
    } finally {
      setIsSubmitting(false)
    }
  }, [onOpenChange, onSubmit, parentWorkspaceId, resetForm])

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      variant="modal"
      size="xl"
    >
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>
          {parentWorkspaceName
            ? `Create Child Workspace in ${parentWorkspaceName}`
            : "Create New Workspace"}
        </ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          Choose a template or start from scratch with custom features.
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>

      <ResponsiveDialog.Body className="flex flex-col overflow-hidden p-0">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="px-4 pt-3 sm:px-6 sm:pt-4 shrink-0">
            <TabsList className="flex w-full justify-evenly gap-1 sm:grid-cols-5 sm:max-w-[780px]">
              <TabsTrigger value="template" className="min-w-0">
                <LayoutTemplate className="w-4 h-4 mr-1.5 shrink-0" />
                <span className="truncate">Template Library</span>
              </TabsTrigger>
              <TabsTrigger value="custom" className="min-w-0">
                <Settings2 className="w-4 h-4 mr-1.5 shrink-0" />
                <span className="truncate">Manual Setup</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="min-w-0">
                <Sparkles className="w-4 h-4 mr-1.5 shrink-0 text-purple-400" />
                <span className="truncate">AI Workspace (Beta)</span>
              </TabsTrigger>
              <ImportAndJoinTabTriggers />
            </TabsList>
          </div>

          <div className="flex-1 min-h-0 relative mt-4">
            <TabsContent
              value="template"
              className={cn(
                "absolute inset-0 overflow-hidden px-4 pb-4 sm:px-6 m-0",
                "data-[state=active]:flex flex-col gap-4",
              )}
            >
              <IndustryTemplateCreatePanel
                actionLabel="Create Workspace"
                className="min-h-0"
                onCreate={async ({ name: templateName, type: templateType, templateId }) => {
                  setIsSubmitting(true)
                  try {
                    await onSubmit({
                      name: templateName,
                      type: templateType,
                      parentId: parentWorkspaceId,
                      templateId,
                    })
                    resetForm()
                    onOpenChange(false)
                  } catch (error) {
                    console.error("Failed to create workspace from template", error)
                  } finally {
                    setIsSubmitting(false)
                  }
                }}
              />
            </TabsContent>

            <TabsContent
              value="custom"
              className={cn(
                "absolute inset-0 overflow-hidden px-4 pb-4 sm:px-6 m-0",
                "data-[state=active]:flex flex-col gap-4",
              )}
            >
              <div className="grid gap-4 shrink-0">
                {selectedBundleId ? (
                  <div className="rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                    This workspace will start from the <span className="font-medium text-foreground">{selectedBundleId}</span> template.
                    You can adjust which features stay enabled before creating it.
                  </div>
                ) : null}
                <div className="grid gap-2">
                  <Label htmlFor="name-custom">Workspace Name</Label>
                  <Input
                    id="name-custom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. My Project"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="desc-custom">Description (Optional)</Label>
                  <Input
                    id="desc-custom"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of your workspace"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type-custom">Workspace Type</Label>
                  <Select value={type} onValueChange={(value) => setType(value as WorkspaceType)}>
                    <SelectTrigger id="type-custom">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WORKSPACE_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex-1 min-h-0 border rounded-md bg-muted/10 flex flex-col">
                <div className="p-3 border-b bg-muted/20">
                  <h4 className="text-sm font-medium">Select Features</h4>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <FeatureCustomizer
                    selectedBundleId={selectedBundleId ?? "custom"}
                    enabledFeatures={customFeatures}
                    onToggleFeature={handleToggleFeature}
                  />
                </ScrollArea>
              </div>
            </TabsContent>
            <TabsContent
              value="ai"
              className={cn(
                "absolute inset-0 overflow-hidden px-4 pb-4 sm:px-6 m-0",
                "data-[state=active]:flex flex-col",
              )}
            >
              <div className="flex-1 min-h-0 overflow-hidden">
                <AiOnboardingFlow
                  actionLabel="Create Workspace"
                  onCreateWorkspace={handleAiCreate}
                />
              </div>
            </TabsContent>

            <ImportAndJoinTabContents
              contentClassName="absolute inset-0 overflow-hidden px-4 pb-4 sm:px-6"
              onDone={() => {
                resetForm()
                onOpenChange(false)
              }}
            />
          </div>
        </Tabs>
      </ResponsiveDialog.Body>

      {activeTab === "custom" ? (
        <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Workspace
          </Button>
        </ResponsiveDialog.Footer>
      ) : null}
    </ResponsiveDialog>
  )
}
