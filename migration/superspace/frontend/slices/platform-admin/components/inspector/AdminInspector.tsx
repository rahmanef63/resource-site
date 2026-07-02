"use client"

import React from "react"
import {
  Shield,
  Store,
  Package,
  Building2,
  Users,
  Mail,
  Edit2,
  Trash2,
  Copy,
  MoreHorizontal,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  Settings,
  Box,
  Bug,
  Calendar,
  Tag,
  X,
  BarChart3,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getIconComponent } from "@/frontend/shared/ui/icons"
import type {
  ErrorReport,
  ErrorReportStatus,
  ErrorReportSeverity,
  FeatureStatus,
} from "../../types"
import type { AdminSection } from "../navigation/AdminNavigation"

// Reusable Status Badge
function StatusBadge({ status }: { status: FeatureStatus }) {
  const statusConfig: Record<FeatureStatus, { icon: React.ElementType; class: string; label: string }> = {
    stable: { icon: CheckCircle2, class: "bg-green-500/10 text-green-500 border-green-500/20", label: "Stable" },
    beta: { icon: AlertTriangle, class: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", label: "Beta" },
    development: { icon: Settings, class: "bg-blue-500/10 text-blue-500 border-blue-500/20", label: "Development" },
    experimental: { icon: Zap, class: "bg-purple-500/10 text-purple-500 border-purple-500/20", label: "Experimental" },
    deprecated: { icon: XCircle, class: "bg-gray-500/10 text-gray-500 border-gray-500/20", label: "Deprecated" },
    disabled: { icon: XCircle, class: "bg-red-500/10 text-red-500 border-red-500/20", label: "Disabled" },
  }

  const config = statusConfig[status] || statusConfig.stable
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn("gap-1", config.class)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

// Feature Inspector
interface FeatureData {
  _id: string
  featureId: string
  name: string
  description?: string
  icon?: string
  version?: string
  category?: string
  status: FeatureStatus
  featureType?: string
  tags?: string[]
  isPublic?: boolean
  isEnabled?: boolean
  isReady?: boolean
  expectedRelease?: string
  createdAt?: number
  updatedAt?: number
}

interface FeatureInspectorProps {
  feature: FeatureData
  onEdit?: () => void
  onDelete?: () => void
  onTogglePublic?: () => void
  onToggleEnabled?: () => void
  onClose?: () => void
}

function FeatureInspector({
  feature,
  onEdit,
  onDelete,
  onTogglePublic,
  onToggleEnabled,
  onClose,
}: FeatureInspectorProps) {
  const IconComponent = feature.icon ? getIconComponent(feature.icon) : Box

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
              {IconComponent && <IconComponent className="h-5 w-5 text-primary" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">{feature.name}</h3>
              <p className="text-xs text-muted-foreground font-mono truncate">{feature.featureId}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-label="More options" variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Feature
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => {
                  navigator.clipboard.writeText(feature.featureId)
                }}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy ID
                </DropdownMenuItem>
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDelete} className="text-red-500">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {onClose && (
              <Button aria-label="Close" variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-6">
          {/* Description */}
          {feature.description && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Description</Label>
              <p className="text-sm">{feature.description}</p>
            </div>
          )}

          {/* Status & Type */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Status & Type</Label>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={feature.status} />
              {feature.featureType && (
                <Badge variant="outline" className="capitalize">{feature.featureType}</Badge>
              )}
              {feature.category && (
                <Badge variant="secondary" className="capitalize">{feature.category}</Badge>
              )}
            </div>
          </div>

          {/* Version */}
          {feature.version && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Version</Label>
              <Badge variant="outline" className="font-mono">{feature.version}</Badge>
            </div>
          )}

          <Separator />

          {/* Visibility Controls */}
          <div className="space-y-4">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Visibility</Label>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Menu Store</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">Show in Menu Store</p>
                </div>
                <Switch
                  checked={feature.isPublic}
                  onCheckedChange={onTogglePublic}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {feature.isEnabled ? (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Label className="text-sm font-medium">Enabled</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">Feature can be installed</p>
                </div>
                <Switch
                  checked={feature.isEnabled}
                  onCheckedChange={onToggleEnabled}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Ready</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">Production ready</p>
                </div>
                <Badge variant={feature.isReady ? "default" : "secondary"}>
                  {feature.isReady ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Tags */}
          {feature.tags && feature.tags.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Tags
                </Label>
                <div className="flex flex-wrap gap-1">
                  {feature.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Dates */}
          {(feature.createdAt || feature.expectedRelease) && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Timeline
                </Label>
                {feature.createdAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span>{new Date(feature.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
                {feature.updatedAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Updated</span>
                    <span>{new Date(feature.updatedAt).toLocaleDateString()}</span>
                  </div>
                )}
                {feature.expectedRelease && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Expected Release</span>
                    <span>{feature.expectedRelease}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="flex-shrink-0 px-4 py-3 border-t bg-muted/20">
        <Button variant="outline" className="w-full" onClick={onEdit}>
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Feature
        </Button>
      </div>
    </div>
  )
}

// User Inspector
interface UserData {
  _id: string
  name?: string
  email?: string
  imageUrl?: string
  role?: string
  createdAt?: number
  lastLoginAt?: number
}

interface UserInspectorProps {
  user: UserData
  onClose?: () => void
}

function UserInspector({ user, onClose }: UserInspectorProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">{user.name || "Unknown User"}</h3>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          {onClose && (
            <Button aria-label="Close" variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-4">
          {user.role && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Role</Label>
              <Badge variant="outline" className="capitalize">{user.role}</Badge>
            </div>
          )}
          {user.createdAt && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Joined</Label>
              <p className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          )}
          {user.lastLoginAt && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Last Login</Label>
              <p className="text-sm">{new Date(user.lastLoginAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

// Bundle Inspector
interface BundleData {
  _id: string
  bundleId: string
  name: string
  description?: string
  icon?: string
  primaryColor?: string
  category?: string
  recommendedFor?: string[]
  tags?: string[]
  featureCount?: number
}

interface BundleInspectorProps {
  bundle: BundleData
  onEdit?: () => void
  onDelete?: () => void
  onClose?: () => void
}

function BundleInspector({ bundle, onEdit, onDelete, onClose }: BundleInspectorProps) {
  const IconComponent = bundle.icon ? getIconComponent(bundle.icon) : Package

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="rounded-lg p-2 flex-shrink-0"
              style={{ backgroundColor: bundle.primaryColor ? `${bundle.primaryColor}20` : undefined }}
            >
              {IconComponent && (
                <IconComponent
                  className="h-5 w-5"
                  style={{ color: bundle.primaryColor }}
                />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">{bundle.name}</h3>
              <p className="text-xs text-muted-foreground font-mono truncate">{bundle.bundleId}</p>
            </div>
          </div>
          {onClose && (
            <Button aria-label="Close" variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-4">
          {bundle.description && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Description</Label>
              <p className="text-sm">{bundle.description}</p>
            </div>
          )}

          {bundle.category && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Category</Label>
              <Badge variant="secondary" className="capitalize">{bundle.category}</Badge>
            </div>
          )}

          {bundle.featureCount !== undefined && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Features</Label>
              <Badge variant="outline">{bundle.featureCount} features</Badge>
            </div>
          )}

          {bundle.recommendedFor && bundle.recommendedFor.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Recommended For</Label>
              <div className="flex flex-wrap gap-1">
                {bundle.recommendedFor.map((r) => (
                  <Badge key={r} variant="outline" className="text-xs capitalize">{r}</Badge>
                ))}
              </div>
            </div>
          )}

          {bundle.tags && bundle.tags.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Tags</Label>
              <div className="flex flex-wrap gap-1">
                {bundle.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      {onEdit && (
        <div className="flex-shrink-0 px-4 py-3 border-t bg-muted/20">
          <Button variant="outline" className="w-full" onClick={onEdit}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Bundle
          </Button>
        </div>
      )}
    </div>
  )
}

// Error Report Inspector
const REPORT_SEVERITY_BADGE: Record<ErrorReportSeverity, string> = {
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
}

const REPORT_STATUS_BADGE: Record<ErrorReportStatus, string> = {
  open: "bg-red-500/10 text-red-500 border-red-500/20",
  triaged: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  resolved: "bg-green-500/10 text-green-500 border-green-500/20",
  wontfix: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

function buildReportMarkdown(report: ErrorReport): string {
  const lines = [
    `# Error report: ${report.title}`,
    "",
    `- **Severity:** ${report.severity}`,
    `- **Status:** ${report.status}`,
    `- **Created:** ${new Date(report.createdAt).toISOString()}`,
    `- **Reporter:** ${report.reporterEmail ?? report.reporterUserId}`,
    report.workspaceName
      ? `- **Workspace:** ${report.workspaceName}`
      : `- **Workspace:** —`,
    report.featureId ? `- **Feature:** ${report.featureId}` : null,
    report.route ? `- **Route:** \`${report.route}\`` : null,
    report.endpoint ? `- **Endpoint:** \`${report.endpoint}\`` : null,
    report.appVersion ? `- **App version:** ${report.appVersion}` : null,
    report.viewport
      ? `- **Viewport:** ${report.viewport.w}×${report.viewport.h}`
      : null,
    report.userAgent ? `- **UA:** \`${report.userAgent}\`` : null,
    "",
    `## Error`,
    "",
    "```",
    `${report.errorName ?? "Error"}: ${report.errorMessage}`,
    "```",
  ]
  if (report.errorStack) {
    lines.push("", "## Stack", "", "```", report.errorStack, "```")
  }
  if (report.userNote) {
    lines.push("", "## User note", "", report.userNote)
  }
  if (report.resolutionNote) {
    lines.push("", "## Resolution note", "", report.resolutionNote)
  }
  if (report.screenshotUrl) {
    lines.push("", `## Screenshot`, "", report.screenshotUrl)
  }
  return lines.filter((l) => l !== null).join("\n")
}

interface ErrorReportInspectorProps {
  report: ErrorReport
  onChangeStatus?: (status: ErrorReportStatus) => void
  onClose?: () => void
}

function ErrorReportInspector({
  report,
  onChangeStatus,
  onClose,
}: ErrorReportInspectorProps) {
  const handleCopy = async () => {
    const markdown = buildReportMarkdown(report)
    try {
      await navigator.clipboard.writeText(markdown)
      toast.success("Copied. Paste in chat.")
    } catch {
      toast.error("Clipboard copy failed")
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="rounded-lg bg-red-500/10 p-2 flex-shrink-0">
              <Bug className="h-5 w-5 text-red-500" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">{report.title}</h3>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(report.createdAt, { addSuffix: true })}
              </p>
            </div>
          </div>
          {onClose && (
            <Button aria-label="Close" variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex gap-2 mt-3">
          <Badge variant="outline" className={cn(REPORT_SEVERITY_BADGE[report.severity])}>
            {report.severity}
          </Badge>
          <Badge variant="outline" className={cn(REPORT_STATUS_BADGE[report.status])}>
            {report.status}
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-4">
          <div className="space-y-1 text-xs">
            <Label className="text-xs text-muted-foreground">Reporter</Label>
            <p>{report.reporterEmail ?? "—"}</p>
          </div>

          {report.workspaceName && (
            <div className="space-y-1 text-xs">
              <Label className="text-xs text-muted-foreground">Workspace</Label>
              <p>{report.workspaceName}</p>
            </div>
          )}

          {report.route && (
            <div className="space-y-1 text-xs">
              <Label className="text-xs text-muted-foreground">Route</Label>
              <p className="font-mono break-all">{report.route}</p>
            </div>
          )}

          {report.endpoint && (
            <div className="space-y-1 text-xs">
              <Label className="text-xs text-muted-foreground">Endpoint</Label>
              <p className="font-mono break-all">{report.endpoint}</p>
            </div>
          )}

          {report.featureId && (
            <div className="space-y-1 text-xs">
              <Label className="text-xs text-muted-foreground">Feature</Label>
              <p className="font-mono">{report.featureId}</p>
            </div>
          )}

          <Separator />

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Error</Label>
            <pre className="text-xs rounded-md border bg-muted/50 p-2 whitespace-pre-wrap break-words">
              {(report.errorName ? `${report.errorName}: ` : "") + report.errorMessage}
            </pre>
          </div>

          {report.errorStack && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Stack</Label>
              <pre className="text-[10px] rounded-md border bg-muted/50 p-2 whitespace-pre-wrap break-words max-h-72 overflow-auto">
                {report.errorStack}
              </pre>
            </div>
          )}

          {report.userNote && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">User note</Label>
              <p className="text-sm whitespace-pre-wrap">{report.userNote}</p>
            </div>
          )}

          {report.screenshotUrl && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Screenshot</Label>
              <a
                href={report.screenshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={report.screenshotUrl}
                  alt="Reported screenshot"
                  className="max-h-64 w-auto rounded-md border"
                />
              </a>
            </div>
          )}

          {(report.userAgent || report.appVersion || report.viewport) && (
            <>
              <Separator />
              <div className="space-y-1 text-xs text-muted-foreground">
                {report.appVersion && <p>app version: {report.appVersion}</p>}
                {report.viewport && (
                  <p>
                    viewport: {report.viewport.w}×{report.viewport.h}
                  </p>
                )}
                {report.userAgent && (
                  <p className="break-all">UA: {report.userAgent}</p>
                )}
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      <div className="flex-shrink-0 border-t bg-muted/20 p-3 space-y-2">
        <Button onClick={handleCopy} className="w-full" size="sm">
          <Copy className="mr-2 h-4 w-4" />
          Copy report (markdown)
        </Button>
        {onChangeStatus && (
          <div className="flex flex-wrap gap-2">
            {report.status !== "triaged" && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onChangeStatus("triaged")}
              >
                Mark triaged
              </Button>
            )}
            {report.status !== "resolved" && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onChangeStatus("resolved")}
              >
                Resolved
              </Button>
            )}
            {report.status !== "wontfix" && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onChangeStatus("wontfix")}
              >
                Won&apos;t fix
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Empty State
interface EmptyInspectorProps {
  section: AdminSection
}

function EmptyInspector({ section }: EmptyInspectorProps) {
  const sectionConfig: Record<AdminSection, { icon: React.ElementType; title: string; description: string }> = {
    "system-features": {
      icon: Store,
      title: "Select an Item",
      description: "Click a feature, bundle, or custom build to view details",
    },
    "workspaces": {
      icon: Building2,
      title: "Workspace Manager",
      description: "Use the workspace panel to manage workspaces",
    },
    "users": {
      icon: Users,
      title: "Select a User",
      description: "Click on a user to view profile",
    },
    "invitations": {
      icon: Mail,
      title: "Select an Invitation",
      description: "Click on an invitation to view details",
    },
    "error-reports": {
      icon: Bug,
      title: "Select an Error Report",
      description: "Click a row to inspect, copy markdown, or change status",
    },
    "analytics": {
      icon: BarChart3,
      title: "Analytics",
      description: "View platform analytics",
    },
    "changelog": {
      icon: Sparkles,
      title: "What's New",
      description: "Release changelog & feature versions",
    },
    "settings": {
      icon: Settings,
      title: "Settings",
      description: "Configure platform settings",
    },
  }

  const config = sectionConfig[section]
  const Icon = config.icon

  return (
    <div className="flex flex-col h-full items-center justify-center p-6 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium">{config.title}</h3>
      <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
    </div>
  )
}

// Main Inspector Component
export interface AdminInspectorProps {
  section: AdminSection
  selectedItem?: any
  onEdit?: () => void
  onDelete?: () => void
  onTogglePublic?: () => void
  onToggleEnabled?: () => void
  onChangeStatus?: (status: ErrorReportStatus) => void
  onClose?: () => void
}

export function AdminInspector({
  section,
  selectedItem,
  onEdit,
  onDelete,
  onTogglePublic,
  onToggleEnabled,
  onChangeStatus,
  onClose,
}: AdminInspectorProps) {
  if (!selectedItem) {
    return <EmptyInspector section={section} />
  }

  switch (section) {
    case "system-features":
      // Duck-type routing: bundles have bundleId, features have featureId
      if (selectedItem.bundleId) {
        return (
          <BundleInspector
            bundle={selectedItem}
            onEdit={onEdit}
            onDelete={onDelete}
            onClose={onClose}
          />
        )
      }
      return (
        <FeatureInspector
          feature={selectedItem}
          onEdit={onEdit}
          onDelete={onDelete}
          onTogglePublic={onTogglePublic}
          onToggleEnabled={onToggleEnabled}
          onClose={onClose}
        />
      )
    case "users":
      return (
        <UserInspector
          user={selectedItem}
          onClose={onClose}
        />
      )
    case "error-reports":
      return (
        <ErrorReportInspector
          report={selectedItem as ErrorReport}
          onChangeStatus={onChangeStatus}
          onClose={onClose}
        />
      )
    default:
      return <EmptyInspector section={section} />
  }
}

export {
  FeatureInspector,
  UserInspector,
  BundleInspector,
  ErrorReportInspector,
  EmptyInspector,
  StatusBadge,
}
