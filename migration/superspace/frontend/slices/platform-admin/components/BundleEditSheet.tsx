"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ResponsiveDialog } from "@/frontend/shared/ui"

import { ColorPickerSimple } from "@/components/ui/shadcn-io/color-picker/ColorPickerSimple"
import { Badge } from "@/components/ui/badge"
import { IconPicker, getIconComponent } from "@/frontend/shared/ui/icons"

import type { Id } from "@/convex/_generated/dataModel"
import { useBundleCategoryMutations } from "../hooks/usePlatformAdmin"

const BUNDLE_CATEGORIES = [
  { value: "productivity", label: "Productivity" },
  { value: "business", label: "Business" },
  { value: "personal", label: "Personal" },
  { value: "creative", label: "Creative" },
  { value: "education", label: "Education" },
  { value: "community", label: "Community" },
] as const

const WORKSPACE_TYPES = [
  { value: "personal", label: "Personal" },
  { value: "family", label: "Family" },
  { value: "group", label: "Group" },
  { value: "organization", label: "Organization" },
  { value: "institution", label: "Institution" },
] as const

type BundleCategory = (typeof BUNDLE_CATEGORIES)[number]["value"]
type WorkspaceType = (typeof WORKSPACE_TYPES)[number]["value"]

export interface BundleCategoryDataForEdit {
  _id: Id<"bundleCategories"> | string
  bundleId: string
  name: string
  description?: string
  icon?: string
  category?: BundleCategory | string
  primaryColor?: string
  accentColor?: string
  recommendedFor?: WorkspaceType[]
  tags?: string[]
  isEnabled?: boolean
  isPublic?: boolean
}

interface BundleFormState {
  bundleId: string
  name: string
  description: string
  icon: string
  category: BundleCategory
  primaryColor: string
  accentColor: string
  recommendedFor: WorkspaceType[]
  tags: string[]
  isEnabled: boolean
  isPublic: boolean
}

const defaultFormState: BundleFormState = {
  bundleId: "",
  name: "",
  description: "",
  icon: "Package",
  category: "productivity",
  primaryColor: "#6366f1",
  accentColor: "",
  recommendedFor: ["personal"],
  tags: [],
  isEnabled: true,
  isPublic: true,
}

export interface BundleEditSheetProps {
  bundle: BundleCategoryDataForEdit | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function BundleEditSheet({ bundle, open, onOpenChange }: BundleEditSheetProps) {
  const { updateBundle } = useBundleCategoryMutations()
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState<BundleFormState>(defaultFormState)

  const bundleId = bundle?._id as any

  const categoryValue = useMemo(() => {
    const raw = (bundle?.category as string | undefined) ?? "productivity"
    const allowed = new Set<BundleCategory>(BUNDLE_CATEGORIES.map((c) => c.value))
    const candidate = raw as BundleCategory
    return allowed.has(candidate) ? candidate : "productivity"
  }, [bundle?.category])

  useEffect(() => {
    if (!bundle) return
    setForm({
      bundleId: bundle.bundleId ?? "",
      name: bundle.name ?? "",
      description: bundle.description ?? "",
      icon: bundle.icon ?? "Package",
      category: categoryValue,
      primaryColor: bundle.primaryColor ?? "#6366f1",
      accentColor: bundle.accentColor ?? "",
      recommendedFor: (bundle.recommendedFor as WorkspaceType[] | undefined) ?? ["personal"],
      tags: bundle.tags ?? [],
      isEnabled: bundle.isEnabled ?? true,
      isPublic: bundle.isPublic ?? true,
    })
  }, [bundle, categoryValue])

  const handleSave = async () => {
    if (!bundle) return
    setIsSaving(true)
    try {
      await updateBundle(bundleId, {
        name: form.name,
        description: form.description,
        icon: form.icon,
        category: form.category as any,
        primaryColor: form.primaryColor || undefined,
        accentColor: form.accentColor || undefined,
        recommendedFor: form.recommendedFor as any,
        tags: form.tags,
        isEnabled: form.isEnabled,
        isPublic: form.isPublic,
      })
      toast.success("Bundle category updated successfully")
      onOpenChange(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg || "Failed to update bundle category")
      // eslint-disable-next-line no-console
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} variant="panel" sheetSide="right" contentClassName="sm:max-w-[520px]">
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title className="text-xl">Edit Bundle Category</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>Configure bundle category metadata and styling</ResponsiveDialog.Description>
      </ResponsiveDialog.Header>

      <ResponsiveDialog.Body className="px-4 py-6 sm:px-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Bundle ID</Label>
            <Input value={form.bundleId} disabled className="font-mono bg-muted/50 h-10" />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Basic Information</h4>

            <div className="space-y-2">
              <Label htmlFor="bundle-edit-name" className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bundle-edit-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Bundle name"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bundle-edit-description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="bundle-edit-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of the bundle"
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Appearance</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Icon</Label>
                <IconPicker
                  icon={form.icon}
                  color={form.primaryColor}
                  onIconChange={(icon) => setForm({ ...form, icon })}
                  onColorChange={(color) => setForm({ ...form, primaryColor: color })}
                  showColor={false}
                  className="w-full"
                  trigger={
                    <Button variant="outline" className="w-full h-10 justify-start gap-2">
                      {(() => {
                        const IconComp = getIconComponent(form.icon)
                        return IconComp ? (
                          <IconComp className="h-4 w-4" style={{ color: form.primaryColor }} />
                        ) : null
                      })()}
                      <span>{form.icon}</span>
                    </Button>
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bundle-edit-category" className="text-sm font-medium">Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as BundleCategory })}>
                  <SelectTrigger id="bundle-edit-category" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUNDLE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Primary Color</Label>
                <ColorPickerSimple
                  value={form.primaryColor}
                  onChange={(color) => setForm({ ...form, primaryColor: color })}
                  placeholder="#6366f1"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Accent Color</Label>
                <ColorPickerSimple
                  value={form.accentColor || ""}
                  onChange={(color) => setForm({ ...form, accentColor: color })}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Recommended For</h4>
            <div className="flex flex-wrap gap-2">
              {WORKSPACE_TYPES.map((type) => (
                <Badge
                  key={type.value}
                  variant={form.recommendedFor.includes(type.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    const isSelected = form.recommendedFor.includes(type.value)
                    setForm({
                      ...form,
                      recommendedFor: isSelected
                        ? form.recommendedFor.filter((t) => t !== type.value)
                        : [...form.recommendedFor, type.value],
                    })
                  }}
                >
                  {type.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bundle-edit-tags" className="text-sm font-medium">Tags</Label>
            <Input
              id="bundle-edit-tags"
              value={form.tags.join(", ")}
              onChange={(e) =>
                setForm({
                  ...form,
                  tags: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
              placeholder="productivity, starter"
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">Separate tags with commas</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Visibility</h4>

            <div className="space-y-1 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Public</Label>
                  <p className="text-xs text-muted-foreground">Visible to workspaces</p>
                </div>
                <Switch checked={form.isPublic} onCheckedChange={(v) => setForm({ ...form, isPublic: v })} />
              </div>
            </div>

            <div className="space-y-1 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Enabled</Label>
                  <p className="text-xs text-muted-foreground">Bundle can be used</p>
                </div>
                <Switch checked={form.isEnabled} onCheckedChange={(v) => setForm({ ...form, isEnabled: v })} />
              </div>
            </div>
          </div>
        </div>
      </ResponsiveDialog.Body>

      <ResponsiveDialog.Footer>
        <div className="flex w-full gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button aria-label="Save" onClick={handleSave} disabled={isSaving || !bundle} className="flex-1">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  )
}
