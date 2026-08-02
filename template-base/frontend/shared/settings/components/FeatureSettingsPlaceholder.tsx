"use client"

/**
 * Feature Settings Placeholder
 *
 * Reusable placeholder component for features that don't have settings yet.
 * Shows users where settings will appear when implemented.
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export interface FeatureSettingsPlaceholderProps {
  /** Display name of the feature */
  featureName: string
  /** Optional description of what settings will include */
  description?: string
}

export function FeatureSettingsPlaceholder({
  featureName,
  description,
}: FeatureSettingsPlaceholderProps) {
  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>{featureName} Settings</CardTitle>
          <CardDescription>
            {description || "Configuration options will appear here soon."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We're working on exposing detailed configuration for {featureName}.
            Installed features without dedicated controls show this preview so
            teams know where settings will live.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
