"use client"

import React, { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
  Shield,
  Download,
  Package,
  Mail,
  Info,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useSystemFeatureMutations, useBundleCategoryMutations } from "../../hooks/usePlatformAdmin"

/**
 * SettingsContent — Platform configuration panel
 * Shows admin email info, system metadata, and system actions.
 */
export function SettingsContent() {
  const debugInfo = useQuery(api.features.custom.admin.getPlatformAdminDebugInfo)
  const { seedFeatures } = useSystemFeatureMutations()
  const { seedBundles } = useBundleCategoryMutations()

  const [seedingFeatures, setSeedingFeatures] = useState(false)
  const [seedingBundles, setSeedingBundles] = useState(false)

  const handleSeedFeatures = async () => {
    setSeedingFeatures(true)
    try {
      const result = await seedFeatures()
      toast.success(`Synced features: ${result.created} created, ${result.skipped} skipped`)
    } catch {
      toast.error("Failed to sync features from catalog")
    } finally {
      setSeedingFeatures(false)
    }
  }

  const handleSeedBundles = async () => {
    setSeedingBundles(true)
    try {
      await seedBundles()
      toast.success("Default bundles seeded successfully")
    } catch {
      toast.error("Failed to seed bundles")
    } finally {
      setSeedingBundles(false)
    }
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold">Platform Settings</h2>
          <p className="text-sm text-muted-foreground">
            System configuration and maintenance options
          </p>
        </div>

        {/* Platform Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Platform Info
            </CardTitle>
            <CardDescription>Read-only system metadata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Platform</span>
              <Badge variant="outline">SuperSpace</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Admin Console</span>
              <Badge variant="outline">v1.0.0</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Stack</span>
              <span className="text-xs text-muted-foreground">Next.js 15 · Convex · Clerk</span>
            </div>
          </CardContent>
        </Card>

        {/* Admin Emails */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Platform Administrators
            </CardTitle>
            <CardDescription>
              Admins are configured via the{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">PLATFORM_ADMIN_EMAILS</code>{" "}
              environment variable in the Convex dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {debugInfo === undefined ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">
                    {debugInfo.adminEmails.length} admin{debugInfo.adminEmails.length !== 1 ? "s" : ""} configured
                  </span>
                </div>
                {debugInfo.adminEmails.length === 0 ? (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    <span className="text-xs text-yellow-600">
                      No admin emails configured. Set <code>PLATFORM_ADMIN_EMAILS</code> in Convex environment variables.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {debugInfo.adminEmails.map((email, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border"
                      >
                        <Shield className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm font-mono">{email}</span>
                        <Badge variant="outline" className="ml-auto text-xs bg-red-500/10 text-red-500 border-red-500/20">
                          Platform Admin
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* System Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              System Actions
            </CardTitle>
            <CardDescription>
              Maintenance operations for the platform catalog
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Sync Features */}
            <div className="flex items-start justify-between gap-4 p-3 rounded-lg border">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Sync Features from Catalog</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Sync all feature configs from <code className="bg-muted px-1 rounded">frontend/slices/*/config.ts</code> into the database Menu Store.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSeedFeatures}
                disabled={seedingFeatures}
                className="flex-shrink-0"
              >
                {seedingFeatures ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {seedingFeatures ? "Syncing…" : "Sync"}
              </Button>
            </div>

            {/* Seed Bundles */}
            <div className="flex items-start justify-between gap-4 p-3 rounded-lg border">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Seed Default Bundles</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Populate the bundle catalog with default bundle templates (productivity, business, personal, etc.).
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSeedBundles}
                disabled={seedingBundles}
                className="flex-shrink-0"
              >
                {seedingBundles ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Package className="h-4 w-4 mr-2" />
                )}
                {seedingBundles ? "Seeding…" : "Seed"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              SuperSpace is a modular SaaS platform built with Next.js 15, Convex, and Clerk.
              Features are auto-discovered from <code className="bg-muted text-foreground px-1 py-0.5 rounded text-xs">frontend/slices/*/config.ts</code>.
            </p>
            <p>
              Platform admins have full access to all workspaces and features. RBAC is enforced
              on all workspace-level operations.
            </p>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}
