"use client"

import * as React from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id, Doc } from "@/convex/_generated/dataModel"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ResponsiveDialog } from "@/frontend/shared/ui"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Home,
  Building2,
  Users,
  Heart,
  Briefcase,
  Link2,
  Unlink,
  Palette,
  ChevronRight,
  Plus,
  MoreHorizontal,
  ArrowUpRight,
  Check,
  Crown,
  Loader2,
  AlertTriangle,
  Wrench,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Import from SSOT
import { DEFAULT_WORKSPACE_COLOR, WORKSPACE_COLORS } from "@/frontend/shared/constants/colors"

// Workspace type icons
const WORKSPACE_TYPE_ICONS: Record<string, React.ElementType> = {
  personal: Home,
  organization: Building2,
  institution: Building2,
  group: Users,
  family: Heart,
}

interface HierarchySettingsProps {
  workspaceId: Id<"workspaces">
}

export function HierarchySettings({ workspaceId }: HierarchySettingsProps) {
  const [linkDialogOpen, setLinkDialogOpen] = React.useState(false)
  const [removeParentOpen, setRemoveParentOpen] = React.useState(false)
  const [setParentOpen, setSetParentOpen] = React.useState(false)
  const [isUpdating, setIsUpdating] = React.useState(false)
  
  // Get main workspace from context (global)
  const { mainWorkspace } = useWorkspaceContext()

  // Query data directly for the workspaceId prop (not context's current workspace)
  // This ensures we show data for the workspace being edited, not the one in sidebar
  const currentWorkspace = useQuery(
    api.workspace.workspaces.getWorkspace,
    { workspaceId }
  )
  
  // Get ancestors (for path display) - directly from database, not browser history
  const ancestorsQuery = useQuery(
    api.workspace.hierarchy.getWorkspaceAncestors,
    { workspaceId }
  )
  
  // Build workspace path from ancestors + current workspace
  const workspacePath = React.useMemo(() => {
    const path = ancestorsQuery ?? []
    if (currentWorkspace) {
      return [...path, currentWorkspace]
    }
    return path
  }, [ancestorsQuery, currentWorkspace])
  
  // Get parent workspace from ancestors
  const parentWorkspace = React.useMemo(() => {
    if (ancestorsQuery && ancestorsQuery.length > 0) {
      return ancestorsQuery[ancestorsQuery.length - 1]
    }
    return null
  }, [ancestorsQuery])
  
  // Check if this is the main workspace
  const isMainWorkspace = Boolean(currentWorkspace && (currentWorkspace as any).isMainWorkspace)

  // Get child workspaces for THIS workspace (not context's current)
  const childWorkspaces = useQuery(
    api.workspace.hierarchy.getChildWorkspaces,
    { workspaceId, includeLinked: true }
  )

  // Get available workspaces to link
  const availableToLink = useQuery(
    api.workspace.hierarchy.getAvailableWorkspacesToLink,
    { parentWorkspaceId: workspaceId }
  )

  // Get sibling workspaces (for context)
  const siblingWorkspaces = useQuery(
    api.workspace.hierarchy.getSiblingWorkspaces,
    { workspaceId }
  )

  // Mutations
  const linkWorkspace = useMutation(api.workspace.hierarchy.linkWorkspaceAsChild)
  const unlinkWorkspace = useMutation(api.workspace.hierarchy.unlinkChildWorkspace)
  const setWorkspaceColor = useMutation(api.workspace.hierarchy.setWorkspaceColor)
  const setWorkspaceParent = useMutation(api.workspace.hierarchy.setWorkspaceParent)
  const fixCorruptedHierarchy = useMutation(api.workspace.hierarchy.fixCorruptedHierarchy)
  
  // Validation query
  const hierarchyValidation = useQuery(api.workspace.hierarchy.validateMyWorkspaceHierarchy)
  
  // Check if current workspace has issues
  const currentWorkspaceIssues = React.useMemo(() => {
    if (!hierarchyValidation?.issues) return []
    return hierarchyValidation.issues.filter(
      issue => String(issue.workspaceId) === String(workspaceId)
    )
  }, [hierarchyValidation, workspaceId])

  const handleFixHierarchy = async () => {
    try {
      setIsUpdating(true)
      const result = await fixCorruptedHierarchy({ workspaceId })
      if (result.fixed) {
        toast.success("Hierarchy fixed successfully")
      } else {
        toast.info("No issues found to fix")
      }
    } catch (error) {
      toast.error("Failed to fix hierarchy")
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleFixAllHierarchies = async () => {
    try {
      setIsUpdating(true)
      const workspaceIds = Array.from(
        new Set(
          (hierarchyValidation?.issues ?? [])
            .map((issue) => String(issue.workspaceId))
            .filter(Boolean)
        )
      )

      if (workspaceIds.length === 0) {
        toast.info("No hierarchy issues found to fix")
        return
      }

      let fixedCount = 0
      for (const wsId of workspaceIds) {
        const result = await fixCorruptedHierarchy({
          workspaceId: wsId as Id<"workspaces">,
        })
        if (result.fixed) {
          fixedCount += 1
        }
      }

      if (fixedCount > 0) {
        toast.success(`Fixed hierarchy issues in ${fixedCount} workspace(s)`)
      } else {
        toast.info("No hierarchy issues were auto-fixable")
      }
    } catch (error) {
      toast.error("Failed to fix hierarchies")
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLinkWorkspace = async (childId: Id<"workspaces">) => {
    try {
      setIsUpdating(true)
      await linkWorkspace({
        parentWorkspaceId: workspaceId,
        childWorkspaceId: childId,
      })
      toast.success("Workspace linked successfully")
      setLinkDialogOpen(false)
    } catch (error) {
      toast.error("Failed to link workspace")
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUnlinkWorkspace = async (childId: Id<"workspaces">) => {
    try {
      setIsUpdating(true)
      await unlinkWorkspace({
        parentWorkspaceId: workspaceId,
        childWorkspaceId: childId,
      })
      toast.success("Workspace unlinked")
    } catch (error) {
      toast.error("Failed to unlink workspace")
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleColorChange = async (wsId: Id<"workspaces">, color: string) => {
    try {
      await setWorkspaceColor({ workspaceId: wsId, color })
      toast.success("Color updated")
    } catch (error) {
      toast.error("Failed to update color")
      console.error(error)
    }
  }

  const handleRemoveParent = async () => {
    try {
      setIsUpdating(true)
      await setWorkspaceParent({
        workspaceId,
        parentWorkspaceId: undefined,
      })
      toast.success("Parent workspace removed")
    } catch (error) {
      toast.error("Failed to remove parent")
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSetParent = async (parentId: Id<"workspaces">) => {
    try {
      setIsUpdating(true)
      await setWorkspaceParent({
        workspaceId,
        parentWorkspaceId: parentId,
      })
      toast.success("Parent workspace set")
    } catch (error) {
      toast.error("Failed to set parent workspace")
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Global Hierarchy Issues Alert - shows all issues */}
      {hierarchyValidation && hierarchyValidation.issueCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Hierarchy Issues Detected ({hierarchyValidation.issueCount} total)</AlertTitle>
          <AlertDescription className="space-y-3">
            <p className="text-sm">
              Issues were found across your workspaces. This may cause incorrect path displays and navigation problems.
            </p>
            <ul className="list-disc list-inside text-sm max-h-32 overflow-y-auto space-y-1">
              {hierarchyValidation.issues.slice(0, 10).map((issue, idx) => (
                <li key={idx}>
                  <strong>{issue.name}</strong>: {issue.issue}
                </li>
              ))}
              {hierarchyValidation.issues.length > 10 && (
                <li className="text-muted-foreground">
                  ...and {hierarchyValidation.issues.length - 10} more
                </li>
              )}
            </ul>
            <div className="flex gap-2 mt-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleFixAllHierarchies}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wrench className="h-4 w-4 mr-2" />
                )}
                Fix All Hierarchies
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFixHierarchy}
                disabled={isUpdating}
              >
                Fix This Workspace Only
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Workspace Position Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Workspace Hierarchy
            {isMainWorkspace && (
              <Badge variant="secondary" className="gap-1">
                <Crown className="h-3 w-3" />
                Main Workspace
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Manage how this workspace relates to other workspaces in your organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hierarchy Path */}
          {workspacePath.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Current Path</Label>
              <div className="flex items-center gap-1 text-sm bg-muted/50 rounded-md p-2">
                {workspacePath.map((ws, idx) => {
                  const Icon = WORKSPACE_TYPE_ICONS[ws.type ?? "personal"] ?? Briefcase
                  const isCurrentWs = String(ws._id) === String(workspaceId)
                  return (
                    <React.Fragment key={ws._id}>
                      {idx > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                      <div
                        className={cn(
                          "flex items-center gap-1.5 px-2 py-1 rounded",
                          isCurrentWs && "bg-primary/10 font-medium"
                        )}
                      >
                        <div
                          className="flex h-5 w-5 items-center justify-center rounded text-white text-xs"
                          style={{ backgroundColor: (ws as any).color ?? DEFAULT_WORKSPACE_COLOR }}
                        >
                          <Icon className="h-3 w-3" />
                        </div>
                        <span>{ws.name}</span>
                        {ws.isMainWorkspace && (
                          <Crown className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                    </React.Fragment>
                  )
                })}
              </div>
            </div>
          )}

          {/* Parent Workspace */}
          {!isMainWorkspace && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Parent Workspace</Label>
                {parentWorkspace && (
                  <>
                    <Button variant="ghost" size="sm" disabled={isUpdating} onClick={() => setRemoveParentOpen(true)}>
                      <Unlink className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                    <ResponsiveDialog open={removeParentOpen} onOpenChange={setRemoveParentOpen} variant="alert" size="md">
                      <ResponsiveDialog.Header>
                        <ResponsiveDialog.Title>Remove Parent Workspace?</ResponsiveDialog.Title>
                        <ResponsiveDialog.Description>
                          This will make this workspace a root-level workspace. You can always set a parent again later.
                        </ResponsiveDialog.Description>
                      </ResponsiveDialog.Header>
                      <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
                        <Button variant="outline" onClick={() => setRemoveParentOpen(false)}>Cancel</Button>
                        <Button onClick={() => { handleRemoveParent(); setRemoveParentOpen(false); }}>
                          Remove Parent
                        </Button>
                      </ResponsiveDialog.Footer>
                    </ResponsiveDialog>
                  </>
                )}
              </div>
              
              {parentWorkspace ? (
                <WorkspaceCard workspace={parentWorkspace} showBadge="parent" />
              ) : (
                <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">
                  <span className="text-sm text-muted-foreground">
                    No parent workspace - this is a root-level workspace
                  </span>
                  <>
                    <Button variant="outline" size="sm" onClick={() => setSetParentOpen(true)}>
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      Set Parent
                    </Button>
                    <ResponsiveDialog open={setParentOpen} onOpenChange={setSetParentOpen} variant="modal" size="md">
                      <ResponsiveDialog.Header>
                        <ResponsiveDialog.Title>Set Parent Workspace</ResponsiveDialog.Title>
                        <ResponsiveDialog.Description>
                          Choose a workspace to set as this workspace&apos;s parent.
                        </ResponsiveDialog.Description>
                      </ResponsiveDialog.Header>
                      <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
                        <ScrollArea className="max-h-64">
                          <div className="space-y-2 p-1">
                            {mainWorkspace && String(mainWorkspace._id) !== String(workspaceId) && (
                              <WorkspaceSelectItem
                                workspace={mainWorkspace}
                                onSelect={() => { handleSetParent(mainWorkspace._id); setSetParentOpen(false); }}
                                isMain
                              />
                            )}
                            {availableToLink?.map((ws) => (
                              <WorkspaceSelectItem
                                key={ws._id}
                                workspace={ws}
                                onSelect={() => { handleSetParent(ws._id); setSetParentOpen(false); }}
                              />
                            ))}
                          </div>
                        </ScrollArea>
                      </ResponsiveDialog.Body>
                    </ResponsiveDialog>
                  </>
                </div>
              )}
            </div>
          )}

          {/* Workspace Color */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Workspace Color</Label>
            <p className="text-sm text-muted-foreground">
              Choose a color to identify this workspace in the sidebar.
            </p>
            <div className="flex flex-wrap gap-2">
              {WORKSPACE_COLORS.map((colorItem) => (
                <button
                  key={colorItem.value}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-all hover:scale-110",
                    colorItem.value === ((currentWorkspace as any)?.color ?? DEFAULT_WORKSPACE_COLOR)
                      ? "border-foreground ring-2 ring-offset-2 ring-offset-background"
                      : "border-transparent"
                  )}
                  style={{ backgroundColor: colorItem.value }}
                  onClick={() => handleColorChange(workspaceId, colorItem.value)}
                  title={colorItem.name}
                >
                  {colorItem.value === ((currentWorkspace as any)?.color ?? DEFAULT_WORKSPACE_COLOR) && (
                    <Check className="h-4 w-4 text-white mx-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Child Workspaces Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Child Workspaces</CardTitle>
              <CardDescription>
                Workspaces that are nested under this workspace.
              </CardDescription>
            </div>
            <Button onClick={() => setLinkDialogOpen(true)}>
              <Link2 className="h-4 w-4 mr-2" />
              Link Workspace
            </Button>
            <ResponsiveDialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen} variant="modal" size="md">
              <ResponsiveDialog.Header>
                <ResponsiveDialog.Title>Link Workspace</ResponsiveDialog.Title>
                <ResponsiveDialog.Description>
                  Select a workspace to link as a child. Linked workspaces appear in your hierarchy but retain their own ownership.
                </ResponsiveDialog.Description>
              </ResponsiveDialog.Header>
              <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
                <ScrollArea className="max-h-64">
                  <div className="space-y-2 p-1">
                    {availableToLink && availableToLink.length > 0 ? (
                      availableToLink.map((ws) => (
                        <WorkspaceSelectItem
                          key={ws._id}
                          workspace={ws}
                          onSelect={() => handleLinkWorkspace(ws._id)}
                          disabled={isUpdating}
                        />
                      ))
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        No available workspaces to link
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </ResponsiveDialog.Body>
              <ResponsiveDialog.Footer>
                <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
                  Cancel
                </Button>
              </ResponsiveDialog.Footer>
            </ResponsiveDialog>
          </div>
        </CardHeader>
        <CardContent>
          {(childWorkspaces ?? []).length > 0 ? (
            <div className="space-y-3">
              {(childWorkspaces ?? []).map((child) => (
                <ChildWorkspaceCard
                  key={child._id}
                  workspace={child}
                  isLinked={(child as any).isLinked}
                  onUnlink={() => handleUnlinkWorkspace(child._id)}
                  onColorChange={(color) => handleColorChange(child._id, color)}
                  disabled={isUpdating}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center border rounded-lg border-dashed">
              <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No child workspaces yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Link existing workspaces or create new ones
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sibling Workspaces (if has parent) */}
      {parentWorkspace && siblingWorkspaces && siblingWorkspaces.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sibling Workspaces</CardTitle>
            <CardDescription>
              Other workspaces under the same parent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {siblingWorkspaces
                .filter((ws) => String(ws._id) !== String(workspaceId))
                .map((sibling) => (
                  <WorkspaceCard
                    key={sibling._id}
                    workspace={sibling}
                    showBadge={(sibling as any).isLinked ? "linked" : undefined}
                  />
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Sharing Settings (for non-main workspaces) */}
      {!isMainWorkspace && parentWorkspace && (
        <Card>
          <CardHeader>
            <CardTitle>Data Sharing</CardTitle>
            <CardDescription>
              Control what data this workspace shares with its parent.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DataSharingToggle
              workspaceId={workspaceId}
              currentValue={(currentWorkspace as any)?.shareDataToParent ?? true}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper Components

function WorkspaceCard({
  workspace,
  showBadge,
}: {
  workspace: Doc<"workspaces">
  showBadge?: "parent" | "linked"
}) {
  const Icon = WORKSPACE_TYPE_ICONS[workspace.type ?? "personal"] ?? Briefcase
  const color = (workspace as any).color ?? DEFAULT_WORKSPACE_COLOR

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
        style={{ backgroundColor: color }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{workspace.name}</span>
          {workspace.isMainWorkspace && (
            <Badge variant="secondary" className="h-5 text-[10px]">
              <Crown className="h-3 w-3 mr-1" />
              Main
            </Badge>
          )}
          {showBadge === "parent" && (
            <Badge variant="outline" className="h-5 text-[10px]">
              Parent
            </Badge>
          )}
          {showBadge === "linked" && (
            <Badge variant="outline" className="h-5 text-[10px]">
              <Link2 className="h-3 w-3 mr-1" />
              Linked
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{workspace.type}</span>
      </div>
    </div>
  )
}

function ChildWorkspaceCard({
  workspace,
  isLinked,
  onUnlink,
  onColorChange,
  disabled,
}: {
  workspace: Doc<"workspaces">
  isLinked?: boolean
  onUnlink: () => void
  onColorChange: (color: string) => void
  disabled?: boolean
}) {
  const Icon = WORKSPACE_TYPE_ICONS[workspace.type ?? "personal"] ?? Briefcase
  const color = (workspace as any).color ?? DEFAULT_WORKSPACE_COLOR

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
        style={{ backgroundColor: color }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{workspace.name}</span>
          {isLinked && (
            <Badge variant="outline" className="h-5 text-[10px]">
              <Link2 className="h-3 w-3 mr-1" />
              Linked
            </Badge>
          )}
          {(workspace as any).shareDataToParent && (
            <Badge variant="secondary" className="h-5 text-[10px]">
              Sharing
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{workspace.type}</span>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={disabled}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div className="p-2">
            <div className="text-xs font-medium mb-2">Color</div>
            <div className="flex flex-wrap gap-1">
              {WORKSPACE_COLORS.map((colorItem) => (
                <button
                  key={colorItem.value}
                  className={cn(
                    "h-5 w-5 rounded-full border-2 transition-all",
                    colorItem.value === color ? "border-foreground" : "border-transparent"
                  )}
                  style={{ backgroundColor: colorItem.value }}
                  onClick={() => onColorChange(colorItem.value)}
                  title={colorItem.name}
                />
              ))}
            </div>
          </div>
          <Separator className="my-1" />
          {isLinked && (
            <DropdownMenuItem onClick={onUnlink} className="text-destructive">
              <Unlink className="h-4 w-4 mr-2" />
              Unlink
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function WorkspaceSelectItem({
  workspace,
  onSelect,
  isMain,
  disabled,
}: {
  workspace: Doc<"workspaces">
  onSelect: () => void
  isMain?: boolean
  disabled?: boolean
}) {
  const Icon = WORKSPACE_TYPE_ICONS[workspace.type ?? "personal"] ?? Briefcase
  const color = (workspace as any).color ?? DEFAULT_WORKSPACE_COLOR

  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-3 h-auto py-2"
      onClick={onSelect}
      disabled={disabled}
    >
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
        style={{ backgroundColor: color }}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-left flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{workspace.name}</span>
          {isMain && (
            <Badge variant="secondary" className="h-4 text-[10px]">
              <Crown className="h-3 w-3 mr-1" />
              Main
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{workspace.type}</span>
      </div>
    </Button>
  )
}

function DataSharingToggle({
  workspaceId,
  currentValue,
}: {
  workspaceId: Id<"workspaces">
  currentValue: boolean
}) {
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [value, setValue] = React.useState(currentValue)
  
  const setShareDataToParent = useMutation(api.workspace.hierarchy.setShareDataToParent)

  React.useEffect(() => {
    setValue(currentValue)
  }, [currentValue])

  const handleChange = async (checked: boolean) => {
    try {
      setIsUpdating(true)
      setValue(checked)
      await setShareDataToParent({ workspaceId, shareDataToParent: checked })
      toast.success(checked ? "Data sharing enabled" : "Data sharing disabled")
    } catch (error) {
      setValue(currentValue) // Revert on error
      toast.error("Failed to update data sharing preference")
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label htmlFor="share-data">Share data with parent</Label>
        <p className="text-sm text-muted-foreground">
          Allow the parent workspace to access aggregated data from this workspace in reports and AI context.
        </p>
      </div>
      <Switch
        id="share-data"
        checked={value}
        onCheckedChange={handleChange}
        disabled={isUpdating}
      />
    </div>
  )
}
