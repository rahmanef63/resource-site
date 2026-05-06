"use client"

import * as React from "react"
import type { Id } from "@/convex/_generated/dataModel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, Check, LayoutTemplate, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  hasIndustryTemplatesQueryApi,
  useTemplates,
  type FeatureModule,
} from "@/frontend/slices/industry-templates/hooks/useIndustryTemplates"
import {
  getAllBundles,
  getBundleEnabledFeatures,
  type AvailableFeatureId,
  type BundleId,
} from "@/frontend/shared/foundation/workspaces/constants/bundles"
import type { WorkspaceType } from "@/frontend/shared/workspace/types"
import { WORKSPACE_TYPE_OPTIONS } from "@/frontend/shared/workspace/constants"
import { formatWorkspaceFeatureLabel } from "@/frontend/shared/foundation/workspaces/lib/formatFeatureLabel"

type IndustryTemplateRecord = {
  _id: Id<"industryTemplates">
  name: string
  description: string
  category: string
  features: FeatureModule[]
}

interface IndustryTemplateCreatePanelProps {
  onCreate: (data: {
    name: string
    type: WorkspaceType
    templateId?: Id<"industryTemplates">
    bundleId?: BundleId
    enabledFeatures?: AvailableFeatureId[]
  }) => Promise<void>
  actionLabel?: string
  className?: string
}

type BundleFallbackRecord = {
  _id: string
  name: string
  description: string
  category: string
  features: FeatureModule[]
  bundleId: BundleId
  source: "bundle"
}

type TemplateOption = (IndustryTemplateRecord & { source: "template" }) | BundleFallbackRecord

export function IndustryTemplateCreatePanel({
  onCreate,
  actionLabel = "Create Workspace from Template",
  className,
}: IndustryTemplateCreatePanelProps) {
  const [name, setName] = React.useState("")
  const [type, setType] = React.useState<WorkspaceType>("organization")
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const templates = useTemplates({
    limit: 50,
  }) as IndustryTemplateRecord[] | undefined
  const fallbackBundles = React.useMemo<BundleFallbackRecord[]>(
    () =>
      getAllBundles().map((bundle) => ({
        _id: `bundle:${bundle.id}`,
        name: bundle.name,
        description: bundle.description,
        category: bundle.category,
        features: getBundleEnabledFeatures(bundle) as FeatureModule[],
        bundleId: bundle.id,
        source: "bundle",
      })),
    [],
  )
  const hasRealTemplates = Boolean(templates && templates.length > 0)
  const templateOptions = React.useMemo<TemplateOption[]>(
    () => (hasRealTemplates
      ? (templates ?? []).map((template) => ({ ...template, source: "template" as const }))
      : fallbackBundles),
    [fallbackBundles, hasRealTemplates, templates],
  )

  const handleCreate = React.useCallback(async () => {
    if (!name.trim() || !selectedTemplateId) return

    const selectedOption = templateOptions.find((option) => option._id === selectedTemplateId)
    if (!selectedOption) return

    setIsSubmitting(true)
    try {
      await onCreate({
        name: name.trim(),
        type,
        templateId: selectedOption.source === "template" ? selectedOption._id as Id<"industryTemplates"> : undefined,
        bundleId: selectedOption.source === "bundle" ? selectedOption.bundleId : undefined,
        enabledFeatures: selectedOption.features as AvailableFeatureId[],
      })
      setName("")
      setType("organization")
      setSelectedTemplateId(null)
    } finally {
      setIsSubmitting(false)
    }
  }, [name, onCreate, selectedTemplateId, templateOptions, type])

  const panelState = !hasIndustryTemplatesQueryApi
    ? "unavailable"
    : templates === undefined
      ? "loading"
      : "ready"
  const isUsingBundleFallback = panelState === "ready" && !hasRealTemplates

  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-4", className)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="industry-template-workspace-name">Workspace Name</Label>
          <Input
            id="industry-template-workspace-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. My Business Workspace"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="industry-template-workspace-type">Workspace Type</Label>
          <Select value={type} onValueChange={(value) => setType(value as WorkspaceType)}>
            <SelectTrigger id="industry-template-workspace-type">
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

      <div className="min-h-0 flex-1 rounded-md border bg-muted/10">
        <ScrollArea className="h-full p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {panelState === "unavailable" ? (
              <div
                className="col-span-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground"
                data-testid="industry-template-unavailable"
              >
                <AlertCircle className="mb-2 h-10 w-10 text-muted-foreground/60" />
                <p className="font-medium text-foreground">Templates are temporarily unavailable.</p>
                <p className="mt-1 max-w-md text-sm">
                  The industry template service is not ready in this environment yet, so the template onboarding tab
                  cannot load public templates right now.
                </p>
              </div>
            ) : panelState === "loading" ? (
              <div className="col-span-full flex flex-col items-center justify-center p-8 text-muted-foreground">
                <Loader2 className="mb-2 h-8 w-8 animate-spin" />
                <p>Loading templates...</p>
              </div>
            ) : isUsingBundleFallback ? (
              <div
                className="col-span-full rounded-xl border border-dashed border-border/60 bg-background/70 p-4 text-sm text-muted-foreground"
                data-testid="industry-template-fallback"
              >
                Public industry templates are not available yet in Convex, so this tab is showing workspace bundles as a fallback.
              </div>
            ) : null}

            {panelState === "ready"
              ? templateOptions.map((template) => (
                <Card
                  key={template._id}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary/50",
                    selectedTemplateId === template._id && "border-primary bg-primary/5 ring-1 ring-primary",
                  )}
                  data-testid="industry-template-card"
                  onClick={() => setSelectedTemplateId(template._id)}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className="capitalize">
                        {template.category.replace(/_/g, " ")}
                      </Badge>
                      {"source" in template && template.source === "bundle" ? (
                        <Badge variant="secondary">Bundle</Badge>
                      ) : null}
                      {selectedTemplateId === template._id ? (
                        <div className="rounded-full bg-primary p-0.5 text-primary-foreground">
                          <Check className="h-3 w-3" />
                        </div>
                      ) : null}
                    </div>
                    <CardTitle className="mt-2 text-base">{template.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <CardDescription className="line-clamp-3 text-xs">
                      {template.description}
                    </CardDescription>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {template.features.slice(0, 4).map((featureId) => (
                        <Badge key={featureId} variant="secondary" className="h-5 px-1 py-0 text-[10px]">
                          {formatWorkspaceFeatureLabel(featureId)}
                        </Badge>
                      ))}
                      {template.features.length > 4 ? (
                        <Badge variant="secondary" className="h-5 px-1 py-0 text-[10px]">
                          +{template.features.length - 4}
                        </Badge>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))
              : null}
          </div>
        </ScrollArea>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleCreate}
          disabled={!name.trim() || !selectedTemplateId || isSubmitting}
        >
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {actionLabel}
        </Button>
      </div>
    </div>
  )
}
